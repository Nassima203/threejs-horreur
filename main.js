import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import importModel from './importModel.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { catalogueFilms } from './data.js';

/**
 * CONFIGURATION DE BASE
 */

const API_KEY = "5e7b28ec91823044cb5c980b695d3d85";
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.8, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; 
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.CineonToneMapping; // Le meilleur pour l'horreur
renderer.toneMappingExposure = 1.2; // Ajuste la luminosité globale
document.body.appendChild(renderer.domElement);


// VARIABLES DU JEU

const respiration = new Audio('assets/Human-breath.wav')
respiration.loop = true;     // Le son recommence à l'infini
respiration.volume = 0.04;   // Très bas pour que ce soit subtil et flippant



let objetSurvoleNom = null;
let tentativeActuelle = "";
let tempsRestant = 900;
let chronoInterval;
let santeMentale = 100; 
let nbObjetsTrouves = 0;
const objetsResolus = new Set(); // Stocke les noms des objets déjà trouvés


// Variables pour le mouvement
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();


// Système de contrôles

const controls = new PointerLockControls(camera, document.body);
controls.pointerSpeed = 0.6;

// Écouteurs de touches
const onKeyDown = (event) => {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW': moveForward = true; break;
        case 'ArrowLeft':
        case 'KeyA': moveLeft = true; break;
        case 'ArrowDown':
        case 'KeyS': moveBackward = true; break;
        case 'ArrowRight':
        case 'KeyD': moveRight = true; break;
        case 'KeyE': if (objetSurvoleNom && controls.isLocked) ouvrirOuija(); break;
    }
};

const onKeyUp = (event) => {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW': moveForward = false; break;
        case 'ArrowLeft':
        case 'KeyA': moveLeft = false; break;
        case 'ArrowDown':
        case 'KeyS': moveBackward = false; break;
        case 'ArrowRight':
        case 'KeyD': moveRight = false; break;
    }
};

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

// On lance le verrouillage de la souris au clic sur "Start"
document.getElementById('start-btn').addEventListener('click', () => {
    controls.lock();
});

/**
 *  ÉCLAIRAGE
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); 
scene.add(ambientLight);

const bulbLight = new THREE.PointLight(0xffffff, 70, 20); 
bulbLight.position.set(0, 4.5, 0); 
bulbLight.castShadow = true;
scene.add(bulbLight);

const bulbMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.05),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
);
bulbMesh.position.copy(bulbLight.position);
scene.add(bulbMesh);


/**
 * 3. GESTION DES TEXTURES
 */
const textureLoader = new THREE.TextureLoader();

// --- SOL ---
const boisColor = textureLoader.load('/assets/woodcolor.jpg');
const boisNormal = textureLoader.load('/assets/bois_normal.jpg');
const boisRough = textureLoader.load('/assets/bois_rough.jpg');
[boisColor, boisNormal, boisRough].forEach(t => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(4, 4);
    t.anisotropy = maxAnisotropy;
});

// --- MURS (Clonées & Pivotées) ---
const boisColorWall = boisColor.clone();
const boisNormalWall = boisNormal.clone();
const boisRoughWall = boisRough.clone();
[boisColorWall, boisNormalWall, boisRoughWall].forEach(t => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.center.set(0.5, 0.5);
    t.rotation = Math.PI / 2;
    t.repeat.set(8, 4);
    t.anisotropy = maxAnisotropy;
});

// --- PLAFOND ---
const ceilColor  = textureLoader.load('/assets/ceilingdiffuse.jpg');
const ceilNormal = textureLoader.load('/assets/ceilingnormal.jpg');
const ceilRough  = textureLoader.load('/assets/ceilingrough.jpg');
[ceilColor, ceilNormal, ceilRough].forEach(t => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = maxAnisotropy;
    t.repeat.set(3, 3);
});


// --- PORTE ---
const porteColor = textureLoader.load('/assets/portediffuse.jpg');
const porteNormal = textureLoader.load('/assets/portenormal.jpg');
const porteRough = textureLoader.load('/assets/porterough.jpg');
[porteColor, porteNormal, porteRough].forEach(t => { t.anisotropy = maxAnisotropy; });

