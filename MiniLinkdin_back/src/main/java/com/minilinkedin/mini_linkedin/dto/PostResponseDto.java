// dto/PostResponseDto.java
package com.minilinkedin.mini_linkedin.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

// dto/PostResponseDto.java
// dto/PostResponseDto.java
@Data
public class PostResponseDto {
    // ... tous tes champs actuels (id, titre, description, imageUrl, etc.)
    private Long id;
    private String titre;
    private String description;
    private String imageUrl;
    private LocalDateTime datePublication;
    private LocalDate dateLimite;
    private String type;
    private Long auteurId;
    private String auteurNom;
    private String auteurEmail;
    private String auteurPhotoUrl;
    private int likeCount;
    private int commentCount;
    private int shareCount;
    private boolean likedByMe;

    // ========== CHAMPS SPÉCIFIQUES (à ajouter) ==========

    // OffreStage
    private String duree;
    private String lieu;
    private String remuneration;

    // DemandePost
    private String typeDemande;
    private String niveauEtude;
    private String domaine;
    private String dureeSouhaitee;
    private String localisationPreferee;

    // ProjetTuteure
    private String module;
    private String promotion;

    // SujetThese
    private String niveau;
    private String laboratoire;
    private String directeur;

    // PublicationPost (optionnel)
    private String mediaUrl;
    private String visibility;
}