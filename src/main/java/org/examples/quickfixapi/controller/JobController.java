package org.examples.quickfixapi.controller;

import lombok.RequiredArgsConstructor;
import org.examples.quickfixapi.dto.JobPostDTO;
import org.examples.quickfixapi.dto.JobResponseDTO;
import org.examples.quickfixapi.entity.Job;
import org.examples.quickfixapi.entity.JobStatus;
import org.examples.quickfixapi.respository.JobRepository;
import org.examples.quickfixapi.respository.UserRepository;
import org.examples.quickfixapi.service.JobService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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


    @GetMapping("/available-jobs")
    @PreAuthorize("hasAnyRole('PROVIDER', 'SUPER_ADMIN')")
    public ResponseEntity<List<JobResponseDTO>> getAvailableJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "created_at,desc") String sort,
            @RequestParam(required = false) String category){
        return new ResponseEntity<>(jobService.getAvailableJobs(page, size, sort, category), HttpStatus.OK);
    }


    @PostMapping("/accept/{jobId}")
    @PreAuthorize("hasAnyRole('PROVIDER', 'SUPER_ADMIN')")
    public ResponseEntity<JobResponseDTO> acceptJob(@PathVariable Long jobId) {
       /* String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!user.getRole().equals(Role.PROVIDER)) {
            throw new RuntimeException("Only providers can accept jobs");
        }*/
        JobResponseDTO response = jobService.acceptJob(jobId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }


    @PostMapping("/start/{jobId}")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<JobResponseDTO> startJob(@PathVariable Long jobId) {
        JobResponseDTO response = jobService.startJob(jobId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }


    @PostMapping("/complete/{jobId}")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<JobResponseDTO> completeJob(@PathVariable Long jobId) {
        JobResponseDTO response = jobService.completedJob(jobId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }


    // get accepted jobs by providers
    @GetMapping("/my-work")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<Page<JobResponseDTO>> getMyWork(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "created_at,desc") String sort) {
        return new ResponseEntity<>(jobService.getMyWork(page, size, sort), HttpStatus.OK);
    }


    // get all jobs in the admin dashboard
    @GetMapping("/all")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<JobResponseDTO>> getAllJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "created_at,desc") String sort,
            @RequestParam(required = false) String filter) {
        return new ResponseEntity<>(jobService.getAllJobs(page, size, sort, filter), HttpStatus.OK);
    }


    @PostMapping("/reject/{jobId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> rejectJob(@PathVariable Long jobId) {
        Job job = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));
        if (!job.getStatus().equals(JobStatus.PENDING)) {
            throw new IllegalStateException("Only PENDING jobs can be rejected");
        }
        jobRepository.delete(job);
        return ResponseEntity.ok().build();
    }



}