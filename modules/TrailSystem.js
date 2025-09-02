// Classic engine trail: slim glowing streaks (twin ribbons) with additive blending
// Works with Ship.updateTrail() and Renderer.drawTrail()

export class TrailSystem {
    constructor() {
        this.segments = [];           // { x1,y1,x2,y2, alpha, width }
        this.maxSegments = 320;       // cap memory/CPU
        this.fadeDamping = 0.92;      // per-frame alpha damping
        this.widthDamping = 0.985;    // per-frame width damping
        this.spawnDistance = 2.5;     // spawn frequency tied to movement
        this.baseWidth = 8;           // initial ribbon half-width
        this.colorCore = '#bfe6ff';   // bright core (near white with hint of blue)
        this.colorEdge = 'rgba(191, 230, 255, 0)'; // transparent edge
        this._lastSpawnPositions = null; // { left:{x,y}, right:{x,y} }
        this._lastRotation = null;     // for turn-based fanning

        // Subtle turbulence wobble
        this.noiseAmplitude = 0.6;     // px wobble around ribbon
        this.noiseSpeed = 0.22;        // phase increment per frame

        // Occasional bright sparks for hot exhaust
        this.sparks = [];              // { x,y,vx,vy,alpha,size }
        this.maxSparks = 120;
    }

    update() {
        // Fade and slim down; drop when too faint or thin
        this.segments = this.segments.filter(segment => {
            segment.alpha *= this.fadeDamping;
            segment.width *= this.widthDamping;
            if (segment.phase != null) segment.phase += this.noiseSpeed;
            return segment.alpha > 0.05 && segment.width > 0.8;
        });

        // Update sparks
        this.sparks = this.sparks.filter(s => {
            s.x += s.vx;
            s.y += s.vy;
            s.alpha *= 0.88;
            s.size *= 0.98;
            return s.alpha > 0.06 && s.size > 0.5;
        });
    }

    createTrail(ship) {
        // Only emit when the ship is moving and not dead
        if (!ship || ship.isDead || !ship.isMoving) {
            this._lastSpawnPositions = null;
            return;
        }

        const cos = Math.cos(ship.rotation);
        const sin = Math.sin(ship.rotation);
        const backOffset = ship.size * 0.52;   // from center to engines
        const lateralOffset = ship.size * 0.28; // split engines

        // Base point behind ship
        const backX = ship.x - cos * backOffset;
        const backY = ship.y - sin * backOffset;

        // Perpendicular (left-right) vector
        const perpX = -sin;
        const perpY =  cos;

        // Engine nozzle world positions
        const leftX = backX + perpX * lateralOffset;
        const leftY = backY + perpY * lateralOffset;
        const rightX = backX - perpX * lateralOffset;
        const rightY = backY - perpY * lateralOffset;

        // Throttle emission by travel distance to avoid overdraw
        if (this._lastSpawnPositions) {
            const dlx = leftX - this._lastSpawnPositions.left.x;
            const dly = leftY - this._lastSpawnPositions.left.y;
            const drx = rightX - this._lastSpawnPositions.right.x;
            const dry = rightY - this._lastSpawnPositions.right.y;
            const distLeft = Math.hypot(dlx, dly);
            const distRight = Math.hypot(drx, dry);
            if (distLeft < this.spawnDistance && distRight < this.spawnDistance) {
                return;
            }
        }

        // Determine fanning by turn rate (more curve when turning)
        let turnFan = 0;
        if (this._lastRotation != null) {
            let dRot = ship.rotation - this._lastRotation;
            if (dRot > Math.PI) dRot -= Math.PI * 2;
            if (dRot < -Math.PI) dRot += Math.PI * 2;
            turnFan = Math.max(-1, Math.min(1, dRot * 4));
        }

        // If we have previous nozzle positions, create streak segments from prev->current
        if (this._lastSpawnPositions) {
            this._spawnStreak(this._lastSpawnPositions.left.x, this._lastSpawnPositions.left.y, leftX, leftY, ship, -turnFan);
            this._spawnStreak(this._lastSpawnPositions.right.x, this._lastSpawnPositions.right.y, rightX, rightY, ship, turnFan);
        }

        this._lastSpawnPositions = {
            left: { x: leftX, y: leftY },
            right: { x: rightX, y: rightY }
        };
        this._lastRotation = ship.rotation;

        // Trim
        if (this.segments.length > this.maxSegments) {
            this.segments.splice(0, this.segments.length - this.maxSegments);
        }

        // Random sparks from each nozzle
        if (Math.random() < 0.25) this._spawnSpark(leftX, leftY, cos, sin, ship);
        if (Math.random() < 0.25) this._spawnSpark(rightX, rightY, cos, sin, ship);
    }

