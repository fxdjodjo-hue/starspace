/**
 * Entità Drone UAV
 * Droni che possono volare indipendentemente e supportare la nave madre
 */
export class Drone {
    constructor(x, y, droneType, parentShip) {
        this.x = x;
        this.y = y;
        this.droneType = droneType; // 'flax' o 'iris'
        this.parentShip = parentShip;
        
        // Proprietà fisiche
        this.size = droneType === 'flax' ? 12 : 15; // Iris più grandi
        this.speed = droneType === 'flax' ? 2 : 1.5; // Flax più veloci
        this.rotation = 0;
        this.targetX = x;
        this.targetY = y;
        
        // Stato del drone
        this.isActive = true;
        this.isFollowing = true;
        this.isAttacking = false;
        this.health = 100;
        this.maxHealth = 100;
        
        // Equipaggiamento
        this.equippedItems = [];
        this.slots = droneType === 'flax' ? 1 : 2;
        
        // AI e comportamento
        this.behavior = 'follow'; // 'follow', 'attack', 'defend', 'patrol'
        this.target = null;
        this.lastAttackTime = 0;
        this.attackCooldown = 1000; // 1 secondo
        
        // Effetti visivi
        this.engineGlow = 0;
        this.engineGlowSpeed = 0.1;
        
        // Posizioni di formazione
        this.formationOffset = { x: 0, y: 0 };
        this.formationAngle = 0;
    }
    
    // Aggiorna il drone
    update(deltaTime) {
        if (!this.isActive) return;
        
        // Aggiorna effetti visivi
        this.engineGlow += this.engineGlowSpeed * deltaTime;
        
        // Comportamento basato sullo stato
        switch (this.behavior) {
            case 'follow':
                this.updateFollowBehavior();
                break;
            case 'attack':
                this.updateAttackBehavior();
                break;
            case 'defend':
                this.updateDefendBehavior();
                break;
            case 'patrol':
                this.updatePatrolBehavior();
                break;
        }
        
        // Muovi verso il target
        this.moveTowardsTarget();
        
        // Aggiorna rotazione
        this.updateRotation();
    }
    
    // Comportamento di follow
    updateFollowBehavior() {
        if (!this.parentShip) return;
        
        // Posizione statica fissa nel cerchio con calcolo preciso
        const angle = this.formationAngle + this.parentShip.rotation;
        const formationDistance = 150; // Raggio fisso del cerchio aumentato
        
        // Calcolo preciso della posizione target
        this.targetX = this.parentShip.x + Math.round(Math.cos(angle) * formationDistance * 100) / 100;
        this.targetY = this.parentShip.y + Math.round(Math.sin(angle) * formationDistance * 100) / 100;
        
        // Velocità fissa
        this.speed = this.droneType === 'flax' ? 3 : 2; // Velocità aumentata per posizionamento più rapido
    }
    
    // Comportamento di attacco
    updateAttackBehavior() {
        if (!this.target) return;
        
        // Muovi verso il target
        this.targetX = this.target.x;
        this.targetY = this.target.y;
        
        // Attacca se abbastanza vicino
        const distance = Math.sqrt(
            Math.pow(this.x - this.target.x, 2) + 
            Math.pow(this.y - this.target.y, 2)
        );
        
        if (distance < 50 && Date.now() - this.lastAttackTime > this.attackCooldown) {
            this.attack();
        }
    }
    
    // Comportamento di difesa
    updateDefendBehavior() {
        if (!this.parentShip) return;
        
        // Mantieni una distanza di sicurezza dalla nave
        const distance = Math.sqrt(
            Math.pow(this.x - this.parentShip.x, 2) + 
            Math.pow(this.y - this.parentShip.y, 2)
        );
        
        if (distance < 40) {
            // Allontanati dalla nave
            const angle = Math.atan2(this.y - this.parentShip.y, this.x - this.parentShip.x);
            this.targetX = this.parentShip.x + Math.cos(angle) * 50;
            this.targetY = this.parentShip.y + Math.sin(angle) * 50;
        } else {
            // Segui la nave
            this.updateFollowBehavior();
        }
    }
    
    // Comportamento di pattugliamento
    updatePatrolBehavior() {
        // Implementazione futura per pattugliamento
        this.updateFollowBehavior();
    }
    
