// Modulo Minimappa Dedicato
export class Minimap {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        // Dimensioni corrette per la griglia 8x5 (proporzioni 8:5)
        this.gridHeight = 120; // Altezza
        this.gridWidth = 192; // Larghezza (8/5 * 120 = 192)
        this.margin = 10;
        this.x = width - this.gridWidth - this.margin;
        this.y = height - this.gridHeight - this.margin;
        this.mapSize = 10000;
        this.scale = this.gridHeight / this.mapSize; // Usa l'altezza per lo scale
        this.isVisible = true;
    }
    
    // Gestisce i click sulla minimappa
    handleClick(mouseX, mouseY, ship, isRightClick = false) {
        // Solo i click destri attivano la minimappa
        if (!isRightClick) {
            return false;
        }
        
        // Controlla se il click è dentro la minimappa
        if (mouseX >= this.x && mouseX <= this.x + this.gridWidth && 
            mouseY >= this.y && mouseY <= this.y + this.gridHeight) {
            
            // Converti coordinate schermo in coordinate mondo
            const worldX = (mouseX - this.x) / this.scale;
            const worldY = (mouseY - this.y) / this.scale;
            
            // Click minimappa gestito
            
            // Imposta il target della nave
            ship.setTarget(worldX, worldY);
            
            // Salva il target per il movimento continuo
            this.currentTarget = { x: worldX, y: worldY };
            
            return true; // Click gestito
        }
        
        return false; // Click non nella minimappa
    }
    
    // Restituisce il target corrente per il movimento continuo
    getCurrentTarget() {
        return this.currentTarget;
    }
    
    // Pulisce il target quando la nave arriva a destinazione
    clearTarget() {
        this.currentTarget = null;
    }
    
    // Disegna la minimappa
    draw(ctx, ship, camera, enemies = [], sectorSystem = null) {
        if (!this.isVisible) return;
        
        // Sfondo della minimappa
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(this.x, this.y, this.gridWidth, this.gridHeight);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.gridWidth, this.gridHeight);
        
        // Disegna il rettangolo della mappa completa
        ctx.strokeStyle = '#ff0000';
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
        
        // Disegna la nave (sempre punto blu per la minimappa)
        const shipX = this.x + (ship.x * this.scale);
        const shipY = this.y + (ship.y * this.scale);
        
        // Usa sempre il punto blu per la minimappa (più pulito e leggibile)
        ctx.fillStyle = '#4a90e2';
        ctx.beginPath();
        ctx.arc(shipX, shipY, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Disegna il target se la nave si sta muovendo (punto verde)
        if (ship.isMoving) {
            const targetX = this.x + (ship.targetX * this.scale);
            const targetY = this.y + (ship.targetY * this.scale);
            ctx.fillStyle = '#00ff00';
            ctx.beginPath();
            ctx.arc(targetX, targetY, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Titolo della minimappa
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('MINIMAPPA', this.x + this.gridWidth/2, this.y - 5);
        
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
            { x: 5000, y: 0 },
            { x: 10000, y: 0 },
            { x: 0, y: 5000 },
            { x: 5000, y: 5000 },
            { x: 10000, y: 5000 },
            { x: 0, y: 10000 },
            { x: 5000, y: 10000 },
            { x: 10000, y: 10000 }
        ];
        
        for (const star of keyStars) {
            const starX = this.x + (star.x * this.scale);
            const starY = this.y + (star.y * this.scale);
            ctx.fillRect(starX - 1, starY - 1, 2, 2);
        }
    }
    
    // Aggiorna le dimensioni quando la finestra cambia
    updateSize(width, height) {
        this.width = width;
        this.height = height;
        this.x = width - this.gridWidth - this.margin;
        this.y = height - this.gridHeight - this.margin;
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
            const enemyX = this.x + (enemy.x * this.scale);
            const enemyY = this.y + (enemy.y * this.scale);
            
            // Colore basato sul tipo di nemico
            let color;
            switch (enemy.type) {
                case 'basic':
                    color = '#ff4444'; // Rosso
                    break;
                case 'fast':
                    color = '#ff8844'; // Arancione
                    break;
                case 'tank':
                    color = '#880000'; // Rosso scuro
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
                // Cerchio rosso più grande per target selezionato
                ctx.strokeStyle = '#ff0000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(enemyX, enemyY, 4, 0, Math.PI * 2);
                ctx.stroke();
            }
        });
    }
    

}
