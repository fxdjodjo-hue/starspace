// Proiettile nemico - Laser singolo rosso
export class EnemyProjectile {
    constructor(x, y, targetX, targetY, speed = 6, damage = 20) {
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.speed = speed;
        this.damage = damage;
        this.active = true;
        
        // Calcola direzione verso il target
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
        
        // Proprietà visive
        this.radius = 3;
        this.color = '#ff0000'; // Rosso
        this.trail = [];
        this.maxTrailLength = 8;
    }
    
    update() {
        if (!this.active) return;
        
        // Salva posizione precedente per la scia
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
        
        // Muovi il proiettile
        this.x += this.vx;
        this.y += this.vy;
        
        // Controlla se è fuori dai confini della mappa
        if (this.x < 0 || this.x > 16000 || this.y < 0 || this.y > 10000) {
            this.active = false;
        }
    }
    
    // Aggiorna direzione verso un nuovo target
    updateDirection(newTargetX, newTargetY) {
        const dx = newTargetX - this.x;
        const dy = newTargetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            this.vx = (dx / distance) * this.speed;
            this.vy = (dy / distance) * this.speed;
        }
    }
    
    // Controlla collisione con il giocatore
    checkCollision(ship) {
        if (!this.active || !ship || !ship.active) return false;
        
        const dx = ship.x - this.x;
        const dy = ship.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance <= (this.radius + ship.size / 2);
    }
    
    // Deattiva il proiettile
    deactivate() {
        this.active = false;
    }
    
    draw(ctx, camera) {
        if (!this.active) return;
        
        const screenPos = camera.worldToScreen(this.x, this.y);
        
        // Disegna la scia
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < this.trail.length - 1; i++) {
            const trailPos = camera.worldToScreen(this.trail[i].x, this.trail[i].y);
            const nextTrailPos = camera.worldToScreen(this.trail[i + 1].x, this.trail[i + 1].y);
            
            if (i === 0) {
                ctx.moveTo(trailPos.x, trailPos.y);
            } else {
                ctx.lineTo(trailPos.x, trailPos.y);
            }
        }
        ctx.stroke();
        
        // Disegna il proiettile
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Effetto di luminosità
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, this.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
    }
}
