/*
 * Service pour la gestion du profil utilisateur
 */
package com.minilinkedin.mini_linkedin.service;

import com.minilinkedin.mini_linkedin.model.*;
import com.minilinkedin.mini_linkedin.repository.ProfileRepository;
import com.minilinkedin.mini_linkedin.repository.UtilisateurRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.minilinkedin.mini_linkedin.exception.DuplicateEntryException;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final NotificationService notificationService;

    // ====================== CRUD PROFIL ======================

    public Profile createProfile(Profile profile) {

        // 1. Récupérer automatiquement l'utilisateur connecté via JWT
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur connecté introuvable"));

        // 2. Liaison bidirectionnelle Profil ↔ Utilisateur
        profile.setUtilisateur(utilisateur);
        utilisateur.setProfile(profile);

        // 3. Stats par défaut
        if (profile.getStats() == null) {
            profile.setStats(new Stats());
        }

        // 4. Institution par défaut
        if (profile.getInstitution() == null || profile.getInstitution().trim().isEmpty()) {
            profile.setInstitution(utilisateur.getInstitution() != null ? utilisateur.getInstitution() : "Non renseignée");
        }

        // 5. Sauvegarde
        Profile savedProfile = profileRepository.save(profile);
        utilisateurRepository.save(utilisateur);   // mise à jour de la relation côté utilisateur

        return savedProfile;
    }

    // ====================== LES AUTRES MÉTHODES RESTENT IDENTIQUES ======================
    // (getProfileById, updateProfile, addExperience, etc.)
    // Je ne les recopie pas ici pour ne pas alourdir le message, tout le reste de ton code est inchangé.

    public Profile getProfileById(Long id) {
        Profile profile = profileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profil introuvable"));

        Utilisateur proprietaire = profile.getUtilisateur();
        Utilisateur visiteur = null;
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            visiteur = utilisateurRepository.findByEmail(email).orElse(null);
        }

        if (proprietaire != null && visiteur != null) {
            notificationService.creerNotificationVisite(visiteur, proprietaire);

            if (profile.getStats() != null && !visiteur.getId().equals(proprietaire.getId())) {
                profile.getStats().setTotalViews(profile.getStats().getTotalViews() + 1);
                profileRepository.save(profile);
            }
        }
        return profile;
    }

    public Profile updateProfile(Long id, Profile updatedProfile) {
        Profile existing = getProfileById(id);

        existing.setSummary(updatedProfile.getSummary());
        existing.setHeadline(updatedProfile.getHeadline());
        existing.setPhotoUrl(updatedProfile.getPhotoUrl());
        existing.setInstitution(updatedProfile.getInstitution());

        return profileRepository.save(existing);
    }

    public void deleteProfile(Long id) {
        Profile profile = profileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profil introuvable"));

        // Détacher le profil de l'utilisateur pour éviter les conflits de cascade
        if (profile.getUtilisateur() != null) {
            Utilisateur utilisateur = profile.getUtilisateur();
            utilisateur.setProfile(null);
            utilisateurRepository.save(utilisateur);
        }

        // Ensuite supprimer le profil
        profileRepository.deleteById(id);
    }

    // ====================== GESTION DES SECTIONS ======================

  public Profile addExperience(Long profileId, Experience experience) {
    Profile profile = getProfileById(profileId);

    boolean existeDeja = profile.getExperiences().stream()
            .anyMatch(exp ->
                exp.getTitle().equalsIgnoreCase(experience.getTitle()) &&
                exp.getCompany().equalsIgnoreCase(experience.getCompany()) &&
                exp.getFrom() != null &&
                exp.getFrom().equals(experience.getFrom())
            );

    if (existeDeja) {
        throw new DuplicateEntryException("Cette expérience existe déjà dans votre profil");
    }

    Experience newExp = new Experience();
    newExp.setTitle(experience.getTitle());
    newExp.setCompany(experience.getCompany());
    newExp.setLocation(experience.getLocation());
    newExp.setFrom(experience.getFrom());
    newExp.setTo(experience.getTo());
    newExp.setDescription(experience.getDescription());

    profile.getExperiences().add(newExp);
    return profileRepository.save(profile);
    }
  
    public Profile addEducation(Long profileId, Education education) {
    Profile profile = getProfileById(profileId);

    // Anti-duplication : Ne pas ajouter deux fois la même formation
    boolean existeDeja = profile.getEducations().stream()
            .anyMatch(edu -> 
                edu.getSchool().equalsIgnoreCase(education.getSchool()) &&
                edu.getDegree() != null && 
                edu.getDegree().equalsIgnoreCase(education.getDegree()) &&
                edu.getFromYear().equals(education.getFromYear())
            );

    if (existeDeja) {
        throw new RuntimeException("Cette formation existe déjà dans votre profil");
    }

    profile.getEducations().add(education);
    return profileRepository.save(profile);
    }

    public Profile addSkill(Long profileId, Skill skill) {
    Profile profile = getProfileById(profileId);

    // Vérification anti-duplication SUR LE MÊME PROFIL
    boolean existeDeja = profile.getSkills().stream()
            .anyMatch(s -> s.getName().equalsIgnoreCase(skill.getName()));

    if (existeDeja) {
        throw new RuntimeException("Cette compétence existe déjà dans votre profil");
    }

    profile.getSkills().add(skill);
    return profileRepository.save(profile);
}

    public Profile addAccomplishment(Long profileId, Accomplishment accomplishment) {
        Profile profile = getProfileById(profileId);
        profile.getAccomplishments().add(accomplishment);
        return profileRepository.save(profile);
    }

    // Récupérer toutes les expériences d'un profil
    public List<Experience> getExperiences(Long profileId) {
        Profile profile = getProfileById(profileId);
        return List.copyOf(profile.getExperiences());
    }
    
    // ====================== SUPPRESSION ======================

