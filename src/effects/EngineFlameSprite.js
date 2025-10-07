// EngineFlameSprite: simple atlas-based animated engine flames (two nozzles)
// Drawn with additive blending behind the ship sprite. No game logic changes.

export class EngineFlameSprite {
    constructor(pngPath = 'engflames/engflames.png', atlasPath = 'engflames/engflames.atlas') {
        this.pngPath = pngPath;
        this.atlasPath = atlasPath;
        this.image = new Image();
        this.imageLoaded = false;
        this.frames = []; // {x,y,w,h}
        this.frameIndex = 0;
        this.frameTime = 0;
        this.frameDuration = 60; // ms per frame
        this.scale = 1;

        this._load();
    }

    async _load() {
        try {
            // Load image
            this.image.onload = () => {
                this.imageLoaded = true;
            };
            this.image.src = this.pngPath;

            // Load atlas text and parse frames
            const res = await fetch(this.atlasPath, { cache: 'no-cache' });
            const text = await res.text();
            this._parseAtlas(text);
        } catch (e) {
            console.warn('EngineFlameSprite: failed loading atlas/png', e);
        }
    }

    _parseAtlas(text) {
        // Very small parser for the provided atlas format
        // Expects entries like:
        // 01\n rotate: false\n xy: 2, 2\n size: 19, 36\n ...
        const lines = text.split(/\r?\n/);
        for (let i = 0; i < lines.length; i++) {
            const name = lines[i].trim();
            if (!name || name.endsWith('.png')) continue;
            if (/^\d+/.test(name)) {
                // Read next few properties
                let xyLine = '';
                let sizeLine = '';
                for (let j = 1; j <= 6 && i + j < lines.length; j++) {
                    const l = lines[i + j].trim();
                    if (l.startsWith('xy:')) xyLine = l;
                    if (l.startsWith('size:')) sizeLine = l;
                }
                const xyMatch = xyLine.match(/xy:\s*(\d+)\s*,\s*(\d+)/);
                const sizeMatch = sizeLine.match(/size:\s*(\d+)\s*,\s*(\d+)/);
                if (xyMatch && sizeMatch) {
                    const x = parseInt(xyMatch[1], 10);
                    const y = parseInt(xyMatch[2], 10);
                    const w = parseInt(sizeMatch[1], 10);
                    const h = parseInt(sizeMatch[2], 10);
                    this.frames.push({ x, y, w, h });
                }
            }
        }
        if (this.frames.length === 0) {
            // Fallback: single frame
            this.frames.push({ x: 0, y: 0, w: 19, h: 36 });
        }
    }

    update(deltaMs = 16) {
        this.frameTime += deltaMs;
        if (this.frameTime >= this.frameDuration) {
            this.frameTime = 0;
            this.frameIndex = (this.frameIndex + 1) % this.frames.length;
        }
    }

    draw(ctx, camera, ship) {
        if (!this.imageLoaded || this.frames.length === 0 || !ship) return;
        // compute nozzle positions similar to TrailSystem
        const cos = Math.cos(ship.rotation);
        const sin = Math.sin(ship.rotation);
        const backOffset = ship.size * 0.52;   // from center to engines
        const lateralOffset = ship.size * 0.28; // split engines
        const backX = ship.x - cos * backOffset;
        const backY = ship.y - sin * backOffset;
        const perpX = -sin, perpY = cos;
        const left = { x: backX + perpX * lateralOffset, y: backY + perpY * lateralOffset };
        const right = { x: backX - perpX * lateralOffset, y: backY - perpY * lateralOffset };

        const frame = this.frames[this.frameIndex];
        const nozzleScale = (ship.size / 40) * 1.1; // scale flames with ship size
        const drawOne = (pos) => {
            const p = camera.worldToScreen(pos.x, pos.y);
            ctx.save();
            ctx.globalCompositeOperation = 'lighter'; // additive
            ctx.translate(p.x, p.y);
            // Point flame backward along -X relative to ship heading
            ctx.rotate(ship.rotation);
            ctx.scale(nozzleScale, nozzleScale);
            const drawW = frame.w;
            const drawH = frame.h;
            // Start drawing one full frame-width to the left so it extends behind the nozzle
            ctx.drawImage(this.image, frame.x, frame.y, frame.w, frame.h, -drawW, -drawH * 0.5, drawW, drawH);
            ctx.restore();
        };

        drawOne(left);
        drawOne(right);
    }
}