/**
 * 4. MATÉRIAUX
 */
const floorMat = new THREE.MeshStandardMaterial({
    color: 0x7B5E43, map: boisColor, normalMap: boisNormal, roughnessMap: boisRough
});

const wallMat = new THREE.MeshStandardMaterial({
    color: 0x5C4D3C, map: boisColorWall, normalMap: boisNormalWall, roughnessMap: boisRoughWall
});

const ceilingMat = new THREE.MeshStandardMaterial({
    map: ceilColor, normalMap: ceilNormal, roughnessMap: ceilRough,
    color: 0x666666, roughness: 1, side: THREE.DoubleSide
});

const porteMat = new THREE.MeshStandardMaterial({
    map: porteColor, normalMap: porteNormal, roughnessMap: porteRough, side: THREE.DoubleSide
});

/**
 * 5. CONSTRUCTION DU GRENIER
 */
// Sol
const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Murs
const backWall = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 0.1), wallMat);
backWall.position.set(0, 2.5, -5);
backWall.receiveShadow = true;
scene.add(backWall);

const leftWall = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 0.1), wallMat);
leftWall.position.set(-5, 2.5, 0);
leftWall.rotation.y = Math.PI / 2;
leftWall.receiveShadow = true;
scene.add(leftWall);

const rightWall = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 0.1), wallMat);
rightWall.position.set(5, 2.5, 0);
rightWall.rotation.y = -Math.PI / 2;
rightWall.receiveShadow = true;
scene.add(rightWall);


const frontWall = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 0.1), wallMat);
frontWall.position.set(0, 2.5, 5);
frontWall.receiveShadow = true;
scene.add(frontWall);

// Plafond 
const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), ceilingMat);
ceiling.position.y = 5;
ceiling.rotation.x = Math.PI / 2;
scene.add(ceiling);



/**
 * 7. OBJETS
 */
function ajouterUnCube(nom, largeur, hauteur, profondeur, x, z, couleur) {
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(largeur, hauteur, profondeur),
        new THREE.MeshStandardMaterial({ color: couleur })
    );
    mesh.position.set(x, hauteur / 2, z);
    mesh.name = nom;
    mesh.castShadow = true;
    scene.add(mesh);
}
//ajouterUnCube("Cube1", 1, 1, 1, 0, 0, 0x00ff00);
//ajouterUnCube("Cube2", 1.5, 2.5, 0.8, -3.5, -4, 0xffff00);

importModel(scene);

/**
 * 8. BOUCLE FINALE ET ANIMATION
 */
const baseIntensity = 70; 
const clock = new THREE.Clock(); 

function animate() {
    requestAnimationFrame(animate);

    // flicker
    bulbLight.intensity = baseIntensity + (Math.random() - 0.5) * 10;
    if (Math.random() > 0.97) { 
        bulbLight.intensity = Math.random() * 5; 
    }
    bulbMesh.scale.setScalar(0.5 + (bulbLight.intensity / baseIntensity) * 0.5);

  
    renderer.render(scene, camera);
    if (controls.isLocked) {
        const delta = clock.getDelta(); // Temps écoulé entre deux images
        raycaster.setFromCamera({ x: 0, y: 0 }, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);
        let intersectionNom = null;

        if (intersects.length > 0) {
            let obj = intersects[0].object;
            while (obj.parent && !catalogueFilms[obj.name]) obj = obj.parent;
            if (catalogueFilms[obj.name] && intersects[0].distance < 3.5) intersectionNom = obj.name;
        }
        objetSurvoleNom = intersectionNom;
        document.getElementById('interaction-prompt').style.display = objetSurvoleNom ? 'block' : 'none';

        velocity.x -= velocity.x * 15.0 * delta;
        velocity.z -= velocity.z * 15.0 * delta;

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize();

        if (moveForward || moveBackward) velocity.z -= direction.z * 150.0 * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * 150.0 * delta;

        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);

        const limite = 4.7;
        camera.position.x = Math.max(-limite, Math.min(limite, camera.position.x));
        camera.position.z = Math.max(-limite, Math.min(limite, camera.position.z));
        
        // On garde une hauteur constante (yeux à 1.60m environ)
        camera.position.y = 1.6; 
    }

    renderer.render(scene, camera);
    
}
animate();

