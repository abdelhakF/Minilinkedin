package com.minilinkedin.mini_linkedin.dto;

import lombok.Data;

@Data
public class AuteurDto {
    private Long id;
    private String nom;
    private String email;
    private String photoUrl;
    private String role;
}