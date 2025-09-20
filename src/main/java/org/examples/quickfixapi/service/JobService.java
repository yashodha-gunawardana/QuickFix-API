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

    private JobResponseDTO mapToJobResponseDTO(Job savedJob) {
    }


}