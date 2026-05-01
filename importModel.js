//import * as THREE from 'three';
//import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
//import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

//export default function importModel(scene){

 //   const dracoLoader = new DRACOLoader()
//    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/")

  //  const gltfLoader = new GLTFLoader();
  //  gltfLoader.setDRACOLoader(dracoLoader);
  //  const skate = new THREE.Group();
  //  scene.add(skate);
    
 //   gltfLoader.load('models/skate.glb', (gltf) => {
 //       const model = gltf.scene;
  //      console.log(model)
   //     skate.add(model)
  //  })
//}; 
//
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

export default function importModel(scene) {

    // --- Setup DRACO (décompression) ---
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    /**
     * Fonction utilitaire pour charger UN modèle
     * 
     * @param {string} fichier     - Nom du fichier dans /models/
     * @param {object} options     - Position, rotation, scale
     */
    function chargerModele(fichier, options = {}) {
        const {
            position = { x: 0, y: 0, z: 0 },   // Position dans la scène
            rotation = { x: 0, y: 0, z: 0 },   // Rotation en radians
            scale    = { x: 1, y: 1, z: 1 },   // Taille (1 = taille originale)
            castShadow   = true,
            receiveShadow = true,
        } = options;

        loader.load(
            `models/${fichier}`,

            // ✅ Succès
            (gltf) => {
                const model = gltf.scene;

                // Appliquer position
                model.position.set(position.x, position.y, position.z);

                // Appliquer rotation (en radians — utilise Math.PI/2 pour 90°)
                model.rotation.set(rotation.x, rotation.y, rotation.z);

                // Appliquer échelle
                model.scale.set(scale.x, scale.y, scale.z);

                // Ombres sur tous les enfants du modèle
                model.traverse((enfant) => {
                    if (enfant.isMesh) {
                        enfant.castShadow    = castShadow;
                        enfant.receiveShadow = receiveShadow;
                    }
                });

                scene.add(model);
                console.log(`✅ ${fichier} chargé`);
            },

            // ⏳ Progression
            (xhr) => {
                console.log(`⏳ ${fichier} : ${Math.round(xhr.loaded / xhr.total * 100)}%`);
            },

            // ❌ Erreur
            (err) => {
                console.error(`❌ Erreur sur ${fichier} :`, err);
            }
        );
    }

    // =========================================================
    //   📦 TES MODÈLES — Ajoute / modifie ici !
    // =========================================================

    chargerModele('chucky.glb', {
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: Math.PI, z: 0 },  // Face caméra
        scale:    { x: 1, y: 1, z: 1 },
    });

    chargerModele('casque - martyrs.glb', {
        position: { x: 2, y: 0, z: -3 },
        rotation: { x: 0, y: 0, z: 0 },
        scale:    { x: 0.5, y: 0.5, z: 0.5 },  // Réduire si trop grand
    });

    chargerModele('masque - scream.glb', {
        position: { x: -2, y: 1, z: -4 },
        rotation: { x: 0, y: Math.PI / 4, z: 0 },
        scale:    { x: 1, y: 1, z: 1 },
    });

    chargerModele('masque - vendredi 13.glb', {
        position: { x: 3, y: 0, z: -2 },
        scale:    { x: 0.8, y: 0.8, z: 0.8 },
    });

    chargerModele('masque - le silence des agneaux.glb', {
        position: { x: -3, y: 0, z: 2 },
        scale:    { x: 1.2, y: 1.2, z: 1.2 },
    });

    chargerModele('chapeau krugger.glb', {
        position: { x: 1, y: 1.5, z: -4 }, // Posé sur quelque chose
        scale:    { x: 0.7, y: 0.7, z: 0.7 },
    });

    chargerModele('botte.glb', {
        position: { x: -1, y: 0, z: 1 },
        scale:    { x: 1, y: 1, z: 1 },
    });

    chargerModele('cassette the ring.glb', {
        position: { x: 0, y: 0.3, z: -3 }, // Un peu au dessus du sol
        scale:    { x: 0.5, y: 0.5, z: 0.5 },
    });

    chargerModele('ballon - it.glb', {
        position: { x: 2, y: 3, z: 0 },   // Flottant dans l'air
        scale:    { x: 1, y: 1, z: 1 },
    });

    chargerModele('animatronix.glb', {
        position: { x: -4, y: 0, z: -4 },  // Coin du grenier
        rotation: { x: 0, y: Math.PI / 2, z: 0 },
        scale:    { x: 1, y: 1, z: 1 },
    });

    chargerModele('enseigne.glb', {
        position: { x: 0, y: 4, z: -4.9 }, // Accroché au mur du fond
        scale:    { x: 1, y: 1, z: 1 },
    });

    chargerModele('damaged_helmet.glb', {
        position: { x: -2, y: 0.5, z: 2 },
        scale:    { x: 0.5, y: 0.5, z: 0.5 },
    });
    chargerModele('skate.glb', {          
    position: { x: 3, y: 0, z: 2 },
    scale: { x: 1, y: 1, z: 1 },
});

    chargerModele('casque - the descent.glb', { 
    position: { x: -3, y: 0, z: -3 },
    scale: { x: 1, y: 1, z: 1 },
});
    chargerModele('chaise -conjuring.glb', {     
    position: { x: 2, y: 0, z: -4 },
    rotation: { x: 0, y: Math.PI / 3, z: 0 },
    scale: { x: 3, y: 3, z: 3 },
});

    chargerModele('masque sans les yeux.glb', {   
    position: { x: -1, y: 1.2, z: -4.5 },
    scale: { x: 1, y: 1, z: 1 },
});

    chargerModele('robe de chambre exorciste.glb', { 
    position: { x: 4, y: 0, z: -3 },
    rotation: { x: 0, y: -Math.PI / 4, z: 0 },
    scale: { x: 2, y: 2, z: 2 },
});

    chargerModele('masque micheal myers.glb', { 
    position: { x: 0, y: 1, z: -4.5 },
    scale: { x: 1, y: 1, z: 1 },
});

   // chargerModele('oeil-blackchristmas.glb', {   
   // position: { x: -4, y: 2, z: -2 },
 // scale: { x: 0.8, y: 0.8, z: 0.8 },
