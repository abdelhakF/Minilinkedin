package com.minilinkedin.mini_linkedin.service;

import com.minilinkedin.mini_linkedin.model.Utilisateur;
import com.minilinkedin.mini_linkedin.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Optional<Utilisateur> optionalUser = utilisateurRepository.findByEmail(email);
        Utilisateur utilisateur = optionalUser.orElseThrow(() ->
                new UsernameNotFoundException("Utilisateur non trouvé avec l'email: " + email));

        if (utilisateur.getAccount() == null || utilisateur.getAccount().getPassword() == null) {
            throw new UsernameNotFoundException(
                    "Compte manquant ou sans mot de passe pour l'utilisateur: " + email);
        }

        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + utilisateur.getRoleEnum().name());

        return new User(
                utilisateur.getEmail(),
                utilisateur.getAccount().getPassword(),
                Collections.singletonList(authority)
        );
    }

    /**
     * Méthode CRITIQUE : Récupère l'utilisateur connecté à partir de son email (username)
     * Utilisée par PostController et CandidatureController
     */
    public Utilisateur getCurrentUser(String email) {
        return utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'email : " + email));
    }

    @Transactional
    public boolean register(Utilisateur utilisateur) {
        if (utilisateurRepository.existsByEmail(utilisateur.getEmail())) {
            return false;
        }

        String encodedPassword = passwordEncoder.encode(utilisateur.getAccount().getPassword());
        utilisateur.getAccount().setPassword(encodedPassword);

        utilisateurRepository.save(utilisateur);
        return true;
    }

    public String generatePasswordResetToken(String email) {
        Utilisateur user = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable avec cet email"));

        String token = UUID.randomUUID().toString();

        if (user.getAccount() != null) {
            user.getAccount().setResetPasswordToken(token);
            utilisateurRepository.save(user);
        } else {
            throw new RuntimeException("L'utilisateur n'a pas de compte associé");
        }

        return token;
    }

    public boolean resetPassword(String token, String newPassword) {
        Utilisateur user = utilisateurRepository.findByAccount_ResetPasswordToken(token);

        if (user != null) {
            user.getAccount().setPassword(passwordEncoder.encode(newPassword));
            user.getAccount().setResetPasswordToken(null);
            utilisateurRepository.save(user);
            return true;
        }
        return false;
    }
}