// Configuration du storytelling
const voiceLines = [
    { text: "Allô ? Y a-t-il quelqu'un ?", audio: "assets/line1.mp3" },
    { text: "S'il vous plaît... pouvez-vous m'ouvrir la porte ?", audio: "assets/line2.mp3" },
    { text: "Je suis coincée. Je n'arrive pas à sortir seule.", audio: "assets/line3.mp3" },
    { text: "Faites vite, s'il vous plaît. Ça fait si longtemps que je suis là.", audio: "assets/line4.mp3" },
    { text: "J'entends vos pas. Vous êtes si près.", audio: "assets/line5.mp3" },
    { text: "S'il vous plaît... ouvrez juste la porte.", audio: "assets/line6.mp3" },
    { text: "Merci. Merci d'être venu.", audio: "assets/line7.mp3" },
];


let lineIndex = 0;
const subtitleEl = document.getElementById('story-subtitle');
const uiReveal = document.getElementById('main-ui-reveal');

// On attend la première interaction (clic ou touche) pour lancer l'histoire
window.addEventListener('keydown', startIntro, { once: true });
window.addEventListener('mousedown', startIntro, { once: true });

function startIntro() {
    // Optionnel : Lancer une musique d'ambiance très sourde ici
    playNextLine();
}

function playNextLine() {
    if (lineIndex < voiceLines.length) {
        const line = voiceLines[lineIndex];
        
        // 1. Mise à jour et affichage du texte
        subtitleEl.innerText = line.text;
        subtitleEl.style.opacity = 1;

        // 2. Création et lecture de l'audio
        const snd = new Audio(line.audio);
        snd.volume = 0.6; // Ajuste selon la puissance de tes enregistrements
        
        snd.play().catch(e => console.error("Erreur lecture audio:", e));

        // 3. Quand l'audio est fini, on passe à la suite
        snd.onended = () => {
            subtitleEl.style.opacity = 0; // Disparition du texte
            lineIndex++;
            
            // Petite pause de silence de 1.5 seconde entre les répliques
            setTimeout(playNextLine, 1500);
        };
    } else {
        // Toutes les lignes sont finies -> On révèle le titre et le bouton
        revealMainUI();
    }
}

