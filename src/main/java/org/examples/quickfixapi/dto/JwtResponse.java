package org.examples.quickfixapi.dto;

import lombok.*;


@Data
@AllArgsConstructor
public class JwtResponse {

    private String token;
    private String role;
   // private List<String> roles;
    private String username; // display name
    private String email; // login email
    private Long userId;

}
