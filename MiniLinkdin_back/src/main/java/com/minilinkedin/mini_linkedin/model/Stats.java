/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.minilinkedin.mini_linkedin.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Représente les statistiques du profil d'un utilisateur.
 */
@Entity
@Data
@NoArgsConstructor
public class Stats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * totalViews
     */
    private int totalViews = 0;

    /**
     * totalConnections
     */
    private int totalConnections = 0;

    /**
     * searchAppearances
     */
    private int searchAppearances = 0;
}