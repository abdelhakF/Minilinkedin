// dto/CommentResponseDto.java
package com.minilinkedin.mini_linkedin.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CommentResponseDto {
    private Long id;
    private String text;
    private LocalDateTime createdAt; // peut rester null
    private Long auteurId;
    private String auteurNom;
    private String auteurEmail;      // ← NOUVEAU
    private String auteurPhotoUrl;
    private int totalLikes;
    private boolean likedByMe;
}

