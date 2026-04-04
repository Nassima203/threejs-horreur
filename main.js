/* import * as THREE from "three";
import resize from "./resize.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"; 

console.log(THREE)

const canvas = document.querySelector(".webgl");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight, 
    0.1, 
    10000,
);

scene.background = new THREE.Color('white');

camera.position.z = 5;
scene.add(camera)

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
const placeholderMaterial = new THREE.MeshStandardMaterial({ color: 0xff4444, wireframe: true });

// le sol

const floorGeometry = new THREE.PlaneGeometry(20, 20);
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor)

// murs

const wallGeometry = new THREE.PlaneGeometry(20, 10);

// mur du fond

const wallBack = new THREE.Mesh(wallGeometry, wallMaterial);
wallBack.position.set(0, 5, -10);
scene.add(wallBack);

// mur de gauche

const wallLeft = new THREE.Mesh(wallGeometry, wallMaterial);
wallLeft.rotation.y = Math.PI / 2;
wallLeft.position.set(-10, 5, 0);
scene.add(wallLeft); 

// mur de droite

const wallRight = new THREE.Mesh(wallGeometry, wallMaterial);
wallRight.rotation.y = -Math.PI / 2;
wallRight.position.set(10, 5, 0);
scene.add(wallRight);

// créer le cube et l'ajouter à la scène
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ 
    color: 0x049ef4,
    roughness: 0.5,
    metalness: 0.5,
 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

cube.rotation.set(0.4, 0.2, 0);


/*const group = new THREE.Group();
group.position.x = -2;
group.rotation.x = Math.PI / 4;
scene.add(group);

const redMaterial = new THREE.MeshBasicMaterial({ color: "red"});
const blueMaterial = new THREE.MeshBasicMaterial({ color: "blue"});
const leftCube = new THREE.Mesh(geometry, redMaterial);
leftCube.position.x = -2;
const rightCube = new THREE.Mesh(geometry, blueMaterial);
rightCube.position.x = 2;
const topCube = new THREE.Mesh(geometry, material);
topCube.position.y = 2;
group.add(leftCube);
group.add(rightCube);
group.add(topCube);

group.position.y = -1; */

/* render la scène
renderer.render(scene, camera);
resize(camera, renderer);


function animate(){
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    leftCube.rotation.x += 0.03;
    leftCube.rotation.y += 0.03;
    rightCube.rotation.x += 0.02;
    rightCube.rotation.y += 0.02;
    topCube.rotation.y += -0.03;
    renderer.render(scene, camera);
}



// render la scène
renderer.render(scene, camera);
resize(camera, renderer);

animate(); */

import * as THREE from 'three';
// On ajoute l'import des contrôles
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import importModel from './importModel.js';


// 1. La Scène (le monde)
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505); // Un fond très sombre pour l'ambiance

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

