package org.examples.quickfixapi.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;


@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProviderProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

   /* @Column(nullable = false, unique = true)
    private String email;*/

    private String phoneNo;
    private String address;
    private Integer experienceYears;
    private Double hourlyRate;

   /* @ElementCollection(fetch = FetchType.EAGER)
    @Column(name = "service")
    private List<String> serviceOffered;*/
    private String serviceOffered;

    private String profileImage;
    private String bio;


    @OneToOne
    @JoinColumn(name = "userId", referencedColumnName = "id", nullable = false)
    private User user;
}
