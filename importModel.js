import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

export default function importModel(scene) {

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    function chargerModele(fichier, options = {}) {
        const {
            position = { x: 0, y: 0, z: 0 },
            rotation = { x: 0, y: 0, z: 0 },
            scale    = { x: 1, y: 1, z: 1 },
            castShadow   = true,
            receiveShadow = true,
        } = options;

        loader.load(
            encodeURI(`models/${fichier}`),

            (gltf) => {
                const model = gltf.scene;
                model.name = fichier.replace('.glb', '');

                model.position.set(position.x, position.y, position.z);
                model.rotation.set(rotation.x, rotation.y, rotation.z);
                model.scale.set(scale.x, scale.y, scale.z);

                model.traverse((enfant) => {
                    if (enfant.isMesh) {
                        enfant.castShadow    = castShadow;
                        enfant.receiveShadow = receiveShadow;
                    }
                });

                scene.add(model);
                console.log(`✅ ${fichier} chargé`);
            },

            (xhr) => {
                console.log(`⏳ ${fichier} : ${Math.round(xhr.loaded / xhr.total * 100)}%`);
            },

            (err) => {
                console.error(`❌ Erreur sur ${fichier} :`, err);
            }
        );
    }

    // =========================================================
    //   📦 MODÈLES
    // =========================================================

    chargerModele('chucky.glb', {
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: Math.PI, z: 0 },
        scale:    { x: 1, y: 1, z: 1 },
    });

    chargerModele('casque.glb', {
        position: { x: 0, y: 0, z: -3 },
        rotation: { x: 0, y: 0, z: 0 },
        scale:    { x: 1, y: 1, z: 1 },
    });

    // --- MASQUES collés aux murs, en hauteur ---

    chargerModele('scream.glb', {
        position: { x: -4.8, y: 2.5, z: -2 },   // mur gauche
        rotation: { x: 0, y: Math.PI / 2, z: 0 },
        scale:    { x: 1, y: 1, z: 1 },
    });

    chargerModele('jason.glb', {
        position: { x: 4.8, y: 2.5, z: -2 },    // mur droit
        rotation: { x: 0, y: -Math.PI / 2, z: 0 },
        scale:    { x: 0.8, y: 0.8, z: 0.8 },
    });

    chargerModele('myiers.glb', {
        position: { x: -2, y: 2.5, z: -4.8 },   // mur du fond gauche
        rotation: { x: 0, y: 0, z: 0 },
        scale:    { x: 1, y: 1, z: 1 },
    });

    chargerModele('masque sans les yeux.glb', {
        position: { x: 2, y: 2.5, z: -4.8 },    // mur du fond droit
        rotation: { x: 0, y: 0, z: 0 },
        scale:    { x: 1, y: 1, z: 1 },
    });

    chargerModele('hannibal.glb', {
        position: { x: 0, y: 2.5, z: -4.8 },    // mur du fond centre
        rotation: { x: 0, y: 0, z: 0 },
        scale:    { x: 1.2, y: 1.2, z: 1.2 },
    });

    // --- CHAPEAU — mur gauche en hauteur ---
    chargerModele('chapeau krugger.glb', {
    position: { x: -4.8, y: 2.5, z: 1 },
    rotation: { x: 0, y: Math.PI / 2, z: -Math.PI / 2 },
    scale:    { x: 0.7, y: 0.7, z: 0.7 },
});

    chargerModele('clown.glb', {
    position: { x: -4.8, y: 0.5, z: 0 },
    rotation: { x: 0, y: Math.PI / 2, z: 0 },
    scale:    { x: 0.02, y: 0.02, z: 0.02 },
});
    // --- BOTTE — plus petite, décalée à gauche ---
    chargerModele('botte.glb', {
        position: { x: -2, y: 0, z: 1 },
        scale:    { x: 0.6, y: 0.6, z: 0.6 },
    });

    // --- CASSETTE — à côté des gants ---
    chargerModele('cassette the ring.glb', {
        position: { x: 1.8, y: 0.3, z: 0.5 },
        scale:    { x: 0.5, y: 0.5, z:0.5 },
    });

    chargerModele('ballon.glb', {
        position: { x: 2, y: 3, z: 0 },
        scale:    { x: 0.02, y: 0.02, z: 0.02 },
    });

    chargerModele('animatronix.glb', {
        position: { x: -4, y: 0, z: -4 },
        rotation: { x: 0, y: Math.PI / 4, z: 0 },
        scale:    { x: 4, y: 4, z: 4},
    });

