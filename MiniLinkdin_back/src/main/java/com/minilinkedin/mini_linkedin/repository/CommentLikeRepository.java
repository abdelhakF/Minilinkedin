package com.minilinkedin.mini_linkedin.repository;

import com.minilinkedin.mini_linkedin.model.Comment;
import com.minilinkedin.mini_linkedin.model.CommentLike;
import com.minilinkedin.mini_linkedin.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CommentLikeRepository extends JpaRepository<CommentLike, Long> {
    boolean existsByCommentAndUser(Comment comment, Utilisateur user);
    Optional<CommentLike> findByCommentAndUser(Comment comment, Utilisateur user);
}