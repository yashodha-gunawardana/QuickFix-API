package org.examples.quickfixapi.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
public class JobResponseDTO {

    private Long id;
    private String title;
    private String category;
    private String description;
    private BigDecimal budget;
    private String location;
    private LocalDate preferredDate;
    private String preferredTime;
    private String status;
    private Instant createdAt;
    private Long userId;
    private String customerEmail;
    private LocalDate datePosted;

}
