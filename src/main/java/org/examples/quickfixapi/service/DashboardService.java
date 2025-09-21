package org.examples.quickfixapi.service;

import lombok.RequiredArgsConstructor;
import org.examples.quickfixapi.dto.DashboardStatus;
import org.examples.quickfixapi.entity.JobStatus;
import org.examples.quickfixapi.entity.Role;
import org.examples.quickfixapi.respository.JobRepository;
import org.examples.quickfixapi.respository.UserRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;

    public DashboardStatus getDashboardStats() {
        DashboardStatus stats = new DashboardStatus();
        stats.setTotalUsers(userRepository.count());
        stats.setActiveJobs(jobRepository.countByStatus(JobStatus.ACCEPTED));
        stats.setProviderRequests(userRepository.countByRole(Role.PROVIDER));
        stats.setRejectedJobs(jobRepository.countByStatus(JobStatus.REJECTED));
        return stats;
    }
}