public Profile removeExperience(Long profileId, Long experienceId) {
    Profile profile = getProfileById(profileId);
    profile.getExperiences().removeIf(exp -> exp.getId().equals(experienceId));
    return profileRepository.save(profile);
}

public Profile removeEducation(Long profileId, Long educationId) {
    Profile profile = getProfileById(profileId);
    profile.getEducations().removeIf(edu -> edu.getId().equals(educationId));
    return profileRepository.save(profile);
}

public Profile removeSkill(Long profileId, Long skillId) {
    Profile profile = getProfileById(profileId);
    profile.getSkills().removeIf(skill -> skill.getId().equals(skillId));
    return profileRepository.save(profile);
}

public Profile removeAccomplishment(Long profileId, Long accomplishmentId) {
    Profile profile = getProfileById(profileId);
    profile.getAccomplishments().removeIf(acc -> acc.getId().equals(accomplishmentId));
    return profileRepository.save(profile);
}

// ====================== MISE À JOUR ======================

public Profile updateExperience(Long profileId, Long experienceId, Experience updatedExperience) {
    Profile profile = getProfileById(profileId);
    
    profile.getExperiences().stream()
            .filter(exp -> exp.getId().equals(experienceId))
            .findFirst()
            .ifPresent(exp -> {
                exp.setTitle(updatedExperience.getTitle());
                exp.setCompany(updatedExperience.getCompany());
                exp.setLocation(updatedExperience.getLocation());
                exp.setFrom(updatedExperience.getFrom());
                exp.setTo(updatedExperience.getTo());
                exp.setDescription(updatedExperience.getDescription());
            });
    
    return profileRepository.save(profile);
}

public Profile updateEducation(Long profileId, Long educationId, Education updatedEducation) {
    Profile profile = getProfileById(profileId);
    
    profile.getEducations().stream()
            .filter(edu -> edu.getId().equals(educationId))
            .findFirst()
            .ifPresent(edu -> {
                edu.setSchool(updatedEducation.getSchool());
                edu.setDegree(updatedEducation.getDegree());
                edu.setFromYear(updatedEducation.getFromYear());
                edu.setToYear(updatedEducation.getToYear());
                edu.setDescription(updatedEducation.getDescription());
            });
    
    return profileRepository.save(profile);
}

    public Profile updateSkill(Long profileId, Long skillId, Skill updatedSkill) {
        Profile profile = getProfileById(profileId);

        profile.getSkills().stream()
                .filter(skill -> skill.getId().equals(skillId))
                .findFirst()
                .ifPresent(skill -> {
                    skill.setName(updatedSkill.getName());
                    skill.setLevel(updatedSkill.getLevel());   // ← AJOUTEZ CETTE LIGNE
                });

        return profileRepository.save(profile);
    }

