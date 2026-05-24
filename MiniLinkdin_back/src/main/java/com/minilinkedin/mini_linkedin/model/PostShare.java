// src/main/java/com/minilinkedin/mini_linkedin/model/PostShare.java
package com.minilinkedin.mini_linkedin.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;
import com.minilinkedin.mini_linkedin.model.Notification;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Data
@NoArgsConstructor
public class PostShare {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private Utilisateur user;

    @Temporal(TemporalType.TIMESTAMP)
    private Date sharedAt;

    private String commentShare;   // commentaire optionnel lors du partage

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "notification_id")
    @JsonIgnore
    private Notification notification;

    @PrePersist
    protected void onCreate() {
        this.sharedAt = new Date();
    }
}