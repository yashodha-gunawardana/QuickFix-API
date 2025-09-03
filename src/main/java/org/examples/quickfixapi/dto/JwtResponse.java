package org.examples.quickfixapi.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
public class JwtResponse {

    private String token;
    private String role;
    private String username; // display name
    private String email; // login email
    private Long userId;

}
