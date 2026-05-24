package com.minilinkedin.mini_linkedin.repository;

import com.minilinkedin.mini_linkedin.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnseignantRepository extends JpaRepository<Enseignant, Long> {
    List<Enseignant> findBySpecialiteContainingIgnoreCaseAndEstValideTrue(String specialite);
}