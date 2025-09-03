package org.examples.quickfixapi.service;

import org.examples.quickfixapi.respository.ProviderRequestRepository;
import org.examples.quickfixapi.respository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AdminService {

    private final ProviderRequestRepository providerRequestRepository;
    private final UserRepository userRepository;

    public AdminService(ProviderRequestRepository providerRequestRepository, UserRepository userRepository) {
        this.providerRequestRepository = providerRequestRepository;
        this.userRepository = userRepository;
    }


}
