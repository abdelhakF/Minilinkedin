package com.minilinkedin.mini_linkedin.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@DiscriminatorValue("SUJET_THESE")
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class SujetThese extends Post {

    private String niveau;
    private String laboratoire;
    private String directeur;
}