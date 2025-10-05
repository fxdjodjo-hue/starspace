// Modulo Nave Spaziale
import { Projectile } from './Projectile.js';
import { Missile } from './Missile.js';
// import { Experience } from './Experience.js'; // Integrato nella Nave
import { RewardManager } from '../systems/RewardManager.js';
import { ShipSprite } from './ShipSprite.js';
import { MissileSprite } from './MissileSprite.js';
import { TrailSystem } from '../systems/TrailSystem.js';
import { RepairEffect } from '../systems/RepairEffect.js';
import { ShieldEffect } from '../systems/ShieldEffect.js';
import { MISSILE_CONFIG } from '../utils/Constants.js';
import { ThemeConfig, ThemeUtils } from '../config/ThemeConfig.js';

export class Ship {
    constructor(x, y, size = 40, game = null) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.game = game;
        this.speed = 2; // Valore base più basso
        this.targetX = x;
        this.targetY = y;
        this.isMoving = false;
        this.direction = 0; // Angolo in radianti
        this.rotation = 0;  // Rotazione visiva
        
        // Tracking per quest
        this.streunerKilled = 0;
        this.bonusBoxesCollected = 0;
        this.playerName = 'TestPlayer'; // Nome del giocatore
        
        // Sistema clan
        this.clan = {
            id: null,
            name: '',
            tag: '',
            role: 'none', // 'none', 'member', 'officer', 'leader'
            joinedAt: null,
            isInClan: false
        };
        
        // Metodo per aggiornare il nome del giocatore
        this.setPlayerName = (newName) => {
            if (newName && newName.trim().length > 0) {
                this.playerName = newName.trim();
                return true;
            }
            return false;
        };
        
        // Sistema di fluttuazione
        this.floatingOffset = 0;
        this.floatingSpeed = 0.02;
        this.floatingAmplitude = 2; // Ampiezza della fluttuazione in pixel
        
        // Sistema debug
        this.debugMode = false;

        
        // Sistema di combattimento con proiettili
        this.maxHP = 1000; // HP base della nave
        this.hp = this.maxHP;
        this.isDead = false; // Traccia se la nave è morta
        this.active = true; // Per compatibilità con AI system
        this.attackRange = 400; // Range di attacco in pixel
        this.showAttackRange = false; // Toggle per mostrare/nascondere il range (disattivato di default)
        
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
        this.missileFireRate = MISSILE_CONFIG.FIRE_RATE; // Missili ogni 180 frame (3 secondi)
        this.missileTimer = 0;
        this.missileDamage = MISSILE_CONFIG.DAMAGE;
        this.missileSpeed = MISSILE_CONFIG.SPEED; // Velocità ottimizzata
        this.maxMissiles = MISSILE_CONFIG.MAX_COUNT; // Massimo 3 missili contemporaneamente
        
        // Sistema selezione armi
        this.selectedLaser = 'x1'; // x1, x2, x3, sab
        this.selectedMissile = 'r1'; // r1, r2, r3
        
        // Sistema laser equipaggiati
        this.equippedLasers = {
            lf1: 0, // Numero di laser LF1 equipaggiati
            lf2: 0, // Numero di laser LF2 equipaggiati
            lf3: 0, // Numero di laser LF3 equipaggiati
            lf4: 0  // Numero di laser LF4 equipaggiati
        };

        // Danno base per laser
        this.laserDamage = {
            lf1: 100,
            lf2: 200,
            lf3: 300,
            lf4: 400
        };
        
        // Sistema munizioni
        this.ammunition = {
            laser: {
                x1: 1000, // Munizioni laser X1
                x2: 500,  // Munizioni laser X2
                x3: 200,  // Munizioni laser X3
                sab: 100  // Shield Absorber - assorbe scudo invece di fare danno
            },
            missile: {
                r1: 50,   // Missili R1
                r2: 25,   // Missili R2
                r3: 10    // Missili R3
            }
        };
        
        // Limiti massimi munizioni - RIMOSSI per permettere acquisti illimitati
        this.maxAmmunition = {
            laser: {
                x1: Infinity, // Illimitato
                x2: Infinity, // Illimitato
                x3: Infinity  // Illimitato
            },
            missile: {
                r1: Infinity, // Illimitato
                r2: Infinity, // Illimitato
                r3: Infinity  // Illimitato
            }
        };
        
        // Configurazione base laser
        this.laserConfig = {
            fireRate: 60,   // Fire rate fisso per tutti i laser (1 colpo al secondo)
            speed: 16,     // Velocità proiettile aumentata per animazione più veloce
            color: '#ff0000'
        };
        
        // Configurazioni missili
        this.missileConfigs = {
            r1: { damage: 50, fireRate: 180, speed: 4, color: '#00ff00' },
            r2: { damage: 80, fireRate: 150, speed: 5, color: '#00aaff' },
            r3: { damage: 120, fireRate: 120, speed: 6, color: '#ff00ff' }
        };
        
