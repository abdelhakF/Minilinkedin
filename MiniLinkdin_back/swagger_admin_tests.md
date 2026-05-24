# Tests Swagger - Partie Administration ⚙️

Ce document présente l'ensemble des requêtes pour tester la totalité de la partie Admin de l'application via Swagger.

> [!NOTE]
> La plupart des endpoints de l'administration utilisent les requêtes HTTP `GET`, `PUT`, ou `DELETE` avec des identifiants dans l'URL (`@PathVariable`). **Aucun body JSON n'est nécessaire** pour l'écrasante majorité de ces actions. Le body JSON est en revanche requis pour l'authentification.

---

## 1. 🔐 Authentification (Pré-requis)
Pour accéder à `/api/admin/*`, vous devez obtenir un token administrateur.

**Endpoint:** `POST /api/auth/login`

**Body JSON:**
```json
{
  "email": "admin@minilinkedin.com",
  "password": "password"
}
```

> **Action importante:** Copiez le token JWT retourné dans la réponse, et allez dans le bouton **"Authorize"** en haut de la page Swagger pour coller ce token !

---

## 2. 📊 Statistiques du Dashboard
**Endpoint:** `GET /api/admin/stats`
**Description:** Récupère les stats : total utilisateurs, posts, enseignants.
**Body JSON:** *(Aucun)*

---

## 3. 👥 Gestion des Utilisateurs

### 3.1 Lister tous les utilisateurs
**Endpoint:** `GET /api/admin/users`
**Body JSON:** *(Aucun)*

### 3.2 Récupérer un utilisateur par ID
**Endpoint:** `GET /api/admin/users/{id}`
**Body JSON:** *(Aucun)*

### 3.3 Bannir un utilisateur
**Endpoint:** `PUT /api/admin/users/{id}/ban`
**Body JSON:** *(Aucun)*

### 3.4 Débannir un utilisateur
**Endpoint:** `PUT /api/admin/users/{id}/unban`
**Body JSON:** *(Aucun)*

### 3.5 Supprimer définitivement un utilisateur
**Endpoint:** `DELETE /api/admin/users/{id}`
**Body JSON:** *(Aucun)*

---

## 4. 👨‍🏫 Gestion des Enseignants

### 4.1 Valider un compte Enseignant
**Endpoint:** `PUT /api/admin/enseignants/{id}/validate`
**Description:** Passe `estValide` à `true`.
**Body JSON:** *(Aucun)*

---

## 5. 📝 Gestion du Contenu (Posts)

### 5.1 Lister tous les posts
**Endpoint:** `GET /api/admin/posts`
**Body JSON:** *(Aucun)*

### 5.2 Supprimer un post (Modération)
**Endpoint:** `DELETE /api/admin/posts/{id}`
**Body JSON:** *(Aucun)*
