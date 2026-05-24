package com.minilinkedin.mini_linkedin.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
public class Signalement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String motif;

    @Enumerated(EnumType.STRING)
    private SignalementStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;

    @ManyToOne
    @JoinColumn(name = "reporter_id")
    @JsonIgnoreProperties({"posts", "comments", "messagesEnvoyes", "profile", "account"})
    private Utilisateur reporter;

    @ManyToOne
    @JoinColumn(name = "post_id")
    @JsonIgnoreProperties({"candidatures"})
    private Post post;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = SignalementStatus.PENDING;
        }
    }
}
