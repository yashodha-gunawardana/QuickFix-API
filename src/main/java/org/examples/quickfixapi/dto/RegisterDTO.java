package org.examples.quickfixapi.dto;

import lombok.*;
import org.examples.quickfixapi.entity.Role;

@Getter
@Setter
@Data
public class RegisterDTO {

    private String username;
    private String email;
    private String password;
    private Role role;


}
