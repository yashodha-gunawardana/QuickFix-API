package org.examples.quickfixapi.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class JwtResponse {

    private String token;
    private List<String> roles;
    private String username; // display name
    private String email; // login email
    private Long userId;

}
