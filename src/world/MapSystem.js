// Sistema Visualizzazione Mappe - Design Basato su Fazioni
export class MapSystem {
    constructor() {
        this.isOpen = false;
        this.selectedMap = null;
        this.factionSystem = null; // Sarà impostato dal game
        this.mapConnections = {
            // MAPPE VRU (VENUS)
            'v1': {
                name: 'V1',
                fullName: 'Venus Research Station Alpha',
                description: 'Stazione di ricerca avanzata con tecnologie all\'avanguardia',
                connections: ['v2'],
                faction: 'venus',
                npcType: 'streuner_vru',
                color: '#9b59b6',
                status: 'accessible',
                position: { x: 100, y: 150 },
                level: 1,
                difficulty: 'Facile',
                hasBase: true,
                hasTrading: true
            },
            'v2': {
                name: 'V2',
                fullName: 'Venus Research Station Beta',
                description: 'Laboratorio di ricerca secondario con esperimenti avanzati',
                connections: ['v1', 'v3'],
                faction: 'venus',
                npcType: 'lordakia_vru',
                color: '#9b59b6',
                status: 'accessible',
                position: { x: 300, y: 150 },
                level: 2,
                difficulty: 'Medio',
                hasBase: false,
                hasTrading: false
            },
            'v3': {
                name: 'V3',
                fullName: 'Venus Research Station Gamma',
                description: 'Centro di ricerca principale con tecnologie sperimentali',
                connections: ['v2'],
                faction: 'venus',
                npcType: 'saimon_vru',
                color: '#9b59b6',
                status: 'accessible',
                position: { x: 500, y: 150 },
                level: 3,
                difficulty: 'Medio',
                hasBase: true,
                hasTrading: true
            },
            'v4': {
                name: 'V4',
                fullName: 'Venus Research Station Delta',
                description: 'Zona di test per nuove tecnologie e armi',
                connections: ['t-1', 'v5'],
                faction: 'venus',
                npcType: 'sibelonit_vru',
                color: '#9b59b6',
                status: 'accessible',
                position: { x: 700, y: 150 },
                level: 4,
                difficulty: 'Difficile',
                hasBase: false,
                hasTrading: false
            },
            'v5': {
                name: 'V5',
                fullName: 'Venus Research Station Omega',
                description: 'Stazione di ricerca principale con tecnologie più avanzate',
                connections: ['v4', 'v6'],
                faction: 'venus',
                npcType: 'kristallin_vru',
                color: '#9b59b6',
                status: 'accessible',
                position: { x: 900, y: 150 },
                level: 5,
                difficulty: 'Difficile',
                hasBase: true,
                hasTrading: true
            },
            'v6': {
                name: 'V6',
                fullName: 'Venus Research Station Epsilon',
                description: 'Zona di ricerca avanzata con esperimenti pericolosi',
                connections: ['v5'],
                faction: 'venus',
                npcType: 'cubikon_vru',
                color: '#9b59b6',
                status: 'locked',
                position: { x: 1100, y: 150 },
                level: 6,
                difficulty: 'Estremo',
                hasBase: false,
                hasTrading: false
            },

            // MAPPE MMO (MARS)
            'm1': {
                name: 'M1',
                fullName: 'Mars Mining Outpost Alpha',
                description: 'Avamposto minerario principale con estrazione di risorse',
                connections: ['m2'],
                faction: 'mars',
                npcType: 'streuner_mmo',
                color: '#e74c3c',
                status: 'accessible',
                position: { x: 100, y: 350 },
                level: 1,
                difficulty: 'Facile',
                hasBase: true,
                hasTrading: true
            },
            'm2': {
                name: 'M2',
                fullName: 'Mars Mining Outpost Beta',
                description: 'Zona di estrazione secondaria con miniere attive',
                connections: ['m1', 'm3'],
                faction: 'mars',
                npcType: 'lordakia_mmo',
                color: '#e74c3c',
                status: 'accessible',
                position: { x: 300, y: 350 },
                level: 2,
                difficulty: 'Medio',
                hasBase: false,
                hasTrading: false
            },
            'm3': {
                name: 'M3',
                fullName: 'Mars Mining Outpost Gamma',
                description: 'Centro di produzione mineraria con raffinerie',
                connections: ['m2'],
                faction: 'mars',
                npcType: 'saimon_mmo',
                color: '#e74c3c',
                status: 'accessible',
                position: { x: 500, y: 350 },
                level: 3,
                difficulty: 'Medio',
                hasBase: true,
                hasTrading: true
            },
            'm4': {
                name: 'M4',
                fullName: 'Mars Mining Outpost Delta',
                description: 'Zona di estrazione profonda con miniere pericolose',
                connections: ['t-1', 'm5'],
                faction: 'mars',
                npcType: 'sibelonit_mmo',
                color: '#e74c3c',
                status: 'accessible',
                position: { x: 700, y: 350 },
                level: 4,
                difficulty: 'Difficile',
                hasBase: false,
                hasTrading: false
            },
            'm5': {
                name: 'M5',
                fullName: 'Mars Mining Outpost Epsilon',
                description: 'Centro di produzione principale con raffinerie avanzate',
                connections: ['m4', 'm6'],
                faction: 'mars',
                npcType: 'kristallin_mmo',
                color: '#e74c3c',
                status: 'accessible',
                position: { x: 900, y: 350 },
                level: 5,
                difficulty: 'Difficile',
                hasBase: true,
                hasTrading: true
            },
            'm6': {
                name: 'M6',
                fullName: 'Mars Mining Outpost Omega',
                description: 'Zona di estrazione estrema con miniere più profonde',
                connections: ['m5'],
                faction: 'mars',
                npcType: 'cubikon_mmo',
                color: '#e74c3c',
                status: 'locked',
                position: { x: 1100, y: 350 },
                level: 6,
                difficulty: 'Estremo',
                hasBase: false,
                hasTrading: false
            },

            // MAPPE EIC (EIC)
            'e1': {
                name: 'E1',
                fullName: 'Earth Industries Corporation Alpha',
                description: 'Sede principale della corporazione terrestre',
                connections: ['e2'],
                faction: 'eic',
                npcType: 'streuner_eic',
                color: '#4a90e2',
                status: 'accessible',
                position: { x: 100, y: 550 },
                level: 1,
                difficulty: 'Facile',
                hasBase: true,
                hasTrading: true
            },
            'e2': {
                name: 'E2',
                fullName: 'Earth Industries Corporation Beta',
                description: 'Centro commerciale secondario con mercati attivi',
                connections: ['e1', 'e3'],
                faction: 'eic',
                npcType: 'lordakia_eic',
                color: '#4a90e2',
                status: 'accessible',
                position: { x: 300, y: 550 },
                level: 2,
                difficulty: 'Medio',
                hasBase: false,
                hasTrading: true
            },
            'e3': {
                name: 'E3',
                fullName: 'Earth Industries Corporation Gamma',
                description: 'Hub commerciale principale con scambi interplanetari',
                connections: ['e2'],
                faction: 'eic',
                npcType: 'saimon_eic',
                color: '#4a90e2',
                status: 'accessible',
                position: { x: 500, y: 550 },
                level: 3,
                difficulty: 'Medio',
                hasBase: true,
                hasTrading: true
            },
            'e4': {
                name: 'E4',
                fullName: 'Earth Industries Corporation Delta',
                description: 'Zona di produzione industriale con fabbriche',
                connections: ['t-1', 'e5'],
                faction: 'eic',
                npcType: 'sibelonit_eic',
                color: '#4a90e2',
                status: 'accessible',
                position: { x: 700, y: 550 },
                level: 4,
                difficulty: 'Difficile',
                hasBase: false,
                hasTrading: false
            },
            'e5': {
                name: 'E5',
                fullName: 'Earth Industries Corporation Epsilon',
                description: 'Centro di produzione avanzata con tecnologie industriali',
                connections: ['e4', 'e6'],
                faction: 'eic',
                npcType: 'kristallin_eic',
                color: '#4a90e2',
                status: 'accessible',
                position: { x: 900, y: 550 },
                level: 5,
                difficulty: 'Difficile',
                hasBase: true,
                hasTrading: true
            },
            'e6': {
                name: 'E6',
                fullName: 'Earth Industries Corporation Omega',
                description: 'Sede centrale della corporazione con tecnologie più avanzate',
                connections: ['e5'],
                faction: 'eic',
                npcType: 'cubikon_eic',
                color: '#4a90e2',
                status: 'locked',
                position: { x: 1100, y: 550 },
                level: 6,
                difficulty: 'Estremo',
                hasBase: false,
                hasTrading: false
            },

            // MAPPA PVP CENTRALE
            't-1': {
                name: 'T-1',
                fullName: 'PvP Battle Zone',
                description: 'Zona di combattimento PvP tra fazioni - Attualmente vuota',
                connections: ['v3', 'v4', 'm3', 'm4', 'e3', 'e4'],
                faction: 'neutral',
                npcType: null,
                color: '#f39c12',
                status: 'accessible',
                position: { x: 600, y: 350 },
                level: 0,
                difficulty: 'PvP',
                hasBase: false,
                hasTrading: false,
                isPvP: true
            }
        };
    }

