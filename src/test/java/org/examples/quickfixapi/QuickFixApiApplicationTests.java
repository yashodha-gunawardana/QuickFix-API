package org.examples.quickfixapi;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class QuickFixApiApplicationTests {

    @Test
    void contextLoads() {
    }

    @Test
    void passwordHashMatches() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String rawPassword = "yashoda1234567890";

        // Example hash from DB
        String dbHash = "$2a$10$wk8c3LP.YROM7nSGkYS.j./H7cy/ne/xDfCMwtVK9KJDs4iY91Gq2";

        // Assertion
        assertTrue(encoder.matches(rawPassword, dbHash),
                "Password should match with DB hash");
    }
}
