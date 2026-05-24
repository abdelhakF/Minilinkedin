// src/main/java/com/minilinkedin/mini_linkedin/repository/PostShareRepository.java
package com.minilinkedin.mini_linkedin.repository;

import com.minilinkedin.mini_linkedin.model.PostShare;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostShareRepository extends JpaRepository<PostShare, Long> {
	void deleteByUser_Id(Long userId);
}