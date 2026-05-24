package com.minilinkedin.mini_linkedin.repository;

import com.minilinkedin.mini_linkedin.model.Stats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StatsRepository extends JpaRepository<Stats, Long> {
}