//chargerModele('enseigne.glb', {
       // position: { x: -4.5, y: 0, z: -4.5 },
      //  rotation: { x: 0, y: Math.PI / 4, z: 0 },
      //  scale:    { x: 2, y: 2, z: 2 },
   // });

    chargerModele('skate.glb', {          
    position: { x: 3, y: 0, z: 2 },
    scale: { x: 1, y: 1, z: 1 },
    });


    chargerModele('casque.glb', {
    position: { x: -1.7, y: 1.6, z: -3.8 },  // sur la table
    rotation: { x: 0, y: 0, z: 0 },
    scale:    { x: 0.01, y: 0.01, z: 0.01 },  // un peu plus petit
});

    chargerModele('chaise.glb', {
        position: { x: 3, y: 0, z: -4 },
        rotation: { x: 0, y: Math.PI / 3, z: 0 },
        scale:    { x: 0.02, y: 0.02, z: 0.02 },
    });

    // --- ROBE — COLLE SUR LE MUR DE DROITE ---
    chargerModele('robe de chambre exorciste.glb', {
        position: { x: 4, y: 0, z: 0.6 },
        rotation: { x: 0, y: -Math.PI / 2, z: 0 },
        scale:    { x: 2, y: 2, z: 2 },
    });

    chargerModele('oeil-blackchristmas.glb', {
        position: { x: -4.8, y: 1.75, z: 3.75 },
        rotation: { x: 0, y: Math.PI / 2, z: 0 },
        scale:    { x: 0.1, y: 0.1, z: 0.1 },
    });

    // --- RIDEAU ---
    chargerModele('rideau.glb', {
        position: { x: 0, y: 2.5, z: -4.5 },
        scale:    { x: 0.03, y: 0.03, z: 0.03 },
    });

    // --- TV — en dessous du rideau ---
    chargerModele('TV.glb', {
        position: { x: 0, y: 1.5, z: -4 },
        scale:    { x: 0.02, y: 0.02, z: 0.02 },
    });

    chargerModele('noeud_papillon_saw.glb', {
        position: { x: 1, y: 0.5, z: 2 },
        scale:    { x: 0.5, y: 0.5, z: 0.5 },
    });

    chargerModele('chapeau krugger.glb', {
        position: { x: 1, y: 1.5, z: -4 },
        rotation: { x: 0, y: Math.PI / 2, z: -Math.PI / 2 },
        scale:    { x: 0.7, y: 0.7, z: 0.7 },
    });

    // --- GANTS ---
    chargerModele('mitaines_terrifier.glb', {
        position: { x: 1, y: 0, z: 0.5 },
        scale:    { x: 0.3, y: 0.3, z: 0.3 },
    });

    // --- TRICYCLE — à la place de la botte ---
    chargerModele('tricycle shinning.glb', {
        position: { x: -1, y: 0, z: 1 },
        rotation: { x: 0, y: Math.PI / 2, z: 0 },
        scale:    { x: 1, y: 1, z: 1 },
    });

    // --- PANNEAU — mur droit fond ---
        chargerModele('panneau.glb', {
        position: { x: 4, y: 0, z: -3 },
        rotation: { x: 0, y: -Math.PI / 4, z: 0 },
        scale:    { x: 0.04, y: 0.04, z: 0.04 },
    });

        chargerModele('Workbench.glb', {
        position: { x: 0, y: 0, z: -4 },
        rotation: { x: 0, y: 0, z: 0 },
        scale:    { x: 0.9, y: 0.9, z: 0.9 },
    });
    chargerModele('persian_rug.glb', {
        position: { x: 1.8, y: 0.3, z: 0.5 },
        scale:    { x: 0.01, y: 0.01, z:0.01 },
    });


}   
