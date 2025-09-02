// Modulo Effetto Riparazione
export class RepairEffect {
    constructor() {
        this.atlas = null;
        this.image = null;
        this.loaded = false;
        this.frames = [];
        this.currentFrame = 0;
        this.animationSpeed = 0.2; // Velocità animazione
        this.animationTimer = 0;
    }
    
    async load() {
        try {
            // Carica il file atlas
            const atlasResponse = await fetch('hprestore/hprestore.atlas');
            const atlasText = await atlasResponse.text();
            
            // Carica l'immagine
            this.image = new Image();
            this.image.onload = () => {
                this.parseAtlas(atlasText);
                this.loaded = true;
            };
            this.image.src = 'hprestore/hprestore.png';
            
        } catch (error) {
            console.error('❌ Errore caricamento repair effect:', error);
            this.loaded = false;
        }
    }
    
    parseAtlas(atlasText) {
        const lines = atlasText.split('\n');
        let currentFrame = null;
        let currentImage = 'hprestore.png'; // Solo la prima immagine per ora
        
        for (let line of lines) {
            line = line.trim();
            
            if (line.endsWith('.png')) {
                // Nuova immagine - cambia la corrente
                currentImage = line;
                continue;
            } else if (line.startsWith('size:') && !currentFrame) {
                // Dimensione atlas - ignora solo se non siamo in un frame
                continue;
            } else if (line.startsWith('format:') || line.startsWith('filter:') || line.startsWith('repeat:')) {
                // Metadati - ignora
                continue;
            } else if (line && !line.includes(':')) {
                // Nome frame - solo se siamo nella prima immagine
                if (currentImage === 'hprestore.png') {
                    if (currentFrame) {
                        this.frames.push(currentFrame);
                    }
                    currentFrame = { name: line };
                }
            } else if (line.startsWith('xy:')) {
                const coords = line.split(':')[1].split(',').map(n => parseInt(n.trim()));
                if (currentFrame && currentImage === 'hprestore.png') {
                    currentFrame.x = coords[0];
                    currentFrame.y = coords[1];
                }
            } else if (line.startsWith('size:')) {
                const size = line.split(':')[1].split(',').map(n => parseInt(n.trim()));
                if (currentFrame && currentImage === 'hprestore.png') {
                    currentFrame.width = size[0];
                    currentFrame.height = size[1];
                }
            } else if (line.startsWith('orig:')) {
                // Origine - ignora
                continue;
            } else if (line.startsWith('offset:')) {
                // Offset - ignora
                continue;
            } else if (line.startsWith('index:')) {
                // Index - ignora
                continue;
            } else if (line.startsWith('rotate:')) {
                // Rotazione - ignora
                continue;
            }
        }
        
        // Aggiungi l'ultimo frame
        if (currentFrame) {
            this.frames.push(currentFrame);
        }
        

    }
    
    update() {
        if (!this.loaded) return;
        
        this.animationTimer += this.animationSpeed;
        if (this.animationTimer >= 1) {
            this.animationTimer = 0;
            this.currentFrame = (this.currentFrame + 1) % this.frames.length;
        }
    }
    
    reset() {
        this.currentFrame = 0;
        this.animationTimer = 0;
    }
    
    draw(ctx, x, y, scale = 1) {
        if (!this.loaded || this.frames.length === 0) {
            return;
        }
        
        const frame = this.frames[this.currentFrame];
        if (!frame) {
            return;
        }
        
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        
        // Disegna l'immagine
        ctx.drawImage(
            this.image,
            frame.x, frame.y, frame.width, frame.height,
            -frame.width / 2, -frame.height / 2, frame.width, frame.height
        );
        ctx.restore();
    }
}
