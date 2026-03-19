import * as THREE from 'three';

// 1. La Scène (le monde)
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505); // Un fond très sombre pour l'ambiance

// 2. La Caméra (Vision 3D)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);
camera.position.set(5, 5, 8); // On recule la caméra pour voir la chambre

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

// On ajoute l'import des contrôles
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Pour une sensation plus fluide

// On ajoute l'import de la fonction de redimensionnement
import resize from './resize.js';
resize(camera, renderer); // On active le redimensionnement de la fenêtre


// Le Sol
const floorGeometry = new THREE.PlaneGeometry(10, 10);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff }); // Blanc
const floor = new THREE.Mesh(floorGeometry, floorMaterial);

floor.rotation.x = -Math.PI / 2; // On le couche à plat
floor.receiveShadow = true;      // Important pour les ombres portées !
scene.add(floor);

// Géométrie : Largeur 10, Hauteur 5, Épaisseur 0.1
const wallGeometry = new THREE.BoxGeometry(10, 5, 0.1);
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xb98f71 }); // Marron
const backWall = new THREE.Mesh(wallGeometry, wallMaterial);

// Positionnement : 
// On le monte de 2.5 (la moitié de sa hauteur) pour qu'il soit posé SUR le sol
// On le recule de 5 (le bord du sol)
backWall.position.set(0, 2.5, -5); 

scene.add(backWall);

// 1. Création d'un matériau spécifique pour les côtés (ex: un gris plus foncé)
const sideWallMaterial = new THREE.MeshStandardMaterial({ color: 0xc5a289 }); // Un beige clair pour les murs latéraux}); 

// 2. Application du matériau au mur de gauche
const leftWall = new THREE.Mesh(wallGeometry, sideWallMaterial);
leftWall.position.set(-5, 2.5, 0);
leftWall.rotation.y = Math.PI / 2;
scene.add(leftWall);

// 3. Application du même matériau au mur de droite
const rightWall = new THREE.Mesh(wallGeometry, sideWallMaterial);
rightWall.position.set(5, 2.5, 0);
rightWall.rotation.y = Math.PI / 2;
scene.add(rightWall);
