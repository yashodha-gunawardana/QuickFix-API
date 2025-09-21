package org.examples.quickfixapi.security;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String rawPassword = "yash1234";
        String encodedPassword = encoder.encode(rawPassword);
        System.out.println(encodedPassword);
    }

}