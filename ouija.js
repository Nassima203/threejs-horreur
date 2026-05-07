const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// On exporte les fonctions pour qu'elles soient utilisables dans main.js
export function genererLettresOuija(ajouterLettreCallback) {
    const container = document.getElementById('letters-arc');
    if (!container) return;

    const etages = [
        { lettres: "ABCDEFGHIJKLM", pivot: "250px", bas: "120px", angle: 90 },
        { lettres: "NOPQRSTUVWXYZ", pivot: "180px", bas: "70px", angle: 115 }
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
            div.style.bottom = etage.bas;
            div.style.transformOrigin = `50% ${etage.pivot}`;
            div.style.transform = `translateX(-50%) rotate(${angleRotation}deg)`;

            // On utilise un callback pour communiquer avec le reste du jeu
            div.onclick = () => ajouterLettreCallback(lettre, div);
            container.appendChild(div);
        });
    });
}

export function deplacerPlanchette(element) {
    const planchette = document.getElementById('planchette');
    const boardRect = document.querySelector('.ouija-board').getBoundingClientRect();
    const rect = element.getBoundingClientRect();
    
    if (planchette && boardRect) {
        planchette.style.left = `${rect.left - boardRect.left + rect.width/2}px`;
        planchette.style.top = `${rect.top - boardRect.top + rect.height/2}px`;
    }
}

export function fermerOuija(controls) {
    const overlay = document.getElementById('guess-overlay');
    if (overlay) overlay.style.display = 'none';

    const display = document.getElementById('word-display');
    if (display) display.innerText = "";
    
    const title = document.getElementById('ouija-title');
    if (title) title.innerText = "COMMUNIEZ AVEC L'ESPRIT";

    if (controls && !controls.isLocked) {
        controls.lock();
    }
}