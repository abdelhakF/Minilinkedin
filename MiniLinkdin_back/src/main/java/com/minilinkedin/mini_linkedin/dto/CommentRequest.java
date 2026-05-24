package com.minilinkedin.mini_linkedin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentRequest {
    private Long postId; // ID du post à commenter
    private String text; // Contenu du commentaire
}
