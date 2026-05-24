# Test des Fonctionnalités Admin

Ce document contient toutes les requêtes JSON échangées lors du test des endpoints admin.

## 1. Enregistrement Administrateur
**Requête :** `POST /api/auth/register`

Payload (JSON) :
```json
{
  "type": "ADMIN",
  "nom": "Super Admin Tester",
  "email": "testadmin2@minilinkedin.com",
  "phone": "0102030405",
  "institution": "MiniLink",
  "roleEnum": "ADMIN",
  "account": {
    "password": "testadminpassword"
  }
}
```

**Statut de Réponse :** `403`

---

## 2. Login Administrateur
**Requête :** `POST /api/auth/login`

Payload (JSON) :
```json
{
  "email": "testadmin2@minilinkedin.com",
  "password": "testadminpassword"
}
```

**Statut de Réponse :** `401`

Réponse textuelle :
```
Invalid credentials
```

---

## 3. Obtenir les Statistiques du Tableau de Bord
**Requête :** `GET /api/admin/stats`

**Statut de Réponse :** `403`

---

## 4. Récupérer tous les Utilisateurs
**Requête :** `GET /api/admin/users`

**Statut de Réponse :** `403`

---

## 8. Récupérer tous les Posts
**Requête :** `GET /api/admin/posts`

**Statut de Réponse :** `403`

---

