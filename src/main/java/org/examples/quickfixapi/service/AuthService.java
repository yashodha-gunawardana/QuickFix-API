package org.examples.quickfixapi.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.examples.quickfixapi.dto.AuthDTO;
import org.examples.quickfixapi.dto.JwtResponse;
import org.examples.quickfixapi.dto.RegisterDTO;
import org.examples.quickfixapi.dto.ResetPasswordDTO;
import org.examples.quickfixapi.entity.Role;
import org.examples.quickfixapi.entity.User;
import org.examples.quickfixapi.exception.UserAlreadyExistsException;
import org.examples.quickfixapi.respository.UserRepository;
import org.examples.quickfixapi.util.JwtUtil;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final JavaMailSender mailSender;


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
                .role(Role.CUSTOMER)
              //  .roles(Set.of(roleEntity))
                .enabled(true)
                .build();
        userRepository.save(user);

        sendRegistrationEmail(user.getEmail(), user.getUsername());
        
        return "User registered successfully";
    }

    private void sendRegistrationEmail(String email, String username) {
        MimeMessage message = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(email);
            helper.setSubject("Welcome to QuickFix API!");
            helper.setText(
                    "<h2>Welcome, " + username + "!</h2>" +
                            "<p>Your account has been successfully created.</p>" +
                            "<p>Login to start posting or accepting jobs: <a href='http://localhost:8080/login.html'>Login</a></p>",
                    true
            );
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send registration email", e);
        }
    }

    public JwtResponse login(AuthDTO authDTO) {
        // Authenticate user with email and password
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(authDTO.getEmail().trim(), authDTO.getPassword()));
        // Fetch user from DB
        User user = userRepository.findByEmail(authDTO.getEmail().trim()).orElseThrow(() -> new RuntimeException("User not found"));
        // Generate JWT token (subject = email)
       // String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        String token = jwtUtil.generateToken(user);
        return new JwtResponse(token, user.getRole().name(), user.getUsername(), user.getEmail(), user.getId());

    }

    public String resetPassword(ResetPasswordDTO resetPasswordDTO) {
        // find user by email
        User user = userRepository.findByEmail(resetPasswordDTO.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // check if token exists and matches passwordEncoder
       /* if (user.getResetPasswordToken() == null || !passwordEncoder.matches(resetPasswordDTO.getToken(), user.getResetPasswordToken())) {
            throw new RuntimeException("Invalid or expired reset token");
        }

        // check if token has expired
        if (user.getResetPasswordTokenExpiry() == null || user.getResetPasswordTokenExpiry().isBefore(Instant.now())) {
            throw new RuntimeException("Reset token has expired");
        }*/
        if (!resetPasswordDTO.getToken().equals(user.getResetPasswordToken())) {
            throw new RuntimeException("Invalid reset token");
        }
        if (user.getResetPasswordTokenExpiry() == null || user.getResetPasswordTokenExpiry().isBefore(Instant.now())) {
            throw new RuntimeException("Reset token has expired");
        }

        user.setPassword(passwordEncoder.encode(resetPasswordDTO.getNewPassword()));
        user.setEnabled(true); // enable the account
        // clear token and expiry
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);

        userRepository.save(user);

        // Send password reset confirmation email
        sendPasswordResetConfirmationEmail(user.getEmail(), user.getUsername());

        return "Password reset successfully";
    }


    private void sendPasswordResetConfirmationEmail(String email, String username) {
        MimeMessage message = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(email);
            helper.setSubject("Password Reset Successful");
            helper.setText(
                    "<h2>Password Reset Successful</h2>" +
                            "<p>Your password has been reset successfully.</p>" +
                            "<p>You can now <a href='http://localhost:8080/login.html'>login</a> with your new password.</p>",
                    true
            );
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send password reset confirmation email", e);
        }
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }


    public String initiatePasswordReset(String email) {
        User user = userRepository.findByEmail(email.trim())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = UUID.randomUUID().toString();
        // hash the token
        user.setResetPasswordToken(token);
        user.setResetPasswordTokenExpiry(Instant.now().plusSeconds(3600)); // 1 hour expiry
        userRepository.save(user);

        // Send password reset email
        sendPasswordResetEmail(user.getEmail(), token);

        return "Password reset link sent to your email";
    }

    private void sendPasswordResetEmail(String email, String token) {
        MimeMessage message = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(email);
            helper.setSubject("Password Reset Request");
            helper.setText(
                    "<h2>Reset Your Password</h2>" +
                            "<p>Click the link below to reset your password:</p>" +
                            "<p><a href='http://localhost:8080/resetPassword.html?token=" + token + "'>Reset Password</a></p>" +
                            "<p>This link will expire in 1 hour.</p>",
                    true
            );
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }

}
