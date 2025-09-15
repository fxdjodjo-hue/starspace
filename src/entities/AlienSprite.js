// Modulo Sprite Alieno Barracuda
export class AlienSprite {
    constructor() {
        this.atlas = null;
        this.frames = [];
        this.currentFrame = 0;
        this.frameTimer = 0;
        this.frameRate = 10; // Cambia frame ogni 10 frame (60 FPS)
        this.loaded = false;
    }
    
    async load() {
        try {

            
            // Carica l'atlas
            const atlasResponse = await fetch('./alien60.atlas');
            if (!atlasResponse.ok) {
                throw new Error(`Errore caricamento atlas: ${atlasResponse.status}`);
            }
            const atlasText = await atlasResponse.text();

            
            // Carica l'immagine
            const image = new Image();
            image.src = './alien60.png';
            
            await new Promise((resolve, reject) => {
                image.onload = () => {
                    resolve();
                };
                image.onerror = (error) => {
                    console.error('❌ Errore caricamento immagine:', error);
                    reject(error);
                };
            });
            
            this.atlas = image;
            this.parseAtlas(atlasText);
            this.loaded = true;
            

            
        } catch (error) {
            console.error('❌ Errore caricamento alien sprite:', error);
            this.loaded = false;
        }
    }
    
    parseAtlas(atlasText) {
        const lines = atlasText.split('\n');
        let currentFrame = null;
        
        for (let line of lines) {
            line = line.trim();
            
            if (line.endsWith('.png')) {
                // Salta la riga dell'immagine
                continue;
            } else if (line.startsWith('size:') && !currentFrame) {
                // Salta le informazioni di dimensione dell'atlas (non del frame)
                continue;
            } else if (line.startsWith('format:') || line.startsWith('filter:') || line.startsWith('repeat:')) {
                // Salta le altre informazioni
                continue;
            } else if (line.match(/^[A-Z0-9]+$/)) {
                // Nome del frame (es. BARRA0000)
                if (currentFrame) {
                    this.frames.push(currentFrame);
                }
                currentFrame = { name: line };
            } else if (line.startsWith('rotate:')) {
                currentFrame.rotate = line.split(':')[1].trim() === 'true';
            } else if (line.startsWith('xy:')) {
                const coords = line.split(':')[1].trim().split(',');
                currentFrame.x = parseInt(coords[0]);
                currentFrame.y = parseInt(coords[1]);
            } else if (line.startsWith('size:')) {
                const coords = line.split(':')[1].trim().split(',');
                currentFrame.width = parseInt(coords[0]);
                currentFrame.height = parseInt(coords[1]);
            } else if (line.startsWith('orig:')) {
                const coords = line.split(':')[1].trim().split(',');
                currentFrame.origWidth = parseInt(coords[0]);
                currentFrame.origHeight = parseInt(coords[1]);
            } else if (line.startsWith('offset:')) {
                const coords = line.split(':')[1].trim().split(',');
                currentFrame.offsetX = parseInt(coords[0]);
                currentFrame.offsetY = parseInt(coords[1]);
            }
        }
        
        // Aggiungi l'ultimo frame
        if (currentFrame) {
            this.frames.push(currentFrame);
        }
        

    }
    
    update() {
        if (!this.loaded) return;
        
        // Non animare - usa sempre il primo frame (come il player)
        this.currentFrame = 0;
    }
    
    draw(ctx, x, y, rotation = 0, scale = 1) {
        if (!this.loaded || this.frames.length === 0) {
            // Fallback: disegna un cerchio semplice
            ctx.fillStyle = '#ff4444';
            ctx.beginPath();
            ctx.arc(x, y, 15, 0, Math.PI * 2);
            ctx.fill();
            return;
        }
        
        // Calcola il frame corretto basandosi sulla rotazione (come ShipSprite)
        const frameIndex = this.getFrameFromRotation(rotation);
        const frame = this.frames[frameIndex];
        
        if (!frame) {
            return;
        }
        
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        
        // Disegna il frame dall'atlas (senza rotazione, il frame è già orientato)
        ctx.drawImage(
            this.atlas,
            frame.x, frame.y, frame.width, frame.height,
            -frame.width / 2, -frame.height / 2, frame.width, frame.height
        );
        
        ctx.restore();
    }
    
    getFrameCount() {
        return this.frames.length;
    }
    
    setFrame(frameIndex) {
        if (frameIndex >= 0 && frameIndex < this.frames.length) {
            this.currentFrame = frameIndex;
        }
    }
    
    // Calcola il frame corretto basandosi sulla rotazione (come ShipSprite)
    getFrameFromRotation(rotation) {
        if (!this.loaded) return 0;
        
        // Inverte la rotazione per correggere l'orientamento
        let invertedRotation = -rotation;
        
        // Normalizza la rotazione tra 0 e 2π
        let normalizedRotation = invertedRotation % (2 * Math.PI);
        if (normalizedRotation < 0) normalizedRotation += 2 * Math.PI;
        
        // Converte la rotazione in un indice del frame (0-71)
        // 72 frame totali per 360 gradi
        const frameIndex = Math.floor((normalizedRotation / (2 * Math.PI)) * this.frames.length);
        
        return Math.min(frameIndex, this.frames.length - 1);
    }
    
    getCurrentFrame() {
        return this.currentFrame;
    }
}
