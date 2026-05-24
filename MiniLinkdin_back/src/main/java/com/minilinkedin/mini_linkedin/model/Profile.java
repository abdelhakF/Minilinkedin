/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.minilinkedin.mini_linkedin.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Collection;
import java.util.HashSet;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.ArrayList;
import java.util.List;

/**
 * Représente le profil d'un utilisateur (Module Profil - F05).
 * Contient les informations de base : biographie, headline, photo et institution.
 */
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Data
@NoArgsConstructor
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * summary (biographie / résumé du profil)
     */
    @Column(length = 2000)
    private String summary;

    /**
     * Titre professionnel / Headline
     */
    @Column(length = 500)
    private String headline;

    /**
     * URL de la photo de profil
     */
    @Column(length = 500)
    private String photoUrl;

    /**
     * Institution / Établissement (Université, École, Entreprise...)
     * F05 - Profil de base
     */
    @Column(length = 300)
    private String institution;

    // ====================== PARCOURS ======================

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "profile_id")
    private List<Experience> experiences = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "profile_id")
    private Collection<Education> educations = new HashSet<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "profile_id")
    private Collection<Skill> skills = new HashSet<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "profile_id")
    private Collection<Accomplishment> accomplishments = new HashSet<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "profile_id")
    @JsonIgnore
    private Collection<Recommendation> recommendations = new HashSet<>();

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "stats_id", referencedColumnName = "id")
    private Stats stats;
    
    @OneToOne
    @JoinColumn(name = "utilisateur_id")
    private Utilisateur utilisateur;
}