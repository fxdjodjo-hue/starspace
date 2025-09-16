// Modulo Minimappa Dedicato
export class Minimap {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        // Dimensioni corrette per la griglia 8x5 (proporzioni 8:5) - Ingrandite
        this.gridHeight = 160; // Altezza (era 120)
        this.gridWidth = 256; // Larghezza (era 192, 8/5 * 160 = 256)
        this.margin = 10;
        
        // Posizione della minimappa centrale
        this.x = width - this.gridWidth - this.margin;
        this.y = height - this.gridHeight - this.margin;
        
        // Posizioni per le nuove sezioni (solo per il testo)
        this.mapInfoX = this.x + 5; // Dentro la minimappa
        this.coordsX = this.x + this.gridWidth - 80; // A destra della minimappa
        
        this.mapWidth = 16000;  // Larghezza del mondo
        this.mapHeight = 10000; // Altezza del mondo
        this.scaleX = this.gridWidth / this.mapWidth;   // Scale per larghezza
        this.scaleY = this.gridHeight / this.mapHeight; // Scale per altezza
        this.isVisible = true;
    }
    
    // Gestisce i click sulla minimappa
    handleClick(mouseX, mouseY, ship, isRightClick = false) {
        console.log(`🎯 Minimap.handleClick: mouse(${mouseX}, ${mouseY}), rightClick: ${isRightClick}`);
        console.log(`🎯 Ship.isMoving: ${ship.isMoving}, currentTarget: ${this.currentTarget ? 'exists' : 'null'}`);
        
        // Controlla se il click è dentro la minimappa (sia destro che sinistro)
        if (mouseX >= this.x && mouseX <= this.x + this.gridWidth && 
            mouseY >= this.y && mouseY <= this.y + this.gridHeight) {
            
            console.log(`✅ Click dentro minimappa!`);
            
            // Converti coordinate schermo in coordinate mondo
            const worldX = (mouseX - this.x) / this.scaleX;
            const worldY = (mouseY - this.y) / this.scaleY;
            
            console.log(`🌍 Coordinate mondo: (${worldX}, ${worldY})`);
            
            // Pulisci eventuali target precedenti
            this.currentTarget = null;
            
            // Imposta il target della nave
            ship.setTarget(worldX, worldY);
            
            // Salva il target per il movimento continuo
            this.currentTarget = { x: worldX, y: worldY };
            
            console.log(`🚀 Target impostato: (${worldX}, ${worldY}), ship.isMoving: ${ship.isMoving}`);
            
            return true; // Click gestito
        }
        
        console.log(`❌ Click fuori minimappa`);
        return false; // Click non nella minimappa
    }
    
    // Restituisce il target corrente per il movimento continuo
    getCurrentTarget() {
        return this.currentTarget;
    }
    
    // Pulisce il target corrente
    clearTarget() {
        this.currentTarget = null;
    }
    
    // Disegna la minimappa
    draw(ctx, ship, camera, enemies = [], sectorSystem = null, spaceStation = null, interactiveAsteroids = [], mapManager = null) {
        if (!this.isVisible) return;
        
        // Disegna le nuove sezioni
        this.drawMapInfo(ctx, mapManager);
        this.drawCoordinates(ctx, ship);
        
        // Sfondo della minimappa
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(this.x, this.y, this.gridWidth, this.gridHeight);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.gridWidth, this.gridHeight);
        
        // Disegna il rettangolo della mappa completa
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.gridWidth, this.gridHeight);
        
        // Disegna la griglia dei settori per prima (sotto tutto)
        if (sectorSystem) {
            sectorSystem.drawSectorGrid(ctx, this.x, this.y, this.gridWidth, this.gridHeight);
        }
        
        // Disegna alcune stelle principali per orientamento
        this.drawStars(ctx);
        
        // Disegna gli NPC nella minimappa
        this.drawEnemies(ctx, enemies);
        
        // Disegna la stazione spaziale (punto giallo) solo se presente nella mappa corrente
        if (spaceStation && spaceStation.active && mapManager && mapManager.shouldShowSpaceStation()) {
            spaceStation.drawMinimap(ctx, this.x, this.y, this.gridWidth, this.mapWidth);
        }
        
        // Disegna gli asteroidi interattivi (punti arancioni)
        for (let asteroid of interactiveAsteroids) {
            if (asteroid.active || asteroid.isRespawning) {
                const asteroidX = this.x + (asteroid.x * this.scaleX);
                const asteroidY = this.y + (asteroid.y * this.scaleY);
                
                // Disegna l'orbita (cerchio tratteggiato)
                const orbitCenterX = this.x + (asteroid.originalX * this.scaleX);
                const orbitCenterY = this.y + (asteroid.originalY * this.scaleY);
                const orbitRadius = asteroid.orbitRadius * this.scaleX;
                
                ctx.strokeStyle = 'rgba(255, 140, 0, 0.3)';
                ctx.lineWidth = 1;
                ctx.setLineDash([2, 2]);
                ctx.beginPath();
                ctx.arc(orbitCenterX, orbitCenterY, orbitRadius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);
                
                // Disegna l'asteroide (grigio se in respawn, arancione se attivo)
                ctx.fillStyle = asteroid.isRespawning ? '#888888' : '#FF8C00';
                ctx.beginPath();
                ctx.arc(asteroidX, asteroidY, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Disegna la nave (sempre punto blu per la minimappa)
        const shipX = this.x + (ship.x * this.scaleX);
        const shipY = this.y + (ship.y * this.scaleY);
        
        // Usa sempre il punto blu per la minimappa (più pulito e leggibile)
        ctx.fillStyle = '#4a90e2';
        ctx.beginPath();
        ctx.arc(shipX, shipY, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Disegna il target se la nave si sta muovendo (punto verde)
        if (ship.isMoving) {
            const targetX = this.x + (ship.targetX * this.scaleX);
            const targetY = this.y + (ship.targetY * this.scaleY);
            
            // Disegna la linea dal player al target
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.setLineDash([3, 3]); // Linea tratteggiata
            ctx.beginPath();
            ctx.moveTo(shipX, shipY);
            ctx.lineTo(targetX, targetY);
            ctx.stroke();
            ctx.setLineDash([]); // Reset del tratteggio
            
            // Disegna il punto target
            ctx.fillStyle = '#00ff00';
            ctx.beginPath();
            ctx.arc(targetX, targetY, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Titolo della minimappa
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('MINIMAPPA', this.x + this.gridWidth/2, this.y - 8);
        
        // Mostra indicatori di stato minimappa
        if (this.currentTarget) {
            // Indicatore verde sottile quando la minimappa ha un target attivo
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 3;
            ctx.strokeRect(this.x, this.y, this.gridWidth, this.gridHeight);
        }
    }
    
    // Disegna le stelle di orientamento
    drawStars(ctx) {
        ctx.fillStyle = '#ffffff';
        
        const keyStars = [
            { x: 0, y: 0 },
            { x: 4000, y: 0 },
            { x: 8000, y: 0 },
            { x: 12000, y: 0 },
            { x: 16000, y: 0 },
            { x: 0, y: 5000 },
            { x: 4000, y: 5000 },
            { x: 8000, y: 5000 },
            { x: 12000, y: 5000 },
            { x: 16000, y: 5000 },
            { x: 0, y: 10000 },
            { x: 4000, y: 10000 },
            { x: 8000, y: 10000 },
            { x: 12000, y: 10000 },
            { x: 16000, y: 10000 }
        ];
        
        for (const star of keyStars) {
            const starX = this.x + (star.x * this.scaleX);
            const starY = this.y + (star.y * this.scaleY);
            ctx.fillRect(starX - 1, starY - 1, 2, 2);
        }
    }
    
    // Aggiorna le dimensioni quando la finestra cambia
    updateSize(width, height) {
        this.width = width;
        this.height = height;
        
        // Posizione della minimappa centrale
        this.x = width - this.gridWidth - this.margin;
        this.y = height - this.gridHeight - this.margin;
        
        // Posizioni per le nuove sezioni (solo per il testo)
        this.mapInfoX = this.x + 5; // Dentro la minimappa
        this.coordsX = this.x + this.gridWidth - 80; // A destra della minimappa
        
        // Ricalcola gli scale
        this.scaleX = this.gridWidth / this.mapWidth;
        this.scaleY = this.gridHeight / this.mapHeight;
    }
    
    // Mostra/nascondi la minimappa
    toggle() {
        this.isVisible = !this.isVisible;
    }
    
    // Disegna gli NPC nella minimappa
    drawEnemies(ctx, enemies) {
        if (!enemies || enemies.length === 0) return;
        
        enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            // Calcola posizione dell'NPC nella minimappa
            const enemyX = this.x + (enemy.x * this.scaleX);
            const enemyY = this.y + (enemy.y * this.scaleY);
            
            // Colore basato sul tipo di nemico
            let color;
            switch (enemy.type) {
                case 'npc_x1':
                    color = '#4a90e2'; // Blu per X1 Patrol
                    break;
                case 'npc_x2':
                    color = '#e74c3c'; // Rosso per X2 Elite
                    break;
                case 'npc_x3':
                    color = '#9b59b6'; // Viola per X3 Guardian
                    break;
                case 'barracuda': // Fallback per compatibilità
                    color = '#ff4444';
                    break;
                default:
                    color = '#ff4444';
            }
            
            // Disegna l'NPC (punto colorato)
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(enemyX, enemyY, 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Bordo bianco per visibilità
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Se l'NPC è selezionato, aggiungi un indicatore speciale
            if (enemy.isSelected) {
                // Cerchio bianco più grande per target selezionato
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(enemyX, enemyY, 4, 0, Math.PI * 2);
                ctx.stroke();
            }
        });
    }
    
    // Disegna le informazioni della mappa corrente (a sinistra)
    drawMapInfo(ctx, mapManager) {
        if (!mapManager) return;
        
        const currentMap = mapManager.getCurrentMap();
        if (!currentMap) return;
        
        // Solo il nome della mappa, semplice
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        // Estrai solo la parte prima dello spazio (V1, V2, M1, M2, E1, E2, etc.)
        const shortName = currentMap.name.split(' ')[0];
        ctx.fillText(`MAP: ${shortName}`, this.mapInfoX, this.y - 8);
    }
    
    // Disegna le coordinate (a destra)
    drawCoordinates(ctx, ship) {
        // Solo le coordinate, semplici
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`X:${Math.round(ship.x)} Y:${Math.round(ship.y)}`, this.coordsX, this.y - 8);
    }

}
