import psycopg2
from faker import Faker
import random
from datetime import datetime, timedelta
import sys
import os
import bcrypt
# ====================== CONFIGURATION ======================
fake = Faker('fr_FR')
random.seed(42)

# Mot de passe par défaut pour TOUS les comptes générés.
# Permet de se connecter via /api/auth/login avec n'importe quel email seed.
DEFAULT_SEED_PASSWORD = "Password123!"
# Hash BCrypt compatible avec BCryptPasswordEncoder de Spring Security.
DEFAULT_SEED_HASH = bcrypt.hashpw(
    DEFAULT_SEED_PASSWORD.encode("utf-8"),
    bcrypt.gensalt(rounds=10),
).decode("utf-8")

# Paramètres de connexion PostgreSQL
DB_CONFIG = {
    'dbname': 'ton_base_de_donnees',      # À modifier
    'user': 'postgres',                   # À modifier
    'password': 'ton_mot_de_passe',       # À modifier
    'host': 'localhost',
    'port': '5432'
}

# Nombre de données à générer
NB_USERS_TO_ADD = 100
NB_POSTS_TO_ADD = 200
NB_COMMENTS_TO_ADD = 400
NB_LIKES_TO_ADD = 800
NB_CANDIDATURES_TO_ADD = 50

# =========================================================

def get_max_id(conn, table_name, id_column='id'):
    """Récupère le plus grand ID d'une table ou 0 si vide"""
    try:
        with conn.cursor() as cur:
            cur.execute(f"SELECT COALESCE(MAX({id_column}), 0) FROM {table_name};")
            return cur.fetchone()[0]
    except Exception as e:
        print(f"⚠️ Table {table_name} non trouvée ou vide → début à 1")
        return 0


