// Sistema Visualizzazione Mappe - Design Esagonale Spaziale
export class MapSystem {
    constructor() {
        this.isOpen = false;
        this.selectedMap = null;
        this.mapConnections = {
            'x1': {
                name: 'X1',
                fullName: 'Settore Principale',
                description: 'Zona di partenza con Streuner - Currently the weakest of aliens',
                connections: ['x2'],
                npcType: 'npc_x1',
                color: '#ff6b6b',
                status: 'accessible', // accessible, locked, current
                position: { x: 200, y: 250 },
                level: 1,
                difficulty: 'Facile'
            },
            'x2': {
                name: 'X2',
                fullName: 'Settore Secondario', 
                description: 'Zona avanzata con Streuner Elite - Enhanced aliens',
                connections: ['x1', 'x3'],
                npcType: 'npc_x2',
                color: '#ff4444',
                status: 'accessible',
                position: { x: 500, y: 250 },
                level: 2,
                difficulty: 'Medio'
            },
            'x3': {
                name: 'X3',
                fullName: 'Settore Asteroidi',
                description: 'Zona ricca di asteroidi - Nessun nemico, solo risorse',
                connections: ['x2', 'x4'],
                npcType: null, // Nessun NPC, solo asteroidi
                color: '#ffa500',
                status: 'accessible',
                position: { x: 800, y: 250 },
                level: 3,
                difficulty: 'Facile'
            },
            'x4': {
                name: 'X4',
                fullName: 'Settore Minerario',
                description: 'Zona mineraria avanzata - Asteroidi preziosi',
                connections: ['x3', 'x5'],
                npcType: null, // Nessun NPC, solo asteroidi
                color: '#ff8c00',
                status: 'accessible',
                position: { x: 200, y: 450 },
                level: 4,
                difficulty: 'Medio'
            },
            'x5': {
                name: 'X5',
                fullName: 'Settore Estremo',
                description: 'Zona più lontana - Asteroidi rari e pericolosi',
                connections: ['x4'],
                npcType: null, // Nessun NPC, solo asteroidi
                color: '#ff6347',
                status: 'accessible',
                position: { x: 500, y: 450 },
                level: 5,
                difficulty: 'Difficile'
            }
        };
    }
    
    toggle() {
        this.isOpen = !this.isOpen;
    }
    
    isKeyPressed(key) {
        return this.isOpen && key === 'KeyM';
    }
    
    draw(ctx, currentMap) {
        if (!this.isOpen) return;
        
        const canvas = ctx.canvas;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const panelWidth = 1000;
        const panelHeight = 700;
        
        // Sfondo spaziale con stelle
        this.drawSpaceBackground(ctx, canvas.width, canvas.height);
        
        // Pannello principale
        const panelX = centerX - panelWidth/2;
        const panelY = centerY - panelHeight/2;
        
        // Ombra del pannello
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(panelX + 10, panelY + 10, panelWidth, panelHeight);
        
        // Gradiente del pannello spaziale
        const gradient = ctx.createLinearGradient(panelX, panelY, panelX, panelY + panelHeight);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f0f23');
        ctx.fillStyle = gradient;
        ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
        
        // Bordo del pannello elegante
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
        
        // Bordo interno
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 1;
        ctx.strokeRect(panelX + 2, panelY + 2, panelWidth - 4, panelHeight - 4);
        
        // Titolo spaziale
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Sistema Mappe Spaziali', centerX, centerY - 300);
        
        // Sottotitolo
        ctx.fillStyle = '#cccccc';
        ctx.font = '18px Arial';
        ctx.fillText('Naviga tra i settori della galassia', centerX, centerY - 270);
        
        // Disegna connessioni prima dei nodi
        this.drawConnections(ctx, centerX, centerY);
        
        // Disegna nodi mappe
        Object.entries(this.mapConnections).forEach(([mapId, mapData]) => {
            this.drawHexagonalNode(ctx, mapData, mapId === currentMap, centerX, centerY);
        });
        
        // Legenda connessioni
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Legenda Connessioni:', centerX - 400, centerY + 280);
        
        const legendItems = [
            { color: '#4CAF50', text: 'X1 → X2 (Stazione)' },
            { color: '#2196F3', text: 'X2 → X3 (Asteroidi)' },
            { color: '#FF9800', text: 'X3 → X4 (Minerario)' },
            { color: '#F44336', text: 'X4 → X5 (Estremo)' }
        ];
        
        legendItems.forEach((item, index) => {
            const y = centerY + 300 + (index * 20);
            ctx.fillStyle = item.color;
            ctx.fillRect(centerX - 380, y - 8, 15, 15);
            ctx.fillStyle = '#cccccc';
            ctx.font = '12px Arial';
            ctx.fillText(item.text, centerX - 360, y);
        });
        
        // Istruzioni
        ctx.fillStyle = '#cccccc';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Premi M per chiudere • Click sui nodi per selezionare', centerX, centerY + 380);
    }
    
