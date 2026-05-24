# MiniLinkdin Backend Documentation

This document provides a detailed summary of the MiniLinkdin backend, including its dependencies, requirements, version, and instructions on how to test the authentication endpoints using Postman.

## 1. Project Overview

*   **Framework:** Spring Boot 3.x
*   **Language:** Java 17
*   **Build Tool:** Maven
*   **Authentication:** JWT (JSON Web Tokens) with Spring Security

## 2. Dependencies & Requirements

### Core Dependencies:
*   `spring-boot-starter-data-jpa`: For database interactions using Java Persistence API.
*   `spring-boot-starter-web`: For building RESTful APIs.
*   `spring-boot-starter-security`: For authentication and authorization.
*   `jjwt-api`, `jjwt-impl`, `jjwt-jackson`: For creating and parsing JWTs.
*   `mysql-connector-java`: MySQL database driver.
*   `lombok`: To reduce boilerplate code (e.g., getters, setters).

### Requirements:
*   **Java Development Kit (JDK) 17** or later.
*   **Maven 3.x** for dependency management.
*   **A running MySQL database instance.** You must configure the database connection details in `src/main/resources/application.properties`.
*   **An API testing tool** like [Postman](https://www.postman.com/).

## 3. How to Test with Postman

**Important:** Before testing, ensure your database is running and that you have created a new user after the latest code changes, as the password hashing mechanism has been updated.

### 3.1. User Registration (Inscription)

This endpoint allows you to create a new user.

*   **Method:** `POST`
*   **URL:** `http://localhost:8081/api/auth/register`
*   **Headers:**
    *   `Content-Type`: `application/json`
*   **Body (raw JSON):** This is the JSON object to send in the request body.

    ```json
    {
      "nom": "John Doe",
      "email": "john.doe@example.com",
      "phone": "123-456-7890",
      "institution": "Example University",
      "photo": "path/to/photo.jpg",
      "roleEnum": "ETUDIANT",
      "address": {
        "street": "123 Main St",
        "city": "Anytown",
        "state": "CA",
        "zipCode": "12345"
      },
      "account": {
        "password": "your-strong-password"
      }
    }
    ```

**Expected Response (on success):**
*   **Status:** `201 CREATED`
*   **Body:** `Registration successful`

### 3.2. User Login (Connexion)

This endpoint allows an existing user to log in and receive a JWT.

*   **Method:** `POST`
*   **URL:** `http://localhost:8081/api/auth/login`
*   **Headers:**
    *   `Content-Type`: `application/json`
*   **Body (raw JSON):** This is the JSON object to send in the request body.

    ```json
    {
      "email": "john.doe@example.com",
      "password": "your-strong-password"
    }
    ```

**Expected Response (on success):**
*   **Status:** `200 OK`
*   **Body:** A long string, which is your JSON Web Token (JWT). You can use this token to access protected endpoints.

**Example JWT Response:**
```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsImlhdCI6MTY3OTg1NjQwMywiZXhwIjoxNjc5ODYwMDAzfQ.AbCdEfGhIjKlMnOpQrStUvWxYz
```

### 3.3. Troubleshooting: "Invalid credentials"

If you receive an "Invalid credentials" error after following these steps:
1.  **Ensure you have created a NEW user** after the recent code changes. Old users have un-hashed passwords and will not work.
2.  **Double-check the JSON structure** in your Postman request. The password for registration must be nested inside the `account` object.
3.  **Verify your database connection** in `application.properties` is correct.
4.  **Confirm that the `Utilisateur` and `Account` tables in your database are empty** before you register the first new user.
