package org.examples.quickfixapi.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;


@Data
@AllArgsConstructor
public class UserDTO {

    private Long id;
    private String userName;
    private String email;
    private String role;
    private String status; // active, suspended, pending
    private Boolean enabled;
    private LocalDate createdAt;
    private String requestedRole;
    private int postedJobCount;
    private int acceptedJobCount;


    private String firstName;      // from profile
    private String lastName;       // from profile
   // private String profileImage;  // image filename
}
