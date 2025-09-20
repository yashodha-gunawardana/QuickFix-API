package org.examples.quickfixapi.controller;

import lombok.RequiredArgsConstructor;
import org.examples.quickfixapi.dto.JobPostDTO;
import org.examples.quickfixapi.dto.JobResponseDTO;
import org.examples.quickfixapi.respository.JobRepository;
import org.examples.quickfixapi.respository.UserRepository;
import org.examples.quickfixapi.service.JobService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;

    // Post a new job
    @PostMapping("/post-job")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<JobResponseDTO> postJob(@RequestBody JobPostDTO jobPostDTO) {
        JobResponseDTO response = jobService.postJob(jobPostDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}