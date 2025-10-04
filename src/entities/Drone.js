/**
 * Entità Drone UAV
 * Droni che possono volare indipendentemente e supportare la nave madre
 */
export class Drone {
    constructor(x, y, droneType, parentShip) {
        this.x = x;
        this.y = y;
        this.droneType = (droneType || 'flax').toLowerCase(); // 'flax' o 'iris'
        this.parentShip = parentShip;
        
        // Proprietà fisiche
        this.size = droneType === 'flax' ? 12 : 15; // Iris più grandi
        this.speed = droneType === 'flax' ? 2 : 1.5; // Flax più veloci
        this.rotation = 0;
        this.targetX = x;
        this.targetY = y;
        
        // Stato del drone
        this.isActive = true;
        this.isFollowing = true;
        this.isAttacking = false;
        this.health = 100;
        this.maxHealth = 100;
        
        // Equipaggiamento
        this.equippedItems = [];
        this.slots = droneType === 'flax' ? 1 : 2;
        
        // AI e comportamento
        this.behavior = 'follow'; // 'follow', 'attack', 'defend', 'patrol'
        this.target = null;
        this.lastAttackTime = 0;
        this.attackCooldown = 1000; // 1 secondo
        
        // Effetti visivi
        this.engineGlow = 0;
        this.engineGlowSpeed = 0.1;
        
        // Posizioni di formazione
        this.formationOffset = { x: 0, y: 0 };
        this.formationAngle = 0;

        // Smooting per ridurre reattività al mouse/rotazione nave
        this.smoothedAngle = 0; // in radianti (non più usato per calcolo offset)
        this.smoothedShipX = x;
        this.smoothedShipY = y;
        this.angleSmoothing = 0.12; // 0..1 (più basso = più morbido)
        this.centerSmoothing = 0.12; // 0..1 (più morbido)

        // Heading della formazione: quanto ruota il cerchio dei droni attorno alla nave
        this.formationHeading = 0; // radianti
        this.maxRotationRateRad = 0.15; // rad/sec (molto più lento nel seguire la rotazione)
        this.initializedHeading = false;

        // Smorzamento rotazione per non seguire troppo perfettamente il mouse
        this.rotationSmoothing = 0.05; // 0..1 per tick (più inerzia)

        // Carica asset grafici IRIS (una sola volta per l'app)
        if (this.droneType === 'iris') {
            this.ensureIrisAssetsLoaded();
        }
        this._debugLoggedDraw = false;
    }
    
    // Aggiorna il drone
    update(deltaTime) {
        if (!this.isActive) return;
        
        // Aggiorna effetti visivi
        this.engineGlow += this.engineGlowSpeed * deltaTime;
        
        // I droni sono estetici: seguono soltanto la formazione
        this.updateFollowBehavior(deltaTime);
        
        // Muovi verso il target
        this.moveTowardsTarget();
        
        // Allinea la rotazione verso quella della nave con smorzamento (niente snap)
        if (this.parentShip) {
            const targetRot = this.parentShip.rotation;
            this.rotation = this.lerpAngle(this.rotation, targetRot, this.rotationSmoothing);
        }
    }
    
    // Comportamento di follow
    updateFollowBehavior(deltaTime) {
        if (!this.parentShip) return;
        
        // Interpola solo il centro verso la nave (posizione). La formazione resta orientata al mondo
        this.smoothedShipX = this.lerp(this.smoothedShipX, this.parentShip.x, this.centerSmoothing);
        this.smoothedShipY = this.lerp(this.smoothedShipY, this.parentShip.y, this.centerSmoothing);

        // Calcolo della posizione target con offset fisso in world space (nessuna rotazione con la nave)
        this.targetX = this.smoothedShipX + Math.round(this.formationOffset.x * 100) / 100;
        this.targetY = this.smoothedShipY + Math.round(this.formationOffset.y * 100) / 100;
        
        // Velocità fissa
        this.speed = this.droneType === 'flax' ? 3 : 2.5; // leggermente più veloce per seguire meglio
    }
    
    // Comportamento di attacco
    updateAttackBehavior() { /* disabilitato: droni estetici */ }
    
    // Comportamento di difesa
    updateDefendBehavior() { /* disabilitato: droni estetici */ }
    
    // Comportamento di pattugliamento
    updatePatrolBehavior() { /* disabilitato: droni estetici */ }
    