function revealMainUI() {
    subtitleEl.style.display = 'none';
    
    // Le bruit de porte qui "ouvre" le menu
    const doorCreak = new Audio('assets/door-opening.wav');
    doorCreak.volume = 0.5;
    doorCreak.play();

    uiReveal.style.display = 'block';
    setTimeout(() => {
        uiReveal.style.opacity = 1;
        uiReveal.style.transition = "opacity 2s ease-in-out";
    }, 100);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


const timerElement = document.getElementById('timer-display');

function demarrerChrono() {
    // On nettoie au cas où un chrono tourne déjà
    clearInterval(chronoInterval);

    chronoInterval = setInterval(() => {
        tempsRestant--;

        // Formater le temps (minutes:secondes)
        const minutes = Math.floor(tempsRestant / 60);
        const secondes = tempsRestant % 60;
        
        // Affichage avec des "0" pour le style (ex: 09:05)
        timerElement.innerText = 
            `${minutes.toString().padStart(2, '0')}:${secondes.toString().padStart(2, '0')}`;

        // Si le temps est écoulé
        if (tempsRestant <= 0) {
            terminerPartie(false); // false = perdu
        }
        
        // Effet visuel : si moins de 30 secondes, le texte clignote
        if (tempsRestant < 30) {
            timerElement.style.color = (tempsRestant % 2 === 0) ? '#ff0000' : '#330000';
        }

    }, 1000); // S'exécute toutes les secondes (1000ms)
}

function terminerPartie(victoire) {
    clearInterval(chronoInterval);
    if (victoire) {
        alert("Félicitations, vous avez survécu !");
    } else {
        alert("Le temps est écoulé... vous faites partie du grenier maintenant.");
        // Ici, tu pourras appeler ton écran de défaite avec le screamer !
    }
}

const landingPage = document.getElementById('landing-page')

document.getElementById('start-btn').addEventListener('click', () => {
    // 1. Cacher la landing page
    landingPage.style.display = 'none';

    if (respiration) {
        respiration.play()
            .then(() => {
                console.log("Ambiance sonore activée au démarrage");
            })
            .catch(err => console.log("L'audio n'a pas pu se lancer :", err));
    }
    
    // 2. Lancer le jeu
    demarrerChrono();
    
    // 3. (Optionnel) Lancer la musique d'ambiance
});

let estEnPause = false;

function togglePause() {
    estEnPause = !estEnPause;
    const pauseMenu = document.getElementById('pause-menu');

    if (estEnPause) {
        // --- ON PAUSE ---
        clearInterval(chronoInterval); // Arrête le décompte
        pauseMenu.style.display = 'flex';
        controls.unlock(); // Bloque la caméra pour ne pas tricher
        console.log("Jeu en pause");

        if (respiration) respiration.pause(); // Arrête le souffle d'homme
        if (isMoving) stopWalking();        // Arrête les pas si le joueur marchait
        
    } else {
        // --- ON REPREND ---
        pauseMenu.style.display = 'none';
        controls.lock();
        demarrerChrono(); // Relance le chrono là où il s'était arrêté

        if (respiration) {
            respiration.play().catch(e => console.log("Audio en attente..."));
        }
        console.log("Reprise du jeu");
    }
}

// Écouter la touche "Echap" ou "P" pour mettre en pause
window.addEventListener('keydown', (event) => {
    if (event.key === "Escape" || event.key === "p" || event.key === "P") {
        // On ne met en pause que si le jeu a déjà commencé
        if (landingPage.style.display === 'none') {
            togglePause();
        }
    }
});

// Lier le bouton "Reprendre" du menu
document.getElementById('resume-btn').addEventListener('click', togglePause);

// Lier le bouton "Menu Principal" (recharge la page)
document.getElementById('home-btn').addEventListener('click', () => {
    window.location.reload();
});

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(0, 0); // Toujours le centre de l'écran en FPS
window.addEventListener('mousedown', (event) => {
    if (!controls.isLocked) return;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        let objetTouche = intersects[0].object;
        const distance = intersects[0].distance; // Distance entre toi et l'objet

        // On cherche le parent qui a le nom du fichier .glb
        while (objetTouche.parent && !catalogueFilms[objetTouche.name]) {
            objetTouche = objetTouche.parent;
        }

        // Vérification du nom ET de la distance (ex: 3 mètres max)
        if (catalogueFilms[objetTouche.name]) {
            if (distance <= 3.5) { 
                console.log("Objet valide touché :", objetTouche.name);
                preparerSaisie(objetTouche.name);
            } else {
                console.log("Trop loin de l'objet :", Math.round(distance), "mètres");
            }
        }
    }
});
function preparerSaisie(nomObjet) {
    const overlay = document.getElementById('guess-overlay');
    const input = document.getElementById('guess-input');
    
    controls.unlock(); // Libère la souris
    overlay.style.display = 'flex';
    input.value = "";
    input.focus();

    // On stocke l'ID de l'objet en cours pour la validation
    overlay.dataset.currentObject = nomObjet;
}

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";


// 1. Génération de l'arc de cercle au chargement
function genererLettresOuija() {
    const container = document.getElementById('letters-arc');
    const totalLettres = alphabet.length;

    // Définition des deux rangées
    const etages = [
        { lettres: "ABCDEFGHIJKLM", pivot: "250px", bas: "120px", angle: 90 }, // Étage supérieur
        { lettres: "NOPQRSTUVWXYZ", pivot: "180px", bas: "70px", angle: 115 }   // Étage inférieur
    ];

    etages.forEach((etage) => {
        const chars = etage.lettres.split('');
        const nb = chars.length;
        const step = etage.angle / (nb - 1);
        const start = -(etage.angle / 2);

        chars.forEach((lettre, i) => {
            const div = document.createElement('div');
            div.className = 'ouija-letter';
            div.innerText = lettre;

            const angleRotation = start + (i * step);
            
            // On applique la hauteur et le pivot spécifique à l'étage
            div.style.bottom = etage.bas;
            div.style.transformOrigin = `50% ${etage.pivot}`;
            div.style.transform = `translateX(-50%) rotate(${angleRotation}deg)`;

            div.onclick = () => ajouterLettre(lettre, div); //
            container.appendChild(div);
        });
    });
    
}

