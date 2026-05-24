package com.minilinkedin.mini_linkedin.controller;

import com.minilinkedin.mini_linkedin.dto.DashboardStatsDTO;
import com.minilinkedin.mini_linkedin.model.Enseignant;
import com.minilinkedin.mini_linkedin.model.Post;
import com.minilinkedin.mini_linkedin.model.Signalement;
import com.minilinkedin.mini_linkedin.model.SignalementStatus;
import com.minilinkedin.mini_linkedin.model.Utilisateur;
import com.minilinkedin.mini_linkedin.service.AdminService;
import com.minilinkedin.mini_linkedin.service.SignalementService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Module 2 — Administration" , description="Espace de l'administrateur")
public class AdminController {

    private final AdminService adminService;
    private final SignalementService signalementService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/users")
    public ResponseEntity<List<Utilisateur>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<Utilisateur> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getUserById(id));
    }

    @PutMapping("/enseignants/{id}/validate")
    public ResponseEntity<Enseignant> validateEnseignant(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.validateEnseignant(id));
    }

    @PutMapping("/users/{id}/ban")
    public ResponseEntity<Utilisateur> banUser(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.banUser(id));
    }

    @PutMapping("/users/{id}/unban")
    public ResponseEntity<Utilisateur> unbanUser(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.unbanUser(id));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/posts")
    public ResponseEntity<List<Post>> getAllPosts() {
        return ResponseEntity.ok(adminService.getAllPosts());
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        adminService.deletePost(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== SIGNALEMENTS (ajouté par ton ami·e) ====================

    @GetMapping("/signalements")
    public ResponseEntity<List<Signalement>> getAllSignalements(
            @RequestParam(required = false) SignalementStatus status) {
        List<Signalement> signalements = (status != null)
                ? signalementService.getSignalementsByStatus(status)
                : signalementService.getAllSignalements();
        return ResponseEntity.ok(signalements);
    }

    @PutMapping("/signalements/{id}/resolve")
    public ResponseEntity<Signalement> resolveSignalement(
            @PathVariable Long id,
            @RequestParam(defaultValue = "false") boolean deletePost) {
        return ResponseEntity.ok(signalementService.resolveSignalement(id, deletePost));
    }

    @PutMapping("/signalements/{id}/reject")
    public ResponseEntity<Signalement> rejectSignalement(@PathVariable Long id) {
        return ResponseEntity.ok(signalementService.rejectSignalement(id));
    }

    @DeleteMapping("/signalements/{id}")
    public ResponseEntity<Void> deleteSignalement(@PathVariable Long id) {
        signalementService.deleteSignalement(id);
        return ResponseEntity.noContent().build();
    }
}