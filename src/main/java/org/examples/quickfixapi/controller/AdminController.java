package org.examples.quickfixapi.controller;

import lombok.RequiredArgsConstructor;
import org.examples.quickfixapi.dto.ProviderRequestDTO;
import org.examples.quickfixapi.dto.UserDTO;
import org.examples.quickfixapi.entity.Role;
import org.examples.quickfixapi.entity.User;
import org.examples.quickfixapi.respository.JobRepository;
import org.examples.quickfixapi.respository.ProviderRequestRepository;
import org.examples.quickfixapi.respository.UserRepository;
import org.examples.quickfixapi.service.AdminService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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


    // update a user's role, status, and username by id
    @PutMapping("/users/{id}")
    public ResponseEntity<Void> updateUser(@PathVariable Long id, @RequestBody Map<String, String> updates) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));

        if (updates.containsKey("role")) {
            user.setRole(Role.valueOf(updates.get("role").toUpperCase()));
        }
        if (updates.containsKey("status")) {
            // Map status string to enabled boolean
            String status = updates.get("status").toUpperCase();
            if ("ACTIVE".equals(status)) {
                user.setEnabled(true);
            } else {
                user.setEnabled(false); // Suspended or other
            }
        }
        if (updates.containsKey("username")) {
            user.setUsername(updates.get("username"));
        }
        userRepository.save(user);
        return ResponseEntity.ok().build();
    }


    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            userRepository.delete(user);
            return ResponseEntity.noContent().build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }


}
