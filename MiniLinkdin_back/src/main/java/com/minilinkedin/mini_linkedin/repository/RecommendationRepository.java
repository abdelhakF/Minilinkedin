package com.minilinkedin.mini_linkedin.repository;

import com.minilinkedin.mini_linkedin.model.Recommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {
}