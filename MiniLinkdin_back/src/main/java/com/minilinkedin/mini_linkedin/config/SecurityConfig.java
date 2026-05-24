package com.minilinkedin.mini_linkedin.config;

import com.minilinkedin.mini_linkedin.security.JwtAuthorizationFilter;
import com.minilinkedin.mini_linkedin.service.UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.http.HttpMethod;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final UserService userService;
    private final JwtAuthorizationFilter jwtAuthorizationFilter;

    public SecurityConfig(UserService userService, JwtAuthorizationFilter jwtAuthorizationFilter) {
        this.userService = userService;
        this.jwtAuthorizationFilter = jwtAuthorizationFilter;
    }

    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http, PasswordEncoder passwordEncoder)
            throws Exception {
        AuthenticationManagerBuilder authenticationManagerBuilder = http.getSharedObject(AuthenticationManagerBuilder.class);
        authenticationManagerBuilder.userDetailsService(userService).passwordEncoder(passwordEncoder);
        return authenticationManagerBuilder.build();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())

                // === AJOUT OBLIGATOIRE : le filtre JWT ===
                .addFilterBefore(jwtAuthorizationFilter, UsernamePasswordAuthenticationFilter.class)

                // === CORS (tu l'avais déjà configuré) ===
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                .authorizeHttpRequests(auth -> auth
                        // Endpoints publics (inscription / login)
                        .requestMatchers("/api/auth/register", "/api/auth/login", "/api/auth/**").permitAll()

                        // ✅ Ajouter par Zak (Images des posts)
                        .requestMatchers("/api/posts/images/**").permitAll()
                        .requestMatchers("/api/images/**").permitAll()

                        // ✅ Autoriser explicitement PATCH sur les candidatures pour enseignants/admins
                        .requestMatchers(HttpMethod.PATCH, "/api/candidatures/**").hasAnyAuthority("ROLE_ENSEIGNANT", "ROLE_ADMIN")

                        // Profil (et tous les endpoints /api/**)
                        .requestMatchers("/api/profile/**").authenticated()
                        .requestMatchers("/api/**").authenticated()

                        .anyRequest().permitAll()
                )

                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                );

        return http.build();
    }

    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173","http://localhost:63342", "http://localhost:8081", "http://localhost:3000"));

        // ✅ Modifier par Zak (Ajout de PATCH)
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}