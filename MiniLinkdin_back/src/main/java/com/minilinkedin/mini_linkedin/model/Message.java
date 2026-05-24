package com.minilinkedin.mini_linkedin.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;
import java.util.List;
import java.util.ArrayList;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Data
@NoArgsConstructor
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long sendTo; // ID du destinataire

    @Column(columnDefinition = "TEXT")
    private String messageBody;


    @Temporal(TemporalType.TIMESTAMP)
    @Column(nullable = false, updatable = false)
    private Date sentAt;

    // --- RELATIONS ---

    /**
     * L'expéditeur du message (0..* messages par utilisateur)
     */
    @ManyToOne
    @JoinColumn(name = "sender_id")
    private Utilisateur sender;

    /**
     * Un message peut générer plusieurs notifications (ex: push, email, in-app)
     */
    @OneToMany(mappedBy = "message", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Notification> notifications = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        sentAt = new Date();
    }
}
