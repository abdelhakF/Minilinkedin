package com.minilinkedin.mini_linkedin.service;

import com.minilinkedin.mini_linkedin.dto.PostResponseDto;
import com.minilinkedin.mini_linkedin.dto.RepostDto;
import com.minilinkedin.mini_linkedin.model.*;
import com.minilinkedin.mini_linkedin.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final PostShareRepository postShareRepository;
    private final CommentRepository commentRepository;
    private final NotificationService notificationService;
    private final UtilisateurRepository utilisateurRepository;
    private final RepostRepository repostRepository;
    private final CommentLikeRepository commentLikeRepository;
    private final NotificationRepository notificationRepository;
    @Autowired
    public PostService(PostRepository postRepository,
                       PostLikeRepository postLikeRepository,
                       PostShareRepository postShareRepository,
                       CommentRepository commentRepository,
                       NotificationService notificationService,
                       UtilisateurRepository utilisateurRepository,
                       RepostRepository repostRepository, CommentLikeRepository commentLikeRepository, NotificationRepository notificationRepository) {
        this.postRepository = postRepository;
        this.postLikeRepository = postLikeRepository;
        this.postShareRepository = postShareRepository;
        this.commentRepository = commentRepository;
        this.notificationService = notificationService;
        this.utilisateurRepository = utilisateurRepository;
        this.repostRepository = repostRepository;
        this.commentLikeRepository = commentLikeRepository;
        this.notificationRepository = notificationRepository;
    }

    // ====================== CRÉATION POST ======================
    public Post createPost(Post post, Utilisateur auteur) {
        post.setAuteur(auteur);
        return postRepository.save(post);
    }

    // ====================== LIKE ======================
    public void likePost(Long postId, Utilisateur user) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post non trouvé"));

        if (postLikeRepository.existsByPostAndUser(post, user)) return;

        PostLike like = new PostLike();
        like.setPost(post);
        like.setUser(user);
        like = postLikeRepository.save(like);

        Notification notif = notificationService.envoyerNotification(
                post.getAuteur(),
                NotificationType.LIKE,
                post.getId(),
                user.getNom() + " a aimé votre publication"
        );

        // Association conservée
        like.setNotification(notif);
        postLikeRepository.save(like);

        post.setLikeCount(post.getLikeCount() + 1);
        postRepository.save(post);
    }

    public void unlikePost(Long postId, Utilisateur user) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post non trouvé"));

        Optional<PostLike> likeOpt = postLikeRepository.findByPostAndUser(post, user);
        if (likeOpt.isPresent()) {
            postLikeRepository.delete(likeOpt.get());
            post.setLikeCount(Math.max(0, post.getLikeCount() - 1));
            postRepository.save(post);
        }
    }

    // ====================== SHARE ======================
    public void sharePost(Long postId, Utilisateur user, String commentShare, List<Long> destinataireIds) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post non trouvé"));

        PostShare share = new PostShare();
        share.setPost(post);
        share.setUser(user);
        share.setCommentShare(commentShare);
        share = postShareRepository.save(share);

        String message = (commentShare != null && !commentShare.isEmpty())
                ? user.getNom() + " a partagé votre publication avec un commentaire"
                : user.getNom() + " a partagé votre publication";

        Notification notif = notificationService.envoyerNotification(
                post.getAuteur(),
                NotificationType.SHARE,
                post.getId(),
                message
        );

        // Association conservée
        share.setNotification(notif);
        postShareRepository.save(share);

        post.setShareCount(post.getShareCount() + 1);
        postRepository.save(post);
    }

    // ====================== COMMENT ======================
    public Comment addComment(Long postId, Utilisateur user, String text) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post non trouvé"));

        Comment comment = new Comment();
        comment.setText(text);
        comment.setPost(post);
        comment.setUser(user);
        Comment savedComment = commentRepository.save(comment);

        Notification notif = notificationService.envoyerNotification(
                post.getAuteur(),
                NotificationType.COMMENT,
                post.getId(),
                user.getNom() + " a commenté votre publication : " + text
        );

        // Association conservée
        savedComment.setNotification(notif);
        commentRepository.save(savedComment);

        // ⚠️ Ne pas oublier le compteur
        post.setCommentCount(post.getCommentCount() + 1);
        postRepository.save(post);

        return savedComment;
    }

    // ====================== REPOSTS ======================
    @Transactional
    public Repost repostPost(Long originalPostId, Utilisateur reposter) {
        Post original = postRepository.findById(originalPostId)
                .orElseThrow(() -> new RuntimeException("Post original introuvable"));

        if (repostRepository.findByOriginalPostAndReposter(original, reposter).isPresent()) {
            throw new RuntimeException("Vous avez déjà republié ce post");
        }

        original.setShareCount(original.getShareCount() + 1);
        postRepository.save(original);

        Repost repost = new Repost();
        repost.setOriginalPost(original);
        repost.setReposter(reposter);
        return repostRepository.save(repost);
    }

    @Transactional
    public void deleteRepost(Long originalPostId, Utilisateur reposter) {
        Post original = postRepository.findById(originalPostId)
                .orElseThrow(() -> new RuntimeException("Post original introuvable"));

        Optional<Repost> repostOpt = repostRepository.findByOriginalPostAndReposter(original, reposter);
        if (repostOpt.isPresent()) {
            repostRepository.delete(repostOpt.get());
            original.setShareCount(Math.max(0, original.getShareCount() - 1));
            postRepository.save(original);
        }
    }

    public List<RepostDto> getMyReposts(Utilisateur user) {
        List<Repost> reposts = repostRepository.findByReposter(user);
        return reposts.stream().map(this::toRepostDto).collect(Collectors.toList());
    }

    public boolean hasUserReposted(Long postId, Utilisateur user) {
        Post original = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post non trouvé"));
        return repostRepository.findByOriginalPostAndReposter(original, user).isPresent();
    }

    // ====================== LECTURE AVEC likedByMe ======================
    public List<Post> getAllPosts() {
        List<Post> posts = postRepository.findAll();
        enrichWithLikedByMe(posts);
        return posts;
    }

    public List<Post> getPostsByAuteurEmail(String email) {
        List<Post> posts = postRepository.findByAuteurEmailOrderByDatePublicationDesc(email);
        enrichWithLikedByMe(posts);
        return posts;
    }

    public Optional<Post> getPostById(Long id) {
        Optional<Post> postOpt = postRepository.findById(id);
        postOpt.ifPresent(this::enrichWithLikedByMe);
        return postOpt;
    }

    public List<Post> getPostsByType(PostType type) {
        List<Post> posts = postRepository.findByTypeOrderByDatePublicationDesc(type);
        enrichWithLikedByMe(posts);
        return posts;
    }

    public List<Post> getPostsByAuteurId(Long auteurId) {
        List<Post> posts = postRepository.findByAuteurId(auteurId);
        enrichWithLikedByMe(posts);
        return posts;
    }

    // ====================== SUPPRESSION ======================
    @Transactional
    public boolean deleteMyPost(Long postId, String email) {
        Optional<Post> postOpt = postRepository.findById(postId);
        if (postOpt.isEmpty()) return false;
        Post post = postOpt.get();
        if (post.getAuteur() == null || post.getAuteur().getEmail() == null
                || !post.getAuteur().getEmail().equalsIgnoreCase(email)) {
            throw new SecurityException("Action non autorisée.");
        }
        // Supprimer d'abord les reposts liés
        repostRepository.deleteByOriginalPost(post);
        postRepository.delete(post);
        return true;
    }

    // ====================== CONVERSION DTO (optionnel) ======================
    public PostResponseDto toDto(Post post) {
        PostResponseDto dto = new PostResponseDto();
        dto.setId(post.getId());
        dto.setTitre(post.getTitre());
        dto.setDescription(post.getDescription());
        dto.setImageUrl(post.getImageUrl());
        dto.setDatePublication(post.getDatePublication());
        dto.setDateLimite(post.getDateLimite());
        dto.setType(post.getType() != null ? post.getType().name() : null);
        dto.setLikeCount(post.getLikeCount());
        dto.setCommentCount(post.getCommentCount());
        dto.setShareCount(post.getShareCount());
        dto.setLikedByMe(post.getLikedByMe());

        Utilisateur auteur = post.getAuteur();
        if (auteur != null) {
            dto.setAuteurId(auteur.getId());
            dto.setAuteurNom(auteur.getNom());
            dto.setAuteurEmail(auteur.getEmail());
            if (auteur.getProfile() != null) {
                dto.setAuteurPhotoUrl(auteur.getProfile().getPhotoUrl());
            }
        }

        // Champs spécifiques (à adapter selon tes besoins)
        if (post instanceof OffreStage) {
            OffreStage offre = (OffreStage) post;
            dto.setDuree(offre.getDuree());
            dto.setLieu(offre.getLieu());
            dto.setRemuneration(offre.getRemuneration());
        } else if (post instanceof DemandePost) {
            DemandePost demande = (DemandePost) post;
            dto.setTypeDemande(demande.getTypeDemande());
            dto.setNiveauEtude(demande.getNiveauEtude());
            dto.setDomaine(demande.getDomaine());
            dto.setDureeSouhaitee(demande.getDureeSouhaitee());
            dto.setLocalisationPreferee(demande.getLocalisationPreferee());
        } else if (post instanceof ProjetTuteure) {
            ProjetTuteure projet = (ProjetTuteure) post;
            dto.setModule(projet.getModule());
            dto.setPromotion(projet.getPromotion());
        } else if (post instanceof SujetThese) {
            SujetThese these = (SujetThese) post;
            dto.setNiveau(these.getNiveau());
            dto.setLaboratoire(these.getLaboratoire());
            dto.setDirecteur(these.getDirecteur());
        } else if (post instanceof PublicationPost) {
            PublicationPost pub = (PublicationPost) post;
            dto.setMediaUrl(pub.getMediaUrl());
            dto.setVisibility(pub.getVisibility());
        }

        return dto;
    }

    private RepostDto toRepostDto(Repost repost) {
        RepostDto dto = new RepostDto();
        dto.setId(repost.getId());
        dto.setRepostedAt(repost.getRepostedAt());
        dto.setReposterId(repost.getReposter().getId());
        dto.setReposterNom(repost.getReposter().getNom());
        Post original = repost.getOriginalPost();
        if (original != null) {
            dto.setOriginalPostId(original.getId());
            dto.setTitre(original.getTitre());
            dto.setDescription(original.getDescription());
            dto.setImageUrl(original.getImageUrl());
            dto.setDatePublication(original.getDatePublication());
            dto.setDateLimite(original.getDateLimite());
            dto.setType(original.getType() != null ? original.getType().name() : null);
            dto.setLikeCount(original.getLikeCount());
            dto.setCommentCount(original.getCommentCount());
            dto.setShareCount(original.getShareCount());

            Utilisateur auteur = original.getAuteur();
            if (auteur != null) {
                dto.setAuteurId(auteur.getId());
                dto.setAuteurNom(auteur.getNom());
                if (auteur.getProfile() != null) {
                    dto.setAuteurPhotoUrl(auteur.getProfile().getPhotoUrl());
                }
            }
        }
        return dto;
    }

    // ====================== MÉTHODES PRIVÉES ======================
    private Utilisateur getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        String email = ((UserDetails) auth.getPrincipal()).getUsername();
        return utilisateurRepository.findByEmail(email).orElse(null);
    }

    private void enrichWithLikedByMe(List<Post> posts) {
        Utilisateur currentUser = getCurrentUser();
        if (currentUser == null) {
            posts.forEach(p -> p.setLikedByMe(false));
            return;
        }
        for (Post post : posts) {
            boolean liked = postLikeRepository.existsByPostAndUser(post, currentUser);
            post.setLikedByMe(liked);
        }
    }

    private void enrichWithLikedByMe(Post post) {
        Utilisateur currentUser = getCurrentUser();
        if (currentUser == null) {
            post.setLikedByMe(false);
            return;
        }
        post.setLikedByMe(postLikeRepository.existsByPostAndUser(post, currentUser));
    }

    public List<RepostDto> getRepostsByUser(Utilisateur user) {
        List<Repost> reposts = repostRepository.findByReposter(user);
        return reposts.stream().map(this::toRepostDto).collect(Collectors.toList());
    }

    // ====================== LIKE COMMENTAIRE ======================

    @Transactional
    public CommentLike likeComment(Long commentId, Utilisateur user) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Commentaire non trouvé"));

        // Éviter les doubles likes
        if (commentLikeRepository.existsByCommentAndUser(comment, user)) {
            return null;
        }

        CommentLike commentLike = new CommentLike();
        commentLike.setComment(comment);
        commentLike.setUser(user);
        commentLike = commentLikeRepository.save(commentLike);

        // Création de la notification
        String message = user.getNom() + " a aimé votre commentaire";

        Notification notif = notificationService.envoyerNotificationLikeCommentaire(
                comment.getUser(),        // Destinataire = auteur du commentaire
                commentLike,
                message
        );

        // Association + Correction importante : relatedId = ID du POST (pas du CommentLike)
        if (notif != null) {
            notif.setRelatedId(comment.getPost().getId());   // ← FIX PRINCIPAL
            notificationRepository.save(notif);              // On met à jour le relatedId

            commentLike.setNotification(notif);
            commentLikeRepository.save(commentLike);
        }

        // Mise à jour du compteur
        comment.setTotalLikes(comment.getTotalLikes() + 1);
        commentRepository.save(comment);

        return commentLike;
    }

    @Transactional
    public void unlikeComment(Long commentId, Utilisateur user) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Commentaire non trouvé"));

        Optional<CommentLike> likeOpt = commentLikeRepository.findByCommentAndUser(comment, user);

        if (likeOpt.isPresent()) {
            CommentLike like = likeOpt.get();

            // Supprimer la notification associée si elle existe
            if (like.getNotification() != null) {
                notificationService.deleteById(like.getNotification().getNotificationId());
            }

            commentLikeRepository.delete(like);

            // Mise à jour du compteur
            comment.setTotalLikes(Math.max(0, comment.getTotalLikes() - 1));
            commentRepository.save(comment);
        }
    }

}