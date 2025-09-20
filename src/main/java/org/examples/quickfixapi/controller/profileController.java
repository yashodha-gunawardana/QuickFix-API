package org.examples.quickfixapi.controller;

import lombok.RequiredArgsConstructor;
import org.examples.quickfixapi.dto.ApiResponse;
import org.examples.quickfixapi.dto.CustomerProfileDTO;
import org.examples.quickfixapi.entity.CustomerProfile;
import org.examples.quickfixapi.service.ProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class profileController {

    private final ProfileService profileService;


    @GetMapping("/customer/{userId}")
    public ResponseEntity<ApiResponse> getCustomerProfile(@PathVariable Long userId) {
        try {
            CustomerProfile profile = profileService.getCustomerProfile(userId);
            CustomerProfileDTO customerProfileDTO = profileService.convertToDTO(profile);
            return ResponseEntity.ok(new ApiResponse(200, "Success", customerProfileDTO));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(500, "Error fetching profile: " + e.getMessage(), null));
        }
    }




}
