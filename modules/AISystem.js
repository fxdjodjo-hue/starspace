// Sistema AI per NPC - Comportamenti modulari
import { EnemyProjectile } from './EnemyProjectile.js';

export class AISystem {
    constructor(enemy, game) {
        this.enemy = enemy;
        this.game = game;
        this.state = 'patrol'; // patrol, alert, attack, flee
        this.target = null;
        this.lastSeenPlayer = null;
        this.alertTimer = 0;
        this.attackTimer = 0;
        this.fleeTimer = 0;
        
        // Sistema di sparo
        this.projectiles = [];
        this.fireRate = 90; // Proiettili ogni 90 frame (1.5 secondi) - più veloce
        this.fireTimer = 0;
        
        // Configurazione AI dal tipo NPC
        this.config = enemy.config.ai || this.getDefaultAIConfig();
        
        // Rilevamento
        this.detectionRange = this.config.detectionRange || 200;
        this.attackRange = this.config.attackRange || 100;
        this.fleeThreshold = this.config.fleeThreshold || 0.3; // 30% HP
        
        // Comportamenti
        this.isAggressive = this.config.isAggressive || false;
        this.retaliateOnDamage = this.config.retaliateOnDamage || true;
        this.fleeWhenLow = this.config.fleeWhenLow || false;
    }
    
    getDefaultAIConfig() {
        return {
            detectionRange: 200,
            attackRange: 100,
            fleeThreshold: 0.3,
            isAggressive: false,
            retaliateOnDamage: true,
            fleeWhenLow: false,
            attackCooldown: 60, // 1 secondo
            alertDuration: 300, // 5 secondi
            fleeDuration: 180 // 3 secondi
        };
    }
    
    update() {
        if (!this.enemy.active) return;
        
        // Debug: mostra stato ogni frame (rimosso per pulizia console)
        
        // Aggiorna timer
        this.updateTimers();
        
        // Gestisci stati AI
        switch (this.state) {
            case 'patrol':
                this.updatePatrol();
                break;
            case 'alert':
                this.updateAlert();
                break;
            case 'attack':
                this.updateAttack();
                break;
            case 'flee':
                this.updateFlee();
                break;
        }
        
        // Controlla transizioni di stato
        this.checkStateTransitions();
    }
    
    updateTimers() {
        if (this.alertTimer > 0) this.alertTimer--;
        if (this.attackTimer > 0) this.attackTimer--;
        if (this.fleeTimer > 0) this.fleeTimer--;
    }
    
    updatePatrol() {
        // Delega al sistema di pattuglia originale del nemico
        this.enemy.updatePatrol();
    }
    
    updateAlert() {
        // Cerca il giocatore
        if (this.canSeePlayer()) {
            this.target = this.game.ship;
            this.lastSeenPlayer = { x: this.game.ship.x, y: this.game.ship.y };
            this.state = 'attack';
            return;
        }
        
        // In ALERT, muoviti verso l'ultima posizione vista del giocatore
        if (this.lastSeenPlayer) {
            this.moveTowardsLastSeenPosition();
        } else {
            // Se non ha mai visto il giocatore, cerca attivamente
            this.searchForPlayer();
        }
        
        // Se non vede il giocatore, torna a pattuglia dopo un po'
        if (this.alertTimer <= 0) {
            this.state = 'patrol';
            this.target = null;
            this.lastSeenPlayer = null;
        }
    }
    
