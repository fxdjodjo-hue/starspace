// Modulo Nemico
import { AlienSprite } from './AlienSprite.js';

export class Enemy {
    constructor(x, y, type = 'barracuda') {
        this.x = x;
        this.y = y;
        this.type = type; // Ora solo 'barracuda'
        this.radius = 15; // Raggio visivo
        this.hitboxRadius = 40; // Raggio di collisione per il click (più grande)
        this.speed = 2;
        this.maxHP = this.getMaxHP();
        this.hp = this.maxHP;
        
        // Sistema scudo (come il player)
        this.maxShield = 30; // Valore base
        this.shield = this.maxShield;
        this.shieldRegenRate = 1; // Rigenerazione scudo per secondo
        this.shieldRegenDelay = 3000; // Ritardo prima della rigenerazione (3 secondi)
        this.lastDamageTime = 0;
        this.active = true;
        this.isSelected = false; // Nuovo: stato di selezione

        // Sistema di pattuglia (non aggressivo)
        this.patrolDirection = Math.random() * Math.PI * 2;
        this.vx = 0; // Velocità X
        this.vy = 0; // Velocità Y
        
        // Sistema di tratte lunghe
        this.patrolTimer = Math.random() * 300; // Offset casuale 0-5 secondi
        this.patrolDuration = 300 + Math.random() * 300; // 5-10 secondi (300-600 frame)
        
        // Assicura direzione unica per evitare sovrapposizioni
        this.uniqueDirection = Math.random() * Math.PI * 2;
        
        // Sistema di sprite animato
        this.sprite = new AlienSprite();
        this.spriteLoaded = false;
        this.loadSprite();
        
        // Colori basati sul tipo
        this.colors = this.getColors();
    }
    
    getMaxHP() {
        switch (this.type) {
            case 'barracuda': return 500;    // HP per il Barracuda
            default: return 500;
        }
    }
    

    
    getColors() {
        switch (this.type) {
            case 'barracuda':
                return { fill: '#ff4444', stroke: '#cc0000', hp: '#ff0000' };
            default:
                return { fill: '#ff4444', stroke: '#cc0000', hp: '#ff0000' };
        }
    }
    
    async loadSprite() {
        try {
            await this.sprite.load();
            this.spriteLoaded = true;

        } catch (error) {
            console.error('❌ Errore caricamento sprite per nemico:', error);
            this.spriteLoaded = false;
        }
    }
    
    update(player) {
        if (!this.active) return;
        
        // Aggiorna lo sprite animato
        this.sprite.update();
        
        // Rigenerazione scudo (come il player)
        const currentTime = Date.now();
        if (currentTime - this.lastDamageTime > this.shieldRegenDelay) {
            this.shield = Math.min(this.maxShield, this.shield + this.shieldRegenRate / 60);
        }
        
        // Sistema di tratte lunghe - cambia direzione solo dopo un certo tempo
        this.patrolTimer++;
        if (this.patrolTimer >= this.patrolDuration) {
            // Genera nuova direzione unica basata su ID e tempo
            const uniqueSeed = (this.x + this.y + Date.now()) % 360;
            this.patrolDirection = (uniqueSeed * Math.PI * 2) / 360;
            this.patrolTimer = 0;
            this.patrolDuration = 300 + Math.random() * 300; // Nuova durata casuale 5-10 secondi
        }
        
        // Calcola velocità in direzione casuale (più fluida)
        this.vx = Math.cos(this.patrolDirection) * this.speed * 0.8; // Velocità aumentata per fluidità
        this.vy = Math.sin(this.patrolDirection) * this.speed * 0.8;
        
        // Muovi in direzione casuale
        this.x += this.vx;
        this.y += this.vy;
        
        // Mantieni i nemici dentro i confini della mappa rettangolare
        if (this.x < 500) this.x = 500;
        if (this.x > 15500) this.x = 15500; // 16000 - 500
        if (this.y < 500) this.y = 500;
        if (this.y > 9500) this.y = 9500; // 10000 - 500
    }
    
    takeDamage(damage) {
        this.lastDamageTime = Date.now();
        
        // Prima danneggia lo scudo
        if (this.shield > 0) {
            const shieldDamage = Math.min(damage, this.shield);
            this.shield -= shieldDamage;
            damage -= shieldDamage;
        }
        
        // Poi danneggia l'HP
        if (damage > 0) {
            this.hp -= damage;
            if (this.hp <= 0) {
                this.die();
            }
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
        
        // Disegna lo sprite animato del Barracuda solo se caricato
        if (this.spriteLoaded) {
            // Calcola la direzione del movimento
            let direction = 0;
            if (this.vx !== undefined && this.vy !== undefined && (this.vx !== 0 || this.vy !== 0)) {
                direction = Math.atan2(this.vy, this.vx);
            }
            
            this.sprite.draw(ctx, screenPos.x, screenPos.y, direction, 0.8); // Passa la rotazione, scala = 0.8
        } else {
            // Fallback: disegna un cerchio semplice mentre lo sprite si carica
            ctx.fillStyle = this.colors.fill;
            ctx.strokeStyle = this.colors.stroke;
            ctx.lineWidth = 2;
            
            ctx.beginPath();
            ctx.arc(screenPos.x, screenPos.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
        
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
        
        // Barre HP e Scudo (come il player)
        this.drawHealthBar(ctx, camera);
        
        // Nome del nemico (identico al player)
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.type.toUpperCase(), screenPos.x, screenPos.y + 40);
    }
    
    // Disegna barre HP e Scudo (esattamente come il player)
    drawHealthBar(ctx, camera) {
        const barX = this.x - camera.x - 40;
        const barY = this.y - camera.y - this.radius/2 - 40;
        const barWidth = 80;
        const barHeight = 8;
        const barSpacing = 0;
        
        // SCUDO - Barra superiore
        const shieldPercentage = this.shield / this.maxShield;
        
        // Sfondo scudo
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Barra scudo attiva
        if (shieldPercentage > 0) {
            ctx.fillStyle = '#4A90E2';
            ctx.fillRect(barX, barY, barWidth * shieldPercentage, barHeight);
        }
        
        // HP - Barra inferiore
        const hpBarY = barY + barHeight + barSpacing;
        const hpPercentage = this.hp / this.maxHP;
        
        // Sfondo HP
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(barX, hpBarY, barWidth, barHeight);
        
        // Barra HP attiva
        if (hpPercentage > 0) {
            ctx.fillStyle = hpPercentage > 0.3 ? '#7ED321' : '#F5A623';
            ctx.fillRect(barX, hpBarY, barWidth * hpPercentage, barHeight);
        }
        
        // Testo dentro le barre
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 9px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Testo scudo (dentro la barra)
        if (barWidth * shieldPercentage > 25) { // Solo se c'è abbastanza spazio
            ctx.fillText(`${Math.floor(this.shield)}/${this.maxShield}`, barX + barWidth/2, barY + barHeight/2);
        }
        
        // Testo HP (dentro la barra)
        if (barWidth * hpPercentage > 25) { // Solo se c'è abbastanza spazio
            ctx.fillText(`${Math.floor(this.hp)}/${this.maxHP}`, barX + barWidth/2, hpBarY + barHeight/2);
        }
    }
}
