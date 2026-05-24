// dto/RepostDto.java
package com.minilinkedin.mini_linkedin.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class RepostDto {
    private Long id;
    private Long originalPostId;
    private String titre;
    private String description;
    private String imageUrl;
    private LocalDateTime datePublication;
    private LocalDate dateLimite;
    private String type;
    private Long auteurId;
    private String auteurNom;
    private String auteurPhotoUrl;
    private int likeCount;
    private int commentCount;
    private int shareCount;
    private LocalDateTime repostedAt;
    private Long reposterId;
    private String reposterNom;
}