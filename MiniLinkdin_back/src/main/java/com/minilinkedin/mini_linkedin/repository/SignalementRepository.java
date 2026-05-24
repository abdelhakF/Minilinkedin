package com.minilinkedin.mini_linkedin.repository;

import com.minilinkedin.mini_linkedin.model.Signalement;
import com.minilinkedin.mini_linkedin.model.SignalementStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SignalementRepository extends JpaRepository<Signalement, Long> {

    List<Signalement> findAllByOrderByCreatedAtDesc();

    List<Signalement> findByStatusOrderByCreatedAtDesc(SignalementStatus status);

    long countByStatus(SignalementStatus status);

    void deleteByPost_Id(Long postId);

    void deleteByReporter_Id(Long reporterId);
}