    /**
     * Imposta il sistema fazioni
     */
    setFactionSystem(factionSystem) {
        this.factionSystem = factionSystem;
    }

    /**
     * Mostra/nasconde il pannello mappe
     */
    toggle() {
        this.isOpen = !this.isOpen;
    }
    
    /**
     * Controlla se il giocatore può accedere a una mappa
     */
    canAccessMap(mapId) {
        const map = this.mapConnections[mapId];
        if (!map) return false;

        // T-1 è sempre accessibile
        if (mapId === 't-1') return true;

        // Se non c'è sistema fazioni, tutte le mappe sono accessibili
        if (!this.factionSystem) return true;

        // Per ora tutte le mappe sono accessibili (livello minimo da implementare in futuro)
        // TODO: Aggiungere controllo livello minimo per mappe nemiche
        return true;
    }

    /**
     * Ottiene le mappe accessibili per la fazione corrente
     */
    getAccessibleMaps() {
        // Per ora tutte le mappe sono accessibili (livello minimo da implementare in futuro)
        // TODO: Aggiungere controllo livello minimo per mappe nemiche
        return Object.values(this.mapConnections);
    }

    /**
     * Disegna il sistema mappe
     */
    draw(ctx, currentMap) {
        if (!this.isOpen) return;
        
        const canvas = ctx.canvas;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Sfondo semi-trasparente
        ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Pannello principale
        const panelWidth = 1200;
        const panelHeight = 700;
        const panelX = centerX - panelWidth / 2;
        const panelY = centerY - panelHeight / 2;

        // Sfondo pannello
        ctx.fillStyle = 'rgba(10, 10, 15, 0.95)';
        
        // Disegna pannello con angoli arrotondati
        ctx.beginPath();
        ctx.roundRect(panelX, panelY, panelWidth, panelHeight, 10);
        ctx.fill();
        
        // Bordo bianco sottile
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Reset shadow per il testo
        ctx.shadowBlur = 0;
        
        // Titolo con stile minimale
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px "Orbitron", Arial';
        ctx.textAlign = 'center';
        ctx.fillText('MAPPA SPAZIALE', centerX, panelY + 40);

        // Disegna le connessioni
        this.drawConnections(ctx, panelX, panelY);

        // Disegna i nodi
        this.drawNodes(ctx, panelX, panelY, currentMap);

        // Pulsante chiudi
        this.drawCloseButton(ctx, panelX + panelWidth - 50, panelY + 20);

        // Info giocatore
        this.drawPlayerInfo(ctx, panelX + 20, panelY + panelHeight - 60, currentMap);

        ctx.textAlign = 'left';
    }

