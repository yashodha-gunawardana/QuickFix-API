package org.examples.quickfixapi.service;

import lombok.RequiredArgsConstructor;
import org.examples.quickfixapi.entity.ProviderRequest;
import org.examples.quickfixapi.entity.User;
import org.examples.quickfixapi.respository.ProviderRequestRepository;
import org.examples.quickfixapi.respository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final ProviderRequestRepository providerRequestRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;


    public String requestProvider(Long userId) {
        if(providerRequestRepository.existsByUserIdAndStatus(userId, "PENDING")) {
            return "You already have a pending request";
        }

        User user = userRepository.findById(userId).orElse(null);
        if(user == null) {
            return "User not found";
        }

        ProviderRequest providerRequest = new ProviderRequest();
       // providerRequest.setUserId(userId);
        providerRequest.setUser(user);
        providerRequest.setStatus("PENDING");
        providerRequest.setRequestDate(LocalDateTime.now());
        providerRequest.setRequestedRole("PROVIDER");
        providerRequestRepository.save(providerRequest);

        notificationService.notifyAdminsAboutProviderRequest(userId);

        return "Request sent successfully";
    }

}
