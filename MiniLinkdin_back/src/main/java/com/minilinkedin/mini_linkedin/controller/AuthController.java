package com.minilinkedin.mini_linkedin.controller;

import com.minilinkedin.mini_linkedin.model.*;
import com.minilinkedin.mini_linkedin.dto.LoginRequest;
import com.minilinkedin.mini_linkedin.security.*;    // BON
import com.minilinkedin.mini_linkedin.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.minilinkedin.mini_linkedin.dto.ForgotPasswordRequest;
import com.minilinkedin.mini_linkedin.dto.ResetPasswordRequest;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody Utilisateur user) {
        logger.info("User registration attempt for email: {}", user.getEmail());
        if (userService.register(user)) {
            logger.info("User registered successfully: {}", user.getEmail());
            return new ResponseEntity<>("Registration successful", HttpStatus.CREATED);
        } else {
            logger.warn("Registration failed: User with email already exists: {}", user.getEmail());
            return new ResponseEntity<>("User with this email already exists", HttpStatus.CONFLICT);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<String> authenticateUser(@RequestBody LoginRequest loginRequest) {
        logger.info("User login attempt for email: {}", loginRequest.getEmail());
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );
            logger.info("User authenticated successfully: {}", loginRequest.getEmail());
        } catch (Exception e) {
            logger.warn("Authentication failed for email: {} -> {}: {}",
                    loginRequest.getEmail(), e.getClass().getSimpleName(), e.getMessage(), e);
            return new ResponseEntity<>("Invalid credentials", HttpStatus.UNAUTHORIZED);
        }

        final UserDetails userDetails = userService.loadUserByUsername(loginRequest.getEmail());
        final String jwt = jwtUtil.generateToken(userDetails);

        return new ResponseEntity<>(jwt, HttpStatus.OK);
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logoutUser() {
        // Server-side logout logic (like token blocklisting) can be added here.
        // For now, the client is responsible for clearing the token.
        return new ResponseEntity<>("Logout successful. Please clear your token.", HttpStatus.OK);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            String token = userService.generatePasswordResetToken(request.email());
            String message = "Password reset token generated. In a real app, this would be sent via email.";
            // We return the token here for simulation purposes.
            return new ResponseEntity<>(Map.of("message", message, "token", token), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", e.getMessage()), HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        boolean success = userService.resetPassword(request.token(), request.newPassword());
        if (success) {
            return new ResponseEntity<>("Password has been reset successfully.", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Invalid or expired token.", HttpStatus.BAD_REQUEST);
        }
    }
}
