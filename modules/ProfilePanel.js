// Profile Panel - Pannello profilo giocatore con statistiche
export class ProfilePanel {
    constructor(game) {
        this.game = game;
        this.visible = false;
        this.minimized = false; // Non minimizzabile, solo visibile/nascosto
        this._isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.hasMoved = false;
        
        // Sistema di animazione
        this.animating = false;
        this.animationProgress = 0; // 0 = chiuso, 1 = aperto
        this.animationSpeed = 0.1; // Velocità animazione (più alto = più veloce)
        this.currentWidth = 0;
        this.currentHeight = 0;
        
        // Posizione e dimensioni
        this.width = 280;
        this.height = 180;
        
        // Posizioni (centrato di default)
        this.x = 0;
        this.y = 0;
        
        // Posizione salvata per il ripristino
        this.savedX = null; // Posizione X salvata quando chiuso
        this.savedY = null; // Posizione Y salvata quando chiuso
        
        // Stile (basato sul QuestTracker)
        this.backgroundColor = '#1a1a2e';
        this.borderColor = '#4a90e2';
        this.textColor = '#ffffff';
        this.titleColor = '#FFD700';
        this.valueColor = '#00ff00';
        this.labelColor = '#cccccc';
        
        // Dati del profilo
        this.profileData = {
            experience: 0,
            honor: 0,
            credit: 0,
            uridium: 0
        };
    }
    
    // Aggiorna i dati del profilo
    update() {
        if (this.game.ship) {
            // Experience
            this.profileData.experience = this.game.ship.getResource('experience') || 0;
            
            // Honor
            this.profileData.honor = this.game.ship.getResource('honor') || 0;
            
            // Credit
            this.profileData.credit = this.game.ship.getResource('credits') || 0;
            
            // Uridium
            this.profileData.uridium = this.game.ship.getResource('uridium') || 0;
        }
        
        // Aggiorna l'animazione
        this.updateAnimation();
    }
    
    // Aggiorna l'animazione (copiato dal QuestTracker)
    updateAnimation() {
        if (!this.animating) return;
        
        const targetProgress = this.visible ? 1 : 0;
        const diff = targetProgress - this.animationProgress;
        
        if (Math.abs(diff) < 0.01) {
            // Animazione completata
            this.animationProgress = targetProgress;
            this.animating = false;
            
            // Se l'animazione è completata e il pannello è chiuso, nascondilo completamente
            if (!this.visible && this.animationProgress === 0) {
                this.currentWidth = 0;
                this.currentHeight = 0;
            }
        } else {
            // Continua l'animazione
            this.animationProgress += diff * this.animationSpeed;
        }
        
        // Calcola dimensioni interpolate
        this.currentWidth = this.lerp(0, this.width, this.animationProgress);
        this.currentHeight = this.lerp(0, this.height, this.animationProgress);
    }
    
    // Interpolazione lineare (copiato dal QuestTracker)
    lerp(start, end, t) {
        return start + (end - start) * t;
    }
    
    // Apre il pannello
    open() {
        this.visible = true;
        this.animating = true;
        
        // Ripristina la posizione salvata o usa il centro
        if (this.savedX !== null && this.savedY !== null) {
            // Ripristina la posizione salvata
            this.x = this.savedX;
            this.y = this.savedY;
            console.log('📍 RIPRISTINATA POSIZIONE SALVATA:', this.x, this.y);
        } else {
            // Prima volta che si apre, usa il centro
            this.centerPanel();
            console.log('📍 PRIMA APERTURA - POSIZIONE CENTRALE:', this.x, this.y);
        }
    }
    
    // Chiude il pannello
    close() {
        // Salva la posizione corrente prima di chiudere
        this.savedX = this.x;
        this.savedY = this.y;
        console.log('📍 POSIZIONE SALVATA:', this.savedX, this.savedY);
        
        this.visible = false;
        this.animating = true;
        this._isDragging = false;
    }
    
    // Toggle del pannello
    toggle() {
        if (this.visible) {
            this.close();
        } else {
            this.open();
        }
    }
    
    // Centra il pannello
    centerPanel() {
        this.x = (this.game.canvas.width - this.width) / 2;
        this.y = (this.game.canvas.height - this.height) / 2;
    }
    
    // Gestisce il click sul pannello
    handleClick(x, y) {
        if (!this.visible) return false;
        
        // Se è aperto, cliccare sulla barra del titolo lo chiude
        if (this.isTitleBarClicked(x, y)) {
            this.close();
            return true;
        }
        
        // Controlla se è un drag
        if (this.isDragAreaClicked(x, y)) {
            return this.startDrag(x, y);
        }
        
        return false;
    }
    
    // Controlla se il click è sulla barra del titolo (per chiudere)
    isTitleBarClicked(x, y) {
        const titleBarHeight = 40;
        const currentWidth = this.currentWidth || 0;
        
        return x >= this.x && x <= this.x + currentWidth && 
               y >= this.y && y <= this.y + titleBarHeight;
    }
    
    // Controlla se il click è nell'area draggabile
    isDragAreaClicked(x, y) {
        const currentWidth = this.currentWidth || 0;
        return x >= this.x && x <= this.x + currentWidth &&
               y >= this.y && y <= this.y + 30; // Solo la barra del titolo
    }
    
