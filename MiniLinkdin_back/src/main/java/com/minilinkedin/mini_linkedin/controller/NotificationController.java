package com.minilinkedin.mini_linkedin.controller;

import com.minilinkedin.mini_linkedin.model.Notification;
import com.minilinkedin.mini_linkedin.service.NotificationService;
import com.minilinkedin.mini_linkedin.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "Gestion des notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    public NotificationController(NotificationService notificationService, UserService userService) {
        this.notificationService = notificationService;
        this.userService = userService;
    }

    // === ENDPOINT SÉCURISÉ : Voir MES notifications ===
    @Operation(summary = "Récupérer MES notifications (seulement l'utilisateur connecté)")
    @GetMapping("/me")
    public ResponseEntity<List<Notification>> getMyNotifications(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String currentEmail = auth.getName();   // Email de l'utilisateur connecté via JWT
        List<Notification> notifications = notificationService.getNotificationsForUser(currentEmail);

        return ResponseEntity.ok(notifications);
    }

    // Optionnel : Supprimer une notification (avec vérification de propriétaire)
    @Operation(summary = "Supprimer une de MES notifications")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMyNotification(@PathVariable Long id, Authentication auth) {
        if (auth == null || auth.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String currentEmail = auth.getName();
        try {
            notificationService.deleteNotification(id, currentEmail);
            return ResponseEntity.ok("Notification supprimée avec succès");
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Vous ne pouvez pas supprimer cette notification");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/read/{id}")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long id,
            Authentication auth
    ) {
        String email = auth.getName();
        notificationService.markAsRead(id, email);
        return ResponseEntity.ok().build();
    }
}