        // Sistema risorse unificato (Single Source of Truth)
        this.resources = {
            credits: 100000, // Crediti di test per acquisti
            uridium: 5000,   // Uridium di test
            honor: 0,
            experience: 0,
            starEnergy: 100  // Energia iniziale
        };
        
        // Configurazione StarEnergy
        this.starEnergyConfig = {
            max: 1000  // Massima energia accumulabile
        };
        
        // Sistema di livelli integrato
        this.currentLevel = 1;
        this.levelRequirements = {
            1: 0, 2: 10000, 3: 20000, 4: 40000, 5: 80000,
            6: 160000, 7: 320000, 8: 640000, 9: 1280000, 10: 2560000,
            11: 5120000, 12: 10240000, 13: 20480000, 14: 40960000, 15: 81920000,
            16: 163840000, 17: 327680000, 18: 655360000, 19: 1310720000, 20: 2621440000,
            21: 5242880000, 22: 10485760000, 23: 20971520000, 24: 41943040000, 25: 83886080000,
            26: 167772160000, 27: 335544320000, 28: 671088640000, 29: 1342177280000, 30: 2684354560000,
            31: 5368709120000, 32: 10737418240000, 33: 21474836480000, 34: 42949672960000, 35: 85899345920000,
            36: 171798691840000, 37: 343597383680000, 38: 687194767360000, 39: 1374389534720000, 40: 2748779069440000,
            41: 5497558138880000, 42: 10995116277760000, 43: 21990232555520000, 44: 43980465111040000, 45: 87960930222080000,
            46: 175921860444160000, 47: 351843720888320000, 48: 703687441776640000, 49: 1407374883553280000, 50: 2814749767106560000
        };
        
        // Compatibilità con sistema esistente
        this.experience = {
            currentExp: 0,
            getLevelInfo: () => this.getLevelInfo(),
            addExperience: (amount) => this.addExperience(amount),
            getCurrentExperience: () => this.resources.experience
        };
        
        // Compatibilità con codice esistente
        this.honor = 0;
        this.credits = 100000; // Crediti di test per acquisti
        this.uridium = 5000;   // Uridium di test
        
        // Sistema di potenziamenti
        // Sistema reward centralizzato
        this.rewardManager = new RewardManager();
        
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
    
    // Inizializza il RewardManager con le dipendenze
    initRewardManager(notifications) {
        this.rewardManager.init(notifications, this.experience, this.upgradeManager);
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
        // Disegna il range di attacco se attivo
        if (this.showAttackRange) {
            ctx.save();
            ctx.strokeStyle = this.isInCombat ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 255, 0, 0.2)';
            ctx.fillStyle = this.isInCombat ? 'rgba(255, 0, 0, 0.05)' : 'rgba(0, 255, 0, 0.05)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x - camera.x, this.y - camera.y, this.attackRange, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Debug info
            console.log('Drawing attack range:', {
                x: this.x - camera.x,
                y: this.y - camera.y,
                range: this.attackRange,
                isInCombat: this.isInCombat
            });
            ctx.restore();
        }

        // Disegna lo sprite della nave con effetto fluttuante
        const floatingY = Math.sin(this.floatingOffset) * this.floatingAmplitude;
        this.sprite.draw(ctx, this.x - camera.x, this.y - camera.y, this.rotation, this.size, floatingY);
        
        // Disegna effetto riparazione se attivo
        if (this.isRepairing) {
            const screenPos = camera.worldToScreen(this.x, this.y);

            this.repairEffect.draw(ctx, screenPos.x, screenPos.y, 0.3);
        }
        
        // Disegna tutti i proiettili
        this.projectiles.forEach(projectile => {
            projectile.draw(ctx, camera);
        });
        
        // Disegna debug info se abilitato
        if (this.debugMode) {
            this.drawDebugInfo(ctx, camera);
        }
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
        
