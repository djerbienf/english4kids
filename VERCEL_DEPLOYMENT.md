# Guide de déploiement sur Vercel 🚀

Cette application est entièrement configurée et prête pour un déploiement continu sur **Vercel**.

---

## 🏗️ Architecture Vercel mise en place

1. **Frontend (Vite + React SPA)** :
   - Build automatique généré dans `dist/`.
   - Fichier de configuration `vercel.json` gérant la réécriture d'URL vers `/index.html` pour que toutes les pages (`/`, `/student`, `/teacher`, etc.) fonctionnent au rechargement sans erreur 404.

2. **Backend Serverless Functions (`/api/*`)** :
   - `/api/generate-test` : Générateur IA de tests pédagogiques (Gemini 2.5 Flash).
   - `/api/grade-writing` : Correcteur et évaluateur IA de rédactions d'anglais (Gemini 3.6 Flash).
   - `/api/health` : Endpoint de test de santé.
   - Les fonctions gèrent les en-têtes CORS et l'exécution sans serveur (Serverless).

3. **Base de données Firebase Firestore** :
   - Connectée côté client avec fallback local et synchronisation temps réel.

---

## 📋 Procédure de déploiement

### Méthode 1 : Via l'interface web Vercel (Recommandée)

1. **Pousser le code sur GitHub / GitLab / Bitbucket** :
   - Créez un dépôt et envoyez votre code.

2. **Importer sur Vercel** :
   - Rendez-vous sur [vercel.com](https://vercel.com) et connectez-vous.
   - Cliquez sur **Add New...** > **Project**.
   - Sélectionnez votre dépôt Git puis cliquez sur **Import**.

3. **Vérifier les paramètres du projet** (pré-remplis automatiquement par `vercel.json`) :
   - **Framework Preset** : `Vite`
   - **Root Directory** : `./`
   - **Build Command** : `vite build`
   - **Output Directory** : `dist`

4. **Configurer les variables d'environnement (Environment Variables)** :
   Ajoutez dans les paramètres Vercel :
   - `GEMINI_API_KEY` : Votre clé API Gemini (nécessaire pour les fonctionnalités IA du tableau de bord enseignant et de correction).
   - `VITE_FIREBASE_API_KEY` *(Optionnel)* : Si vous souhaitez utiliser une clé Firebase personnalisée (une clé de secours est déjà configurée par défaut dans `src/lib/firebase.ts`).

5. **Déployer** :
   - Cliquez sur le bouton **Deploy**. Vercel construit le site et configure les fonctions en quelques secondes.

---

### Méthode 2 : Déploiement direct via Vercel CLI

Si vous avez la commande `vercel` installée localement :
```bash
# 1. Connexion
vercel login

# 2. Déploiement initial
vercel

# 3. Ajout de la clé API Gemini
vercel env add GEMINI_API_KEY

# 4. Déploiement en production
vercel --prod
```

---

## 🔒 Configuration Firebase (Domaines Autorisés)

Si vous utilisez des règles d'authentification ou des restrictions de domaine sur Firebase :
1. Rendez-vous sur la [Console Firebase](https://console.firebase.google.com/) > Projet `english4kids-ad606`.
2. Ouvrez **Authentication** > **Settings** > **Authorized domains**.
3. Ajoutez votre domaine Vercel (ex: `mon-application.vercel.app`).
