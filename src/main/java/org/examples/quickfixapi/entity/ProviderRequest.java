package org.examples.quickfixapi.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class ProviderRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;
    private String status; // PENDING, APPROVED, REJECTED
    private LocalDateTime requestDate = LocalDateTime.now();
    private String requestedRole = "SERVICE_PROVIDER";

}