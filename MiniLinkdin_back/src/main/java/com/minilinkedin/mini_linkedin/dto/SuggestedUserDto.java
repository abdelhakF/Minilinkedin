package com.minilinkedin.mini_linkedin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SuggestedUserDto {
    private Long id;
    private String nom;
    private String role;
    private String institution;
    private String headline;
    private String photoUrl;
}