function ouvrirOuija() {
    controls.unlock();
    document.getElementById('guess-overlay').style.display = 'flex';
    tentativeActuelle = "";
    document.getElementById('word-display').innerText = "";
}

window.fermerOuija = () => {
    // 1. Cacher le grand overlay (qui contient le plateau)
    const overlay = document.getElementById('guess-overlay');
    if (overlay) overlay.style.display = 'none';

    // 2. Réinitialiser la saisie pour la prochaine fois
    tentativeActuelle = "";
    const display = document.getElementById('word-display');
    if (display) display.innerText = "";
    
    // 3. Remettre le titre original si besoin
    const title = document.getElementById('ouija-title');
    if (title) title.innerText = "COMMUNIEZ AVEC L'ESPRIT";

    // 4. RÉACTIVER LES CONTRÔLES (Crucial pour Three.js)
    if (controls && !controls.isLocked) {
        controls.lock();
    }
};

// 2. Interaction avec la planchette
function ajouterLettre(lettre, element) {
    tentativeActuelle += lettre;
    document.getElementById('word-display').innerText = tentativeActuelle;
    
    // Déplacer la planchette vers la lettre
    const planchette = document.getElementById('planchette');
    const rect = element.getBoundingClientRect();
    const boardRect = document.querySelector('.ouija-board').getBoundingClientRect();
    
    planchette.style.left = `${rect.left - boardRect.left + rect.width/2}px`;
    planchette.style.top = `${rect.top - boardRect.top + rect.height/2}px`;

    
}

// On récupère le bouton Espace par son ID
const boutonEspace = document.getElementById('space-btn');

if (boutonEspace) {
    boutonEspace.onclick = () => {
        // 1. On ajoute un espace à la chaîne de caractères
        tentativeActuelle += "\u2009";;
        
        // 2. On met à jour l'affichage visuel pour le joueur
        const wordDisplay = document.getElementById('word-display');
        if (wordDisplay) {
            wordDisplay.innerText = tentativeActuelle;
        }
        
        // Petit effet sonore si tu en as un pour les touches
        // if (typeof soundClick !== 'undefined') soundClick.play();
    };
}

// bouton pour effacer une lettre 
const btnNon = document.getElementById('btn-non');

if (btnNon) {
    btnNon.onclick = () => {
        if (tentativeActuelle.length > 0) {
            // 1. On retire le dernier caractère (la dernière lettre)
            tentativeActuelle = tentativeActuelle.slice(0, -1);

            // 2. On met à jour l'affichage visuel
            const wordDisplay = document.getElementById('word-display');
            if (wordDisplay) {
                wordDisplay.innerText = tentativeActuelle;
            }

            // 3. Optionnel : un petit son de "clic" ou de "frottement"
            // if (typeof soundBack !== 'undefined') soundBack.play();
        }
    };
}


document.getElementById('confirm-ouija').onclick = async () => {
    const filmData = catalogueFilms[objetSurvoleNom];
    const match = filmData.answers.some(a => a.replace(/\s/g, '').toLowerCase() === tentativeActuelle.replace(/\s/g, '').toLowerCase());

    if (match) {
        if (!objetsResolus.has(objetSurvoleNom)) {
            objetsResolus.add(objetSurvoleNom);
            nbObjetsTrouves++;
            document.getElementById('objets-trouves').innerText = nbObjetsTrouves;

            if (typeof updateSanityUI === "function") updateSanityUI(); 
        }

        const apiKey = "5e7b28ec91823044cb5c980b695d3d85";
        const url = `https://api.themoviedb.org/3/find/${filmData.id}?api_key=${apiKey}&external_source=imdb_id&language=fr-FR`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.movie_results && data.movie_results.length > 0) {
                // On envoie le premier film trouvé à la fonction d'affichage
                afficherFicheFilm(data.movie_results[0]); 
            } else {
                alert("Film trouvé dans le code, mais l'affiche est introuvable sur TMDB.");
            }
        } catch (error) {
            console.error("Erreur TMDB:", error);
        }
        
    } else {
        tentativeActuelle = "";
        document.getElementById('word-display').innerText = "";

        // 1. Son de sursaut (un cri étouffé ou un gros boum)
        const scareSound = new Audio('assets/sounds/scare_thud.mp3'); 
        scareSound.volume = 0.8;
        scareSound.play().catch(e => {});

        // 2. Effet Visuel : Flash de sang
        const blood = document.getElementById('blood-overlay');
        if (blood) blood.classList.add('flash-hit');
        
        // 3. Effet Visuel : Secousse de l'écran
        const board = document.querySelector('.ouija-container');
        board.classList.add('shake-game');

        // Nettoyage des classes après l'animation pour pouvoir recommencer
        setTimeout(() => {
            if (blood) blood.classList.remove('flash-hit');
            board.classList.remove('shake-game');
        }, 800);
        
        if (typeof updateSanityUI === "function") updateSanity(25);
    }
};

