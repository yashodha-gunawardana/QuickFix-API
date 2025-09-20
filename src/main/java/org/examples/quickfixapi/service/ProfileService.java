package org.examples.quickfixapi.service;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.examples.quickfixapi.dto.CustomerProfileDTO;
import org.examples.quickfixapi.dto.ProviderProfileDTO;
import org.examples.quickfixapi.entity.CustomerProfile;
import org.examples.quickfixapi.entity.ProviderProfile;
import org.examples.quickfixapi.entity.User;
import org.examples.quickfixapi.respository.CustomerProfileRepository;
import org.examples.quickfixapi.respository.ProviderProfileRepository;
import org.examples.quickfixapi.respository.UserRepository;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;


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


    // save provider profile
    public ProviderProfile updateProviderProfile(Long userId, ProviderProfileDTO providerProfileDTO, MultipartFile imageFile) throws IOException {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        ProviderProfile providerProfile = providerProfileRepository.findByUserId(userId).orElse(ProviderProfile.builder().user(user).build());


        providerProfile.setFirstName(providerProfileDTO.getFirstName());
        providerProfile.setLastName(providerProfileDTO.getLastName());
        providerProfile.setPhoneNo(providerProfileDTO.getPhoneNo());
        providerProfile.setAddress(providerProfileDTO.getAddress());
        providerProfile.setExperienceYears(providerProfileDTO.getExperienceYears());
        providerProfile.setHourlyRate(providerProfileDTO.getHourlyRate());
        providerProfile.setServiceOffered(String.join(",", providerProfileDTO.getServiceOffered()));
        providerProfile.setBio(providerProfileDTO.getBio());

        if (imageFile != null && !imageFile.isEmpty()) {
            String fileName = userId + "_" + imageFile.getOriginalFilename();
            Files.copy(imageFile.getInputStream(), rootLocation.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
            user.setProfileImage(fileName);
            userRepository.save(user);
        }
        return providerProfileRepository.save(providerProfile);
    }


    // Load image as Resource safely
    public Resource loadProfileImage(String filename) throws MalformedURLException {
        try {
            Path file = rootLocation.resolve(filename);
            if (!Files.exists(file) || Files.isDirectory(file)) {
                // return default placeholder image if file missing
                Path defaultFile = rootLocation.resolve("default-profile.png"); // make sure this exists in uploads/
                return new UrlResource(defaultFile.toUri());
            }
            return new UrlResource(file.toUri());
        } catch (MalformedURLException e) {
            throw new RuntimeException("Error loading image: " + filename, e);
        }
    }


    // Convert CustomerProfile entity to DTO
    public CustomerProfileDTO convertToDTO(CustomerProfile customerProfile) {
        CustomerProfileDTO customerProfileDTO = new CustomerProfileDTO();
        customerProfileDTO.setId(customerProfile.getId());
        customerProfileDTO.setFirstName(customerProfile.getFirstName());
        customerProfileDTO.setLastName(customerProfile.getLastName());

        if (customerProfile.getUser() != null) {
            customerProfileDTO.setEmail(customerProfile.getUser().getEmail());
        } else {
            customerProfileDTO.setEmail("");
        }
        customerProfileDTO.setPhoneNo(customerProfile.getPhoneNo());
        customerProfileDTO.setAddress(customerProfile.getAddress());
        customerProfileDTO.setBio(customerProfile.getBio());

        // Handle profile image
        // Only store the filename, not full path
        if (customerProfile.getProfileImage() != null && !customerProfile.getProfileImage().isEmpty()) {
            customerProfileDTO.setProfileImage(customerProfile.getProfileImage());
        } else {
            customerProfileDTO.setProfileImage("default-profile.png"); // fallback filename
        }

        return customerProfileDTO;
    }


    // convert providerProfile entity to DTO
    public ProviderProfileDTO convertProviderToDTO(ProviderProfile providerProfile) {
        ProviderProfileDTO providerProfileDTO = new ProviderProfileDTO();
        providerProfileDTO.setId(providerProfile.getId());
        providerProfileDTO.setFirstName(providerProfile.getFirstName());
        providerProfileDTO.setLastName(providerProfile.getLastName());
        providerProfileDTO.setPhoneNo(providerProfile.getPhoneNo());
        providerProfileDTO.setAddress(providerProfile.getAddress());
        providerProfileDTO.setExperienceYears(providerProfile.getExperienceYears());
        providerProfileDTO.setHourlyRate(providerProfile.getHourlyRate());
        // Convert serviceOffered string to list
        if (providerProfile.getServiceOffered() != null && !providerProfile.getServiceOffered().isEmpty()) {
            providerProfileDTO.setServiceOffered(Arrays.asList(providerProfile.getServiceOffered().split(",")));
        }
        providerProfileDTO.setBio(providerProfile.getBio());

        // Include email from the linked User
        if (providerProfile.getUser() != null) {
            providerProfileDTO.setEmail(providerProfile.getUser().getEmail());  // <-- add email here
            providerProfileDTO.setProfileImage(providerProfile.getUser().getProfileImage());
        } else {
            providerProfileDTO.setEmail("");
            providerProfileDTO.setProfileImage("default-profile.png");
        }

        return providerProfileDTO;
    }





}
