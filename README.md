# LE GRENIER — Expérience immersive via une scène 3D
**Le Grenier** est une application web immersive qui fusionne les codes du jeu d'horreur (Escape Game) avec un système de recherche de données cinématographiques dynamique. Plutôt que de consulter une liste de films statique, l'utilisateur doit explorer un environnement 3D et "exorciser" des objets phares de films d'horreur, plus ou moins connus, pour libérer l'information.

<img width="1710" height="949" alt="Capture d’écran 2026-05-07 à 09 22 21" src="https://github.com/user-attachments/assets/70c42234-e0cb-40b9-9201-2e59d522ec48" />


## Concept & gamification

L'objectif est d'humaniser et de ludifier la recherche d'information. Le projet repose sur trois piliers:
1.  **Exploration 3D:** Une navigation à la première personne dans un grenier hanté.
2.  **Interface diégétique (Ouija):** Une mécanique de saisie intégrée à l'univers narratif pour valider les connaissances de l'utilisateur.
3.  **Data dynamique:** Une connexion directe à une base de données mondiale (TMDB) pour une expérience toujours renouvelée.

<img width="1708" height="949" alt="Capture d’écran 2026-05-08 à 16 57 39" src="https://github.com/user-attachments/assets/92047150-ddb8-4e01-a78a-7a3ecdf50c12" />


## Stack technique

* **Moteur 3D :** [Three.js](https://threejs.org/) (Rendu WebGL, gestion des lumières, Raycasting).
* **Données :** [TMDB API](https://www.themoviedb.org/documentation/api) (Récupération asynchrone des métadonnées films).
* **Narration :** Génération de voix narrative via ElevenLabs.
* **Bundler & Tooling :** Vite.js, Vercel (Déploiement continu).
* **Langages :** JavaScript (ES6+), HTML5, CSS3.



## Fonctionnalités clés

### 1. Système de Raycasting & interaction
Utilisation d'un `Raycaster` pour projeter un vecteur depuis la caméra et calculer les intersections avec les meshes 3D (`.glb`). Cela permet une interaction précise avec les objets du décor sans alourdir la boucle de rendu.

### 2. Pipeline de données asynchrones
Lorsqu'un utilisateur soumet une réponse via la planche Ouija:
- Le script normalise la saisie (regex pour les espaces et la casse).
- Une requête `fetch` asynchrone est envoyée à l'API TMDB.
- Les métadonnées (posters, synopsis, réalisateur etc.) sont injectées dynamiquement dans le DOM sans recharger la page.

### 3. Moteur de deedback & état du jeu
Gestion d'un système de santé mentale et d'un chronomètre global. En cas d'erreur, le moteur déclenche une série d'événements coordonnés:
- **Shaders visuels :** Overlay de "sang" et secousses de caméra.
- **Audio spatial :** Lecture synchronisée d'effets sonores (stabbing, cris).

###
