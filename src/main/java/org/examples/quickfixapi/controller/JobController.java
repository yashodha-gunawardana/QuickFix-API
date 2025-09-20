package org.examples.quickfixapi.controller;

import lombok.RequiredArgsConstructor;
import org.examples.quickfixapi.dto.JobPostDTO;
import org.examples.quickfixapi.dto.JobResponseDTO;
import org.examples.quickfixapi.respository.JobRepository;
import org.examples.quickfixapi.respository.UserRepository;
import org.examples.quickfixapi.service.JobService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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


    // Get all jobs for the authenticated customer (paginated)
    @GetMapping("/my-jobs")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Page<JobResponseDTO>> getMyJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "created_at_desc") String sort) {
        Page<JobResponseDTO> jobPage = jobService.getMyJobs(page, size, sort);
        return new ResponseEntity<>(jobPage, HttpStatus.OK);
    }


    // Get a single job by ID
    @GetMapping("/view/{jobId}")
    public ResponseEntity<JobResponseDTO> getJobById(@PathVariable Long jobId) {
        JobResponseDTO job = jobService.getJobById(jobId);
        return new ResponseEntity<>(job, HttpStatus.OK);
    }


    // Update a job
    @PutMapping("/update/{jobId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<JobResponseDTO> updateJob(@PathVariable Long jobId, @RequestBody JobPostDTO jobPostDTO) {
        JobResponseDTO response = jobService.updateJob(jobId, jobPostDTO);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }


    // Delete a job
    @DeleteMapping("/delete/{jobId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Void> deleteJob(@PathVariable Long jobId) {
        jobService.deleteJob(jobId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

}