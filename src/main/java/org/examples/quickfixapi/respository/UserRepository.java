package org.examples.quickfixapi.respository;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.examples.quickfixapi.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(@NotBlank(message = "Email is required") @Email(message = "Invalid email format") String email);

    boolean existsByUsername(@NotBlank(message = "Username is required") String username);
}
