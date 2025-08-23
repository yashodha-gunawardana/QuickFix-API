package org.examples.quickfixapi.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.examples.quickfixapi.dto.ApiResponse;
import org.examples.quickfixapi.dto.RegisterDTO;
import org.examples.quickfixapi.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody RegisterDTO registerDTO) {
//        authService.register(registerDTO);
        return ResponseEntity.ok(new ApiResponse(200, "User register successfully..!", authService.register(registerDTO)));
    }


}
