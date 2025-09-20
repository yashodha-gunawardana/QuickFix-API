package org.examples.quickfixapi.controller;

import lombok.RequiredArgsConstructor;
import org.examples.quickfixapi.dto.ProviderRequestDTO;
import org.examples.quickfixapi.dto.UserDTO;
import org.examples.quickfixapi.respository.JobRepository;
import org.examples.quickfixapi.respository.ProviderRequestRepository;
import org.examples.quickfixapi.respository.UserRepository;
import org.examples.quickfixapi.service.AdminService;
import org.springframework.data.domain.Page;
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


    // approve a provider requests by id
    @PostMapping("/approve-requests/{id}")
    public String approveRequests(@PathVariable Long id ) {
        return adminService.approveRequest(id);
    }


    // reject a provider requests by id
    @PostMapping("/reject-request/{id}")
    public String rejectRequest(@PathVariable Long id) {
        return adminService.rejectRequest(id);
    }


    @GetMapping("/all/users")
    public Page<UserDTO> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false, defaultValue = "all") String filter,
            @RequestParam(required = false) String search
    ) {
        return adminService.getAllUsers(page, size, filter, search);
    }



}
