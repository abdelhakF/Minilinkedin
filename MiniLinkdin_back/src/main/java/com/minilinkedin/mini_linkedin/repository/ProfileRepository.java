package com.minilinkedin.mini_linkedin.repository;

import com.minilinkedin.mini_linkedin.model.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, Long> {
	Optional<Profile> findByUtilisateur_Id(Long userId);
    Optional<Profile> findByUtilisateurId(Long utilisateurId);
}