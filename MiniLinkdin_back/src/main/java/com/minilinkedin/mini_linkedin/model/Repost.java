package com.minilinkedin.mini_linkedin.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
public class Repost {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "original_post_id", nullable = false)
    private Post originalPost;

    @ManyToOne
    @JoinColumn(name = "reposter_id", nullable = false)
    private Utilisateur reposter;

    private LocalDateTime repostedAt;

    @PrePersist
    protected void onCreate() {
        repostedAt = LocalDateTime.now();
    }
}