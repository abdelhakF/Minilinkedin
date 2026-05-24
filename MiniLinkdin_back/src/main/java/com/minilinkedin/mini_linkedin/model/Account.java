package com.minilinkedin.mini_linkedin.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Data
@NoArgsConstructor
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // ID technique pour la base de données

    private String accountId; // Ton code spécifique

    private String password;

    // ---> LE CHAMP MANQUANT À AJOUTER EST ICI : <---
    private String resetPasswordToken; 

    @Enumerated(EnumType.STRING)
    private AccountStatus status;

    // Lien inverse vers l'utilisateur
    @OneToOne(mappedBy = "account")
    @JsonIgnore
    private Utilisateur utilisateur;
}