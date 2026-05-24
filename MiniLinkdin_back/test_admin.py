import requests
import json
import os

BASE_URL = "http://localhost:8084/api"
md_content = "# Test des Fonctionnalités Admin\n\n"
md_content += "Ce document contient toutes les requêtes JSON échangées lors du test des endpoints admin.\n\n"

session = requests.Session()

def add_md(title, method, url, req_body=None, res_status=None, res_body=None):
    global md_content
    md_content += f"## {title}\n"
    md_content += f"**Requête :** `{method} {url}`\n\n"
    if req_body:
        md_content += "Payload (JSON) :\n```json\n" + json.dumps(req_body, indent=2, ensure_ascii=False) + "\n```\n\n"
    md_content += f"**Statut de Réponse :** `{res_status}`\n\n"
    if res_body:
        try:
            parsed = res_body
            if isinstance(res_body, str):
                parsed = json.loads(res_body)
            md_content += "Réponse (JSON) :\n```json\n" + json.dumps(parsed, indent=2, ensure_ascii=False) + "\n```\n\n"
        except Exception:
            md_content += "Réponse textuelle :\n```\n" + str(res_body) + "\n```\n\n"
    md_content += "---\n\n"

# 1. Register Admin
admin_json = {
  "type":"ADMIN",
  "nom": "Super Admin Tester",
  "email": "testadmin2@minilinkedin.com",
  "phone": "0102030405",
  "institution": "MiniLink",
  "roleEnum": "ADMIN",
  "account": {
    "password": "testadminpassword"
  }
}
res = session.post(f"{BASE_URL}/auth/register", json=admin_json)
add_md("1. Enregistrement Administrateur", "POST", "/api/auth/register", req_body=admin_json, res_status=res.status_code, res_body=res.text)

# 2. Login Admin
login_json = {
    "email": "testadmin2@minilinkedin.com",
    "password": "testadminpassword"
}
res = session.post(f"{BASE_URL}/auth/login", json=login_json)
token = ""
if res.status_code == 200:
    token = res.text
add_md("2. Login Administrateur", "POST", "/api/auth/login", req_body=login_json, res_status=res.status_code, res_body=res.text)

headers = {"Authorization": f"Bearer {token}"} if token else {}

# 3. GET /api/admin/stats
res = session.get(f"{BASE_URL}/admin/stats", headers=headers)
add_md("3. Obtenir les Statistiques du Tableau de Bord", "GET", "/api/admin/stats", res_status=res.status_code, res_body=res.text)

# 4. GET /api/admin/users
res = session.get(f"{BASE_URL}/admin/users", headers=headers)
add_md("4. Récupérer tous les Utilisateurs", "GET", "/api/admin/users", res_status=res.status_code, res_body=res.text)

# Get an ID if users exist
user_id = None
if res.status_code == 200 and len(res.json()) > 0:
    user_id = res.json()[0]['id']

if user_id:
    # 5. GET /api/admin/users/{id}
    res = session.get(f"{BASE_URL}/admin/users/{user_id}", headers=headers)
    add_md("5. Récupérer un Utilisateur par ID", "GET", f"/api/admin/users/{user_id}", res_status=res.status_code, res_body=res.text)

    # 6. PUT /api/admin/users/{id}/ban
    res = session.put(f"{BASE_URL}/admin/users/{user_id}/ban", headers=headers)
    add_md("6. Bannir un Utilisateur", "PUT", f"/api/admin/users/{user_id}/ban", res_status=res.status_code, res_body=res.text)

    # 7. PUT /api/admin/users/{id}/unban
    res = session.put(f"{BASE_URL}/admin/users/{user_id}/unban", headers=headers)
    add_md("7. Débannir un Utilisateur", "PUT", f"/api/admin/users/{user_id}/unban", res_status=res.status_code, res_body=res.text)

# 8. GET /api/admin/posts
res = session.get(f"{BASE_URL}/admin/posts", headers=headers)
add_md("8. Récupérer tous les Posts", "GET", "/api/admin/posts", res_status=res.status_code, res_body=res.text)

with open("ADMIN_JSON_REPORT.md", "w") as f:
    f.write(md_content)
    
print("MD generated: ADMIN_JSON_REPORT.md")
