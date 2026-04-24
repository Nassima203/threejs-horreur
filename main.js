/*
import * as THREE from 'three';
// On ajoute l'import des contrôles
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import importModel from './importModel.js';


// 1. La Scène (le monde)
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // Un fond très sombre pour l'ambiance


// 2. La Caméra (Vision 3D)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(2, 1.6, 4); // On recule la caméra pour voir la chambre


importModel(scene)

// 3. Le Rendu (Renderer)
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Indispensable pour les ombres !
document.body.appendChild(renderer.domElement);

function animate() {
    requestAnimationFrame(animate); // On demande au navigateur de redessiner
    renderer.render(scene, camera); // On affiche la scène
}

animate(); // On lance la boucle d'animation

// Création d'un petit cube de test
//const geometry = new THREE.BoxGeometry(1, 1, 1);
//const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); // Un cube vert
//const cube = new THREE.Mesh(geometry, material);
//scene.add(cube);

// Ajout d'une petite lumière pour y voir quelque chose
const light = new THREE.AmbientLight(0xffffff, 1); // Lumière blanche partout
scene.add(light);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Ajoute un effet d'inertie fluide

// Le Sol
const floorGeometry = new THREE.PlaneGeometry(10, 10);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 }); // Gris clair 

const floor = new THREE.Mesh(floorGeometry, floorMaterial);

floor.rotation.x = -Math.PI / 2; // On le couche à plat
floor.receiveShadow = true;      // Important pour les ombres portées !
scene.add(floor);

const textureLoader = new THREE.TextureLoader();

// Charge une image de bois (trouve une texture de "dark wood floor" libre de droits)
const floorTexture = textureLoader.load('darkwoodenfloor.jpg');
floorTexture.wrapS = THREE.RepeatWrapping; // Répéter la texture
floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(4, 4); // Répète 4 fois sur la surface pour éviter l'effet étiré

const floorMaterialCalculated = new THREE.MeshStandardMaterial({ 
    map: floorTexture, 
    roughness: 0.8 // Un vieux sol n'est pas brillant
});

floor.material = floorMaterialCalculated;

// Géométrie : Largeur 10, Hauteur 5, Épaisseur 0.1
const wallGeometry = new THREE.BoxGeometry(10, 5, 0.1);
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });

const backWall = new THREE.Mesh(wallGeometry, wallMaterial);

// Positionnement : 
// On le monte de 2.5 (la moitié de sa hauteur) pour qu'il soit posé SUR le sol
// On le recule de 5 (le bord du sol)
backWall.position.set(0, 2.5, -5); 

scene.add(backWall);

// --- MUR DE GAUCHE ---
const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
leftWall.position.set(-5, 2.5, 0); // On le décale à gauche (-5 sur X)
leftWall.rotation.y = Math.PI / 2; // On le fait pivoter de 90 degrés
scene.add(leftWall);

// --- MUR DE DROITE ---
const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
rightWall.position.set(5, 2.5, 0); 
rightWall.rotation.y = -Math.PI / 2; 
scene.add(rightWall);



// --- LE PLAFOND ---
// On réutilise la géométrie du sol
const ceilingGeometry = new THREE.PlaneGeometry(10, 10);
const ceilingMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 }); // Plus sombre
const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);

ceiling.position.y = 5; // Hauteur du mur
ceiling.rotation.x = Math.PI / 2; // On le tourne pour qu'il regarde vers le bas
scene.add(ceiling);



// Création d'un petit cube de test
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); // Un cube vert
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Fonction utilitaire pour créer un cube
function ajouterUnCube(nom, largeur, hauteur, profondeur, x, z, couleur) {
    const geom = new THREE.BoxGeometry(largeur, hauteur, profondeur);
    const mat = new THREE.MeshStandardMaterial({ color: couleur });
    const mesh = new THREE.Mesh(geom, mat);

    // Positionnement : on calcule Y pour que le bas touche le sol (0)
    mesh.position.set(x, hauteur / 2, z);
    mesh.name = nom;
    
    // Activation des ombres pour ce cube
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    scene.add(mesh);
    return mesh;
}

// Syntaxe : ajouterUnCube("Nom", Largeur, Hauteur, Profondeur, X, Z, Couleur)

ajouterUnCube("Cube1", 1, 1, 1, 0, 0, 0x00ff00);       // Vert au milieu
ajouterUnCube("Cube2", 1.5, 2.5, 0.8, -3.5, -4, 0xffff00); // jaune au fond à gauche
ajouterUnCube("Cube3", 0.6, 0.6, 0.6, -4, 1, 0x331a00);    // Marron à gauche
ajouterUnCube("Cube4", 0.8, 0.4, 0.8, 2, 2, 0xff0000);      // Rouge devant à droite
ajouterUnCube("Cube5", 0.5, 3, 0.5, 4, -4, 0x0000ff);    // Bleu au fond à droite

// Fonction pour créer un cube à n'importe quelle hauteur
function ajouterObjetEspace(nom, taille, x, y, z, couleur) {
    const geom = new THREE.BoxGeometry(taille, taille, taille);
    const mat = new THREE.MeshStandardMaterial({ color: couleur });
    const mesh = new THREE.Mesh(geom, mat);

    // Ici, 'y' détermine la hauteur par rapport au sol (0)
    mesh.position.set(x, y, z);
    mesh.name = nom;
    
    scene.add(mesh);
    return mesh;
}

// Syntaxe : (Nom, Taille, X, Y, Z, Couleur)

// Un cube qui flotte très haut au centre (Lustre ?)
ajouterObjetEspace("Cube6", 0.5, 0, 4, 0, 0xffff00); 

// Un cube au milieu de la hauteur, près du mur du fond
ajouterObjetEspace("Cube7", 0.8, 2, 2.5, -3, 0x00ffff);

// Un petit cube qui lévite juste au-dessus du sol
ajouterObjetEspace("Cube8", 0.3, -2, 1.2, 2, 0xff00ff);

// Une rangée de cubes en diagonale dans le vide
ajouterObjetEspace("Cube9", 0.4, -3, 1, -1, 0xffffff);
ajouterObjetEspace("Cube10", 0.4, -3, 2, -2, 0xffffff);
ajouterObjetEspace("Cube11", 0.4, -3, 3, -3, 0xffffff);

*/

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import importModel from './importModel.js';

