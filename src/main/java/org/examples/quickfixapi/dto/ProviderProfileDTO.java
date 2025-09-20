package org.examples.quickfixapi.dto;

import lombok.Data;

import java.util.List;

@Data
public class ProviderProfileDTO {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNo;
    private String address;
    private Integer experienceYears;
    private Double hourlyRate;
    private List<String> serviceOffered; // frontend selet
    private String profileImage;
    private String bio;
}