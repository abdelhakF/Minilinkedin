package com.minilinkedin.mini_linkedin.model;

import jakarta.persistence.Embeddable;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
public class Address {

    private String streetAddress;
    private String city;
    private String state;
    private String zipcode;
    private String country;
}