        // Deattiva tutti i proiettili e missili quando si deseleziona il target
        this.projectiles.forEach(projectile => {
            projectile.deactivate();
        });
        this.missiles.forEach(missile => {
            missile.destroy();
        });
    }
    
    startCombat() {
        if (this.selectedTarget && this.selectedTarget.active) {
            // Controlla se ha laser equipaggiati prima di iniziare il combattimento
            const totalLasers = this.getTotalEquippedLasers();
            if (totalLasers === 0) {
                // Notifica il player che non può combattere senza laser
                if (this.game && this.game.notifications) {
                    this.game.notifications.add("❌ Impossibile combattere: nessun laser equipaggiato!", 600, "warning");
                }
                return false;
            }
            
            this.isInCombat = true;
            this.combatTimer = 0;
            return true;
        }
        return false;
    }
    
    toggleCombat() {
        if (this.selectedTarget && this.selectedTarget.active) {
            // Se sta cercando di attivare il combattimento
            if (!this.isInCombat) {
                // Controlla se ha laser equipaggiati
                const totalLasers = this.getTotalEquippedLasers();
                if (totalLasers === 0) {
                    // Notifica il player che non può combattere senza laser
                    if (this.game && this.game.notifications) {
                        this.game.notifications.add("❌ Impossibile combattere: nessun laser equipaggiato!", 600, "warning");
                    }
                    return null;
                }
            }
            
            this.isInCombat = !this.isInCombat;
            if (this.isInCombat) {
                this.combatTimer = 0;
                this.lastCombatTime = Date.now(); // Aggiorna il tempo dell'ultimo combattimento
            } else {
                // Se il combattimento si ferma, deattiva tutti i proiettili e missili attivi
                this.projectiles.forEach(projectile => {
                    projectile.deactivate();
                });
                this.missiles.forEach(missile => {
                    missile.destroy();
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
        
        // Controlla se il target è nel range di attacco
        const dx = this.selectedTarget.x - this.x;
        const dy = this.selectedTarget.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > this.attackRange) return;
        
        // Determina se stiamo usando munizioni SAB
        const isSAB = this.selectedLaser === 'sab';
        console.log('🎯 Tipo laser selezionato:', 
            JSON.stringify({
                selectedLaser: this.selectedLaser,
                isSAB: isSAB
            }, null, 2)
        );
        
        // Controlla se ha laser equipaggiati
        const totalLasers = this.getTotalEquippedLasers();
        console.log('🔍 Controllo laser:', { 
            totalLasers, 
            equippedLasers: this.equippedLasers,
            selectedLaser: this.selectedLaser,
            ammunition: this.ammunition,
            projectileDamage: this.projectileDamage
        });
        
        if (totalLasers === 0) {
            console.log('❌ Nessun laser equipaggiato!');
            // Notifica il player che non ha laser equipaggiati
            if (!this.game) {
                console.log('❌ this.game non inizializzato!');
            } else if (!this.game.notifications) {
                console.log('❌ this.game.notifications non inizializzato!');
            } else {
                this.game.notifications.add("❌ Nessun laser equipaggiato!", 600, "warning");
            }
            return;
        }
        
        // Controlla se ha munizioni per il laser selezionato
        if (!this.hasAmmunition('laser', this.selectedLaser)) {
            // Notifica il player che non ha munizioni
            if (this.game && this.game.notifications) {
                this.game.notifications.add(`❌ Munizioni ${this.selectedLaser.toUpperCase()} esaurite!`, "warning");
            }
            return;
        }
        
        // Calcola la direzione della nave per il lancio
        const shipDirection = Math.atan2(this.targetY - this.y, this.targetX - this.x);
        
        // Offset laterali per i due proiettili
        const lateralOffset = 35; // Distanza laterale dal centro della nave
        
        // Crea un proiettile visivo a sinistra (danno 0)
        const leftOffsetX = this.x + Math.cos(shipDirection - Math.PI/2) * lateralOffset;
        const leftOffsetY = this.y + Math.sin(shipDirection - Math.PI/2) * lateralOffset;
        
        const projectile1 = new Projectile(
            leftOffsetX, 
            leftOffsetY, 
            this.selectedTarget.x, 
            this.selectedTarget.y,
            this.projectileSpeed,
            0, // Nessun danno (solo visivo)
            isSAB,
            this.selectedLaser
        );
        
        // Crea un proiettile visivo a destra (danno 0)
        const rightOffsetX = this.x + Math.cos(shipDirection + Math.PI/2) * lateralOffset;
        const rightOffsetY = this.y + Math.sin(shipDirection + Math.PI/2) * lateralOffset;
        
        const projectile2 = new Projectile(
            rightOffsetX, 
            rightOffsetY, 
            this.selectedTarget.x, 
            this.selectedTarget.y,
            this.projectileSpeed,
            0, // Nessun danno (solo visivo)
            isSAB,
            this.selectedLaser
        );
        
        // Crea un proiettile invisibile al centro con il danno totale
        const centerProjectile = new Projectile(
            this.x,
            this.y,
            this.selectedTarget.x,
            this.selectedTarget.y,
            this.projectileSpeed,
            isSAB ? 0 : this.projectileDamage, // Danno totale
            isSAB,
            this.selectedLaser
        );
        centerProjectile.isInvisible = true; // Flag per non renderizzare il proiettile
        
        this.projectiles.push(projectile1);
        this.projectiles.push(projectile2);
        this.projectiles.push(centerProjectile);
        
        // Consuma munizioni per il laser selezionato
        this.consumeAmmunition('laser', this.selectedLaser, 2); // 2 munizioni per i due proiettili
        
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
        
        // Controlla se il target è nel range di attacco
        const dx = this.selectedTarget.x - this.x;
        const dy = this.selectedTarget.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > this.attackRange) return;
        
        // Controlla se ha munizioni per il missile selezionato
        if (!this.hasAmmunition('missile', this.selectedMissile)) {
            return; // Non può sparare senza munizioni
        }
        
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
        
        // Consuma munizioni per il missile selezionato
        this.consumeAmmunition('missile', this.selectedMissile, 1);
        
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
        let totalDamageThisFrame = 0;
        let hitProjectiles = [];
        let sabProjectiles = [];

        // Prima raccogliamo tutti i proiettili che colpiscono
        this.projectiles.forEach(projectile => {
            if (projectile.checkCollision(this.selectedTarget)) {
                if (projectile.isSAB) {
                    sabProjectiles.push(projectile);
                } else {
                    totalDamageThisFrame += projectile.damage;
                    hitProjectiles.push(projectile);
                }
            }
        });

        // Gestisci prima i proiettili SAB
        sabProjectiles.forEach(projectile => {
            this.selectedTarget.takeDamage(0, projectile);
        });

        // Se abbiamo colpito con proiettili normali
        if (totalDamageThisFrame > 0) {
            console.log('🎯 Applicazione Danno Totale:', {
                dannoTotale: totalDamageThisFrame,
                proiettiliColpiti: hitProjectiles.length,
                targetHP: this.selectedTarget.hp
            });
            
            // Mostra il numero di danno totale una sola volta
            if (window.gameInstance && window.gameInstance.damageNumbers) {
                window.gameInstance.damageNumbers.addNumber(
                    this.selectedTarget,
                    totalDamageThisFrame, 
                    'outgoing'
                );
            }
            
            // Applica il danno una volta sola
            this.selectedTarget.takeDamage(totalDamageThisFrame);
            
            // Aggiorna il tempo dell'ultimo combattimento
            this.lastCombatTime = Date.now();
            
            // Processa il danno per il Leech
            if (window.gameInstance && window.gameInstance.leech) {
                window.gameInstance.leech.processDamageDealt(totalDamageThisFrame, this, this.selectedTarget.x, this.selectedTarget.y);
            }

            // Disattiva tutti i proiettili che hanno colpito
            hitProjectiles.forEach(projectile => projectile.deactivate());
                
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
                const enemyConfig = this.selectedTarget.config;
                console.log(`🔍 Enemy distrutto - Tipo: ${enemyType}, Config:`, enemyConfig);
                
                // I reward verranno processati in game.js per controllare l'ordine delle notifiche
                
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
                    enemyName: enemyConfig ? enemyConfig.name : enemyType, // Nome specifico del nemico
                    enemyConfig: enemyConfig // Passa la configurazione per i reward
                };
            }
        }
        
        // Controlla collisioni missili - SEMPLICE
        for (let i = this.missiles.length - 1; i >= 0; i--) {
            const missile = this.missiles[i];
            if (missile.checkCollision(this.selectedTarget)) {
                // Missile colpisce il target
                this.selectedTarget.takeDamage(this.missileDamage, null);
                
                // Mostra il numero di danno per il missile
                if (window.gameInstance && window.gameInstance.damageNumbers) {
                    window.gameInstance.damageNumbers.addNumber(
                        this.selectedTarget,
                        this.missileDamage, 
                        'outgoing'
                    );
                }
                
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
                    const enemyConfig = this.selectedTarget.config;
                    console.log(`🔍 Enemy distrutto - Tipo: ${enemyType}, Config:`, enemyConfig);
                    
                    // I reward verranno processati in game.js per controllare l'ordine delle notifiche
                    
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
                        enemyName: enemyConfig ? enemyConfig.name : enemyType, // Nome specifico del nemico
                        enemyConfig: enemyConfig // Passa la configurazione per i reward
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
    
    // Disegna barre HP e Scudo con tema unificato
    drawHealthBar(ctx, camera) {
        const barX = this.x - camera.x - 40;
        const barY = this.y - camera.y - this.size/2 - 40;
        const barWidth = 80;
        const barHeight = 8;
        const barSpacing = 2;
        
        // Usa il tema importato
        
        // SCUDO - Barra superiore moderna
        const shieldPercentage = this.shield / this.maxShield;
        ThemeUtils.drawProgressBar(ctx, barX, barY, barWidth, barHeight, shieldPercentage, {
            variant: 'info',
            showText: false
        });
        
        // Testo scudo con effetto glow
        ThemeUtils.drawText(ctx, `${Math.floor(this.shield)}/${this.maxShield}`, barX + barWidth/2, barY + barHeight/2, {
            color: ThemeConfig.colors.text.accent,
            size: ThemeConfig.typography.sizes.xs,
            weight: ThemeConfig.typography.weights.bold,
            align: 'center',
            baseline: 'middle',
            glow: true
        });
        
        // HP - Barra inferiore moderna
        const hpBarY = barY + barHeight + barSpacing;
        const hpPercentage = this.hp / this.maxHP;
        const hpVariant = hpPercentage > 0.6 ? 'success' : hpPercentage > 0.3 ? 'warning' : 'danger';
        
        ThemeUtils.drawProgressBar(ctx, barX, hpBarY, barWidth, barHeight, hpPercentage, {
            variant: hpVariant,
            showText: false
        });
        
        // Testo HP con effetto glow
        ThemeUtils.drawText(ctx, `${Math.floor(this.hp)}/${this.maxHP}`, barX + barWidth/2, hpBarY + barHeight/2, {
            color: hpVariant === 'success' ? ThemeConfig.colors.text.success : 
                   hpVariant === 'warning' ? ThemeConfig.colors.text.warning : 
                   ThemeConfig.colors.text.danger,
            size: ThemeConfig.typography.sizes.xs,
            weight: ThemeConfig.typography.weights.bold,
            align: 'center',
            baseline: 'middle',
            glow: true
        });
    }
    
    // Disegna debug info a schermo
    drawDebugInfo(ctx, camera) {
        const debugX = 20;
        const debugY = 100; // Spostato più in basso
        const lineHeight = 20;
        const fontSize = 14;
        
        // Sfondo semi-trasparente per il debug
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(debugX - 10, debugY - 10, 300, 200);
        
        // Bordo del debug
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(debugX - 10, debugY - 10, 300, 200);
        
        // Testo debug
        ctx.fillStyle = '#00ff00';
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'left';
        
        let y = debugY;
        
        // Titolo
        ctx.fillText('🚀 SHIP DEBUG', debugX, y);
        y += lineHeight;
        
        // HP e Scudo
        ctx.fillText(`HP: ${Math.floor(this.hp)}/${this.maxHP}`, debugX, y);
        y += lineHeight;
        ctx.fillText(`Shield: ${Math.floor(this.shield)}/${this.maxShield}`, debugX, y);
        y += lineHeight;
        
        // Velocità
        ctx.fillText(`Speed: ${this.speed.toFixed(1)}`, debugX, y);
        y += lineHeight;
        
        // Danno totale laser
        const totalDamage = this.getTotalLaserDamage();
        ctx.fillText(`Damage: ${totalDamage}`, debugX, y);
        y += lineHeight;
        
        // Laser equipaggiati
        ctx.fillText('Lasers:', debugX, y);
        y += lineHeight;
        Object.entries(this.equippedLasers).forEach(([type, count]) => {
            if (count > 0) {
                ctx.fillText(`  ${type}: ${count}`, debugX + 10, y);
                y += lineHeight;
            }
        });
        
        // Danno per laser
        y += 5;
        ctx.fillText('Laser Damage:', debugX, y);
        y += lineHeight;
        Object.entries(this.laserDamage).forEach(([type, damage]) => {
            const count = this.equippedLasers[type] || 0;
            if (count > 0) {
                ctx.fillText(`  ${type}: ${damage} x${count} = ${damage * count}`, debugX + 10, y);
                y += lineHeight;
            }
        });
        
        // Moltiplicatore munizioni
        const multiplier = this.selectedLaser === 'sab' ? 0 : parseInt(this.selectedLaser.slice(1)) || 1;
        ctx.fillText(`Multiplier: ${this.selectedLaser} (x${multiplier})`, debugX, y);
        y += lineHeight;
        
        // Danno finale
        const finalDamage = totalDamage * multiplier;
        ctx.fillStyle = '#ffff00';
        ctx.fillText(`FINAL DAMAGE: ${finalDamage}`, debugX, y);
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
        }
    }
    
    // Processa reward per nemico distrutto usando RewardManager
    processEnemyKill(enemyType, enemyConfig = null) {
        // Calcola i reward (RewardManager è solo un calcolatore)
        const results = this.rewardManager.processEnemyKill(enemyType, enemyConfig);
        
        // Tracking per quest - controlla il tipo e la configurazione per identificare Streuner
        const isStreuner = enemyType === 'npc_x1' || 
                          enemyType === 'npc_x2' || 
                          enemyType === 'streuner' ||
                          (enemyConfig && enemyConfig.name && enemyConfig.name.toLowerCase().includes('streuner'));
        
        if (isStreuner) {
            this.streunerKilled++;
        }
        
        // Applica i reward alla nave usando il sistema unificato
        if (results.credits) {
            this.addResource('credits', results.credits);
        }
        if (results.uridium) {
            this.addResource('uridium', results.uridium);
        }
        if (results.honor) {
            this.addResource('honor', results.honor);
        }
        if (results.experience) {
            this.addResource('experience', results.experience);
        }
        
        return results;
    }
    
    // Metodi di compatibilità per il sistema esistente
    getExpForEnemyType(enemyType) {
        const rewards = this.rewardManager.calculateEnemyRewards(enemyType, this.getEnemyConfig(enemyType));
        return rewards.experience;
    }
    
    getCreditsForEnemyType(enemyType) {
        const rewards = this.rewardManager.calculateEnemyRewards(enemyType, this.getEnemyConfig(enemyType));
        return rewards.credits;
    }
    
    getUridiumForEnemyType(enemyType) {
        const rewards = this.rewardManager.calculateEnemyRewards(enemyType, this.getEnemyConfig(enemyType));
        return rewards.uridium;
    }
    
    getHonorForEnemyType(enemyType) {
        const rewards = this.rewardManager.calculateEnemyRewards(enemyType, this.getEnemyConfig(enemyType));
        return rewards.honor;
    }
    
    // Ottiene configurazione nemico se disponibile
    getEnemyConfig(enemyType) {
        if (this.game && this.game.enemies) {
            const enemy = this.game.enemies.find(e => e.type === enemyType);
            if (enemy && enemy.config) {
                return enemy.config;
            }
        }
        return null;
    }
    
    // Aggiungi onore (compatibilità)
    addHonor(amount) {
        this.addResource('honor', amount);
    }
    
    // Ottieni onore attuale (compatibilità)
    getHonor() {
        return this.getResource('honor');
    }
    
    // Metodi unificati per le risorse (Single Source of Truth)
    addResource(type, amount) {
        if (this.resources.hasOwnProperty(type)) {
            this.resources[type] += amount;
            
            // Sincronizza con le proprietà di compatibilità
            if (type === 'credits') this.credits = this.resources.credits;
            if (type === 'uridium') this.uridium = this.resources.uridium;
            if (type === 'honor') this.honor = this.resources.honor;
            if (type === 'experience') {
                this.experience.currentExp = this.resources.experience;
                this.checkLevelUp();
            }
            
            // Evento per future sincronizzazioni online
            this.onResourceChanged?.(type, this.resources[type]);
        }
    }
    
    getResource(type) {
        return this.resources[type] || 0;
    }
    
    // Metodi per gestire le munizioni
    getAmmunition(type, weapon) {
        return this.ammunition[type][weapon] || 0;
    }
    
    addAmmunition(type, weapon, amount) {
        const current = this.ammunition[type][weapon] || 0;
        const max = this.maxAmmunition[type][weapon] || Infinity;
        // Con Infinity, Math.min restituisce sempre current + amount
        this.ammunition[type][weapon] = Math.min(current + amount, max);
    }
    
    consumeAmmunition(type, weapon, amount = 1) {
        if (this.ammunition[type][weapon] >= amount) {
            this.ammunition[type][weapon] -= amount;
            return true;
        }
        return false;
    }
    
    hasAmmunition(type, weapon) {
        return this.ammunition[type][weapon] > 0;
    }
    
    // Metodi per gestire i cannoni equipaggiati
    equipLaser(laserType, amount = 1) {
        if (this.equippedLasers.hasOwnProperty(laserType)) {
            this.equippedLasers[laserType] += amount;
            this.applyWeaponConfigs(); // Aggiorna il danno quando equipaggi un laser
            return true;
        }
        return false;
    }
    
    // Equipaggia cannone (compatibilità con negozio)
    equipCannon(cannonType, amount = 1) {
        // Per ora i cannoni sono gestiti come laser
        return this.equipLaser(cannonType, amount);
    }

    unequipLaser(laserType, amount = 1) {
        if (this.equippedLasers.hasOwnProperty(laserType) && this.equippedLasers[laserType] >= amount) {
            this.equippedLasers[laserType] -= amount;
            this.applyWeaponConfigs(); // Aggiorna il danno quando rimuovi un laser
            return true;
        }
        return false;
    }

    // Gestione generatori: ogni generatore equipaggiato fornisce +2 speed
    equipGenerator(generatorType, amount = 1) {
        // Applica bonus velocità
        const speedBonusPerGen = 2;
        this.speed += speedBonusPerGen * amount;
        return true;
    }
    
    unequipGenerator(generatorType, amount = 1) {
        const speedBonusPerGen = 2;
        const baseSpeed = 2; // Velocità base della nave
        this.speed = Math.max(baseSpeed, this.speed - speedBonusPerGen * amount);
        return true;
    }

    getEquippedLasers(laserType) {
        return this.equippedLasers[laserType] || 0;
    }

    getTotalEquippedLasers() {
        const total = Object.values(this.equippedLasers).reduce((total, count) => total + count, 0);
        console.log('📊 getTotalEquippedLasers:', {
            equippedLasers: this.equippedLasers,
            total: total
        });
        return total;
    }
    
    getTotalLaserDamage() {
        let totalDamage = 0;
        for (const [laserType, count] of Object.entries(this.equippedLasers)) {
            totalDamage += count * this.laserDamage[laserType];
        }
        
        // Aggiungi bonus danno dai droni UAV
        if (this.droneDamageBonus) {
            totalDamage += this.droneDamageBonus;
        }
        
        // Moltiplica per il tipo di munizioni selezionato
        // Gestisci SAB separatamente, non ha un moltiplicatore di danno
        if (this.selectedLaser === 'sab') {
            return 0; // SAB non fa danno, solo assorbe scudo
        }
        const multiplier = parseInt(this.selectedLaser.slice(1)); // x1 -> 1, x2 -> 2, x3 -> 3
        return totalDamage * (isNaN(multiplier) ? 1 : multiplier); // Fallback a 1 se non è un numero valido
    }
    
    setResource(type, amount) {
        if (this.resources.hasOwnProperty(type)) {
            this.resources[type] = amount;
            
            // Sincronizza con le proprietà di compatibilità
            if (type === 'credits') this.credits = this.resources.credits;
            if (type === 'uridium') this.uridium = this.resources.uridium;
            if (type === 'honor') this.honor = this.resources.honor;
        }
    }
    
    // Metodi di compatibilità (deprecati - usare addResource/getResource)
    addCredits(amount) {
        this.addResource('credits', amount);
    }
    
    getCredits() {
        return this.getResource('credits');
    }
    
    addUridium(amount) {
        this.addResource('uridium', amount);
    }
    
    getUridium() {
        return this.getResource('uridium');
    }
    
    // Metodi per gestire esperienza e livelli
    addExperience(amount) {
        if (amount <= 0) return { amount: 0, levelUp: null };
        
        this.addResource('experience', amount);
        
        // Controlla se c'è stato un level up
        const levelUp = this.checkLevelUp();
        
        return { amount, levelUp };
    }
    
    checkLevelUp() {
        const nextLevel = this.currentLevel + 1;
        const nextLevelExp = this.levelRequirements[nextLevel];
        
        if (nextLevelExp && this.resources.experience >= nextLevelExp) {
            this.currentLevel = nextLevel;
            
            // Notifica level up se disponibile
            if (this.game && this.game.notifications) {
                this.game.notifications.add(`Livello ${this.currentLevel}`, 'info');
            }
            
            return {
                newLevel: this.currentLevel,
                oldLevel: this.currentLevel - 1
            };
        }
        
        return null;
    }
    
    getLevelInfo() {
        const nextLevel = this.currentLevel + 1;
        const nextLevelExp = this.levelRequirements[nextLevel];
        const currentLevelExp = this.levelRequirements[this.currentLevel];
        
        const expInCurrentLevel = this.resources.experience - currentLevelExp;
        const expNeededForLevel = nextLevelExp ? nextLevelExp - currentLevelExp : 0;
        
        return {
            level: this.currentLevel,
            exp: this.resources.experience,
            expFormatted: this.formatExp(this.resources.experience),
            expInCurrentLevel: expInCurrentLevel,
            expNeededForLevel: expNeededForLevel,
            progress: expNeededForLevel > 0 ? (expInCurrentLevel / expNeededForLevel) * 100 : 100
        };
    }
    
    formatExp(exp) {
        if (exp >= 1000000000) {
            return (exp / 1000000000).toFixed(1) + 'B';
        } else if (exp >= 1000000) {
            return (exp / 1000000).toFixed(1) + 'M';
        } else if (exp >= 1000) {
            return (exp / 1000).toFixed(1) + 'K';
        }
        return exp.toString();
    }
    
    // Aggiorna i valori della nave dalle statistiche
    updateStats() {
        // Mantiene i valori base
        this.hp = Math.min(this.hp, this.maxHP); // Non superare il max HP
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
        
            // Mostra il numero di danno
        if (window.gameInstance && window.gameInstance.damageNumbers) {
            window.gameInstance.damageNumbers.addNumber(this, damage, 'incoming');
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
        this.active = false; // Per compatibilità con AI system
        
        // Reset del sistema di radiazione quando la nave muore
        if (window.gameInstance && window.gameInstance.radiationSystem) {
            window.gameInstance.radiationSystem.reset();
        }
        
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
        return this.maxShield; // Ritorna il valore base
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
        // Normalizza il tipo di laser
        const normalizedType = laserType.trim().toLowerCase();
        
        // Verifica se il tipo di munizioni esiste
        if (this.ammunition.laser.hasOwnProperty(normalizedType)) {
            this.selectedLaser = normalizedType;
            this.applyWeaponConfigs();
            
            // Log per debug
            console.log('🔫 Laser selezionato:', {
                original: laserType,
                normalized: normalizedType,
                current: this.selectedLaser
            });
            
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
        // Applica configurazione laser base + danno dei laser equipaggiati
        this.projectileDamage = this.getTotalLaserDamage();  // Danno totale dei laser * moltiplicatore munizioni
        this.fireRate = this.laserConfig.fireRate;           // Fire rate fisso
        this.projectileSpeed = this.laserConfig.speed;       // Velocità fissa
        
        // Applica configurazione missile selezionata
        const missileConfig = this.missileConfigs[this.selectedMissile];
        if (missileConfig) {
            this.missileDamage = missileConfig.damage;       // I missili hanno il loro danno fisso
            this.missileFireRate = missileConfig.fireRate;
            this.missileSpeed = missileConfig.speed;
        }
    }
    
    getSelectedLaserInfo() {
        return {
            type: this.selectedLaser,
            ammunition: this.ammunition.laser[this.selectedLaser],
            damage: this.getTotalLaserDamage(),
            fireRate: this.laserConfig.fireRate,
            speed: this.laserConfig.speed
        };
    }
    
    getSelectedMissileInfo() {
        return this.missileConfigs[this.selectedMissile];
    }
    
    // Metodi per le quest
    addExperience(amount) {
        if (this.experience) {
            return this.experience.addExperience(amount);
        }
        return false;
    }
    
    addCredits(amount) {
        if (this.upgradeManager) {
            this.upgradeManager.addCredits(amount);
            return true;
        }
        return false;
    }
    
    // Metodi per il sistema clan
    createClan(clanName, clanTag) {
        if (this.clan.isInClan) {
            return { success: false, message: 'Sei già in un clan' };
        }
        
        if (!clanName || !clanTag) {
            return { success: false, message: 'Nome e tag del clan sono obbligatori' };
        }
        
        if (clanName.length < 3 || clanName.length > 20) {
            return { success: false, message: 'Nome clan deve essere tra 3 e 20 caratteri' };
        }
        
        if (clanTag.length < 2 || clanTag.length > 5) {
            return { success: false, message: 'Tag clan deve essere tra 2 e 5 caratteri' };
        }
        
        // Crea il clan
        this.clan = {
            id: `clan_${Date.now()}`,
            name: clanName,
            tag: clanTag.toUpperCase(),
            role: 'leader',
            joinedAt: Date.now(),
            isInClan: true
        };
        
        return { success: true, message: `Clan "${clanName}" creato con successo!` };
    }
    
    joinClan(clanId, clanName, clanTag) {
        if (this.clan.isInClan) {
            return { success: false, message: 'Sei già in un clan' };
        }
        
        this.clan = {
            id: clanId,
            name: clanName,
            tag: clanTag,
            role: 'member',
            joinedAt: Date.now(),
            isInClan: true
        };
        
        return { success: true, message: `Entrato nel clan "${clanName}"!` };
    }
    
    leaveClan() {
        if (!this.clan.isInClan) {
            return { success: false, message: 'Non sei in nessun clan' };
        }
        
        const clanName = this.clan.name;
        this.clan = {
            id: null,
            name: '',
            tag: '',
            role: 'none',
            joinedAt: null,
            isInClan: false
        };
        
        return { success: true, message: `Hai lasciato il clan "${clanName}"` };
    }
    
    getClanInfo() {
        if (!this.clan.isInClan) {
            return null;
        }
        
        return {
            id: this.clan.id,
            name: this.clan.name,
            tag: this.clan.tag,
            role: this.clan.role,
            joinedAt: this.clan.joinedAt,
            memberSince: new Date(this.clan.joinedAt).toLocaleDateString()
        };
    }
    
    get level() {
        return this.experience ? this.experience.level : 1;
    }

    // Sistema StarEnergy
    useStarEnergy(amount) {
        const currentEnergy = this.getResource('starEnergy');
        if (currentEnergy >= amount) {
            this.addResource('starEnergy', -amount);
            this.starEnergyConfig.lastUseTime = Date.now();
            return true;
        }
        
        // Notifica energia insufficiente (durata coerente con le altre)
        if (this.game && this.game.notifications) {
            this.game.notifications.add("⚡ StarEnergy insufficiente!", 600, 'warning');
        }
        return false;
    }

    // Metodo per aggiungere StarEnergy (ad esempio dalle bonus box)
    addStarEnergy(amount) {
        const currentEnergy = this.getResource('starEnergy');
        const newAmount = Math.min(currentEnergy + amount, this.starEnergyConfig.max);
        this.setResource('starEnergy', newAmount);
        
        // Notifica il giocatore
        if (this.game && this.game.notifications) {
            this.game.notifications.add(`⚡ +${amount} StarEnergy`, "reward");
        }
        
        return newAmount - currentEnergy; // Ritorna quanto effettivamente aggiunto
    }

    getStarEnergyInfo() {
        return {
            current: this.getResource('starEnergy'),
            max: this.starEnergyConfig.max
        };
    }
    
    // Metodo per attivare/disattivare il debug
    toggleDebug() {
        this.debugMode = !this.debugMode;
        console.log('🔧 Debug mode:', this.debugMode ? 'ON' : 'OFF');
        return this.debugMode;
    }
    
    // Metodo per abilitare il debug
    enableDebug() {
        this.debugMode = true;
        console.log('🔧 Debug mode: ON');
    }
    
    // Metodo per disabilitare il debug
    disableDebug() {
        this.debugMode = false;
        console.log('🔧 Debug mode: OFF');
    }
}
