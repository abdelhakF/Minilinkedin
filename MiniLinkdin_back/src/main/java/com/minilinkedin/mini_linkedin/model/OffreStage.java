package com.minilinkedin.mini_linkedin.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@DiscriminatorValue("OFFRE_STAGE")
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class OffreStage extends Post {


    private String duree;
    private String lieu;
    private String remuneration;
}