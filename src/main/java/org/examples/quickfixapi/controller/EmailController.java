package org.examples.quickfixapi.controller;

import lombok.RequiredArgsConstructor;
import org.examples.quickfixapi.service.EmailService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class EmailController {

    private final EmailService emailService;

    @GetMapping("/send-test-email")
    public String sendTestEmail(@RequestParam String to,
                                @RequestParam(required = false, defaultValue = "yashodagunawardhana15@gmail.com") String subject,
                                @RequestParam(required = false, defaultValue = "This is a test email sent from your QuickFix-API application.") String body) {
        try {
            emailService.sendEmail(to, subject, body);
            return "Test email sent successfully to " + to;
        } catch (Exception e) {
            return "Failed to send email: " + e.getMessage();
        }
    }
}
