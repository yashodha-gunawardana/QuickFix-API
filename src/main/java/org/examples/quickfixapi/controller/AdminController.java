package org.examples.quickfixapi.controller;

import lombok.RequiredArgsConstructor;
import org.examples.quickfixapi.entity.ProviderRequest;
import org.examples.quickfixapi.service.AdminService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/pending-requests")
    public List<ProviderRequest> getPendingRequests() {
        return adminService.getPendingRequests();
    }
}
