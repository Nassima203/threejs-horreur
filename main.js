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
scene.background = new THREE.Color(0x050505);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.8, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; 
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);
renderer.toneMapping = THREE.CineonToneMapping; // Le meilleur pour l'horreur
renderer.toneMappingExposure = 1.2; // Ajuste la luminosité globale

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 1; 
controls.maxDistance = 5;

controls.minPolarAngle = Math.PI / 4;   // Empêche de regarder trop vers le haut
controls.maxPolarAngle = Math.PI / 2.3;

controls.minAzimuthAngle = -Math.PI / 4; // -90 degrés (Gauche)
controls.maxAzimuthAngle = Math.PI / 4;

controls.enablePan = false;

const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

/**
 * 2. ÉCLAIRAGE
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
ajouterUnCube("Cube1", 1, 1, 1, 0, 0, 0x00ff00);
ajouterUnCube("Cube2", 1.5, 2.5, 0.8, -3.5, -4, 0xffff00);

importModel(scene);

/**
 * 8. BOUCLE FINALE ET ANIMATION
 */
const baseIntensity = 70; 

function animate() {
    requestAnimationFrame(animate);

    // Flicker
    bulbLight.intensity = baseIntensity + (Math.random() - 0.5) * 10;
    if (Math.random() > 0.97) { 
        bulbLight.intensity = Math.random() * 5; 
    }
    bulbMesh.scale.setScalar(0.5 + (bulbLight.intensity / baseIntensity) * 0.5);

    controls.update();
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});