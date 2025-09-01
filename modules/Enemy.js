// Modulo Nemico
export class Enemy {
    constructor(x, y, type = 'basic') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.radius = 15; // Raggio visivo
        this.hitboxRadius = 40; // Raggio di collisione per il click (più grande)
        this.speed = 2;
        this.maxHP = this.getMaxHP();
        this.hp = this.maxHP;
                this.active = true;
        this.isSelected = false; // Nuovo: stato di selezione

        // Sistema di pattuglia (non aggressivo)
        this.patrolDirection = Math.random() * Math.PI * 2;
        
        // Colori basati sul tipo
        this.colors = this.getColors();
    }
    
    getMaxHP() {
        switch (this.type) {
            case 'basic': return 500;    // 16x più resistente
            case 'fast': return 300;     // 15x più resistente  
            case 'tank': return 800;     // 13x più resistente
            default: return 500;
        }
    }
    

    
    getColors() {
        switch (this.type) {
            case 'basic':
                return { fill: '#ff4444', stroke: '#cc0000', hp: '#ff0000' };
            case 'fast':
                return { fill: '#ff8844', stroke: '#cc6600', hp: '#ff6600' };
            case 'tank':
                return { fill: '#880000', stroke: '#440000', hp: '#cc0000' };
            default:
                return { fill: '#ff4444', stroke: '#cc0000', hp: '#ff0000' };
        }
    }
    
    update(player) {
        if (!this.active) return;
        
        // Movimento in pattuglia casuale (non aggressivo)
        if (Math.random() < 0.02) { // 2% di probabilità di cambiare direzione
            this.patrolDirection = Math.random() * Math.PI * 2;
        }
        
        // Muovi in direzione casuale
        this.x += Math.cos(this.patrolDirection) * this.speed * 0.5; // Velocità ridotta
        this.y += Math.sin(this.patrolDirection) * this.speed * 0.5;
        
        // Mantieni i nemici dentro i confini della mappa
        if (this.x < 1000) this.x = 1000;
        if (this.x > 9000) this.x = 9000;
        if (this.y < 1000) this.y = 1000;
        if (this.y > 9000) this.y = 9000;
    }
    
    takeDamage(damage) {
        this.hp -= damage;
        
        if (this.hp <= 0) {
            this.die();
        }
    }
    
    // Seleziona questo nemico
    select() {
        this.isSelected = true;
    }
    
    // Deseleziona questo nemico
    deselect() {
        this.isSelected = false;
    }
    
    die() {
        this.active = false;
        this.isSelected = false; // Deseleziona quando muore
    }
    
    draw(ctx, camera) {
        if (!this.active) return;
        
        const screenPos = camera.worldToScreen(this.x, this.y);
        
        // Disegna il nemico
        ctx.fillStyle = this.colors.fill;
        ctx.strokeStyle = this.colors.stroke;
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Debug: mostra hitbox per il click (cerchio trasparente)
        // Rosso se selezionato, verde se non selezionato
        if (this.isSelected) {
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)'; // Rosso più visibile
            ctx.lineWidth = 2; // Linea più spessa per evidenziare
        } else {
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)'; // Verde normale
            ctx.lineWidth = 1;
        }
        
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, this.hitboxRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Barra HP
        this.drawHealthBar(ctx, screenPos.x, screenPos.y, 1);
        
        // Indicatore di tipo
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.type.toUpperCase(), screenPos.x, screenPos.y + this.radius + 15);
    }
    
    drawHealthBar(ctx, x, y, zoom = 1) {
        const barWidth = this.radius * 2;
        const barHeight = 6; // Barra più alta
        const barY = y - this.radius - 10;
        
        // Sfondo barra HP
        ctx.fillStyle = '#333333';
        ctx.fillRect(x - barWidth/2, barY, barWidth, barHeight);
        
        // Barra HP attuale
        const hpPercentage = this.hp / this.maxHP;
        const currentWidth = barWidth * hpPercentage;
        
        // Colore dinamico basato sulla percentuale HP
        if (hpPercentage > 0.6) {
            ctx.fillStyle = '#00ff00'; // Verde
        } else if (hpPercentage > 0.3) {
            ctx.fillStyle = '#ffff00'; // Giallo
        } else {
            ctx.fillStyle = '#ff0000'; // Rosso
        }
        
        ctx.fillRect(x - barWidth/2, barY, currentWidth, barHeight);
        
        // Bordo barra HP
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - barWidth/2, barY, barWidth, barHeight);
        
        // Testo HP numerico
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${this.hp}/${this.maxHP}`, x, y - this.radius - 5);
    }
}
