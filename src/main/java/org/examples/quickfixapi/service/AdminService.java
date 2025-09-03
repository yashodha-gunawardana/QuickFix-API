package org.examples.quickfixapi.service;

import org.examples.quickfixapi.entity.ProviderRequest;
import org.examples.quickfixapi.entity.Role;
import org.examples.quickfixapi.entity.User;
import org.examples.quickfixapi.respository.ProviderRequestRepository;
import org.examples.quickfixapi.respository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    private final ProviderRequestRepository providerRequestRepository;
    private final UserRepository userRepository;

    public AdminService(ProviderRequestRepository providerRequestRepository, UserRepository userRepository) {
        this.providerRequestRepository = providerRequestRepository;
        this.userRepository = userRepository;
    }

    public List<ProviderRequest> getPendingRequests() {
        return providerRequestRepository.findAll()
                .stream()
                .filter(r -> r.getStatus().equals("PENDING"))
                .toList();
    }

    public String approveRequest(Long requestId) {
        ProviderRequest providerRequest = providerRequestRepository.findById(requestId).orElse(null);
        if (providerRequest == null)
            return "Request not found";

        User user = userRepository.findById(providerRequest.getUserId()).orElse(null);
        if (user == null)
            return "User not found";

        user.setRole(Role.SERVICE_PROVIDER);
        userRepository.save(user);

        providerRequest.setStatus("APPROVED");
        providerRequestRepository.save(providerRequest);

        return "Request approved successfully";
    }
}
