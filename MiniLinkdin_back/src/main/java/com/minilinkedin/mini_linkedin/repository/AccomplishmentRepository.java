package com.minilinkedin.mini_linkedin.repository;

import com.minilinkedin.mini_linkedin.model.Accomplishment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AccomplishmentRepository extends JpaRepository<Accomplishment, Long> {
}