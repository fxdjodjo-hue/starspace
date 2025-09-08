// Modulo FastRepair - Abilità di riparazione rapida
import { AtlasAnimation } from './AtlasAnimation.js';

export class FastRepair {
    constructor() {
        this.isActive = false;
        this.cooldownTime = 120000; // 2 minuti di cooldown (in ms)
        this.lastUsedTime = 0;
        this.duration = 7000; // 7 secondi di durata
        this.healPerSecond = 0; // HP riparati al secondo (calcolato dinamicamente)
        this.activationTime = 0;
        this.healInterval = null;
        
        // Effetti visivi
        this.repairParticles = [];
        this.maxParticles = 20;
        
        // Animazione atlas
        this.repairAnimation = null;
        this.animationLoaded = false;
        this.fastrepairAudio = null;
        
        // Carica l'animazione
        this.loadAnimation();
    }

    // Carica l'animazione atlas
    async loadAnimation() {
        try {
            const response = await fetch('skills/fastrepair/fastrep.atlas');
            const atlasData = await response.text();
            
            this.repairAnimation = new AtlasAnimation(
                atlasData,
                'skills/fastrepair/fastrep1.png',
                640, // frameWidth
                480  // frameHeight
            );
            
            // Imposta la durata dell'animazione (7 secondi per 576 frame - più lenta)
            this.repairAnimation.frameDuration = 7000 / 576; // ~12.2ms per frame
            
            this.animationLoaded = true;
            console.log('🔧 Animazione FastRepair caricata con successo');
        } catch (error) {
            console.error('❌ Errore caricamento animazione FastRepair:', error);
        }
    }

    // Controlla se il FastRepair può essere usato
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

    // Attiva il FastRepair
    activate(ship) {
        if (!this.canUse()) {
            return false;
        }

        // Costo in StarEnergy
        const energyCost = 50;
        if (!ship.useStarEnergy(energyCost)) {
            return false;
        }

        this.isActive = true;
        this.lastUsedTime = Date.now();
        this.activationTime = Date.now();
        
        // Non salviamo la posizione, l'animazione seguirà il player
        
        // Calcola HP da riparare al secondo (30% degli HP massimi in 7 secondi)
        this.healPerSecond = Math.floor(ship.maxHP * 0.30 / 7);
        
        // Avvia la riparazione
        this.startHealing(ship);
        
        // Avvia l'animazione
        if (this.animationLoaded && this.repairAnimation) {
            this.repairAnimation.play(false, () => {
                this.isActive = false;
                this.stopFastRepairAudio();
            });
        }
        
        // Avvia l'audio
        this.startFastRepairAudio();
        
        return true;
    }

    // Avvia il processo di guarigione
    startHealing(ship) {
        // Riparazione immediata
        this.healShip(ship);
        
        // Riparazione ogni 100ms per fluidità
        this.healInterval = setInterval(() => {
            if (!this.isActive) {
                clearInterval(this.healInterval);
                return;
            }
            
            this.healShip(ship);
            
            // Controlla se la durata è finita
            const elapsed = Date.now() - this.activationTime;
            if (elapsed >= this.duration) {
                this.stopHealing();
            }
        }, 100);
    }

    // Ferma la guarigione
    stopHealing() {
        this.isActive = false;
        if (this.healInterval) {
            clearInterval(this.healInterval);
            this.healInterval = null;
        }
        this.repairParticles = [];
    }

    // Ripara la nave
    healShip(ship) {
        if (ship.hp < ship.maxHP) {
            const healAmount = Math.min(this.healPerSecond / 10, ship.maxHP - ship.hp); // /10 perché chiamato ogni 100ms
            ship.hp += healAmount;
            
            // Assicurati che non superi l'HP massimo
            if (ship.hp > ship.maxHP) {
                ship.hp = ship.maxHP;
            }
        }
    }

