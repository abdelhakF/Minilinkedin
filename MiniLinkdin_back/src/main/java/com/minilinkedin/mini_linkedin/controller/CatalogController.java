package com.minilinkedin.mini_linkedin.controller;

import com.minilinkedin.mini_linkedin.model.Domaine;
import com.minilinkedin.mini_linkedin.model.Etablissement;
import com.minilinkedin.mini_linkedin.service.CatalogService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Module 2 — Catalogues", description = "Gestion des établissements et des domaines d'études")
public class CatalogController {

    private final CatalogService catalogService;

    // ====== Lecture publique (utilisée dans les formulaires) ======
    @GetMapping("/etablissements")
    public ResponseEntity<List<Etablissement>> listEtablissements() {
        return ResponseEntity.ok(catalogService.getAllEtablissements());
    }

    @GetMapping("/domaines")
    public ResponseEntity<List<Domaine>> listDomaines() {
        return ResponseEntity.ok(catalogService.getAllDomaines());
    }

    // ====== CRUD Admin — Etablissements ======
    @GetMapping("/admin/etablissements")
    public ResponseEntity<List<Etablissement>> adminListEtablissements() {
        return ResponseEntity.ok(catalogService.getAllEtablissements());
    }

    @GetMapping("/admin/etablissements/{id}")
    public ResponseEntity<Etablissement> adminGetEtablissement(@PathVariable Long id) {
        return ResponseEntity.ok(catalogService.getEtablissementById(id));
    }

    @PostMapping("/admin/etablissements")
    public ResponseEntity<Etablissement> adminCreateEtablissement(@RequestBody Etablissement etablissement) {
        return ResponseEntity.ok(catalogService.createEtablissement(etablissement));
    }

    @PutMapping("/admin/etablissements/{id}")
    public ResponseEntity<Etablissement> adminUpdateEtablissement(@PathVariable Long id,
                                                                  @RequestBody Etablissement etablissement) {
        return ResponseEntity.ok(catalogService.updateEtablissement(id, etablissement));
    }

    @DeleteMapping("/admin/etablissements/{id}")
    public ResponseEntity<Void> adminDeleteEtablissement(@PathVariable Long id) {
        catalogService.deleteEtablissement(id);
        return ResponseEntity.noContent().build();
    }

    // ====== CRUD Admin — Domaines ======
    @GetMapping("/admin/domaines")
    public ResponseEntity<List<Domaine>> adminListDomaines() {
        return ResponseEntity.ok(catalogService.getAllDomaines());
    }

    @GetMapping("/admin/domaines/{id}")
    public ResponseEntity<Domaine> adminGetDomaine(@PathVariable Long id) {
        return ResponseEntity.ok(catalogService.getDomaineById(id));
    }

    @PostMapping("/admin/domaines")
    public ResponseEntity<Domaine> adminCreateDomaine(@RequestBody Domaine domaine) {
        return ResponseEntity.ok(catalogService.createDomaine(domaine));
    }

    @PutMapping("/admin/domaines/{id}")
    public ResponseEntity<Domaine> adminUpdateDomaine(@PathVariable Long id,
                                                      @RequestBody Domaine domaine) {
        return ResponseEntity.ok(catalogService.updateDomaine(id, domaine));
    }

    @DeleteMapping("/admin/domaines/{id}")
    public ResponseEntity<Void> adminDeleteDomaine(@PathVariable Long id) {
        catalogService.deleteDomaine(id);
        return ResponseEntity.noContent().build();
    }
}
