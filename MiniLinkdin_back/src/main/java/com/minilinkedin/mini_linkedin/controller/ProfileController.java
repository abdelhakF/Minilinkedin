/*
 * Controller pour la gestion du Profil Utilisateur
 */
package com.minilinkedin.mini_linkedin.controller;

import com.minilinkedin.mini_linkedin.model.*;
import com.minilinkedin.mini_linkedin.repository.UtilisateurRepository;
import com.minilinkedin.mini_linkedin.service.ProfileService;
import com.minilinkedin.mini_linkedin.dto.ProfileRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")   // À modifier en production
public class ProfileController {

    private final ProfileService profileService;
    private final UtilisateurRepository utilisateurRepository;

    // ====================== PROFIL DE BASE ======================

    @PostMapping
    public ResponseEntity<Profile> createProfile(@RequestBody ProfileRequest profileRequest) {

        // Récupérer l'utilisateur connecté
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();  // L'email de l'utilisateur authentifié

        // Chercher l'utilisateur dans la base
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'email: " + email));
        if (utilisateur.getProfile() != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        // Créer le profil à partir du DTO
        Profile profile = new Profile();
        profile.setSummary(profileRequest.getSummary());
        profile.setHeadline(profileRequest.getHeadline());
        profile.setPhotoUrl(profileRequest.getPhotoUrl());
        profile.setInstitution(profileRequest.getInstitution());
        profile.setExperiences(profileRequest.getExperiences());
        profile.setEducations(profileRequest.getEducations());
        profile.setSkills(profileRequest.getSkills());
        profile.setAccomplishments(profileRequest.getAccomplishments());
        profile.setStats(profileRequest.getStats());

        // Lier le profil à l'utilisateur
        profile.setUtilisateur(utilisateur);
        Profile savedProfile = profileService.createProfile(profile);

        // Mettre à jour l'utilisateur avec le profil créé
        utilisateur.setProfile(savedProfile);

        System.out.println(profileRequest.getNiveauEtude());

        // Mettre à jour les champs spécifiques selon le type d'utilisateur
        if (utilisateur.getRoleEnum() == TypeRole.ETUDIANT && profileRequest.getNiveauEtude() != null) {
            // Il faut charger à nouveau l'utilisateur en tant que Etudiant pour éviter les problèmes de casting JPA
            Etudiant etudiant = (Etudiant) utilisateurRepository.findById((long) utilisateur.getId())
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
            etudiant.setNiveauEtude(profileRequest.getNiveauEtude());
            etudiant.setProfile(savedProfile);
            utilisateurRepository.save(etudiant);
        } else if (utilisateur.getRoleEnum() == TypeRole.ENSEIGNANT && profileRequest.getSpecialite() != null) {
            // Il faut charger à nouveau l'utilisateur en tant qu'Enseignant
            Enseignant enseignant = (Enseignant) utilisateurRepository.findById((long) utilisateur.getId())
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
            enseignant.setSpecialite(profileRequest.getSpecialite());
            enseignant.setProfile(savedProfile);
            utilisateurRepository.save(enseignant);
        } else {
            utilisateurRepository.save(utilisateur);
        }

        return new ResponseEntity<>(savedProfile, HttpStatus.CREATED);
    }

    @GetMapping("/me")
    public ResponseEntity<Profile> getMyProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (utilisateur.getProfile() == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        return ResponseEntity.ok(utilisateur.getProfile());
    }


    @GetMapping("/{id}")
    public ResponseEntity<Profile> getProfile(@PathVariable Long id) {
        // 👈 Modification ici : on utilise une méthode qui cherche par Utilisateur ID
        Profile profile = profileService.getProfileByUserId(id);

        return ResponseEntity.ok(profile);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Profile> updateProfile(@PathVariable Long id, 
                                                 @RequestBody Profile updatedProfile) {
        Profile profile = profileService.updateProfile(id, updatedProfile);
        return ResponseEntity.ok(profile);
    }

    // ====================== AJOUT DES SECTIONS ======================

    @PostMapping("/{profileId}/experience")
    public ResponseEntity<Profile> addExperience(@PathVariable Long profileId,
                                                 @RequestBody Experience experience) {
        Profile profile = profileService.addExperience(profileId, experience);
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/{profileId}/education")
    public ResponseEntity<Profile> addEducation(@PathVariable Long profileId,
                                                @RequestBody Education education) {
        Profile profile = profileService.addEducation(profileId, education);
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/{profileId}/skill")
    public ResponseEntity<Profile> addSkill(@PathVariable Long profileId,
                                            @RequestBody Skill skill) {
        Profile profile = profileService.addSkill(profileId, skill);
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/{profileId}/accomplishment")
    public ResponseEntity<Profile> addAccomplishment(@PathVariable Long profileId,
                                                     @RequestBody Accomplishment accomplishment) {
        Profile profile = profileService.addAccomplishment(profileId, accomplishment);
        return ResponseEntity.ok(profile);
    }

    // ====================== RÉCUPÉRATION ======================

    @GetMapping("/{profileId}/experiences")
    public ResponseEntity<List<Experience>> getExperiences(@PathVariable Long profileId) {
        List<Experience> experiences = profileService.getExperiences(profileId);
        return ResponseEntity.ok(experiences);
    }
    
    // ====================== SUPPRESSION ======================

    @DeleteMapping("/{profileId}/experience/{experienceId}")
    public ResponseEntity<Profile> removeExperience(
            @PathVariable Long profileId,
            @PathVariable Long experienceId) {

        Profile profile = profileService.removeExperience(profileId, experienceId);
        return ResponseEntity.ok(profile);
    }

    @DeleteMapping("/{profileId}/education/{educationId}")
    public ResponseEntity<Profile> removeEducation(
            @PathVariable Long profileId,
            @PathVariable Long educationId) {

        Profile profile = profileService.removeEducation(profileId, educationId);
        return ResponseEntity.ok(profile);
    }

    @DeleteMapping("/{profileId}/skill/{skillId}")
    public ResponseEntity<Profile> removeSkill(
            @PathVariable Long profileId,
            @PathVariable Long skillId) {

        Profile profile = profileService.removeSkill(profileId, skillId);
        return ResponseEntity.ok(profile);
    }

    @DeleteMapping("/{profileId}/accomplishment/{accomplishmentId}")
    public ResponseEntity<Profile> removeAccomplishment(
            @PathVariable Long profileId,
            @PathVariable Long accomplishmentId) {

        Profile profile = profileService.removeAccomplishment(profileId, accomplishmentId);
        return ResponseEntity.ok(profile);
    }

    // ====================== MISE À JOUR ======================

    @PutMapping("/{profileId}/experience/{experienceId}")
    public ResponseEntity<Profile> updateExperience(
            @PathVariable Long profileId,
            @PathVariable Long experienceId,
            @RequestBody Experience updatedExperience) {

        Profile profile = profileService.updateExperience(profileId, experienceId, updatedExperience);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/{profileId}/education/{educationId}")
    public ResponseEntity<Profile> updateEducation(
            @PathVariable Long profileId,
            @PathVariable Long educationId,
            @RequestBody Education updatedEducation) {

        Profile profile = profileService.updateEducation(profileId, educationId, updatedEducation);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/{profileId}/skill/{skillId}")
    public ResponseEntity<Profile> updateSkill(
            @PathVariable Long profileId,
            @PathVariable Long skillId,
            @RequestBody Skill updatedSkill) {

        Profile profile = profileService.updateSkill(profileId, skillId, updatedSkill);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/{profileId}/accomplishment/{accomplishmentId}")
    public ResponseEntity<Profile> updateAccomplishment(
            @PathVariable Long profileId,
            @PathVariable Long accomplishmentId,
            @RequestBody Accomplishment updatedAccomplishment) {

        Profile profile = profileService.updateAccomplishment(profileId, accomplishmentId, updatedAccomplishment);
        return ResponseEntity.ok(profile);
    }

    // ====================== SUPPRESSION DU PROFIL COMPLET ======================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProfile(@PathVariable Long id) {
        profileService.deleteProfile(id);
        return ResponseEntity.noContent().build();   // Retourne 204 No Content
    }

    // ====================== RÉCUPÉRATION DES AUTRES SECTIONS ======================

    @GetMapping("/{profileId}/educations")
    public ResponseEntity<List<Education>> getEducations(@PathVariable Long profileId) {
        List<Education> educations = profileService.getEducations(profileId);
        return ResponseEntity.ok(educations);
    }

    @GetMapping("/{profileId}/skills")
    public ResponseEntity<List<Skill>> getSkills(@PathVariable Long profileId) {
        List<Skill> skills = profileService.getSkills(profileId);
        return ResponseEntity.ok(skills);
    }

    @GetMapping("/{profileId}/accomplishments")
    public ResponseEntity<List<Accomplishment>> getAccomplishments(@PathVariable Long profileId) {
        List<Accomplishment> accomplishments = profileService.getAccomplishments(profileId);
        return ResponseEntity.ok(accomplishments);
    }

    // ====================== RECOMMENDATIONS / ENDORSEMENTS (F09) ======================

    @GetMapping("/{profileId}/recommendations")
    public ResponseEntity<List<Recommendation>> getRecommendations(@PathVariable Long profileId) {
        List<Recommendation> recommendations = profileService.getRecommendations(profileId);
        return ResponseEntity.ok(recommendations);
    }

    @PostMapping("/{profileId}/recommendation")
    public ResponseEntity<Profile> addRecommendation(
            @PathVariable Long profileId,
            @RequestBody Recommendation recommendation,
            Authentication auth) {   // ← Injecter l'authentification

        // 1. Récupérer l'utilisateur connecté (celui qui recommande)
        String email = auth.getName();
        Utilisateur recommender = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // 2. Remplir automatiquement les champs obligatoires
        recommendation.setRecommenderName(recommender.getNom());      // nom de l'utilisateur
        recommendation.setRecommenderEmail(recommender.getEmail());   // son email

        // 3. Déléguer la suite au service
        Profile profile = profileService.addRecommendation(profileId, recommendation);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/{profileId}/recommendation/{recommendationId}/accept")
    public ResponseEntity<Profile> acceptRecommendation(
            @PathVariable Long profileId,
            @PathVariable Long recommendationId) {
        
        Profile profile = profileService.acceptRecommendation(profileId, recommendationId);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/{profileId}/recommendation/{recommendationId}/reject")
    public ResponseEntity<Profile> rejectRecommendation(
            @PathVariable Long profileId,
            @PathVariable Long recommendationId) {
        
        Profile profile = profileService.rejectRecommendation(profileId, recommendationId);
        return ResponseEntity.ok(profile);
    }


}