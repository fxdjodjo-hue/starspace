// Sistema di fumo per i missili
export class MissileSmoke {
    constructor() {
        this.smokeImage = null;
        this.smokeLoaded = false;
        this.frameWidth = 90;
        this.frameHeight = 90;
        this.totalFrames = 20;
        this.currentFrame = 0;
        this.animationSpeed = 0.3; // Velocità animazione
        this.frameTime = 0;
        
        this.loadSmokeImage();
    }
    
    // Carica l'immagine del fumo
    loadSmokeImage() {
        this.smokeImage = new Image();
        this.smokeImage.src = 'smoke1/smoke1.png';
        this.smokeImage.onload = () => {
            this.smokeLoaded = true;
            console.log('💨 Immagine fumo missili caricata:', this.smokeImage.width, 'x', this.smokeImage.height);
        };
        this.smokeImage.onerror = () => {
            console.log('❌ Errore caricamento immagine fumo missili - verifica che smoke1/smoke1.png esista');
        };
    }
    
    // Aggiorna l'animazione del fumo
    update(deltaTime) {
        if (!this.smokeLoaded) return;
        
        this.frameTime += deltaTime;
        if (this.frameTime >= this.animationSpeed) {
            this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
            this.frameTime = 0;
        }
    }
    
    // Disegna l'effetto fumo dietro al missile
    draw(ctx, camera, missile) {
        if (!this.smokeLoaded || !missile.active) return;
        
        ctx.save();
        
        // Calcola la posizione del missile sullo schermo
        const screenX = missile.x - camera.x;
        const screenY = missile.y - camera.y;
        
        // Calcola la posizione del fumo (dietro al missile)
        const smokeOffset = 30; // Distanza dietro al missile
        const smokeX = screenX - missile.vx * smokeOffset / missile.speed;
        const smokeY = screenY - missile.vy * smokeOffset / missile.speed;
        
        // Calcola il frame corrente
        const frameX = this.currentFrame * this.frameWidth;
        
        // Imposta trasparenza per effetto fumo
        ctx.globalAlpha = 0.6;
        
        // Disegna il frame corrente del fumo
        const smokeSize = 60; // Dimensione del fumo
        ctx.drawImage(
            this.smokeImage,
            frameX, 0, this.frameWidth, this.frameHeight, // Source rectangle
            smokeX - smokeSize/2, smokeY - smokeSize/2, smokeSize, smokeSize // Destination rectangle
        );
        
        ctx.restore();
    }
}