    // Inizia il drag (copiato spudoratamente dal QuestTracker)
    startDrag(x, y) {
        // Se non è nell'area draggabile, non permettere drag
        if (!this.isDragAreaClicked(x, y)) {
            console.log('🚫 DRAG BLOCCATO - non nell\'area draggabile');
            return false;
        }
        
        console.log('✅ DRAG INIZIATO - posizione:', x, y);
        this._isDragging = true;
        this.hasMoved = false; // Reset del flag di movimento
        this.dragOffset.x = x - this.x;
        this.dragOffset.y = y - this.y;
        return true;
    }
    
    // Gestisce il movimento del mouse durante il drag (copiato spudoratamente dal QuestTracker)
    handleMouseMove(x, y) {
        if (this._isDragging) {
            // Calcola la nuova posizione
            const newX = x - this.dragOffset.x;
            const newY = y - this.dragOffset.y;
            
            // Controlla se c'è stato movimento significativo (più di 5 pixel)
            const deltaX = Math.abs(newX - this.x);
            const deltaY = Math.abs(newY - this.y);
            if (deltaX > 5 || deltaY > 5) {
                this.hasMoved = true;
            }
            
            // Mantieni il pannello dentro i bordi dello schermo con margine
            const margin = 10;
            this.x = Math.max(margin, Math.min(newX, this.game.canvas.width - this.width - margin));
            this.y = Math.max(margin, Math.min(newY, this.game.canvas.height - this.height - margin));
            
            // Salva la posizione corrente per il ripristino futuro
            this.savedX = this.x;
            this.savedY = this.y;
        }
    }
    
    // Gestisce il rilascio del mouse (copiato spudoratamente dal QuestTracker)
    handleMouseRelease() {
        if (this._isDragging) {
            // Se c'è stato movimento, non gestire come click
            if (this.hasMoved) {
                this._isDragging = false;
                this.hasMoved = false;
                return false; // Non è un click
            }
            
            // Se non c'è stato movimento, gestisci come click
            this._isDragging = false;
            this.hasMoved = false;
            return true; // È un click
        }
        return false;
    }
    
    // Controlla se è in drag
    get isDragging() {
        return this._isDragging || false;
    }
    
    set isDragging(value) {
        this._isDragging = value;
    }
    
    // Controlla se il mouse è sopra il pannello
    isMouseOver(x, y) {
        const currentWidth = this.currentWidth || 0;
        const currentHeight = this.currentHeight || 0;
        return (this.visible || this.animating) && x >= this.x && x <= this.x + currentWidth &&
               y >= this.y && y <= this.y + currentHeight;
    }
    
    // Disegna il pannello
    draw(ctx) {
        // Usa le dimensioni animate
        const currentWidth = this.currentWidth || 0;
        const currentHeight = this.currentHeight || 0;
        
        // Non disegnare se le dimensioni sono troppo piccole
        if (currentWidth <= 0 || currentHeight <= 0) return;
        
        // Non disegnare se il pannello è chiuso e l'animazione è completata
        if (!this.visible && !this.animating) return;
        
        // Sfondo
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(this.x, this.y, currentWidth, currentHeight);
        
        // Bordo
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, currentWidth, currentHeight);
        
        // Barra del titolo
        ctx.fillStyle = this.borderColor;
        ctx.fillRect(this.x, this.y, currentWidth, 30);
        
        // Titolo (solo se il pannello è visibile e l'animazione è abbastanza avanzata)
        if (this.visible && this.animationProgress > 0.5) {
            ctx.fillStyle = this.titleColor;
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText('Player Profile', this.x + 10, this.y + 15);
        }
        
        // Contenuto del pannello (solo se l'animazione è abbastanza avanzata)
        // Mostra il contenuto solo se il pannello è visibile e l'animazione è abbastanza avanzata
        if (this.visible && this.animationProgress > 0.5) {
            this.drawContent(ctx);
        }
    }
    
    
    // Disegna il contenuto del pannello
    drawContent(ctx) {
        const startY = this.y + 45;
        const lineHeight = 35;
        const leftX = this.x + 20;
        const rightX = this.x + this.width / 2 + 10;
        const leftValueX = this.x + this.width / 2 - 10; // Fine della colonna sinistra
        const rightValueX = this.x + this.width - 20; // Fine della colonna destra
        
        // Prima riga: Experience e Credits
        this.drawStatLine(ctx, 'Experience:', this.profileData.experience.toLocaleString(), leftX, startY, leftValueX);
        this.drawStatLine(ctx, 'Credits:', this.profileData.credit.toLocaleString(), rightX, startY, rightValueX);
        
        // Seconda riga: Honor e Uridium
        this.drawStatLine(ctx, 'Honor:', this.profileData.honor.toLocaleString(), leftX, startY + lineHeight, leftValueX);
        this.drawStatLine(ctx, 'Uridium:', this.profileData.uridium.toLocaleString(), rightX, startY + lineHeight, rightValueX);
    }
    
    // Disegna una riga di statistica
    drawStatLine(ctx, label, value, labelX, y, valueX) {
        // Label
        ctx.fillStyle = this.labelColor;
        ctx.font = '13px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, labelX, y);
        
        // Value
        ctx.fillStyle = this.valueColor;
        ctx.font = 'bold 13px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(value, valueX, y);
    }
}
