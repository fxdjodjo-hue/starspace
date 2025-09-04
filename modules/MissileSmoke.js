// Sistema di fumo per i missili
export class MissileSmoke {
    constructor() {
        this.smokeImage = null;
        this.smokeLoaded = false;
        this.frameWidth = 90;
        this.frameHeight = 90;
        this.totalFrames = 20;
        
        // Sistema scia fumo
        this.smokeTrail = []; // Array di particelle di fumo
        this.maxTrailLength = 15; // Massimo numero di particelle nella scia
        this.smokeSpawnRate = 0; // Timer per spawnare nuove particelle
        this.smokeSpawnInterval = 2; // Ogni 2 frame una nuova particella
        
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
    
    // Aggiorna la scia di fumo
    update(missile) {
        if (!this.smokeLoaded || !missile.active) return;
        
        // Spawna nuove particelle di fumo
        this.smokeSpawnRate++;
        if (this.smokeSpawnRate >= this.smokeSpawnInterval) {
            this.smokeSpawnRate = 0;
            
            // Aggiungi una nuova particella di fumo dietro al missile
            const smokeOffset = 25; // Distanza dietro al missile
            const smokeX = missile.x - missile.vx * smokeOffset / missile.speed;
            const smokeY = missile.y - missile.vy * smokeOffset / missile.speed;
            
            this.smokeTrail.push({
                x: smokeX,
                y: smokeY,
                frame: 0,
                life: this.totalFrames, // Vita della particella
                alpha: 0.8
            });
            
            // Particella fumo creata
        }
        
        // Aggiorna tutte le particelle esistenti
        this.smokeTrail = this.smokeTrail.filter(particle => {
            particle.frame++;
            particle.life--;
            particle.alpha = particle.life / this.totalFrames; // Fade out
            
            return particle.life > 0;
        });
        
        // Limita la lunghezza della scia
        if (this.smokeTrail.length > this.maxTrailLength) {
            this.smokeTrail.shift(); // Rimuovi la particella più vecchia
        }
    }
    
    // Disegna la scia di fumo dietro al missile
    draw(ctx, camera, missile) {
        if (!this.smokeLoaded || !missile.active) return;
        
        // Disegna le particelle di fumo
        
        ctx.save();
        
        // Disegna tutte le particelle della scia
        this.smokeTrail.forEach((particle, index) => {
            // Calcola la posizione sullo schermo
            const screenX = particle.x - camera.x;
            const screenY = particle.y - camera.y;
            
            // Calcola il frame da disegnare
            const frameX = particle.frame * this.frameWidth;
            
            // Imposta trasparenza per effetto fumo (più visibile)
            ctx.globalAlpha = particle.alpha * 0.8;
            
            // Disegna la particella di fumo (più grande)
            const smokeSize = 80; // Dimensione del fumo aumentata
            ctx.drawImage(
                this.smokeImage,
                frameX, 0, this.frameWidth, this.frameHeight, // Source rectangle
                screenX - smokeSize/2, screenY - smokeSize/2, smokeSize, smokeSize // Destination rectangle
            );
        });
        
        ctx.restore();
    }
}
