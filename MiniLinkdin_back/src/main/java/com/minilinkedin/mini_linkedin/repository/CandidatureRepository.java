package com.minilinkedin.mini_linkedin.repository;

import com.minilinkedin.mini_linkedin.model.Candidature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CandidatureRepository extends JpaRepository<Candidature, Long> {

    List<Candidature> findByPostId(Long postId);

    List<Candidature> findByEtudiantId(Long etudiantId);

    // ✅ Voici la méthode manquante qui corrige ton erreur :
    List<Candidature> findByPostIdIn(List<Long> postIds);

    void deleteByEtudiant_Id(Long etudiantId);
}