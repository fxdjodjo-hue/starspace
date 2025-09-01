// Sistema di settori per la minimappa
export class SectorSystem {
    constructor() {
        this.sectors = [];
        this.sectorSize = 1250; // Dimensione di ogni settore (10000/8 = 1250)
        this.mapSize = 10000;
        this.rows = ['A', 'B', 'C', 'D', 'F']; // 5 righe (saltando E come nell'immagine)
        this.cols = [1, 2, 3, 4, 5, 6, 7, 8]; // 8 colonne
        
        // Immagine della griglia
        this.gridImage = null;
        this.gridImageLoaded = false;
        
        this.loadGridImage();
        this.initializeSectors();
    }
    
    loadGridImage() {
        this.gridImage = new Image();
        this.gridImage.onload = () => {
            this.gridImageLoaded = true;
            console.log('🗺️ Griglia settori caricata con successo!');
        };
        this.gridImage.onerror = () => {
            console.error('❌ Errore nel caricamento della griglia settori');
        };
        this.gridImage.src = 'PhotoRoom-20231006_123442.png';
    }
    
    initializeSectors() {
        this.sectors = [];
        
        for (let rowIndex = 0; rowIndex < this.rows.length; rowIndex++) {
            for (let colIndex = 0; colIndex < this.cols.length; colIndex++) {
                const sectorId = this.rows[rowIndex] + this.cols[colIndex];
                const x = colIndex * this.sectorSize;
                const y = rowIndex * this.sectorSize;
                
                this.sectors.push({
                    id: sectorId,
                    x: x,
                    y: y,
                    width: this.sectorSize,
                    height: this.sectorSize,
                    centerX: x + this.sectorSize / 2,
                    centerY: y + this.sectorSize / 2,
                    row: this.rows[rowIndex],
                    col: this.cols[colIndex],
                    rowIndex: rowIndex,
                    colIndex: colIndex,
                    // Proprietà per il gameplay
                    type: this.getRandomSectorType(),
                    danger: this.getRandomDangerLevel(),
                    resources: this.getRandomResources()
                });
            }
        }
    }
    
    getRandomSectorType() {
        const types = ['normal', 'asteroid', 'nebula', 'station', 'danger'];
        const weights = [40, 20, 15, 15, 10]; // Probabilità per tipo
        
        const random = Math.random() * 100;
        let cumulative = 0;
        
        for (let i = 0; i < types.length; i++) {
            cumulative += weights[i];
            if (random <= cumulative) {
                return types[i];
            }
        }
        
        return 'normal';
    }
    
    getRandomDangerLevel() {
        return Math.floor(Math.random() * 5) + 1; // 1-5
    }
    
    getRandomResources() {
        const hasResources = Math.random() < 0.3; // 30% chance
        if (!hasResources) return null;
        
        return {
            credits: Math.floor(Math.random() * 1000) + 100,
            uridium: Math.floor(Math.random() * 50) + 10
        };
    }
    
    // Trova il settore in cui si trova una posizione
    getSectorAt(x, y) {
        const colIndex = Math.floor(x / this.sectorSize);
        const rowIndex = Math.floor(y / this.sectorSize);
        
        if (rowIndex >= 0 && rowIndex < this.rows.length && 
            colIndex >= 0 && colIndex < this.cols.length) {
            return this.sectors[rowIndex * this.cols.length + colIndex];
        }
        
        return null;
    }
    
    // Ottieni tutti i settori
    getAllSectors() {
        return this.sectors;
    }
    
    // Ottieni settori adiacenti
    getAdjacentSectors(sector) {
        const adjacent = [];
        const directions = [
            { row: -1, col: 0 }, // Sopra
            { row: 1, col: 0 },  // Sotto
            { row: 0, col: -1 }, // Sinistra
            { row: 0, col: 1 }   // Destra
        ];
        
        directions.forEach(dir => {
            const newRowIndex = sector.rowIndex + dir.row;
            const newColIndex = sector.colIndex + dir.col;
            
            if (newRowIndex >= 0 && newRowIndex < this.rows.length && 
                newColIndex >= 0 && newColIndex < this.cols.length) {
                const adjacentSector = this.sectors[newRowIndex * this.cols.length + newColIndex];
                adjacent.push(adjacentSector);
            }
        });
        
        return adjacent;
    }
    
    // Disegna la griglia dei settori nella minimappa usando l'immagine
    drawSectorGrid(ctx, minimapX, minimapY, minimapWidth, minimapHeight) {
        if (!this.gridImageLoaded || !this.gridImage) return;
        
        ctx.save();
        
        // Disegna l'immagine della griglia scalata per adattarsi alla minimappa
        ctx.drawImage(
            this.gridImage,
            minimapX, minimapY, minimapWidth, minimapHeight
        );
        
        ctx.restore();
    }
    
    // Ottieni informazioni su un settore
    getSectorInfo(sectorId) {
        return this.sectors.find(sector => sector.id === sectorId);
    }
}
