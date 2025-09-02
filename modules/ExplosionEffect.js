export class ExplosionEffect {
    constructor() {
        this.image = new Image();
        this.frames = [];
        this.currentFrame = 0;
        this.frameTime = 0;
        this.frameDelay = 100; // 100ms per frame (10 FPS)
        this.loaded = false;
        this.playing = false;
        this.loop = false;
        this.explosions = []; // Array per gestire multiple esplosioni
    }

    async load() {
        try {
            // Carica l'atlas
            const atlasResponse = await fetch('explosion_effect/explosion.atlas');
            const atlasText = await atlasResponse.text();
            
            // Carica l'immagine
            this.image.src = 'explosion_effect/explosion.png';
            
            return new Promise((resolve, reject) => {
                this.image.onload = () => {
                    this.parseAtlas(atlasText);
                    this.loaded = true;
                    resolve();
                };
                
                this.image.onerror = (error) => {
                    reject(error);
                };
            });
        } catch (error) {
            console.error('Errore caricamento explosion effect:', error);
        }
    }

    parseAtlas(atlasText) {
        const lines = atlasText.split('\n');
        let currentFrame = null;
        let currentImage = 'explosion.png';

        for (const line of lines) {
            const trimmedLine = line.trim();
            
            if (trimmedLine === 'explosion.png') {
                currentImage = 'explosion.png';
                continue;
            } else if (trimmedLine.startsWith('size:') && !currentFrame) {
                // Dimensione atlas - ignora solo se non siamo in un frame
                continue;
            } else if (trimmedLine.startsWith('format:') || trimmedLine.startsWith('filter:') || trimmedLine.startsWith('repeat:')) {
                // Metadati - ignora
                continue;
            } else if (trimmedLine && !trimmedLine.includes(':')) {
                // Nome frame - solo se siamo nella prima immagine
                if (currentImage === 'explosion.png') {
                    if (currentFrame) {
                        this.frames.push(currentFrame);
                    }
                    currentFrame = { name: trimmedLine };
                }
            } else if (trimmedLine.startsWith('xy:')) {
                const coords = trimmedLine.split(':')[1].split(',').map(n => parseInt(n.trim()));
                if (currentFrame && currentImage === 'explosion.png') {
                    currentFrame.x = coords[0];
                    currentFrame.y = coords[1];
                }
            } else if (trimmedLine.startsWith('size:')) {
                const size = trimmedLine.split(':')[1].split(',').map(n => parseInt(n.trim()));
                if (currentFrame && currentImage === 'explosion.png') {
                    currentFrame.width = size[0];
                    currentFrame.height = size[1];
                }
            } else if (trimmedLine.startsWith('orig:')) {
                // Origine - ignora
                continue;
            } else if (trimmedLine.startsWith('offset:')) {
                // Offset - ignora
                continue;
            } else if (trimmedLine.startsWith('index:')) {
                // Index - ignora
                continue;
            } else if (trimmedLine.startsWith('rotate:')) {
                // Rotate - ignora
                continue;
            }
        }

        // Aggiungi l'ultimo frame se esiste
        if (currentFrame) {
            this.frames.push(currentFrame);
        }
    }

    play(x, y, loop = false) {
        if (!this.loaded || this.frames.length === 0) return;
        
        this.x = x;
        this.y = y;
        this.currentFrame = 0;
        this.frameTime = 0;
        this.playing = true;
        this.loop = loop;
    }

    createExplosion(x, y, type = 'normal') {
        if (!this.loaded || this.frames.length === 0) return;
        
        const explosion = {
            x: x,
            y: y,
            currentFrame: 0,
            frameTime: 0,
            playing: true,
            type: type
        };
        
        this.explosions.push(explosion);
    }

    stop() {
        this.playing = false;
        this.currentFrame = 0;
        this.frameTime = 0;
    }

    update() {
        if (!this.loaded || this.frames.length === 0) return;

        // Aggiorna esplosione singola (per compatibilità)
        if (this.playing) {
            this.frameTime++;
            
            if (this.frameTime >= 3) { // 3 frame a 60 FPS = 50ms
                this.frameTime = 0;
                this.currentFrame++;
                
                if (this.currentFrame >= this.frames.length) {
                    if (this.loop) {
                        this.currentFrame = 0;
                    } else {
                        this.playing = false;
                        this.currentFrame = 0;
                    }
                }
            }
        }

        // Aggiorna tutte le esplosioni multiple
        this.explosions = this.explosions.filter(explosion => {
            explosion.frameTime++;
            
            if (explosion.frameTime >= 3) { // 3 frame a 60 FPS = 50ms
                explosion.frameTime = 0;
                explosion.currentFrame++;
                
                if (explosion.currentFrame >= this.frames.length) {
                    return false; // Rimuovi l'esplosione completata
                }
            }
            
            return true; // Mantieni l'esplosione attiva
        });
    }

    draw(ctx, camera) {
        if (!this.loaded || this.frames.length === 0) return;

        // Disegna esplosione singola (per compatibilità)
        if (this.playing) {
            const frame = this.frames[this.currentFrame];
            if (frame) {
                const screenPos = camera.worldToScreen(this.x, this.y);
                ctx.drawImage(
                    this.image,
                    frame.x, frame.y, frame.width, frame.height,
                    screenPos.x - frame.width / 2, screenPos.y - frame.height / 2,
                    frame.width, frame.height
                );
            }
        }

        // Disegna tutte le esplosioni multiple
        this.explosions.forEach(explosion => {
            const frame = this.frames[explosion.currentFrame];
            if (frame) {
                const screenPos = camera.worldToScreen(explosion.x, explosion.y);
                ctx.drawImage(
                    this.image,
                    frame.x, frame.y, frame.width, frame.height,
                    screenPos.x - frame.width / 2, screenPos.y - frame.height / 2,
                    frame.width, frame.height
                );
            }
        });
    }

    isPlaying() {
        return this.playing;
    }
}