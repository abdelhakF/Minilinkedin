# Mini LinkedIn Universitaire

![Java](https://img.shields.io/badge/Java-17-orange?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-6DB33F?logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-database-4169E1?logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)

Réseau social professionnel destiné à un environnement universitaire — étudiants, enseignants et établissements y partagent des publications, se connectent, publient des offres de stage et des sujets de thèse, et postulent via des candidatures. Projet académique (`Minilinkedin_universitaire`) composé d'une API REST Spring Boot et d'une application React.

## Fonctionnalités

- **Comptes multi-profils** : étudiant, enseignant et administrateur, avec statut de compte et rôles dédiés
- **Authentification JWT** (inscription, connexion, sécurité par rôle via Spring Security)
- **Fil d'actualité** : publications (texte/image), likes, commentaires (avec likes), partages et reposts
- **Réseau de connexions** : invitations à se connecter, acceptation/refus, recommandations
- **Messagerie** et **notifications** en temps différé
- **Recherche** de profils, publications et offres
- **Profil enrichi** : expériences, formations (education), compétences (skills), accomplissements
- **Vie académique** : sujets de thèse (`SujetThese`), projets tuteurés (`ProjetTuteure`), offres de stage (`OffreStage`) et candidatures associées
- **Modération** : signalement de contenus avec statut de traitement
- **Espace administrateur** dédié (`AdminController`) et catalogue de données (`CatalogController`)
- **Upload d'images** pour les publications et les profils
- Documentation d'API générée via **springdoc-openapi** (Swagger UI)

## Stack technique

| Composant | Techno |
|---|---|
| Backend | Java 17, Spring Boot 3.5 (Web, Data JPA, Security, Validation, Actuator) |
| Authentification | JWT (jjwt) |
| Base de données | PostgreSQL, Hibernate/JPA |
| Frontend | React 19, Vite, React Router, Axios |
| Documentation API | springdoc-openapi (Swagger UI) |
| Build backend | Maven |

## Structure du projet

```
MiniLinkdin_back/        API Spring Boot
  src/main/java/.../
    controller/            Auth, Profile, Post, SocialNetwork, Notification,
                           Search, Candidature, Catalog, Signalement, Admin, Upload
    model/                 Entités JPA (Account, Post, Comment, Connection...)
    service/, repository/  Logique métier et accès aux données
    security/, config/     Sécurité Spring / configuration JWT
    dto/, exception/       Objets de transfert et gestion des erreurs
  src/main/resources/     Configuration (application.properties)

Minilinkedin_Front/       Application React (Vite)
  src/components/          Auth, Profile, Network, Notifications, Search,
                           Candidatures, Admin, Common
  src/services/, hooks/, context/, config/
```

## Démarrage

### Prérequis
- Java 17+, Maven
- Node.js
- PostgreSQL (base `minilinkedin`)

### Backend

```bash
cd MiniLinkdin_back
# configurer une base PostgreSQL "minilinkedin" et, si besoin,
# SPRING_DATASOURCE_USERNAME / SPRING_DATASOURCE_PASSWORD / jwt.secret
./mvnw spring-boot:run
```

L'API démarre sur `http://localhost:8080`, la documentation Swagger est disponible via springdoc-openapi.

### Frontend

```bash
cd Minilinkedin_Front
npm install
npm run dev
```

## Contexte

Projet universitaire réalisé pour illustrer la conception d'un réseau social complet (authentification, contenu, graphe social, vie académique) avec une architecture API + SPA séparée.
