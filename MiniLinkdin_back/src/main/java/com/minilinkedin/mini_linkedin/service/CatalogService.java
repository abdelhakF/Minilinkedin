package com.minilinkedin.mini_linkedin.service;

import com.minilinkedin.mini_linkedin.exception.DuplicateEntryException;
import com.minilinkedin.mini_linkedin.model.Domaine;
import com.minilinkedin.mini_linkedin.model.Etablissement;
import com.minilinkedin.mini_linkedin.repository.DomaineRepository;
import com.minilinkedin.mini_linkedin.repository.EtablissementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CatalogService {

    private final EtablissementRepository etablissementRepository;
    private final DomaineRepository domaineRepository;

    // ===== Etablissements =====
    public List<Etablissement> getAllEtablissements() {
        return etablissementRepository.findAllByOrderByNomAsc();
    }

    public Etablissement getEtablissementById(Long id) {
        return etablissementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Établissement non trouvé avec l'ID : " + id));
    }

    public Etablissement createEtablissement(Etablissement etablissement) {
        if (etablissement.getNom() == null || etablissement.getNom().isBlank()) {
            throw new IllegalArgumentException("Le nom de l'établissement est requis.");
        }
        if (etablissementRepository.existsByNomIgnoreCase(etablissement.getNom())) {
            throw new DuplicateEntryException("Un établissement avec ce nom existe déjà.");
        }
        etablissement.setId(null);
        return etablissementRepository.save(etablissement);
    }

    public Etablissement updateEtablissement(Long id, Etablissement updates) {
        Etablissement existing = getEtablissementById(id);
        if (updates.getNom() != null && !updates.getNom().isBlank()) {
            etablissementRepository.findByNomIgnoreCase(updates.getNom())
                    .filter(other -> !other.getId().equals(id))
                    .ifPresent(other -> {
                        throw new DuplicateEntryException("Un établissement avec ce nom existe déjà.");
                    });
            existing.setNom(updates.getNom());
        }
        if (updates.getVille() != null) existing.setVille(updates.getVille());
        if (updates.getPays() != null) existing.setPays(updates.getPays());
        if (updates.getDescription() != null) existing.setDescription(updates.getDescription());
        return etablissementRepository.save(existing);
    }

    public void deleteEtablissement(Long id) {
        if (!etablissementRepository.existsById(id)) {
            throw new RuntimeException("Établissement non trouvé avec l'ID : " + id);
        }
        etablissementRepository.deleteById(id);
    }

    // ===== Domaines =====
    public List<Domaine> getAllDomaines() {
        return domaineRepository.findAllByOrderByNomAsc();
    }

    public Domaine getDomaineById(Long id) {
        return domaineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Domaine non trouvé avec l'ID : " + id));
    }

    public Domaine createDomaine(Domaine domaine) {
        if (domaine.getNom() == null || domaine.getNom().isBlank()) {
            throw new IllegalArgumentException("Le nom du domaine est requis.");
        }
        if (domaineRepository.existsByNomIgnoreCase(domaine.getNom())) {
            throw new DuplicateEntryException("Un domaine avec ce nom existe déjà.");
        }
        domaine.setId(null);
        return domaineRepository.save(domaine);
    }

    public Domaine updateDomaine(Long id, Domaine updates) {
        Domaine existing = getDomaineById(id);
        if (updates.getNom() != null && !updates.getNom().isBlank()) {
            domaineRepository.findByNomIgnoreCase(updates.getNom())
                    .filter(other -> !other.getId().equals(id))
                    .ifPresent(other -> {
                        throw new DuplicateEntryException("Un domaine avec ce nom existe déjà.");
                    });
            existing.setNom(updates.getNom());
        }
        if (updates.getDescription() != null) existing.setDescription(updates.getDescription());
        return domaineRepository.save(existing);
    }

    public void deleteDomaine(Long id) {
        if (!domaineRepository.existsById(id)) {
            throw new RuntimeException("Domaine non trouvé avec l'ID : " + id);
        }
        domaineRepository.deleteById(id);
    }
}