public Profile updateAccomplishment(Long profileId, Long accomplishmentId, Accomplishment updatedAccomplishment) {
    Profile profile = getProfileById(profileId);
    
    profile.getAccomplishments().stream()
            .filter(acc -> acc.getId().equals(accomplishmentId))
            .findFirst()
            .ifPresent(acc -> {
                acc.setTitle(updatedAccomplishment.getTitle());
                acc.setDate(updatedAccomplishment.getDate());
                acc.setDescription(updatedAccomplishment.getDescription());
            });
    
    return profileRepository.save(profile);
}

    // ====================== RÉCUPÉRATION DES AUTRES SECTIONS ======================

    public List<Education> getEducations(Long profileId) {
        Profile profile = getProfileById(profileId);
        return List.copyOf(profile.getEducations());
    }

    public List<Skill> getSkills(Long profileId) {
        Profile profile = getProfileById(profileId);
        return List.copyOf(profile.getSkills());
    }

    public List<Accomplishment> getAccomplishments(Long profileId) {
        Profile profile = getProfileById(profileId);
        return List.copyOf(profile.getAccomplishments());
    }
    
    // ====================== RECOMMENDATIONS (F09) ======================

    public List<Recommendation> getRecommendations(Long profileId) {
        Profile profile = getProfileById(profileId);
        return List.copyOf(profile.getRecommendations());
    }

    public Profile addRecommendation(Long profileId, Recommendation recommendation) {
        Profile profile = getProfileById(profileId);
        recommendation.setProfile(profile);
        profile.getRecommendations().add(recommendation);
        Profile savedProfile = profileRepository.save(profile); // la recommandation est persistée

        Utilisateur proprietaire = profile.getUtilisateur();
        if (proprietaire != null) {
            String message = recommendation.getRecommenderName() + " vous a envoyé une recommandation.";
            Notification notif = notificationService.envoyerNotification(
                    proprietaire,
                    NotificationType.RECOMMENDATION,
                    recommendation.getId(),
                    message
            );
            // Associer la notification à la recommandation
            recommendation.setNotification(notif);   // suppose que Recommendation a un champ notification (vous l'avez déjà)
            // comme la recommandation est déjà gérée par le cascade, vous pouvez la sauvegarder
            profileRepository.save(savedProfile);  // ou bien sauvegarder explicitement la recommandation
        }

        return savedProfile;
    }

    public Profile acceptRecommendation(Long profileId, Long recommendationId) {
        Profile profile = getProfileById(profileId);
        profile.getRecommendations().stream()
                .filter(r -> r.getId().equals(recommendationId))
                .findFirst()
                .ifPresent(r -> r.setStatus(RecommendationStatus.ACCEPTED));
        return profileRepository.save(profile);
    }

    public Profile rejectRecommendation(Long profileId, Long recommendationId) {
        Profile profile = getProfileById(profileId);
        profile.getRecommendations().stream()
                .filter(r -> r.getId().equals(recommendationId))
                .findFirst()
                .ifPresent(r -> r.setStatus(RecommendationStatus.REJECTED));
        return profileRepository.save(profile);
    }
    // ====================== NOUVELLE MÉTHODE ======================
    public Profile getProfileByUserId(Long userId) {
        Profile profile = profileRepository.findByUtilisateurId(userId)
                .orElseThrow(() -> new RuntimeException("Profil introuvable pour cet utilisateur"));

        Utilisateur proprietaire = profile.getUtilisateur();
        Utilisateur visiteur = null;
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            visiteur = utilisateurRepository.findByEmail(email).orElse(null);
        }

        if (proprietaire != null && visiteur != null) {
            notificationService.creerNotificationVisite(visiteur, proprietaire);

            if (profile.getStats() != null && !visiteur.getId().equals(proprietaire.getId())) {
                profile.getStats().setTotalViews(profile.getStats().getTotalViews() + 1);
                profileRepository.save(profile);
            }
        }

        return profile;
    }

} 
