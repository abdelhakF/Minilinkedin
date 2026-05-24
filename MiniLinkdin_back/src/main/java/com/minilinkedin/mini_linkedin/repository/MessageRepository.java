package com.minilinkedin.mini_linkedin.repository;

import com.minilinkedin.mini_linkedin.model.*;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends CrudRepository<Message, Long> {

    List<Message> findBySendToOrderBySentAtDesc(Long sendTo);

    @Query("SELECT m FROM Message m WHERE (m.sender = :me AND m.sendTo = :otherId) OR (m.sender = :other AND m.sendTo = :meId) ORDER BY m.sentAt ASC")
    List<Message> findConversation(@Param("me") Utilisateur me, @Param("other") Utilisateur other, @Param("meId") Long meId, @Param("otherId") Long otherId);

    void deleteBySender_IdOrSendTo(Long senderId, Long sendTo);
}