    updateAttack() {
        if (!this.target || !this.target.active) {
            this.state = 'patrol';
            this.target = null;
            return;
        }
        
        // Controlla se il giocatore è ancora visibile
        const canSee = this.canSeePlayer();
        const distance = this.getDistanceToPlayer();
        
        // AI PERSISTENTE: Una volta attivato, cerca SEMPRE il giocatore
        if (canSee) {
            // Vede il giocatore: aggiorna ultima posizione e muoviti verso di lui
            this.lastSeenPlayer = { x: this.game.ship.x, y: this.game.ship.y };
            this.moveTowardsTarget();
            
            // Aggiungi movimento circolare per rendere il combattimento più dinamico
            this.addCircularMovement();
            
            // Ruota verso il giocatore
            this.rotateTowardsTarget();
        } else if (this.lastSeenPlayer) {
            // Non vede il giocatore ma ha una posizione nota: muoviti verso quella
            this.moveTowardsLastSeenPosition();
            
            // Ruota verso l'ultima posizione vista
            this.rotateTowardsLastSeenPosition();
        } else {
            // Se non ha mai visto il giocatore, cerca attivamente
            this.searchForPlayer();
        }
        
        // Controlla se deve fuggire (sempre quando sotto il 50% di HP)
        const hpPercentage = this.enemy.hp / this.enemy.maxHP;
        if (hpPercentage <= 0.5) { // 50% di HP
            this.state = 'flee';
            this.fleeTimer = 300; // 5 secondi di fuga
            console.log(`${this.enemy.getDisplayName()} sta scappando! HP: ${Math.floor(hpPercentage * 100)}%`);
            return;
        }
        
        // Attacca se in range (solo se molto vicino)
        if (this.getDistanceToTarget() <= this.attackRange && this.attackTimer <= 0) {
            this.performAttack();
        }
        
        // Sistema di sparo (sempre attivo quando in ATTACK)
        this.updateShooting();
    }
    
    updateFlee() {
        if (this.fleeTimer <= 0) {
            // Controlla se è ancora a bassa vita
            const hpPercentage = this.enemy.hp / this.enemy.maxHP;
            if (hpPercentage > 0.5) {
                // Se ha recuperato HP, torna ad attaccare
                this.state = 'attack';
                console.log(`${this.enemy.getDisplayName()} ha recuperato! Torna ad attaccare!`);
            } else {
                // Se è ancora ferito, torna a pattuglia
                this.state = 'patrol';
                this.target = null;
                this.lastSeenPlayer = null;
                console.log(`${this.enemy.getDisplayName()} torna a pattuglia per recuperare`);
            }
            return;
        }
        
        // Scappa dal giocatore velocemente
        this.moveAwayFromTarget();
        
        // Durante la fuga, non spara
        this.updateProjectiles(); // Aggiorna solo i proiettili esistenti
    }
    
    checkStateTransitions() {
        // Controlla se deve diventare aggressivo
        if (this.isAggressive && this.canSeePlayer() && this.state === 'patrol') {
            this.state = 'attack';
            this.target = this.game.ship;
            this.lastSeenPlayer = { x: this.game.ship.x, y: this.game.ship.y };
        }
    }
    
    canSeePlayer() {
        if (!this.game.ship || !this.game.ship.active) return false;
        
        const distance = this.getDistanceToPlayer();
        const canSee = distance <= this.detectionRange;
        
        // Debug rimosso per pulizia console
        
        return canSee;
    }
    
