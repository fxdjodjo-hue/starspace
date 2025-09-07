// UIIcon - Sistema unificato per icone UI basato sul QuestTracker
export class UIIcon {
    constructor(game, config) {
        this.game = game;
        this.config = config;
        
        // Configurazione base
        this.type = config.type;
        this.panel = config.panel;
        this.icon = config.icon || '?';
        this.showCount = config.showCount || false;
        this.count = config.count || 0;
        this.position = config.position || { x: 20, y: 20 };
        this.size = config.size || 50;
        
        // Stato
        this.visible = true;
        this.isActive = false; // Se il pannello associato è aperto
        
        // Stile (basato sul QuestTracker)
        this.backgroundColor = '#1a1a2e';
        this.borderColor = '#4a90e2';
        this.activeBorderColor = '#00ff00';
        this.textColor = '#ffffff';
        this.countColor = '#00ff00';
        this.inactiveCountColor = '#888888';
        
        // Posizione
        this.x = this.position.x;
        this.y = this.position.y;
        this.width = this.size;
        this.height = this.size;
    }
    
    // Aggiorna lo stato dell'icona
    update() {
        // Controlla se il pannello associato è aperto
        this.isActive = this.isPanelOpen();
        
        // Aggiorna il conteggio se necessario
        if (this.showCount && this.config.updateCount) {
            // Chiama la funzione con il contesto corretto
            this.count = this.config.updateCount.call(this);
        }
    }
    
    // Controlla se il pannello associato è aperto
    isPanelOpen() {
        if (!this.panel) return false;
        
        // Controlla diverse proprietà comuni per i pannelli
        if (this.panel.isOpen !== undefined) return this.panel.isOpen;
        if (this.panel.visible !== undefined) return this.panel.visible;
        if (this.panel.minimized !== undefined) return !this.panel.minimized;
        
        return false;
    }
    
    // Gestisce il click sull'icona
    handleClick(x, y) {
        if (!this.visible || !this.isMouseOver(x, y)) {
            return false;
        }
        
        console.log(`🖱️ Click su icona ${this.type}`);
        
        // Toggle del pannello associato
        if (this.panel) {
            if (this.panel.toggle) {
                this.panel.toggle();
            } else if (this.panel.open) {
                if (this.isPanelOpen()) {
                    this.panel.close();
                } else {
                    this.panel.open();
                }
            }
        }
        
        return true;
    }
    
    // Controlla se il mouse è sopra l'icona
    isMouseOver(x, y) {
        return x >= this.x && x <= this.x + this.width && 
               y >= this.y && y <= this.y + this.height;
    }
    
    // Disegna l'icona
    draw(ctx) {
        if (!this.visible) return;
        
        // Sfondo
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Bordo (colore diverso se attivo)
        ctx.strokeStyle = this.isActive ? this.activeBorderColor : this.borderColor;
        ctx.lineWidth = this.isActive ? 3 : 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Icona principale
        this.drawIcon(ctx);
        
        // Contatore se necessario
        if (this.showCount) {
            this.drawCount(ctx);
        }
    }
    
    // Disegna l'icona principale
    drawIcon(ctx) {
        ctx.fillStyle = this.textColor;
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, this.x + this.width/2, this.y + this.height/2);
    }
    
    // Disegna il contatore
    drawCount(ctx) {
        const countText = this.count.toString();
        const countColor = this.count > 0 ? this.countColor : this.inactiveCountColor;
        
        ctx.fillStyle = countColor;
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(countText, this.x + this.width - 8, this.y + 12);
    }
    
    // Imposta la posizione
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.position.x = x;
        this.position.y = y;
    }
    
    // Imposta il conteggio
    setCount(count) {
        this.count = count;
    }
    
    // Imposta la visibilità
    setVisible(visible) {
        this.visible = visible;
    }
}