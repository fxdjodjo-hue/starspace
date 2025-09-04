export class DreadspireBackground {
    constructor() {
        this.backgroundImage = null;
        this.loaded = false;
    }
    
    async loadImages() {
        if (this.loaded) return;
        
        try {
            // Carica solo il background principale
            this.backgroundImage = await this.loadImage('bg.jpg');
            this.loaded = true;
            console.log('Dreadspire background loaded, image size:', this.backgroundImage.width, 'x', this.backgroundImage.height);
        } catch (error) {
            console.error('Error loading Dreadspire background:', error);
        }
    }
    
    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }
    
    draw(ctx, camera) {
        if (!this.loaded || !this.backgroundImage) {
            return;
        }
        
        const { x, y, zoom } = camera;
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;
        
        this.drawBackground(ctx, x, y, zoom, canvasWidth, canvasHeight);
    }
    
    drawBackground(ctx, x, y, zoom, canvasWidth, canvasHeight) {
        if (!this.backgroundImage) return;
        
        // Salva lo stato del canvas
        ctx.save();
        
        // Imposta trasparenza per vedere il parallax sotto
        ctx.globalAlpha = 0.6;
        
        // Calcola la posizione del background basata sulla camera
        const offsetX = (x - 8000) * 0.2; // Centrato su 8000, movimento più veloce
        const offsetY = (y - 5000) * 0.2; // Centrato su 5000
        
        // Disegna l'immagine che si muove con la camera
        ctx.drawImage(
            this.backgroundImage,
            -offsetX, -offsetY, canvasWidth, canvasHeight
        );
        
        // Ripristina lo stato del canvas
        ctx.restore();
    }
}
