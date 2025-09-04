// Sistema sprite per i missili
export class MissileSprite {
    constructor() {
        this.image = null;
        this.isLoaded = false;
        this.width = 0;
        this.height = 0;
        this.scale = 1.0;
    }
    
    // Carica l'immagine del missile
    async load() {
        return new Promise((resolve, reject) => {
            this.image = new Image();
            this.image.onload = () => {
                this.width = this.image.width;
                this.height = this.image.height;
                this.isLoaded = true;
                console.log('Missile sprite caricato:', this.width, 'x', this.height);
                resolve();
            };
            this.image.onerror = () => {
                console.error('Errore nel caricamento del missile sprite');
                reject();
            };
            this.image.src = 'rocket3.png';
        });
    }
    
    // Disegna il missile
    draw(ctx, x, y, rotation, size = 20) {
        if (!this.isLoaded || !this.image) return;
        
        ctx.save();
        
        // Posiziona e ruota il missile
        ctx.translate(x, y);
        ctx.rotate(rotation);
        
        // Calcola le dimensioni scalate
        const scaledWidth = size;
        const scaledHeight = (this.height / this.width) * size;
        
        // Disegna il missile centrato
        ctx.drawImage(
            this.image,
            -scaledWidth / 2,
            -scaledHeight / 2,
            scaledWidth,
            scaledHeight
        );
        
        ctx.restore();
    }
    
    // Disegna il missile con effetto di scia
    drawWithTrail(ctx, x, y, rotation, size = 20, trailLength = 15) {
        if (!this.isLoaded || !this.image) return;
        
        ctx.save();
        
        // Disegna la scia del missile
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.7;
        
        const trailX = x - Math.cos(rotation) * trailLength;
        const trailY = y - Math.sin(rotation) * trailLength;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(trailX, trailY);
        ctx.stroke();
        
        // Disegna il missile
        this.draw(ctx, x, y, rotation, size);
        
        ctx.restore();
    }
}



