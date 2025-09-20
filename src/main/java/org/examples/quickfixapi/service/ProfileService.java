package org.examples.quickfixapi.service;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.examples.quickfixapi.entity.CustomerProfile;
import org.examples.quickfixapi.entity.User;
import org.examples.quickfixapi.respository.CustomerProfileRepository;
import org.examples.quickfixapi.respository.ProviderProfileRepository;
import org.examples.quickfixapi.respository.UserRepository;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;


@Service
@RequiredArgsConstructor
public class ProfileService {

    private final CustomerProfileRepository customerProfileRepository;
    private final ProviderProfileRepository providerProfileRepository;
    private  final UserRepository userRepository;

    // to store images
    private final Path rootLocation = Paths.get("uploads");


    // create folder if not exist
    @PostConstruct
    public void init() throws IOException {
        if (!Files.exists(rootLocation)) {
            Files.createDirectories(rootLocation);
        }
    }


    // retrieve or create customer profile
    public CustomerProfile getCustomerProfile(Long userId) {
        return customerProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
                    CustomerProfile profile = CustomerProfile.builder()
                            .user(user)
                            .firstName("")
                            .lastName("")
                            .phoneNo("")
                            .address("")
                            .bio("")
                            .build();
                    return customerProfileRepository.save(profile); // Save default profile
                });
    }





}
