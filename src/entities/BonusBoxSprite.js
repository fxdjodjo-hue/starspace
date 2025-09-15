// Modulo per gestire lo sprite sheet delle bonus box usando l'atlas
export class BonusBoxSprite {
    constructor() {
        this.image = null;
        this.isLoaded = false;
        this.atlas = null;
        this.atlasLoaded = false;
        this.totalFrames = 64; // 64 frames totali dall'atlas
        this.currentFrame = 0;
        this.animationSpeed = 0.1; // Velocità animazione
        this.animationTime = 0;
    }
    
    // Carica l'immagine e l'atlas
    load() {
        // Carica l'immagine
        this.image = new Image();
        this.image.src = 'bonusbox.png';
        
        this.image.onload = () => {
            this.isLoaded = true;
            // console.log('🎁 Bonus box sprite sheet caricato con successo!');
            // console.log(`📊 Dimensioni immagine: ${this.image.width}x${this.image.height}`);
        };
        
        this.image.onerror = () => {
            console.log('🔇 Errore caricamento bonus box sprite sheet');
        };
        
        // Carica l'atlas
        this.loadAtlas();
    }
    
    // Carica e parsa l'atlas
    loadAtlas() {
        fetch('bonusbox.atlas')
            .then(response => response.text())
            .then(data => {
                this.parseAtlas(data);
                this.atlasLoaded = true;
                // console.log('📋 Atlas bonus box caricato con successo!');
                // console.log(`📊 Frames nell'atlas: ${this.atlas.length}`);
            })
            .catch(error => {
                console.log('🔇 Errore caricamento atlas bonus box:', error);
            });
    }
    
    // Parsa il contenuto dell'atlas
    parseAtlas(atlasData) {
        this.atlas = [];
        const lines = atlasData.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.startsWith('Comp 1')) {
                // Cerca le proprietà del frame
                const frame = {};
                
                // Leggi le prossime righe per questo frame
                for (let j = i + 1; j < i + 6 && j < lines.length; j++) {
                    const propLine = lines[j].trim();
                    
                    if (propLine.startsWith('xy:')) {
                        const coords = propLine.split(':')[1].split(',').map(n => parseInt(n.trim()));
                        frame.x = coords[0];
                        frame.y = coords[1];
                    } else if (propLine.startsWith('size:')) {
                        const size = propLine.split(':')[1].split(',').map(n => parseInt(n.trim()));
                        frame.width = size[0];
                        frame.height = size[1];
                    } else if (propLine.startsWith('index:')) {
                        frame.index = parseInt(propLine.split(':')[1].trim());
                    }
                }
                
                if (frame.x !== undefined && frame.y !== undefined && frame.width !== undefined && frame.height !== undefined) {
                    this.atlas.push(frame);
                }
            }
        }
        
        // Ordina i frame per index
        this.atlas.sort((a, b) => a.index - b.index);
    }
    
    // Aggiorna l'animazione
    update() {
        if (!this.isLoaded || !this.atlasLoaded) return;
        
        this.animationTime += this.animationSpeed;
        this.currentFrame = Math.floor(this.animationTime) % this.totalFrames;
    }
    
    // Disegna il frame corrente usando l'atlas
    draw(ctx, x, y, size, rotation = 0) {
        if (!this.isLoaded || !this.atlasLoaded || !this.image || !this.atlas) {
            return;
        }
        
        // Ottieni il frame corrente dall'atlas
        const frame = this.atlas[this.currentFrame];
        if (!frame) {
            console.log(`🔇 Frame ${this.currentFrame} non trovato nell'atlas`);
            return;
        }
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        
        // Disegna il frame usando le coordinate dell'atlas
        ctx.drawImage(
            this.image,
            frame.x, frame.y, frame.width, frame.height,
            -size/2, -size/2, size, size
        );
        
        ctx.restore();
    }
}