    // Disegna sfondo spaziale con stelle
    drawSpaceBackground(ctx, width, height) {
        // Sfondo base
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, width, height);
        
        // Stelle piccole
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 150; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 1.5 + 0.5;
            ctx.fillRect(x, y, size, size);
        }
        
        // Stelle medie
        ctx.fillStyle = '#cccccc';
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 2 + 1;
            ctx.fillRect(x, y, size, size);
        }
        
        // Stelle grandi (poche)
        ctx.fillStyle = '#aaaaaa';
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 3 + 2;
            ctx.fillRect(x, y, size, size);
        }
    }
    
    // Disegna nodo esagonale
    drawHexagonalNode(ctx, mapData, isCurrent, centerX, centerY) {
        const x = centerX + mapData.position.x - 500;
        const y = centerY + mapData.position.y - 350;
        const size = 60;
        
        // Ombra dell'esagono
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.drawHexagon(ctx, x + 3, y + 3, size);
        ctx.fill();
        
        // Gradiente dell'esagono
        const hexGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        if (isCurrent) {
            hexGradient.addColorStop(0, '#ffffff');
            hexGradient.addColorStop(0.5, '#f0f0f0');
            hexGradient.addColorStop(1, '#e0e0e0');
        } else if (mapData.status === 'locked') {
            hexGradient.addColorStop(0, '#444444');
            hexGradient.addColorStop(1, '#222222');
        } else {
            hexGradient.addColorStop(0, '#888888');
            hexGradient.addColorStop(0.5, '#666666');
            hexGradient.addColorStop(1, '#444444');
        }
        
        ctx.fillStyle = hexGradient;
        this.drawHexagon(ctx, x, y, size);
        ctx.fill();
        
        // Bordo dell'esagono
        ctx.strokeStyle = isCurrent ? '#ffffff' : (mapData.status === 'locked' ? '#333333' : '#666666');
        ctx.lineWidth = isCurrent ? 3 : 2;
        this.drawHexagon(ctx, x, y, size);
        ctx.stroke();
        
        // Bordo interno
        ctx.strokeStyle = isCurrent ? '#cccccc' : '#888888';
        ctx.lineWidth = 1;
        this.drawHexagon(ctx, x, y, size - 2);
        ctx.stroke();
        
        // Nome mappa
        ctx.fillStyle = isCurrent ? '#000000' : '#ffffff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(mapData.name, x, y);
        
        // Livello e difficoltà
        ctx.font = '12px Arial';
        ctx.fillStyle = isCurrent ? '#000000' : '#cccccc';
        ctx.fillText(`Livello ${mapData.level}`, x, y - 35);
        ctx.fillText(mapData.difficulty, x, y + 35);
        
        // Indicatore mappa corrente
        if (isCurrent) {
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 16px Arial';
            ctx.fillText('●', x, y + 25);
        }
        
        // Indicatore di stato (solo per mappe bloccate)
        if (mapData.status === 'locked') {
            ctx.font = 'bold 12px Arial';
            ctx.fillStyle = '#ff0000';
            ctx.fillText('LOCKED', x, y - 50);
        }
    }
    
    // Disegna esagono
    drawHexagon(ctx, x, y, size) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const hexX = x + size * Math.cos(angle);
            const hexY = y + size * Math.sin(angle);
            if (i === 0) {
                ctx.moveTo(hexX, hexY);
            } else {
                ctx.lineTo(hexX, hexY);
            }
        }
        ctx.closePath();
    }
    
    drawConnections(ctx, centerX, centerY) {
        // Funzione helper per ottenere le coordinate di una mappa
        const getMapCoords = (mapId) => {
            const mapData = this.mapConnections[mapId];
            return {
                x: centerX + mapData.position.x - 500,
                y: centerY + mapData.position.y - 350
            };
        };
        
        // Funzione helper per disegnare una connessione
        const drawConnection = (fromMap, toMap, color = '#ffffff') => {
            const from = getMapCoords(fromMap);
            const to = getMapCoords(toMap);
            
            // Ombra della connessione
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.lineWidth = 6;
            ctx.setLineDash([12, 8]);
            ctx.beginPath();
            ctx.moveTo(from.x + 60, from.y + 3);
            ctx.lineTo(to.x - 60, to.y + 3);
            ctx.stroke();
            
            // Connessione principale
            ctx.strokeStyle = color;
            ctx.lineWidth = 4;
            ctx.setLineDash([12, 8]);
            ctx.beginPath();
            ctx.moveTo(from.x + 60, from.y);
            ctx.lineTo(to.x - 60, to.y);
            ctx.stroke();
            
            // Freccia
            const angle = Math.atan2(to.y - from.y, to.x - from.x);
            const arrowLength = 15;
            const arrowAngle = Math.PI / 6;
            
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(to.x - 60, to.y);
            ctx.lineTo(
                to.x - 60 - arrowLength * Math.cos(angle - arrowAngle),
                to.y - arrowLength * Math.sin(angle - arrowAngle)
            );
            ctx.lineTo(
                to.x - 60 - arrowLength * Math.cos(angle + arrowAngle),
                to.y - arrowLength * Math.sin(angle + arrowAngle)
            );
            ctx.closePath();
            ctx.fill();
        };
        
        // Disegna tutte le connessioni
        drawConnection('x1', 'x2', '#4CAF50'); // Verde per X1->X2
        drawConnection('x2', 'x3', '#2196F3'); // Blu per X2->X3
        drawConnection('x3', 'x4', '#FF9800'); // Arancione per X3->X4
        drawConnection('x4', 'x5', '#F44336'); // Rosso per X4->X5
        
        // Reset line dash
        ctx.setLineDash([]);
    }
    
    
    // Gestisce il click sui nodi
    handleClick(x, y, currentMap, mapManager) {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        for (const [mapId, mapData] of Object.entries(this.mapConnections)) {
            const nodeX = centerX + mapData.position.x - 500;
            const nodeY = centerY + mapData.position.y - 350;
            
            // Controlla se il click è dentro l'esagono
            if (this.isPointInHexagon(x, y, nodeX, nodeY, 60)) {
                if (mapData.status !== 'locked' && mapId !== currentMap) {
                    this.selectedMap = mapId;
                    console.log(`Mappa selezionata: ${mapData.name}`);
                    
                    // Cambia effettivamente la mappa
                    if (mapManager) {
                        mapManager.changeMap(mapId, mapManager.game.ship);
                        this.isOpen = false; // Chiudi il sistema mappe dopo il cambio
                    }
                    
                    return true; // Click gestito
                } else if (mapId === currentMap) {
                    console.log(`Sei già nella mappa ${mapData.name}`);
                    return true; // Click gestito anche se sulla mappa corrente
                } else if (mapData.status === 'locked') {
                    console.log(`Mappa ${mapData.name} è bloccata`);
                    return true; // Click gestito anche se bloccata
                }
            }
        }
        return false; // Click non gestito
    }
    
    // Controlla se un punto è dentro un esagono
    isPointInHexagon(px, py, hexX, hexY, hexSize) {
        const dx = px - hexX;
        const dy = py - hexY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= hexSize;
    }
    
    // Ottiene la mappa selezionata
    getSelectedMap() {
        return this.selectedMap;
    }
    
    // Pulisce la selezione
    clearSelection() {
        this.selectedMap = null;
    }
    
    // Metodi helper per i colori
    lightenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    
    darkenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
            (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
            (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
    }
}
