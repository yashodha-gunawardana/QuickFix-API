package org.examples.quickfixapi.service;

import lombok.RequiredArgsConstructor;
import org.examples.quickfixapi.dto.ProviderRequestDTO;
import org.examples.quickfixapi.entity.NotificationType;
import org.examples.quickfixapi.entity.ProviderRequest;
import org.examples.quickfixapi.entity.Role;
import org.examples.quickfixapi.entity.User;
import org.examples.quickfixapi.respository.JobRepository;
import org.examples.quickfixapi.respository.ProviderRequestRepository;
import org.examples.quickfixapi.respository.UserRepository;
import org.springframework.stereotype.Service;

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
                .map(this::converToDTO)
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


}
