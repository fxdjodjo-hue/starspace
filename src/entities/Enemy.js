// Modulo Nemico
import { AlienSprite } from './AlienSprite.js';
import { NPCTypes } from './NPCTypes.js';
import { AISystem } from '../systems/AISystem.js';

export class Enemy {
    constructor(x, y, type = 'npc_x1') {
        this.x = x;
        this.y = y;
        this.type = type; // Ora usa npc_x1, npc_x2, etc.
        
        // Carica configurazione NPC
        this.npcTypes = new NPCTypes();
        this.config = this.npcTypes.getNPCConfig(type);
        
        // Applica configurazione
        this.radius = this.config.radius;
        this.hitboxRadius = this.config.hitboxRadius;
        this.speed = this.config.speed;
        this.maxHP = this.config.maxHP;
        this.hp = this.maxHP;
        
        // Sistema scudo basato su configurazione
        this.maxShield = this.config.maxShield;
        this.shield = this.maxShield;
        this.shieldRegenRate = this.config.shieldRegenRate;
        this.shieldRegenDelay = this.config.shieldRegenDelay;
        this.lastDamageTime = 0;
        this.active = true;
        this.isSelected = false;

        // Sistema di pattuglia (non aggressivo)
        this.patrolDirection = Math.random() * Math.PI * 2;
        this.vx = 0; // Velocità X
        this.vy = 0; // Velocità Y
        this.rotation = 0; // Rotazione per puntare verso il target
        
        // Sistema di tratte lunghe
        this.patrolTimer = Math.random() * 300; // Offset casuale 0-5 secondi
        this.patrolDuration = 300 + Math.random() * 300; // 5-10 secondi (300-600 frame)
        
        // Assicura direzione unica per evitare sovrapposizioni
        this.uniqueDirection = Math.random() * Math.PI * 2;
        
        // Sistema di sprite animato
        this.sprite = new AlienSprite(this.config.sprite, this.getAtlasPath());
        this.spriteLoaded = false;
        this.fallbackLogged = false;
        this.loadSprite();
        
        // Colori basati su configurazione
        this.colors = this.config.colors;
        
        // Statistiche aggiuntive
        this.damage = this.config.damage;
        this.experience = this.config.experience;
        this.credits = this.config.credits;
        this.uridium = this.config.uridium || 0;
        this.honor = this.config.honor || 0;
        
        // Sistema AI (inizializzato dopo che il gioco è pronto)
        this.ai = null;
    }
    
    // Ottiene il percorso dell'atlas basato sullo sprite
    getAtlasPath() {
        const spritePath = this.config.sprite;
        // Sostituisce .png con .atlas
        return spritePath.replace('.png', '.atlas');
    }
    
    getMaxHP() {
        return this.config.maxHP;
    }
    

    
    getColors() {
        return this.config.colors;
    }
    
    // Ottiene il nome di visualizzazione
    getDisplayName() {
        return this.config.name || this.type.toUpperCase();
    }
    
    // Inizializza il sistema AI
    initAI(game) {
        if (!this.ai) {
            this.ai = new AISystem(this, game);
        }
    }
    
    async loadSprite() {
        try {
            await this.sprite.load();
            this.spriteLoaded = true;

        } catch (error) {
            console.error(`❌ Errore caricamento sprite per ${this.type}:`, error);
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
        
        // Usa AI se disponibile, altrimenti comportamento di pattuglia
        if (this.ai) {
            this.ai.update();
            
            // Controlla collisioni proiettili-giocatore
            this.ai.checkProjectileCollisions();
        } else {
            // Comportamento di pattuglia di base (fallback)
            this.updatePatrol();
        }
        
        // Mantieni i nemici dentro i confini della mappa rettangolare
        if (this.x < 500) this.x = 500;
        if (this.x > 15500) this.x = 15500; // 16000 - 500
        if (this.y < 500) this.y = 500;
        if (this.y > 9500) this.y = 9500; // 10000 - 500
    }
    
    // Comportamento di pattuglia di base (fallback)
    updatePatrol() {
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
    }
    
    takeDamage(damage, projectile = null, skipDamageNumber = false) {
        this.lastDamageTime = Date.now();
        
        // Disattiva immediatamente il proiettile all'impatto
        if (projectile && projectile.active) {
            projectile.deactivate();
        }
        
        // Se è un proiettile SAB, assorbe solo scudo e non fa danno
        if (projectile && projectile.isSAB) {
            if (this.shield > 0) {
                const shieldAbsorbed = Math.min(this.shield, 50); // Assorbe 50 di scudo
                this.shield -= shieldAbsorbed;
                
                // Mostra il numero di scudo assorbito in blu
                if (window.gameInstance && window.gameInstance.damageNumbers) {
                    window.gameInstance.damageNumbers.addNumber(this, shieldAbsorbed, 'shield');
                }
            }
            return;
        }
        
        // Gestione danno normale
        let hpDamage = damage;
        let shieldDamage = 0;
        
        // Prima calcola il danno allo scudo
        if (this.shield > 0) {
            shieldDamage = Math.min(damage, this.shield);
            this.shield -= shieldDamage;
            hpDamage -= shieldDamage;
        }
        
        // Poi danneggia l'HP
        if (hpDamage > 0) {
            this.hp -= hpDamage;
            
            // Non mostrare il numero di danno qui, viene mostrato dalla Ship
            
            if (this.hp <= 0) {
                this.die();
            }
        }
        
        // Notifica all'AI che ha ricevuto danni
        if (this.ai) {
            this.ai.onDamageReceived();
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
            // Usa la rotazione dell'AI se disponibile, altrimenti usa la direzione del movimento
            let direction = this.rotation;
            if (this.ai && this.ai.getState() === 'attack') {
                // Se è in attacco, usa sempre la rotazione dell'AI
                direction = this.rotation;
            } else if (this.vx !== undefined && this.vy !== undefined && (this.vx !== 0 || this.vy !== 0)) {
                // Altrimenti usa la direzione del movimento
                direction = Math.atan2(this.vy, this.vx);
            }
            
            this.sprite.draw(ctx, screenPos.x, screenPos.y, direction, 0.8); // Passa la rotazione, scala = 0.8
        } else {
            // Fallback: disegna un cerchio semplice mentre lo sprite si carica
            if (!this.fallbackLogged) {
                console.log(`⚠️ Fallback sprite per ${this.type} - spriteLoaded: ${this.spriteLoaded}`);
                this.fallbackLogged = true;
            }
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
        
        // Nome del nemico (usa nome dalla configurazione NPC)
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.getDisplayName(), screenPos.x, screenPos.y + 40);
        
        // Indicatore stato AI
        if (this.ai) {
            const aiState = this.ai.getState();
            let stateColor = '#888888'; // Default grigio
            let stateText = '';
            
            switch (aiState) {
                case 'patrol':
                    stateColor = '#00ff00'; // Verde
                    stateText = 'PATROL';
                    break;
                case 'alert':
                    stateColor = '#ffff00'; // Giallo
                    stateText = 'ALERT';
                    break;
                case 'attack':
                    stateColor = '#ff0000'; // Rosso
                    stateText = 'ATTACK';
                    break;
                case 'flee':
                    stateColor = '#ff8800'; // Arancione
                    stateText = 'FLEE';
                    break;
            }
            
            ctx.fillStyle = stateColor;
            ctx.font = 'bold 10px Arial';
            ctx.fillText(stateText, screenPos.x, screenPos.y + 55);
        }
        
        // Disegna proiettili dell'AI
        if (this.ai) {
            this.ai.drawProjectiles(ctx, camera);
        }
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
