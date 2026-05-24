package com.minilinkedin.mini_linkedin.controller;

import com.minilinkedin.mini_linkedin.dto.SignalementRequest;
import com.minilinkedin.mini_linkedin.model.Signalement;
import com.minilinkedin.mini_linkedin.service.SignalementService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/signalements")
@RequiredArgsConstructor
@Tag(name = "Module 2 — Signalements", description = "Signalement de contenu inapproprié")
public class SignalementController {

    private final SignalementService signalementService;

    @PostMapping
    public ResponseEntity<Signalement> createSignalement(@RequestBody SignalementRequest request,
                                                         Authentication auth) {
        return ResponseEntity.ok(signalementService.createSignalement(request, auth.getName()));
    }
}
