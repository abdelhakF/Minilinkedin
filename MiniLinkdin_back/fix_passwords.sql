-- =============================================================================
-- fix_passwords.sql
-- -----------------------------------------------------------------------------
-- But : réparer les comptes seed insérés par data_generation.py qui contiennent
--       de FAUX hashes BCrypt (chaîne pseudo-aléatoire ne correspondant à aucun
--       mot de passe), ce qui provoque un HTTP 401 "Invalid credentials" au
--       login même quand l'utilisateur "connaît" son mot de passe.
--
-- Effet : tous les comptes dont le password n'est pas un BCrypt valide reçoivent
--         le hash BCrypt du mot de passe "Password123!". On peut ensuite se
--         connecter avec n'importe quel email seed + "Password123!".
--
-- Le hash ci-dessous est un vrai BCrypt cost=10, compatible BCryptPasswordEncoder
-- de Spring Security (préfixe $2b$10$).
-- =============================================================================

-- 1) Mettre à jour TOUS les comptes (le hash en BDD peut déjà être un BCrypt
--    valide mais dont on ne connaît plus le mot de passe en clair).
--    => Force-reset inconditionnel.
UPDATE account
SET password = '$2b$10$lJ/IdJM36Qotq.zFKHobQO2.ei3i8HsdFVp57hT2UsAyxnls5PfdC';

-- 2) Vérification : tous les comptes doivent maintenant avoir un hash de 60 chars.
-- SELECT id, length(password) AS len, substring(password, 1, 7) AS prefix, status
-- FROM account
-- ORDER BY id;

-- 3) (Optionnel) Forcer le statut ACTIVE pour les comptes seed bloqués :
-- UPDATE account SET status = 'ACTIVE' WHERE status IS NULL OR status <> 'BANNED';
