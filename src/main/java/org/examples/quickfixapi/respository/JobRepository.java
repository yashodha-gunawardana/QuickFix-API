package org.examples.quickfixapi.respository;

import org.examples.quickfixapi.entity.Job;
import org.examples.quickfixapi.entity.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Map;


@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    Optional<Job> findById(Long jobId);
    Page<Job> findByCustomerEmail(String customerEmail, Pageable pageable);
    // use pending for available jobs
    Page<Job> findByStatusAndProviderIdIsNull(JobStatus status, Pageable pageable);
    Page<Job> findByProviderId(Long providerId, Pageable pageable);
    // use pending for category filter
    Page<Job> findByStatusAndProviderIdIsNullAndCategory(JobStatus jobStatus, String upperCase, Pageable pageable);
    Page<Job> findByStatus(JobStatus status, Pageable pageable);
    int countByProviderIdAndStatus(Long userId, JobStatus status);
    int countByProviderId(Long providerId);
    int countByUserId(Long userId);
    // for counting rejected jobs
    int countByStatus(JobStatus status);


}