    // Crea particelle di riparazione
    createRepairParticles(centerX, centerY) {
        this.repairParticles = [];
        
        for (let i = 0; i < this.maxParticles; i++) {
            const angle = (i / this.maxParticles) * Math.PI * 2;
            const speed = 1 + Math.random() * 2;
            const life = 60 + Math.random() * 40; // 60-100 frame di vita
            
            this.repairParticles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: life,
                maxLife: life,
                size: 2 + Math.random() * 3,
                color: this.getRepairParticleColor()
            });
        }
    }

    // Ottiene colore per le particelle di riparazione
    getRepairParticleColor() {
        const colors = [
            '#00ff00', // Verde
            '#00ff88', // Verde acqua
            '#88ff00', // Verde lime
            '#ffffff'  // Bianco
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Aggiorna l'effetto
    update() {
        if (!this.isActive) return;
        
        // Aggiorna l'animazione
        if (this.repairAnimation) {
            this.repairAnimation.update(16); // 16ms = ~60fps
            if (this.repairAnimation.isComplete()) {
                this.isActive = false;
                this.stopFastRepairAudio();
            }
        }
        
        // Aggiorna particelle
        this.repairParticles = this.repairParticles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            particle.vx *= 0.98; // Attrito
            particle.vy *= 0.98;
            return particle.life > 0;
        });
        
        // Controlla se la durata è finita
        const elapsed = Date.now() - this.activationTime;
        if (elapsed >= this.duration) {
            this.stopHealing();
        }
    }

    // Disegna l'effetto
    draw(ctx, camera, shipX, shipY) {
        if (!this.isActive) return;
        
        // Disegna l'animazione atlas centrata sul player
        if (this.animationLoaded && this.repairAnimation) {
            const centerScreen = camera.worldToScreen(shipX, shipY);
            const animationSize = 200; // Dimensione dell'animazione
            
            ctx.save();
            ctx.globalCompositeOperation = 'screen'; // Effetto luminoso
            this.repairAnimation.draw(
                ctx,
                centerScreen.x - animationSize / 2,
                centerScreen.y - animationSize / 2,
                animationSize,
                animationSize
            );
            ctx.restore();
        }
        
        // Disegna particelle di riparazione
        this.repairParticles.forEach(particle => {
            const screenPos = camera.worldToScreen(particle.x, particle.y);
            const alpha = particle.life / particle.maxLife;
            
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(screenPos.x, screenPos.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
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
        
        // Icona FastRepair (croce medica)
        const centerX = x + size / 2;
        const centerY = y + size / 2;
        const iconSize = size * 0.6;
        
        // Croce medica
        ctx.fillStyle = isAvailable ? '#00ff00' : 'rgba(150, 150, 150, 0.8)';
        
        // Asta verticale
        ctx.fillRect(centerX - iconSize/8, centerY - iconSize/2, iconSize/4, iconSize);
        
        // Asta orizzontale
        ctx.fillRect(centerX - iconSize/2, centerY - iconSize/8, iconSize, iconSize/4);
        
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

    // Avvia l'audio FastRepair
    startFastRepairAudio() {
        if (window.gameInstance && window.gameInstance.audioManager) {
            const audioManager = window.gameInstance.audioManager;
            if (audioManager.sounds.fastrepair) {
                this.fastrepairAudio = audioManager.sounds.fastrepair.cloneNode();
                this.fastrepairAudio.volume = 0; // Inizia a volume 0 per fade in
                this.fastrepairAudio.currentTime = 0;
                this.fastrepairAudio.play().catch(e => {
                    console.log('🔇 Errore riproduzione audio FastRepair:', e);
                });
                this.fadeInAudio(audioManager.masterVolume * audioManager.sfxVolume * 1.0, 200);
            }
        }
    }

    // Ferma l'audio FastRepair
    stopFastRepairAudio() {
        if (this.fastrepairAudio) {
            this.fadeOutAudio(300);
        }
    }

    // Fade in dell'audio
    fadeInAudio(targetVolume, duration) {
        if (!this.fastrepairAudio) return;
        const startVolume = 0;
        const volumeStep = (targetVolume - startVolume) / (duration / 16); // 16ms per step
        let currentVolume = startVolume;
        const fadeInterval = setInterval(() => {
            if (!this.fastrepairAudio) { clearInterval(fadeInterval); return; }
            currentVolume += volumeStep;
            if (currentVolume >= targetVolume) { currentVolume = targetVolume; clearInterval(fadeInterval); }
            this.fastrepairAudio.volume = currentVolume;
        }, 16);
    }

    // Fade out dell'audio
    fadeOutAudio(duration) {
        if (!this.fastrepairAudio) return;
        const startVolume = this.fastrepairAudio.volume;
        const volumeStep = startVolume / (duration / 16); // 16ms per step
        let currentVolume = startVolume;
        const fadeInterval = setInterval(() => {
            if (!this.fastrepairAudio) { clearInterval(fadeInterval); return; }
            currentVolume -= volumeStep;
            if (currentVolume <= 0) {
                currentVolume = 0;
                this.fastrepairAudio.pause();
                this.fastrepairAudio.currentTime = 0;
                this.fastrepairAudio = null;
                clearInterval(fadeInterval);
                return;
            }
            this.fastrepairAudio.volume = currentVolume;
        }, 16);
    }
}
