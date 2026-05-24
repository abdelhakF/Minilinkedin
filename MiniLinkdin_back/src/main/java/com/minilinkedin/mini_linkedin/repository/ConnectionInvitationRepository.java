package com.minilinkedin.mini_linkedin.repository;

import com.minilinkedin.mini_linkedin.model.*;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConnectionInvitationRepository extends CrudRepository<ConnectionInvitation, Long> {

    Optional<ConnectionInvitation> findBySenderAndSentTo(Utilisateur sender, Long sentTo);

    List<ConnectionInvitation> findBySentToAndStatus(Long sentTo, ConnectionInvitationStatus status);

    List<ConnectionInvitation> findBySenderAndStatus(Utilisateur sender, ConnectionInvitationStatus status);

    @Query("SELECT c FROM ConnectionInvitation c WHERE c.status = 'ACCEPTED' AND (c.sender = :user OR c.sentTo = :userId)")
    List<ConnectionInvitation> findAllConnectionsOf(@Param("user") Utilisateur user, @Param("userId") Long userId);

    void deleteBySender_IdOrSentTo(Long senderId, Long sentTo);
}
