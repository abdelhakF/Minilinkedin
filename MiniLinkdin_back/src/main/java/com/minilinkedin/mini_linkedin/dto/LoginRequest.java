package com.minilinkedin.mini_linkedin.dto; // BON

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour les requêtes de connexion.
 * Contient uniquement les informations nécessaires à l'authentification.
 */
@Data
@NoArgsConstructor
public class LoginRequest {

    /**
     * L'adresse e-mail de l'utilisateur.
     */
    private String email;

    /**
     * Le mot de passe de l'utilisateur.
     */
    private String password;
}
