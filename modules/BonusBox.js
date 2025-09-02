// Modulo Bonus Box
import { BonusBoxSprite } from './BonusBoxSprite.js';

export class BonusBox {
    constructor(x, y, type = 'mixed') {
        this.x = x;
        this.y = y;
        this.radius = 50;
        this.type = type; // 'credits', 'uridium', 'mixed'
        this.active = true;
        this.collected = false;
        
        // Valori di ricompensa
        this.creditsReward = 0;
        this.uridiumReward = 0;
        
        // Imposta le ricompense basate sul tipo
        this.setRewards();
        
        // Animazione
        this.animationTime = 0;
        this.pulseScale = 1;
        this.rotation = 0;
        
        // Effetto fade per la raccolta
        this.fadeOut = false;
        this.fadeAlpha = 1;
        this.fadeSpeed = 0.02;
        
        // Sistema sprite sheet
        this.sprite = new BonusBoxSprite();
        this.sprite.load();
        // console.log('🎁 BonusBox creata con sprite sheet');
    }
    
    setRewards() {
        switch (this.type) {
            case 'credits':
                this.creditsReward = Math.floor(Math.random() * 500) + 100; // 100-600 crediti
                this.uridiumReward = 0;
                break;
            case 'uridium':
                this.creditsReward = 0;
                this.uridiumReward = Math.floor(Math.random() * 20) + 5; // 5-25 uridium
                break;
            case 'mixed':
                this.creditsReward = Math.floor(Math.random() * 300) + 50; // 50-350 crediti
                this.uridiumReward = Math.floor(Math.random() * 10) + 2; // 2-12 uridium
                break;
        }
    }
    
    update() {
        if (!this.active) return;
        
        // Se è in fase di fade out, aggiorna l'alpha
        if (this.fadeOut) {
            this.fadeAlpha -= this.fadeSpeed;
            // console.log(`🎭 Fade alpha: ${this.fadeAlpha.toFixed(2)}`); // Debug
            if (this.fadeAlpha <= 0) {
                this.active = false;
                return;
            }
        }
        
        // Se è già stata raccolta ma non è in fade, non aggiornare l'animazione
        if (this.collected && !this.fadeOut) return;
        
        // Aggiorna lo sprite sheet
        this.sprite.update();
        
        // Animazione di pulsazione
        this.animationTime += 0.05;
        this.pulseScale = 1 + Math.sin(this.animationTime) * 0.1;
        
        // Rimuoviamo la rotazione
        // this.rotation += 0.02;
    }
    
    draw(ctx, camera) {
        if (!this.active) return;
        
        const screenPos = camera.worldToScreen(this.x, this.y);
        const screenX = screenPos.x;
        const screenY = screenPos.y;
        
        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.scale(this.pulseScale, this.pulseScale);
        
        // Applica l'effetto fade
        ctx.globalAlpha = this.fadeAlpha;
        
        // Disegna lo sprite sheet se caricato, altrimenti fallback geometrico
        if (this.sprite.isLoaded) {
            // Applica l'alpha anche al metodo draw dello sprite
            ctx.globalAlpha = this.fadeAlpha;
            this.sprite.draw(ctx, 0, 0, this.radius * 2, 0);
        } else {
            // Debug: mostra che sta usando il fallback
            if (Math.random() < 0.001) {
                console.log('🔧 BonusBox: Usando fallback geometrico - sprite non caricato');
            }
            // Fallback geometrico con colori basati sul tipo
            let color;
            switch (this.type) {
                case 'credits':
                    color = '#4a90e2'; // Blu per crediti
                    break;
                case 'uridium':
                    color = '#ff6600'; // Arancione per uridium
                    break;
                case 'mixed':
                    color = '#9b59b6'; // Viola per misto
                    break;
            }
            
            // Disegna box
            ctx.fillStyle = color;
            ctx.fillRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
            
            // Bordo
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
            
            // Simbolo al centro
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            let symbol = '?';
            switch (this.type) {
                case 'credits':
                    symbol = 'C';
                    break;
                case 'uridium':
                    symbol = 'U';
                    break;
                case 'mixed':
                    symbol = 'M';
                    break;
            }
            ctx.fillText(symbol, 0, 0);
        }
        
        ctx.restore();
        
        // Disegna effetto di attrazione se la nave è vicina
        this.drawAttractionEffect(ctx, camera);
    }
    
    drawAttractionEffect(ctx, camera) {
        // Trova la nave (assumendo che sia accessibile tramite window.gameInstance)
        if (!window.gameInstance || !window.gameInstance.ship) return;
        
        const ship = window.gameInstance.ship;
        const distance = Math.sqrt(
            Math.pow(this.x - ship.x, 2) + Math.pow(this.y - ship.y, 2)
        );
        
        // Se la nave è entro 100 pixel, disegna effetto di attrazione
        if (distance < 100) {
            const screenPos = camera.worldToScreen(this.x, this.y);
            const shipScreenPos = camera.worldToScreen(ship.x, ship.y);
            
            ctx.save();
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 * (1 - distance / 100)})`;
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(screenPos.x, screenPos.y);
            ctx.lineTo(shipScreenPos.x, shipScreenPos.y);
            ctx.stroke();
            ctx.restore();
        }
    }
    
    checkCollision(ship) {
        if (!this.active || this.collected || this.fadeOut) return false;
        
        const distance = Math.sqrt(
            Math.pow(this.x - ship.x, 2) + Math.pow(this.y - ship.y, 2)
        );
        
        return distance < (this.radius + ship.size / 2);
    }
    
    collect(ship) {
        if (this.collected) return;
        
        // console.log('🎁 BonusBox raccolta - inizio fade out'); // Debug
        this.collected = true;
        this.fadeOut = true; // Inizia il fade out invece di sparire subito
        
        // Aggiungi le ricompense
        if (this.creditsReward > 0) {
            ship.upgradeManager.addCredits(this.creditsReward);
        }
        
        if (this.uridiumReward > 0) {
            ship.upgradeManager.addUridium(this.uridiumReward);
        }
        
        // Mostra notifica
        if (window.gameInstance && window.gameInstance.notifications) {
            let message = '';
            if (this.creditsReward > 0 && this.uridiumReward > 0) {
                message = `💰 +${this.creditsReward} Crediti, 💎 +${this.uridiumReward} Uridium`;
            } else if (this.creditsReward > 0) {
                message = `💰 +${this.creditsReward} Crediti`;
            } else if (this.uridiumReward > 0) {
                message = `💎 +${this.uridiumReward} Uridium`;
            }
            
            if (message) {
                window.gameInstance.notifications.add(message, 120, 'success');
            }
        }
        
        return {
            credits: this.creditsReward,
            uridium: this.uridiumReward
        };
    }
    
    // Metodo per creare una bonus box casuale
    static createRandom(x, y) {
        const types = ['credits', 'uridium', 'mixed'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        return new BonusBox(x, y, randomType);
    }
}
