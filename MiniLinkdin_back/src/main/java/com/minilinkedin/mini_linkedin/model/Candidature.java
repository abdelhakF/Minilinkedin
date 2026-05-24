package com.minilinkedin.mini_linkedin.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
public class Candidature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "etudiant_id")
    private Etudiant etudiant;

    @ManyToOne
    @JoinColumn(name = "post_id")
    @JsonIgnore
    private Post post;

    private LocalDate dateDepot;

    private String messageMotivation;

    // Statut : EN_ATTENTE, ACCEPTEE, REFUSEE
    @Column(nullable = false)
    private String statut = "EN_ATTENTE";

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "notification_id")
    @JsonIgnore
    private Notification notification;

    @PrePersist
    protected void onCreate() {
        this.dateDepot = LocalDate.now();
        if (this.statut == null) {
            this.statut = "EN_ATTENTE";
        }
    }
}