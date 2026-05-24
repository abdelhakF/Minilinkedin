package com.minilinkedin.mini_linkedin.repository;

import com.minilinkedin.mini_linkedin.model.Post;
import com.minilinkedin.mini_linkedin.model.PostLike;
import com.minilinkedin.mini_linkedin.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    Optional<PostLike> findByPostAndUser(Post post, Utilisateur user);

    boolean existsByPostAndUser(Post post, Utilisateur user);

    void deleteByUser_Id(Long userId);
}