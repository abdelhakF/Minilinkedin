package com.minilinkedin.mini_linkedin.controller;

import com.minilinkedin.mini_linkedin.model.*;
import com.minilinkedin.mini_linkedin.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
@Tag(name = "Module 4 — Recherche")
public class SearchController {

    @Autowired
    private SearchService searchService;

    // ══════════════════════════════════════════════
    // RECHERCHE GLOBALE
    // ══════════════════════════════════════════════

    @Operation(summary = "Recherche globale : utilisateurs + posts + compétences")
    @GetMapping
    public ResponseEntity<?> rechercheGlobale(
            @Parameter(description = "Mot-clé") @RequestParam String q) {
        try {
            return ResponseEntity.ok(searchService.rechercheGlobale(q));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ══════════════════════════════════════════════
    // RECHERCHE D'UTILISATEURS
    // ══════════════════════════════════════════════

    @Operation(summary = "Rechercher des utilisateurs (par nom, institution ou rôle)")
    @GetMapping("/users")
    public ResponseEntity<?> rechercherUtilisateurs(
            @Parameter(description = "Nom ou fragment") @RequestParam(required = false) String nom,
            @Parameter(description = "Institution")    @RequestParam(required = false) String institution,
            @Parameter(description = "Rôle : ETUDIANT | ENSEIGNANT | ADMINISTRATEUR")
            @RequestParam(required = false) String role) {

        try {
            if (nom != null && !nom.isBlank())
                return ResponseEntity.ok(searchService.rechercherParNom(nom));

            if (institution != null && !institution.isBlank())
                return ResponseEntity.ok(searchService.rechercherParInstitution(institution));

            if (role != null && !role.isBlank())
                return ResponseEntity.ok(searchService.rechercherParRole(TypeRole.valueOf(role.toUpperCase())));

            return ResponseEntity.badRequest()
                    .body("Fournir au moins un paramètre : nom, institution ou role");

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body("Rôle invalide. Valeurs acceptées : ETUDIANT, ENSEIGNANT, ADMINISTRATEUR");
        }
    }

    // ══════════════════════════════════════════════
    // RECHERCHE D'ENSEIGNANTS
    // ══════════════════════════════════════════════

    @Operation(summary = "Rechercher des enseignants validés par spécialité")
    @GetMapping("/enseignants")
    public ResponseEntity<?> rechercherEnseignants(
            @Parameter(description = "Spécialité ou fragment") @RequestParam String specialite) {
        try {
            List<Enseignant> result = searchService.rechercherEnseignantParSpecialite(specialite);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ══════════════════════════════════════════════
    // RECHERCHE DE POSTS
    // ══════════════════════════════════════════════

    @Operation(summary = "Rechercher des publications par mot-clé et/ou type",
            description = "type : offre | these | projet (optionnel)")
    @GetMapping("/posts")
    public ResponseEntity<List<Post>> rechercherPosts(
            @Parameter(description = "Mot-clé") @RequestParam(required = false) String q,
            @Parameter(description = "Type : offre | these | projet") @RequestParam(required = false) String type) {
        return ResponseEntity.ok(searchService.rechercherPostsParType(q, type));
    }

    @Operation(summary = "Toutes les offres de stage")
    @GetMapping("/offres")
    public ResponseEntity<List<OffreStage>> getOffresStage() {
        return ResponseEntity.ok(searchService.getOffresStage());
    }

    @Operation(summary = "Tous les sujets de thèse")
    @GetMapping("/theses")
    public ResponseEntity<List<SujetThese>> getSujetsThese() {
        return ResponseEntity.ok(searchService.getSujetsThese());
    }

    @Operation(summary = "Tous les projets tutorés")
    @GetMapping("/projets")
    public ResponseEntity<List<ProjetTuteure>> getProjetsTutores() {
        return ResponseEntity.ok(searchService.getProjetsTutores());
    }

    // ══════════════════════════════════════════════
    // RECHERCHE DE COMPÉTENCES (Mis à jour)
    // ══════════════════════════════════════════════

    @Operation(summary = "Rechercher des compétences par nom (inclut les utilisateurs)")
    @GetMapping("/skills")
    public ResponseEntity<List<Map<String, Object>>> rechercherCompetences(
            @Parameter(description = "Nom ou fragment") @RequestParam(required = false) String q) {
        // Renvoie désormais une Map structurée contenant la compétence ET les utilisateurs
        return ResponseEntity.ok(searchService.rechercherCompetences(q));
    }
}