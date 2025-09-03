// Modulo Leech - Abilità di assorbimento vita
export class Leech {
    constructor() {
        this.isActive = false;
        this.cooldownTime = 120000; // 2 minuti di cooldown (in ms)
        this.lastUsedTime = 0;
        this.duration = 10000; // 10 secondi di durata
        this.activationTime = 0;
        this.leechPercentage = 0.20; // 20% del danno inflitto viene convertito in HP
        
        // Tracking del danno inflitto
        this.totalDamageDealt = 0;
        this.lastShipHP = 0;
        
        // Effetti visivi
        this.leechParticles = [];
        this.maxParticles = 15;
    }

    // Controlla se il Leech può essere usato
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

    // Attiva il Leech
    activate(ship) {
        if (!this.canUse()) {
            return false;
        }

        this.isActive = true;
        this.lastUsedTime = Date.now();
        this.activationTime = Date.now();
        this.totalDamageDealt = 0;
        this.lastShipHP = ship.currentHP;
        
        console.log('🩸 Leech attivato!');
        return true;
    }

    // Processa il danno inflitto per calcolare l'HP da assorbire
    processDamageDealt(damage, ship, targetX, targetY) {
        if (!this.isActive) return;
        
        // Aggiungi il danno al totale
        this.totalDamageDealt += damage;
        
        // Calcola l'HP da assorbire
        const hpToAbsorb = Math.floor(damage * this.leechPercentage);
        
        // Applica l'HP al player
        if (hpToAbsorb > 0) {
            ship.currentHP = Math.min(ship.maxHP, ship.currentHP + hpToAbsorb);
            
            // Crea particelle di assorbimento
            this.createLeechParticles(targetX, targetY, ship.x, ship.y, hpToAbsorb);
            
            console.log(`🩸 Leech: +${hpToAbsorb} HP da ${damage} danni`);
        }
    }

    // Crea particelle di assorbimento vita
    createLeechParticles(fromX, fromY, toX, toY, hpAmount) {
        const particleCount = Math.min(5, Math.max(1, Math.floor(hpAmount / 100)));
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const speed = 1 + Math.random() * 2;
            const life = 30 + Math.random() * 20;
            
            this.leechParticles.push({
                x: fromX,
                y: fromY,
                targetX: toX,
                targetY: toY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: life,
                maxLife: life,
                size: 2 + Math.random() * 2,
                color: this.getLeechParticleColor()
            });
        }
    }

    // Ottiene colore per le particelle Leech
    getLeechParticleColor() {
        const colors = [
            '#ff0000', // Rosso sangue
            '#ff4444', // Rosso chiaro
            '#ff6666', // Rosso più chiaro
            '#ff8888'  // Rosso molto chiaro
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Aggiorna l'effetto
    update(ship) {
        if (!this.isActive) return;
        
        // Aggiorna particelle
        this.leechParticles = this.leechParticles.filter(particle => {
            // Muovi verso il target (player)
            const dx = particle.targetX - particle.x;
            const dy = particle.targetY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 5) {
                // Normalizza e muovi verso il target
                particle.vx = (dx / distance) * 3;
                particle.vy = (dy / distance) * 3;
            }
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            
            return particle.life > 0;
        });
        
        // Controlla se la durata è finita
        const elapsed = Date.now() - this.activationTime;
        if (elapsed >= this.duration) {
            this.isActive = false;
            console.log(`🩸 Leech terminato. Danno totale inflitto: ${this.totalDamageDealt}`);
        }
    }

    // Controlla se il Leech è attivo
    isLeechActive() {
        return this.isActive;
    }

    // Ottiene statistiche del Leech
    getStats() {
        return {
            isActive: this.isActive,
            totalDamageDealt: this.totalDamageDealt,
            hpAbsorbed: Math.floor(this.totalDamageDealt * this.leechPercentage),
            timeRemaining: this.isActive ? Math.max(0, this.duration - (Date.now() - this.activationTime)) : 0
        };
    }

    // Disegna l'effetto
    draw(ctx, camera, shipX, shipY) {
        if (!this.isActive) return;
        
        // Disegna particelle di assorbimento
        this.leechParticles.forEach(particle => {
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
        
        // Disegna aura rossa attorno al player quando Leech è attivo
        const centerScreen = camera.worldToScreen(shipX, shipY);
        const elapsed = Date.now() - this.activationTime;
        const progress = Math.min(elapsed / this.duration, 1);
        
        // Aura pulsante rossa
        ctx.save();
        ctx.globalAlpha = 0.3 + (Math.sin(Date.now() * 0.01) * 0.1);
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerScreen.x, centerScreen.y, 40 + (Math.sin(Date.now() * 0.02) * 5), 0, Math.PI * 2);
        ctx.stroke();
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
        
        // Icona Leech (goccia di sangue)
        const centerX = x + size / 2;
        const centerY = y + size / 2;
        const iconSize = size * 0.6;
        
        // Goccia di sangue
        ctx.fillStyle = isAvailable ? '#ff0000' : 'rgba(150, 150, 150, 0.8)';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY - iconSize/6, iconSize/3, iconSize/2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Parte inferiore della goccia
        ctx.beginPath();
        ctx.moveTo(centerX - iconSize/6, centerY + iconSize/6);
        ctx.lineTo(centerX, centerY + iconSize/3);
        ctx.lineTo(centerX + iconSize/6, centerY + iconSize/6);
        ctx.closePath();
        ctx.fill();
        
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
