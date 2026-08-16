# 🇩🇿 Algeria Student Toolkit — AST V5

AST V5 est un Student OS front-end sans framework : rapide à héberger sur GitHub Pages et utilisable immédiatement en mode local.

## Fonctionnalités
- Authentification locale + mode démo.
- Authentification cloud Supabase prête à l'emploi.
- Dashboard étudiant.
- Planificateur : tâches, dates, priorités, recherche, filtres, XP et streak.
- Centre des notes : CC/TD/TP + examen + coefficients + pondération configurable.
- Focus Studio : Pomodoro 25/5, Deep Work 50/10, 90/15 et custom, cycles, auto-start, historique.
- Emploi du temps hebdomadaire.
- Flashcards avec répétition espacée simple.
- Défis, niveaux et XP.
- Groupes d'étude + mini chat en mode local.
- Notes rapides.
- Analytics + export JSON.
- Profil, photo, université, spécialité, objectif.
- Dark mode.
- PWA/service worker.
- Responsive mobile.

## Activer les vrais comptes multi-appareils
1. Crée un projet Supabase.
2. Dans Supabase, ouvre **Project Settings → API**.
3. Copie l'URL du projet et la clé **anon/publishable** dans `supabase-config.js`.
4. Dans **SQL Editor**, exécute `supabase-schema.sql`.
5. Dans **Authentication → URL Configuration**, ajoute l'URL de ton GitHub Pages.
6. Recharge le site.

⚠️ Ne mets jamais une clé `service_role` dans le navigateur.

## GitHub Pages
Upload tous les fichiers à la racine du repository, avec `index.html` à la racine. Puis Settings → Pages → Deploy from a branch → `main` / `(root)` → Save.

## Important
Sans configuration Supabase, AST reste totalement fonctionnel en mode local, mais les comptes ne sont pas synchronisés entre appareils. La couche cloud est préparée pour éviter de refaire toute l'architecture plus tard.