function updateSanityUI() {
    const fill = document.getElementById('sanity-fill');
    if (fill) {
        // On s'assure que la jauge ne descende pas en dessous de 0
        if (santeMentale < 0) santeMentale = 0;
        
        fill.style.width = santeMentale + "%";

        // Changement de couleur selon l'état critique
        if (santeMentale <= 30) {
            fill.style.background = "linear-gradient(90deg, #500, #b00)"; // Rouge sang
            respiration.volume = 0.4; // Plus fort
        respiration.playbackRate = 1.1; // Un tout petit peu plus rapide
    } else {
        respiration.volume = 0.15;
        respiration.playbackRate = 1.0;
        } 
    }
}

function gameOver() {
    console.log("FONCTION GAME OVER DÉCLENCHÉE"); // Pour vérifier dans la console
    const screen = document.getElementById('game-over-screen');
    
    if (screen) {
        screen.style.display = 'flex'; // On force l'affichage
        screen.style.opacity = '1';
    } else {
        console.error("Erreur : L'élément 'game-over-screen' est introuvable dans le HTML !");
    }
}

// 3. Validation et connexion TMDB (Version Ultra-Stable)
document.getElementById('confirm-ouija').onclick = async () => {
    if (santeMentale <= 0) return;

    const filmData = catalogueFilms[objetSurvoleNom];
    // On nettoie les espaces pour la comparaison
    const saisie = tentativeActuelle.replace(/\s/g, '').toLowerCase();
    const match = filmData.answers.some(a => a.replace(/\s/g, '').toLowerCase() === saisie);

    if (match) {
        // SUCCÈS : On gère le score et la santé
        if (!objetsResolus.has(objetSurvoleNom)) {
            objetsResolus.add(objetSurvoleNom);
            nbObjetsTrouves++;
            document.getElementById('objets-trouves').innerText = nbObjetsTrouves;
            if (typeof updateSanityUI === "function") {
                santeMentale = Math.min(100, santeMentale + 10); // Bonus de réussite !
                updateSanityUI();
            }
        }

        const apiKey = "5e7b28ec91823044cb5c980b695d3d85";
        
        try {
            // ÉTAPE 1 : On tente par l'ID IMDb
            const urlId = `https://api.themoviedb.org/3/movie/${filmData.id}?api_key=${apiKey}&language=fr-FR&append_to_response=credits`;
            const respId = await fetch(urlId);
            const dataId = await respId.json();

            if (dataId && dataId.id) {
                afficherFicheFilm(dataId);
            } 
           
        } catch (error) {
            console.error("Erreur TMDB:", error);
        }
        
    } else {
        // ÉCHEC
        tentativeActuelle = "";
        document.getElementById('word-display').innerText = "";

        const scareSound = new Audio('assets/sounds/scare_thud.mp3'); 
        scareSound.volume = 0.8;
        scareSound.play().catch(e => {});

        // 2. Effet Visuel : Flash de sang
        const blood = document.getElementById('blood-overlay');
        if (blood) blood.classList.add('flash-hit');
        
        // 3. Effet Visuel : Secousse de l'écran
        const board = document.querySelector('.ouija-container');
        board.classList.add('shake-game');

        // Nettoyage des classes après l'animation pour pouvoir recommencer
        setTimeout(() => {
            if (blood) blood.classList.remove('flash-hit');
            board.classList.remove('shake-game');
        }, 800);
        
        santeMentale -= 20;
        if (typeof updateSanityUI === "function") updateSanityUI();
        
        if (santeMentale <= 0) {
        alert("VOTRE SANTÉ MENTALE EST ÉPUISÉE...")
        gameOver();
        }
    }
};

