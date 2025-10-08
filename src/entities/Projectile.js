// Modulo Projectile per i proiettili del combattimento
export class Projectile {
    constructor(x, y, targetX, targetY, speed = 8, damage = 25, isSAB = false, laserType = 'x1') {
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.speed = speed;
        this.damage = damage;
        this.active = true;
        this.radius = 3;
        this.isSAB = isSAB; // Flag per proiettili Shield Absorber
        this.laserType = laserType ? laserType.toLowerCase() : 'x1'; // Tipo di laser (x1, x2, x3)
        
        // Calcola la direzione del proiettile
        const dx = targetX - x;
        const dy = targetY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            this.vx = (dx / distance) * speed;
            this.vy = (dy / distance) * speed;
        } else {
            this.vx = 0;
            this.vy = 0;
        }
        
        // Vita del proiettile (per evitare che voli all'infinito)
        this.maxLifetime = 60; // 1 secondo a 60 FPS
        this.lifetime = 0;
        
        // Configurazione sprite per tipo di laser (PNG già pronti)
        this.laserSprites = {
            x1: 'assets/sprites/lasereffect/laser1.png',
            x2: 'assets/sprites/lasereffect/laser2.png', 
            x3: 'assets/sprites/lasereffect/laser3.png',
            sab: 'assets/sprites/lasereffect/laser5.png'
        };
        
        // Carica la texture del laser specifica per tipo
        this.texture = new Image();
        this.texture.src = this.laserSprites[this.laserType] || 'assets/sprites/lasereffect/laser1.png';
        this.textureLoaded = false;
        this.texture.onload = () => {
            this.textureLoaded = true;
        };
    }
    
    update() {
        if (!this.active) return;
        
        // Aggiorna posizione
        this.x += this.vx;
        this.y += this.vy;
        
        // Aggiorna vita
        this.lifetime++;
        
        // Disattiva se troppo vecchio
        if (this.lifetime >= this.maxLifetime) {
            this.active = false;
        }
    }
    
    // Metodo per aggiornare la direzione verso il target (se il target si muove)
    updateDirection(targetX, targetY) {
        if (!this.active) return;
        
        // Calcola nuova direzione verso il target
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            // Aggiorna velocità mantenendo la stessa velocità scalare
            this.vx = (dx / distance) * this.speed;
            this.vy = (dy / distance) * this.speed;
        }
    }
    
    draw(ctx, camera) {
        if (!this.active || this.isInvisible) return;
        
        // Posizione relativa alla camera
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        
        ctx.save();
        
        // Usa la texture se caricata, altrimenti fallback
        if (this.textureLoaded) {
            // Calcola la rotazione del proiettile
            const rotation = Math.atan2(this.vy, this.vx);
            
            // Disegna la texture del laser
            ctx.translate(screenX, screenY);
            ctx.rotate(rotation);
            
            // Dimensioni del laser (dimensioni originali dello sprite)
            const laserWidth = 60;
            const laserHeight = 24;
            
            // Disegna direttamente lo sprite PNG (già colorato)
            ctx.globalCompositeOperation = 'source-over';
            ctx.drawImage(this.texture, -laserWidth/2, -laserHeight/2, laserWidth, laserHeight);
            
            // Ripristina le impostazioni
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1.0;
            ctx.shadowBlur = 0;
        } else {
            // Fallback: disegna un proiettile semplice se lo sprite non è caricato
            ctx.fillStyle = '#ff0000'; // Colore di fallback
            ctx.beginPath();
            ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    // Metodo render per compatibilità con PlayerAI
    render(ctx) {
        if (!this.active) return;
        
        ctx.save();
        
        // Usa la texture se caricata, altrimenti fallback
        if (this.textureLoaded) {
            // Calcola la rotazione del proiettile
            const rotation = Math.atan2(this.vy, this.vx);
            
            // Disegna la texture del laser
            ctx.translate(this.x, this.y);
            ctx.rotate(rotation);
            
            // Dimensioni del laser - ANCORA PIÙ GRANDE
            const laserWidth = 48;
            const laserHeight = 18;
            
            // Determina il colore del laser
            let color;
            if (this.isSAB) {
                color = '#4A90E2'; // Azzurro per SAB
            } else {
                switch(this.laserType) {
                    case 'x1':
                        color = '#FF0000'; // Rosso
                        break;
                    case 'x2':
                        color = '#0000FF'; // Blu
                        break;
                    case 'x3':
                        color = '#00FF00'; // Verde
                        break;
                    default:
                        color = '#FF0000'; // Default rosso
                }
            }
            
            // Applica il colore alla texture
            ctx.globalCompositeOperation = 'source-over';
            ctx.drawImage(this.texture, -laserWidth/2, -laserHeight/2, laserWidth, laserHeight);
            
            // Applica il colore come overlay
            ctx.globalCompositeOperation = 'source-atop';
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.8; // Regola l'intensità del colore
            ctx.fillRect(-laserWidth/2, -laserHeight/2, laserWidth, laserHeight);
            
            // Aggiungi un glow del colore
            ctx.globalCompositeOperation = 'lighter';
            ctx.shadowColor = color;
            ctx.shadowBlur = 10;
            ctx.globalAlpha = 0.5;
            ctx.fillRect(-laserWidth/2, -laserHeight/2, laserWidth, laserHeight);
            
            // Ripristina le impostazioni
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1.0;
            ctx.shadowBlur = 0;
        } else {
            // Fallback: disegna un proiettile semplice
            // Determina il colore in base al tipo di laser
            let color;
            if (this.isSAB) {
                color = '#4A90E2'; // Azzurro per SAB
            } else {
                // Rimuovi eventuali spazi e converti in minuscolo
                const type = this.laserType.trim().toLowerCase();
                switch(type) {
                    case 'x1':
                        color = '#FF0000'; // Rosso
                        break;
                    case 'x2':
                        color = '#0000FF'; // Blu
                        break;
                    case 'x3':
                        color = '#00FF00'; // Verde
                        break;
                    default:
                        console.log('⚠️ Tipo laser non riconosciuto:', this.laserType, 'normalizzato a:', type);
                        color = '#FF0000'; // Default rosso
                }
            }

            ctx.shadowColor = color;
            ctx.shadowBlur = 8;
            
            if (this.isSAB) {
                // Per SAB disegna cerchi concentrici
                for (let i = 0; i < 3; i++) {
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.radius + (i * 3), 0, Math.PI * 2);
                    ctx.stroke();
                }
            } else {
                // Proiettile principale
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
                
                // Nucleo più luminoso
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius * 0.6, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.6;
            
            const trailLength = 15;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x - this.vx * trailLength / this.speed, 
                       this.y - this.vy * trailLength / this.speed);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    // Controlla collisione con un nemico
    checkCollision(enemy) {
        // Controlli di sicurezza
        if (!this.active || !enemy || !enemy.active) return false;
        
        const dx = this.x - enemy.x;
        const dy = this.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const hasCollided = distance < enemy.radius + this.radius;
        
        // Se c'è una collisione, disattiva immediatamente il proiettile
        if (hasCollided) {
            this.deactivate();
        }
        
        return hasCollided;
    }
    
    // Disattiva il proiettile
    deactivate() {
        this.active = false;
    }
}
