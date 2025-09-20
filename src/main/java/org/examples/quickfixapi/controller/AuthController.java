package org.examples.quickfixapi.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.examples.quickfixapi.dto.*;
import org.examples.quickfixapi.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody RegisterDTO registerDTO) {
        // Call the service to register the user
        String result = authService.register(registerDTO);
        // Return structured ApiResponse
        return ResponseEntity.ok(new ApiResponse(200, "User registered successfully..!", result));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@Valid @RequestBody AuthDTO authDTO) {
        // Call the service to login and get JWT
        JwtResponse jwtResponse = authService.login(authDTO);
        // Return structured ApiResponse
        return ResponseEntity.ok(new ApiResponse(200, "Login successful", jwtResponse));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse> forgotPassword(@RequestBody @Valid AuthDTO authDTO) {
        String result = authService.initiatePasswordReset(authDTO.getEmail());
        return ResponseEntity.ok(new ApiResponse(200, "Password reset initiated", result));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse> resetPassword(@RequestBody @Valid ResetPasswordDTO resetPasswordDTO) {
        String result = authService.resetPassword(resetPasswordDTO);
        return ResponseEntity.ok(new ApiResponse(200, "Password reset successful", result));
    }


}
