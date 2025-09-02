// Sistema di sfondo parallax con stelle
export class ParallaxBackground {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.stars = [];
        this.nebulae = [];

        this.parallaxLayers = 3; // 3 livelli di profondità
        this.starsPerLayer = 150; // Numero di stelle per livello
        this.nebulaeCount = 80; // Numero di nebulose per coprire tutta la mappa
        
        this.initializeStars();
        this.initializeNebulae();

    }
    
    initializeStars() {
        this.stars = [];
        
        // Crea stelle per ogni livello di parallax
        for (let layer = 0; layer < this.parallaxLayers; layer++) {
            const layerStars = [];
            
            for (let i = 0; i < this.starsPerLayer; i++) {
                const star = {
                    x: Math.random() * this.width * 2 - this.width, // Estende oltre i bordi
                    y: Math.random() * this.height * 2 - this.height,
                    size: Math.random() * 2 + 0.5, // Dimensione variabile
                    brightness: Math.random() * 0.8 + 0.2, // Luminosità variabile
                    layer: layer,
                    speed: (layer + 1) * 0.1, // Velocità diversa per ogni livello
                                         twinkle: Math.random() * Math.PI * 2, // Per effetto scintillio
                     twinkleSpeed: Math.random() * 0.02 + 0.01 // Più lento e sottile
                };
                
                layerStars.push(star);
            }
            
            this.stars.push(layerStars);
        }
    }
    
    initializeNebulae() {
        this.nebulae = [];
        
        for (let i = 0; i < this.nebulaeCount; i++) {
            const nebula = {
                x: Math.random() * this.width * 8 - this.width * 4, // Estende molto oltre i bordi per coprire tutta la mappa
                y: Math.random() * this.height * 8 - this.height * 4,
                width: Math.random() * 300 + 200, // Larghezza variabile
                height: Math.random() * 200 + 150, // Altezza variabile
                color: this.getRandomNebulaColor(),
                opacity: Math.random() * 0.3 + 0.1, // Opacità variabile
                layer: Math.floor(Math.random() * 3), // Livello di profondità
                speed: (Math.random() * 0.05 + 0.02), // Velocità di movimento
                pulse: Math.random() * Math.PI * 2, // Per effetto pulsante
                pulseSpeed: Math.random() * 0.01 + 0.005
            };
            
            this.nebulae.push(nebula);
        }
    }
    
    getRandomNebulaColor() {
        const colors = [
            { r: 138, g: 43, b: 226 }, // Viola
            { r: 75, g: 0, b: 130 },   // Indaco
            { r: 25, g: 25, b: 112 },  // Blu scuro
            { r: 72, g: 61, b: 139 },  // Blu ardesia
            { r: 106, g: 90, b: 205 }, // Viola medio
            { r: 123, g: 104, b: 238 }, // Viola chiaro
            { r: 147, g: 112, b: 219 }, // Viola medio
            { r: 186, g: 85, b: 211 }   // Viola orchidea
        ];
        
        return colors[Math.floor(Math.random() * colors.length)];
    }
    

    
    update(camera) {
        // Aggiorna ogni livello di stelle
        this.stars.forEach((layerStars, layerIndex) => {
            layerStars.forEach(star => {
                // Movimento parallax basato sulla velocità della camera
                const parallaxFactor = (layerIndex + 1) * 0.3; // Più lontano = meno movimento
                star.x -= camera.velocityX * parallaxFactor;
                star.y -= camera.velocityY * parallaxFactor;
                
                // Effetto scintillio
                star.twinkle += star.twinkleSpeed;
                
                // Riposiziona le stelle che escono dallo schermo
                if (star.x < -this.width) {
                    star.x = this.width;
                    star.y = Math.random() * this.height * 2 - this.height;
                }
                if (star.x > this.width) {
                    star.x = -this.width;
                    star.y = Math.random() * this.height * 2 - this.height;
                }
                if (star.y < -this.height) {
                    star.y = this.height;
                    star.x = Math.random() * this.width * 2 - this.width;
                }
                if (star.y > this.height) {
                    star.y = -this.height;
                    star.x = Math.random() * this.width * 2 - this.width;
                }
            });
        });
        
        // Aggiorna le nebulose
        this.nebulae.forEach(nebula => {
            // Movimento parallax basato sulla velocità della camera
            const parallaxFactor = (nebula.layer + 1) * 0.2; // Più lontano = meno movimento
            nebula.x -= camera.velocityX * parallaxFactor;
            nebula.y -= camera.velocityY * parallaxFactor;
            
            // Effetto pulsante
            nebula.pulse += nebula.pulseSpeed;
            
            // Riposiziona le nebulose che escono dall'area estesa
            if (nebula.x < -this.width * 4 - nebula.width) {
                nebula.x = this.width * 4;
                nebula.y = Math.random() * this.height * 8 - this.height * 4;
            }
            if (nebula.x > this.width * 4) {
                nebula.x = -this.width * 4 - nebula.width;
                nebula.y = Math.random() * this.height * 8 - this.height * 4;
            }
            if (nebula.y < -this.height * 4 - nebula.height) {
                nebula.y = this.height * 4;
                nebula.x = Math.random() * this.width * 8 - this.width * 4;
            }
            if (nebula.y > this.height * 4) {
                nebula.y = -this.height * 4 - nebula.height;
                nebula.x = Math.random() * this.width * 8 - this.width * 4;
            }
        });
    }
    
    draw(ctx, camera) {
        // Sfondo nero
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Calcola offset per il parallax (non influenzato dallo zoom)
        const offsetX = camera.x * 0.1;
        const offsetY = camera.y * 0.1;
        
        // Disegna le nebulose (dietro alle stelle)
        this.nebulae.forEach(nebula => {
            const layerOffsetX = offsetX * (nebula.layer + 1) * 0.5;
            const layerOffsetY = offsetY * (nebula.layer + 1) * 0.5;
            
            const screenX = nebula.x + layerOffsetX;
            const screenY = nebula.y + layerOffsetY;
            
            // Controlla se la nebulosa è visibile
            if (screenX < -nebula.width || screenX > ctx.canvas.width + nebula.width ||
                screenY < -nebula.height || screenY > ctx.canvas.height + nebula.height) {
                return;
            }
            
            // Calcola opacità con effetto pulsante
            const pulse = Math.sin(nebula.pulse) * 0.1 + 0.9;
            const alpha = nebula.opacity * pulse;
            
            ctx.save();
            ctx.globalAlpha = alpha;
            
            // Crea gradiente per la nebulosa
            const gradient = ctx.createRadialGradient(
                screenX + nebula.width/2, screenY + nebula.height/2, 0,
                screenX + nebula.width/2, screenY + nebula.height/2, Math.max(nebula.width, nebula.height)/2
            );
            
            gradient.addColorStop(0, `rgba(${nebula.color.r}, ${nebula.color.g}, ${nebula.color.b}, 0.8)`);
            gradient.addColorStop(0.5, `rgba(${nebula.color.r}, ${nebula.color.g}, ${nebula.color.b}, 0.3)`);
            gradient.addColorStop(1, `rgba(${nebula.color.r}, ${nebula.color.g}, ${nebula.color.b}, 0)`);
            
            ctx.fillStyle = gradient;
            ctx.fillRect(screenX, screenY, nebula.width, nebula.height);
            
            ctx.restore();
        });
        
        // Disegna ogni livello di stelle
        this.stars.forEach((layerStars, layerIndex) => {
            const layerOffsetX = offsetX * (layerIndex + 1);
            const layerOffsetY = offsetY * (layerIndex + 1);
            
            layerStars.forEach(star => {
                const screenX = star.x + layerOffsetX;
                const screenY = star.y + layerOffsetY;
                
                // Controlla se la stella è visibile
                if (screenX < -50 || screenX > ctx.canvas.width + 50 ||
                    screenY < -50 || screenY > ctx.canvas.height + 50) {
                    return;
                }
                
                                 // Calcola luminosità con effetto scintillio più sottile
                 const twinkle = Math.sin(star.twinkle) * 0.1 + 0.9; // Meno variazione
                 const alpha = star.brightness * twinkle;
                
                // Colore basato sul livello (più lontano = più blu)
                const colors = [
                    '#ffffff', // Livello 1: bianco puro
                    '#e6f3ff', // Livello 2: bianco bluastro
                    '#b3d9ff'  // Livello 3: blu chiaro
                ];
                
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.fillStyle = colors[layerIndex] || '#ffffff';
                
                // Disegna la stella
                ctx.beginPath();
                ctx.arc(screenX, screenY, star.size, 0, Math.PI * 2);
                ctx.fill();
                
                // Aggiungi un piccolo alone per le stelle più luminose
                if (star.brightness > 0.7) {
                    ctx.globalAlpha = alpha * 0.3;
                    ctx.beginPath();
                    ctx.arc(screenX, screenY, star.size * 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                ctx.restore();
            });
        });
    }
    
    // Metodo per aggiornare le dimensioni quando la finestra cambia
    updateSize(width, height) {
        this.width = width;
        this.height = height;
        this.initializeStars(); // Rigenera le stelle per le nuove dimensioni
    }
}
