package com.minilinkedin.mini_linkedin.repository;

import com.minilinkedin.mini_linkedin.model.Comment;
import com.minilinkedin.mini_linkedin.model.Post;
import com.minilinkedin.mini_linkedin.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    // Commentaires d'un post triés du plus récent
    List<Comment> findByPostOrderByCreatedAtDesc(Post post);

    // Commentaires d'un utilisateur
    List<Comment> findByUser(Utilisateur user);

    // Nombre de commentaires sur un post
    long countByPost(Post post);

    // Les 5 derniers commentaires
    List<Comment> findTop5ByPostOrderByCreatedAtDesc(Post post);

    void deleteByUser_Id(Long userId);
}