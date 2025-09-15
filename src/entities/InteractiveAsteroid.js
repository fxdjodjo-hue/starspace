export class InteractiveAsteroid {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 60;
        this.active = true;
        this.sprite = null;
        this.miningActive = false;
        this.miningProgress = 0;
        this.miningDuration = 5000; // 5 secondi per test
        this.miningStartTime = 0;
        this.miningPlayer = null;
        this.animationOffset = 0;
        this.animationSpeed = 0.1;
        this.lastNotificationTime = 0;
        this.notificationCooldown = 3000; // 3 secondi tra le notifiche
        this.miningInterrupted = false;
        
        // Sistema di respawn
        this.respawnTime = 30000; // 30 secondi per respawn
        this.respawnTimer = 0;
        this.isRespawning = false;
        
        // Movimento orbitale
        this.originalX = x;
        this.originalY = y;
        this.orbitRadius = 80; // Raggio dell'orbita
        this.orbitSpeed = 0.0005; // Velocità ancora più lenta
        this.orbitAngle = 0;
        this.rewards = {
            credits: 0,
            uridium: 0,
            honor: 0
        };
        
        this.loadSprite();
        this.generateRewards();
    }
    
    loadSprite() {
        this.sprite = new Image();
        this.sprite.onload = () => {
            console.log('🪨 Asteroide interattivo caricato!');
        };
        this.sprite.src = 'asteroid.png';
    }
    
    generateRewards() {
        // Genera ricompense casuali
        this.rewards.credits = Math.floor(Math.random() * 500) + 100;
        this.rewards.uridium = Math.floor(Math.random() * 20) + 5;
        this.rewards.honor = Math.floor(Math.random() * 10) + 2;
    }
    
    showNotification(message) {
        const currentTime = Date.now();
        if (currentTime - this.lastNotificationTime >= this.notificationCooldown) {
            if (window.gameInstance && window.gameInstance.notifications) {
                window.gameInstance.notifications.add(message);
                this.lastNotificationTime = currentTime;
            }
        }
    }
    
    update() {
        // Se l'asteroide è in respawn, aggiorna il timer
        if (this.isRespawning) {
            this.respawnTimer += 16; // ~60 FPS
            
            if (this.respawnTimer >= this.respawnTime) {
                this.respawn();
            }
            return;
        }
        
        // Aggiorna movimento orbitale solo se attivo
        if (this.active) {
            this.orbitAngle += this.orbitSpeed;
            this.x = this.originalX + Math.cos(this.orbitAngle) * this.orbitRadius;
            this.y = this.originalY + Math.sin(this.orbitAngle) * this.orbitRadius;
        }
        
        if (this.miningActive) {
            const currentTime = Date.now();
            this.miningProgress = Math.min((currentTime - this.miningStartTime) / this.miningDuration, 1);
            
            // Se il mining è completato
            if (this.miningProgress >= 1) {
                this.completeMining();
            }
        }
    }
    
    startMining(player) {
        if (!this.miningActive && this.active) {
            this.miningActive = true;
            this.miningStartTime = Date.now();
            this.miningPlayer = player;
            this.miningProgress = 0;
            
            console.log('⛏️ Mining iniziato!');
        }
    }
    
    stopMining() {
        if (this.miningActive) {
            this.miningActive = false;
            this.miningPlayer = null;
            this.miningProgress = 0;
            this.miningInterrupted = false;
            console.log('⛏️ Mining interrotto!');
        }
    }
    
    interruptMining(reason = 'danno') {
        if (this.miningActive) {
            this.miningActive = false;
            this.miningPlayer = null;
            this.miningProgress = 0;
            this.miningInterrupted = true;
            
            const message = reason === 'danno' ? 
                '⛏️ Mining interrotto - hai subito danno!' : 
                '⛏️ Mining interrotto - sei entrato in combattimento!';
            
            this.showNotification(message);
            console.log('⛏️ Mining interrotto per:', reason);
        }
    }
    
    completeMining() {
        if (this.miningPlayer) {
            // Mostra prima la notifica "Asteroid minato!"
            if (window.gameInstance && window.gameInstance.notifications) {
                window.gameInstance.notifications.add("Asteroid minato!", 600, 'success');
            }
            
            // Poi processa i reward
            if (this.miningPlayer.rewardManager) {
                this.miningPlayer.rewardManager.processMiningRewards(
                    this.rewards.credits,
                    this.rewards.uridium,
                    this.rewards.honor
                );
            } else {
                // Fallback per compatibilità
                this.miningPlayer.addResource('credits', this.rewards.credits);
                this.miningPlayer.addResource('uridium', this.rewards.uridium);
                this.miningPlayer.addResource('honor', this.rewards.honor);
                
                // Mostra notifiche delle ricompense
                if (window.gameInstance && window.gameInstance.notifications) {
                    if (this.rewards.credits > 0) {
                        window.gameInstance.notifications.add(`+${this.rewards.credits} Credits`, 600, 'reward');
                    }
                    if (this.rewards.uridium > 0) {
                        window.gameInstance.notifications.add(`+${this.rewards.uridium} Uridium`, 600, 'reward');
                    }
                    if (this.rewards.honor > 0) {
                        window.gameInstance.notifications.add(`+${this.rewards.honor} Honor`, 600, 'reward');
                    }
                }
            }
            
            console.log(`💰 Ricompense: ${this.rewards.credits} Crediti, ${this.rewards.uridium} Uridium, ${this.rewards.honor} Onore`);
        }
        
        // Avvia il respawn invece di disattivare permanentemente
        this.startRespawn();
    }
    
    startRespawn() {
        this.active = false;
        this.miningActive = false;
        this.miningPlayer = null;
        this.isRespawning = true;
        this.respawnTimer = 0;
        
        console.log('⏳ Asteroide in respawn...');
    }
    
    respawn() {
        this.active = true;
        this.isRespawning = false;
        this.respawnTimer = 0;
        this.miningActive = false;
        this.miningPlayer = null;
        this.miningProgress = 0;
        this.miningInterrupted = false;
        
        // Genera nuove ricompense
        this.generateRewards();
        
        console.log('🪨 Asteroide respawnato!');
    }
    
    draw(ctx, camera) {
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        
        // Se l'asteroide è in respawn, mostra solo il timer
        if (this.isRespawning) {
            this.drawRespawnIndicator(ctx, screenX, screenY);
            return;
        }
        
        if (!this.active) return;
        
        // Disegna l'asteroide
        if (this.sprite && this.sprite.complete) {
            ctx.save();
            ctx.translate(screenX, screenY);
            ctx.drawImage(this.sprite, -this.radius, -this.radius, this.radius * 2, this.radius * 2);
            ctx.restore();
        } else {
            // Fallback geometrico
            ctx.fillStyle = '#8B4513';
            ctx.beginPath();
            ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Disegna indicatore di mining se attivo
        if (this.miningActive) {
            this.drawMiningIndicator(ctx, screenX, screenY);
        }
        
        // Disegna indicatore di interazione se non in mining
        if (!this.miningActive && this.active) {
            this.drawInteractionIndicator(ctx, screenX, screenY);
        }
    }
    
    drawMiningIndicator(ctx, x, y) {
        // Calcola il tempo rimanente
        const currentTime = Date.now();
        const elapsed = currentTime - this.miningStartTime;
        const remaining = Math.max(0, this.miningDuration - elapsed);
        const remainingSeconds = Math.ceil(remaining / 1000);
        
        // Barra di progresso del mining
        const barWidth = 100;
        const barHeight = 10;
        const barX = x - barWidth / 2;
        const barY = y - this.radius - 30;
        
        // Sfondo barra
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Barra di progresso
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(barX, barY, barWidth * this.miningProgress, barHeight);
        
        // Bordo
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // Testo countdown
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${remainingSeconds}s`, x, barY - 8);
        
        // Testo "MINING"
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('MINING...', x, barY + barHeight + 15);
    }
    
    drawInteractionIndicator(ctx, x, y) {
        // Indicatore di interazione (pulsante destro)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Tasto Destro', x, y - this.radius - 10);
        
        // Icona mouse
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '12px Arial';
        ctx.fillText('🖱️', x, y - this.radius - 25);
        
        // Bordo luminoso attorno all'asteroide
        ctx.strokeStyle = 'rgba(255, 140, 0, 0.6)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, this.radius + 5, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    checkCollision(x, y) {
        const dx = this.x - x;
        const dy = this.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= this.radius;
    }
    
    canInteract(player) {
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= this.radius + 50; // Raggio di interazione
    }
    
    drawRespawnIndicator(ctx, x, y) {
        // Calcola il tempo rimanente
        const remaining = Math.max(0, this.respawnTime - this.respawnTimer);
        const remainingSeconds = Math.ceil(remaining / 1000);
        
        // Disegna un cerchio grigio per indicare l'asteroide in respawn
        ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
        ctx.beginPath();
        ctx.arc(x, y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Bordo
        ctx.strokeStyle = 'rgba(150, 150, 150, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Testo countdown
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${remainingSeconds}s`, x, y - this.radius - 20);
        
        // Testo "RESPAWN"
        ctx.fillStyle = '#ffaa00';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('RESPAWN', x, y + this.radius + 15);
    }
}
