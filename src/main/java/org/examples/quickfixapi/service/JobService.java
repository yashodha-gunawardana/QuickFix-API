package org.examples.quickfixapi.service;

import lombok.RequiredArgsConstructor;
import org.examples.quickfixapi.dto.JobPostDTO;
import org.examples.quickfixapi.dto.JobResponseDTO;
import org.examples.quickfixapi.entity.Job;
import org.examples.quickfixapi.entity.JobStatus;
import org.examples.quickfixapi.entity.Role;
import org.examples.quickfixapi.entity.User;
import org.examples.quickfixapi.respository.JobRepository;
import org.examples.quickfixapi.respository.NotificationRepository;
import org.examples.quickfixapi.respository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

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


    private JobResponseDTO mapToJobResponseDTO(Job savedJob) {
    }


}