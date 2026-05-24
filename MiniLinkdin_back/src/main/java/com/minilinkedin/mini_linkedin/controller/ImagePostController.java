package com.minilinkedin.mini_linkedin.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ImagePostController {

    // 📁 dossier de stockage
    private final Path root = Paths.get("imgpost");

    // 🔥 UPLOAD IMAGE
    @PostMapping("/posts/upload-image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "File is empty"));
            }

            // créer dossier si n'existe pas
            if (!Files.exists(root)) {
                Files.createDirectories(root);
            }

            // nom unique
            String original = file.getOriginalFilename();
            String ext = "";

            if (original != null && original.contains(".")) {
                ext = original.substring(original.lastIndexOf("."));
            }

            String fileName = UUID.randomUUID() + ext;

            // sauvegarde dans imgpost
            Files.copy(file.getInputStream(), root.resolve(fileName));

            // URL d'accès
            String url = "http://localhost:8080/api/posts/images/" + fileName;

            return ResponseEntity.ok(Map.of("url", url));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // 🖼️ AFFICHER IMAGE
    @GetMapping("/posts/images/{filename:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        try {
            Path file = root.resolve(filename);
            Resource resource = new UrlResource(file.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = Files.probeContentType(file);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
