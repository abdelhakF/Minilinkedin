package com.minilinkedin.mini_linkedin.repository;

import com.minilinkedin.mini_linkedin.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findByAuteurId(Long auteurId);

    List<Post> findByAuteurEmailOrderByDatePublicationDesc(String email);

    void deleteByAuteurId(Long auteurId);

    List<Post> findAllByOrderByDatePublicationDesc();

    List<Post> findTop20ByOrderByDatePublicationDesc();

    /**
     * Recherche par mot-clé dans titre et description
     */
    @Query("SELECT p FROM Post p WHERE " +
            "LOWER(p.titre) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "ORDER BY p.datePublication DESC")
    List<Post> searchByKeyword(@Param("keyword") String keyword);

    // ===================================================================
    // MÉTHODES SPÉCIFIQUES POUR SearchService (remplace findByType)
    // ===================================================================

    /**
     * Retourne toutes les Offres de Stage (triées par date récente)
     */
    @Query("SELECT o FROM OffreStage o ORDER BY o.datePublication DESC")
    List<OffreStage> getOffresStage();

    /**
     * Retourne tous les Sujets de Thèse (triés par date récente)
     */
    @Query("SELECT s FROM SujetThese s ORDER BY s.datePublication DESC")
    List<SujetThese> getSujetsThese();

    /**
     * Retourne tous les Projets Tutores (triés par date récente)
     */
    @Query("SELECT p FROM ProjetTuteure p ORDER BY p.datePublication DESC")
    List<ProjetTuteure> getProjetsTutores();

    /**
     * (Optionnel) Recherche par type avec TYPE() - en cas de besoin futur
     */
    @Query("SELECT p FROM Post p WHERE TYPE(p) = :type")
    List<Post> findByType(@Param("type") Class<?> type);

    List<Post> findByTypeOrderByDatePublicationDesc(PostType type);

    // ==================== STATISTIQUES (ajouté par ton ami·e) ====================

    long countByDatePublicationAfter(LocalDate since);

    long countByDatePublicationGreaterThanEqual(LocalDate since);

    @Query("SELECT p FROM Post p WHERE p.datePublication >= :since")
    List<Post> findPublishedSince(@Param("since") LocalDate since);
}