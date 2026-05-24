package com.minilinkedin.mini_linkedin.repository;

import com.minilinkedin.mini_linkedin.model.Notification;
import com.minilinkedin.mini_linkedin.model.NotificationType;
import com.minilinkedin.mini_linkedin.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipient_Email(String email);

    void deleteByRecipient_Id(Long recipientId);

    boolean existsByRecipientAndTypeAndRelatedIdAndCreatedAtBetween(
            Utilisateur recipient,
            NotificationType type,
            Long relatedId,
            LocalDateTime start,
            LocalDateTime end
    );
    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.notificationId = :id")
    void markAsRead(@Param("id") Long id);
}