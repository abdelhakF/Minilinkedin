// repository/RepostRepository.java
package com.minilinkedin.mini_linkedin.repository;

import com.minilinkedin.mini_linkedin.model.Repost;
import com.minilinkedin.mini_linkedin.model.Utilisateur;
import com.minilinkedin.mini_linkedin.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface RepostRepository extends JpaRepository<Repost, Long> {
    List<Repost> findByReposter(Utilisateur reposter);
    Optional<Repost> findByOriginalPostAndReposter(Post originalPost, Utilisateur reposter);
    void deleteByOriginalPostAndReposter(Post originalPost, Utilisateur reposter);
    @Modifying
    @Transactional
    @Query("DELETE FROM Repost r WHERE r.originalPost = :originalPost")
    void deleteByOriginalPost(@Param("originalPost") Post originalPost);
}