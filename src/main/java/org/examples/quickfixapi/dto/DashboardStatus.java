package org.examples.quickfixapi.dto;

import lombok.Data;

@Data
public class DashboardStatus {

    private Long totalUsers;
    private int activeJobs;
    private Long providerRequests;
    private int rejectedJobs;
}
