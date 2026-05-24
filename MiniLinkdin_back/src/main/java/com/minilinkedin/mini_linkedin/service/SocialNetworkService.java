package com.minilinkedin.mini_linkedin.service;

import com.minilinkedin.mini_linkedin.dto.CommentRequest;
import com.minilinkedin.mini_linkedin.dto.InvitationRequest;
import com.minilinkedin.mini_linkedin.dto.MessageRequest;
import com.minilinkedin.mini_linkedin.dto.SuggestedUserDto;
import com.minilinkedin.mini_linkedin.dto.CommentResponseDto;
import com.minilinkedin.mini_linkedin.model.Comment;
import com.minilinkedin.mini_linkedin.model.CommentLike;
import com.minilinkedin.mini_linkedin.model.ConnectionInvitation;
import com.minilinkedin.mini_linkedin.model.ConnectionInvitationStatus;
import com.minilinkedin.mini_linkedin.model.Message;
import com.minilinkedin.mini_linkedin.model.Notification;
import com.minilinkedin.mini_linkedin.model.NotificationType;
import com.minilinkedin.mini_linkedin.model.Post;
import com.minilinkedin.mini_linkedin.model.Utilisateur;
import com.minilinkedin.mini_linkedin.repository.CommentLikeRepository;
import com.minilinkedin.mini_linkedin.repository.CommentRepository;
import com.minilinkedin.mini_linkedin.repository.ConnectionInvitationRepository;
import com.minilinkedin.mini_linkedin.repository.MessageRepository;
import com.minilinkedin.mini_linkedin.repository.PostLikeRepository;
import com.minilinkedin.mini_linkedin.repository.PostRepository;
import com.minilinkedin.mini_linkedin.repository.UtilisateurRepository;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SocialNetworkService {

    @Autowired private UtilisateurRepository utilisateurRepository;
    @Autowired private ConnectionInvitationRepository invitationRepository;
    @Autowired private MessageRepository messageRepository;
    @Autowired private CommentRepository commentRepository;
    @Autowired private PostRepository postRepository;
    @Autowired private NotificationService notificationService;

    // Repositories pour les likes
    @Autowired private CommentLikeRepository commentLikeRepository;
    @Autowired private PostLikeRepository postLikeRepository;   // ⬅️ Ajouté

    // ====================== INVITATIONS ======================
    @Transactional
    public ConnectionInvitation envoyerInvitation(String senderEmail, InvitationRequest request) {
        Utilisateur sender = utilisateurRepository.findByEmail(senderEmail).orElseThrow();
        Utilisateur receiver = resolveInvitationReceiver(request);

        if (Objects.equals(sender.getId(), receiver.getId())) {
            throw new IllegalArgumentException("Impossible de s'inviter soi-meme");
        }

        if (invitationRepository.findBySenderAndSentTo(sender, receiver.getId()).isPresent()) {
            throw new IllegalStateException("Invitation existe deja");
        }

        ConnectionInvitation newInvitation = new ConnectionInvitation();
        newInvitation.setSender(sender);
        newInvitation.setSentTo(receiver.getId());
        newInvitation.setStatus(ConnectionInvitationStatus.PENDING);
        ConnectionInvitation savedInvitation = invitationRepository.save(newInvitation);

        notificationService.envoyerNotification(
                receiver,
                NotificationType.CONNECTION,
                savedInvitation.getId(),
                "Nouvelle invitation.");
        return savedInvitation;
    }

    private Utilisateur resolveInvitationReceiver(InvitationRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("La requete d'invitation est obligatoire");
        }

        if (request.getReceiverId() != null) {
            return utilisateurRepository.findById(request.getReceiverId())
                    .orElseThrow(() -> new IllegalArgumentException("Destinataire introuvable"));
        }

        if (request.getReceiverEmail() != null && !request.getReceiverEmail().isBlank()) {
            return utilisateurRepository.findByEmail(request.getReceiverEmail().trim())
                    .orElseThrow(() -> new IllegalArgumentException("Aucun utilisateur trouve pour cet email"));
        }

        throw new IllegalArgumentException("receiverId ou receiverEmail est requis");
    }

    @Transactional
    public ConnectionInvitation accepterInvitation(String receiverEmail, Long invitationId) {
        ConnectionInvitation inv = invitationRepository.findById(invitationId).orElseThrow();
        Utilisateur dest = utilisateurRepository.findById(inv.getSentTo()).orElseThrow();
        if (!dest.getEmail().equals(receiverEmail)) throw new SecurityException("Interdit");
        inv.setStatus(ConnectionInvitationStatus.ACCEPTED);
        return invitationRepository.save(inv);
    }

    @Transactional
    public ConnectionInvitation refuserInvitation(String receiverEmail, Long invitationId) {
        ConnectionInvitation inv = invitationRepository.findById(invitationId).orElseThrow();
        Utilisateur dest = utilisateurRepository.findById(inv.getSentTo()).orElseThrow();
        if (!dest.getEmail().equals(receiverEmail)) throw new SecurityException("Interdit");
        inv.setStatus(ConnectionInvitationStatus.REJECTED);
        return invitationRepository.save(inv);
    }

    @Transactional
    public void annulerInvitation(String senderEmail, Long invitationId) {
        ConnectionInvitation inv = invitationRepository.findById(invitationId).orElseThrow();
        if (!inv.getSender().getEmail().equals(senderEmail)) throw new SecurityException("Interdit");
        inv.setStatus(ConnectionInvitationStatus.CANCELED);
        invitationRepository.save(inv);
    }

    public List<ConnectionInvitation> getInvitationsRecues(String email) {
        Utilisateur user = utilisateurRepository.findByEmail(email).orElseThrow();
        return invitationRepository.findBySentToAndStatus(user.getId(), ConnectionInvitationStatus.PENDING);
    }

    public List<ConnectionInvitation> getInvitationsEnvoyees(String email) {
        Utilisateur user = utilisateurRepository.findByEmail(email).orElseThrow();
        return invitationRepository.findBySenderAndStatus(user, ConnectionInvitationStatus.PENDING);
    }

    public List<Utilisateur> getMesConnexions(String email) {
        Utilisateur user = utilisateurRepository.findByEmail(email).orElseThrow();
        return invitationRepository.findAllConnectionsOf(user, user.getId()).stream()
                .map(inv -> inv.getSender().getEmail().equals(email)
                        ? utilisateurRepository.findById(inv.getSentTo()).orElse(null)
                        : inv.getSender())
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    // ====================== MESSAGES ======================
    @Transactional
    public Message envoyerMessage(String senderEmail, MessageRequest request) {
        Utilisateur sender = utilisateurRepository.findByEmail(senderEmail).orElseThrow();
        Utilisateur receiver = utilisateurRepository.findById(request.getReceiverId()).orElseThrow();

        Message msg = new Message();
        msg.setSender(sender);
        msg.setSendTo(receiver.getId());
        msg.setMessageBody(request.getMessageBody());
        Message savedMessage = messageRepository.save(msg);

        // Ta logique : lier la notification au message
        Notification notif = notificationService.envoyerNotificationMessage(receiver, savedMessage, "Nouveau message");
        if (notif != null) {
            savedMessage.getNotifications().add(notif);
            messageRepository.save(savedMessage);
        }
        return savedMessage;
    }

    @Transactional(readOnly = true)
    public List<Message> getConversation(String currentUserEmail, Long otherUserId) {
        Utilisateur me = utilisateurRepository.findByEmail(currentUserEmail).orElseThrow();
        Utilisateur other = utilisateurRepository.findById(otherUserId).orElseThrow();
        return messageRepository.findConversation(me, other, me.getId(), other.getId());
    }

    @Transactional(readOnly = true)
    public List<Message> getBoiteReception(String email) {
        Utilisateur user = utilisateurRepository.findByEmail(email).orElseThrow();
        return messageRepository.findBySendToOrderBySentAtDesc(user.getId());
    }

    // ====================== FIL D'ACTUALITÉ ======================
    public List<Post> getFilActualite(String email) {
        List<Post> posts = postRepository.findAllByOrderByDatePublicationDesc();
        Utilisateur currentUser = utilisateurRepository.findByEmail(email).orElse(null);
        // Enrichissement avec likedByMe (comme dans "son code")
        if (currentUser != null) {
            for (Post post : posts) {
                post.setLikedByMe(postLikeRepository.existsByPostAndUser(post, currentUser));
            }
        } else {
            posts.forEach(p -> p.setLikedByMe(false));
        }
        return posts;
    }

    // ====================== COMMENTAIRES ======================
    @Transactional
    public Comment commenter(String authorEmail, CommentRequest request) {
        Utilisateur author = utilisateurRepository.findByEmail(authorEmail).orElseThrow();
        Post post = postRepository.findById(request.getPostId()).orElseThrow();

        Comment comment = new Comment();
        comment.setUser(author);
        comment.setPost(post);
        comment.setText(request.getText());
        comment.setTotalLikes(0);
        Comment savedComment = commentRepository.save(comment);

        // Notification à l'auteur du post (ta logique conservée)
        Utilisateur destinataire = post.getAuteur();
        if (destinataire != null && !destinataire.equals(author)) {
            Notification notif = notificationService.envoyerNotification(
                    destinataire,
                    NotificationType.COMMENT,
                    post.getId(),
                    author.getNom() + " a commenté votre publication"
            );
            if (notif != null) {
                savedComment.setNotification(notif);
                savedComment = commentRepository.save(savedComment);
            }
        }
        return savedComment;
    }

    public List<CommentResponseDto> getCommentaires(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post non trouvé"));
        List<Comment> comments = commentRepository.findByPostOrderByCreatedAtDesc(post);
        Utilisateur currentUser = getCurrentUser();

        List<CommentResponseDto> dtos = new ArrayList<>();
        for (Comment comment : comments) {
            CommentResponseDto dto = new CommentResponseDto();
            dto.setId(comment.getId());
            dto.setText(comment.getText());
            dto.setTotalLikes(comment.getTotalLikes());

            // likedByMe
            if (currentUser != null) {
                dto.setLikedByMe(commentLikeRepository.existsByCommentAndUser(comment, currentUser));
            } else {
                dto.setLikedByMe(false);
            }

            // Auteur du commentaire
            Utilisateur auteur = comment.getUser();
            if (auteur != null) {
                dto.setAuteurId(auteur.getId());
                dto.setAuteurNom(auteur.getNom());
                dto.setAuteurEmail(auteur.getEmail());
                if (auteur.getProfile() != null) {
                    dto.setAuteurPhotoUrl(auteur.getProfile().getPhotoUrl());
                }
            }

            dtos.add(dto);
        }
        return dtos;
    }

    @Transactional
    public Comment toggleLikeCommentaire(Long commentId, Utilisateur user) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Commentaire introuvable"));

        if (commentLikeRepository.existsByCommentAndUser(comment, user)) {
            // Retirer le like
            CommentLike like = commentLikeRepository.findByCommentAndUser(comment, user).get();
            commentLikeRepository.delete(like);
            comment.setTotalLikes(Math.max(0, comment.getTotalLikes() - 1));
        } else {
            // Ajouter le like
            CommentLike like = new CommentLike();
            like.setComment(comment);
            like.setUser(user);
            like = commentLikeRepository.save(like);
            System.out.println("Like enregistré pour commentaire " + commentId + " par " + user.getEmail());

            comment.setTotalLikes(comment.getTotalLikes() + 1);

//            // ✅ Envoyer une notification au propriétaire du commentaire
//            Utilisateur destinataire = comment.getUser();
//            if (destinataire != null && !Objects.equals(destinataire.getId(), user.getId())) {
//                String message = user.getNom() + " a aimé votre commentaire";
//                // Appel à la méthode spécialisée que tu as créée
//                Notification notif = notificationService.envoyerNotificationLikeCommentaire(
//                        destinataire,
//                        like,
//                        message
//                );
//                if (notif != null) {
//                    like.setNotification(notif);
//                    commentLikeRepository.save(like);
//                }
//            }
        }
        return commentRepository.save(comment);
    }

    @Transactional
    public void supprimerCommentaire(String authorEmail, Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Commentaire introuvable"));
        if (!comment.getUser().getEmail().equals(authorEmail))
            throw new SecurityException("Interdit");

        Post post = comment.getPost();
        commentRepository.delete(comment);

        post.setCommentCount(Math.max(0, post.getCommentCount() - 1));
        postRepository.save(post);
    }

    // ==================== SUGGESTIONS ====================
    @Transactional(readOnly = true)
    public List<SuggestedUserDto> getSuggestions(String email, int limit) {
        Utilisateur me = utilisateurRepository.findByEmail(email).orElseThrow();
        Set<Long> excludedIds = new HashSet<>();
        excludedIds.add(me.getId());

        invitationRepository.findAllConnectionsOf(me, me.getId()).forEach(inv -> {
            if (inv.getSender() != null && inv.getSender().getId() != null
                    && Objects.equals(inv.getSender().getId(), me.getId())) {
                excludedIds.add(inv.getSentTo());
            } else if (inv.getSender() != null && inv.getSender().getId() != null) {
                excludedIds.add(inv.getSender().getId());
            }
        });

        invitationRepository.findBySenderAndStatus(me, ConnectionInvitationStatus.PENDING)
                .forEach(inv -> excludedIds.add(inv.getSentTo()));
        invitationRepository.findBySentToAndStatus(me.getId(), ConnectionInvitationStatus.PENDING)
                .forEach(inv -> {
                    if (inv.getSender() != null && inv.getSender().getId() != null) {
                        excludedIds.add(inv.getSender().getId());
                    }
                });

        List<SuggestedUserDto> suggestions = new ArrayList<>();
        for (Utilisateur user : utilisateurRepository.findAll()) {
            if (user.getId() == null || excludedIds.contains(user.getId())) {
                continue;
            }
            suggestions.add(toSuggestion(user));
            if (limit > 0 && suggestions.size() >= limit) {
                break;
            }
        }

        return suggestions;
    }

    private SuggestedUserDto toSuggestion(Utilisateur user) {
        String role = user.getRoleEnum() != null ? user.getRoleEnum().name() : null;
        String photoUrl = null;
        String headline = null;
        String institution = user.getInstitution();

        if (user.getProfile() != null) {
            photoUrl = user.getProfile().getPhotoUrl();
            headline = user.getProfile().getHeadline();
            if (user.getProfile().getInstitution() != null) {
                institution = user.getProfile().getInstitution();
            }
        }

        if (photoUrl == null || photoUrl.isBlank()) {
            photoUrl = user.getPhoto();
        }

        return new SuggestedUserDto(
                user.getId(),
                user.getNom(),
                role,
                institution,
                headline,
                photoUrl);
    }

    // ==================== UTILITAIRES ====================
    private Utilisateur getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        String email = ((UserDetails) auth.getPrincipal()).getUsername();
        return utilisateurRepository.findByEmail(email).orElse(null);
    }
}