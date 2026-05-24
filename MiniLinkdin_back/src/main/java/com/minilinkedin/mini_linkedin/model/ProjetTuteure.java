package com.minilinkedin.mini_linkedin.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@DiscriminatorValue("PROJET_TUTORE")
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ProjetTuteure extends Post {

    private String module;
    private String promotion;
}