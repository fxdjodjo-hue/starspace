// Modulo EMP - Abilità di break lock elettromagnetico
import { AtlasAnimation } from './AtlasAnimation.js';

export class EMP {
    constructor() {
        this.isActive = false;
        this.cooldownTime = 120000; // 2 minuti di cooldown (in ms)
        this.lastUsedTime = 0;
        this.duration = 5000; // 5 secondi di durata
        this.activationTime = 0;
        
        // Raggio dell'effetto EMP
        this.empRadius = 200;
        
        // Animazione atlas
        this.empAnimation = null;
        this.animationLoaded = false;
        this.empAudio = null;
        
        // Carica l'animazione
        this.loadAnimation();
    }

    // Carica l'animazione atlas
    async loadAnimation() {
        try {
            const response = await fetch('skills/emp/emp.atlas');
            const atlasData = await response.text();

            this.empAnimation = new AtlasAnimation(
                atlasData,
                'skills/emp/emp.png',
                144, // frameWidth
                144  // frameHeight
            );

            // Imposta la durata dell'animazione (5 secondi per 32 frame)
            this.empAnimation.frameDuration = 5000 / 32; // ~156ms per frame

            this.animationLoaded = true;
        } catch (error) {
            console.error('❌ Errore caricamento animazione EMP:', error);
        }
    }

    // Controlla se l'EMP può essere usato
    canUse() {
        const currentTime = Date.now();
        return (currentTime - this.lastUsedTime) >= this.cooldownTime;
    }

    // Ottiene il tempo rimanente del cooldown
    getCooldownRemaining() {
        const currentTime = Date.now();
        const elapsed = currentTime - this.lastUsedTime;
        return Math.max(0, this.cooldownTime - elapsed);
    }

    // Ottiene la percentuale di cooldown (0-1)
    getCooldownProgress() {
        const remaining = this.getCooldownRemaining();
        return 1 - (remaining / this.cooldownTime);
    }

    // Attiva l'EMP
    activate(ship, enemies) {
        if (!this.canUse()) {
            return false;
        }

        // Costo in StarEnergy
        const energyCost = 30;
        if (!ship.useStarEnergy(energyCost)) {
            return false;
        }

        this.isActive = true;
        this.lastUsedTime = Date.now();
        this.activationTime = Date.now();
        
        // Cancella il lock di tutti i nemici nel raggio
        this.breakEnemyLocks(ship, enemies);
        
        // Avvia l'animazione
        if (this.animationLoaded && this.empAnimation) {
            this.empAnimation.play(false, () => {
                this.isActive = false;
                this.stopEMPAudio();
            });
        }
        
        // Avvia l'audio
        this.startEMPAudio();
        
        return true;
    }

    // Cancella il lock di tutti i nemici nel raggio
    breakEnemyLocks(ship, enemies) {
        let locksBroken = 0;
        
        enemies.forEach(enemy => {
            // Calcola la distanza dal player
            const dx = enemy.x - ship.x;
            const dy = enemy.y - ship.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Se il nemico è nel raggio dell'EMP
            if (distance <= this.empRadius) {
                // Cancella il lock se il nemico stava mirando al player
                if (enemy.target === ship || enemy.isLockedOnPlayer) {
                    enemy.target = null;
                    enemy.isLockedOnPlayer = false;
                    enemy.lockTime = 0;
                    locksBroken++;
                }
            }
        });
        
        console.log(`⚡ EMP attivato: ${locksBroken} lock cancellati`);
    }



    // Aggiorna l'effetto
    update() {
        if (!this.isActive) return;
        
        // Aggiorna l'animazione
        if (this.animationLoaded && this.empAnimation) {
            this.empAnimation.update(16); // 16ms = ~60fps
        }
        
        // Controlla se la durata è finita
        const elapsed = Date.now() - this.activationTime;
        if (elapsed >= this.duration) {
            this.isActive = false;
            this.stopEMPAudio();
        }
    }

    // Controlla se il player è immune al targeting
    isPlayerUntargetable() {
        return this.isActive;
    }

