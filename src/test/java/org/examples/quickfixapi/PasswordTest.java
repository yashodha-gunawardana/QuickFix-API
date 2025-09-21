package org.examples.quickfixapi;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordTest {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String rawPassword = "yash1234";
        String currentHash = "$2a$10$yp5N8xA3KsmPto70rkTd3umeCk3y7KV3rasPtD8eF65GzS82QDlaq";
        String oldHash = "$2a$10$LsVoIiiC7xcUxMJ/aQx1ce1uZdmvlNK9.nl6QaNtSjka2E1XuQvh6";
        System.out.println("Testing current DB hash: " + currentHash);
        System.out.println("Current hash matches: " + encoder.matches(rawPassword, currentHash));
        System.out.println("Testing old DB hash: " + oldHash);
        System.out.println("Old hash matches: " + encoder.matches(rawPassword, oldHash));
        System.out.println("New hash for yash1234: " + encoder.encode(rawPassword));
    }
}