def main():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        conn.autocommit = False  # On gère les transactions manuellement
        print("✅ Connexion à PostgreSQL réussie\n")
    except Exception as e:
        print("❌ Erreur de connexion :", e)
        sys.exit(1)

    try:
        # ====================== RÉCUPÉRATION DES IDS ACTUELS ======================
        max_account = get_max_id(conn, 'account')
        max_stats = get_max_id(conn, 'stats')
        max_profile = get_max_id(conn, 'profile')
        max_utilisateur = get_max_id(conn, 'utilisateur')
        max_post = get_max_id(conn, 'post')

        start_id = max(max_account, max_stats, max_profile, max_utilisateur) + 1
        start_post_id = max_post + 1

        print(f"📊 Dernier ID utilisateur trouvé : {start_id - 1}")
        print(f"📊 Dernier ID post trouvé      : {start_post_id - 1}\n")

        # ====================== GÉNÉRATION DES DONNÉES ======================
        print("🚀 Début de la génération et insertion des données...")

        cur = conn.cursor()

        # 1. ACCOUNT
        print(f"   → Insertion des Accounts (mot de passe par défaut : {DEFAULT_SEED_PASSWORD})...")
        for i in range(NB_USERS_TO_ADD):
            uid = start_id + i
            status = 'BANNED' if random.random() < 0.03 else 'ACTIVE'
            cur.execute("""
                INSERT INTO account (id, password, status, reset_password_token, account_id)
                VALUES (%s, %s, %s, NULL, NULL)
            """, (uid, DEFAULT_SEED_HASH, status))

        # 2. STATS
        print("   → Insertion des Stats...")
        for i in range(NB_USERS_TO_ADD):
            uid = start_id + i
            cur.execute("""
                INSERT INTO stats (id, total_views, total_connections, search_appearances)
                VALUES (%s, %s, %s, %s)
            """, (uid, random.randint(400, 4000), random.randint(25, 200), random.randint(100, 900)))

        # 3. PROFILE + UTILISATEUR + Tables spécialisées
        print("   → Insertion des Profiles + Utilisateurs...")

        roles = ['ETUDIANT'] * 80 + ['ENSEIGNANT'] * 15 + ['ADMIN'] * 5
        random.shuffle(roles)

        etudiants = []
        enseignants = []
        admins = []

        for i in range(NB_USERS_TO_ADD):
            uid = start_id + i
            nom = fake.name()
            email = fake.unique.email()
            phone = f"06{random.randint(10000000,99999999)}"
            institution = random.choice(["Université Paris-Saclay", "Sorbonne Université", "Université Lyon 1", "CentraleSupélec", "IMT Atlantique"])
            role = roles[i]

            summary = fake.sentence(nb_words=12).replace("'", "''")
            headline = random.choice(["Étudiant en Master 2 IA", "Développeur Full Stack", "Doctorant en Cybersécurité", "Enseignant-Chercheur"])

            # Profile
            cur.execute("""
                INSERT INTO profile (id, summary, headline, photo_url, institution, stats_id, utilisateur_id)
                VALUES (%s, %s, %s, NULL, %s, %s, %s)
            """, (uid, summary, headline, institution, uid, uid))

            # Utilisateur
            date_insc = fake.date_time_between(start_date='-1y', end_date='now')
            cur.execute("""
                INSERT INTO utilisateur (id, nom, email, phone, institution, role_enum, account_id, profile_id,
                                       date_inscription, city, country, state, street_address, zipcode)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'France', 'France', %s, %s)
            """, (uid, nom, email, phone, institution, role, uid, uid, date_insc,
                  fake.city(), fake.street_address().replace("'", "''"), fake.postcode()))

            if role == 'ETUDIANT':
                etudiants.append(uid)
            elif role == 'ENSEIGNANT':
                enseignants.append(uid)
            else:
                admins.append(uid)

        # Tables spécialisées
        print("   → Insertion des Etudiants/Enseignants/Admins...")
        for eid in etudiants:
            niveau = random.choice(['Licence 3', 'Master 1', 'Master 2', 'Ingénieur'])
            cur.execute("INSERT INTO etudiant (id, niveau_etude) VALUES (%s, %s)", (eid, niveau))

        for eid in enseignants:
            cur.execute("""
                INSERT INTO enseignant (id, specialite, est_valide, diplome)
                VALUES (%s, %s, %s, %s)
            """, (eid, random.choice(['IA', 'Cybersécurité', 'Génie Logiciel']),
                  random.random() > 0.2, 'Doctorat'))

        for aid in admins:
            cur.execute("INSERT INTO administrateur (id) VALUES (%s)", (aid,))

        # Posts (exemple)
        print("   → Insertion des Posts...")
        post_types = ['OffreStage'] * 120 + ['SujetThese'] * 50 + ['ProjetTuteure'] * 30
        for i in range(NB_POSTS_TO_ADD):
            pid = start_post_id + i
            auteur = random.randint(start_id, start_id + NB_USERS_TO_ADD - 1)
            ptype = post_types[i % len(post_types)]
            titre = fake.sentence(nb_words=7).replace("'", "''")
            desc = fake.paragraph(nb_sentences=4).replace("'", "''")
            date_pub = fake.date_time_between(start_date='-6m', end_date='now')

            cur.execute("""
                INSERT INTO post (id, titre, description, date_publication, auteur_id, type_post,
                                like_count, share_count, comment_count, date_limite)
                VALUES (%s, %s, %s, %s, %s, %s, 0, 0, 0, %s)
            """, (pid, titre, desc, date_pub, auteur, ptype,
                  None if ptype != 'OffreStage' else fake.date_between(start_date='+15d', end_date='+90d')))

        conn.commit()
        print(f"\n✅ Insertion terminée avec succès !")
        print(f"   → {NB_USERS_TO_ADD} nouveaux utilisateurs ajoutés (IDs {start_id} à {start_id + NB_USERS_TO_ADD - 1})")
        print(f"   → {NB_POSTS_TO_ADD} nouveaux posts ajoutés")

    except Exception as e:
        conn.rollback()
        print(f"❌ Erreur lors de l'insertion : {e}")
    finally:
        conn.close()


if __name__ == "__main__":
    os.system("pip install faker psycopg2-binary")
    main()