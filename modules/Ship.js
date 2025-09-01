// Modulo Nave Spaziale
import { Projectile } from './Projectile.js';
import { Missile } from './Missile.js';
import { Experience } from './Experience.js';
import { UpgradeManager } from './UpgradeManager.js';
import { ShipSprite } from './ShipSprite.js';
import { MissileSprite } from './MissileSprite.js';
import { TrailSystem } from './TrailSystem.js';

export class Ship {
    constructor(x, y, size = 40) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = 2; // Valore base più basso
        this.targetX = x;
        this.targetY = y;
        this.isMoving = false;
        this.direction = 0; // Angolo in radianti
        this.rotation = 0;  // Rotazione visiva

        
        // Sistema di combattimento con proiettili
        this.maxHP = 50; // Valore base più basso
        this.hp = this.maxHP;
        this.selectedTarget = null;
        this.isInCombat = false;
        this.projectiles = [];
        this.fireRate = 60; // Proiettili ogni 60 frame (1 al secondo)
        this.fireTimer = 0;
        this.projectileDamage = 20; // Valore base più basso
        this.projectileSpeed = 8;
        
        // Sistema missili
        this.missiles = [];
        this.missileFireRate = 180; // Missili ogni 180 frame (3 secondi)
        this.missileTimer = 0;
        this.missileDamage = 50;
        this.missileSpeed = 4;
        this.maxMissiles = 3; // Massimo 3 missili contemporaneamente
        
        // Sistema di esperienza e onore
        this.experience = new Experience();
        this.honor = 0;
        
        // Sistema di potenziamenti
        this.upgradeManager = new UpgradeManager();
        
        // Sistema di sprite animati
        this.sprite = new ShipSprite();
        this.missileSprite = new MissileSprite();
        
        // Sistema di scie
        this.trailSystem = new TrailSystem();
        
        // Inizializza le statistiche basate sui potenziamenti
        this.updateStats();
        
