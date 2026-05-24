package com.minilinkedin.mini_linkedin.repository;

import com.minilinkedin.mini_linkedin.model.*;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UtilisateurRepository extends CrudRepository<Utilisateur, Long> {
    Optional<Utilisateur> findByEmail(String email);

    boolean existsByEmail(String email);

    Utilisateur findByAccount_ResetPasswordToken(String token);

    // Module 4 — Recherche par nom (insensible à la casse)
    @Query("SELECT u FROM Utilisateur u WHERE LOWER(u.nom) LIKE LOWER(CONCAT('%', :nom, '%'))")
    List<Utilisateur> searchByNom(@Param("nom") String nom);

    // Module 4 — Filtrer par rôle
    List<Utilisateur> findByRoleEnum(TypeRole role);

    // Module 4 — Enseignants validés par spécialité
    @Query("SELECT e FROM Enseignant e WHERE " +
            "LOWER(e.specialite) LIKE LOWER(CONCAT('%', :specialite, '%')) " +
            "AND e.estValide = true")
    List<Enseignant> searchEnseignantBySpecialite(@Param("specialite") String specialite);

    // Module 4 — Recherche par institution
    @Query("SELECT u FROM Utilisateur u WHERE LOWER(u.institution) LIKE LOWER(CONCAT('%', :institution, '%'))")
    List<Utilisateur> searchByInstitution(@Param("institution") String institution);

    // F24 — Statistiques (ajouté par ton ami·e)
    long countByDateInscriptionAfter(LocalDateTime since);

    long countByRoleEnum(TypeRole role);

    @Query("SELECT u FROM Utilisateur u WHERE u.dateInscription >= :since")
    List<Utilisateur> findRegisteredSince(@Param("since") LocalDateTime since);
}