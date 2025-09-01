// Sistema di effetti ambientali per l'immersione spaziale
export class AmbientEffects {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        
        // Stelle cadenti
        this.shootingStars = [];
        this.shootingStarTimer = 0;
        this.shootingStarRate = 300; // Ogni 5 secondi (300 frame a 60fps)
        
        // Nebulose (nuvole di gas)
        this.nebulae = [];
        this.nebulaCount = 8;
        
        // Asteroidi fluttuanti
        this.asteroids = [];
        this.asteroidCount = 12;
        
        this.initializeEffects();
    }
    
    initializeEffects() {
        // Inizializza nebulose
        for (let i = 0; i < this.nebulaCount; i++) {
            this.nebulae.push({
                x: Math.random() * this.width * 3 - this.width,
                y: Math.random() * this.height * 3 - this.height,
                size: Math.random() * 200 + 100,
                opacity: Math.random() * 0.1 + 0.05, // Molto sottile
                driftX: (Math.random() - 0.5) * 0.2,
                driftY: (Math.random() - 0.5) * 0.2,
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 0.01 + 0.005
            });
        }
        
        // Inizializza asteroidi
        for (let i = 0; i < this.asteroidCount; i++) {
            this.asteroids.push({
                x: Math.random() * this.width * 2 - this.width,
                y: Math.random() * this.height * 2 - this.height,
                size: Math.random() * 8 + 4,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                driftX: (Math.random() - 0.5) * 0.3,
                driftY: (Math.random() - 0.5) * 0.3,
                opacity: Math.random() * 0.4 + 0.2
            });
        }
    }
    
    update(camera) {
        // Aggiorna nebulose
        this.nebulae.forEach(nebula => {
            nebula.x += nebula.driftX;
            nebula.y += nebula.driftY;
            nebula.pulse += nebula.pulseSpeed;
            
            // Riposiziona se esce dallo schermo
            if (nebula.x < -nebula.size) nebula.x = this.width + nebula.size;
            if (nebula.x > this.width + nebula.size) nebula.x = -nebula.size;
            if (nebula.y < -nebula.size) nebula.y = this.height + nebula.size;
            if (nebula.y > this.height + nebula.size) nebula.y = -nebula.size;
        });
        
        // Aggiorna asteroidi
        this.asteroids.forEach(asteroid => {
            asteroid.x += asteroid.driftX;
            asteroid.y += asteroid.driftY;
            asteroid.rotation += asteroid.rotationSpeed;
            
            // Riposiziona se esce dallo schermo
            if (asteroid.x < -50) asteroid.x = this.width + 50;
            if (asteroid.x > this.width + 50) asteroid.x = -50;
            if (asteroid.y < -50) asteroid.y = this.height + 50;
            if (asteroid.y > this.height + 50) asteroid.y = -50;
        });
        
        // Gestisci stelle cadenti
        this.shootingStarTimer++;
        if (this.shootingStarTimer >= this.shootingStarRate) {
            this.createShootingStar();
            this.shootingStarTimer = 0;
            this.shootingStarRate = Math.random() * 200 + 200; // 3-8 secondi
        }
        
        // Aggiorna stelle cadenti esistenti
        this.shootingStars = this.shootingStars.filter(star => {
            star.x += star.velocityX;
            star.y += star.velocityY;
            star.life--;
            star.trail.push({ x: star.x, y: star.y });
            
            // Mantieni solo gli ultimi 8 punti della scia
            if (star.trail.length > 8) {
                star.trail.shift();
            }
            
            return star.life > 0;
        });
    }
    
    createShootingStar() {
        // Crea una stella cadente da un bordo dello schermo
        const side = Math.floor(Math.random() * 4);
        let x, y, velocityX, velocityY;
        
        switch (side) {
            case 0: // Da sinistra
                x = -50;
                y = Math.random() * this.height;
                velocityX = Math.random() * 3 + 2;
                velocityY = (Math.random() - 0.5) * 2;
                break;
            case 1: // Da destra
                x = this.width + 50;
                y = Math.random() * this.height;
                velocityX = -(Math.random() * 3 + 2);
                velocityY = (Math.random() - 0.5) * 2;
                break;
            case 2: // Dall'alto
                x = Math.random() * this.width;
                y = -50;
                velocityX = (Math.random() - 0.5) * 2;
                velocityY = Math.random() * 3 + 2;
                break;
            case 3: // Dal basso
                x = Math.random() * this.width;
                y = this.height + 50;
                velocityX = (Math.random() - 0.5) * 2;
                velocityY = -(Math.random() * 3 + 2);
                break;
        }
        
        this.shootingStars.push({
            x: x,
            y: y,
            velocityX: velocityX,
            velocityY: velocityY,
            life: 120, // 2 secondi a 60fps
            trail: [],
            brightness: Math.random() * 0.5 + 0.5
        });
    }
    
    draw(ctx, camera) {
        // Disegna nebulose (sotto tutto)
        this.drawNebulae(ctx, camera);
        
        // Disegna asteroidi
        this.drawAsteroids(ctx, camera);
        
        // Disegna stelle cadenti (sopra tutto)
        this.drawShootingStars(ctx, camera);
    }
    
    drawNebulae(ctx, camera) {
        this.nebulae.forEach(nebula => {
            const screenPos = camera.worldToScreen(nebula.x, nebula.y);
            
            // Controlla se è visibile
            if (screenPos.x < -nebula.size || screenPos.x > ctx.canvas.width + nebula.size ||
                screenPos.y < -nebula.size || screenPos.y > ctx.canvas.height + nebula.size) {
                return;
            }
            
            // Calcola opacità con pulsazione
            const pulse = Math.sin(nebula.pulse) * 0.3 + 0.7;
            const alpha = nebula.opacity * pulse;
            
            ctx.save();
            ctx.globalAlpha = alpha;
            
            // Crea gradiente per la nebulosa
            const gradient = ctx.createRadialGradient(
                screenPos.x, screenPos.y, 0,
                screenPos.x, screenPos.y, nebula.size
            );
            gradient.addColorStop(0, 'rgba(200, 200, 255, 0.1)');
            gradient.addColorStop(0.5, 'rgba(150, 150, 200, 0.05)');
            gradient.addColorStop(1, 'rgba(100, 100, 150, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(screenPos.x, screenPos.y, nebula.size, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        });
    }
    
    drawAsteroids(ctx, camera) {
        this.asteroids.forEach(asteroid => {
            const screenPos = camera.worldToScreen(asteroid.x, asteroid.y);
            
            // Controlla se è visibile
            if (screenPos.x < -50 || screenPos.x > ctx.canvas.width + 50 ||
                screenPos.y < -50 || screenPos.y > ctx.canvas.height + 50) {
                return;
            }
            
            ctx.save();
            ctx.globalAlpha = asteroid.opacity;
            ctx.translate(screenPos.x, screenPos.y);
            ctx.rotate(asteroid.rotation);
            
            // Disegna asteroide irregolare
            ctx.fillStyle = '#666666';
            ctx.strokeStyle = '#444444';
            ctx.lineWidth = 1;
            
            ctx.beginPath();
            ctx.moveTo(0, -asteroid.size);
            ctx.lineTo(asteroid.size * 0.7, -asteroid.size * 0.3);
            ctx.lineTo(asteroid.size, asteroid.size * 0.5);
            ctx.lineTo(asteroid.size * 0.3, asteroid.size);
            ctx.lineTo(-asteroid.size * 0.5, asteroid.size * 0.7);
            ctx.lineTo(-asteroid.size, 0);
            ctx.lineTo(-asteroid.size * 0.3, -asteroid.size * 0.5);
            ctx.closePath();
            
            ctx.fill();
            ctx.stroke();
            
            ctx.restore();
        });
    }
    
    drawShootingStars(ctx, camera) {
        this.shootingStars.forEach(star => {
            const screenPos = camera.worldToScreen(star.x, star.y);
            
            // Controlla se è visibile
            if (screenPos.x < -100 || screenPos.x > ctx.canvas.width + 100 ||
                screenPos.y < -100 || screenPos.y > ctx.canvas.height + 100) {
                return;
            }
            
            ctx.save();
            
            // Disegna la scia
            for (let i = 0; i < star.trail.length - 1; i++) {
                const point = star.trail[i];
                const nextPoint = star.trail[i + 1];
                const alpha = (i / star.trail.length) * star.brightness;
                
                const pointScreen = camera.worldToScreen(point.x, point.y);
                const nextPointScreen = camera.worldToScreen(nextPoint.x, nextPoint.y);
                
                ctx.globalAlpha = alpha;
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(pointScreen.x, pointScreen.y);
                ctx.lineTo(nextPointScreen.x, nextPointScreen.y);
                ctx.stroke();
            }
            
            // Disegna la stella
            ctx.globalAlpha = star.brightness;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(screenPos.x, screenPos.y, 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        });
    }
    
    updateSize(width, height) {
        this.width = width;
        this.height = height;
        this.initializeEffects();
    }
}
