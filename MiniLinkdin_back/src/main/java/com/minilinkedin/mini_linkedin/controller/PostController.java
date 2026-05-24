package com.minilinkedin.mini_linkedin.controller;

import com.minilinkedin.mini_linkedin.dto.PostResponseDto;
import com.minilinkedin.mini_linkedin.dto.RepostDto;
import com.minilinkedin.mini_linkedin.dto.ShareRequest;
import com.minilinkedin.mini_linkedin.model.*;
import com.minilinkedin.mini_linkedin.repository.UtilisateurRepository;
import com.minilinkedin.mini_linkedin.service.PostService;
import com.minilinkedin.mini_linkedin.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;
    private final UserService userService;
    private final UtilisateurRepository utilisateurRepository;

    public PostController(PostService postService, UserService userService,
                          UtilisateurRepository utilisateurRepository) {
        this.postService = postService;
        this.userService = userService;
        this.utilisateurRepository = utilisateurRepository;
    }

    // ====================== POSTS ENSEIGNANTS ======================
    @PostMapping("/offre-stage")
    public ResponseEntity<OffreStage> createOffreStage(@RequestBody OffreStage offre, Authentication auth) {
        Utilisateur auteur = userService.getCurrentUser(auth.getName());
        if (auteur.getRoleEnum() != TypeRole.ENSEIGNANT && auteur.getRoleEnum() != TypeRole.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok((OffreStage) postService.createPost(offre, auteur));
    }

    @PostMapping("/sujet-these")
    public ResponseEntity<SujetThese> createSujetThese(@RequestBody SujetThese sujet, Authentication auth) {
        Utilisateur auteur = userService.getCurrentUser(auth.getName());
        if (auteur.getRoleEnum() != TypeRole.ENSEIGNANT && auteur.getRoleEnum() != TypeRole.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok((SujetThese) postService.createPost(sujet, auteur));
    }

    // ====================== PROJET TUTORÉ ======================
    @PostMapping("/projet-tutore")
    public ResponseEntity<ProjetTuteure> createProjetTutore(@RequestBody ProjetTuteure projet, Authentication auth) {
        Utilisateur auteur = userService.getCurrentUser(auth.getName());
        if (auteur.getRoleEnum() != TypeRole.ETUDIANT &&
                auteur.getRoleEnum() != TypeRole.ENSEIGNANT &&
                auteur.getRoleEnum() != TypeRole.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok((ProjetTuteure) postService.createPost(projet, auteur));
    }

    // ====================== POSTS ÉTUDIANTS ======================
    @PostMapping("/demande")
    public ResponseEntity<DemandePost> createDemande(@RequestBody DemandePost demande, Authentication auth) {
        Utilisateur auteur = userService.getCurrentUser(auth.getName());
        if (auteur.getRoleEnum() != TypeRole.ETUDIANT) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok((DemandePost) postService.createPost(demande, auteur));
    }

    // ====================== PUBLICATION NORMALE ======================
    @PostMapping("/publication")
    public ResponseEntity<PublicationPost> createPublication(@RequestBody PublicationPost publication, Authentication auth) {
        Utilisateur auteur = userService.getCurrentUser(auth.getName());
        if (auteur.getRoleEnum() != TypeRole.ETUDIANT && auteur.getRoleEnum() != TypeRole.ENSEIGNANT) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok((PublicationPost) postService.createPost(publication, auteur));
    }

    // ====================== INTERACTIONS ======================
    @PostMapping("/{postId}/like")
    public ResponseEntity<String> likePost(@PathVariable Long postId, Authentication auth) {
        Utilisateur user = userService.getCurrentUser(auth.getName());
        postService.likePost(postId, user);
        return ResponseEntity.ok("Post liké avec succès");
    }

    @DeleteMapping("/{postId}/like")
    public ResponseEntity<String> unlikePost(@PathVariable Long postId, Authentication auth) {
        Utilisateur user = userService.getCurrentUser(auth.getName());
        postService.unlikePost(postId, user);
        return ResponseEntity.ok("Like retiré");
    }

    @PostMapping("/{postId}/comment")
    public ResponseEntity<Comment> addComment(@PathVariable Long postId,
                                              @RequestBody String text,
                                              Authentication auth) {
        Utilisateur user = userService.getCurrentUser(auth.getName());
        Comment comment = postService.addComment(postId, user, text);
        return ResponseEntity.ok(comment);
    }

    @PostMapping("/{postId}/share")
    public ResponseEntity<String> sharePost(@PathVariable Long postId,
                                            @RequestBody ShareRequest request,
                                            Authentication auth) {
        Utilisateur user = userService.getCurrentUser(auth.getName());
        postService.sharePost(postId, user, request.getCommentShare(), request.getDestinataireIds());
        return ResponseEntity.ok("Post partagé avec succès");
    }

    // ====================== RÉCUPÉRATION (DTO) ======================
    @GetMapping
    public ResponseEntity<List<PostResponseDto>> getAllPosts() {
        List<Post> posts = postService.getAllPosts();
        List<PostResponseDto> dtos = posts.stream()
                .map(postService::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/me")
    public ResponseEntity<List<PostResponseDto>> getMyPosts(Authentication auth) {
        List<Post> posts = postService.getPostsByAuteurEmail(auth.getName());
        List<PostResponseDto> dtos = posts.stream()
                .map(postService::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponseDto> getPostById(@PathVariable Long id) {
        return postService.getPostById(id)
                .map(postService::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}/me")
    public ResponseEntity<Void> deleteMyPost(@PathVariable Long id, Authentication auth) {
        try {
            boolean deleted = postService.deleteMyPost(id, auth.getName());
            return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<PostResponseDto>> getPostsByType(@PathVariable PostType type) {
        List<Post> posts = postService.getPostsByType(type);
        List<PostResponseDto> dtos = posts.stream()
                .map(postService::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // ====================== REPOSTS ======================
    @GetMapping("/me/reposts")
    public ResponseEntity<List<RepostDto>> getMyReposts(Authentication auth) {
        Utilisateur user = userService.getCurrentUser(auth.getName());
        List<RepostDto> reposts = postService.getMyReposts(user);
        return ResponseEntity.ok(reposts);
    }

    @PostMapping("/{postId}/repost")
    public ResponseEntity<Repost> repostPost(@PathVariable Long postId, Authentication auth) {
        Utilisateur user = userService.getCurrentUser(auth.getName());
        Repost repost = postService.repostPost(postId, user);
        return ResponseEntity.ok(repost);
    }

    @DeleteMapping("/{postId}/repost")
    public ResponseEntity<Void> deleteRepost(@PathVariable Long postId, Authentication auth) {
        Utilisateur user = userService.getCurrentUser(auth.getName());
        postService.deleteRepost(postId, user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{postId}/repost/status")
    public ResponseEntity<Map<String, Boolean>> getRepostStatus(@PathVariable Long postId, Authentication auth) {
        Utilisateur user = userService.getCurrentUser(auth.getName());
        boolean already = postService.hasUserReposted(postId, user);
        return ResponseEntity.ok(Map.of("alreadyReposted", already));
    }

    @GetMapping("/user/{userId}/posts")
    public ResponseEntity<List<PostResponseDto>> getPostsByUserId(@PathVariable Long userId) {
        List<Post> posts = postService.getPostsByAuteurId(userId);
        List<PostResponseDto> dtos = posts.stream()
                .map(postService::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/user/{userId}/reposts")
    public ResponseEntity<List<RepostDto>> getRepostsByUserId(@PathVariable Long userId) {
        Utilisateur user = utilisateurRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        List<RepostDto> reposts = postService.getRepostsByUser(user);
        return ResponseEntity.ok(reposts);
    }

    @PostMapping("/comments/{commentId}/like")
    public ResponseEntity<String> likeComment(@PathVariable Long commentId, Authentication auth) {
        Utilisateur user = userService.getCurrentUser(auth.getName());
        postService.likeComment(commentId, user);
        return ResponseEntity.ok("Commentaire liké avec succès");
    }

    @DeleteMapping("/comments/{commentId}/like")
    public ResponseEntity<String> unlikeComment(@PathVariable Long commentId, Authentication auth) {
        Utilisateur user = userService.getCurrentUser(auth.getName());
        postService.unlikeComment(commentId, user);
        return ResponseEntity.ok("Like retiré");
    }

}