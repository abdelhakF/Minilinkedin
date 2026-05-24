package com.minilinkedin.mini_linkedin.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Data
@NoArgsConstructor
public class ConnectionInvitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Temporal(TemporalType.TIMESTAMP)
    private Date dateCreated;

    @Enumerated(EnumType.STRING)
    public ConnectionInvitationStatus status;

    public Long sentTo; // ID du destinataire

    // --- RELATION ---
    
    /**
     * L'utilisateur qui envoie l'invitation
     */
    @ManyToOne
    @JoinColumn(name = "sender_id")
    private Utilisateur sender;

    @PrePersist
    protected void onCreate() {
        this.dateCreated = new Date();
        if (this.status == null) {
            this.status = ConnectionInvitationStatus.PENDING;
        }
    }
}