async function afficherFicheFilm(movie) {
    const card = document.getElementById('movie-info-card');
    const content = document.getElementById('card-content');

    const director = movie.credits.crew.find(person => person.job === 'Director')?.name || "Inconnu";
    const runtime = movie.runtime ? `${movie.runtime} min` : "N/A";
    const genres = movie.genres.map(g => g.name).slice(0, 2).join(', '); // On en prend max 2
    const annee = movie.release_date ? movie.release_date.split('-')[0] : "N/A";
    const triviaText = catalogueFilms[objetSurvoleNom].trivia;
    
    // TMDB utilise poster_path, title, et release_date (minuscules !)
    const posterUrl = movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
        : "https://via.placeholder.com/200x300?text=Pas+d'image";


    content.innerHTML = `
        <div style="display: flex; gap: 30px; align-items: stretch; text-align: left;">
            
            <!-- COLONNE GAUCHE : Affiche -->
            <div style="flex: 0 0 240px;">
                <img src="${posterUrl}" style="width: 100%; border: 3px solid #600; box-shadow: 0 0 20px rgba(0,0,0,0.8); border-radius: 2px;">
            </div>

            <!-- COLONNE DROITE : Infos et Anecdote -->
            <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
                
                <div>
                    <h2 style="color: #8b0000; font-family: 'Courier New', monospace; font-size: 0.9rem; margin: 0; letter-spacing: 2px; text-transform: uppercase;">
                        — OBJET EXORCISÉ —
                    </h2>
                    <h1 style="color: white; font-family: 'Georgia', serif; font-size: 2.2rem; margin: 5px 0 15px 0; text-transform: uppercase; border-bottom: 1px solid #444; padding-bottom: 10px;">
                        ${movie.title} <span style="color: #666; font-size: 1.2rem;">(${annee})</span>
                    </h1>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; font-size: 0.85rem; color: #bbb;">
                        <p style="margin: 0;"><strong>🎬 RÉALISATEUR:</strong><br><span style="color: #eee;">${director}</span></p>
                        <p style="margin: 0;"><strong>⏳ DURÉE:</strong><br><span style="color: #eee;">${runtime}</span></p>
                        <p style="margin: 0; grid-column: span 2;"><strong>🏷️ GENRE:</strong><br><span style="color: #eee;">${genres}</span></p>
                    </div>
                </div>

                <div style="background: rgba(139, 0, 0, 0.05); border-left: 4px solid #8b0000; padding: 15px; margin-top: 10px;">
                    <p style="color: #ffd700; font-family: 'Courier New', monospace; font-size: 0.75rem; margin: 0 0 8px 0; font-weight: bold; text-transform: uppercase;">
                        [ Rapport d'exorcisme ]
                    </p>
                    <p style="color: #ddd; font-style: italic; line-height: 1.5; font-size: 0.95rem; margin: 0;">
                        "${triviaText}"
                    </p>
                </div>
            </div>
        </div>
    `;
    
    document.querySelector('.ouija-container').style.display = 'none';
    card.style.display = 'flex';
}

window.retourAuJeu = () => {
    // 1. On cache la fiche et le grand overlay
    document.getElementById('movie-info-card').style.display = 'none';
    document.getElementById('guess-overlay').style.display = 'none';
    
    // 2. On remet le plateau en état pour le prochain objet
    document.querySelector('.ouija-container').style.display = 'block';
    tentativeActuelle = "";
    document.getElementById('word-display').innerText = "";
    
    // 3. On redonne le contrôle au joueur
    controls.lock(); 
};

// N'oublie pas d'appeler genererLettresOuija() au démarrage du script !
genererLettresOuija();

