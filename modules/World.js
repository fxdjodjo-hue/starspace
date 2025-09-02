// Modulo Mondo
export class World {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.stars = this.generateStars();
        this.gridSize = 100;
        this.mapWidth = 16000; // Larghezza totale della mappa (8 settori)
        this.mapHeight = 10000; // Altezza totale della mappa (5 settori)
        this.sectorWidth = 2000; // Larghezza di ogni settore (16000/8)
        this.sectorHeight = 2000; // Altezza di ogni settore (10000/5)
    }
    
    generateStars() {
        const stars = [];
        for (let i = 0; i < 200; i++) { // Più stelle per la mappa più grande
            stars.push({
                x: (i * 37) % this.mapWidth,
                y: (i * 73) % this.mapHeight,
                size: (i % 3) + 1
            });
        }
        return stars;
    }
    
    drawStars(ctx, camera) {
        ctx.fillStyle = '#ffffff';
        
        for (const star of this.stars) {
            // Converti coordinate mondo in coordinate schermo
            const screenX = star.x - camera.x;
            const screenY = star.y - camera.y;
            
            // Disegna solo se la stella è visibile sullo schermo
            if (camera.isVisible(star.x, star.y, 10)) {
                ctx.fillRect(screenX, screenY, star.size, star.size);
            }
        }
    }
    
    drawGrid(ctx, camera) {
        // Griglia semplice (100x100)
        ctx.strokeStyle = '#1a1a3a';
        ctx.lineWidth = 1;
        
        const startX = Math.floor(camera.x / this.gridSize) * this.gridSize;
        const startY = Math.floor(camera.y / this.gridSize) * this.gridSize;
        
        // Linee verticali
        for (let x = startX; x <= startX + this.width + this.gridSize; x += this.gridSize) {
            const screenX = x - camera.x;
            ctx.beginPath();
            ctx.moveTo(screenX, 0);
            ctx.lineTo(screenX, this.height);
            ctx.stroke();
        }
        
        // Linee orizzontali
        for (let y = startY; y <= startY + this.height + this.gridSize; y += this.gridSize) {
            const screenY = y - camera.y;
            ctx.beginPath();
            ctx.moveTo(0, screenY);
            ctx.lineTo(this.width, screenY);
            ctx.stroke();
        }
        
        // Rettangolo della mappa completa
        this.drawMapRectangle(ctx, camera);
    }
    
    drawMapRectangle(ctx, camera) {
        // Rettangolo che mostra i confini della mappa
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        
        // Calcola le coordinate del rettangolo sullo schermo
        const left = 0 - camera.x;
        const top = 0 - camera.y;
        const right = this.mapWidth - camera.x;
        const bottom = this.mapHeight - camera.y;
        
        // Disegna solo le parti visibili del rettangolo
        if (left < this.width && right > 0 && top < this.height && bottom > 0) {
            ctx.strokeRect(left, top, this.mapWidth, this.mapHeight);
        }
    }
    
    // Aggiunge nuovi elementi al mondo (futuro: nemici, oggetti, ecc.)
    addElement(element) {
        // Implementazione futura
    }
    
    // Aggiorna tutti gli elementi del mondo
    update(deltaTime) {
        // Implementazione futura per nemici, oggetti mobili, ecc.
    }
}
