// Portal - Sistema portali tra mappe
export class Portal {
    constructor(x, y, targetMap, targetX, targetY, name = 'Portal') {
        this.x = x;
        this.y = y;
        this.targetMap = targetMap;
        this.targetX = targetX;
        this.targetY = targetY;
        this.name = name;
        this.size = 60;
        this.active = true;
        this.animationFrame = 0;
        this.animationSpeed = 0.1;
    }
    
    // Aggiorna animazione
    update() {
        this.animationFrame += this.animationSpeed;
        if (this.animationFrame >= Math.PI * 2) {
            this.animationFrame = 0;
        }
    }
    
    // Disegna il portale
    draw(ctx, camera) {
        if (!this.active) return;
        
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        
        // Controlla se è visibile
        if (screenX < -this.size || screenX > camera.width + this.size ||
            screenY < -this.size || screenY > camera.height + this.size) {
            return;
        }
        
        ctx.save();
        
        // Effetto pulsante
        const pulse = Math.sin(this.animationFrame) * 0.2 + 0.8;
        const currentSize = this.size * pulse;
        
        // Gradiente per effetto portale
        const gradient = ctx.createRadialGradient(
            screenX, screenY, 0,
            screenX, screenY, currentSize
        );
        gradient.addColorStop(0, 'rgba(100, 200, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(50, 150, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(0, 100, 200, 0.1)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(screenX, screenY, currentSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Bordo
        ctx.strokeStyle = 'rgba(150, 200, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Nome del portale
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, screenX, screenY - currentSize - 10);
        
        ctx.restore();
    }
    
    // Controlla collisione con giocatore
    checkCollision(player) {
        if (!this.active) return false;
        
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < this.size;
    }
    
    // Attiva/disattiva portale
    setActive(active) {
        this.active = active;
    }
    
    // Serializzazione
    serialize() {
        return {
            x: this.x,
            y: this.y,
            targetMap: this.targetMap,
            targetX: this.targetX,
            targetY: this.targetY,
            name: this.name,
            active: this.active
        };
    }
    
    // Deserializzazione
    static deserialize(data) {
        const portal = new Portal(data.x, data.y, data.targetMap, data.targetX, data.targetY, data.name);
        portal.active = data.active;
        return portal;
    }
}
