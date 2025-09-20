package org.examples.quickfixapi.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.examples.quickfixapi.entity.User;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ProviderRequestDTO {

    private Long requestId;
    private Long userId;
    private String username;
    //private User user;
    private String currentRole;
    private String status;
    private LocalDateTime requestDate;
    private String requestedRole;
}