// src/main/java/com/minilinkedin/mini_linkedin/model/PostLike.java
package com.minilinkedin.mini_linkedin.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"post_id", "user_id"}))
@Data
@NoArgsConstructor
public class PostLike {

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
    private Date likedAt;

    @OneToOne(cascade = CascadeType.ALL, optional = true)
    @JoinColumn(name = "notification_id")
    @JsonIgnore
    private Notification notification;

    @PrePersist
    protected void onCreate() {
        this.likedAt = new Date();
    }
}