package org.examples.quickfixapi.service;

import lombok.RequiredArgsConstructor;
import org.examples.quickfixapi.dto.AuthDTO;
import org.examples.quickfixapi.dto.JwtResponse;
import org.examples.quickfixapi.dto.RegisterDTO;
import org.examples.quickfixapi.entity.Role;
import org.examples.quickfixapi.entity.User;
import org.examples.quickfixapi.exception.UserAlreadyExistsException;
import org.examples.quickfixapi.respository.UserRepository;
import org.examples.quickfixapi.util.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public String register(RegisterDTO registerDTO) {
        if (userRepository.existsByEmail(registerDTO.getEmail())) {
            throw new RuntimeException("Email already in use");
        }
        if (userRepository.existsByUsername(registerDTO.getUsername())) {
            throw new UserAlreadyExistsException("Username already in use");
        }

        User user = User.builder()
                .username(registerDTO.getUsername())
                .email(registerDTO.getEmail())
                .password(passwordEncoder.encode(registerDTO.getPassword()))
               // .role(registerDTO.getRole())
                .roles(Set.of(Role.CUSTOMER)) // default role
                .enabled(true)
                .build();
        userRepository.save(user);
        return "User registered successfully";
    }

    public JwtResponse login(AuthDTO authDTO) {
        // Authenticate user with email and password
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(authDTO.getEmail().trim(), authDTO.getPassword()));
        // Fetch user from DB
        User user = userRepository.findByEmail(authDTO.getEmail().trim()).orElseThrow(() -> new RuntimeException("User not found"));
        // Generate JWT token (subject = email)
        String token = jwtUtil.generateToken(user.getEmail(), user.getRoles());
        return new JwtResponse(
                token,
                user.getRoles().stream().map(Role::name).toList(),
                user.getUsername(),
                user.getEmail(),
                user.getId()
        );
    }

    public String upgradeToProvider(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        user.getRoles().add(Role.PROVIDER);
        userRepository.save(user);

        return "User upgraded to provider successfully";
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }


}
