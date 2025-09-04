// Sistema di Radiazione per danni fuori mappa
export class RadiationSystem {
    constructor() {
        this.isActive = false;
        this.damagePerSecond = 0;
        this.maxDamagePerSecond = 15; // Danno massimo al secondo
        this.damageInterval = 1000; // Danno ogni secondo
        this.lastDamageTime = 0;
        this.radiationAlpha = 0;
        this.radiationPulse = 0;
        this.radiationSize = 0;
        this.radiationRotation = 0;
    }
    
    
    // Calcola se il giocatore è fuori mappa e il danno da applicare
    checkRadiation(ship, mapWidth, mapHeight) {
        const x = ship.x;
        const y = ship.y;
        
        // Calcola la distanza dai confini
        const distanceFromLeft = Math.max(0, -x);
        const distanceFromRight = Math.max(0, x - mapWidth);
        const distanceFromTop = Math.max(0, -y);
        const distanceFromBottom = Math.max(0, y - mapHeight);
        
        // Distanza massima dai confini
        const maxDistanceFromBorder = Math.max(
            distanceFromLeft, 
            distanceFromRight, 
            distanceFromTop, 
            distanceFromBottom
        );
        
        if (maxDistanceFromBorder > 0) {
            // Il giocatore è fuori mappa
            this.isActive = true;
            
            // Calcola il danno basato sulla distanza (più graduale)
            // Più lontano = più danno
            this.damagePerSecond = Math.min(
                this.maxDamagePerSecond,
                Math.pow(maxDistanceFromBorder / 200, 1.2) * 3
            );
            
            // Aggiorna l'effetto visivo
            this.radiationAlpha = Math.min(0.6, maxDistanceFromBorder / 300);
            
            // Debug ridotto
            if (Math.floor(this.radiationAlpha * 100) % 10 === 0) {
                console.log('☢️ Radiazione attiva - Alpha:', this.radiationAlpha.toFixed(2), 'Danno:', this.damagePerSecond.toFixed(1));
            }
            
            return true;
        } else {
            // Il giocatore è dentro la mappa
            this.isActive = false;
            this.damagePerSecond = 0;
            this.radiationAlpha = 0;
            return false;
        }
    }
    
    // Applica il danno da radiazione
    applyRadiationDamage(ship, currentTime) {
        if (!this.isActive || this.damagePerSecond <= 0) return;
        
        // Non applicare danno se la nave è morta
        if (ship.isDead) return;
        
        if (currentTime - this.lastDamageTime >= this.damageInterval) {
            // Applica il danno
            ship.takeDamage(this.damagePerSecond);
            this.lastDamageTime = currentTime;
            
            console.log(`☢️ Danno radiazione: ${this.damagePerSecond.toFixed(1)} HP`);
        }
    }
    
    // Disegna l'effetto visivo di radiazione intorno alla nave
    drawRadiationEffect(ctx, camera, ship) {
        if (!this.isActive || this.radiationAlpha <= 0 || ship.isDead) return;
        
        ctx.save();
        
        // Calcola la posizione della nave sullo schermo (già considerando lo zoom applicato globalmente)
        const screenX = ship.x - camera.x;
        const screenY = ship.y - camera.y;
        
        // Imposta l'alpha per l'effetto di trasparenza
        ctx.globalAlpha = this.radiationAlpha;
        
        // Dimensione fissa che funziona con lo zoom globale
        const currentSize = 60;
        
        // Un solo cerchio rosso sottile
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]); // Linea tratteggiata
        ctx.beginPath();
        ctx.arc(screenX, screenY, currentSize, 0, Math.PI * 2);
        ctx.stroke();
        
        // Reset line dash
        ctx.setLineDash([]);
        
        // Disegna il testo di avviso semplice (più in alto e più grande)
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#ff6666';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('☢️ RADIAZIONE', screenX, screenY - currentSize - 40);
        
        // Mostra il danno attuale
        ctx.fillStyle = '#ffaa00';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`${this.damagePerSecond.toFixed(1)} HP/sec`, screenX, screenY - currentSize - 20);
        
        ctx.restore();
    }
    
    
    // Aggiorna il sistema di radiazione
    update(ship, mapWidth, mapHeight, currentTime) {
        this.checkRadiation(ship, mapWidth, mapHeight);
        this.applyRadiationDamage(ship, currentTime);
        // Animazione gestita direttamente in checkRadiation
    }
    
    // Reset del sistema
    reset() {
        this.isActive = false;
        this.damagePerSecond = 0;
        this.radiationAlpha = 0;
        this.lastDamageTime = 0;
    }
}