    // Muovi verso il target
    moveTowardsTarget() {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0.5) {
            // Movimento diretto e preciso
            const moveX = (dx / distance) * this.speed;
            const moveY = (dy / distance) * this.speed;
            
            this.x += moveX;
            this.y += moveY;
        } else {
            // Posizionamento esatto quando vicino
            this.x = this.targetX;
            this.y = this.targetY;
        }
    }
    
    // Aggiorna rotazione
    updateRotation() {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        this.rotation = Math.atan2(dy, dx);
    }
    
    // Attacca il target
    attack() {
        if (!this.target) return;
        
        this.lastAttackTime = Date.now();
        
        // Calcola danno basato sull'equipaggiamento
        let totalDamage = 0;
        this.equippedItems.forEach(item => {
            if (item && item.type === 'laser') {
                totalDamage += item.damage || 0;
            }
        });
        
        if (totalDamage > 0) {
            // Applica danno al target
            if (this.target.takeDamage) {
                this.target.takeDamage(totalDamage);
            }
            
            // Effetto visivo di attacco
            this.createAttackEffect();
        }
    }
    
    // Crea effetto visivo di attacco
    createAttackEffect() {
        // Implementazione futura per effetti di attacco
        console.log(`🚁 Drone ${this.droneType} attacca per ${this.calculateDamage()} danni!`);
    }
    
    // Calcola danno totale
    calculateDamage() {
        let totalDamage = 0;
        this.equippedItems.forEach(item => {
            if (item && item.type === 'laser') {
                totalDamage += item.damage || 0;
            }
        });
        return totalDamage;
    }
    
    // Imposta comportamento
    setBehavior(behavior) {
        this.behavior = behavior;
    }
    
    // Imposta target
    setTarget(target) {
        this.target = target;
    }
    
    // Imposta posizione di formazione
    setFormationPosition(offsetX, offsetY, angle) {
        this.formationOffset = { x: offsetX, y: offsetY };
        this.formationAngle = angle;
    }
    
    // Equipaggia oggetto
    equipItem(item, slotIndex) {
        if (slotIndex >= 0 && slotIndex < this.slots) {
            this.equippedItems[slotIndex] = item;
        }
    }
    
    // Rimuovi oggetto
    unequipItem(slotIndex) {
        if (slotIndex >= 0 && slotIndex < this.slots) {
            const item = this.equippedItems[slotIndex];
            this.equippedItems[slotIndex] = null;
            return item;
        }
        return null;
    }
    
    // Prendi danno
    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.health = 0;
            this.isActive = false;
        }
    }
    
    // Ripara drone
    repair(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
        if (this.health > 0) {
            this.isActive = true;
        }
    }
    
    // Disegna il drone
    draw(ctx, camera) {
        if (!this.isActive) return;
        
        const screenPos = camera.worldToScreen(this.x, this.y);
        
        ctx.save();
        ctx.translate(screenPos.x, screenPos.y);
        ctx.rotate(this.rotation);
        
        // Disegna corpo del drone
        this.drawDroneBody(ctx);
        
        // Disegna effetti
        this.drawEffects(ctx);
        
        // Disegna slot equipaggiati
        this.drawEquippedItems(ctx);
        
        ctx.restore();
    }
    
    // Disegna corpo del drone
    drawDroneBody(ctx) {
        const width = this.size;
        const height = this.size * 0.6;
        
        // Colori basati sul tipo
        const bodyColor = this.droneType === 'flax' ? '#4a90e2' : '#ff6b6b';
        const accentColor = this.droneType === 'flax' ? '#2c5aa0' : '#cc4444';
        
        // Corpo principale
        ctx.fillStyle = bodyColor;
        ctx.fillRect(-width/2, -height/2, width, height);
        
        // Bordo
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(-width/2, -height/2, width, height);
        
        // Sezione superiore
        ctx.fillStyle = accentColor;
        ctx.fillRect(-width/2 + 2, -height/2 + 2, width - 4, height * 0.3);
        
        // Ali
        ctx.fillStyle = bodyColor;
        ctx.fillRect(-width/2 - 2, -height/4, 2, height/2);
        ctx.fillRect(width/2, -height/4, 2, height/2);
        
        // Motore (con effetto glow)
        const glowIntensity = Math.sin(this.engineGlow) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(0, 255, 255, ${glowIntensity})`;
        ctx.fillRect(-width/2 + 2, height/2 - 3, width - 4, 2);
    }
    
    // Disegna effetti
    drawEffects(ctx) {
        // Effetto di movimento
        if (this.speed > 0) {
            const trailLength = 10;
            ctx.strokeStyle = `rgba(0, 255, 255, 0.3)`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-this.size/2 - trailLength, 0);
            ctx.lineTo(-this.size/2, 0);
            ctx.stroke();
        }
    }
    
    // Disegna oggetti equipaggiati
    drawEquippedItems(ctx) {
        this.equippedItems.forEach((item, index) => {
            if (item) {
                const slotX = (index - 0.5) * 8;
                const slotY = -this.size/2 - 8;
                
                // Slot
                ctx.fillStyle = '#333333';
                ctx.fillRect(slotX - 2, slotY - 3, 4, 6);
                
                // Oggetto
                ctx.fillStyle = item.type === 'laser' ? '#ffff00' : '#00ff00';
                ctx.fillRect(slotX - 1, slotY - 2, 2, 4);
            }
        });
    }
}
