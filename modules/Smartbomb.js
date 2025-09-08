// Modulo Smartbomb - Abilità ad area
import { AtlasAnimation } from './AtlasAnimation.js';

export class Smartbomb {
    constructor() {
        this.isActive = false;
        this.cooldownTime = 30000; // 30 secondi di cooldown (in ms)
        this.lastUsedTime = 0;
        this.damagePercentage = 0.20; // 20% degli HP totali
        this.radius = 400; // Raggio dell'esplosione
        this.animationDuration = 2500; // Durata animazione (2.5 secondi)
        this.animationStartTime = 0;
        this.explosionAnimation = null;
        this.animationLoaded = false;
        this.smartbombAudio = null; // Audio per la smartbomb
        this.explosionX = 0; // Posizione X dell'esplosione
        this.explosionY = 0; // Posizione Y dell'esplosione
        
        this.loadAnimation();
    }
    
    // Carica l'animazione dell'esplosione
    async loadAnimation() {
        try {
            // Carica i dati dell'atlas
            const atlasResponse = await fetch('skills/smartbomb/nbomb.atlas');
            const atlasData = await atlasResponse.text();
            
            // Crea l'animazione
            this.explosionAnimation = new AtlasAnimation(
                atlasData,
                'skills/smartbomb/nbomb.png',
                181, // frameWidth
                181  // frameHeight
            );
            
            // Imposta la durata del frame per 72 frame in 2.5 secondi (più lenta)
            this.explosionAnimation.frameDuration = 2500 / 72; // ~34.7ms per frame
            
            this.animationLoaded = true;
            console.log('✅ Animazione smartbomb caricata');
        } catch (error) {
            console.error('❌ Errore caricamento animazione smartbomb:', error);
        }
    }

    // Controlla se la smartbomb può essere usata
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

    // Attiva la smartbomb
    activate(ship, enemies, explosionManager) {
        if (!this.canUse()) {
            return false;
        }

        // Costo in StarEnergy
        const energyCost = 60;
        if (!ship.useStarEnergy(energyCost)) {
            return false;
        }

        this.isActive = true;
        this.lastUsedTime = Date.now();
        this.animationStartTime = Date.now();
        
        // Salva la posizione dell'esplosione (dove è stata lanciata)
        this.explosionX = ship.x;
        this.explosionY = ship.y;
        
        // Avvia l'animazione dell'esplosione
        if (this.explosionAnimation && this.animationLoaded) {
            this.explosionAnimation.play(false, () => {
                this.isActive = false;
                // Ferma l'audio quando l'animazione finisce
                this.stopSmartbombAudio();
            });
        }
        
        // Trova tutti i nemici nel raggio
        const targetsInRange = this.findTargetsInRange(ship.x, ship.y, enemies);
        
        // Infligge danno a tutti i bersagli
        this.damageTargets(targetsInRange, explosionManager);
        
        // Avvia suono sincronizzato con l'animazione
        this.startSmartbombAudio();
        
        return true;
    }

