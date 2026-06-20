# Plateforme d'Apprentissage des Langues (LMS) - Guide d'Architecture

Ce document est un guide pas-à-pas et ultra-pédagogique expliquant l'architecture complète de l'application après son refactoring (découpage modulaire). Il est destiné à tout développeur souhaitant comprendre, maintenir ou reproduire cette application à l'identique.

## 1. Présentation de l'Application

Notre application est un Learning Management System (LMS) axé sur l'apprentissage des langues (anglais/arabe). Elle comporte deux portails distincts :
* **Espace Étudiant (`Student Space`)** : Les élèves peuvent s'y connecter pour consulter leur cursus personnalisé, gagner des points d'expérience (XP), maintenir des séries (streaks) et compléter des leçons interactives multimédias (Vidéos, QCM, Flashcards intelligentes avec algorithme de tolérance aux fautes d'orthographe, Textes à trous, etc.).
* **Espace Professeur (`Teacher Space`)** : Les enseignants peuvent créer du contenu (unités, leçons), configurer un dictionnaire de mots partagé, assigner des devoirs spécifiques aux élèves, et suivre expérimentalement leur historique d'apprentissage.

**Technologies utilisées :**
*   **React (18+)** avec **Vite** pour le rendu client rapide.
*   **TypeScript** pour un typage strict et une sécurité de code.
*   **Tailwind CSS** pour la mise en forme et les animations rapides (`animate-in`, `fade-in`, etc.).
*   **Motion (Framer Motion)** pour les micro-animations des interfaces.
*   **React Router DOM** pour la navigation entre les espaces Professeur et Élève.
*   **LocalStorage** pour la persistance locale de la base de données simulée.

## 2. Piliers Fondamentaux : Design, Langue et Pédagogie

### 🎨 Charte de Design & "Web First"
* **"Web First" Responsif :** L'interface a été originellement pensée pour de grands écrans (tablettes, ordinateurs de bureau pour les élèves en classe / à la maison) permettant de profiter de vastes espaces blancs (negative space), de layouts côte-à-côte (bento grids) pour le tableau de bord du professeur. Bien qu'elle soit pensée "Web First" visuellement, elle est bâtie en `mobile-first` côté code (classes Bootstrap-like de Tailwind) lui permettant de se replier élégamment sur smartphone.
* **Minimalisme et Clarté :** L'accent est mis sur une typographie nette (`Inter` ou polices sans-serif modernes), des ombres douces et des bordures légères (`primary-light`) au lieu de lourds dégradés, minimisant ainsi la charge visuelle de l'apprenant.
* **Micro-interactions (Motion) :** Toute l'interface est accompagnée de douces transitions Framer Motion : feedback visuel immédiat en cas de succès `(vert)` ou d'erreur `(rouge)`, tremblements doux (shake) sur une mauvaise réponse, etc.

### 🌍 Règle Linguistique (UI en Anglais)
* **Application 100% Anglophone :** L'interface de l'application elle-même (menus, boutons `Continue`, `Confirm`, tableaux de bord `Students`, `Tracking`, feedbacks `Correct!`, `Almost perfect`) est **strictement rédigée en anglais**.
* **L'Arabe comme "Data" :** La langue d'apprentissage cible (l'arabe) n'intervient **que dans le cadre pédagogique**, c'est-à-dire en tant que données issues de la base : traductions du vocabulaire, flashcards, lexique cible et phrases-exemples (ex: `أفراد العائلة`).

### 🧠 Principes Pédagogiques
* **Micro-Learning (Bite-sized) :** Chaque leçon est découpée en toutes petites activités linéaires et hautement focalisées (1. Vidéo → 2. Découverte Vocabulaire → 3. Quiz QCM → 4. Lecture) pour maintenir une attention maximale sans surcharge cognitive intellectuelle.
* **Apprentissage Échelonné (Phased Learning) :** Le composant `Flashcard.tsx` n'est pas un banal QCM. Il agit en 3 phases par mot :
  1. *Découverte* : Mémorisation libre du mot et de son image/émoji sans contrainte.
  2. *Reconnaissance* : Test QCM de capacité passive.
  3. *Production Active* : Saisie textuelle forcée au clavier nécessitant une trace mnésique plus forte.
* **Tolérance à l'Erreur Mathématique (Levenshtein) :** L'application intègre un test algorithmique de distance de Levenshtein. Ainsi, on ne punit pas l'élève pour une banale "faute de frappe" d'une consonne. Si la réponse textuelle est *presque exacte*, le système aide l'élève et accorde la victoire, pour ne pas briser la fluidité de l'apprentissage.
* **Lecture Assistée In-Situ :** Dans le module `<ReadingActivity />`, le texte interactif identifie lui-même les termes du dictionnaire. L'élève peut cliquer sur n'importe quel mot inconnu pour faire apparaître un tooltip avec sa définition et traduction, évitant l'arrêt total de la tâche de lecture pour aller chercher un dictionnaire externe.
* **Gamification douce :** Un système positif récompensant l'achèvement des objectifs par un gain d'XP (Experience Points).

## 3. Architecture et Cartographie du Projet (Project Map)

Voici l'arborescence complète et refactorisée de l'application :

```text
├── src/
│   ├── components/
│   │   ├── TeacherDashboard/
│   │   │   ├── AddWordModal.tsx
│   │   │   ├── DictionaryTab.tsx
│   │   │   ├── LessonEditor.tsx
│   │   │   ├── OrganizationTab.tsx
│   │   │   ├── ParametersTab.tsx
│   │   │   ├── ReadingActivityEditor.tsx
│   │   │   ├── ReadingActivityTabs/
│   │   │   │   └── InteractionTab.tsx
│   │   │   ├── SelectFlashcardWordsModal.tsx
│   │   │   ├── StudentsTab.tsx
│   │   │   ├── TextScanner.tsx
│   │   │   ├── TrackingTab.tsx
│   │   │   ├── TrackingTabAssignedCourses.tsx
│   │   │   └── TrackingTabHistory.tsx
│   │   ├── Button.tsx
│   │   ├── Cloze.tsx
│   │   ├── Flashcard.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── ReadingActivity.tsx
│   │   └── VideoActivity.tsx
│   ├── data/
│   │   └── mockData.ts
│   ├── hooks/
│   │   ├── useCourseData.ts
│   │   ├── useDictionaryData.ts
│   │   └── useStudentsData.ts
│   ├── modules/
│   │   ├── Flashcard/
│   │   │   ├── FlashcardDiscovery.tsx
│   │   │   ├── FlashcardPhaseIndicators.tsx
│   │   │   ├── FlashcardRecognize.tsx
│   │   │   └── FlashcardWrite.tsx
│   │   └── Reading/
│   │       ├── InteractiveText.tsx
│   │       ├── UnscrambleStep.tsx
│   │       └── VocabWord.tsx
│   ├── spaces/
│   │   ├── LessonRunner.tsx
│   │   ├── StudentDashboard.tsx
│   │   ├── StudentSpace.tsx
│   │   ├── TeacherDashboard.tsx
│   │   └── TeacherSpace.tsx
│   ├── utils/
│   │   ├── audio.ts
│   │   ├── dateUtils.ts
│   │   ├── emoji.ts
│   │   ├── initData.ts
│   │   ├── lessonRunnerBuilder.ts
│   │   └── levenshtein.ts
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   ├── types.ts
│   └── vite-env.d.ts
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 4. Dictionnaire des Fichiers (Explications détaillées)

L'architecture est décomposée pour respecter le principe de responsabilité unique (SOLID), et pour éviter l'engorgement d'un seul fichier (éviter de dépasser la limite de tokens ou de rendre le projet illisible).

### `/src/types.ts`
*   **Rôle :** Recense toutes les interfaces TypeScript (`StudentStatus`, `Lesson`, `FlashcardConfig`, `Role`, etc.).
*   **Dépendances :** Il est importé par l'immense majorité des composants pour typer correctement les props et les états.

### `/src/App.tsx` et `/src/main.tsx`
*   **Rôle :** Point d'entrée de l'application. Configure le routeur (`BrowserRouter`) qui redirige `/` vers l'Espace Étudiant et `/teacher` vers l'Espace Professeur.

### `/src/utils/` (Fonctionnalités utilitaires découplées)
*   **`audio.ts` :** Contient la fonction `playAudio(text)` utilisant `speechSynthesis` pour lire les mots aux élèves.
*   **`dateUtils.ts` :** Fournit `formatRelativeTime(date)` (ex. "Il y a 2 heures", "Just now") utilisée pour le tracking d'historique.
*   **`emoji.ts` :** Expose `getEmojiForWord(word)` permettant de simuler et générer de façon quasi-déterministe un emoji associé à n'importe quel mot (quand il n'y a pas d'image).
*   **`initData.ts` :** Gère `ensureInitialized()`, qui hydrate le localStorage lors du tout premier démarrage.
*   **`lessonRunnerBuilder.ts` :** Fonction critique `buildConfiguredLesson(...)`. Transforme des configurations de leçons JSON abstraites enregistrées par le prof, en une structure prête à être jouée (résolution des dictionnaire, mapping de flashcards).
*   **`levenshtein.ts` :** Expose l'algorithme mathématique de distance de Levenshtein (`levenshtein(a, b)`) servant à évaluer la "tolérance" lors des fautes de frappe de l'élève (typo).

### `/src/data/` (Structures de boot mock)
*   **`mockData.ts` :** Contient les squelettes par défaut poussés dans le local storage (ex: l'unité 1 en mode démo avec "Greeting Basics").

### `/src/hooks/` (Logique de stockage local découplée)
*   `useCourseData.ts`, `useDictionaryData.ts`, `useStudentsData.ts` : Ce sont des Custom Hooks React. Ils encapsulent la lecture et sauvegarde dans le LocalStorage afin que les composants UI ne fassent pas d'appels natifs à chaque render, facilitant d'ailleurs un remplacement par une véritable API à l'avenir.

### `/src/spaces/` (Points d'entrée des grandes sections)
*   **`StudentSpace.tsx` :** Portail étudiant (Gère le formulaire de connexion de l'élève, et décide s'il faut lui afficher le dashboard, ou lancer une leçon (`LessonRunner`)). Utilise `buildConfiguredLesson` pour hydrater la leçon au lancement.
*   **`TeacherSpace.tsx` :** Formulaire de connexion des profs, qui ouvre ensuite `TeacherDashboard`.
*   **`StudentDashboard.tsx` :** Interface vitrine de l'élève affichant les Unités / Leçons, son XP et sa progression statistique.
*   **`TeacherDashboard.tsx` :** Chef d'orchestre complexe du mode Éditeur du professeur. Contient de nombreux onglets gérés par ses enfants, ainsi qu'un état lourd listant les étudiants.
*   **`LessonRunner.tsx` :** L'une des pièces maîtresses. Gère un tableau d'activités (tableau de bord linéaire) et affiche successivement chaque type d'exercice (`Flashcard`, `Cloze`, `Reading`, `VideoActivity`).

### `/src/components/` (Composants partagés majeurs)
*   **`Button.tsx` / `ProgressBar.tsx` :** Composants UI génériques ultra-réutilisables.
*   **`Cloze.tsx` :** Jeu du texte à trous, où l'élève clique sur une réponse parmi plusieurs.
*   **`VideoActivity.tsx` :** Étape de lecture vidéo YouTube/externe bloquant la progression tant que la vidéo n'est pas lue.
*   **`Flashcard.tsx` :** Le parent orchestrant le processus cognitif des flashcards. Il est divisé en modules.
*   **`ReadingActivity.tsx` :** Le système de lecture enrichi avec texte audio. Il est divisé en modules.

### `/src/modules/Flashcard/` (Sous-composants granulaires du jeu de vocabulaire)
*   **`FlashcardDiscovery.tsx`** : Phase 1 - Affiche purement le mot, émoji et son exemple à découvrir. Lève l'évènement "Continuons".
*   **`FlashcardRecognize.tsx`** : Phase 2 - Exercice sous forme de QCM (Question à Choix Multiples) pour tester la reconnaissance.
*   **`FlashcardWrite.tsx`** : Phase 3 - L'étape la plus dure, demandant de taper au clavier le mot en gérant le focus d'un input Ref, l'algorithme de Levenshtein pour des "Presque bon !", et le système d'indices (première lettre, longueur...).
*   **`FlashcardPhaseIndicators.tsx`** : Affiche les "points 1 - 2 - 3" dynamiques en tête de carte permettant de voir où en est l'élève dans l'acquisition du mot.

### `/src/modules/Reading/` (Sous-composants de lecture)
*   **`InteractiveText.tsx` & `VocabWord.tsx` :** Recherche des occurrences de vocabulaire dans un paragraphe et génère des popovers intelligents (tooltips) pour afficher la traduction en cliquant sur un mot clé en plein texte.
*   **`UnscrambleStep.tsx` :** Mécanique de Drag & Drop (glisser-déposer HTML5) pour remettre les mots de la phrase dans l'ordre.

### `/src/components/TeacherDashboard/` (Système complet du Professeur)
*   **`OrganizationTab.tsx` :** Interface "glisser-déposer" permettant de créer des Unités et des Leçons au sein de l'unité.
*   **`StudentsTab.tsx` :** Gestion du CRUD (Create, Read, Update, Delete) des fiches de connexion élèves.
*   **`TrackingTab.tsx` :** Chef d'orchestre du reporting. Affiche les élèves sur le côté. Sous-divisé avec :
    *   **`TrackingTabAssignedCourses.tsx`** : Affiche les leçons à assigner à un élève, et gère la file d'attente d'assignation.
    *   **`TrackingTabHistory.tsx`** : Interface de logs (Timeline d'évènements) prouvant visuellement à quelle heure l'élève a réalisé ses actions.
*   **`DictionaryTab.tsx` / `AddWordModal.tsx` :** Gère la base de données lexicale locale au sein de l'application LMS.
*   **`TextScanner.tsx` :** Extrait heuristiquement les mots d'un block de texte et suggère de les intégrer au dictionnaire.
*   **`LessonEditor.tsx` & `ReadingActivityEditor.tsx` :** Interfaces avancées pour la configuration pas-à-pas des paramètres d'une leçon (Video, Flashcards, Quiz).

## 5. Guide d'Installation et de Lancement

Afin d'exécuter ce projet fraîchement téléchargé ou copié, effectuez obligatoirement ces étapes depuis la racine (`/`) du projet :

1.  **Installer les dépendances NPM :**
    Ouvrez le terminal et tapez :
    ```bash
    npm install
    # Cela installera react, vite, motion, tailwindcss, react-router-dom, et lucide-react etc.
    ```

2.  **Démarrer le serveur de développement Vite :**
    Exécutez :
    ```bash
    npm run dev
    ```

3.  **Accéder à l'application :**
    Ouvrez la page locale indiquée dans la console par le terminal (généralement [http://localhost:5173](http://localhost:5173) ou [http://localhost:3000](http://localhost:3000) si imposé par le container).

    *Par défaut, la première fenêtre sera l'espace élève (vous pouvez simuler une session avec le lien en bas "Teacher Portal" situé vers l'espace professeur).*

> **Note sur la persistance** : Si des erreurs inexpliquées d'anciens rendus apparaissent ou que la base refuse de se vider, ouvrez les "*DevTools*" (F12) > "*Application*" > "*Local Storage*" et effacez tout le local storage de l'URL concernée, puis rafraîchissez la page !
