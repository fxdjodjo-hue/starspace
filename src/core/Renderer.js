// Modulo Renderer
export class Renderer {
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
    }
    
    clear() {
        // Pulisci il canvas con sfondo spaziale
        this.ctx.fillStyle = '#000011';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    drawWorld(world, camera) {
        // Disegna griglia di sfondo
        world.drawGrid(this.ctx, camera);
        
        // Disegna stelle di sfondo
        world.drawStars(this.ctx, camera);
    }
    
    drawShip(ship, camera) {
        // Non disegnare la nave se è morta
        if (ship.isDead) {
            return;
        }
        
        // Disegna sempre il range di attacco se attivo
        ship.draw(this.ctx, camera);
        
        // Poi disegna lo sprite della nave sopra
        if (ship.sprite && ship.sprite.isLoaded) {
            const screenPos = camera.worldToScreen(ship.x, ship.y);
            const floatingY = Math.sin(ship.floatingOffset) * ship.floatingAmplitude;
            ship.sprite.draw(this.ctx, screenPos.x, screenPos.y, ship.rotation, ship.size, floatingY);
        }
        
        // Disegna effetto riparazione se attivo
        if (ship.isRepairing) {
            const screenPos = camera.worldToScreen(ship.x, ship.y);
            if (ship.repairEffect) {
                ship.repairEffect.draw(this.ctx, screenPos.x, screenPos.y, 1.0);
            }
        } else {
            // Reset animazione quando la riparazione si ferma
            if (ship.repairEffect) {
                ship.repairEffect.reset();
            }
        }
        
        // Disegna effetto riparazione scudo se attivo
        if (ship.isShieldRepairing) {
            const screenPos = camera.worldToScreen(ship.x, ship.y);
            if (ship.shieldEffect) {
                ship.shieldEffect.draw(this.ctx, screenPos.x, screenPos.y, 1.0);
            }
        } else {
            // Reset animazione quando la riparazione scudo si ferma
            if (ship.shieldEffect) {
                ship.shieldEffect.reset();
            }
        }
        
        // I droni UAV sono disegnati separatamente nel game loop
    }
    
    drawTarget(ship, camera) {
        ship.drawTarget(this.ctx, camera);
    }
    
    drawProjectiles(ship, camera) {
        // Disegna tutti i proiettili della nave
        ship.projectiles.forEach(projectile => {
            projectile.draw(this.ctx, camera);
        });
    }
    
    drawMissiles(ship, camera) {
        // Disegna tutti i missili della nave
        ship.missiles.forEach(missile => {
            missile.draw(this.ctx, camera);
        });
    }
    
    drawTrail(ship, camera) {
        // Disegna le scie della nave
        if (ship.trailSystem) {
            ship.trailSystem.draw(this.ctx, camera);
        }
    }
    
    // La minimappa è ora gestita dal modulo Minimap separato
    
    // Metodo per disegnare effetti particellari (futuro)
    drawParticles(particles, camera) {
        // Implementazione futura per esplosioni, motori, ecc.
    }
    
    // Metodo per disegnare UI (futuro)
    drawUI(gameState) {
        // Implementazione futura per barre HP, munizioni, ecc.
    }
    
    // Disegna i droni UAV semplici attorno alla nave
    drawUAVDrones(ship, camera, inventory) {
        if (!inventory || !inventory.equipment || !inventory.equipment.uav) return;
        const uavItems = inventory.equipment.uav;
        if (!uavItems || uavItems.length === 0) return;
        
        // Posizioni in cerchio attorno alla nave
        const radius = 120;
        const angleStep = (2 * Math.PI) / uavItems.length;
        
        uavItems.forEach((drone, index) => {
            if (!drone || !drone.droneType) return;
            
            // Calcola posizione in cerchio
            const angle = (index * angleStep) + ship.rotation;
            const droneX = ship.x + Math.cos(angle) * radius;
            const droneY = ship.y + Math.sin(angle) * radius;
            
            // Converti in coordinate schermo
            const screenPos = camera.worldToScreen(droneX, droneY);
            
            // Disegna il drone
            this.drawSimpleDrone(screenPos.x, screenPos.y, drone.droneType, drone.equippedItems);
        });
    }
    
    // Disegna un drone semplice (cerchio per Flax, quadrato per Iris)
    drawSimpleDrone(x, y, droneType, equippedItems) {
        this.ctx.save();
        this.ctx.translate(x, y);
        
        const size = droneType === 'flax' ? 12 : 16;
        const color = droneType === 'flax' ? '#f5f5dc' : '#d2b48c';
        
        // Disegna forma base
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1;
        
        if (droneType === 'flax') {
            // Cerchio per Flax
            this.ctx.beginPath();
            this.ctx.arc(0, 0, size/2, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.stroke();
        } else {
            // Quadrato per Iris
            this.ctx.fillRect(-size/2, -size/2, size, size);
            this.ctx.strokeRect(-size/2, -size/2, size, size);
        }
        
        // Disegna slot equipaggiati
        if (equippedItems && equippedItems.length > 0) {
            equippedItems.forEach((item, slotIndex) => {
                if (item) {
                    const slotSize = 3;
                    const slotX = (slotIndex - (equippedItems.length - 1) / 2) * 6;
                    const slotY = -size/2 - 5;
                    
                    this.ctx.fillStyle = item.type === 'laser' ? '#ffff00' : '#00ff00';
                    this.ctx.fillRect(slotX - slotSize/2, slotY - slotSize/2, slotSize, slotSize);
                    this.ctx.strokeStyle = '#ffffff';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(slotX - slotSize/2, slotY - slotSize/2, slotSize, slotSize);
                }
            });
        }
        
        this.ctx.restore();
    }
}