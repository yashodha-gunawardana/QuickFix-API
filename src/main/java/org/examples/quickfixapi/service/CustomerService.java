package org.examples.quickfixapi.service;

import org.examples.quickfixapi.entity.ProviderRequest;
import org.examples.quickfixapi.respository.ProviderRequestRepository;
import org.examples.quickfixapi.respository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class CustomerService {

    private final ProviderRequestRepository providerRequestRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public CustomerService(ProviderRequestRepository providerRequestRepository, UserRepository userRepository, NotificationService notificationService) {
        this.providerRequestRepository = providerRequestRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;

    }

    public String requestProvider(Long userId) {
        if(providerRequestRepository.existsByUserIdAndStatus(userId, "PENDING")) {
            return "You already have a pending request";
        }

        ProviderRequest providerRequest = new ProviderRequest();
        providerRequest.setUserId(userId);
        providerRequest.setStatus("PENDING");
        providerRequestRepository.save(providerRequest);

        notificationService.notifyAdminsAboutProviderRequest(userId);

        return "Request sent successfully";
    }

}
