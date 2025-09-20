package org.examples.quickfixapi.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.examples.quickfixapi.dto.JobPostDTO;
import org.examples.quickfixapi.dto.JobResponseDTO;
import org.examples.quickfixapi.entity.*;
import org.examples.quickfixapi.respository.JobRepository;
import org.examples.quickfixapi.respository.NotificationRepository;
import org.examples.quickfixapi.respository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final NotificationRepository notificationRepository;


    // customer post job
    public JobResponseDTO postJob(JobPostDTO jobPostDTO) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getRole().equals(Role.CUSTOMER)) {
            throw new RuntimeException("Only customers can post jobs");
        }

        Job job = new Job();
        job.setTitle(jobPostDTO.getTitle());
        job.setCategory(jobPostDTO.getCategory());
        job.setDescription(jobPostDTO.getDescription());
        job.setBudget(jobPostDTO.getBudget() != null ? jobPostDTO.getBudget().doubleValue() : null);
        job.setLocation(jobPostDTO.getLocation());
        job.setPreferredDate(jobPostDTO.getPreferredDate());
        job.setPreferredTime(jobPostDTO.getPreferredTime() != null ? jobPostDTO.getPreferredTime() : "Any time");
        job.setUser(user);
        job.setCustomerEmail(user.getEmail());
        job.setDatePosted(LocalDate.now());
        job.setStatus(JobStatus.PENDING);  // Ensure default status

        Job savedJob = jobRepository.save(job);

        return mapToJobResponseDTO(savedJob);
    }


    // Customer view all their posted jobs (paginated)
    public Page<JobResponseDTO> getMyJobs(int page, int size, String sort) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Sort sortOrder = parseSort(sort);
        Pageable pageable = PageRequest.of(page, size, sortOrder);
        Page<Job> jobPage = jobRepository.findByCustomerEmail(email, pageable);

        return jobPage.map(this::mapToJobResponseDTO);
    }


    // provider or super admin view available jobs (paginated)
    public List<JobResponseDTO> getAvailableJobs(int page, int size, String sort, String category) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        if(!(user.getRole().equals(Role.PROVIDER) || user.getRole().equals(Role.SUPER_ADMIN))) {
            throw new RuntimeException("Only providers or Super admins can view available jobs");
        }


        Sort sortOrder = parseSort(sort);
        Pageable pageable = PageRequest.of(page, size, sortOrder);

        Page<Job> jobPage;
        if (category != null) {
            jobPage = jobRepository.findByStatusAndProviderIdIsNullAndCategory(JobStatus.PENDING, category.toUpperCase(), pageable);
        } else {
            jobPage = jobRepository.findByStatusAndProviderIdIsNull(JobStatus.PENDING, pageable);
        }
        return jobPage.getContent().stream()
                .map(this::mapToJobResponseDTO)
                .collect(Collectors.toList());
    }


    // provider's work
    public Page<JobResponseDTO> getMyWork(int page, int size, String sort) {
        // Get the authenticated user's email
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));


        if(!user.getRole().equals(Role.PROVIDER)) {
            throw new RuntimeException("Only providers can view their work");
        }

        // Convert the frontend sort string into a Spring Sort object
        Sort sortOrder = parseSort(sort);
        Pageable pageable = PageRequest.of(page, size, sortOrder);
        // Fetch the jobs assigned to this provider
        Page<Job> jobPage = jobRepository.findByProviderId(user.getId(), pageable);

        // Convert Job entities to JobResponseDTO and return
        return jobPage.map(this::mapToJobResponseDTO);
    }


    public List<JobResponseDTO> getAllJobs(int page, int size, String sort, String filter) {
        Sort sortOrder = parseSort(sort);
        Pageable pageable = PageRequest.of(page, size, sortOrder);
        Page<Job> jobPage;

        // If a filter is provided and is not "all", filter jobs by status
        if (filter != null && !filter.equals("all")) {
            JobStatus status = JobStatus.valueOf(filter.toUpperCase());
            jobPage = jobRepository.findByStatus(status, pageable);
        } else {
            jobPage = jobRepository.findAll(pageable);
        }
        return jobPage.getContent().stream()
                .map(this::mapToJobResponseDTO)
                .collect(Collectors.toList());
    }


    // provider accept a job
    @Transactional
    public JobResponseDTO acceptJob(Long jobId) {
        User user = userRepository.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // check job
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        if (!job.getStatus().equals(JobStatus.PENDING)) throw new IllegalStateException("Only PENDING jobs can be accepted");
        if (job.getProviderId() != null) throw new IllegalStateException("Job is already assigned");

        job.setStatus(JobStatus.ACCEPTED);
        job.setProviderId(user.getId());
        Job savedJob = jobRepository.save(job);

        // notify and email
        notificationService.createNotification(
                job.getUser().getId(),
                "Your job '" + job.getTitle() + "' has been accepted by a provider.",
                NotificationType.JOB_ACCEPTED
        );

        emailService.sendEmail(job.getUser().getEmail(), "Your job has been accepted",
                "Hello, your job '" + job.getTitle() + "' was accepted by " + user.getEmail());

        return mapToJobResponseDTO(savedJob);
    }


    // provider starts job (set to in-progress)
    @Transactional
    public JobResponseDTO startJob(Long jobId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        if (!Role.PROVIDER.equals(user.getRole())) {
            throw new RuntimeException("Only providers can start jobs");
        }

        Job job = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getProviderId().equals(user.getId())) {
            throw new RuntimeException("You can only start jobs assigned to you");
        }

        if (!JobStatus.ACCEPTED.equals(job.getStatus())) {
            throw new RuntimeException("Only ACCEPTED jobs can be started");
        }

        job.setStatus(JobStatus.IN_PROGRESS);
        Job savedJob = jobRepository.save(job);

        notificationService.createNotification(
                job.getUser().getId(),
                "Your job '" + job.getTitle() +"' has started.",
                NotificationType.SYSTEM
        );

        return mapToJobResponseDTO(savedJob);
    }


    // provider completes job (set to completed)
    @Transactional
    public JobResponseDTO completedJob(Long jobId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        if (!Role.PROVIDER.equals(user.getRole())) {
            throw new RuntimeException("Only providers can complete jobs");
        }

        Job job = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getProviderId().equals(user.getId())) {
            throw new RuntimeException("You can only complete jobs assigned to you");
        }

        if (!JobStatus.IN_PROGRESS.equals(job.getStatus())) {
            throw new RuntimeException("Only IN_PROGRESS jobs can be completed");
        }

        job.setStatus(JobStatus.COMPLETED);
        Job savedJob = jobRepository.save(job);

        notificationService.createNotification(
                job.getUser().getId(),
                "Your job '" + job.getTitle() + "' has been completed by the provider.",
                NotificationType.JOB_COMPLETED
        );

        // notify provider
        notificationService.createNotification(
                user.getId(),
                "You have marked job '" + job.getTitle() + "' as completed.",
                NotificationType.JOB_COMPLETED
        );
        return mapToJobResponseDTO(savedJob);
    }


    private Sort parseSort(String sort) {
        if (sort == null || sort.isEmpty()) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }
        String[] parts = sort.split(",");
        String property = parts[0];

        // Map frontend sort parameter to entity property
        if ("created_at".equals(property)) {
            property = "createdAt";
        }

        Sort.Direction direction = parts.length > 1 && parts[1].equalsIgnoreCase("asc")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        return Sort.by(direction, property);
    }


    // Map Job to JobResponseDTO
    private JobResponseDTO mapToJobResponseDTO(Job job) {
        return JobResponseDTO.builder()
                .id(job.getId())
                .title(job.getTitle())
                .category(job.getCategory())
                .description(job.getDescription())
                .budget(job.getBudget() != null ? BigDecimal.valueOf(job.getBudget()) : null)
                .location(job.getLocation())
                .preferredDate(job.getPreferredDate())
                .preferredTime(job.getPreferredTime())
                .status(job.getStatus().name())
                .createdAt(job.getCreatedAt() != null
                        ? job.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toInstant()
                        : java.time.Instant.now()) // fallback if null

                .userId(job.getUser().getId())
                .customerEmail(job.getCustomerEmail())
                .datePosted(job.getDatePosted())
                .build();
    }


}