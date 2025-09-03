package org.examples.quickfixapi.controller;

import org.examples.quickfixapi.service.CustomerService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping("/request-provider")
    public Map<String, String> requestProvider(@RequestBody Map<String, Long> body) {
        Long userId = body.get("userId");
        String message = customerService.requestProvider(userId);
        return Map.of("message", message);
    }

}