    // Trova tutti i nemici nel raggio
    findTargetsInRange(centerX, centerY, enemies) {
        const targets = [];
        
        enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            const distance = Math.sqrt(
                Math.pow(enemy.x - centerX, 2) + 
                Math.pow(enemy.y - centerY, 2)
            );
            
            if (distance <= this.radius) {
                targets.push({
                    enemy: enemy,
                    distance: distance
                });
            }
        });
        
        return targets;
    }

    // Infligge danno ai bersagli
    damageTargets(targets, explosionManager) {
        targets.forEach(target => {
            const enemy = target.enemy;
            const damage = Math.floor(enemy.maxHP * this.damagePercentage);
            
            // Infligge danno
            enemy.takeDamage(damage);
            
            // Crea effetto esplosione per ogni bersaglio
            if (explosionManager) {
                explosionManager.createExplosion(enemy.x, enemy.y, 'smartbomb');
            }
            
            // Se il nemico muore, aggiungi esperienza
            if (!enemy.active && window.gameInstance) {
                const expGained = window.gameInstance.ship.getExpForEnemyType(enemy.type);
                const creditsGained = window.gameInstance.ship.getCreditsForEnemyType(enemy.type);
                const uridiumGained = window.gameInstance.ship.getUridiumForEnemyType(enemy.type);
                const honorGained = window.gameInstance.ship.getHonorForEnemyType(enemy.type);
                
                window.gameInstance.ship.addResource('experience', expGained);
                window.gameInstance.ship.addResource('credits', creditsGained);
                window.gameInstance.ship.addResource('uridium', uridiumGained);
                window.gameInstance.ship.addResource('honor', honorGained);
            }
        });
    }
    
    // Avvia l'audio della smartbomb sincronizzato con l'animazione
    startSmartbombAudio() {
        if (window.gameInstance && window.gameInstance.audioManager) {
            // Ottieni l'audio manager
            const audioManager = window.gameInstance.audioManager;
            
            // Crea una copia dell'audio per controllarlo
            if (audioManager.sounds.smartbomb) {
                this.smartbombAudio = audioManager.sounds.smartbomb.cloneNode();
                this.smartbombAudio.volume = 0; // Inizia a volume 0 per fade in
                this.smartbombAudio.currentTime = 0; // Inizia dall'inizio
                
                // Avvia l'audio
                this.smartbombAudio.play().catch(e => {
                    console.log('🔇 Errore riproduzione audio smartbomb:', e);
                });
                
                // Fade in graduale (200ms)
                this.fadeInAudio(audioManager.masterVolume * audioManager.sfxVolume * 1.2, 200);
            }
        }
    }
    
    // Ferma l'audio della smartbomb
    stopSmartbombAudio() {
        if (this.smartbombAudio) {
            // Fade out graduale (300ms) prima di fermare
            this.fadeOutAudio(300);
        }
    }
    
    // Fade in graduale dell'audio
    fadeInAudio(targetVolume, duration) {
        if (!this.smartbombAudio) return;
        
        const startVolume = 0;
        const volumeStep = (targetVolume - startVolume) / (duration / 16); // 16ms per step
        let currentVolume = startVolume;
        
        const fadeInterval = setInterval(() => {
            if (!this.smartbombAudio) {
                clearInterval(fadeInterval);
                return;
            }
            
            currentVolume += volumeStep;
            if (currentVolume >= targetVolume) {
                currentVolume = targetVolume;
                clearInterval(fadeInterval);
            }
            
            this.smartbombAudio.volume = currentVolume;
        }, 16);
    }
    
    // Fade out graduale dell'audio
    fadeOutAudio(duration) {
        if (!this.smartbombAudio) return;
        
        const startVolume = this.smartbombAudio.volume;
        const volumeStep = startVolume / (duration / 16); // 16ms per step
        let currentVolume = startVolume;
        
        const fadeInterval = setInterval(() => {
            if (!this.smartbombAudio) {
                clearInterval(fadeInterval);
                return;
            }
            
            currentVolume -= volumeStep;
            if (currentVolume <= 0) {
                currentVolume = 0;
                this.smartbombAudio.pause();
                this.smartbombAudio.currentTime = 0;
                this.smartbombAudio = null;
                clearInterval(fadeInterval);
                return;
            }
            
            this.smartbombAudio.volume = currentVolume;
        }, 16);
    }

    // Aggiorna l'animazione
    update(deltaTime = 16) {
        if (!this.isActive || !this.explosionAnimation) return;
        
        // Aggiorna l'animazione dell'esplosione
        this.explosionAnimation.update(deltaTime);
        
        // Se l'animazione è completata, ferma l'effetto
        if (this.explosionAnimation.isComplete()) {
            this.isActive = false;
            this.stopSmartbombAudio();
        }
    }

    // Disegna l'effetto
    draw(ctx, camera) {
        if (!this.isActive || !this.explosionAnimation || !this.animationLoaded) return;
        
        // Calcola la posizione sullo schermo usando la posizione salvata dell'esplosione
        const centerScreen = camera.worldToScreen(this.explosionX, this.explosionY);
        
        // Calcola la dimensione dell'animazione (scalata rispetto al raggio)
        const animationSize = this.radius * 2; // L'animazione copre il diametro del raggio
        
        ctx.save();
        
        // Imposta il blend mode per un effetto più drammatico
        ctx.globalCompositeOperation = 'screen';
        
        // Disegna l'animazione dell'esplosione
        this.explosionAnimation.draw(
            ctx,
            centerScreen.x - animationSize / 2,
            centerScreen.y - animationSize / 2,
            animationSize,
            animationSize
        );
        
        ctx.restore();
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
        
        // Icona smartbomb (cerchio con esplosione)
        const centerX = x + size / 2;
        const centerY = y + size / 2;
        const iconSize = size * 0.6;
        
        // Cerchio centrale
        ctx.fillStyle = isAvailable ? '#ff4444' : 'rgba(150, 150, 150, 0.8)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, iconSize / 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Raggi di esplosione
        ctx.strokeStyle = isAvailable ? '#ffff44' : 'rgba(150, 150, 150, 0.8)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const startX = centerX + Math.cos(angle) * (iconSize / 4);
            const startY = centerY + Math.sin(angle) * (iconSize / 4);
            const endX = centerX + Math.cos(angle) * (iconSize / 2);
            const endY = centerY + Math.sin(angle) * (iconSize / 2);
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
        
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
}
