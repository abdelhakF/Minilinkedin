package com.minilinkedin.mini_linkedin.service;

import com.minilinkedin.mini_linkedin.dto.SignalementRequest;
import com.minilinkedin.mini_linkedin.model.Post;
import com.minilinkedin.mini_linkedin.model.Signalement;
import com.minilinkedin.mini_linkedin.model.SignalementStatus;
import com.minilinkedin.mini_linkedin.model.Utilisateur;
import com.minilinkedin.mini_linkedin.repository.PostRepository;
import com.minilinkedin.mini_linkedin.repository.SignalementRepository;
import com.minilinkedin.mini_linkedin.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SignalementService {

    private final SignalementRepository signalementRepository;
    private final PostRepository postRepository;
    private final UtilisateurRepository utilisateurRepository;

    public Signalement createSignalement(SignalementRequest request, String reporterEmail) {
        Utilisateur reporter = utilisateurRepository.findByEmail(reporterEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé : " + reporterEmail));
        Post post = postRepository.findById(request.postId())
                .orElseThrow(() -> new RuntimeException("Post non trouvé avec l'ID : " + request.postId()));

        Signalement signalement = new Signalement();
        signalement.setReporter(reporter);
        signalement.setPost(post);
        signalement.setMotif(request.motif());
        signalement.setStatus(SignalementStatus.PENDING);

        return signalementRepository.save(signalement);
    }

    public List<Signalement> getAllSignalements() {
        return signalementRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Signalement> getSignalementsByStatus(SignalementStatus status) {
        return signalementRepository.findByStatusOrderByCreatedAtDesc(status);
    }

    public Signalement resolveSignalement(Long id, boolean deletePost) {
        Signalement signalement = signalementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Signalement non trouvé avec l'ID : " + id));

        signalement.setStatus(SignalementStatus.RESOLVED);
        signalement.setResolvedAt(LocalDateTime.now());

        if (deletePost && signalement.getPost() != null) {
            Long postId = signalement.getPost().getId();
            signalement.setPost(null);
            signalementRepository.save(signalement);
            postRepository.deleteById(postId);
            return signalement;
        }

        return signalementRepository.save(signalement);
    }

    public Signalement rejectSignalement(Long id) {
        Signalement signalement = signalementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Signalement non trouvé avec l'ID : " + id));
        signalement.setStatus(SignalementStatus.REJECTED);
        signalement.setResolvedAt(LocalDateTime.now());
        return signalementRepository.save(signalement);
    }

    public void deleteSignalement(Long id) {
        if (!signalementRepository.existsById(id)) {
            throw new RuntimeException("Signalement non trouvé avec l'ID : " + id);
        }
        signalementRepository.deleteById(id);
    }
}
