package com.minilinkedin.mini_linkedin.repository;

import com.minilinkedin.mini_linkedin.model.Experience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExperienceRepository extends JpaRepository<Experience, Long> {
}