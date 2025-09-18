// Modulo Camera
export class Camera {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.smoothness = 0.1; // Quanto fluida è la camera (0.1 = molto fluida)
        this.velocityX = 0;
        this.velocityY = 0;
        this.lastX = 0;
        this.lastY = 0;
        
        // Sistema di zoom
        this.zoom = 1.0;
        this.targetZoom = 1.0;
        this.minZoom = 1.0;
        this.maxZoom = 2.5;
        this.zoomSpeed = 0.1;
        this.zoomSmoothness = 0.15;
    }
    
    update(ship) {
        // Calcola la velocità della camera per il parallax
        this.velocityX = this.x - this.lastX;
        this.velocityY = this.y - this.lastY;
        
        // Salva la posizione corrente per il prossimo frame
        this.lastX = this.x;
        this.lastY = this.y;
        
        // Aggiorna lo zoom gradualmente
        const oldZoom = this.zoom;
        this.zoom += (this.targetZoom - this.zoom) * this.zoomSmoothness;
        
        // Assicurati che lo zoom rimanga nei limiti
        this.zoom = Math.max(this.minZoom, Math.min(this.zoom, this.maxZoom));
        
        // Calcola la posizione target della camera (centrata sulla nave)
        this.targetX = ship.x - this.width / 2;
        this.targetY = ship.y - this.height / 2;
        
        // Muovi la camera gradualmente verso il target (effetto smooth)
        this.x += (this.targetX - this.x) * this.smoothness;
        this.y += (this.targetY - this.y) * this.smoothness;
    }
    
    // Metodo per gestire lo zoom
    zoomIn(amount = null) {
        const zoomAmount = amount || this.zoomSpeed;
        this.targetZoom = Math.min(this.targetZoom + zoomAmount, this.maxZoom);
    }
    
    zoomOut(amount = null) {
        const zoomAmount = amount || this.zoomSpeed;
        this.targetZoom = Math.max(this.targetZoom - zoomAmount, this.minZoom);
    }
    
    setZoom(zoom) {
        this.targetZoom = Math.max(this.minZoom, Math.min(zoom, this.maxZoom));
    }
    
    resetZoom() {
        this.targetZoom = 1.0;
    }
    
    // Converte coordinate mondo in coordinate schermo
    worldToScreen(worldX, worldY) {
        // Applica lo zoom alle coordinate
        const zoomedX = (worldX - this.x) * this.zoom;
        const zoomedY = (worldY - this.y) * this.zoom;
        
        return {
            x: zoomedX,
            y: zoomedY
        };
    }
    
    // Converte coordinate schermo in coordinate mondo
    screenToWorld(screenX, screenY) {
        // Applica l'inverso dello zoom alle coordinate
        const unzoomedX = screenX / this.zoom;
        const unzoomedY = screenY / this.zoom;
        
        return {
            x: unzoomedX + this.x,
            y: unzoomedY + this.y
        };
    }
    
    // Converte coordinate schermo in coordinate mondo considerando il ridimensionamento
    screenToWorldScaled(screenX, screenY, canvasWidth, canvasHeight) {
        // Calcola il fattore di scala tra le dimensioni del canvas e quelle del mondo
        const scaleX = 1920 / canvasWidth;  // 1920 è la larghezza originale
        const scaleY = 1080 / canvasHeight; // 1080 è l'altezza originale
        
        // Applica la scala e poi converte in coordinate mondo con zoom
        const scaledX = screenX * scaleX;
        const scaledY = screenY * scaleY;
        
        return {
            x: scaledX + this.x,
            y: scaledY + this.y
        };
    }
    
    // Controlla se un oggetto è visibile sullo schermo
    isVisible(worldX, worldY, margin = 0) {
        const screen = this.worldToScreen(worldX, worldY);
        // Aggiungi margine per lo zoom
        const zoomMargin = margin * this.zoom;
        return screen.x >= -zoomMargin && 
               screen.x <= this.width + zoomMargin && 
               screen.y >= -zoomMargin && 
               screen.y <= this.height + zoomMargin;
    }
}
