// mini-linkedin/src/main/java/com/minilinkedin/mini_linkedin/model/Post.java

package com.minilinkedin.mini_linkedin.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Data
@NoArgsConstructor
@AllArgsConstructor
public abstract class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titre;

    // Pour PostgreSQL, on utilise le type "TEXT"
    @Column(columnDefinition = "TEXT")
    private String description;

    // 📸 IMAGE DU POST (Stockage du Base64)
    // Pour Postgres, "TEXT" est plus simple et efficace que @Lob pour les chaînes de caractères
    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    private LocalDateTime datePublication;
    private LocalDate dateLimite;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_post", nullable = false)
    private PostType type;

    @Transient
    private Boolean likedByMe;

    @ManyToOne
    @JoinColumn(name = "auteur_id")
    private Utilisateur auteur;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("post")
    private List<Candidature> candidatures = new ArrayList<>();

    private int likeCount = 0;
    private int commentCount = 0;
    private int shareCount = 0;

    //ajouter par Zak
    @OneToMany(mappedBy = "post", cascade = CascadeType.REMOVE, orphanRemoval = true)
    @JsonIgnore   // ← AJOUTER CETTE ANNOTATION
    private List<PostLike> likes = new ArrayList<>();

    @OneToMany(mappedBy = "post", cascade = CascadeType.REMOVE, orphanRemoval = true)
    @JsonIgnore
    private List<Comment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "post", cascade = CascadeType.REMOVE, orphanRemoval = true)
    @JsonIgnore
    private List<PostShare> shares = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.datePublication = LocalDateTime.now(); // au lieu de LocalDate.now()

        // ✅ IMPORTANT : définir le type automatiquement
        if (this instanceof OffreStage) {
            this.type = PostType.OFFRE_STAGE;
        } else if (this instanceof SujetThese) {
            this.type = PostType.SUJET_THESE;
        } else if (this instanceof ProjetTuteure) {
            this.type = PostType.PROJET_TUTORE;
        } else if (this instanceof DemandePost) {
            this.type = PostType.DEMANDE;
        } else if (this instanceof PublicationPost) {
            this.type = PostType.PUBLICATION;
        }
    }



}