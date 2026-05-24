package com.minilinkedin.mini_linkedin.controller;

import com.minilinkedin.mini_linkedin.dto.CandidatureResponseDTO;
import com.minilinkedin.mini_linkedin.model.Candidature;
import com.minilinkedin.mini_linkedin.model.Enseignant;
import com.minilinkedin.mini_linkedin.model.Etudiant;
import com.minilinkedin.mini_linkedin.model.Utilisateur;
import com.minilinkedin.mini_linkedin.service.CandidatureService;
import com.minilinkedin.mini_linkedin.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.minilinkedin.mini_linkedin.model.TypeRole;

import java.util.List;

@RestController
@RequestMapping("/api/candidatures")
//@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PATCH, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class CandidatureController {

    private final CandidatureService candidatureService;
    private final UserService userService;

    public CandidatureController(CandidatureService candidatureService, UserService userService) {
        this.candidatureService = candidatureService;
        this.userService = userService;
    }

    // ── Étudiant : postuler ──────────────────────────────────────────
    @PostMapping
    public ResponseEntity<Candidature> postuler(
            @RequestBody Candidature candidature,
            @RequestParam Long postId,
            Authentication authentication) {

        Utilisateur user = userService.getCurrentUser(authentication.getName());

        if (!(user instanceof Etudiant etudiant)) {
            return ResponseEntity.badRequest().body(null);
        }

        Candidature saved = candidatureService.postuler(candidature, postId, etudiant);
        return ResponseEntity.ok(saved);
    }

    // ── Récupérer les candidatures par post ─────────────────────────
    @GetMapping("/post/{postId}")
    public ResponseEntity<List<Candidature>> getByPost(@PathVariable Long postId) {
        return ResponseEntity.ok(candidatureService.getCandidaturesByPost(postId));
    }

    // ── Étudiant : mes candidatures ─────────────────────────────────
    @GetMapping("/me")
    public ResponseEntity<List<CandidatureResponseDTO>> getMyCandidatures(Authentication authentication) {
        Utilisateur user = userService.getCurrentUser(authentication.getName());

        if (!(user instanceof Etudiant etudiant)) {
            return ResponseEntity.badRequest().build();
        }

        List<CandidatureResponseDTO> mesCandidatures = candidatureService.getMyCandidaturesDTO(etudiant.getId());
        return ResponseEntity.ok(mesCandidatures);
    }

    // ── Enseignant : toutes les candidatures reçues pour ses posts ──
    @GetMapping("/teacher")
    public ResponseEntity<List<CandidatureResponseDTO>> getTeacherCandidatures(Authentication authentication) {
        Utilisateur user = userService.getCurrentUser(authentication.getName());

        if (!(user instanceof Enseignant enseignant)) {
            return ResponseEntity.badRequest().build();
        }

        List<CandidatureResponseDTO> candidatures = candidatureService.getCandidaturesForTeacher(enseignant.getId());
        return ResponseEntity.ok(candidatures);
    }

    // ── Enseignant : accepter ou refuser une candidature ───────────
    @PatchMapping("/{id}/statut")
    public ResponseEntity<CandidatureResponseDTO> updateStatut(
            @PathVariable Long id,
            @RequestParam String statut,
            Authentication authentication) {

        Utilisateur user = userService.getCurrentUser(authentication.getName());
        System.out.println("=== Rôle de l'utilisateur: " + user.getRoleEnum());
        // ✅ Vérification par rôle au lieu de instanceOf
        if (user.getRoleEnum() != TypeRole.ENSEIGNANT && user.getRoleEnum() != TypeRole.ADMIN) {
            return ResponseEntity.status(403).build();
        }

        if (!statut.equals("ACCEPTEE") && !statut.equals("REFUSEE")) {
            return ResponseEntity.badRequest().build();
        }

        CandidatureResponseDTO updated = candidatureService.updateStatut(id, statut);
        return ResponseEntity.ok(updated);
    }
}