    getDistanceToPlayer() {
        const dx = this.game.ship.x - this.enemy.x;
        const dy = this.game.ship.y - this.enemy.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    getDistanceToTarget() {
        if (!this.target) return Infinity;
        const dx = this.target.x - this.enemy.x;
        const dy = this.target.y - this.enemy.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    moveTowardsTarget() {
        if (!this.target) return;
        
        const dx = this.target.x - this.enemy.x;
        const dy = this.target.y - this.enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Distanza minima di sicurezza (150 pixel)
        const minDistance = 150;
        
        if (distance > minDistance) {
            // Se è più lontano della distanza minima, avvicinati sempre
            const moveX = (dx / distance) * this.enemy.speed;
            const moveY = (dy / distance) * this.enemy.speed;
            
            this.enemy.x += moveX;
            this.enemy.y += moveY;
        } else if (distance < minDistance - 20) {
            // Se è troppo vicino, allontanati leggermente
            const moveX = -(dx / distance) * this.enemy.speed * 0.5; // Velocità dimezzata quando si allontana
            const moveY = -(dy / distance) * this.enemy.speed * 0.5;
            
            this.enemy.x += moveX;
            this.enemy.y += moveY;
        }
        // Se è nella distanza giusta (130-150px), resta fermo e spara
    }
    
    moveAwayFromTarget() {
        if (!this.target) return;
        
        const dx = this.enemy.x - this.target.x;
        const dy = this.enemy.y - this.target.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            // Scappa a velocità normale (fissa)
            const moveX = (dx / distance) * this.enemy.speed;
            const moveY = (dy / distance) * this.enemy.speed;
            
            this.enemy.x += moveX;
            this.enemy.y += moveY;
        }
    }
    
    moveTowardsLastSeenPosition() {
        if (!this.lastSeenPlayer) return;
        
        const dx = this.lastSeenPlayer.x - this.enemy.x;
        const dy = this.lastSeenPlayer.y - this.enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            const moveX = (dx / distance) * this.enemy.speed;
            const moveY = (dy / distance) * this.enemy.speed;
            
            this.enemy.x += moveX;
            this.enemy.y += moveY;
        }
    }
    
    searchForPlayer() {
        // Cerca il giocatore muovendosi verso la sua ultima posizione nota
        if (this.lastSeenPlayer) {
            // Muoviti verso l'ultima posizione vista del giocatore
            this.moveTowardsLastSeenPosition();
        } else {
            // Se non ha mai visto il giocatore, usa pattuglia normale
            this.enemy.updatePatrol();
        }
        
        // Aggiungi movimento extra per evitare il congelamento
        if (this.enemy.vx === 0 && this.enemy.vy === 0) {
            // Se è fermo, dà una spinta casuale
            this.enemy.vx = (Math.random() - 0.5) * this.enemy.speed;
            this.enemy.vy = (Math.random() - 0.5) * this.enemy.speed;
        }
        
        // Controlla se durante la ricerca vede il giocatore
        if (this.canSeePlayer()) {
            this.target = this.game.ship;
            this.lastSeenPlayer = { x: this.game.ship.x, y: this.game.ship.y };
            console.log(`${this.enemy.getDisplayName()} ha trovato il giocatore durante la ricerca!`);
        }
    }
    
    performAttack() {
        // Implementa attacco al giocatore
        if (this.target && this.target.active) {
            // Calcola danno basato sulla configurazione NPC
            // Danno casuale tra -2.5 e +2.5 dal danno base
            const baseDamage = this.enemy.damage || this.enemy.config.damage || 20;
            const variation = (Math.random() * 5) - 2.5; // Variazione di ±2.5
            const damage = Math.round(baseDamage + variation);
            
            if (this.game.ship && this.game.ship.takeDamage) {
                this.game.ship.takeDamage(damage);
            }
        }
        
        this.attackTimer = this.config.attackCooldown;
    }
    
    onDamageReceived() {
        // Reagisce ai danni ricevuti - attacca direttamente il giocatore
        if (this.retaliateOnDamage && this.state === 'patrol') {
            this.state = 'attack';
            this.target = this.game.ship;
            this.lastSeenPlayer = { x: this.game.ship.x, y: this.game.ship.y };
        }
    }
    
    getState() {
        return this.state;
    }
    
    getTarget() {
        return this.target;
    }
    
    // Sistema di sparo
    updateShooting() {
        // Aggiorna timer di sparo
        this.fireTimer++;
        
        // Sparo solo se in ATTACK e vede il giocatore
        if (this.state === 'attack' && this.canSeePlayer() && this.fireTimer >= this.fireRate) {
            this.fireProjectile();
            this.fireTimer = 0;
        }
        
        // Aggiorna tutti i proiettili
        this.updateProjectiles();
        
        // Controlla collisioni proiettili-giocatore
        this.checkProjectileCollisions();
    }
    