    /**
     * Disegna le connessioni tra i nodi
     */
    // Converte colore hex in RGB
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
    }

    drawConnections(ctx, panelX, panelY) {
        // Disegna tutte le connessioni
        Object.values(this.mapConnections).forEach(map => {
            map.connections.forEach(connectionId => {
                const connectedMap = this.mapConnections[connectionId];
                if (connectedMap) {
                    const baseColor = map.color;
                    const isT1Connection = connectionId === 't-1' || map.id === 't-1';

                    // Linea base
                    ctx.strokeStyle = isT1Connection ? 
                        'rgba(243, 156, 18, 0.3)' : 
                        `rgba(${this.hexToRgb(baseColor)}, 0.2)`;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(panelX + map.position.x, panelY + map.position.y);
                    ctx.lineTo(panelX + connectedMap.position.x, panelY + connectedMap.position.y);
                    ctx.stroke();

                    // Linea sottile sopra
                    ctx.strokeStyle = isT1Connection ? 
                        'rgba(243, 156, 18, 0.5)' : 
                        `rgba(${this.hexToRgb(baseColor)}, 0.4)`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(panelX + map.position.x, panelY + map.position.y);
                    ctx.lineTo(panelX + connectedMap.position.x, panelY + connectedMap.position.y);
                    ctx.stroke();
                }
            });
        });
    }

    /**
     * Disegna i nodi delle mappe
     */
    drawNodes(ctx, panelX, panelY, currentMap) {
        const currentFaction = this.factionSystem?.getCurrentFaction();
        
        Object.entries(this.mapConnections).forEach(([mapId, map]) => {
            const x = panelX + map.position.x;
            const y = panelY + map.position.y;
            const isCurrent = mapId === currentMap;
            const canAccess = this.canAccessMap(mapId);
            const isEnemyMap = currentFaction && map.faction !== 'neutral' && map.faction !== currentFaction.id;

            // Sfondo del nodo
            let baseColor = mapId === 't-1' ? '#f39c12' : map.color;
            ctx.fillStyle = isCurrent ? `rgba(${this.hexToRgb(baseColor)}, 0.2)` : 
                           mapId === 't-1' ? 'rgba(243, 156, 18, 0.15)' : 
                           `rgba(${this.hexToRgb(baseColor)}, 0.1)`;
            
            // Disegna il nodo con angoli arrotondati
            ctx.beginPath();
            ctx.roundRect(x - 30, y - 15, 60, 30, 5);
            ctx.fill();

            // Bordo del nodo
            if (isCurrent) {
                ctx.strokeStyle = baseColor;
                ctx.lineWidth = 2;
            } else if (mapId === 't-1') {
                ctx.strokeStyle = 'rgba(243, 156, 18, 0.7)';
                ctx.lineWidth = 2;
            } else {
                ctx.strokeStyle = `rgba(${this.hexToRgb(baseColor)}, 0.5)`;
                ctx.lineWidth = 1;
            }
            ctx.stroke();

            // Reset shadow per il testo
            ctx.shadowBlur = 0;

            // Nome della mappa
            ctx.fillStyle = canAccess ? '#ffffff' : '#666666';
            ctx.font = `bold 12px "Orbitron", Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(map.name, x, y + 5);

            // Icona PvP minimalista
            if (map.isPvP) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.font = '14px Arial';
                ctx.fillText('⚔️', x, y - 20);
            }

            // Rimuovi indicatore livello
        });
    }

    /**
     * Disegna il pulsante chiudi
     */
    drawCloseButton(ctx, x, y) {
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(x, y, 30, 30);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, 30, 30);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('×', x + 15, y + 20);
    }


    /**
     * Disegna le informazioni del giocatore
     */
    drawPlayerInfo(ctx, x, y, currentMap) {
        const map = this.mapConnections[currentMap];
        const mapName = map ? map.name : 'Mappa sconosciuta';
        const fullMapName = map ? map.fullName : 'Mappa sconosciuta';
        const currentFaction = this.factionSystem?.getCurrentFaction();
        const isEnemyMap = currentFaction && map && map.faction !== 'neutral' && map.faction !== currentFaction.id;

        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Ti trovi attualmente in - ${mapName}`, x, y);
        ctx.fillText(`${fullMapName}`, x, y + 20);
        
        // Mostra la fazione se presente
        if (map && map.faction && map.faction !== 'neutral') {
            const factionName = map.faction.toUpperCase();
            ctx.fillStyle = map.color;
            ctx.fillText(`Fazione: ${factionName}`, x, y + 40);
            
            // Avviso se sei in territorio nemico
            if (isEnemyMap) {
                ctx.fillStyle = '#ff4444';
                ctx.font = 'bold 12px Arial';
                ctx.fillText('⚠️ TERRITORIO NEMICO!', x, y + 60);
            }
        }
    }

    /**
     * Gestisce i click sui nodi
     */
    handleClick(x, y, currentMap, mapManager) {
        if (!this.isOpen) return false;

        const canvas = this.ctx?.canvas || document.getElementById('gameCanvas');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const panelX = centerX - 600;
        const panelY = centerY - 350;

        // Pulsante chiudi
        if (x >= panelX + 1150 && x <= panelX + 1180 && y >= panelY + 20 && y <= panelY + 50) {
            this.isOpen = false;
            return true;
        }

        // Click sui nodi
        Object.entries(this.mapConnections).forEach(([mapId, map]) => {
            const nodeX = panelX + map.position.x;
            const nodeY = panelY + map.position.y;

            if (x >= nodeX - 30 && x <= nodeX + 30 && y >= nodeY - 15 && y <= nodeY + 15) {
                if (this.canAccessMap(mapId) && mapId !== currentMap) {
                    // Cambia mappa
                    mapManager.changeMap(mapId);
                    this.isOpen = false;
                    return true;
                }
            }
        });

        return true; // Blocca altri click
    }
}