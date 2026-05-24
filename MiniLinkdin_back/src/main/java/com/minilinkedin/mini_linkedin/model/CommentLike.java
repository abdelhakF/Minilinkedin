package com.minilinkedin.mini_linkedin.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "comment_likes")
@Data
@NoArgsConstructor
public class CommentLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "comment_id")
    private Comment comment;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private Utilisateur user;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "notification_id")
    @JsonIgnore
    private Notification notification;
}