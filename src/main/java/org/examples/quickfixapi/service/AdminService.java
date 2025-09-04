package org.examples.quickfixapi.service;

import org.examples.quickfixapi.dto.ProviderRequestDTO;
import org.examples.quickfixapi.entity.ProviderRequest;
import org.examples.quickfixapi.entity.Role;
import org.examples.quickfixapi.entity.User;
import org.examples.quickfixapi.respository.ProviderRequestRepository;
import org.examples.quickfixapi.respository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final ProviderRequestRepository providerRequestRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public AdminService(ProviderRequestRepository providerRequestRepository, UserRepository userRepository, NotificationService notificationService) {
        this.providerRequestRepository = providerRequestRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public List<ProviderRequestDTO> getPendingRequests() {
        return providerRequestRepository.findAll()
                .stream()
                .filter(r -> "PENDING".equals(r.getStatus()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public String approveRequest(Long requestId) {
        ProviderRequest providerRequest = providerRequestRepository.findById(requestId).orElse(null);
        if (providerRequest == null)
            return "Request not found";

        User user = userRepository.findById(providerRequest.getUserId()).orElse(null);
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
                "SYSTEM"
        );

        return "Request approved";
    }

    public String rejectRequest(Long requestId) {
        ProviderRequest providerRequest = providerRequestRepository.findById(requestId).orElse(null);
        if (providerRequest == null)
            return "Request not found";

        User user = userRepository.findById(providerRequest.getUserId()).orElse(null);
        if (user == null) return "User not found";

        providerRequest.setStatus("REJECTED");
        providerRequestRepository.save(providerRequest);

        // customer notification
        notificationService.createNotification(
                user.getId(),
                "Sorry, your request to become a provider has been rejected.",
                "SYSTEM"
        );

        return "Request rejected";
    }

    private ProviderRequestDTO convertToDTO(ProviderRequest request) {
        User user = userRepository.findById(request.getUserId()).orElse(null);
        String userName = user != null ? user.getUsername() : "Unknown User";
        String currentRole = user != null ? user.getRole().toString() : "Unknown Role";


        return new ProviderRequestDTO(
                request.getId(),
                request.getUserId(),
                userName,
                currentRole,
                request.getStatus(),
                request.getRequestDate(),
                request.getRequestedRole()
        );
    }
}