    fireProjectile() {
        if (!this.target || !this.target.active) return;
        
        // Laser singolo centrale (come richiesto)
        const projectile = new EnemyProjectile(
            this.enemy.x, 
            this.enemy.y, 
            this.target.x, 
            this.target.y,
            12, // velocità
            this.enemy.damage || 20 // danno completo
        );
        
        this.projectiles.push(projectile);
        
        // Riproduci suono laser se l'audio manager è disponibile
        if (window.gameInstance && window.gameInstance.audioManager) {
            window.gameInstance.audioManager.playLaserSound();
        }
    }
    
    updateProjectiles() {
        this.projectiles = this.projectiles.filter(projectile => {
            // Aggiorna direzione verso il target in movimento
            if (this.target && this.target.active) {
                projectile.updateDirection(this.target.x, this.target.y);
            }
            
            projectile.update();
            return projectile.active;
        });
    }
    
    // Controlla collisioni proiettili-giocatore
    checkProjectileCollisions() {
        if (!this.target || !this.target.active) return false;
        
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            if (projectile.checkCollision(this.target)) {
                this.target.takeDamage(projectile.damage);
                
                // Rimuovi il proiettile
                projectile.deactivate();
                this.projectiles.splice(i, 1);
                
                return true;
            }
        }
        
        return false;
    }
    
    // Ruota verso il target
    rotateTowardsTarget() {
        if (!this.target) return;
        
        const dx = this.target.x - this.enemy.x;
        const dy = this.target.y - this.enemy.y;
        const angle = Math.atan2(dy, dx);
        
        // Imposta la rotazione del nemico
        this.enemy.rotation = angle;
    }
    
    // Ruota verso l'ultima posizione vista
    rotateTowardsLastSeenPosition() {
        if (!this.lastSeenPlayer) return;
        
        const dx = this.lastSeenPlayer.x - this.enemy.x;
        const dy = this.lastSeenPlayer.y - this.enemy.y;
        const angle = Math.atan2(dy, dx);
        
        // Imposta la rotazione del nemico
        this.enemy.rotation = angle;
    }
    
    // Aggiunge movimento circolare durante l'attacco per rendere il combattimento più dinamico
    addCircularMovement() {
        if (!this.target) return;
        
        // Inizializza il timer di movimento circolare se non esiste
        if (!this.circularTimer) {
            this.circularTimer = 0;
            this.circularDirection = Math.random() > 0.5 ? 1 : -1; // Direzione casuale
        }
        
        this.circularTimer++;
        
        // Calcola la direzione perpendicolare al target
        const dx = this.target.x - this.enemy.x;
        const dy = this.target.y - this.enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            // Direzione perpendicolare (90 gradi)
            const perpX = -dy / distance;
            const perpY = dx / distance;
            
            // Movimento circolare con velocità ridotta
            const circularSpeed = this.enemy.speed * 0.3; // 30% della velocità normale
            const moveX = perpX * circularSpeed * this.circularDirection;
            const moveY = perpY * circularSpeed * this.circularDirection;
            
            this.enemy.x += moveX;
            this.enemy.y += moveY;
            
            // Cambia direzione ogni 2 secondi per movimento più naturale
            if (this.circularTimer % 120 === 0) {
                this.circularDirection *= -1;
            }
            
            // Aggiungi anche un piccolo movimento di "zigzag" per renderlo più imprevedibile
            if (this.circularTimer % 30 === 0) {
                // Piccola variazione casuale ogni 0.5 secondi
                const zigzagX = (Math.random() - 0.5) * this.enemy.speed * 0.1;
                const zigzagY = (Math.random() - 0.5) * this.enemy.speed * 0.1;
                
                this.enemy.x += zigzagX;
                this.enemy.y += zigzagY;
            }
        }
    }
    
    // Disegna i proiettili
    drawProjectiles(ctx, camera) {
        this.projectiles.forEach(projectile => {
            projectile.draw(ctx, camera);
        });
    }
}
