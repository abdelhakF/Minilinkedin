package com.minilinkedin.mini_linkedin.repository;

import com.minilinkedin.mini_linkedin.model.Etablissement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EtablissementRepository extends JpaRepository<Etablissement, Long> {

    Optional<Etablissement> findByNomIgnoreCase(String nom);

    boolean existsByNomIgnoreCase(String nom);

    List<Etablissement> findAllByOrderByNomAsc();
}
