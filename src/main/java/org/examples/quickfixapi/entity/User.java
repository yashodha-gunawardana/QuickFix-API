package org.examples.quickfixapi.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "users")
public class User {

    private Long id;
    private String username;
    private String email;
    private String password;
    private Role role;

    private boolean enabled = true;

}
