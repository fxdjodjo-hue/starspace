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
        // Usa lo sprite animato se disponibile, altrimenti fallback al triangolo
        if (ship.sprite && ship.sprite.isLoaded) {
            const screenPos = camera.worldToScreen(ship.x, ship.y);
            ship.sprite.draw(this.ctx, screenPos.x, screenPos.y, ship.rotation, ship.size);
        } else {
            ship.draw(this.ctx, camera);
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
