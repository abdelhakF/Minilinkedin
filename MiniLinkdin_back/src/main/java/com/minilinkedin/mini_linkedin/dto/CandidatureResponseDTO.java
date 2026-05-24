// mini-linkedin/src/main/java/com/minilinkedin/mini_linkedin/dto/CandidatureResponseDTO.java

package com.minilinkedin.mini_linkedin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CandidatureResponseDTO {

    private Long id;
    private String messageMotivation;
    private LocalDate dateDepot;

    // Statut : EN_ATTENTE, ACCEPTEE, REFUSEE
    private String statut;

    // Informations simplifiées du Post
    private Long postId;
    private String postTitre;
    private String postDescription;

    // Informations simplifiées de l'étudiant
    private Long etudiantId;
    private String etudiantNom;
    private String etudiantEmail;
}