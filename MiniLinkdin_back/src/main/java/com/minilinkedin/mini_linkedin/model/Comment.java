package com.minilinkedin.mini_linkedin.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String text;

    private int totalLikes = 0;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(nullable = false, updatable = false)
    private Date createdAt;

    @ManyToOne
    @JoinColumn(name = "post_id", nullable = false)
    @JsonIgnoreProperties("comments")
    private Post post;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private Utilisateur user;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "notification_id")
    @JsonIgnore
    private Notification notification;

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
    }

    @OneToMany(mappedBy = "comment", cascade = CascadeType.REMOVE, orphanRemoval = true)
    @JsonIgnore
    private List<CommentLike> likes = new ArrayList<>();
}