package com.minilinkedin.mini_linkedin.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for OpenAPI (Swagger) documentation.
 * This setup defines the general API information and configures JWT-based security.
 */
@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "Mini-LinkedIn API",
        version = "v1",
        description = "This document describes the API for the Mini-LinkedIn backend application."
    ),
    // Apply security globally to all endpoints
    security = @SecurityRequirement(name = "bearerAuth")
)
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT",
    description = "JWT Authorization header using the Bearer scheme. " +
                  "Enter 'Bearer' [space] and then your token in the text input below. " +
                  "Example: Bearer 12345abcdef"
)
public class OpenApiConfig {
}