    // Muovi verso il target
    moveTowardsTarget() {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0.5) {
            // Movimento diretto e preciso
            const moveX = (dx / distance) * this.speed;
            const moveY = (dy / distance) * this.speed;
            
            this.x += moveX;
            this.y += moveY;
        } else {
            // Posizionamento esatto quando vicino
            this.x = this.targetX;
            this.y = this.targetY;
        }
    }
    
    // Aggiorna rotazione (estetica): lieve spin costante per non copiare il mouse
    updateRotation(deltaTime) {
        const dt = Math.max(0.001, (deltaTime || 16) / 1000);
        const spinSpeed = 0.4; // rad/s
        this.rotation += spinSpeed * dt;
    }
    
    // Attacca il target
    attack() { /* disabilitato: droni estetici */ }
    
    // Crea effetto visivo di attacco
    createAttackEffect() { /* disabilitato: droni estetici */ }
    
    // Calcola danno totale
    calculateDamage() {
        let totalDamage = 0;
        this.equippedItems.forEach(item => {
            if (item && item.type === 'laser') {
                totalDamage += item.damage || 0;
            }
        });
        return totalDamage;
    }
    
    // Imposta comportamento
    setBehavior(behavior) {
        this.behavior = behavior;
    }
    
    // Imposta target
    setTarget(target) {
        this.target = target;
    }
    
    // Imposta posizione di formazione
    setFormationPosition(offsetX, offsetY, angle) {
        this.formationOffset = { x: offsetX, y: offsetY };
        this.formationAngle = angle;
        // inizializza heading per evitare scatti iniziali
        if (!this.initializedHeading && this.parentShip) {
            this.formationHeading = this.parentShip.rotation || 0;
        }
    }
    
    // Equipaggia oggetto
    equipItem(item, slotIndex) {
        if (slotIndex >= 0 && slotIndex < this.slots) {
            this.equippedItems[slotIndex] = item;
        }
    }
    
    // Rimuovi oggetto
    unequipItem(slotIndex) {
        if (slotIndex >= 0 && slotIndex < this.slots) {
            const item = this.equippedItems[slotIndex];
            this.equippedItems[slotIndex] = null;
            return item;
        }
        return null;
    }
    
    // Prendi danno
    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.health = 0;
            this.isActive = false;
        }
    }
    
    // Ripara drone
    repair(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
        if (this.health > 0) {
            this.isActive = true;
        }
    }
    
    // Disegna il drone
    draw(ctx, camera) {
        if (!this.isActive) return;
        
        const screenPos = camera.worldToScreen(this.x, this.y);
        
        ctx.save();
        ctx.translate(screenPos.x, screenPos.y);
        
        // Disegna corpo del drone
        this.drawDroneBody(ctx);
        
        // Disegna effetti
        this.drawEffects(ctx);
        
        // Non mostra slot/oggetti equipaggiati (droni estetici)
        
        ctx.restore();
    }
    
    // Disegna corpo del drone
    drawDroneBody(ctx) {
        // Disegno IRIS bypassando l'atlas: uso griglia calcolata dall'immagine
        if (this.droneType === 'iris' && Drone.irisTexture) {
            const drawSize = this.size * 3.2;
            const half = drawSize / 2;
            if (Drone.irisGrid) {
                const g = Drone.irisGrid;
                const total = Math.max(1, g.total || (g.cols * g.rows));
                // Mappa la rotazione come fa la nave (ShipSprite.getFrameFromRotation):
                // inverti la rotazione, normalizza in [0, 2π), poi scala ai frame
                // Usa la rotazione smussata del drone (che insegue quella della nave)
                let angle = this.rotation; // radianti
                let inverted = -angle;
                let normalized = inverted % (Math.PI * 2);
                if (normalized < 0) normalized += Math.PI * 2;
                // Offset opzionale per allineare il frame 0 alla direzione corretta
                const angleOffset = 0; // rad, aumenta/diminuisci se serve allineamento fine
                const mapped = ((normalized + angleOffset) / (Math.PI * 2));
                const idx = Math.floor(mapped * total) % total;
                const col = idx % g.cols;
                const row = Math.floor(idx / g.cols);
                const sx = g.startX + col * g.step;
                const sy = g.startY + row * g.step;
                ctx.drawImage(Drone.irisTexture, sx, sy, g.frameW, g.frameH, -half, -half, drawSize, drawSize);
            } else {
                ctx.drawImage(Drone.irisTexture, 2, 2, 51, 51, -half, -half, drawSize, drawSize);
            }
            if (!this._debugLoggedDraw) {
                this._debugLoggedDraw = true;
                console.log('🟢 IRIS drawn', {
                    textureLoaded: !!Drone.irisTexture,
                    grid: Drone.irisGrid,
                    size: this.size
                });
            }
            return;
        }

        // Fallback vettoriale (FLAX o se sprite non caricato)
        const width = this.size;
        const height = this.size * 0.6;
        const bodyColor = '#4a90e2';
        const accentColor = '#2c5aa0';
        ctx.fillStyle = bodyColor;
        ctx.fillRect(-width/2, -height/2, width, height);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(-width/2, -height/2, width, height);
        ctx.fillStyle = accentColor;
        ctx.fillRect(-width/2 + 2, -height/2 + 2, width - 4, height * 0.3);
        ctx.fillStyle = bodyColor;
        ctx.fillRect(-width/2 - 2, -height/4, 2, height/2);
        ctx.fillRect(width/2, -height/4, 2, height/2);
        const glowIntensity = Math.sin(this.engineGlow) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(0, 255, 255, ${glowIntensity})`;
        ctx.fillRect(-width/2 + 2, height/2 - 3, width - 4, 2);
    }

    // Utility: linear interpolation
    lerp(from, to, t) {
        return from + (to - from) * t;
    }
    
    // Utility: angular interpolation in radianti
    lerpAngle(from, to, t) {
        const diff = Math.atan2(Math.sin(to - from), Math.cos(to - from));
        return from + diff * t;
    }

    // Carica sprite e atlas IRIS (statico)
    ensureIrisAssetsLoaded() {
        if (Drone.irisFrames || Drone.irisLoading) return;
        Drone.irisLoading = true;
        
        // Immagine (bypass atlas: useremo una griglia fissa)
        const img = new Image();
        const imgUrl = new URL('uav/ares.png', window.location.href).href;
        console.log('🟡 Loading IRIS image from', imgUrl);
        img.src = imgUrl;
        img.onload = () => {
            Drone.irisTexture = img;
            console.log('🟢 IRIS image loaded', { width: img.width, height: img.height });
            // Calcola griglia: frame 51x51 con step 53 e padding 2 (dalla tua immagine)
            const frameW = 51, frameH = 51, pad = 2, step = 53;
            const cols = Math.max(1, Math.floor((img.width - pad) / step));
            const rows = Math.max(1, Math.floor((img.height - pad) / step));
            Drone.irisGrid = { startX: pad, startY: pad, frameW, frameH, step, cols, rows, total: cols * rows };
            console.log('🟢 IRIS grid computed', Drone.irisGrid);
            Drone.irisFrames = null; // non usiamo l'atlas
            Drone.irisLoading = false;
        };
        img.onerror = (e) => { console.warn('🔴 IRIS image failed to load:', imgUrl, e); Drone.irisLoading = false; };
    }

    // Parser minimale per ares.atlas (frame IRISHxxxx con xy e size)
    parseIrisAtlas(text) {
        const lines = text.split(/\r?\n/);
        const frames = [];
        let current = null;
        for (const raw of lines) {
            const line = raw.trim();
            if (!line) continue;
            if (/^IRISH\d+$/i.test(line)) {
                if (current && current.w && current.h) frames.push(current);
                current = { name: line, x: 0, y: 0, w: 0, h: 0 };
                continue;
            }
            if (!current) continue;
            if (line.startsWith('xy:')) {
                const m = line.match(/xy:\s*(\d+)\s*,\s*(\d+)/);
                if (m) { current.x = parseInt(m[1]); current.y = parseInt(m[2]); }
            } else if (line.startsWith('size:')) {
                const m = line.match(/size:\s*(\d+)\s*,\s*(\d+)/);
                if (m) { current.w = parseInt(m[1]); current.h = parseInt(m[2]); }
            }
        }
        if (current && current.w && current.h) frames.push(current);
        return frames;
    }
    
    // Disegna effetti
    drawEffects(ctx) {
        // Effetto di movimento
        if (this.speed > 0) {
            const trailLength = 10;
            ctx.strokeStyle = `rgba(0, 255, 255, 0.3)`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-this.size/2 - trailLength, 0);
            ctx.lineTo(-this.size/2, 0);
            ctx.stroke();
        }
    }
    
    // Disegna oggetti equipaggiati (disabilitato per droni estetici)
    drawEquippedItems(ctx) { /* no-op */ }
}
