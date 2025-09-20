package org.examples.quickfixapi.controller;

import lombok.RequiredArgsConstructor;
import org.examples.quickfixapi.service.CustomerService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
public class
CustomerController {

    private final CustomerService customerService;


    @PostMapping("/request-provider")
    public Map<String, String> requestProvider(@RequestBody Map<String, Long> body) {
        Long userId = body.get("userId");
        String message = customerService.requestProvider(userId);
        return Map.of("message", message);
    }

}