/**
 * 1. CONFIGURATION DE BASE
 */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111); // Un gris très sombre pour le fond

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 5, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; 
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

/**
 * 2. ÉCLAIRAGE DE TRAVAIL
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2); 
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 0.7);
sunLight.position.set(5, 10, 7);
sunLight.castShadow = true;
sunLight.intensity = 1.2
scene.add(sunLight);

// PointLight(couleur, intensité, distance, dégradation)
const bulbLight = new THREE.PointLight(0xffffff, 80, 20); 

// On la place au centre (0), près du plafond (4.5), et un peu vers le milieu (0)
bulbLight.position.set(0, 4.5, 0); 
bulbLight.castShadow = true; // Pour que les cubes fassent des ombres au sol
scene.add(bulbLight);

// Optionnel : Un petit cube blanc pour voir où est ton ampoule
const bulbGeometry = new THREE.SphereGeometry(0.1);
const bulbMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
const bulbMesh = new THREE.Mesh(bulbGeometry, bulbMaterial);
bulbMesh.position.copy(bulbLight.position);
scene.add(bulbMesh);
/**
 * 3. CHARGEMENT DES TEXTURES (Poly Haven)
 */
const textureLoader = new THREE.TextureLoader();

// On charge tes images
const boisColor = textureLoader.load('/assets/woodcolor.jpg');
const boisNormal = textureLoader.load('/assets/bois_normal.jpg');
const boisRough = textureLoader.load('/assets/bois_rough.jpg');

// Réglage de la répétition (UV Mapping)
// On dit à Three.js de répéter l'image pour qu'elle ne soit pas étirée
[boisColor, boisNormal, boisRough].forEach((tex) => {
    tex.wrapS = THREE.RepeatWrapping; 
    tex.wrapT = THREE.RepeatWrapping; 
    tex.repeat.set(4, 2); 
});

