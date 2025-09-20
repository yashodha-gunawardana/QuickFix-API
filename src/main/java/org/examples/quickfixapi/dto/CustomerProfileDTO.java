package org.examples.quickfixapi.dto;


import lombok.*;

@Data
public class CustomerProfileDTO {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNo;
    private String address;
    private String profileImage;
    private String bio;

}