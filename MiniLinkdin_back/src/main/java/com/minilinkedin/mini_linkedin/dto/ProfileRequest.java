package com.minilinkedin.mini_linkedin.dto;

import com.minilinkedin.mini_linkedin.model.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Collection;
import java.util.List;

/**
 * DTO pour les requêtes de création/mise à jour de profil.
 * Accepte les données du Profile ainsi que les champs spécifiques aux sous-types d'utilisateurs.
 */
@Data
@NoArgsConstructor
public class ProfileRequest {

    // Champs du Profile
    private String summary;
    private String headline;
    private String photoUrl;
    private String institution;

    // Sections du Profile
    private List<Experience> experiences;
    private Collection<Education> educations;
    private Collection<Skill> skills;
    private Collection<Accomplishment> accomplishments;
    private Stats stats;

    // Champs spécifiques aux Étudiants
    private String niveauEtude;

    // Champs spécifiques aux Enseignants
    private String specialite;
}

