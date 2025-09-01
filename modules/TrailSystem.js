// Sistema di scie per la nave
export class TrailSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = 30; // Ridotto per essere meno invadenti
        this.particleLifetime = 40; // Frame di vita ridotti
        this.spawnRate = 3; // Particelle ogni 3 frame (meno frequenti)
        this.spawnTimer = 0;
        this.lastShipX = 0;
        this.lastShipY = 0;
    }
    
    // Aggiunge una particella alla scia
    addParticle(x, y, velocityX, velocityY) {
        if (this.particles.length >= this.maxParticles) {
            // Rimuovi la particella più vecchia
            this.particles.shift();
        }
        
        this.particles.push({
            x: x,
            y: y,
            velocityX: velocityX * 0.3, // Velocità ridotta
            velocityY: velocityY * 0.3,
            life: this.particleLifetime,
            maxLife: this.particleLifetime,
            size: Math.random() * 2 + 1, // Dimensione ridotta tra 1-3
            alpha: 0.6 // Alpha ridotta
        });
    }
    
    // Aggiorna tutte le particelle
    update() {
        this.spawnTimer++;
        
        // Aggiorna particelle esistenti
        this.particles = this.particles.filter(particle => {
            // Aggiorna posizione
            particle.x += particle.velocityX;
            particle.y += particle.velocityY;
            
            // Riduce la vita
            particle.life--;
            
            // Aggiorna alpha basato sulla vita rimanente
            particle.alpha = (particle.life / particle.maxLife) * 0.8;
            
            // Riduce gradualmente la velocità (attrito)
            particle.velocityX *= 0.98;
            particle.velocityY *= 0.98;
            
            // Riduce leggermente la dimensione
            particle.size *= 0.999;
            
            return particle.life > 0;
        });
    }
    
    // Crea scia quando la nave si muove
    createTrail(ship) {
        // Calcola la distanza percorsa dalla nave
        const distanceMoved = Math.sqrt(
            Math.pow(ship.x - this.lastShipX, 2) + 
            Math.pow(ship.y - this.lastShipY, 2)
        );
        
        // La nave si considera in movimento se si è mossa di almeno 0.5 pixel
        const isMoving = distanceMoved > 0.5;
        
        // Aggiorna la posizione precedente
        this.lastShipX = ship.x;
        this.lastShipY = ship.y;
        
        if (this.spawnTimer >= this.spawnRate && isMoving) {
            // Calcola la posizione dei motori (dietro la nave)
            const engineOffset = 15; // Ridotto
            const engineX = ship.x - Math.cos(ship.rotation) * engineOffset;
            const engineY = ship.y - Math.sin(ship.rotation) * engineOffset;
            
            // Aggiunge rumore casuale per varietà
            const noiseX = (Math.random() - 0.5) * 3;
            const noiseY = (Math.random() - 0.5) * 3;
            
            // Velocità basata sulla direzione della nave (opposta alla rotazione)
            const speed = 1; // Velocità ridotta
            const trailVelocityX = -Math.cos(ship.rotation) * speed + noiseX;
            const trailVelocityY = -Math.sin(ship.rotation) * speed + noiseY;
            
            this.addParticle(engineX, engineY, trailVelocityX, trailVelocityY);
            this.spawnTimer = 0;
        }
        
        // Se la nave è ferma, accelera la scomparsa delle particelle esistenti
        if (!isMoving) {
            this.particles.forEach(particle => {
                // Riduce più velocemente la vita quando la nave è ferma
                particle.life -= 3; // Scompare 3 volte più veloce
                particle.alpha = Math.max(0, (particle.life / particle.maxLife) * 0.6);
            });
        }
    }
    
    // Disegna tutte le particelle
    draw(ctx, camera) {
        this.particles.forEach(particle => {
            const screenPos = camera.worldToScreen(particle.x, particle.y);
            
            // Salva il contesto
            ctx.save();
            
            // Imposta alpha e colore (più sottile)
            ctx.globalAlpha = particle.alpha * 0.7;
            ctx.fillStyle = '#0088cc'; // Colore blu più tenue
            
            // Disegna la particella
            ctx.beginPath();
            ctx.arc(screenPos.x, screenPos.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Aggiunge un bordo sottile
            ctx.globalAlpha = particle.alpha * 0.4;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Ripristina il contesto
            ctx.restore();
        });
    }
    
    // Pulisce tutte le particelle
    clear() {
        this.particles = [];
    }
}
