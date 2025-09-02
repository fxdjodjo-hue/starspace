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
        
        // Usa lo sprite animato se disponibile, altrimenti fallback al triangolo
        if (ship.sprite && ship.sprite.isLoaded) {
            const screenPos = camera.worldToScreen(ship.x, ship.y);
            const floatingY = Math.sin(ship.floatingOffset) * ship.floatingAmplitude;
            ship.sprite.draw(this.ctx, screenPos.x, screenPos.y, ship.rotation, ship.size, floatingY);
        } else {
            ship.draw(this.ctx, camera);
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
}
