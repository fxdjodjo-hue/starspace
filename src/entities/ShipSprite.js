// Modulo per gestire gli sprite animati della nave
export class ShipSprite {
    constructor() {
        this.image = null;
        this.frames = [];
        this.frameCount = 72; // Numero di frame nell'atlas (8 righe x 9 colonne)
        this.isLoaded = false;
        this.atlasData = null;
        this.currentShip = 1; // 1 per la nave base, 2 per Urus
        
        this.loadSprite();
        this.loadAtlas();
    }
    
    loadSprite() {
        this.image = new Image();
        this.image.onload = () => {
            this.isLoaded = true;
        };
        this.image.onerror = () => {
            console.error('❌ Errore nel caricamento dello sprite della nave');
        };
        this.loadCurrentShipSprite();
    }
    
    async loadAtlas() {
        try {
            // Atlas per nave 1 (Urus), 2 (Interceptor), 3 (Falcon)
            let atlasFile = 'Urus/ship103.atlas';
            if (this.currentShip === 2) atlasFile = 'interceptor/ship103.atlas';
            if (this.currentShip === 3) atlasFile = 'falcon/ship90.atlas';
            const response = await fetch(atlasFile);
            const atlasText = await response.text();
            this.parseAtlas(atlasText);
        } catch (error) {
            console.error('❌ Errore nel caricamento dell\'atlas:', error);
        }
    }

    loadCurrentShipSprite() {
        // Nave 1: Urus/ship103.png; Nave 2: interceptor/ship103.png; Nave 3: falcon/ship90.png
        let spriteFile = 'Urus/ship103.png';
        if (this.currentShip === 2) spriteFile = 'interceptor/ship103.png';
        if (this.currentShip === 3) spriteFile = 'falcon/ship90.png';
        this.image.src = spriteFile;
    }

    switchShip(shipNumber) {
        if (shipNumber === this.currentShip) return;
        if (![1, 2, 3].includes(shipNumber)) return;

        console.log('🚢 Switching to ship:', shipNumber);
        this.currentShip = shipNumber;
        this.isLoaded = false;
        this.frames = [];
        this.loadSprite();
        this.loadAtlas();
        // Notifica il proprietario (Ship) del cambio nave, se registrato
        if (typeof this.onShipChanged === 'function') {
            try {
                this.onShipChanged(this.currentShip);
            } catch (e) {
                console.error('❌ Errore in onShipChanged callback:', e);
            }
        }
    }
    
    parseAtlas(atlasText) {
        this.frames = [];
        const lines = atlasText.split('\n');
        
        const ignoreSet = new Set(['', 'size', 'format', 'filter', 'repeat']);
        for (let i = 0; i < lines.length; i++) {
            const rawLine = lines[i];
            const line = rawLine.trim();
            // In Spine/Sprite atlas, ogni frame inizia con il nome (senza ':').
            // Consideriamo come inizio frame qualunque riga non vuota che NON contiene ':'
            // e non è una delle chiavi globali (size/format/filter/repeat) o il nome del file immagine.
            const isHeader = line.length > 0 && !line.includes(':');
            const isGlobal = ignoreSet.has(line.toLowerCase());
            const looksLikeImageName = line.toLowerCase().endsWith('.png') || line.toLowerCase().endsWith('.jpg');
            if (isHeader && !isGlobal && !looksLikeImageName) {
                // Cerca le coordinate xy e size
                let xy = null, size = null;
                
                for (let j = i + 1; j < i + 10 && j < lines.length; j++) {
                    const dataLine = lines[j].trim();
                    if (dataLine.startsWith('xy:')) {
                        const coords = dataLine.split(':')[1].trim().split(',');
                        xy = { x: parseInt(coords[0]), y: parseInt(coords[1]) };
                    } else if (dataLine.startsWith('size:')) {
                        const sizes = dataLine.split(':')[1].trim().split(',');
                        size = { width: parseInt(sizes[0]), height: parseInt(sizes[1]) };
                    }
                }
                
                if (xy && size) {
                    this.frames.push({
                        x: xy.x,
                        y: xy.y,
                        width: size.width,
                        height: size.height
                    });
                }
            }
        }
        
    }
    

    
    update() {
        // Non serve più l'animazione continua, il frame viene calcolato dalla rotazione
    }
    
    // Calcola il frame corretto basandosi sulla rotazione
    getFrameFromRotation(rotation) {
        if (!this.isLoaded) return 0;
        
        // Inverte la rotazione per correggere l'orientamento
        let invertedRotation = -rotation;
        
        // Normalizza la rotazione tra 0 e 2π
        let normalizedRotation = invertedRotation % (2 * Math.PI);
        if (normalizedRotation < 0) normalizedRotation += 2 * Math.PI;
        
        // Converte la rotazione in un indice del frame (0-71)
        // 72 frame totali per 360 gradi
        const frameIndex = Math.floor((normalizedRotation / (2 * Math.PI)) * this.frameCount);
        
        return Math.min(frameIndex, this.frameCount - 1);
    }
    
    draw(ctx, x, y, rotation, size, floatingY = 0) {
        if (!this.isLoaded || !this.image || this.frames.length === 0) {
            console.log('❌ Draw fallito:', {
                isLoaded: this.isLoaded,
                hasImage: !!this.image,
                framesCount: this.frames.length
            });
            return;
        }
        
        // Calcola il frame corretto basandosi sulla rotazione
        const frameIndex = this.getFrameFromRotation(rotation);
        const frame = this.frames[frameIndex];
        if (!frame) {
            console.log('❌ Frame non trovato:', {
                frameIndex,
                rotation,
                totalFrames: this.frames.length
            });
            return;
        }
        
        // Aumenta la dimensione della nave (moltiplica per 3)
        const shipSize = size * 3;
        
        ctx.save();
        ctx.translate(x, y + floatingY);
        
        // Debug info (rimosso per performance)
        
        // Disegna il frame corrente con dimensione aumentata
        ctx.drawImage(
            this.image,
            frame.x, frame.y, frame.width, frame.height,
            -shipSize/2, -shipSize/2, shipSize, shipSize
        );
        
        ctx.restore();
    }
    
    // Metodo per disegnare senza rotazione (per la minimappa)
    drawStatic(ctx, x, y, size, floatingY = 0) {
        if (!this.isLoaded || !this.image || this.frames.length === 0) return;
        
        const frame = this.frames[0]; // Usa il primo frame per la minimappa
        if (!frame) return;
        
        // Aumenta anche la dimensione nella minimappa
        const shipSize = size * 2;
        
        ctx.drawImage(
            this.image,
            frame.x, frame.y, frame.width, frame.height,
            x - shipSize/2, y - shipSize/2 + floatingY, shipSize, shipSize
        );
    }
}
