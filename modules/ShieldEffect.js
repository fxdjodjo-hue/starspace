// Modulo Effetto Scudo
export class ShieldEffect {
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
            console.log('🛡️ Tentativo di caricamento shield effect...');
            
            // Carica il file atlas
            const atlasResponse = await fetch('shieldrestore/shieldrestore.atlas');
            const atlasText = await atlasResponse.text();
            console.log('📄 Atlas shield caricato, testo:', atlasText.substring(0, 200) + '...');
            
            // Carica l'immagine
            this.image = new Image();
            this.image.onload = () => {
                console.log('🖼️ Immagine shield caricata:', this.image.width, 'x', this.image.height);
                this.parseAtlas(atlasText);
                this.loaded = true;
                console.log('🛡️ Shield effect caricato con successo!');
                console.log(`📊 Parsed ${this.frames.length} frames from shield atlas`);
            };
            this.image.src = 'shieldrestore/shieldstore.png';
            
        } catch (error) {
            console.error('❌ Errore caricamento shield effect:', error);
            this.loaded = false;
        }
    }
    
    parseAtlas(atlasText) {
        const lines = atlasText.split('\n');
        let currentFrame = null;
        let currentImage = 'shieldstore.png'; // Solo la prima immagine per ora
        
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
                if (currentImage === 'shieldrestore.png') {
                    if (currentFrame) {
                        this.frames.push(currentFrame);
                    }
                    currentFrame = { name: line };
                }
            } else if (line.startsWith('xy:')) {
                const coords = line.split(':')[1].split(',').map(n => parseInt(n.trim()));
                if (currentFrame && currentImage === 'shieldrestore.png') {
                    currentFrame.x = coords[0];
                    currentFrame.y = coords[1];
                }
            } else if (line.startsWith('size:')) {
                const size = line.split(':')[1].split(',').map(n => parseInt(n.trim()));
                if (currentFrame && currentImage === 'shieldrestore.png') {
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
        
        console.log(`📊 Parsed ${this.frames.length} frames from shield atlas`);
        console.log('🛡️ Primi 3 frame:', this.frames.slice(0, 3));
        console.log('🛡️ Ultimi 3 frame:', this.frames.slice(-3));
    }
    
    update() {
        if (!this.loaded) return;
        
        this.animationTimer += this.animationSpeed;
        if (this.animationTimer >= 1) {
            this.animationTimer = 0;
            this.currentFrame = (this.currentFrame + 1) % this.frames.length;
            console.log(`🛡️ ShieldEffect: Frame aggiornato a ${this.currentFrame}/${this.frames.length}`);
        }
    }
    
    reset() {
        this.currentFrame = 0;
        this.animationTimer = 0;
    }
    
    draw(ctx, x, y, scale = 1) {
        if (!this.loaded || this.frames.length === 0) {
            console.log('🛡️ ShieldEffect: Non caricato o nessun frame');
            return;
        }
        
        const frame = this.frames[this.currentFrame];
        if (!frame) {
            console.log('🛡️ ShieldEffect: Frame non trovato:', this.currentFrame);
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