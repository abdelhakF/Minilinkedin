# Mini-LinkedIn Backend: Architecture Overview

This document provides a global view of the backend architecture for the Mini-LinkedIn application. It is intended for developers who want to understand the project structure, core components, and key workflows.

## 1. Core Technologies

- **Framework**: Spring Boot 3.x
- **Language**: Java 17
- **Security**: Spring Security 6.x with JWT
- **Data Persistence**: Spring Data JPA (Hibernate)
- **Database**: PostgreSQL
- **Build Tool**: Maven
- **API Documentation**: SpringDoc OpenAPI (Swagger UI)

## 2. Project Structure

The project is organized into several key packages, each with a distinct responsibility:

-   `src/main/java/com/minilinkdin_back`
    -   `config/`: Contains all Spring configuration classes. This includes `SecurityConfig` (for web security), `OpenApiConfig` (for Swagger), and `PasswordEncoderConfig`.
    -   `controllers/`: Defines the REST API endpoints. These classes handle incoming HTTP requests, delegate business logic to services, and return HTTP responses. `AuthController` is a key controller here.
    -   `dto/`: (Data Transfer Objects) Simple objects used to transfer data between the client and the server, like `LoginRequest`.
    -   `models/`: Contains the JPA entity classes that map to database tables (e.g., `Utilisateur`, `Account`, `Profile`).
    -   `repositories/`: Spring Data JPA repository interfaces. These interfaces provide an abstraction layer for database operations (e.g., `UserReposirory`).
    -   `security/`: Holds security-specific classes, including `JwtUtil` (for creating/validating tokens) and `JwtAuthorizationFilter` (for processing tokens on each request).
    -   `services/`: Contains the core business logic. `UserService`, for example, handles user registration and loading user details for authentication.

## 3. Authentication & Authorization Flow

The application uses a stateless JWT-based authentication mechanism.

### 3.1. User Registration (`POST /api/auth/register`)

1.  The client sends user data (including a nested `account` object with a password) to the `AuthController`.
2.  The controller passes the `Utilisateur` object to the `UserService`.
3.  The `UserService` encodes the password using `PasswordEncoder` and saves the new `Utilisateur` and associated `Account` to the database via the `UserReposirory`.

### 3.2. User Login (`POST /api/auth/login`)

1.  The client sends credentials (`email`, `password`) to the `AuthController`.
2.  The controller uses Spring Security's `AuthenticationManager` to validate the credentials.
3.  The `AuthenticationManager` relies on `UserService` (`loadUserByUsername`) to fetch the user from the database and `PasswordEncoder` to compare the hashed passwords.
4.  If authentication is successful, `JwtUtil.generateToken()` is called to create a JWT. This token includes the user's email (`sub`) and roles (`roles`) in its payload.
5.  The JWT is returned to the client.

### 3.3. Accessing Secured Endpoints

1.  For any subsequent request to a secured endpoint, the client must include the JWT in the `Authorization` header: `Authorization: Bearer <your_jwt>`.
2.  The `JwtAuthorizationFilter` intercepts the request.
3.  It extracts and validates the token using `JwtUtil`.
4.  If the token is valid, it retrieves user details (including roles) from the token and creates an `Authentication` object.
5.  This object is placed in the `SecurityContextHolder`, making the user's identity and roles available throughout the request lifecycle. Spring Security then uses this context to authorize access to the endpoint.

## 4. API Documentation with Swagger

The API is documented using OpenAPI 3.

-   **Swagger UI**: [http://localhost:8081/swagger-ui/index.html](http://localhost:8081/swagger-ui/index.html)
-   **OpenAPI Spec (JSON)**: [http://localhost:8081/v3/api-docs](http://localhost:8081/v3/api-docs)

To test secured endpoints, click the **"Authorize"** button in the Swagger UI, and enter your JWT prefixed with `Bearer `.

## 5. Database Schema

The database schema is managed by JPA/Hibernate based on the entity definitions in the `models` package. Key entities include:

-   **Utilisateur**: The core user entity, containing personal information and relationships to other models.
-   **Account**: A separate entity linked one-to-one with `Utilisateur`, holding the hashed password and account status. This separation helps organize user data.
-   **Profile, Experience, Education, etc.**: Other entities that build up the user's professional profile.
