// Sistema di effetti di esplosione
export class ExplosionEffect {
    constructor(x, y, type = 'normal') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.frame = 0;
        this.maxFrames = 8; // Numero di frame per l'animazione
        this.frameRate = 0.3; // Velocità di animazione
        this.frameTimer = 0;
        this.isActive = true;
        this.scale = 1;
        this.alpha = 1;
        
        // Carica l'immagine appropriata
        this.loadExplosionImage();
    }
    
    loadExplosionImage() {
        this.image = new Image();
        
        // Scegli l'immagine basata sul tipo
        const imageFiles = {
            'normal': 'explosion_effect/explosion.png',
            'large': 'explosion_effect/explosion2.png',
            'small': 'explosion_effect/explosion3.png',
            'nuclear': 'explosion_effect/explosion4.png',
            'plasma': 'explosion_effect/explosion5.png',
            'laser': 'explosion_effect/explosion6.png',
            'energy': 'explosion_effect/explosion7.png'
        };
        
        this.image.src = imageFiles[this.type] || imageFiles['normal'];
        
        this.image.onload = () => {
            this.isLoaded = true;
        };
        
        this.image.onerror = () => {
            console.error('❌ Errore nel caricamento dell\'effetto esplosione');
            this.isActive = false;
        };
    }
    
    update() {
        if (!this.isActive) return;
        
        this.frameTimer += this.frameRate;
        if (this.frameTimer >= 1) {
            this.frameTimer = 0;
            this.frame++;
            
            // Calcola scale e alpha per effetto di dissolvenza
            const progress = this.frame / this.maxFrames;
            this.scale = 1 + (progress * 0.5); // Cresce leggermente
            this.alpha = 1 - (progress * 0.8); // Sfuma gradualmente
            
            if (this.frame >= this.maxFrames) {
                this.isActive = false;
            }
        }
    }
    
    draw(ctx, camera) {
        if (!this.isActive || !this.isLoaded || !this.image) return;
        
        const screenPos = camera.worldToScreen(this.x, this.y);
        
        // Controlla se l'esplosione è visibile sullo schermo
        if (screenPos.x < -100 || screenPos.x > ctx.canvas.width + 100 ||
            screenPos.y < -100 || screenPos.y > ctx.canvas.height + 100) {
            return;
        }
        
        ctx.save();
        
        // Imposta alpha e trasformazioni
        ctx.globalAlpha = this.alpha;
        ctx.translate(screenPos.x, screenPos.y);
        ctx.scale(this.scale, this.scale);
        
        // Disegna l'immagine dell'esplosione
        const size = 60; // Dimensione base dell'esplosione
        ctx.drawImage(
            this.image,
            -size/2, -size/2, size, size
        );
        
        ctx.restore();
    }
}

// Manager per gestire tutti gli effetti di esplosione
export class ExplosionManager {
    constructor() {
        this.explosions = [];
    }
    
    // Crea una nuova esplosione
    createExplosion(x, y, type = 'normal') {
        const explosion = new ExplosionEffect(x, y, type);
        this.explosions.push(explosion);
        
        // Limita il numero di esplosioni simultanee per performance
        if (this.explosions.length > 20) {
            this.explosions.shift(); // Rimuovi la più vecchia
        }
    }
    
    // Aggiorna tutte le esplosioni
    update() {
        this.explosions = this.explosions.filter(explosion => {
            explosion.update();
            return explosion.isActive;
        });
    }
    
    // Disegna tutte le esplosioni
    draw(ctx, camera) {
        this.explosions.forEach(explosion => {
            explosion.draw(ctx, camera);
        });
    }
    
    // Pulisce tutte le esplosioni
    clear() {
        this.explosions = [];
    }
}
