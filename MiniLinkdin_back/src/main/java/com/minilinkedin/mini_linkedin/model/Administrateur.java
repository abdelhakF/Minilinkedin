package com.minilinkedin.mini_linkedin.model;

import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@PrimaryKeyJoinColumn(name = "id")
public class Administrateur extends Utilisateur {
    // Hérite de tous les attributs de l'utilisateur
}