package com.minilinkedin.mini_linkedin.model;

import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@PrimaryKeyJoinColumn(name = "id")
public class Enseignant extends Utilisateur {

    private String specialite;
    private String diplome;
    private Boolean estValide;
}