// Modulo Missile per i missili del combattimento
import { MissileSmoke } from './MissileSmoke.js';

export class Missile {
    constructor(x, y, targetX, targetY, speed = 4, damage = 50) {
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.speed = speed;
        this.damage = damage;
        this.active = true;
        this.radius = 8;
        this.rotation = 0;
        this.lifetime = 300; // 5 secondi a 60fps
        
        // Sistema fumo
        this.smoke = new MissileSmoke();
        
        // Calcola direzione iniziale - SEMPLICE
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            this.vx = (dx / distance) * this.speed;
            this.vy = (dy / distance) * this.speed;
            this.rotation = Math.atan2(dy, dx) + Math.PI / 2; // Aggiungi 90 gradi per orientamento corretto
        } else {
            this.vx = 0;
            this.vy = 0;
            this.rotation = Math.PI / 2; // Orientamento di default verso l'alto
        }
        
        // Inizializza sprite
        this.sprite = null;
        
        // Carica la texture del missile
        this.texture = new Image();
        this.texture.src = 'missile1.png';
        this.textureLoaded = false;
        this.texture.onload = () => {
            this.textureLoaded = true;
        };
    }
    
    // Aggiorna la posizione del missile - HOMING (sempre a segno)
    update(target) {
        if (!this.active) return;
        
        // Se c'è un target, aggiorna la direzione verso di esso (HOMING)
        if (target && target.active) {
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                // Calcola la velocità target
                const targetVx = (dx / distance) * this.speed;
                const targetVy = (dy / distance) * this.speed;
                
                // Accelerazione graduale per un effetto più realistico
                const acceleration = 0.15; // Velocità di accelerazione
                this.vx += (targetVx - this.vx) * acceleration;
                this.vy += (targetVy - this.vy) * acceleration;
                
                // Aggiorna la rotazione (aggiungi 90 gradi per orientamento corretto)
                this.rotation = Math.atan2(this.vy, this.vx) + Math.PI / 2;
            }
        }
        
        // Muovi il missile
        this.x += this.vx;
        this.y += this.vy;
        
        // Aggiorna l'effetto fumo
        this.smoke.update(this); // Passa il missile per la scia
        
        // Riduci la vita
        this.lifetime--;
        if (this.lifetime <= 0) {
            this.active = false;
        }
    }
    
    // Disegna il missile
    draw(ctx, camera) {
        if (!this.active) return;
        
        // Disegna prima l'effetto fumo (dietro al missile)
        this.smoke.draw(ctx, camera, this);
        
        // Posizione relativa alla camera
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        
        ctx.save();
        
        // Usa la texture se caricata, altrimenti fallback
        if (this.textureLoaded) {
            // Calcola la rotazione del missile
            // Aggiungi 90 gradi perché la texture è orientata verso l'alto
            const rotation = Math.atan2(this.vy, this.vx) + Math.PI / 2;
            
            // Disegna la texture del missile
            ctx.translate(screenX, screenY);
            ctx.rotate(rotation);
            
            // Dimensioni del missile (adatta la texture) - MOLTO PIÙ GRANDE
            const missileWidth = 80;
            const missileHeight = 50;
            
            ctx.drawImage(this.texture, -missileWidth/2, -missileHeight/2, missileWidth, missileHeight);
        } else {
            // Fallback: disegna un missile semplice
            // Effetto luminoso
            ctx.shadowColor = '#ff6600';
            ctx.shadowBlur = 6;
            
            // Corpo del missile
            ctx.fillStyle = '#ff6600';
            ctx.beginPath();
            ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Nucleo più luminoso
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(screenX, screenY, this.radius * 0.6, 0, Math.PI * 2);
            ctx.fill();
            
            // Scia del missile
            ctx.strokeStyle = '#ff6600';
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.7;
            
            const trailLength = 20;
            ctx.beginPath();
            ctx.moveTo(screenX, screenY);
            ctx.lineTo(screenX - this.vx * trailLength / this.speed, 
                       screenY - this.vy * trailLength / this.speed);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    // Controlla collisione con un target - SEMPLICE
    checkCollision(target) {
        if (!this.active || !target || !target.active) return false;
        
        const dx = this.x - target.x;
        const dy = this.y - target.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const collisionDistance = this.radius + target.radius;
        
        return distance < collisionDistance;
    }
    
    // Distruggi il missile
    destroy() {
        this.active = false;
    }
    
    // Imposta lo sprite del missile
    setSprite(sprite) {
        this.sprite = sprite;
    }
}
