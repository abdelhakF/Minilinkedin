package com.minilinkedin.mini_linkedin.service;

import com.minilinkedin.mini_linkedin.dto.CandidatureResponseDTO;
import com.minilinkedin.mini_linkedin.model.Candidature;
import com.minilinkedin.mini_linkedin.model.Etudiant;
import com.minilinkedin.mini_linkedin.model.Notification;
import com.minilinkedin.mini_linkedin.model.Post;
import com.minilinkedin.mini_linkedin.repository.CandidatureRepository;
import com.minilinkedin.mini_linkedin.repository.PostRepository;
import org.springframework.stereotype.Service;
import com.minilinkedin.mini_linkedin.service.NotificationService;
import com.minilinkedin.mini_linkedin.model.NotificationType;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CandidatureService {

    private final CandidatureRepository candidatureRepository;
    private final PostRepository postRepository;
    private final NotificationService notificationService;

    public CandidatureService(CandidatureRepository candidatureRepository, PostRepository postRepository, NotificationService notificationService) {
        this.candidatureRepository = candidatureRepository;
        this.postRepository = postRepository;
        this.notificationService = notificationService;
    }

    public Candidature postuler(Candidature candidature, Long postId, Etudiant etudiant) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post non trouvé avec l'ID : " + postId));

        candidature.setPost(post);
        candidature.setEtudiant(etudiant);
        candidature.setDateDepot(LocalDate.now());
        // Par défaut, le statut initial (ex: EN_ATTENTE) peut être géré ici ou directement dans l'entité Candidature

        Candidature saved = candidatureRepository.save(candidature);

        Notification notif = notificationService.envoyerNotification(
                post.getAuteur(),
                NotificationType.CANDIDATURE,
                post.getId(),   // ou saved.getId() selon votre besoin fonctionnel
                etudiant.getNom() + " a postulé à : " + post.getTitre()
        );

        saved.setNotification(notif);   // si Candidature a un champ notification
        candidatureRepository.save(saved);

        return saved;
    }

    public List<Candidature> getCandidaturesByPost(Long postId) {
        return candidatureRepository.findByPostId(postId);
    }

    public List<Candidature> getCandidaturesByEtudiant(Long etudiantId) {
        return candidatureRepository.findByEtudiantId(etudiantId);
    }

    /**
     * Méthode pour l'étudiant : voir ses propres candidatures
     */
    public List<CandidatureResponseDTO> getMyCandidaturesDTO(Long etudiantId) {
        List<Candidature> candidatures = candidatureRepository.findByEtudiantId(etudiantId);
        return candidatures.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    /**
     * NOUVEAU : Méthode pour l'enseignant : voir les candidatures sur ses propres publications
     */
    public List<CandidatureResponseDTO> getCandidaturesForTeacher(Long teacherId) {
        // 1. Trouver tous les posts publiés par cet enseignant
        List<Post> teacherPosts = postRepository.findByAuteurId(teacherId);
        List<Long> postIds = teacherPosts.stream().map(Post::getId).collect(Collectors.toList());

        if (postIds.isEmpty()) {
            return new ArrayList<>(); // Aucun post = aucune candidature
        }

        // 2. Trouver toutes les candidatures liées à ces posts
        List<Candidature> candidatures = candidatureRepository.findByPostIdIn(postIds);

        // 3. Convertir en DTO pour le retour
        return candidatures.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    /**
     * NOUVEAU : Mettre à jour le statut d'une candidature (Accepter/Refuser)
     */
    public CandidatureResponseDTO updateStatut(Long candidatureId, String nouveauStatut) {
        Candidature candidature = candidatureRepository.findById(candidatureId)
                .orElseThrow(() -> new IllegalArgumentException("Candidature introuvable avec l'ID : " + candidatureId));

        candidature.setStatut(nouveauStatut);
        Candidature saved = candidatureRepository.save(candidature);

        return convertToDTO(saved);
    }

    /**
     * Méthode utilitaire pour éviter la récursion infinie en retournant un DTO propre
     */
    private CandidatureResponseDTO convertToDTO(Candidature c) {
        CandidatureResponseDTO dto = new CandidatureResponseDTO();
        dto.setId(c.getId());
        dto.setMessageMotivation(c.getMessageMotivation());
        dto.setDateDepot(c.getDateDepot());
        dto.setStatut(c.getStatut()); // Assure-toi que Candidature.java a bien le getter getStatut()

        // Informations du Post
        if (c.getPost() != null) {
            dto.setPostId(c.getPost().getId());
            dto.setPostTitre(c.getPost().getTitre());
            dto.setPostDescription(c.getPost().getDescription());
        }

        // Informations de l'étudiant
        if (c.getEtudiant() != null) {
            dto.setEtudiantId(c.getEtudiant().getId());
            dto.setEtudiantNom(c.getEtudiant().getNom());
            dto.setEtudiantEmail(c.getEtudiant().getEmail());
        }

        return dto;
    }
}