import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import importModel from './importModel.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

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

// FILMS

const catalogueFilms = {
    "chucky": { 
        answers: ["chucky", "child's play", "jeu d'enfant"], 
        id: "tt0094862" 
    },
    "casque - martyrs": { 
        answers: ["martyrs"], 
        id: "tt1029234" 
    },
    "masque - scream": { 
        answers: ["scream", "ghostface"], 
        id: "tt0117588" 
    },
    "masque - vendredi 13": { 
        answers: ["vendredi 13", "friday the 13th", "jason voorhees"], 
        id: "tt0080761" 
    },
    "masque - le silence des agneaux": { 
        answers: ["le silence des agneaux", "the silence of the lambs", "hannibal lecter"], 
        id: "tt0102926" 
    },
    "chapeau krugger": { 
        answers: ["freddy", "les griffes de la nuit", "a nightmare on elm street"], 
        id: "tt0087800" 
    },
    "botte": { 
        answers: ["wolf creek"], // Si c'est la botte de Mick Taylor
        id: "tt0429247" 
    },
    "cassette the ring": { 
        answers: ["the ring", "le cercle", "samara"], 
        id: "tt0298130" 
    },
    "ballon - it": { 
        answers: ["it", "ça", "grippe-sou", "pennywise"], 
        id: "tt1396484" 
    },
    "animatronix": { 
        answers: ["fnaf", "five nights at freddy's"], 
        id: "tt4589256" 
    },
    "skate": { 
        answers: ["it", "ça", "georgie"], 
        id: "tt1396484" 
    },
    "casque - the descent": { 
        answers: ["the descent"], 
        id: "tt0435625" 
    },
    "chaise -conjuring": { 
        answers: ["the conjuring", "les dossiers warren"], 
        id: "tt1457767" 
    },
    "masque sans les yeux": { 
        answers: ["eyes without a face", "les yeux sans visage"], // Ressemble au masque de dollface
        id: "tt0053459" 
    },
    "robe de chambre exorciste": { 
        answers: ["lexorciste", "the exorcist", "regan"], 
        id: "tt0070047" 
    },
    "masque micheal myers": { 
        answers: ["halloween", "michael myers"], 
        id: "tt0077651" 
    },
    "oeil-blackchristmas": { 
        answers: ["black christmas"], 
        id: "tt0071222" 
    },
    "rideau de douche-psychose": { 
        answers: ["psychose", "psycho"], 
        id: "tt0054215" 
    },
    "noeud_papillon_saw": { 
        answers: ["saw", "jigsaw"], 
        id: "tt0387564" 
    },
    "tenue de clown-hell house": { 
        answers: ["hell house", "hell house llc"], 
        id: "tt5073948" 
    },
    "mitaines_terrifier": { 
        answers: ["terrifier", "art the clown"], 
        id: "tt3503448" 
    },
    "tricycle shinning": { 
        answers: ["the shining", "shining"], 
        id: "tt0081505" 
    },
    "TV - poltergeist": { 
        answers: ["poltergeist"], 
        id: "tt0084503" 
    }
};


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

// Plafond (Applique le matériau texturé directement ici)
const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), ceilingMat);
ceiling.position.y = 5;
ceiling.rotation.x = Math.PI / 2;
scene.add(ceiling);

/**
 * 6. LA PORTE & LE TROU NOIR
 */
const hP = 3.5; 
const lP = 1.5;

const portePivot = new THREE.Group();
portePivot.position.set(-4.95, 0, 3);
portePivot.rotation.y = (Math.PI / 2) + 0.4;
scene.add(portePivot);

const porteMesh = new THREE.Mesh(new THREE.BoxGeometry(lP, hP, 0.1), porteMat);
porteMesh.position.set(0, hP/2, lP/2);
porteMesh.castShadow = true;
portePivot.add(porteMesh);

const noirMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(lP * 1.5, hP * 1.1),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
);
noirMesh.position.set(-5.1, hP/2, 3 + lP/2);
noirMesh.rotation.y = Math.PI / 2;
scene.add(noirMesh);


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
    } else {
        // --- ON REPREND ---
        pauseMenu.style.display = 'none';
        controls.lock();
        demarrerChrono(); // Relance le chrono là où il s'était arrêté
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
        alert("L'ESPRIT NE RECONNAÎT PAS CE NOM...");
        tentativeActuelle = "";
        document.getElementById('word-display').innerText = "";
        
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
        } else {
            fill.style.background = "linear-gradient(90deg, #222, #444)"; // Gris sombre
        }
    }
}

// 3. Validation et connexion TMDB (Version Ultra-Stable)
document.getElementById('confirm-ouija').onclick = async () => {
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
            const urlId = `https://api.themoviedb.org/3/find/${filmData.id}?api_key=${apiKey}&external_source=imdb_id&language=fr-FR`;
            const respId = await fetch(urlId);
            const dataId = await respId.json();

            if (dataId.movie_results && dataId.movie_results.length > 0) {
                afficherFicheFilm(dataId.movie_results[0]);
            } 
            else {
                // ÉTAPE 2 : FALLBACK - Si l'ID échoue, on cherche par le nom
                console.warn("ID non trouvé, tentative par nom...");
                const nomRecherche = filmData.answers[0]; 
                const urlSearch = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(nomRecherche)}&language=fr-FR`;
                
                const respSearch = await fetch(urlSearch);
                const dataSearch = await respSearch.json();

                if (dataSearch.results && dataSearch.results.length > 0) {
                    afficherFicheFilm(dataSearch.results[0]);
                } else {
                    alert("L'esprit est confus : impossible de trouver l'affiche.");
                }
            }
        } catch (error) {
            console.error("Erreur TMDB:", error);
        }
        
    } else {
        // ÉCHEC
        alert("L'ESPRIT RESTE MUET... CE N'EST PAS LE BON NOM.");
        tentativeActuelle = "";
        document.getElementById('word-display').innerText = "";
        
        santeMentale -= 20;
        if (typeof updateSanityUI === "function") updateSanityUI();
        
        if (santeMentale <= 0) alert("VOTRE SANTÉ MENTALE EST ÉPUISÉE...");
    }
};

async function afficherFicheFilm(movie) {
    const card = document.getElementById('movie-info-card');
    const content = document.getElementById('card-content');
    
    // TMDB utilise poster_path, title, et release_date (minuscules !)
    const posterUrl = movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
        : "https://via.placeholder.com/200x300?text=Pas+d'image";

    const annee = movie.release_date ? movie.release_date.split('-')[0] : "N/A";

    content.innerHTML = `
        <h2 style="color:#ff0000; font-family: 'Courier New'; margin:0; text-align: center">OBJET EXORCISÉ</h2>
        <img src="${posterUrl}" style="width:160px; border: 2px solid #8b0000; margin: 10px auto; box-shadow: 0 0 15px rgba(255,0,0,0.5);">
        <h3 style="color:white; margin:0;">${movie.title} (${annee})</h3>
        <p style="color:#ccc; font-size:0.85rem; font-style:italic; max-width:280px; margin: 10px auto; line-height:1.2;">
            ${movie.overview || "L'histoire de cet objet reste nimbée de mystère..."}
        </p>
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
