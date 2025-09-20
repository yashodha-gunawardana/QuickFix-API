package org.examples.quickfixapi.controller;

import lombok.RequiredArgsConstructor;
import org.examples.quickfixapi.dto.ProviderRequestDTO;
import org.examples.quickfixapi.respository.JobRepository;
import org.examples.quickfixapi.respository.ProviderRequestRepository;
import org.examples.quickfixapi.respository.UserRepository;
import org.examples.quickfixapi.service.AdminService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final UserRepository userRepository;
    private final ProviderRequestRepository providerRequestRepository;
    private final JobRepository jobRepository;


    // all pending requests
    @GetMapping("/pending-requests")
    public List<ProviderRequestDTO> getPendingRequests() {
        return adminService.getPendingRequests();
    }


    @PostMapping("/approve-requests/{id}")
    public String approveRequests(@PathVariable Long id ) {
        return adminService.approveRequest(id);
    }




}
