import * as THREE from "three";
import resize from "./resize.js";

const canvas = document.querySelector(".webgl");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight, 
    0.1, 
    10000,
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

// créer le cube et l'ajouter à la scène
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: "purple" });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

const group = new THREE.Group();
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

group.position.y = -1;

// render la scène
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

animate();