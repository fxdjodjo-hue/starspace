// Sistema Portale per cambio mappa
export class Portal {
    constructor(x, y, targetMap, targetX, targetY, game) {
        this.x = x;
        this.y = y;
        this.width = 350;
        this.height = 350;
        this.targetMap = targetMap;
        this.targetX = targetX;
        this.targetY = targetY;
        this.game = game;
        this.active = true;
        this.isPlayerNear = false;
        this.activationDistance = 450; // Distanza di attivazione
        
        // Carica le immagini del portale
        this.loadImages();
        
        // Sistema di animazione
        this.animationFrame = 0;
        this.animationSpeed = 0.3; // Aumentato per animazione più veloce
        this.isAnimating = false;
        this.animationDuration = 3000; // 3 secondi per vedere tutti i frame
        this.animationStartTime = 0;
        
        // Sistema di fluttuazione
        this.floatOffset = 0;
        this.floatSpeed = 0.02;
        this.floatAmplitude = 8; // Ampiezza della fluttuazione
    }
    
    loadImages() {
        // Carica immagini del portale
        this.portalInactive = new Image();
        this.portalInactive.src = 'ZetaGate/tps/tp1.png';
        
        this.portalActive = new Image();
        this.portalActive.src = 'ZetaGate/tps/tp1_active.png';
        
        // Carica l'atlas di animazione con 18 frame
        this.teleportAtlas = new Image();
        this.teleportAtlas.src = 'ZetaGate/anims/teleport-0.png';
        
        // Configurazione dell'atlas (18 frame in una riga)
        this.teleportFrameCount = 18;
        this.teleportFrameWidth = 180; // Dimensione di ogni frame
        this.teleportFrameHeight = 180;
        this.teleportAtlasWidth = 3240; // 18 * 180
        this.teleportAtlasHeight = 180;
    }
    
    update() {
        // Aggiorna fluttuazione
        this.floatOffset += this.floatSpeed;
        
        // Controlla se il giocatore è vicino
        const distance = Math.sqrt(
            Math.pow(this.game.ship.x - this.x, 2) + 
            Math.pow(this.game.ship.y - this.y, 2)
        );
        
        this.isPlayerNear = distance < this.activationDistance;
        
        // Aggiorna animazione
        if (this.isAnimating) {
            // Animazione fluida attraverso i 18 frame
            this.animationFrame += this.animationSpeed;
            
            // Controlla se l'animazione è finita
            if (Date.now() - this.animationStartTime > this.animationDuration) {
                this.isAnimating = false;
                this.teleportPlayer();
            }
        }
    }
    
    // Controlla collisione con la nave
    checkCollision(ship) {
        return ship.x < this.x + this.width &&
               ship.x + ship.size > this.x &&
               ship.y < this.y + this.height &&
               ship.y + ship.size > this.y;
    }
    
    // Avvia animazione di teletrasporto
    startTeleport() {
        if (!this.isAnimating) {
            this.isAnimating = true;
            this.animationStartTime = Date.now();
            this.animationFrame = 0;
        }
    }
    
    // Teletrasporta il giocatore
    teleportPlayer() {
        this.game.mapManager.changeMap(this.targetMap, this.game.ship);
        this.game.notifications.add(`Teletrasportato in ${this.targetMap}!`, 'info');
    }
    
    // Disegna il portale
    draw(ctx, camera) {
        // Calcola la posizione con fluttuazione
        const floatY = Math.sin(this.floatOffset) * this.floatAmplitude;
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y + floatY;
        
        // Non disegnare se fuori schermo
        if (screenX + this.width < 0 || screenX > camera.width ||
            screenY + this.height < 0 || screenY > camera.height) {
            return;
        }
        
        // Disegna sempre il portale di base
        const portalImage = this.isPlayerNear ? this.portalActive : this.portalInactive;
        if (portalImage.complete) {
            ctx.drawImage(portalImage, screenX, screenY, this.width, this.height);
        }
        
        // Disegna animazione di teletrasporto se attiva (sopra il portale)
        if (this.isAnimating) {
            // Calcola il frame corrente (0-17)
            const currentFrame = Math.floor(this.animationFrame) % this.teleportFrameCount;
            
            // Effetto di pulsazione più sottile
            const time = this.animationFrame * Math.PI * 2;
            const pulseScale = 1 + Math.sin(time * 2) * 0.1;
            const pulseAlpha = 0.8 + Math.sin(time * 1.5) * 0.2;
            
            ctx.save();
            ctx.globalAlpha = pulseAlpha;
            
            // Centra la rotazione
            const centerX = screenX + this.width / 2;
            const centerY = screenY + this.height / 2;
            ctx.translate(centerX, centerY);
            ctx.scale(pulseScale, pulseScale);
            
            // Disegna il frame corrente dall'atlas con dimensioni ridotte
            if (this.teleportAtlas.complete) {
                const sourceX = currentFrame * this.teleportFrameWidth;
                const sourceY = 0;
                const animationSize = this.width * 0.6; // Ridotto al 60% del portale
                const drawX = -animationSize / 2;
                const drawY = -animationSize / 2;
                
                ctx.drawImage(
                    this.teleportAtlas,
                    sourceX, sourceY, this.teleportFrameWidth, this.teleportFrameHeight,
                    drawX, drawY, animationSize, animationSize
                );
            }
            
            ctx.restore();
        }
        
        // Disegna indicatore di interazione se il giocatore è vicino
        if (this.isPlayerNear && !this.isAnimating) {
            this.drawInteractionIndicator(ctx, screenX, screenY);
        }
        
        // Debug: mostra sempre il portale se è in animazione
        if (this.isAnimating) {
            // Disegna un bordo per debug
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.strokeRect(screenX, screenY, this.width, this.height);
        }
    }
    
    // Disegna indicatore di interazione
    drawInteractionIndicator(ctx, x, y) {
        // Pulsante di interazione molto più grande
        const indicatorWidth = 320;
        const indicatorHeight = 40;
        const indicatorX = x + this.width / 2 - indicatorWidth / 2;
        const indicatorY = y - 60;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(indicatorX, indicatorY, indicatorWidth, indicatorHeight);
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.strokeRect(indicatorX, indicatorY, indicatorWidth, indicatorHeight);
        
        // Testo molto più grande
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Premi E per teletrasportarsi', x + this.width / 2, indicatorY + 25);
    }
    
    // Gestisce l'interazione con il portale
    handleInteraction() {
        if (this.isPlayerNear && !this.isAnimating) {
            this.startTeleport();
            return true;
        }
        return false;
    }
    
    // Disegna il portale nella minimappa
    drawMinimap(ctx, minimap) {
        // Converti coordinate mondo in coordinate minimappa
        const minimapX = minimap.x + (this.x + this.width / 2) * minimap.scaleX;
        const minimapY = minimap.y + (this.y + this.height / 2) * minimap.scaleY;
        
        // Disegna un cerchio vuoto bianco per il portale
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(minimapX, minimapY, 5, 0, Math.PI * 2);
        ctx.stroke();
    }
}
