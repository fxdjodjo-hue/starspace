// Modulo Projectile per i proiettili del combattimento
export class Projectile {
    constructor(x, y, targetX, targetY, speed = 8, damage = 25) {
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.speed = speed;
        this.damage = damage;
        this.active = true;
        this.radius = 3;
        
        // Calcola la direzione del proiettile
        const dx = targetX - x;
        const dy = targetY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            this.vx = (dx / distance) * speed;
            this.vy = (dy / distance) * speed;
        } else {
            this.vx = 0;
            this.vy = 0;
        }
        
        // Vita del proiettile (per evitare che voli all'infinito)
        this.maxLifetime = 120; // 2 secondi a 60 FPS
        this.lifetime = 0;
        
        // Carica la texture del laser
        this.texture = new Image();
        this.texture.src = 'laser1.png';
        this.textureLoaded = false;
        this.texture.onload = () => {
            this.textureLoaded = true;
        };
    }
    
    update() {
        if (!this.active) return;
        
        // Aggiorna posizione
        this.x += this.vx;
        this.y += this.vy;
        
        // Aggiorna vita
        this.lifetime++;
        
        // Disattiva se troppo vecchio
        if (this.lifetime >= this.maxLifetime) {
            this.active = false;
        }
    }
    
    // Metodo per aggiornare la direzione verso il target (se il target si muove)
    updateDirection(targetX, targetY) {
        if (!this.active) return;
        
        // Calcola nuova direzione verso il target
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            // Aggiorna velocità mantenendo la stessa velocità scalare
            this.vx = (dx / distance) * this.speed;
            this.vy = (dy / distance) * this.speed;
        }
    }
    
    draw(ctx, camera) {
        if (!this.active) return;
        
        // Posizione relativa alla camera
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        
        ctx.save();
        
        // Usa la texture se caricata, altrimenti fallback
        if (this.textureLoaded) {
            // Calcola la rotazione del proiettile
            const rotation = Math.atan2(this.vy, this.vx);
            
            // Disegna la texture del laser
            ctx.translate(screenX, screenY);
            ctx.rotate(rotation);
            
            // Dimensioni del laser (adatta la texture) - ANCORA PIÙ GRANDE
            const laserWidth = 48;
            const laserHeight = 18;
            
            ctx.drawImage(this.texture, -laserWidth/2, -laserHeight/2, laserWidth, laserHeight);
        } else {
            // Fallback: disegna un proiettile semplice
            // Effetto luminoso
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = 8;
            
            // Proiettile principale (rosso come il laser)
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Nucleo più luminoso
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(screenX, screenY, this.radius * 0.6, 0, Math.PI * 2);
            ctx.fill();
            
            // Scia del proiettile
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.6;
            
            const trailLength = 15;
            ctx.beginPath();
            ctx.moveTo(screenX, screenY);
            ctx.lineTo(screenX - this.vx * trailLength / this.speed, 
                       screenY - this.vy * trailLength / this.speed);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    // Metodo render per compatibilità con PlayerAI
    render(ctx) {
        if (!this.active) return;
        
        ctx.save();
        
        // Usa la texture se caricata, altrimenti fallback
        if (this.textureLoaded) {
            // Calcola la rotazione del proiettile
            const rotation = Math.atan2(this.vy, this.vx);
            
            // Disegna la texture del laser
            ctx.translate(this.x, this.y);
            ctx.rotate(rotation);
            
            // Dimensioni del laser - ANCORA PIÙ GRANDE
            const laserWidth = 48;
            const laserHeight = 18;
            
            ctx.drawImage(this.texture, -laserWidth/2, -laserHeight/2, laserWidth, laserHeight);
        } else {
            // Fallback: disegna un proiettile semplice (rosso come il laser)
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = 8;
            
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.6, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.6;
            
            const trailLength = 15;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x - this.vx * trailLength / this.speed, 
                       this.y - this.vy * trailLength / this.speed);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    // Controlla collisione con un nemico
    checkCollision(enemy) {
        // Controlli di sicurezza
        if (!this.active || !enemy || !enemy.active) return false;
        
        const dx = this.x - enemy.x;
        const dy = this.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < enemy.radius + this.radius;
    }
    
    // Disattiva il proiettile
    deactivate() {
        this.active = false;
    }
}
