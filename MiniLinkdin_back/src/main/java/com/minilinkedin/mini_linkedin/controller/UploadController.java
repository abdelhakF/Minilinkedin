package com.minilinkedin.mini_linkedin.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.*;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class UploadController {

    private final Path root = Paths.get("uploads");

    // 🔥 1. ENDPOINT D'UPLOAD
    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
            }

            if (!Files.exists(root)) {
                Files.createDirectories(root);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String fileName = UUID.randomUUID().toString() + extension;

            Files.copy(file.getInputStream(), this.root.resolve(fileName));

            // L'URL pointe maintenant vers notre nouvelle méthode GET ci-dessous
            String fileUrl = "http://localhost:8080/api/images/" + fileName;

            return ResponseEntity.ok(Map.of("url", fileUrl));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Could not upload: " + e.getMessage()));
        }
    }

    // 🔥 2. NOUVEL ENDPOINT POUR AFFICHER L'IMAGE
    @GetMapping("/images/{filename:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        try {
            Path file = root.resolve(filename);
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() || resource.isReadable()) {
                // Détecter le type d'image (jpg, png, etc.) pour le navigateur
                String contentType = Files.probeContentType(file);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}