    _spawnStreak(x1, y1, x2, y2, ship, fanSign = 0) {
        // Length correlates with speed; use distance as implicit length
        const width = Math.max(2.5, this.baseWidth * (ship.speed / 6));
        this.segments.push({ x1, y1, x2, y2, alpha: 0.9, width, phase: Math.random() * Math.PI * 2, fan: fanSign });
    }

    _spawnSpark(x, y, cos, sin, ship) {
        // Eject slightly backward with small lateral randomness
        const speed = 0.8 + Math.random() * 1.6; // px/frame
        const spread = (Math.random() - 0.5) * 0.6; // lateral spread
        const vx = -cos * speed + -sin * spread;
        const vy = -sin * speed +  cos * spread;
        const size = 1.5 + Math.random() * 2.0;
        const alpha = 0.9;
        this.sparks.push({ x, y, vx, vy, size, alpha });
        if (this.sparks.length > this.maxSparks) {
            this.sparks.splice(0, this.sparks.length - this.maxSparks);
        }
    }

    draw(ctx, camera) {
        if (!this.segments.length) return;

        ctx.save();
        const prevComposite = ctx.globalCompositeOperation;
        ctx.globalCompositeOperation = 'lighter'; // additive glow

        for (let i = 0; i < this.segments.length; i++) {
            const s = this.segments[i];
            const p1 = camera.worldToScreen(s.x1, s.y1);
            const p2 = camera.worldToScreen(s.x2, s.y2);

            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const len = Math.max(1, Math.hypot(dx, dy));
            const angle = Math.atan2(dy, dx);

            ctx.save();
            ctx.translate(p1.x, p1.y);
            ctx.rotate(angle);

            // Build a horizontal ribbon from x=0..len, centered vertically
            let halfW = s.width * 0.5;
            // fan outward on turns
            halfW *= (1.0 + Math.max(-0.4, Math.min(0.4, (s.fan || 0) * 0.35)));

            // Subtle turbulence: vertical wobble along length
            const wobble = Math.sin(s.phase || 0) * this.noiseAmplitude;
            const grad = ctx.createLinearGradient(0, 0, len, 0);
            grad.addColorStop(0.0, this._withAlpha(this.colorEdge, 0));
            grad.addColorStop(0.15, this._withAlpha(this.colorCore, s.alpha * 0.5));
            grad.addColorStop(0.5, this._withAlpha('#ffffff', s.alpha));
            grad.addColorStop(0.85, this._withAlpha(this.colorCore, s.alpha * 0.5));
            grad.addColorStop(1.0, this._withAlpha(this.colorEdge, 0));

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(0, -halfW + wobble);
            ctx.lineTo(len, -Math.max(0.5, halfW * 0.6) + wobble * 0.5); // slight taper + wobble
            ctx.lineTo(len, Math.max(0.5, halfW * 0.6) + wobble * -0.3);
            ctx.lineTo(0, halfW + wobble);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        // Draw sparks as tiny glowing points
        for (let i = 0; i < this.sparks.length; i++) {
            const sp = this.sparks[i];
            const p = camera.worldToScreen(sp.x, sp.y);
            const r = sp.size;
            const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
            g.addColorStop(0.0, `rgba(255, 255, 255, ${sp.alpha})`);
            g.addColorStop(0.4, `rgba(191, 230, 255, ${sp.alpha * 0.8})`);
            g.addColorStop(1.0, 'rgba(191, 230, 255, 0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalCompositeOperation = prevComposite;
        ctx.restore();
    }

    _withAlpha(color, alpha) {
        // Accepts hex like #rrggbb or rgba(); returns rgba with given alpha
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        // Assume rgba/keyword; fallback to white
        return `rgba(255, 255, 255, ${alpha})`;
    }
}


