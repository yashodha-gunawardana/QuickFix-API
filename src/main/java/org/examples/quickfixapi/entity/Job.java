package org.examples.quickfixapi.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "jobs")
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String category;  // e.g., "plumbing"

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    private Double budget;  // Optional, as per form (min=1)

    @Column(nullable = false)
    private String location;

    private LocalDate preferredDate;  // Optional

    private String preferredTime;  // e.g., "morning" or "Any time"

    @Enumerated(EnumType.STRING)
    private JobStatus status = JobStatus.PENDING;  // Enum: PENDING, ACCEPTED, COMPLETED

    @ManyToOne  // Assuming a Customer entity exists
    @JoinColumn(name = "user_id", nullable = false)
    private User user;  // Link to the posting customer

    @Column(name = "customer_email", nullable = false)
    private String customerEmail;

    @Column(name = "date_posted", nullable = false)
    private LocalDate datePosted;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "provider_id")
    private Long providerId;


    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (datePosted == null) {
            datePosted = LocalDate.now();
        }
    }

}