        // Carica lo sprite del missile
        this.missileSprite.load();
    }
    
    update() {
        // Log dello stato della nave ogni 60 frame (circa 1 secondo) - solo per debug
        // if (window.gameInstance && window.gameInstance.frameCount % 60 === 0) {
        //     console.log('🚀 DEBUG Stato nave - isMoving:', this.isMoving, 'enginePlaying:', window.gameInstance.audioManager?.enginePlaying, 'stoppedFrames:', this.stoppedFrames);
        // }
        
        // Aggiorna rotazione per puntare verso il target SOLO durante il combattimento
        if (this.isInCombat && this.selectedTarget && this.selectedTarget.active) {
            // Punta verso il nemico SOLO quando sta attaccando
            const dx = this.selectedTarget.x - this.x;
            const dy = this.selectedTarget.y - this.y;
            this.rotation = Math.atan2(dy, dx);
        } else if (this.isMoving) {
            // Durante il movimento, la nave punta verso la destinazione
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            this.rotation = Math.atan2(dy, dx);
        }
        // Se non sta combattendo e non si sta muovendo, mantiene la sua rotazione attuale
        

        
        if (this.isMoving) {
            // Calcola distanza dal target di movimento
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 5) {
                // Calcola direzione di movimento
                this.direction = Math.atan2(dy, dx);
                
                // Muovi verso il target
                const moveX = Math.cos(this.direction) * this.speed;
                const moveY = Math.sin(this.direction) * this.speed;
                
                this.x += moveX;
                this.y += moveY;
                

            } else {
                // Arrivato al target
                this.isMoving = false;
                // Emetti evento di arrivo
                this.onArrival && this.onArrival();
            }
        }
        
        // La logica di movimento è ora gestita sopra
    }
    
    setTarget(x, y) {
        this.targetX = x;
        this.targetY = y;
        this.isMoving = true;
    }
    
    // Metodo per fermare il movimento quando l'utente smette di cliccare
    stopMovement() {
        this.isMoving = false; // Ferma il movimento
    }
    
    draw(ctx, camera) {
        ctx.save();
        // Applica la camera per centrare la nave sullo schermo
        ctx.translate(this.x - camera.x, this.y - camera.y);
        ctx.rotate(this.rotation);
        
        // Disegna la nave spaziale
        ctx.fillStyle = '#4a90e2';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        
        // Corpo principale (triangolo)
        ctx.beginPath();
        ctx.moveTo(this.size/2, 0);
        ctx.lineTo(-this.size/2, -this.size/3);
        ctx.lineTo(-this.size/2, this.size/3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Motori posteriori
        ctx.fillStyle = '#ff8800';
        ctx.fillRect(-this.size/2 - 5, -this.size/4, 5, this.size/2);
        
        ctx.restore();
        
        // Disegna tutti i proiettili
        this.projectiles.forEach(projectile => {
            projectile.draw(ctx, camera);
        });
    }
    
    // Sistema di combattimento
    selectTarget(target) {
        // Deseleziona il target precedente se esiste
        if (this.selectedTarget && this.selectedTarget.deselect) {
            this.selectedTarget.deselect();
        }
        
        // FORZA deselezione di TUTTI gli enemy (sicurezza extra)
        if (window.gameInstance && window.gameInstance.enemies) {
            window.gameInstance.enemies.forEach(enemy => {
                if (enemy.active && enemy.isSelected && enemy !== target) {
                    enemy.deselect();
                }
            });
        }
        
        // Seleziona il nuovo target
        this.selectedTarget = target;
        if (target.select) {
            target.select();
        }
        
        this.isInCombat = false;
    }
    
    // Deseleziona il target corrente
    clearTarget() {
        if (this.selectedTarget && this.selectedTarget.deselect) {
            this.selectedTarget.deselect();
        }
        this.selectedTarget = null;
        this.isInCombat = false;
        
        // Deattiva tutti i proiettili quando si deseleziona il target
        this.projectiles.forEach(projectile => {
            projectile.deactivate();
        });
    }
    
    startCombat() {
        if (this.selectedTarget && this.selectedTarget.active) {
            this.isInCombat = true;
            this.combatTimer = 0;
        }
    }
    
    toggleCombat() {
        if (this.selectedTarget && this.selectedTarget.active) {
            this.isInCombat = !this.isInCombat;
            if (this.isInCombat) {
                this.combatTimer = 0;
            } else {
                // Se il combattimento si ferma, deattiva tutti i proiettili attivi
                this.projectiles.forEach(projectile => {
                    projectile.deactivate();
                });
            }
            
            // Restituisci informazioni sul cambio di stato
            return {
                started: this.isInCombat,
                enemyType: this.selectedTarget.type
            };
        } else {
            return null;
        }
    }
    
    updateCombat(explosionManager = null) {
        // Controlla se il target è ancora valido
        if (!this.selectedTarget || !this.selectedTarget.active) {
            // Target non valido - termina combattimento e cancella target
            this.isInCombat = false;
            this.selectedTarget = null;
            
            // Pulisci tutti i proiettili e missili quando il target è perso
            this.projectiles.forEach(projectile => projectile.deactivate());
            this.projectiles = [];
            this.missiles.forEach(missile => missile.destroy());
            this.missiles = [];
            
            return null;
        }
        
        // Se non in combattimento, mantieni il target ma controlla comunque le collisioni
        if (!this.isInCombat) {
            // Controlla comunque le collisioni per proiettili già in volo
            return this.checkProjectileCollisions(explosionManager);
        }
        
        // Combattimento automatico con proiettili
        this.fireTimer++;
        if (this.fireTimer >= this.fireRate) {
            this.fireTimer = 0;
            
            // Sparo un proiettile
            this.fireProjectile();
        }
        
        // Combattimento automatico con missili
        this.missileTimer++;
        if (this.missileTimer >= this.missileFireRate) {
            this.missileTimer = 0;
            
            // Sparo un missile
            this.fireMissile();
        }
        
        // Aggiorna tutti i proiettili
        this.updateProjectiles();
        
        // Aggiorna tutti i missili
        this.updateMissiles();
        
        // Controlla collisioni proiettili e missili-nemici e restituisci il risultato
        const result = this.checkProjectileCollisions(explosionManager);

        return result;
    }
    
    // Aggiorna lo sprite animato
    updateSprite() {
        this.sprite.update();
    }
    
    // Aggiorna il sistema di scie
    updateTrail() {
        this.trailSystem.update();
        this.trailSystem.createTrail(this);
    }
    
    // Spara un proiettile verso il target
    fireProjectile() {
        // Controlli di sicurezza extra
        if (!this.selectedTarget || !this.selectedTarget.active || !this.selectedTarget.x || !this.selectedTarget.y) return;
        
        // Calcola la direzione della nave per il lancio
        const shipDirection = Math.atan2(this.targetY - this.y, this.targetX - this.x);
        
        // Offset laterali per i due proiettili - DISTANZA MAGGIORE
        const lateralOffset = 35; // Distanza laterale dal centro della nave (più spettacolare)
        
        // Primo proiettile (sinistra)
        const leftOffsetX = this.x + Math.cos(shipDirection - Math.PI/2) * lateralOffset;
        const leftOffsetY = this.y + Math.sin(shipDirection - Math.PI/2) * lateralOffset;
        
        const projectile1 = new Projectile(
            leftOffsetX, 
            leftOffsetY, 
            this.selectedTarget.x, 
            this.selectedTarget.y,
            this.projectileSpeed,
            this.projectileDamage / 2 // Danno diviso per due proiettili
        );
        
        // Secondo proiettile (destra)
        const rightOffsetX = this.x + Math.cos(shipDirection + Math.PI/2) * lateralOffset;
        const rightOffsetY = this.y + Math.sin(shipDirection + Math.PI/2) * lateralOffset;
        
        const projectile2 = new Projectile(
            rightOffsetX, 
            rightOffsetY, 
            this.selectedTarget.x, 
            this.selectedTarget.y,
            this.projectileSpeed,
            this.projectileDamage / 2 // Danno diviso per due proiettili
        );
        
        this.projectiles.push(projectile1);
        this.projectiles.push(projectile2);
        
        // Riproduci suono laser se l'audio manager è disponibile
        if (window.gameInstance && window.gameInstance.audioManager) {
            window.gameInstance.audioManager.playLaserSound();
        }
    }
    
    // Aggiorna tutti i proiettili
    updateProjectiles() {
        this.projectiles = this.projectiles.filter(projectile => {
            // Aggiorna la direzione del proiettile verso il target in movimento
            if (this.selectedTarget && this.selectedTarget.active) {
                projectile.updateDirection(this.selectedTarget.x, this.selectedTarget.y);
            }
            
            projectile.update();
            return projectile.active;
        });
    }
    
    // Sparo un missile
    fireMissile() {
        // Controlli di sicurezza extra
        if (!this.selectedTarget || !this.selectedTarget.active || !this.selectedTarget.x || !this.selectedTarget.y) return;
        
        // Controlla se abbiamo raggiunto il limite massimo di missili
        if (this.missiles.length >= this.maxMissiles) return;
        
        // Calcola la direzione della nave per il lancio
        const shipDirection = Math.atan2(this.targetY - this.y, this.targetX - this.x);
        
        // Offset di lancio dal centro della nave (più realistico)
        const launchOffset = 25; // Distanza dal centro della nave
        const launchX = this.x + Math.cos(shipDirection) * launchOffset;
        const launchY = this.y + Math.sin(shipDirection) * launchOffset;
        
        // Aggiungi un po' di variazione casuale alla direzione iniziale
        const directionVariation = (Math.random() - 0.5) * 0.3; // ±0.15 radianti
        const initialDirection = shipDirection + directionVariation;
        
        // Velocità iniziale più bassa per un effetto di lancio più realistico
        const initialSpeed = this.missileSpeed * 0.6; // 60% della velocità normale
        
        // Crea un nuovo missile
        const missile = new Missile(
            launchX, 
            launchY, 
            this.selectedTarget.x, 
            this.selectedTarget.y,
            initialSpeed,
            this.missileDamage
        );
        
        // Imposta la direzione iniziale del missile
        missile.vx = Math.cos(initialDirection) * initialSpeed;
        missile.vy = Math.sin(initialDirection) * initialSpeed;
        missile.rotation = initialDirection + Math.PI / 2; // Aggiungi 90 gradi per orientamento corretto
        
        // Imposta lo sprite del missile
        missile.setSprite(this.missileSprite);
        
        this.missiles.push(missile);
        
        // Riproduci suono missile se l'audio manager è disponibile
        if (window.gameInstance && window.gameInstance.audioManager) {
            window.gameInstance.audioManager.playMissileSound();
        }
    }
    
    // Aggiorna tutti i missili - HOMING (sempre a segno)
    updateMissiles() {
        this.missiles = this.missiles.filter(missile => {
            // Passa il target per il tracking homing
            missile.update(this.selectedTarget);
            return missile.active;
        });
    }
    
    // Controlla collisioni proiettili e missili-nemici
    checkProjectileCollisions(explosionManager = null) {
        // Controllo di sicurezza: se non c'è target, non controllare collisioni
        if (!this.selectedTarget || !this.selectedTarget.active) return null;
        
        let combatResult = null;
        
        // Controlla collisioni proiettili
        this.projectiles.forEach(projectile => {
            if (projectile.checkCollision(this.selectedTarget)) {

                // Proiettile colpisce il target
                this.selectedTarget.takeDamage(this.projectileDamage);

                projectile.deactivate();
                
                // Se il target è morto, crea esplosione e termina il combattimento
                if (!this.selectedTarget.active) {
                    // Crea effetto esplosione
                    if (explosionManager) {
                        explosionManager.createExplosion(this.selectedTarget.x, this.selectedTarget.y, 'normal');
                    }
                    
                    // Riproduci suono esplosione
                    if (window.gameInstance && window.gameInstance.audioManager) {
                        window.gameInstance.audioManager.playExplosionSound();
                    }
                    

                    // Salva il tipo dell'enemy PRIMA di cancellarlo
                    const enemyType = this.selectedTarget.type;
                    
                    // Aggiungi esperienza per aver distrutto il nemico
                    const expGained = this.getExpForEnemyType(enemyType);
                    const expResult = this.experience.addExperience(expGained);
                    
                    // Deseleziona il target morto
                    if (this.selectedTarget.deselect) {
                        this.selectedTarget.deselect();
                    }
                    
                    this.isInCombat = false;
                    this.selectedTarget = null;
                    
                    // Salva il risultato per restituirlo alla fine
                    combatResult = {
                        enemyDestroyed: true,
                        enemyType: enemyType,
                        expGained: expGained,
                        levelUp: expResult.levelUp
                    };

                }
            }
        });
        
        // Controlla collisioni missili - SEMPLICE
        for (let i = this.missiles.length - 1; i >= 0; i--) {
            const missile = this.missiles[i];
            if (missile.checkCollision(this.selectedTarget)) {
                // Missile colpisce il target
                this.selectedTarget.takeDamage(this.missileDamage);
                
                // Rimuovi il missile
                this.missiles.splice(i, 1);
                
                // Se il target è morto, crea esplosione e termina il combattimento
                if (!this.selectedTarget.active) {
                    // Crea effetto esplosione
                    if (explosionManager) {
                        explosionManager.createExplosion(this.selectedTarget.x, this.selectedTarget.y, 'normal');
                    }
                    
                    // Riproduci suono esplosione
                    if (window.gameInstance && window.gameInstance.audioManager) {
                        window.gameInstance.audioManager.playExplosionSound();
                    }
                    

                    // Salva il tipo dell'enemy PRIMA di cancellarlo
                    const enemyType = this.selectedTarget.type;
                    
                    // Aggiungi esperienza per aver distrutto il nemico
                    const expGained = this.getExpForEnemyType(enemyType);
                    const expResult = this.experience.addExperience(expGained);
                    
                    // Deseleziona il target morto
                    if (this.selectedTarget.deselect) {
                        this.selectedTarget.deselect();
                    }
                    
                    this.isInCombat = false;
                    this.selectedTarget = null;
                    
                    // Salva il risultato per restituirlo alla fine
                    combatResult = {
                        enemyDestroyed: true,
                        enemyType: enemyType,
                        expGained: expGained,
                        levelUp: expResult.levelUp
                    };

                }
            }
        }
        
        // Restituisci sempre il risultato (null se nessun nemico distrutto)
        return combatResult;
    }
    
    takeDamage(damage) {
        this.hp -= damage;
        if (this.hp <= 0) {
            this.hp = 0;
            // Qui potremmo aggiungere logica di morte
        }
    }
    
    drawTarget(ctx, camera) {
        if (this.isMoving) {
            // Disegna il target di movimento (applica la camera)
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            
            ctx.beginPath();
            ctx.arc(this.targetX - camera.x, this.targetY - camera.y, 10, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.setLineDash([]);
        }
    }
    
    // Disegna barra HP
    drawHealthBar(ctx, camera) {
        const barWidth = 60;
        const barHeight = 8;
        const barX = this.x - camera.x - barWidth/2;
        const barY = this.y - camera.y - this.size/2 - 20;
        
        // Sfondo barra HP
        ctx.fillStyle = '#333333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Barra HP attuale
        const hpPercentage = this.hp / this.maxHP;
        const currentWidth = barWidth * hpPercentage;
        
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(barX, barY, currentWidth, barHeight);
        
        // Bordo barra HP
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, currentWidth, barHeight);
    }
    
    // Disegna target selezionato
    drawSelectedTarget(ctx, camera) {
        if (this.selectedTarget && this.selectedTarget.active) {
            const targetX = this.selectedTarget.x - camera.x;
            const targetY = this.selectedTarget.y - camera.y;
            
            // Cerchio di selezione
            ctx.strokeStyle = this.isInCombat ? '#ff0000' : '#00ff00';
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            
            ctx.beginPath();
            ctx.arc(targetX, targetY, this.selectedTarget.radius + 10, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.setLineDash([]);
            
            // Linea di connessione al target
            const shipX = this.x - camera.x;
            const shipY = this.y - camera.y;
            
            ctx.strokeStyle = this.isInCombat ? '#ff0000' : '#00ff00';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(shipX, shipY);
            ctx.lineTo(targetX, targetY);
            ctx.stroke();
        }
    }
    
    // Calcola l'esperienza guadagnata per tipo di nemico
    getExpForEnemyType(enemyType) {
        switch (enemyType) {
            case 'basic': return 100;    // 100 XP per nemico basic
            case 'fast': return 150;     // 150 XP per nemico fast
            case 'tank': return 300;     // 300 XP per nemico tank
            default: return 100;
        }
    }
    
    // Ottieni crediti per tipo di nemico
    getCreditsForEnemyType(enemyType) {
        switch (enemyType) {
            case 'basic': return 10;
            case 'fast': return 15;
            case 'tank': return 25;
            default: return 10;
        }
    }
    
    // Ottieni uridium per tipo di nemico (valuta premium, quantità ridotta)
    getUridiumForEnemyType(enemyType) {
        switch (enemyType) {
            case 'basic': return 2;
            case 'fast': return 3;
            case 'tank': return 5;
            default: return 2;
        }
    }
    
    // Ottieni onore per tipo di nemico (per il rango)
    getHonorForEnemyType(enemyType) {
        switch (enemyType) {
            case 'basic': return 5;
            case 'fast': return 8;
            case 'tank': return 12;
            default: return 5;
        }
    }
    
    // Aggiungi onore
    addHonor(amount) {
        this.honor += amount;
    }
    
    // Ottieni onore attuale
    getHonor() {
        return this.honor;
    }
    
    // Ottieni valori aggiornati dalle statistiche
    getCurrentDamage() {
        return this.upgradeManager.getValue('damage');
    }
    
    getCurrentFireRate() {
        return this.upgradeManager.getValue('fireRate');
    }
    
    getCurrentHP() {
        return this.upgradeManager.getValue('hp');
    }
    
    getCurrentSpeed() {
        return this.upgradeManager.getValue('speed');
    }
    
    // Aggiorna i valori della nave dalle statistiche
    updateStats() {
        this.projectileDamage = this.getCurrentDamage();
        this.maxHP = this.getCurrentHP();
        this.speed = this.getCurrentSpeed();
        this.hp = Math.min(this.hp, this.maxHP); // Non superare il max HP
    }
}
