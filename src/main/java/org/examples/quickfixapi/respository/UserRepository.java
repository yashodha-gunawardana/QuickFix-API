package org.examples.quickfixapi.respository;

import org.springframework.security.core.userdetails.UserDetails;

public interface UserRepository {

    UserDetails findByEmail(String email);
}