/**
 * 4. CRÉATION DES MATÉRIAUX
 */
// Le fameux matériau "Grenier" que tu voulais
const grenierMat = new THREE.MeshStandardMaterial({
    color: 0x5C4D3C, 
    map: boisColor,
    normalMap: boisNormal,
    roughnessMap: boisRough,
    roughness: 1 // Aspect très mat/poussiéreux
});

// Matériau simple pour le plafond
const ceilingMat = new THREE.MeshStandardMaterial({ color: 0x111111 });

/**
 * 5. CONSTRUCTION DU GRENIER
 */
// Géométries
const floorGeom = new THREE.PlaneGeometry(10, 10);
const wallGeom = new THREE.BoxGeometry(10, 5, 0.1);

// Sol
const floor = new THREE.Mesh(floorGeom, grenierMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Mur du fond
const backWall = new THREE.Mesh(wallGeom, grenierMat);
backWall.position.set(0, 2.5, -5);
backWall.receiveShadow = true;
scene.add(backWall);

// Mur Gauche
const leftWall = new THREE.Mesh(wallGeom, grenierMat);
leftWall.position.set(-5, 2.5, 0);
leftWall.rotation.y = Math.PI / 2;
leftWall.receiveShadow = true;
scene.add(leftWall);

// Mur Droite
const rightWall = new THREE.Mesh(wallGeom, grenierMat);
rightWall.position.set(5, 2.5, 0);
rightWall.rotation.y = -Math.PI / 2;
rightWall.receiveShadow = true;
scene.add(rightWall);

// Plafond
const ceiling = new THREE.Mesh(floorGeom, ceilingMat);
ceiling.position.y = 5;
ceiling.rotation.x = Math.PI / 2;
scene.add(ceiling);

// --- CRÉATION DE LA PORTE ENTROUVERTE ---

// --- PORTE SUR LE MUR DE GAUCHE ---

// 1. Le Pivot (Charnière)
const portePivot = new THREE.Group();
// On le place contre le mur de gauche (x = -4.95 pour éviter le clignotement)
// On le décale un peu vers le fond (z = -2)
portePivot.position.set(-4.95, 0, 3); 

// On l'aligne d'abord avec le mur de gauche (90° = Math.PI / 2)
// On ajoute 0.4 pour l'effet entrouvert
portePivot.rotation.y = (Math.PI / 2) + 0.4; 

scene.add(portePivot);

// 2. Le Panneau de la porte
const porteGeom = new THREE.BoxGeometry(1.5, 3.3, 0.1);
const porteMat = new THREE.MeshStandardMaterial({ 
    color: 0x5c4033, 
    roughness: 0.9 
});
const porteMesh = new THREE.Mesh(porteGeom, porteMat);

// 3. Décalage pour la charnière
// La porte se développe le long de l'axe Z maintenant
porteMesh.position.set(0, 1.25, 0.6); 

porteMesh.castShadow = true;
portePivot.add(porteMesh);
/**
 * 6. OBJETS ET MODÈLES
 */
function ajouterUnCube(nom, largeur, hauteur, profondeur, x, z, couleur) {
    const geom = new THREE.BoxGeometry(largeur, hauteur, profondeur);
    const mat = new THREE.MeshStandardMaterial({ color: couleur });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(x, hauteur / 2, z);
    mesh.name = nom;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
}

// Tes cubes de test (ils resteront colorés pour l'instant)
ajouterUnCube("Cube1", 1, 1, 1, 0, 0, 0x00ff00);
ajouterUnCube("Cube2", 1.5, 2.5, 0.8, -3.5, -4, 0xffff00);
ajouterUnCube("Cube5", 0.5, 3, 0.5, 4, -4, 0x0000ff);

// Chargement des modèles GLB externes
importModel(scene);

/**
 * 7. LOGIQUE DE RENDU
 */
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();

// Gestion de la taille de fenêtre (Responsive)
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});