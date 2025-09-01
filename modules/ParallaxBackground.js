// Sistema di sfondo parallax con stelle
export class ParallaxBackground {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.stars = [];
        this.parallaxLayers = 3; // 3 livelli di profondità
        this.starsPerLayer = 150; // Numero di stelle per livello
        
        this.initializeStars();
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
    }
    
    draw(ctx, camera) {
        // Sfondo nero
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Calcola offset per il parallax (non influenzato dallo zoom)
        const offsetX = camera.x * 0.1;
        const offsetY = camera.y * 0.1;
        
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
