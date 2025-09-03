// Modulo Nave Spaziale
import { Projectile } from './Projectile.js';
import { Missile } from './Missile.js';
import { Experience } from './Experience.js';
import { UpgradeManager } from './UpgradeManager.js';
import { ShipSprite } from './ShipSprite.js';
import { MissileSprite } from './MissileSprite.js';
import { TrailSystem } from './TrailSystem.js';
import { RepairEffect } from './RepairEffect.js';
import { ShieldEffect } from './ShieldEffect.js';

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
        
        // Sistema di fluttuazione
        this.floatingOffset = 0;
        this.floatingSpeed = 0.02;
        this.floatingAmplitude = 2; // Ampiezza della fluttuazione in pixel

        
        // Sistema di combattimento con proiettili
        this.maxHP = 50; // Valore base più basso
        this.hp = this.maxHP;
        this.isDead = false; // Traccia se la nave è morta
        
        // Sistema scudo
        this.maxShield = 30; // Valore base
        this.shield = this.maxShield;
        this.shieldRegenRate = 1; // Rigenerazione scudo per secondo
        this.shieldRegenDelay = 3000; // Ritardo prima della rigenerazione (3 secondi)
        this.lastDamageTime = 0;
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
        
        // Sistema selezione armi
        this.selectedLaser = 'x1'; // x1, x2, x3
        this.selectedMissile = 'r1'; // r1, r2, r3
        
        // Configurazioni laser
        this.laserConfigs = {
            x1: { damage: 20, fireRate: 60, speed: 8, color: '#ff0000' },
            x2: { damage: 35, fireRate: 45, speed: 10, color: '#ff6600' },
            x3: { damage: 50, fireRate: 30, speed: 12, color: '#ffaa00' }
        };
        
        // Configurazioni missili
        this.missileConfigs = {
            r1: { damage: 50, fireRate: 180, speed: 4, color: '#00ff00' },
            r2: { damage: 80, fireRate: 150, speed: 5, color: '#00aaff' },
            r3: { damage: 120, fireRate: 120, speed: 6, color: '#ff00ff' }
        };
        
        // Sistema di esperienza e onore
        this.experience = new Experience();
        this.honor = 0;
        
        // Sistema di potenziamenti
        this.upgradeManager = new UpgradeManager();
        
        // Sistema di riparazione automatica
        this.autoRepairDelay = 600; // 10 secondi (600 frame a 60 FPS)
        this.lastCombatTime = 0; // Tempo dell'ultimo combattimento
        this.repairRate = 5; // HP riparati per secondo
        this.shieldRepairRate = 3; // Scudo riparato per secondo
        this.repairEffect = new RepairEffect();
        this.shieldEffect = new ShieldEffect();
        
        // Sistema di sprite animati
        this.sprite = new ShipSprite();
        this.missileSprite = new MissileSprite();
        
        // Sistema di scie
        this.trailSystem = new TrailSystem();
        
        // Inizializza le statistiche basate sui potenziamenti
        this.updateStats();
        
        // Applica le configurazioni delle armi selezionate
        this.applyWeaponConfigs();
        
        // Carica lo sprite del missile
        this.missileSprite.load();
        
        // Carica l'effetto di riparazione
        this.repairEffect.load();
        
        // Carica l'effetto di riparazione scudo
        this.shieldEffect.load();
    }
    
    update() {
        // Se la nave è morta, non aggiornare nulla
        if (this.isDead) {
            return;
        }
        
        // Aggiorna la fluttuazione della nave
        this.floatingOffset += this.floatingSpeed;
        const floatingY = Math.sin(this.floatingOffset) * this.floatingAmplitude;
        
        // Rigenerazione scudo
        this.updateShield();
        
        // Sistema di riparazione automatica
        this.updateAutoRepair();
        
        // Aggiorna effetto riparazione
        if (this.isRepairing) {
            this.repairEffect.update();
        } else {
            this.repairEffect.reset();
        }
        
        // Aggiorna effetto riparazione scudo
        if (this.isShieldRepairing) {
            this.shieldEffect.update();
        } else {
            this.shieldEffect.reset();
        }
        
        // Controlla il suono del motore
        if (window.gameInstance && window.gameInstance.audioManager) {
            if (this.isMoving && !window.gameInstance.audioManager.enginePlaying) {
                // Nave in movimento ma motore spento - accendi
                window.gameInstance.audioManager.startEngineSound();
            } else if (!this.isMoving && window.gameInstance.audioManager.enginePlaying) {
                // Nave ferma ma motore acceso - spegni
                window.gameInstance.audioManager.stopEngineSound();
            }
        }
        
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
        const floatingY = Math.sin(this.floatingOffset) * this.floatingAmplitude;
        ctx.translate(this.x - camera.x, this.y - camera.y + floatingY);
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
        
        // Disegna effetto riparazione se attivo
        if (this.isRepairing) {
            const screenPos = camera.worldToScreen(this.x, this.y);

            this.repairEffect.draw(ctx, screenPos.x, screenPos.y, 0.3);
        }
        
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
                this.lastCombatTime = Date.now(); // Aggiorna il tempo dell'ultimo combattimento
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
            
            // Interrompi il mining se attivo (sei in combattimento)
            if (window.gameInstance && window.gameInstance.interactiveAsteroids) {
                for (let asteroid of window.gameInstance.interactiveAsteroids) {
                    if (asteroid.miningActive) {
                        asteroid.interruptMining('attacco');
                    }
                }
            }
            
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
                
                // Aggiorna il tempo dell'ultimo combattimento (stiamo infliggendo danno)
                this.lastCombatTime = Date.now();
                
                // Processa il danno per il Leech
                if (window.gameInstance && window.gameInstance.leech) {
                    window.gameInstance.leech.processDamageDealt(this.projectileDamage, this, this.selectedTarget.x, this.selectedTarget.y);
                }

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
                
                // Aggiorna il tempo dell'ultimo combattimento (stiamo infliggendo danno)
                this.lastCombatTime = Date.now();
                
                // Processa il danno per il Leech
                if (window.gameInstance && window.gameInstance.leech) {
                    window.gameInstance.leech.processDamageDealt(this.missileDamage, this, this.selectedTarget.x, this.selectedTarget.y);
                }
                
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
    
    // Disegna barre HP e Scudo minimali
    drawHealthBar(ctx, camera) {
        const barX = this.x - camera.x - 40;
        const barY = this.y - camera.y - this.size/2 - 40;
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
            case 'barracuda': return 100;    // 100 XP per nemico Barracuda
            default: return 100;
        }
    }
    
    // Ottieni crediti per tipo di nemico
    getCreditsForEnemyType(enemyType) {
        switch (enemyType) {
            case 'barracuda': return 10;
            default: return 10;
        }
    }
    
    // Ottieni uridium per tipo di nemico (valuta premium, quantità ridotta)
    getUridiumForEnemyType(enemyType) {
        switch (enemyType) {
            case 'barracuda': return 2;
            default: return 2;
        }
    }
    
    // Ottieni onore per tipo di nemico (per il rango)
    getHonorForEnemyType(enemyType) {
        switch (enemyType) {
            case 'barracuda': return 5;
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
        this.maxShield = this.getCurrentShield();
        this.shield = Math.min(this.shield, this.maxShield); // Non superare il max scudo
    }
    
    // Aggiorna la rigenerazione dello scudo
    updateShield() {
        const currentTime = Date.now();
        const timeSinceCombat = currentTime - this.lastCombatTime;
        
        // Se sono passati 10 secondi dall'ultimo combattimento e lo scudo non è al massimo
        if (timeSinceCombat >= this.autoRepairDelay * 16.67 && this.shield < this.maxShield) {
            this.shield += this.shieldRegenRate / 60; // 60 FPS
            this.shield = Math.min(this.shield, this.maxShield);
        }
    }
    
    // Applica danno (prima allo scudo, poi agli HP)
    takeDamage(damage) {
        this.lastDamageTime = Date.now();
        this.lastCombatTime = Date.now(); // Traccia il tempo dell'ultimo combattimento
        
        // Interrompi il mining se attivo
        if (window.gameInstance && window.gameInstance.interactiveAsteroids) {
            for (let asteroid of window.gameInstance.interactiveAsteroids) {
                if (asteroid.miningActive) {
                    asteroid.interruptMining('danno');
                }
            }
        }
        
        if (this.shield > 0) {
            // Danno allo scudo
            const shieldDamage = Math.min(damage, this.shield);
            this.shield -= shieldDamage;
            damage -= shieldDamage;
        }
        
        if (damage > 0) {
            // Danno rimanente agli HP
            this.hp -= damage;
            this.hp = Math.max(0, this.hp);
            
            // Controlla se il player è morto
            if (this.hp <= 0) {
                this.handlePlayerDeath();
            }
        }
    }
    
    // Gestisce la morte del player
    handlePlayerDeath() {
        // Imposta la nave come morta
        this.isDead = true;
        
        // Crea animazione esplosione
        if (window.gameInstance && window.gameInstance.explosionManager) {
            window.gameInstance.explosionManager.createExplosion(this.x, this.y, 'player');
        }
        
        // Riproduci suono di esplosione quando la nave esplode
        if (window.gameInstance && window.gameInstance.audioManager) {
            window.gameInstance.audioManager.playExplosionSound();
        }
        

        
        // Trova la stazione spaziale più vicina
        const nearestStation = this.findNearestSpaceStation();
        
        // Mostra popup di morte invece di respawn automatico
        if (window.gameInstance && window.gameInstance.deathPopup) {
            window.gameInstance.deathPopup.show(this.x, this.y, nearestStation);
        }
        
        // Notifica la morte
        if (window.gameInstance && window.gameInstance.notifications) {
            window.gameInstance.notifications.add('💀 Sei morto! Clicca RESPAWN per continuare', 'death');
        }
    }
    
    // Trova la stazione spaziale più vicina
    findNearestSpaceStation() {
        if (!window.gameInstance || !window.gameInstance.spaceStation) {
            return null;
        }
        
        // Nel gioco c'è solo una stazione spaziale, quindi la restituiamo direttamente
        return window.gameInstance.spaceStation;
    }
    

    
    // Ottieni valore attuale dello scudo
    getCurrentShield() {
        return this.upgradeManager.getValue('shield');
    }
    
    // Sistema di riparazione automatica
    updateAutoRepair() {
        const currentTime = Date.now();
        const timeSinceCombat = currentTime - this.lastCombatTime;
        
        // Se sono passati 10 secondi dall'ultimo combattimento
        if (timeSinceCombat >= this.autoRepairDelay * 16.67) { // 600 frame * 16.67ms = 10 secondi
            // Ripara HP se necessario
            if (this.hp < this.maxHP) {
                this.isRepairing = true;
                const repairAmount = this.repairRate / 60; // Per frame
                this.hp = Math.min(this.maxHP, this.hp + repairAmount);
            } else {
                this.isRepairing = false;
            }
            
            // Ripara scudo se necessario
            if (this.shield < this.maxShield) {
                this.isShieldRepairing = true;
                const repairAmount = this.shieldRepairRate / 60; // Per frame
                this.shield = Math.min(this.maxShield, this.shield + repairAmount);
            } else {
                this.isShieldRepairing = false;
            }
        } else {
            // Se siamo ancora in combattimento, ferma la riparazione
            this.isRepairing = false;
            this.isShieldRepairing = false;
        }
    }
    
    // Sistema di selezione armi
    selectLaser(laserType) {
        if (this.laserConfigs[laserType]) {
            this.selectedLaser = laserType;
            this.applyWeaponConfigs();
            return true;
        }
        return false;
    }
    
    selectMissile(missileType) {
        if (this.missileConfigs[missileType]) {
            this.selectedMissile = missileType;
            this.applyWeaponConfigs();
            return true;
        }
        return false;
    }
    
    applyWeaponConfigs() {
        // Applica configurazione laser selezionata
        const laserConfig = this.laserConfigs[this.selectedLaser];
        if (laserConfig) {
            this.projectileDamage = laserConfig.damage;
            this.fireRate = laserConfig.fireRate;
            this.projectileSpeed = laserConfig.speed;
        }
        
        // Applica configurazione missile selezionata
        const missileConfig = this.missileConfigs[this.selectedMissile];
        if (missileConfig) {
            this.missileDamage = missileConfig.damage;
            this.missileFireRate = missileConfig.fireRate;
            this.missileSpeed = missileConfig.speed;
        }
    }
    
    getSelectedLaserInfo() {
        return this.laserConfigs[this.selectedLaser];
    }
    
    getSelectedMissileInfo() {
        return this.missileConfigs[this.selectedMissile];
    }
}
