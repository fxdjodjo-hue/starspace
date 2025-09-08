// Classe base per componenti UI scalabili
export class UIComponent {
    constructor(id, bounds, config = {}) {
        this.id = id;
        this.bounds = bounds;
        this.config = { ...config };
        this.visible = true;
        this.enabled = true;
        this.eventSystem = null;
        this.gameState = null;
    }
    
    // Collega il sistema di eventi
    setEventSystem(eventSystem) {
        this.eventSystem = eventSystem;
    }
    
    // Collega il game state
    setGameState(gameState) {
        this.gameState = gameState;
    }
    
    // Rendering del componente
    draw(ctx) {
        if (!this.visible) return;
        // Implementazione specifica nelle classi derivate
    }
    
    // Gestione click
    handleClick(x, y) {
        if (!this.enabled || !this.visible || !this.isPointInBounds(x, y)) {
            return false;
        }
        
        this.onClick(x, y);
        return true;
    }
    
    // Click handler specifico
    onClick(x, y) {
        // Implementazione specifica nelle classi derivate
    }
    
    // Verifica se il punto è dentro i bounds
    isPointInBounds(x, y) {
        return x >= this.bounds.x && 
               x <= this.bounds.x + this.bounds.width &&
               y >= this.bounds.y && 
               y <= this.bounds.y + this.bounds.height;
    }
    
    // Aggiorna bounds
    updateBounds(bounds) {
        this.bounds = { ...this.bounds, ...bounds };
    }
    
    // Mostra/nascondi componente
    setVisible(visible) {
        this.visible = visible;
    }
    
    // Abilita/disabilita componente
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    
    // Aggiorna configurazione
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }
    
    // Emette evento locale
    emitLocal(event, data) {
        if (this.eventSystem) {
            this.eventSystem.emitLocal(event, data);
        }
    }
    
    // Emette evento di rete
    emitNetwork(event, data) {
        if (this.eventSystem) {
            this.eventSystem.emitNetwork(event, data);
        }
    }
    
    // Emette evento generico
    emit(event, data) {
        if (this.eventSystem) {
            this.eventSystem.emit(event, data);
        }
    }
    
    // Listener per eventi
    on(event, callback) {
        if (this.eventSystem) {
            this.eventSystem.on(event, callback);
        }
    }
    
    // Rimuove listener
    off(event, callback) {
        if (this.eventSystem) {
            this.eventSystem.off(event, callback);
        }
    }
    
    // Aggiorna da server (per sincronizzazione)
    updateFromServer(data) {
        if (data.bounds) this.updateBounds(data.bounds);
        if (data.config) this.updateConfig(data.config);
        if (data.visible !== undefined) this.setVisible(data.visible);
        if (data.enabled !== undefined) this.setEnabled(data.enabled);
    }
    
    // Ottiene stato del componente per sincronizzazione
    getState() {
        return {
            id: this.id,
            bounds: this.bounds,
            config: this.config,
            visible: this.visible,
            enabled: this.enabled
        };
    }
}
