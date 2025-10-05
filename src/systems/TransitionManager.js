// Gestisce le transizioni e gli effetti di camera nel gioco
export class TransitionManager {
    constructor(game) {
        this.game = game;
        
        // Stato animazione
        this.animation = {
            active: false,
            type: null,
            startTime: 0,
            duration: 0,
            onComplete: null,
            
            // Parametri zoom
            startZoom: 1.0,
            endZoom: 1.0,
            currentZoom: 1.0,
            
            // Parametri posizione
            startX: 0,
            startY: 0,
            endX: 0,
            endY: 0
        };
    }
    
    // Avvia una transizione di zoom dalla nave
    startGameZoomOut(onComplete) {
        // Salva posizione attuale della camera
        const startX = this.game.camera.x;
        const startY = this.game.camera.y;
        
        // Posiziona la camera sulla nave
        if (this.game.ship) {
            this.game.camera.x = this.game.ship.x;
            this.game.camera.y = this.game.ship.y;
        }
        
        // Configura l'animazione
        this.animation = {
            active: true,
            type: 'zoomOut',
            startTime: performance.now(),
            duration: 1500, // 1.5 secondi
            onComplete: onComplete,
            
            // Zoom dalla nave (molto vicino) allo zoom normale
            startZoom: 0.1,
            endZoom: 1.0,
            currentZoom: 0.1,
            
            // Mantieni la camera centrata sulla nave
            startX: this.game.camera.x,
            startY: this.game.camera.y,
            endX: this.game.camera.x,
            endY: this.game.camera.y
        };
    }
    
    // Aggiorna le animazioni attive
    update() {
        if (!this.animation.active) return;
        
        const now = performance.now();
        const elapsed = now - this.animation.startTime;
        const progress = Math.min(elapsed / this.animation.duration, 1.0);
        
        // Applica l'animazione in base al tipo
        switch (this.animation.type) {
            case 'zoomOut':
                // Interpola lo zoom con easing
                this.animation.currentZoom = this.animation.startZoom + 
                    (this.animation.endZoom - this.animation.startZoom) * 
                    this.easeOutCubic(progress);
                
                // Applica lo zoom alla camera
                if (this.game.camera) {
                    this.game.camera.zoom = this.animation.currentZoom;
                }
                break;
        }
        
        // Fine animazione
        if (progress >= 1.0) {
            this.animation.active = false;
            
            // Reset camera
            if (this.game.camera) {
                this.game.camera.zoom = this.animation.endZoom;
            }
            
            // Callback di completamento
            if (this.animation.onComplete) {
                this.animation.onComplete();
            }
        }
    }
    
    // Funzione di easing per animazioni più fluide
    easeOutCubic(x) {
        return 1 - Math.pow(1 - x, 3);
    }
}
