// Sistema di sfondo parallax spaziale a 360° - IMMERSIONE TOTALE
export class ParallaxBackground {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.stars = [];
        this.nebulae = [];
        this.planets = [];
        this.asteroids = [];
        this.stardust = [];
        this.auroras = [];
        this.events = []; // Eventi dinamici

        // Sistema parallax pulito e minimalista
        this.parallaxLayers = 3; // 3 livelli di profondità
        this.starsPerLayer = 100; // Stelle per densità spaziale
        this.nebulaeCount = 15; // Nebulose per copertura
        this.planetsCount = 4; // Pianeti di sfondo
        this.asteroidsCount = 12; // Asteroidi di sfondo
        this.stardustCount = 80; // Particelle di polvere stellare
        this.aurorasCount = 3; // Aurore spaziali
        
        // Sistema di eventi dinamici
        this.eventTimer = 0;
        this.eventInterval = 3000; // Evento ogni 3 secondi
        this.maxEvents = 3; // Massimo 3 eventi simultanei
        
        this.initializeStars();
        this.initializeNebulae();
        this.initializePlanets();
        this.initializeAsteroids();
        this.initializeStardust();
        this.initializeAuroras();
    }
    
    initializeStars() {
        this.stars = [];
        
        // Sistema di stelle con movimento parallax naturale
        for (let layer = 0; layer < this.parallaxLayers; layer++) {
            const layerStars = [];
            
            for (let i = 0; i < this.starsPerLayer; i++) {
                // Genera stelle in un'area estesa per movimento fluido
                const star = {
                    x: Math.random() * this.width * 4 - this.width * 2, // Area 4x più grande
                    y: Math.random() * this.height * 4 - this.height * 2,
                    size: Math.random() * 2 + 0.5, // Dimensioni naturali
                    brightness: Math.random() * 0.8 + 0.2, // Luminosità varia
                    layer: layer,
                    twinkle: Math.random() * Math.PI * 2,
                    twinkleSpeed: Math.random() * 0.02 + 0.01,
                    color: this.getStarColor(layer),
                    pulse: Math.random() * Math.PI * 2,
                    pulseSpeed: Math.random() * 0.015 + 0.005
                };
                
                layerStars.push(star);
            }
            
            this.stars.push(layerStars);
        }
    }
    
    getStarColor(layer) {
        const colors = [
            '#ffffff', // Livello 1: bianco puro (più vicino)
            '#f0f8ff', // Livello 2: bianco azzurro
            '#e6f3ff', // Livello 3: azzurro chiaro
            '#b3d9ff', // Livello 4: azzurro
            '#87ceeb'  // Livello 5: azzurro cielo (più lontano)
        ];
        return colors[layer] || '#ffffff';
    }
    
    initializeNebulae() {
        this.nebulae = [];
        
        for (let i = 0; i < this.nebulaeCount; i++) {
            const nebula = {
                x: Math.random() * this.width * 6 - this.width * 3,
                y: Math.random() * this.height * 6 - this.height * 3,
                width: Math.random() * 200 + 120, // Nebulose più grandi e variabili
                height: Math.random() * 150 + 100,
                color: this.getRandomNebulaColor(),
                secondaryColor: this.getRandomNebulaColor(), // Colore secondario per gradiente
                opacity: Math.random() * 0.5 + 0.3, // Più visibili
                layer: Math.floor(Math.random() * 3),
                speed: Math.random() * 0.03 + 0.01,
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 0.015 + 0.005,
                wave: Math.random() * Math.PI * 2, // Effetto onda
                waveSpeed: Math.random() * 0.02 + 0.01,
                glow: Math.random() * 0.3 + 0.1, // Intensità bagliore
                rotation: Math.random() * Math.PI * 2, // Rotazione per forma dinamica
                rotationSpeed: Math.random() * 0.005 + 0.002
            };
            
            this.nebulae.push(nebula);
        }
    }
    
    getRandomNebulaColor() {
        const colors = [
            { r: 120, g: 60, b: 180 },  // Viola spaziale
            { r: 80, g: 40, b: 120 },   // Indaco profondo
            { r: 60, g: 80, b: 140 },   // Blu ardesia
            { r: 100, g: 50, b: 100 },  // Viola scuro
            { r: 70, g: 90, b: 110 },   // Grigio bluastro
            { r: 90, g: 70, b: 130 },   // Viola medio
            { r: 50, g: 60, b: 100 },   // Blu scuro
            { r: 110, g: 80, b: 160 },  // Viola chiaro
            { r: 40, g: 50, b: 80 },    // Blu notte
            { r: 130, g: 90, b: 180 }   // Viola spaziale chiaro
        ];
        
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    initializePlanets() {
        this.planets = [];
        
        for (let i = 0; i < this.planetsCount; i++) {
            const planet = {
                x: Math.random() * this.width * 5 - this.width * 2.5,
                y: Math.random() * this.height * 5 - this.height * 2.5,
                size: Math.random() * 12 + 6, // Pianeti più grandi e variabili
                color: this.getPlanetColor(),
                secondaryColor: this.getPlanetColor(), // Colore secondario per dettagli
                opacity: Math.random() * 0.4 + 0.2, // Più visibili
                layer: Math.floor(Math.random() * 3) + 2, // Livelli intermedi
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: Math.random() * 0.008 + 0.003,
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 0.008 + 0.003,
                glow: Math.random() * 0.2 + 0.1, // Bagliore sottile
                rings: Math.random() > 0.7, // Alcuni pianeti hanno anelli
                ringSize: Math.random() * 0.3 + 0.2
            };
            
            this.planets.push(planet);
        }
    }
    
    initializeAsteroids() {
        this.asteroids = [];
        
        for (let i = 0; i < this.asteroidsCount; i++) {
            const asteroid = {
                x: Math.random() * this.width * 6 - this.width * 3,
                y: Math.random() * this.height * 6 - this.height * 3,
                size: Math.random() * 4 + 2, // Asteroidi più piccoli
                color: this.getAsteroidColor(),
                opacity: Math.random() * 0.6 + 0.3, // Più visibili
                layer: Math.floor(Math.random() * 2) + 1, // Livelli più vicini
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: Math.random() * 0.02 + 0.01,
                drift: Math.random() * Math.PI * 2, // Movimento di deriva
                driftSpeed: Math.random() * 0.01 + 0.005,
                shape: Math.random() > 0.5 ? 'irregular' : 'round', // Forme diverse
                twinkle: Math.random() * Math.PI * 2,
                twinkleSpeed: Math.random() * 0.03 + 0.01
            };
            
            this.asteroids.push(asteroid);
        }
    }
    
    getPlanetColor() {
        const colors = [
            '#4A4A4A', // Grigio scuro
            '#5C5C5C', // Grigio medio
            '#6B6B6B', // Grigio chiaro
            '#3A3A3A', // Grigio molto scuro
            '#7A7A7A', // Grigio chiaro
            '#2A2A2A', // Grigio quasi nero
            '#8B8B8B', // Grigio perla
            '#1A1A1A', // Grigio scuro profondo
            '#9A9A9A', // Grigio argento
            '#0A0A0A'  // Grigio quasi nero
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    getAsteroidColor() {
        const colors = [
            '#3A3A3A', // Grigio scuro
            '#4A4A4A', // Grigio medio scuro
            '#2A2A2A', // Grigio molto scuro
            '#5A5A5A', // Grigio medio
            '#1A1A1A', // Grigio scuro profondo
            '#6A6A6A', // Grigio chiaro
            '#0A0A0A', // Grigio quasi nero
            '#7A7A7A', // Grigio perla
            '#8A8A8A', // Grigio argento
            '#9A9A9A'  // Grigio chiaro
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    initializeStardust() {
        this.stardust = [];
        
        for (let i = 0; i < this.stardustCount; i++) {
            const dust = {
                x: Math.random() * this.width * 8 - this.width * 4,
                y: Math.random() * this.height * 8 - this.height * 4,
                size: Math.random() * 3 + 0.5, // Particelle più grandi
                speed: Math.random() * 0.8 + 0.2, // Velocità variabile
                direction: Math.random() * Math.PI * 2,
                opacity: Math.random() * 0.8 + 0.3, // Più visibili
                twinkle: Math.random() * Math.PI * 2,
                twinkleSpeed: Math.random() * 0.08 + 0.03,
                color: this.getStardustColor(), // Colori variabili
                trail: [], // Sistema di scia
                trailLength: Math.floor(Math.random() * 5) + 3,
                drift: Math.random() * Math.PI * 2, // Movimento di deriva
                driftSpeed: Math.random() * 0.02 + 0.01,
                glow: Math.random() * 0.4 + 0.1 // Intensità bagliore
            };
            
            this.stardust.push(dust);
        }
    }
    
    getStardustColor() {
        const colors = [
            '#ffffff', // Bianco puro
            '#f5f5f5', // Bianco sporco
            '#e8e8e8', // Grigio molto chiaro
            '#dcdcdc', // Grigio chiaro
            '#c0c0c0', // Argento
            '#a9a9a9', // Grigio scuro
            '#808080', // Grigio medio
            '#696969', // Grigio scuro
            '#2f2f2f', // Grigio molto scuro
            '#1a1a1a'  // Grigio quasi nero
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    initializeAuroras() {
        this.auroras = [];
        
        for (let i = 0; i < this.aurorasCount; i++) {
            const aurora = {
                x: Math.random() * this.width * 8 - this.width * 4,
                y: Math.random() * this.height * 8 - this.height * 4,
                width: Math.random() * 200 + 100,
                height: Math.random() * 300 + 150,
                color: this.getAuroraColor(),
                opacity: Math.random() * 0.4 + 0.1,
                layer: Math.floor(Math.random() * 3),
                wave: Math.random() * Math.PI * 2,
                waveSpeed: Math.random() * 0.02 + 0.01,
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 0.015 + 0.005
            };
            
            this.auroras.push(aurora);
        }
    }
    
    getAuroraColor() {
        const colors = [
            { r: 80, g: 120, b: 160 },  // Blu spaziale
            { r: 100, g: 80, b: 140 },  // Viola spaziale
            { r: 60, g: 100, b: 120 },  // Blu grigiastro
            { r: 120, g: 100, b: 180 }, // Viola medio
            { r: 40, g: 80, b: 100 },   // Blu scuro
            { r: 90, g: 70, b: 130 },   // Viola scuro
            { r: 70, g: 90, b: 110 },   // Grigio bluastro
            { r: 110, g: 90, b: 160 }   // Viola chiaro
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // Sistema di eventi dinamici
    createEvent() {
        const eventTypes = ['shooting_star', 'star_explosion', 'cosmic_dust'];
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        
        switch (eventType) {
            case 'shooting_star':
                this.createShootingStar();
                break;
            case 'star_explosion':
                this.createStarExplosion();
                break;
            case 'cosmic_dust':
                this.createCosmicDust();
                break;
        }
    }
    
    createShootingStar() {
        const shootingStar = {
            type: 'shooting_star',
            x: Math.random() * this.width,
            y: -20,
            vx: (Math.random() - 0.5) * 8,
            vy: Math.random() * 6 + 4,
            length: Math.random() * 50 + 30,
            brightness: Math.random() * 0.8 + 0.2,
            life: 120, // 2 secondi a 60fps
            maxLife: 120,
            trail: []
        };
        
        this.events.push(shootingStar);
    }
    
    createStarExplosion() {
        const explosion = {
            type: 'star_explosion',
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            radius: 0,
            maxRadius: Math.random() * 40 + 20,
            brightness: Math.random() * 0.6 + 0.4,
            life: 90, // 1.5 secondi
            maxLife: 90,
            particles: []
        };
        
        // Crea particelle per l'esplosione
        for (let i = 0; i < 8; i++) {
            explosion.particles.push({
                x: explosion.x,
                y: explosion.y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 60,
                maxLife: 60
            });
        }
        
        this.events.push(explosion);
    }
    
    createCosmicDust() {
        const dust = {
            type: 'cosmic_dust',
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            radius: Math.random() * 30 + 20,
            brightness: Math.random() * 0.4 + 0.2,
            life: 180, // 3 secondi
            maxLife: 180,
            pulse: Math.random() * Math.PI * 2
        };
        
        this.events.push(dust);
    }

    
    update(camera) {
        // Aggiorna ogni livello di stelle con movimento parallax naturale
        this.stars.forEach((layerStars, layerIndex) => {
            layerStars.forEach(star => {
                // Movimento parallax basato sulla velocità della camera
                const parallaxFactor = (layerIndex + 1) * 0.3; // Più lontano = meno movimento
                star.x -= camera.velocityX * parallaxFactor;
                star.y -= camera.velocityY * parallaxFactor;
                
                // Effetti di animazione
                star.twinkle += star.twinkleSpeed;
                star.pulse += star.pulseSpeed;
                
                // Riposiziona le stelle che escono dall'area estesa
                if (star.x < -this.width * 2) {
                    star.x = this.width * 2;
                    star.y = Math.random() * this.height * 4 - this.height * 2;
                }
                if (star.x > this.width * 2) {
                    star.x = -this.width * 2;
                    star.y = Math.random() * this.height * 4 - this.height * 2;
                }
                if (star.y < -this.height * 2) {
                    star.y = this.height * 2;
                    star.x = Math.random() * this.width * 4 - this.width * 2;
                }
                if (star.y > this.height * 2) {
                    star.y = -this.height * 2;
                    star.x = Math.random() * this.width * 4 - this.width * 2;
                }
            });
        });
        
        // Aggiorna le nebulose con effetti dinamici
        this.nebulae.forEach(nebula => {
            const parallaxFactor = (nebula.layer + 1) * 0.2;
            nebula.x -= camera.velocityX * parallaxFactor;
            nebula.y -= camera.velocityY * parallaxFactor;
            
            // Effetti di animazione
            nebula.pulse += nebula.pulseSpeed;
            nebula.wave += nebula.waveSpeed;
            nebula.rotation += nebula.rotationSpeed;
            
            // Riposiziona le nebulose
            if (nebula.x < -this.width * 3 - nebula.width) {
                nebula.x = this.width * 3;
                nebula.y = Math.random() * this.height * 6 - this.height * 3;
            }
            if (nebula.x > this.width * 3) {
                nebula.x = -this.width * 3 - nebula.width;
                nebula.y = Math.random() * this.height * 6 - this.height * 3;
            }
            if (nebula.y < -this.height * 3 - nebula.height) {
                nebula.y = this.height * 3;
                nebula.x = Math.random() * this.width * 6 - this.width * 3;
            }
            if (nebula.y > this.height * 3) {
                nebula.y = -this.height * 3 - nebula.height;
                nebula.x = Math.random() * this.width * 6 - this.width * 3;
            }
        });
        
        // Aggiorna i pianeti
        this.planets.forEach(planet => {
            const parallaxFactor = (planet.layer + 1) * 0.15;
            planet.x -= camera.velocityX * parallaxFactor;
            planet.y -= camera.velocityY * parallaxFactor;
            planet.rotation += planet.rotationSpeed;
            planet.pulse += planet.pulseSpeed;
        });
        
        // Aggiorna gli asteroidi
        this.asteroids.forEach(asteroid => {
            const parallaxFactor = (asteroid.layer + 1) * 0.25;
            asteroid.x -= camera.velocityX * parallaxFactor;
            asteroid.y -= camera.velocityY * parallaxFactor;
            asteroid.rotation += asteroid.rotationSpeed;
            asteroid.drift += asteroid.driftSpeed;
            asteroid.twinkle += asteroid.twinkleSpeed;
            
            // Movimento di deriva
            asteroid.x += Math.cos(asteroid.drift) * 0.2;
            asteroid.y += Math.sin(asteroid.drift) * 0.2;
            
            // Riposiziona gli asteroidi
            if (asteroid.x < -this.width * 3) asteroid.x = this.width * 3;
            if (asteroid.x > this.width * 3) asteroid.x = -this.width * 3;
            if (asteroid.y < -this.height * 3) asteroid.y = this.height * 3;
            if (asteroid.y > this.height * 3) asteroid.y = -this.height * 3;
        });
        
        // Aggiorna la polvere stellare con effetti avanzati
        this.stardust.forEach(dust => {
            // Movimento principale
            dust.x += Math.cos(dust.direction) * dust.speed;
            dust.y += Math.sin(dust.direction) * dust.speed;
            
            // Movimento di deriva
            dust.drift += dust.driftSpeed;
            dust.x += Math.cos(dust.drift) * 0.3;
            dust.y += Math.sin(dust.drift) * 0.3;
            
            // Effetti di animazione
            dust.twinkle += dust.twinkleSpeed;
            
            // Aggiorna la scia
            dust.trail.push({ x: dust.x, y: dust.y, alpha: dust.opacity });
            if (dust.trail.length > dust.trailLength) {
                dust.trail.shift();
            }
            
            // Riposiziona la polvere che esce dall'area
            if (dust.x < -this.width * 4) dust.x = this.width * 4;
            if (dust.x > this.width * 4) dust.x = -this.width * 4;
            if (dust.y < -this.height * 4) dust.y = this.height * 4;
            if (dust.y > this.height * 4) dust.y = -this.height * 4;
        });
        
        // Aggiorna le aurore
        this.auroras.forEach(aurora => {
            const parallaxFactor = (aurora.layer + 1) * 0.18;
            aurora.x -= camera.velocityX * parallaxFactor;
            aurora.y -= camera.velocityY * parallaxFactor;
            aurora.wave += aurora.waveSpeed;
            aurora.pulse += aurora.pulseSpeed;
        });
        
        // Aggiorna eventi dinamici
        this.updateEvents();
    }
    
    updateEvents() {
        // Crea nuovi eventi
        this.eventTimer++;
        if (this.eventTimer >= this.eventInterval && this.events.length < this.maxEvents) {
            this.createEvent();
            this.eventTimer = 0;
            this.eventInterval = 2000 + Math.random() * 4000; // 2-6 secondi
        }
        
        // Aggiorna eventi esistenti
        this.events = this.events.filter(event => {
            event.life--;
            
            switch (event.type) {
                case 'shooting_star':
                    event.x += event.vx;
                    event.y += event.vy;
                    
                    // Aggiungi alla scia
                    event.trail.push({ x: event.x, y: event.y });
                    if (event.trail.length > 10) {
                        event.trail.shift();
                    }
                    break;
                    
                case 'star_explosion':
                    event.radius += event.maxRadius / event.maxLife;
                    
                    // Aggiorna particelle
                    event.particles = event.particles.filter(particle => {
                        particle.x += particle.vx;
                        particle.y += particle.vy;
                        particle.life--;
                        return particle.life > 0;
                    });
                    break;
                    
                case 'cosmic_dust':
                    event.pulse += 0.1;
                    break;
            }
            
            return event.life > 0;
        });
    }
    
    draw(ctx, camera) {
        // Sfondo nero profondo
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Calcola offset per il parallax
        const offsetX = camera.x * 0.1;
        const offsetY = camera.y * 0.1;
        
        // Disegna le aurore (più lontane)
        this.auroras.forEach(aurora => {
            const layerOffsetX = offsetX * (aurora.layer + 1) * 0.3;
            const layerOffsetY = offsetY * (aurora.layer + 1) * 0.3;
            
            const screenX = aurora.x + layerOffsetX;
            const screenY = aurora.y + layerOffsetY;
            
            if (screenX < -aurora.width || screenX > ctx.canvas.width + aurora.width ||
                screenY < -aurora.height || screenY > ctx.canvas.height + aurora.height) {
                return;
            }
            
            const wave = Math.sin(aurora.wave) * 0.3 + 0.7;
            const pulse = Math.sin(aurora.pulse) * 0.2 + 0.8;
            const alpha = aurora.opacity * wave * pulse;
            
            ctx.save();
            ctx.globalAlpha = alpha;
            
            // Crea aurora come gradiente semplice
            const centerX = screenX + aurora.width / 2;
            const centerY = screenY + aurora.height / 2;
            const radius = Math.max(aurora.width, aurora.height) / 2;
            
            // Gradiente radiale semplice
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
            gradient.addColorStop(0, `rgba(${aurora.color.r}, ${aurora.color.g}, ${aurora.color.b}, 0.4)`);
            gradient.addColorStop(0.5, `rgba(${aurora.color.r}, ${aurora.color.g}, ${aurora.color.b}, 0.2)`);
            gradient.addColorStop(1, `rgba(${aurora.color.r}, ${aurora.color.g}, ${aurora.color.b}, 0)`);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        });
        
        // Disegna i pianeti con dettagli migliorati
        this.planets.forEach(planet => {
            const layerOffsetX = offsetX * (planet.layer + 1) * 0.2;
            const layerOffsetY = offsetY * (planet.layer + 1) * 0.2;
            
            const screenX = planet.x + layerOffsetX;
            const screenY = planet.y + layerOffsetY;
            
            if (screenX < -planet.size || screenX > ctx.canvas.width + planet.size ||
                screenY < -planet.size || screenY > ctx.canvas.height + planet.size) {
                return;
            }
            
            const pulse = Math.sin(planet.pulse) * 0.1 + 0.9;
            const alpha = planet.opacity * pulse;
            
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(screenX, screenY);
            ctx.rotate(planet.rotation);
            
            // Bagliore esterno
            if (planet.glow > 0) {
                ctx.globalAlpha = alpha * planet.glow;
                const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, planet.size * 1.5);
                glowGradient.addColorStop(0, `${planet.color}4D`); // Aggiunge trasparenza al colore hex
                glowGradient.addColorStop(1, `${planet.color}00`); // Completamente trasparente
                ctx.fillStyle = glowGradient;
                ctx.beginPath();
                ctx.arc(0, 0, planet.size * 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Pianeta principale con gradiente
            ctx.globalAlpha = alpha;
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, planet.size);
            gradient.addColorStop(0, planet.color);
            gradient.addColorStop(0.6, planet.secondaryColor);
            gradient.addColorStop(0.9, planet.color);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, planet.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Anelli per alcuni pianeti
            if (planet.rings) {
                ctx.globalAlpha = alpha * 0.6;
                ctx.strokeStyle = planet.secondaryColor;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, planet.size * (1 + planet.ringSize), 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(0, 0, planet.size * (1 + planet.ringSize * 1.5), 0, Math.PI * 2);
                ctx.stroke();
            }
            
            ctx.restore();
        });
        
        // Disegna gli asteroidi
        this.asteroids.forEach(asteroid => {
            const layerOffsetX = offsetX * (asteroid.layer + 1) * 0.3;
            const layerOffsetY = offsetY * (asteroid.layer + 1) * 0.3;
            
            const screenX = asteroid.x + layerOffsetX;
            const screenY = asteroid.y + layerOffsetY;
            
            if (screenX < -asteroid.size || screenX > ctx.canvas.width + asteroid.size ||
                screenY < -asteroid.size || screenY > ctx.canvas.height + asteroid.size) {
                return;
            }
            
            const twinkle = Math.sin(asteroid.twinkle) * 0.2 + 0.8;
            const alpha = asteroid.opacity * twinkle;
            
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(screenX, screenY);
            ctx.rotate(asteroid.rotation);
            
            if (asteroid.shape === 'irregular') {
                // Asteroide irregolare
                ctx.fillStyle = asteroid.color;
                ctx.beginPath();
                ctx.moveTo(asteroid.size, 0);
                ctx.lineTo(asteroid.size * 0.7, asteroid.size * 0.5);
                ctx.lineTo(asteroid.size * 0.3, asteroid.size * 0.8);
                ctx.lineTo(-asteroid.size * 0.2, asteroid.size * 0.6);
                ctx.lineTo(-asteroid.size * 0.5, asteroid.size * 0.2);
                ctx.lineTo(-asteroid.size * 0.3, -asteroid.size * 0.3);
                ctx.lineTo(asteroid.size * 0.2, -asteroid.size * 0.7);
                ctx.closePath();
                ctx.fill();
            } else {
                // Asteroide rotondo
                const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, asteroid.size);
                gradient.addColorStop(0, asteroid.color);
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(0, 0, asteroid.size, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        });
        
        // Disegna le nebulose con effetti di luce spettacolari
        this.nebulae.forEach(nebula => {
            const layerOffsetX = offsetX * (nebula.layer + 1) * 0.4;
            const layerOffsetY = offsetY * (nebula.layer + 1) * 0.4;
            
            const screenX = nebula.x + layerOffsetX;
            const screenY = nebula.y + layerOffsetY;
            
            if (screenX < -nebula.width || screenX > ctx.canvas.width + nebula.width ||
                screenY < -nebula.height || screenY > ctx.canvas.height + nebula.height) {
                return;
            }
            
            // Effetti combinati
            const pulse = Math.sin(nebula.pulse) * 0.3 + 0.7;
            const wave = Math.sin(nebula.wave) * 0.2 + 0.8;
            const alpha = nebula.opacity * pulse * wave;
            
            ctx.save();
            ctx.translate(screenX + nebula.width/2, screenY + nebula.height/2);
            ctx.rotate(nebula.rotation);
            ctx.translate(-nebula.width/2, -nebula.height/2);
            
            // Disegna la nebulosa come gradiente semplice e pulito
            const centerX = nebula.width / 2;
            const centerY = nebula.height / 2;
            const radius = Math.max(nebula.width, nebula.height) / 2;
            
            // Gradiente radiale semplice
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
            gradient.addColorStop(0, `rgba(${nebula.color.r}, ${nebula.color.g}, ${nebula.color.b}, 0.6)`);
            gradient.addColorStop(0.4, `rgba(${nebula.secondaryColor.r}, ${nebula.secondaryColor.g}, ${nebula.secondaryColor.b}, 0.4)`);
            gradient.addColorStop(0.7, `rgba(${nebula.color.r}, ${nebula.color.g}, ${nebula.color.b}, 0.2)`);
            gradient.addColorStop(1, `rgba(${nebula.color.r}, ${nebula.color.g}, ${nebula.color.b}, 0)`);
            
            ctx.globalAlpha = alpha;
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        });
        
        // Disegna la polvere stellare con effetti spettacolari
        this.stardust.forEach(dust => {
            const screenX = dust.x + offsetX * 0.1;
            const screenY = dust.y + offsetY * 0.1;
            
            if (screenX < -20 || screenX > ctx.canvas.width + 20 ||
                screenY < -20 || screenY > ctx.canvas.height + 20) {
                return;
            }
            
            const twinkle = Math.sin(dust.twinkle) * 0.4 + 0.6;
            const alpha = dust.opacity * twinkle;
            
            ctx.save();
            
            // Disegna la scia
            if (dust.trail.length > 1) {
                for (let i = 0; i < dust.trail.length - 1; i++) {
                    const trailAlpha = (i / dust.trail.length) * alpha * 0.3;
                    const trailSize = dust.size * (i / dust.trail.length);
                    
                    ctx.globalAlpha = trailAlpha;
                    ctx.fillStyle = dust.color;
                    ctx.beginPath();
                    ctx.arc(dust.trail[i].x + offsetX * 0.1, dust.trail[i].y + offsetY * 0.1, trailSize, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            
            // Particella principale
            ctx.globalAlpha = alpha;
            
            // Bagliore esterno
            if (dust.glow > 0) {
                ctx.globalAlpha = alpha * dust.glow;
                const glowGradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, dust.size * 3);
                glowGradient.addColorStop(0, `${dust.color}4D`); // Aggiunge trasparenza al colore hex
                glowGradient.addColorStop(1, `${dust.color}00`); // Completamente trasparente
                ctx.fillStyle = glowGradient;
                ctx.beginPath();
                ctx.arc(screenX, screenY, dust.size * 3, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Particella principale
            ctx.globalAlpha = alpha;
            const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, dust.size);
            gradient.addColorStop(0, dust.color);
            gradient.addColorStop(0.7, dust.color);
            gradient.addColorStop(1, `${dust.color}4D`); // Aggiunge trasparenza al colore hex
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(screenX, screenY, dust.size, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        });
        
        // Disegna ogni livello di stelle con effetti migliorati
        this.stars.forEach((layerStars, layerIndex) => {
            const layerOffsetX = offsetX * (layerIndex + 1);
            const layerOffsetY = offsetY * (layerIndex + 1);
            
            layerStars.forEach(star => {
                const screenX = star.x + layerOffsetX;
                const screenY = star.y + layerOffsetY;
                
                if (screenX < -50 || screenX > ctx.canvas.width + 50 ||
                    screenY < -50 || screenY > ctx.canvas.height + 50) {
                    return;
                }
                
                // Effetto scintillio sottile e naturale
                const twinkle = Math.sin(star.twinkle) * 0.1 + 0.9; // Effetto più sottile
                 const alpha = star.brightness * twinkle;
                
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.fillStyle = star.color;
                
                // Stella principale
                ctx.beginPath();
                ctx.arc(screenX, screenY, star.size, 0, Math.PI * 2);
                ctx.fill();
                
                // Alone sottile per stelle luminose
                if (star.brightness > 0.7) {
                    ctx.globalAlpha = alpha * 0.3;
                    ctx.beginPath();
                    ctx.arc(screenX, screenY, star.size * 1.8, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                ctx.restore();
            });
        });
        
        // Disegna eventi dinamici
        this.drawEvents(ctx, camera);
    }
    
    drawEvents(ctx, camera) {
        const offsetX = camera.x * 0.1;
        const offsetY = camera.y * 0.1;
        
        this.events.forEach(event => {
            const screenX = event.x + offsetX;
            const screenY = event.y + offsetY;
            
            switch (event.type) {
                case 'shooting_star':
                    this.drawShootingStar(ctx, event, screenX, screenY, offsetX, offsetY);
                    break;
                case 'star_explosion':
                    this.drawStarExplosion(ctx, event, screenX, screenY, offsetX, offsetY);
                    break;
                case 'cosmic_dust':
                    this.drawCosmicDust(ctx, event, screenX, screenY);
                    break;
            }
        });
    }
    
    drawShootingStar(ctx, event, screenX, screenY, offsetX, offsetY) {
        const alpha = (event.life / event.maxLife) * event.brightness;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        
        // Disegna la scia
        if (event.trail.length > 1) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(event.trail[0].x + offsetX, event.trail[0].y + offsetY);
            for (let i = 1; i < event.trail.length; i++) {
                const trailAlpha = (i / event.trail.length) * alpha;
                ctx.globalAlpha = trailAlpha;
                ctx.lineTo(event.trail[i].x + offsetX, event.trail[i].y + offsetY);
            }
            ctx.stroke();
        }
        
        // Disegna la stella
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(screenX, screenY, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Bagliore
        ctx.globalAlpha = alpha * 0.3;
        ctx.beginPath();
        ctx.arc(screenX, screenY, 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    drawStarExplosion(ctx, event, screenX, screenY, offsetX, offsetY) {
        const alpha = (event.life / event.maxLife) * event.brightness;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        
        // Disegna l'esplosione principale
        const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, event.radius);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 200, 100, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 100, 50, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(screenX, screenY, event.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Disegna le particelle
        event.particles.forEach(particle => {
            const particleAlpha = (particle.life / particle.maxLife) * alpha;
            ctx.globalAlpha = particleAlpha;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(particle.x + offsetX, particle.y + offsetY, 1, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.restore();
    }
    
    drawCosmicDust(ctx, event, screenX, screenY) {
        const alpha = (event.life / event.maxLife) * event.brightness;
        const pulse = Math.sin(event.pulse) * 0.3 + 0.7;
        
        ctx.save();
        ctx.globalAlpha = alpha * pulse;
        
        const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, event.radius);
        gradient.addColorStop(0, 'rgba(200, 200, 255, 0.3)');
        gradient.addColorStop(0.5, 'rgba(150, 150, 200, 0.2)');
        gradient.addColorStop(1, 'rgba(100, 100, 150, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(screenX, screenY, event.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    // Metodo per aggiornare le dimensioni quando la finestra cambia
    updateSize(width, height) {
        this.width = width;
        this.height = height;
        this.initializeStars(); // Rigenera le stelle per le nuove dimensioni
    }
}
