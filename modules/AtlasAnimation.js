// Modulo per gestire animazioni basate su atlas
export class AtlasAnimation {
    constructor(atlasData, texturePath, frameWidth, frameHeight) {
        this.atlasData = atlasData;
        this.texturePath = texturePath;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.texture = null;
        this.frames = [];
        this.currentFrame = 0;
        this.frameTime = 0;
        this.frameDuration = 50; // ms per frame
        this.isPlaying = false;
        this.loop = false;
        this.onComplete = null;
        
        this.loadTexture();
        this.parseAtlas();
    }
    
    // Carica la texture
    loadTexture() {
        this.texture = new Image();
        this.texture.src = this.texturePath;
    }
    
    // Parsa i dati dell'atlas per estrarre le coordinate dei frame
    parseAtlas() {
        const lines = this.atlasData.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Cerca le righe che contengono le coordinate xy
            if (line.startsWith('xy:')) {
                const coords = line.split('xy: ')[1].split(', ');
                const x = parseInt(coords[0]);
                const y = parseInt(coords[1]);
                
                this.frames.push({
                    x: x,
                    y: y,
                    width: this.frameWidth,
                    height: this.frameHeight
                });
            }
        }
        
    }
    
    // Avvia l'animazione
    play(loop = false, onComplete = null) {
        this.isPlaying = true;
        this.loop = loop;
        this.onComplete = onComplete;
        this.currentFrame = 0;
        this.frameTime = 0;
    }
    
    // Ferma l'animazione
    stop() {
        this.isPlaying = false;
        this.currentFrame = 0;
        this.frameTime = 0;
    }
    
    // Aggiorna l'animazione
    update(deltaTime) {
        if (!this.isPlaying || this.frames.length === 0) return;
        
        this.frameTime += deltaTime;
        
        if (this.frameTime >= this.frameDuration) {
            this.frameTime = 0;
            this.currentFrame++;
            
            if (this.currentFrame >= this.frames.length) {
                if (this.loop) {
                    this.currentFrame = 0;
                } else {
                    this.isPlaying = false;
                    if (this.onComplete) {
                        this.onComplete();
                    }
                }
            }
        }
    }
    
    // Disegna il frame corrente
    draw(ctx, x, y, width, height, rotation = 0) {
        if (!this.isPlaying || this.frames.length === 0 || !this.texture) return;
        
        const frame = this.frames[this.currentFrame];
        
        ctx.save();
        
        if (rotation !== 0) {
            ctx.translate(x + width / 2, y + height / 2);
            ctx.rotate(rotation);
            ctx.translate(-width / 2, -height / 2);
            x = 0;
            y = 0;
        }
        
        ctx.drawImage(
            this.texture,
            frame.x, frame.y, frame.width, frame.height,
            x, y, width, height
        );
        
        ctx.restore();
    }
    
    // Controlla se l'animazione è completata
    isComplete() {
        return !this.isPlaying && this.currentFrame >= this.frames.length - 1;
    }
}
