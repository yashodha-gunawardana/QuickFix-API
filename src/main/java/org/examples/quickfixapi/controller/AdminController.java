package org.examples.quickfixapi.controller;

import lombok.RequiredArgsConstructor;
import org.examples.quickfixapi.dto.ProviderRequestDTO;
import org.examples.quickfixapi.service.AdminService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/pending-requests")
    public List<ProviderRequestDTO> getPendingRequests() {
        return adminService.getPendingRequests();
    }

    @PostMapping("/approve-requests/{id}")
    public String approveRequests(@PathVariable Long id ) {
        return adminService.approveRequest(id);
    }

    @PostMapping("/reject-request/{id}")
    public String rejectRequest(@PathVariable Long id) {
        return adminService.rejectRequest(id);
    }

}
