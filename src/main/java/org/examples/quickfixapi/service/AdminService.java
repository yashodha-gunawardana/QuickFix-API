package org.examples.quickfixapi.service;

import lombok.RequiredArgsConstructor;
import org.examples.quickfixapi.dto.JobResponseDTO;
import org.examples.quickfixapi.dto.ProviderRequestDTO;
import org.examples.quickfixapi.dto.UserDTO;
import org.examples.quickfixapi.entity.*;
import org.examples.quickfixapi.respository.JobRepository;
import org.examples.quickfixapi.respository.ProviderRequestRepository;
import org.examples.quickfixapi.respository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final ProviderRequestRepository providerRequestRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final JobRepository jobRepository;


    // fetch all pending provider requests
    public List<ProviderRequestDTO> getPendingRequests() {
        return providerRequestRepository.findByStatus("PENDING")
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }


    // provider requests accepted by admin
    public String approveRequest(Long requestId) {
        ProviderRequest providerRequest = providerRequestRepository.findById(requestId).orElse(null);
        if (providerRequest == null)
            return "Request not found";

        User user = providerRequest.getUser();
        if (user == null)
            return "User not found";

        user.setRole(Role.PROVIDER);
        userRepository.save(user);

        providerRequest.setStatus("APPROVED");
        providerRequestRepository.save(providerRequest);

        // customer notification
        notificationService.createNotification(
                user.getId(),
                "Congratulations! Your request to become a provider has been approved",
                NotificationType.PROVIDER_APPROVED,
                true // send email
        );

        return "Request approved";
    }


    // provider requests rejected by admin
    public String rejectRequest(Long requestId) {
        ProviderRequest providerRequest = providerRequestRepository.findById(requestId).orElse(null);
        if (providerRequest == null)
            return "Request not found";

        // User user = userRepository.findById(providerRequest.getUserId()).orElse(null);
        User user = providerRequest.getUser();
        if (user == null) return "User not found";

        providerRequest.setStatus("REJECTED");
        providerRequestRepository.save(providerRequest);

        // customer notification
        notificationService.createNotification(
                user.getId(),
                "Sorry, your request to become a provider has been rejected.",
                NotificationType.PROVIDER_REJECTED,
                true // send email
        );

        return "Request rejected";
    }


    // get all users in admin dashboard
    public Page<UserDTO> getAllUsers(int page, int size, String filter, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<User> usersPage;

        // Handle search
        if (search != null && !search.isEmpty()) {
            usersPage = userRepository
                    .findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(search, search, pageable);
        } else {
            usersPage = userRepository.findAll(pageable);
        }


        // Map to DTO while keeping pagination
        List<UserDTO> dtoList = usersPage.getContent().stream()
                .filter(user -> {
                    if (filter == null || "all".equalsIgnoreCase(filter)) return true;

                    switch (filter.toLowerCase()) {
                        case "customers": return Role.CUSTOMER.equals(user.getRole());
                        case "providers": return Role.PROVIDER.equals(user.getRole());
                        case "admins": return Role.SUPER_ADMIN.equals(user.getRole());
                        case "active": return user.isEnabled();
                        case "suspended": return !user.isEnabled();
                        case "pending": return providerRequestRepository.existsByUserIdAndStatus(user.getId(), "PENDING");
                        default: return true;
                    }
                })
                .map(user -> {
                    String requestedRole = providerRequestRepository.findByUserIdAndStatus(user.getId(), "PENDING")
                            .map(ProviderRequest::getRequestedRole)
                            .orElse(null);

                    int postedJobCount = jobRepository.countByUserId(user.getId());
                    int acceptedJobCount = jobRepository.countByProviderId(user.getId());
                    LocalDate createdAt = user.getCreatedAt() != null
                            ? user.getCreatedAt().atZone(ZoneId.systemDefault()).toLocalDate()
                            : LocalDate.now();

                    String status = user.isEnabled() ? "ACTIVE" : "SUSPENDED";

                    return new UserDTO(
                            user.getId(),
                            user.getUsername(),
                            user.getEmail(),
                            user.getRole().name(),
                            status,
                            user.isEnabled(),
                            createdAt,
                            requestedRole,
                            postedJobCount,
                            acceptedJobCount
                    );
                }).collect(Collectors.toList());

        return new org.springframework.data.domain.PageImpl<>(dtoList, pageable, usersPage.getTotalElements());
    }


    // get all jobs in the admin dashboard
    public Page<JobResponseDTO> getAllJobs(int page, int size, String filter) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<Job> jobs;

        if ("all".equalsIgnoreCase(filter)) {
            jobs = jobRepository.findAll(pageable);
        } else {
            jobs = jobRepository.findByStatus(JobStatus.valueOf(filter.toUpperCase()), pageable);
        }

        return jobs.map(job -> JobResponseDTO.builder()
                .id(job.getId())
                .title(job.getTitle())
                .category(job.getCategory())
                .description(job.getDescription())
                .budget(job.getBudget() != null ?
                        java.math.BigDecimal.valueOf(job.getBudget()) : null)
                .location(job.getLocation())
                .preferredDate(job.getPreferredDate())
                .preferredTime(job.getPreferredTime())
                .status(job.getStatus().name())
                .createdAt(job.getCreatedAt() != null ?
                        job.getCreatedAt().atZone(ZoneId.systemDefault()).toInstant() : null)
                .userId(job.getUser() != null ? job.getUser().getId() : null)
                .customerEmail(job.getCustomerEmail())
                .datePosted(job.getDatePosted())
                .build());
    }


    // covert providerRequest entity to DTO
    private ProviderRequestDTO convertToDTO(ProviderRequest request) {
        User user = request.getUser();
        String userName = user != null ? user.getUsername() : "Unknown User";
        String currentRole = user != null ? user.getRole().toString() : "Unknown Role";

        return new ProviderRequestDTO(
                request.getId(),
                user != null ? user.getId() : null,
                userName,
                currentRole,
                request.getStatus(),
                request.getRequestDate(),
                request.getRequestedRole()
        );
    }





}
