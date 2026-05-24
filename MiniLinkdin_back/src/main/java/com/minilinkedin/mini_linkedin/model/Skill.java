/*
 * Skill.java - Version corrigée (F07)
 */
package com.minilinkedin.mini_linkedin.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Data
@NoArgsConstructor
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Nom de la compétence
     */
    @Column(nullable = false)
    private String name;                    // ← unique = true SUPPRIMÉ

    /**
     * Niveau de maîtrise (F07)
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SkillLevel level = SkillLevel.INTERMEDIATE;
}