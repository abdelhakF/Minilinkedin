package com.minilinkedin.mini_linkedin.repository;

import com.minilinkedin.mini_linkedin.model.Education;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EducationRepository extends JpaRepository<Education, Long> {
}