import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

export default function importModel(scene){

    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/")

    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);
    const skate = new THREE.Group();
    scene.add(skate);
    
    gltfLoader.load('models/skate.glb', (gltf) => {
        const model = gltf.scene;
        console.log(model)
        skate.add(model)
    })
}; 