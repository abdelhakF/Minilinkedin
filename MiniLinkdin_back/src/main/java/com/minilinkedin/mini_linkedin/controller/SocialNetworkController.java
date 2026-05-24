package com.minilinkedin.mini_linkedin.controller;

import com.minilinkedin.mini_linkedin.dto.*;
import com.minilinkedin.mini_linkedin.model.*;
import com.minilinkedin.mini_linkedin.repository.UtilisateurRepository;
import com.minilinkedin.mini_linkedin.service.SocialNetworkService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/network")
@Tag(name = "Module 3 — Réseau Social")
public class SocialNetworkController {

    @Autowired
    private SocialNetworkService socialNetworkService;
    //Ajouter par Zak
    @Autowired private UtilisateurRepository utilisateurRepository;

    // ==================== INVITATIONS ====================

    @PostMapping("/invite")
    public ResponseEntity<?> envoyerInvitation(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody InvitationRequest request) {

        String currentEmail = userDetails.getUsername();
        ConnectionInvitation inv = socialNetworkService.envoyerInvitation(currentEmail, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(inv);
    }

    @PutMapping("/invite/{id}/accept")
    public ResponseEntity<?> accepterInvitation(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        String currentEmail = userDetails.getUsername();
        ConnectionInvitation inv = socialNetworkService.accepterInvitation(currentEmail, id);
        return ResponseEntity.ok(inv);
    }

    @PutMapping("/invite/{id}/reject")
    public ResponseEntity<?> refuserInvitation(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        String currentEmail = userDetails.getUsername();
        ConnectionInvitation inv = socialNetworkService.refuserInvitation(currentEmail, id);
        return ResponseEntity.ok(inv);
    }

    @DeleteMapping("/invite/{id}/cancel")
    public ResponseEntity<?> annulerInvitation(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        String currentEmail = userDetails.getUsername();
        socialNetworkService.annulerInvitation(currentEmail, id);
        return ResponseEntity.ok("Invitation annulée");
    }

    @GetMapping("/invitations/received")
    public ResponseEntity<List<ConnectionInvitation>> getInvitationsRecues(
            @AuthenticationPrincipal UserDetails userDetails) {

        String email = userDetails.getUsername();
        return ResponseEntity.ok(socialNetworkService.getInvitationsRecues(email));
    }

    @GetMapping("/invitations/sent")
    public ResponseEntity<List<ConnectionInvitation>> getInvitationsEnvoyees(
            @AuthenticationPrincipal UserDetails userDetails) {

        String email = userDetails.getUsername();
        return ResponseEntity.ok(socialNetworkService.getInvitationsEnvoyees(email));
    }

    @GetMapping("/connections")
    public ResponseEntity<List<Utilisateur>> getMesConnexions(
            @AuthenticationPrincipal UserDetails userDetails) {

        String email = userDetails.getUsername();
        return ResponseEntity.ok(socialNetworkService.getMesConnexions(email));
    }

    // ==================== MESSAGERIE ====================

    @PostMapping("/messages")
    public ResponseEntity<?> envoyerMessage(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody MessageRequest request) {

        String email = userDetails.getUsername();
        Message msg = socialNetworkService.envoyerMessage(email, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(msg);
    }

    @GetMapping("/messages/inbox")
    public ResponseEntity<List<Message>> getBoiteReception(
            @AuthenticationPrincipal UserDetails userDetails) {

        String email = userDetails.getUsername();
        return ResponseEntity.ok(socialNetworkService.getBoiteReception(email));
    }

    @GetMapping("/messages/{userId}")
    public ResponseEntity<List<Message>> getConversation(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long userId) {

        String email = userDetails.getUsername();
        return ResponseEntity.ok(socialNetworkService.getConversation(email, userId));
    }

    // ==================== FIL D'ACTUALITÉ & COMMENTAIRES ====================

    @GetMapping("/feed")
    public ResponseEntity<List<Post>> getFilActualite(
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(socialNetworkService.getFilActualite(userDetails.getUsername()));
    }

    @PostMapping("/comments")
    public ResponseEntity<?> commenter(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody CommentRequest request) {

        String email = userDetails.getUsername();
        Comment comment = socialNetworkService.commenter(email, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(comment);
    }

    @GetMapping("/comments/{postId}")
    public ResponseEntity<List<CommentResponseDto>> getCommentaires(@PathVariable Long postId) {
        return ResponseEntity.ok(socialNetworkService.getCommentaires(postId));
    }

    //Remplace la methode likeCommentaire par toggleLikeCommentaire
    @PutMapping("/comments/{id}/like")
    public ResponseEntity<Comment> toggleLikeCommentaire(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        Utilisateur user = utilisateurRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(socialNetworkService.toggleLikeCommentaire(id, user));
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<?> supprimerCommentaire(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        String email = userDetails.getUsername();
        socialNetworkService.supprimerCommentaire(email, id);
        return ResponseEntity.ok("Commentaire supprimé");
    }


    @GetMapping("/suggestions")
    public ResponseEntity<List<SuggestedUserDto>> getSuggestions(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(value = "limit", required = false, defaultValue = "6") int limit) {

        String email = userDetails.getUsername();
        return ResponseEntity.ok(socialNetworkService.getSuggestions(email, limit));
    }
}