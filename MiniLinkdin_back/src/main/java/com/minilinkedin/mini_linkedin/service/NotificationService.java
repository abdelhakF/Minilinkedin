package com.minilinkedin.mini_linkedin.service;

import com.minilinkedin.mini_linkedin.model.*;
import com.minilinkedin.mini_linkedin.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    /**
     * Notification générique avec anti-doublon.
     * Pas utilisée pour VISITE.
     */
    public Notification envoyerNotification(Utilisateur destinataire,
                                            NotificationType type,
                                            Long relatedId,
                                            String message) {
        if (destinataire == null || type == null) {
            return null;
        }

        // On ne crée pas de notification pour les visites
        if (type == NotificationType.VISITE) {
            return null;
        }

        // Anti-doublon sauf pour LIKE_COMMENT
        if (type != NotificationType.LIKE_COMMENT) {
            LocalDate aujourdHui = LocalDate.now();
            LocalDateTime debutJournee = aujourdHui.atStartOfDay();
            LocalDateTime finJournee = aujourdHui.atTime(LocalTime.MAX);
            boolean existeDeja = notificationRepository
                    .existsByRecipientAndTypeAndRelatedIdAndCreatedAtBetween(
                            destinataire, type, relatedId, debutJournee, finJournee);

            if (existeDeja) {
                return null;
            }
        }

        Notification notif = new Notification();
        notif.setRecipient(destinataire);
        notif.setType(type);
        notif.setRelatedId(relatedId);
        notif.setContent(message);
        notif.setRead(false);

        return notificationRepository.save(notif);
    }

    /**
     * Notification pour un message privé.
     */
    public Notification envoyerNotificationMessage(Utilisateur destinataire,
                                                   Message linkedMessage,
                                                   String message) {
        if (destinataire == null || linkedMessage == null) {
            return null;
        }

        Notification notif = new Notification();
        notif.setRecipient(destinataire);
        notif.setType(NotificationType.MESSAGE);
        notif.setRelatedId(linkedMessage.getId());
        notif.setMessage(linkedMessage);
        notif.setContent(message);
        notif.setRead(false);

        return notificationRepository.save(notif);
    }

    /**
     * Notification quand quelqu'un commente un post.
     */
    public Notification envoyerNotificationCommentaire(Utilisateur destinataire,
                                                       Comment commentaire,
                                                       String message) {
        if (destinataire == null || commentaire == null) {
            return null;
        }

        Notification notif = new Notification();
        notif.setRecipient(destinataire);
        notif.setType(NotificationType.COMMENT);
        notif.setRelatedId(commentaire.getId());
        notif.setContent(message);
        notif.setRead(false);

        Notification saved = notificationRepository.save(notif);



        return saved;
    }

    /**
     * Notification quand quelqu'un aime un commentaire.
     */
    public Notification envoyerNotificationLikeCommentaire(Utilisateur destinataire,
                                                           CommentLike commentLike,
                                                           String message) {
        if (destinataire == null || commentLike == null) {
            return null;
        }

        Notification notif = new Notification();
        notif.setRecipient(destinataire);
        notif.setType(NotificationType.LIKE_COMMENT);
        notif.setRelatedId(commentLike.getId());
        notif.setContent(message);
        notif.setRead(false);

        Notification saved = notificationRepository.save(notif);


        return saved;
    }

    /**
     * Notification pour une invitation.
     */
    public Notification envoyerNotificationInvitation(Utilisateur destinataire,
                                                      Long invitationId,
                                                      String message) {
        return envoyerNotification(destinataire, NotificationType.CONNECTION, invitationId, message);
    }

    public List<Notification> getNotificationsForUser(String email) {
        return notificationRepository.findByRecipient_Email(email);
    }

    public void deleteNotification(Long notificationId, String email) {
        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);

        if (notificationOpt.isEmpty()) {
            throw new RuntimeException("Notification introuvable.");
        }

        Notification notification = notificationOpt.get();
        if (!notification.getRecipient().getEmail().equals(email)) {
            throw new SecurityException("Action non autorisée.");
        }

        notificationRepository.deleteById(notificationId);
    }

    public void deleteById(Long id) {
        notificationRepository.deleteById(id);
    }

    public void markAsRead(Long id, String email) {
        Notification notif = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification introuvable"));

        if (!notif.getRecipient().getEmail().equals(email)) {
            throw new SecurityException("Action non autorisée");
        }

        notif.setRead(true);
        notificationRepository.save(notif);
    }

    /**
     * Notification spécifique quand un utilisateur visite le profil d'un autre.
     */
    public void creerNotificationVisite(Utilisateur visiteur, Utilisateur proprietaireProfil) {
        if (visiteur == null || proprietaireProfil == null) {
            return;
        }

        // 1. On ne notifie pas si l'utilisateur visite son propre profil
        if (visiteur.getId().equals(proprietaireProfil.getId())) {
            return;
        }

        // 2. Anti-doublon (1 notification max par jour et par visiteur)
        LocalDate aujourdHui = LocalDate.now();
        LocalDateTime debutJournee = aujourdHui.atStartOfDay();
        LocalDateTime finJournee = aujourdHui.atTime(LocalTime.MAX);
        boolean existeDeja = notificationRepository.existsByRecipientAndTypeAndRelatedIdAndCreatedAtBetween(
                proprietaireProfil,
                NotificationType.VISITE,
                visiteur.getId(),
                debutJournee,
                finJournee
        );

        // 3. Création de la notification si elle n'existe pas déjà
        if (!existeDeja) {
            Notification notif = new Notification();
            notif.setRecipient(proprietaireProfil);
            notif.setType(NotificationType.VISITE);
            notif.setRelatedId(visiteur.getId()); // ID de celui qui a visité
            notif.setContent(visiteur.getNom() + " a visité votre profil.");
            notif.setRead(false);

            notificationRepository.save(notif);
        }
    }

}