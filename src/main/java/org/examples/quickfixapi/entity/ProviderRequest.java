package org.examples.quickfixapi.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class ProviderRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
   // private Long userId;
    @ManyToOne
    private User user;
    private String status; // PENDING, APPROVED, REJECTED
    private LocalDateTime requestDate = LocalDateTime.now();
    private String requestedRole = "SERVICE_PROVIDER";

}