    // Disegna l'effetto
    draw(ctx, camera, shipX, shipY) {
        if (!this.isActive) return;
        
        // Disegna l'animazione atlas centrata sul player
        if (this.animationLoaded && this.empAnimation) {
            const centerScreen = camera.worldToScreen(shipX, shipY);
            const animationSize = 200; // Dimensione dell'animazione

            ctx.save();
            ctx.globalCompositeOperation = 'screen'; // Effetto luminoso
            this.empAnimation.draw(
                ctx,
                centerScreen.x - animationSize / 2,
                centerScreen.y - animationSize / 2,
                animationSize,
                animationSize
            );
            ctx.restore();
        }
    }

    // Disegna l'icona nella skillbar
    drawIcon(ctx, x, y, size, isAvailable) {
        // Sfondo dell'icona
        ctx.fillStyle = isAvailable ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.6)';
        ctx.beginPath();
        ctx.roundRect(x, y, size, size, 4);
        ctx.fill();
        
        // Bordo
        ctx.strokeStyle = isAvailable ? 'rgba(255, 255, 255, 0.3)' : 'rgba(100, 100, 100, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Icona EMP (fulmine)
        const centerX = x + size / 2;
        const centerY = y + size / 2;
        const iconSize = size * 0.6;
        
        // Fulmine
        ctx.strokeStyle = isAvailable ? '#00ffff' : 'rgba(150, 150, 150, 0.8)';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        // Parte superiore del fulmine
        ctx.moveTo(centerX - iconSize/4, centerY - iconSize/2);
        ctx.lineTo(centerX + iconSize/4, centerY - iconSize/4);
        ctx.lineTo(centerX - iconSize/6, centerY);
        ctx.lineTo(centerX + iconSize/4, centerY + iconSize/4);
        ctx.lineTo(centerX - iconSize/4, centerY + iconSize/2);
        ctx.stroke();
        
        // Overlay di cooldown se non disponibile
        if (!isAvailable) {
            const cooldownProgress = this.getCooldownProgress();
            const cooldownHeight = size * cooldownProgress;
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.beginPath();
            ctx.roundRect(x, y + size - cooldownHeight, size, cooldownHeight, 4);
            ctx.fill();
            
            // Testo del cooldown
            const remainingSeconds = Math.ceil(this.getCooldownRemaining() / 1000);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(remainingSeconds.toString(), centerX, centerY + 3);
        }
    }

    // Avvia l'audio EMP
    startEMPAudio() {
        if (window.gameInstance && window.gameInstance.audioManager) {
            const audioManager = window.gameInstance.audioManager;
            if (audioManager.sounds.emp) {
                this.empAudio = audioManager.sounds.emp.cloneNode();
                this.empAudio.volume = 0; // Inizia a volume 0 per fade in
                this.empAudio.currentTime = 0;
                this.empAudio.play().catch(e => {
                    console.log('🔇 Errore riproduzione audio EMP:', e);
                });
                this.fadeInAudio(audioManager.masterVolume * audioManager.sfxVolume * 1.0, 200);
            }
        }
    }

    // Ferma l'audio EMP
    stopEMPAudio() {
        if (this.empAudio) {
            this.fadeOutAudio(300);
        }
    }

    // Fade in dell'audio
    fadeInAudio(targetVolume, duration) {
        if (!this.empAudio) return;
        const startVolume = 0;
        const volumeStep = (targetVolume - startVolume) / (duration / 16); // 16ms per step
        let currentVolume = startVolume;
        const fadeInterval = setInterval(() => {
            if (!this.empAudio) { clearInterval(fadeInterval); return; }
            currentVolume += volumeStep;
            if (currentVolume >= targetVolume) { currentVolume = targetVolume; clearInterval(fadeInterval); }
            this.empAudio.volume = currentVolume;
        }, 16);
    }

    // Fade out dell'audio
    fadeOutAudio(duration) {
        if (!this.empAudio) return;
        const startVolume = this.empAudio.volume;
        const volumeStep = startVolume / (duration / 16); // 16ms per step
        let currentVolume = startVolume;
        const fadeInterval = setInterval(() => {
            if (!this.empAudio) { clearInterval(fadeInterval); return; }
            currentVolume -= volumeStep;
            if (currentVolume <= 0) {
                currentVolume = 0;
                this.empAudio.pause();
                this.empAudio.currentTime = 0;
                this.empAudio = null;
                clearInterval(fadeInterval);
                return;
            }
            this.empAudio.volume = currentVolume;
        }, 16);
    }
}
