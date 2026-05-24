package com.minilinkedin.mini_linkedin.service;

import com.minilinkedin.mini_linkedin.dto.DashboardStatsDTO;
import com.minilinkedin.mini_linkedin.model.AccountStatus;
import com.minilinkedin.mini_linkedin.model.Enseignant;
import com.minilinkedin.mini_linkedin.model.Post;
import com.minilinkedin.mini_linkedin.model.SignalementStatus;
import com.minilinkedin.mini_linkedin.model.TypeRole;
import com.minilinkedin.mini_linkedin.model.Utilisateur;
import com.minilinkedin.mini_linkedin.repository.CandidatureRepository;
import com.minilinkedin.mini_linkedin.repository.CommentRepository;
import com.minilinkedin.mini_linkedin.repository.ConnectionInvitationRepository;
import com.minilinkedin.mini_linkedin.repository.EnseignantRepository;
import com.minilinkedin.mini_linkedin.repository.MessageRepository;
import com.minilinkedin.mini_linkedin.repository.NotificationRepository;
import com.minilinkedin.mini_linkedin.repository.PostLikeRepository;
import com.minilinkedin.mini_linkedin.repository.PostRepository;
import com.minilinkedin.mini_linkedin.repository.PostShareRepository;
import com.minilinkedin.mini_linkedin.repository.ProfileRepository;
import com.minilinkedin.mini_linkedin.repository.SignalementRepository;
import com.minilinkedin.mini_linkedin.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.StreamSupport;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminService {

    private final UtilisateurRepository utilisateurRepository;
    private final EnseignantRepository enseignantRepository;
    private final PostRepository postRepository;
    private final NotificationRepository notificationRepository;
    private final MessageRepository messageRepository;
    private final ConnectionInvitationRepository connectionInvitationRepository;
    private final CommentRepository commentRepository;
    private final PostLikeRepository postLikeRepository;
    private final PostShareRepository postShareRepository;
    private final CandidatureRepository candidatureRepository;
    private final ProfileRepository profileRepository;
    private final SignalementRepository signalementRepository;   // ✅ ajouté

    // --- Statistiques (F24) ---
    public DashboardStatsDTO getDashboardStats() {
        long totalUsers = utilisateurRepository.count();
        long totalPosts = postRepository.count();
        long totalTeachers = enseignantRepository.count();

        // ✅ Enseignants en attente de validation
        long pendingTeachers = StreamSupport.stream(enseignantRepository.findAll().spliterator(), false)
                .filter(e -> !Boolean.TRUE.equals(e.getEstValide()))
                .count();
        // ✅ Signalements en attente
        long pendingSignalements = signalementRepository.countByStatus(SignalementStatus.PENDING);

        LocalDateTime sevenDaysAgoDateTime = LocalDateTime.now().minusDays(7);
        LocalDate sevenDaysAgoDate = LocalDate.now().minusDays(6); // 7 jours incluant aujourd'hui

        long newUsersLast7Days = utilisateurRepository.countByDateInscriptionAfter(sevenDaysAgoDateTime);
        long postsLast7Days = postRepository.countByDatePublicationGreaterThanEqual(sevenDaysAgoDate);

        // Répartition par rôle
        Map<String, Long> usersByRole = new java.util.LinkedHashMap<>();
        for (TypeRole role : TypeRole.values()) {
            usersByRole.put(role.name(), utilisateurRepository.countByRoleEnum(role));
        }

        // Séries quotidiennes (utilisateurs et posts)
        List<DashboardStatsDTO.DailyCount> usersSeries = buildUserSeries(sevenDaysAgoDateTime);
        List<DashboardStatsDTO.DailyCount> postsSeries = buildPostSeries(sevenDaysAgoDate);

        return new DashboardStatsDTO(
                totalUsers,
                totalPosts,
                totalTeachers,
                pendingTeachers,
                pendingSignalements,
                newUsersLast7Days,
                postsLast7Days,
                usersByRole,
                usersSeries,
                postsSeries
        );
    }

    // ✅ Méthodes privées de construction des séries
    private List<DashboardStatsDTO.DailyCount> buildUserSeries(LocalDateTime since) {
        Map<LocalDate, Long> byDay = new java.util.HashMap<>();
        for (Utilisateur u : utilisateurRepository.findRegisteredSince(since)) {
            if (u.getDateInscription() == null) continue;
            LocalDate day = u.getDateInscription().toLocalDate();
            byDay.merge(day, 1L, Long::sum);
        }
        return last7DaysSeries(LocalDate.now(), byDay);
    }

    private List<DashboardStatsDTO.DailyCount> buildPostSeries(LocalDate since) {
        Map<LocalDate, Long> byDay = new java.util.HashMap<>();
        for (Post p : postRepository.findPublishedSince(since)) {
            if (p.getDatePublication() == null) continue;
            byDay.merge(LocalDate.from(p.getDatePublication()), 1L, Long::sum);
        }
        return last7DaysSeries(LocalDate.now(), byDay);
    }

    private List<DashboardStatsDTO.DailyCount> last7DaysSeries(LocalDate today, Map<LocalDate, Long> byDay) {
        List<DashboardStatsDTO.DailyCount> series = new ArrayList<>(7);
        for (int i = 6; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            series.add(new DashboardStatsDTO.DailyCount(day.toString(), byDay.getOrDefault(day, 0L)));
        }
        return series;
    }

    // --- Gestion des Utilisateurs ---
    public List<Utilisateur> getAllUsers() {
        return StreamSupport.stream(utilisateurRepository.findAll().spliterator(), false).toList();
    }

    public Utilisateur getUserById(Long userId) {
        return utilisateurRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'ID : " + userId));
    }

    public Enseignant validateEnseignant(Long enseignantId) {
        Enseignant enseignant = enseignantRepository.findById(enseignantId)
                .orElseThrow(() -> new RuntimeException("Enseignant non trouvé avec l'ID : " + enseignantId));
        enseignant.setEstValide(true);
        return enseignantRepository.save(enseignant);
    }

    public Utilisateur banUser(Long userId) {
        return updateUserStatus(userId, AccountStatus.BANNED);
    }

    public Utilisateur unbanUser(Long userId) {
        return updateUserStatus(userId, AccountStatus.ACTIVE);
    }

    public void deleteUser(Long userId) {
        Utilisateur user = utilisateurRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'ID : " + userId));

        // Nettoyage des relations qui ne sont pas couvertes par des cascades sûres.
        notificationRepository.deleteByRecipient_Id(userId);
        connectionInvitationRepository.deleteBySender_IdOrSentTo(userId, userId);
        postLikeRepository.deleteByUser_Id(userId);
        postShareRepository.deleteByUser_Id(userId);
        commentRepository.deleteByUser_Id(userId);
        candidatureRepository.deleteByEtudiant_Id(userId);
        messageRepository.deleteBySender_IdOrSendTo(userId, userId);
        // ✅ Nettoyage signalements liés au reporter
        signalementRepository.deleteByReporter_Id(userId);
        // ✅ Supprimer les signalements associés aux posts de l'utilisateur avant de supprimer les posts
        postRepository.findByAuteurId(userId)
                .forEach(p -> signalementRepository.deleteByPost_Id(p.getId()));
        postRepository.deleteByAuteurId(userId);

        // Détache puis supprime le profil si présent pour éviter les références croisées.
        profileRepository.findByUtilisateur_Id(userId).ifPresent(profile -> {
            user.setProfile(null);
            profile.setUtilisateur(null);
            utilisateurRepository.save(user);
            profileRepository.save(profile);
            profileRepository.delete(profile);
        });

        utilisateurRepository.delete(user);
    }

    // --- Gestion de Contenu ---
    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    public void deletePost(Long postId) {
        if (!postRepository.existsById(postId)) {
            throw new RuntimeException("Post non trouvé avec l'ID : " + postId);
        }
        // ✅ Supprimer les signalements liés au post avant suppression
        signalementRepository.deleteByPost_Id(postId);
        postRepository.deleteById(postId);
    }

    // --- Méthode privée utilitaire ---
    private Utilisateur updateUserStatus(Long userId, AccountStatus status) {
        Utilisateur user = utilisateurRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'ID : " + userId));
        if (user.getAccount() != null) {
            user.getAccount().setStatus(status);
            return utilisateurRepository.save(user);
        }
        throw new IllegalStateException("L'utilisateur n'a pas de compte associé.");
    }
}