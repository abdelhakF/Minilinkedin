package com.minilinkedin.mini_linkedin.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonSubTypes;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Data
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "type", visible = true)
@JsonSubTypes({
        @JsonSubTypes.Type(value = Etudiant.class, name = "ETUDIANT"),
        @JsonSubTypes.Type(value = Enseignant.class, name = "ENSEIGNANT")
})
public class Utilisateur {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;

    @Embedded
    private Address address;

    private String email;
    private String phone;
    private String institution;
    private String photo;

    // ✅ Nouveau champ ajouté pour les statistiques
    private LocalDateTime dateInscription;

    @Enumerated(EnumType.STRING)
    private TypeRole roleEnum;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "account_id", referencedColumnName = "id")
    private Account account;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Comment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "sender", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Message> messagesEnvoyes = new ArrayList<>();

    @OneToMany(mappedBy = "auteur", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Post> posts = new ArrayList<>();

    @OneToOne
    @JoinColumn(name = "profile_id")
    @JsonIgnore
    private Profile profile;

    @PrePersist
    protected void onCreate() {
        if (this.dateInscription == null) {
            this.dateInscription = LocalDateTime.now();
        }
    }
}