//});

chargerModele('oeil-blackchristmas.glb', {   
    position: { 
        x: -4.8,  // collé sur le mur gauche (là où est la porte)
        y: 1.75,  // hP/2 = 3.5/2 = 1.75, au centre du trou noir
        z: 3.75   // 3 + 1.5/2 = 3.75, centré sur le trou noir
    },
    rotation: { x: 0, y: Math.PI / 2, z: 0 },  // tourné vers la pièce
scale: { x: 0.1, y: 0.1, z: 0.1 },  // l'oeuil est très petit
});

    chargerModele('rideau de douche-psychose.glb', { 
    position: { x: 0, y: 2.5, z: -4.5 },
    scale:    { x: 3, y: 3, z: 3},
});

    chargerModele('noeud_papillon_saw.glb', {     
    position: { x: 1, y: 0.5, z: 2 },
    scale: { x: 1, y: 1, z: 1 },
});

    chargerModele('tenue de clown-hell house.glb', { 
    position: { x: -2, y: 0, z: -2 },
    rotation: { x: 0, y: Math.PI / 6, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
});

    chargerModele('mitaines_terrifier.glb', {    
    position: { x: 3, y: 0, z: 3 },
    scale: { x: 1, y: 1, z: 1 },
});

    chargerModele('tricycle shinning.glb', {  
    position: { x: -3, y: 0, z: 3 },
    rotation: { x: 0, y: Math.PI / 2, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
});

    chargerModele('TV - poltergeist.glb', {      
    position: { x: 0, y: 0, z: -3 },
    scale: { x: 1, y: 1, z: 1 },
});
}