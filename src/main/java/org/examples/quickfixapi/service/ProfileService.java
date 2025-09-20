package org.examples.quickfixapi.service;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.examples.quickfixapi.dto.CustomerProfileDTO;
import org.examples.quickfixapi.entity.CustomerProfile;
import org.examples.quickfixapi.entity.ProviderProfile;
import org.examples.quickfixapi.entity.User;
import org.examples.quickfixapi.respository.CustomerProfileRepository;
import org.examples.quickfixapi.respository.ProviderProfileRepository;
import org.examples.quickfixapi.respository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;


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


    // save customer profile
    public CustomerProfile updateCustomerProfile(Long userId, CustomerProfileDTO customerProfileDTO, MultipartFile imageFile) throws IOException {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        CustomerProfile customerProfile = customerProfileRepository.findByUserId(userId).orElse(CustomerProfile.builder().user(user).build());


        customerProfile.setFirstName(customerProfileDTO.getFirstName());
        customerProfile.setLastName(customerProfileDTO.getLastName());
        customerProfile.setPhoneNo(customerProfileDTO.getPhoneNo());
        customerProfile.setAddress(customerProfileDTO.getAddress());
        customerProfile.setBio(customerProfileDTO.getBio());

        // handle image upload
        if (imageFile != null && !imageFile.isEmpty()) {
            String fileName = userId + "_" + imageFile.getOriginalFilename();
            Files.copy(imageFile.getInputStream(), rootLocation.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);

            user.setProfileImage(fileName); // save in user
            customerProfile.setProfileImage(fileName); // save in customer profile
            userRepository.save(user);
        }
        return customerProfileRepository.save(customerProfile);
    }


    // retrieve or create provider profile
    public ProviderProfile getProviderProfile(Long userId) {
        return providerProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
                    ProviderProfile profile = ProviderProfile.builder()
                            .user(user)
                            .firstName("")
                            .lastName("")
                            .phoneNo("")
                            .address("")
                            .experienceYears(0)
                            .hourlyRate(0.0)
                            .serviceOffered("")
                            .bio("")
                            .build();
                    return providerProfileRepository.save(profile); // Persist default profile
                });
    }




}
