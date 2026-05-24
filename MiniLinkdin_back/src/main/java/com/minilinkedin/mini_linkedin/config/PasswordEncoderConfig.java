package com.minilinkedin.mini_linkedin.config;



import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Configuration dédiée pour fournir un bean PasswordEncoder.
 * Cela permet de briser la dépendance circulaire lors de l'initialisation des beans.
 */
@Configuration
public class PasswordEncoderConfig {

    /**
     * Fournit une instance de BCryptPasswordEncoder pour le hachage des mots de passe.
     *
     * @return Une instance de BCryptPasswordEncoder.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
