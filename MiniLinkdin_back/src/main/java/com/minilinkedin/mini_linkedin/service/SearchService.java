package com.minilinkedin.mini_linkedin.service;

import com.minilinkedin.mini_linkedin.model.*;
import com.minilinkedin.mini_linkedin.repository.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SearchService {

    @Autowired private UtilisateurRepository utilisateurRepository;
    @Autowired private PostRepository postRepository;
    @Autowired private SkillRepository skillRepository;

    // ══════════════════════════════════════════════
    // RECHERCHE D'UTILISATEURS
    // ══════════════════════════════════════════════

    public List<Utilisateur> rechercherParNom(String nom) {
        if (nom == null || nom.isBlank())
            throw new IllegalArgumentException("Le nom de recherche ne peut pas être vide");
        return utilisateurRepository.searchByNom(nom.trim());
    }

    public List<Utilisateur> rechercherParRole(TypeRole role) {
        return utilisateurRepository.findByRoleEnum(role);
    }

    public List<Utilisateur> rechercherParInstitution(String institution) {
        if (institution == null || institution.isBlank())
            throw new IllegalArgumentException("L'institution ne peut pas être vide");
        return utilisateurRepository.searchByInstitution(institution.trim());
    }

    // ══════════════════════════════════════════════
    // RECHERCHE D'ENSEIGNANTS
    // ══════════════════════════════════════════════

    public List<Enseignant> rechercherEnseignantParSpecialite(String specialite) {
        if (specialite == null || specialite.isBlank())
            throw new IllegalArgumentException("La spécialité ne peut pas être vide");
        return utilisateurRepository.searchEnseignantBySpecialite(specialite.trim());
    }

    // ══════════════════════════════════════════════
    // RECHERCHE DE POSTS
    // ══════════════════════════════════════════════

    public List<Post> rechercherPosts(String keyword) {
        if (keyword == null || keyword.isBlank())
            return postRepository.findAllByOrderByDatePublicationDesc();
        return postRepository.searchByKeyword(keyword.trim());
    }

    public List<OffreStage> getOffresStage() {
        return postRepository.getOffresStage();
    }

    public List<SujetThese> getSujetsThese() {
        return postRepository.getSujetsThese();
    }

    public List<ProjetTuteure> getProjetsTutores() {
        return postRepository.getProjetsTutores();
    }

    public List<Post> rechercherPostsParType(String keyword, String type) {
        if (type == null || type.isBlank())
            return rechercherPosts(keyword);

        return switch (type.toLowerCase().trim()) {
            case "offre"  -> rechercherPosts(keyword).stream()
                    .filter(p -> p instanceof OffreStage).toList();
            case "these"  -> rechercherPosts(keyword).stream()
                    .filter(p -> p instanceof SujetThese).toList();
            case "projet" -> rechercherPosts(keyword).stream()
                    .filter(p -> p instanceof ProjetTuteure).toList();
            default -> rechercherPosts(keyword);
        };
    }

    // ══════════════════════════════════════════════
    // RECHERCHE DE COMPÉTENCES INTELLIGENTE
    // ══════════════════════════════════════════════

    // Cette méthode regroupe les compétences par nom et y attache les utilisateurs associés
// ══════════════════════════════════════════════
    // RECHERCHE DE COMPÉTENCES INTELLIGENTE
    // ══════════════════════════════════════════════

    public List<Map<String, Object>> rechercherCompetences(String keyword) {
        // 👇 CORRECTION ICI : On récupère d'abord l'Iterable, puis on le convertit en List
        Iterable<Utilisateur> iterableUsers = utilisateurRepository.findAll();
        List<Utilisateur> allUsers = new ArrayList<>();
        iterableUsers.forEach(allUsers::add);

        Map<String, List<Utilisateur>> skillUsersMap = new HashMap<>();

        for (Utilisateur user : allUsers) {
            if (user.getProfile() != null && user.getProfile().getSkills() != null) {
                for (Skill skill : user.getProfile().getSkills()) {

                    boolean isMatch = (keyword == null || keyword.isBlank()) ||
                            skill.getName().toLowerCase().contains(keyword.toLowerCase().trim());

                    if (isMatch) {
                        skillUsersMap.putIfAbsent(skill.getName(), new ArrayList<>());
                        if (!skillUsersMap.get(skill.getName()).contains(user)) {
                            skillUsersMap.get(skill.getName()).add(user);
                        }
                    }
                }
            }
        }

        List<Map<String, Object>> resultList = new ArrayList<>();
        for (Map.Entry<String, List<Utilisateur>> entry : skillUsersMap.entrySet()) {
            Map<String, Object> skillData = new HashMap<>();
            skillData.put("id", entry.getKey());
            skillData.put("name", entry.getKey());
            skillData.put("type", "skill");
            skillData.put("utilisateurs", entry.getValue());

            resultList.add(skillData);
        }

        return resultList;
    }

    // ══════════════════════════════════════════════
    // RECHERCHE GLOBALE
    // ══════════════════════════════════════════════

    public record SearchGlobalResult(
            List<Utilisateur> utilisateurs,
            List<Post>        posts,
            List<Map<String, Object>> competences // ← Adapté pour recevoir la liste formatée
    ) {}

    public SearchGlobalResult rechercheGlobale(String keyword) {
        return new SearchGlobalResult(
                rechercherParNom(keyword),
                rechercherPosts(keyword),
                rechercherCompetences(keyword) // Va chercher les compétences avec leurs utilisateurs
        );
    }
}