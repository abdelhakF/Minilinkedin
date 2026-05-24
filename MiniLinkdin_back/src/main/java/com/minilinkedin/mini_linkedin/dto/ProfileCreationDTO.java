package com.minilinkedin.mini_linkedin.dto;

import com.minilinkedin.mini_linkedin.model.Profile;
import lombok.Data;

@Data
public class ProfileCreationDTO {
    private Profile profile;       // Contiendra toutes les infos du profil
    private String niveauEtude;    // Contiendra "Master 2"
    private Integer etudiantId;    // L'ID de l'étudiant à qui appartient ce profil
}