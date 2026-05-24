// src/main/java/com/minilinkedin/mini_linkedin/model/DemandePost.java
package com.minilinkedin.mini_linkedin.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@DiscriminatorValue("DEMANDE")
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class DemandePost extends Post {

    private String typeDemande;           // STAGE, THESE, PROJET_TUTORE, AUTRE
    private String niveauEtude;
    private String domaine;
    private String dureeSouhaitee;
    private String localisationPreferee;

}