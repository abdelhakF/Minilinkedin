package com.minilinkedin.mini_linkedin.repository;

import com.minilinkedin.mini_linkedin.model.Domaine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DomaineRepository extends JpaRepository<Domaine, Long> {

    Optional<Domaine> findByNomIgnoreCase(String nom);

    boolean existsByNomIgnoreCase(String nom);

    List<Domaine> findAllByOrderByNomAsc();
}
