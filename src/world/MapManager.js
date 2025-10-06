import { Portal } from './Portal.js';
import { Enemy } from '../entities/Enemy.js';
import { BonusBox } from '../entities/BonusBox.js';
import { InteractiveAsteroid } from '../entities/InteractiveAsteroid.js';
import { SpaceStation } from '../entities/SpaceStation.js';
import { MapInstance } from './MapInstance.js';
import { MapServer } from './MapServer.js';
import { MapPersistence } from './MapPersistence.js';
import { ObjectManager } from './ObjectManager.js';
import { GameConfig } from '../config/GameConfig.js';

// Gestore delle mappe e portali
export class MapManager {
    constructor(game) {
        this.game = game;
        // Imposta mappa iniziale basata sulla fazione, se disponibile
        const savedFaction = (() => {
            try { return localStorage.getItem('mmorpg_player_faction'); } catch (_) { return null; }
        })();
        const faction = this.game?.ship?.faction || savedFaction || 'venus';
        const startByFaction = { venus: 'v1', mars: 'm1', eic: 'e1' };
        this.currentMap = startByFaction[faction] || 'v1';
        
        // Nuovo sistema di mappe separate
        this.mapServer = new MapServer();
        this.currentPlayerId = 'player_' + Date.now(); // ID temporaneo per il giocatore
        
        // Sistema di persistenza legacy (mantenuto per compatibilità)
        this.persistence = new MapPersistence();
        this.objectManager = new ObjectManager();
        this.currentInstance = null;
        
        // Configurazione mappe (ora in MapInstance)
        this.portals = [];
        this.initPortals();
        
        // Carica istanza iniziale
        this.loadCurrentMapInstance();
        
        // Registra il giocatore nella mappa corrente
        this.registerPlayerInCurrentMap();
    }
    
    // Registra il giocatore nella mappa corrente
    registerPlayerInCurrentMap() {
        const playerData = {
            id: this.currentPlayerId,
            position: { x: this.game.ship.x, y: this.game.ship.y },
            faction: this.game.ship.faction || 'venus',
            stats: {
                hp: this.game.ship.hp || 100,
                shield: this.game.ship.shield || 50,
                maxHp: this.game.ship.maxHp || 100,
                maxShield: this.game.ship.maxShield || 50
            }
        };
        
        this.mapServer.playerChangeMap(playerData, null, this.currentMap);
    }
    
    // Aggiorna posizione del giocatore nel sistema di mappe
    updatePlayerPosition() {
        const currentMapInstance = this.mapServer.getPlayerMap(this.currentPlayerId);
        if (currentMapInstance) {
            currentMapInstance.updatePlayerPosition(this.currentPlayerId, {
                x: this.game.ship.x,
                y: this.game.ship.y
            });
        }
    }
    
    // Ottieni statistiche della mappa corrente
    getCurrentMapStats() {
        return this.mapServer.getMapStats(this.currentMap);
    }
    
    // Ottieni tutti i giocatori nella mappa corrente
    getPlayersInCurrentMap() {
        return this.mapServer.getPlayersInMap(this.currentMap);
    }
    
    // Debug: mostra informazioni mappe separate
    debugShowMapInfo() {
        const stats = this.getSystemStats();
        console.log('=== MAP SYSTEM DEBUG ===');
        console.log('Current Map:', stats.currentMap);
        console.log('Global Stats:', stats.mapServerStats);
        console.log('Current Map Stats:', stats.currentMapStats);
        
        // Mostra giocatori nella mappa corrente
        const players = this.getPlayersInCurrentMap();
        console.log('Players in current map:', players.length);
        players.forEach(player => {
            console.log(`  - ${player.id}: ${player.faction} at (${player.position.x}, ${player.position.y})`);
        });
        
        // Mostra statistiche di tutte le mappe
        Object.entries(stats.mapServerStats.maps).forEach(([mapId, mapStats]) => {
            console.log(`${mapId}: ${mapStats.playerCount}/${mapStats.maxPlayers} players, ${mapStats.activeCombats} combats`);
        });
    }
    
    // Inizializza i portali (ora crea solo i portali per la mappa corrente)
    initPortals() {
        this.portals = []; // Pulisci i portali esistenti
        this.createPortalsForCurrentMap();
    }
    
    // Crea i portali per la mappa corrente - SISTEMA SEMPLICE: navigazione lineare X1->X2->X3->X4->X5
    createPortalsForCurrentMap() {
        this.portals = []; // Pulisci i portali esistenti
        
        
        if (this.currentMap === 'v1') {
            // V1 -> V2 (lato destro)
            this.portals.push(new Portal(15000, 5000, 'v2', 1000, 5000, this.game));
        } else if (this.currentMap === 'v2') {
            // V2 -> V1 (sinistra) e V2 -> V3 (destra)
            this.portals.push(new Portal(1000, 5000, 'v1', 15000, 5000, this.game));
            this.portals.push(new Portal(15000, 5000, 'v3', 1000, 5000, this.game));
        } else if (this.currentMap === 'v3') {
            // V3 -> V2 (sinistra) e V3 -> T-1 (destra)
            this.portals.push(new Portal(1000, 5000, 'v2', 15000, 5000, this.game));
            this.portals.push(new Portal(15000, 5000, 't-1', 1000, 5000, this.game));
        } else if (this.currentMap === 'v4') {
            // V4 -> T-1 (sinistra) e V4 -> V5 (destra)
            this.portals.push(new Portal(1000, 5000, 't-1', 15000, 5000, this.game));
            this.portals.push(new Portal(15000, 5000, 'v5', 1000, 5000, this.game));
        } else if (this.currentMap === 'v5') {
            // V5 -> V4 (sinistra) e V5 -> V6 (destra)
            this.portals.push(new Portal(500, 5000, 'v4', 14000, 5000, this.game));
            this.portals.push(new Portal(15000, 5000, 'v6', 1000, 5000, this.game));
        } else if (this.currentMap === 'v6') {
            // V6 -> V5 (sinistra)
            this.portals.push(new Portal(500, 5000, 'v5', 14000, 5000, this.game));
        } else if (this.currentMap === 't-1') {
            // T-1 -> V3, V4, M3, M4, E3, E4
            this.portals.push(new Portal(1000, 2000, 'v3', 15000, 5000, this.game));  // V3 in alto a sinistra
            this.portals.push(new Portal(15000, 2000, 'v4', 1000, 5000, this.game));  // V4 in alto a destra
            this.portals.push(new Portal(1000, 5000, 'm3', 15000, 5000, this.game));  // M3 al centro sinistra
            this.portals.push(new Portal(15000, 5000, 'm4', 1000, 5000, this.game));  // M4 al centro destra
            this.portals.push(new Portal(1000, 8000, 'e3', 15000, 5000, this.game));  // E3 in basso a sinistra
            this.portals.push(new Portal(15000, 8000, 'e4', 1000, 5000, this.game));  // E4 in basso a destra
        } else if (this.currentMap === 'm1') {
            // M1 -> M2 (destra)
            this.portals.push(new Portal(15000, 5000, 'm2', 1000, 5000, this.game));
        } else if (this.currentMap === 'm2') {
            // M2 -> M1 (sinistra) e M2 -> M3 (destra)
            this.portals.push(new Portal(1000, 5000, 'm1', 15000, 5000, this.game));
            this.portals.push(new Portal(15000, 5000, 'm3', 1000, 5000, this.game));
        } else if (this.currentMap === 'm3') {
            // M3 -> M2 (sinistra) e M3 -> T-1 (destra)
            this.portals.push(new Portal(1000, 5000, 'm2', 15000, 5000, this.game));
            this.portals.push(new Portal(15000, 5000, 't-1', 1000, 5000, this.game));
        } else if (this.currentMap === 'm4') {
            // M4 -> T-1 (sinistra) e M4 -> M5 (destra)
            this.portals.push(new Portal(1000, 5000, 't-1', 15000, 5000, this.game));
            this.portals.push(new Portal(15000, 5000, 'm5', 1000, 5000, this.game));
        } else if (this.currentMap === 'm5') {
            // M5 -> M4 (sinistra) e M5 -> M6 (destra)
            this.portals.push(new Portal(500, 5000, 'm4', 14000, 5000, this.game));
            this.portals.push(new Portal(15000, 5000, 'm6', 1000, 5000, this.game));
        } else if (this.currentMap === 'm6') {
            // M6 -> M5 (sinistra)
            this.portals.push(new Portal(500, 5000, 'm5', 14000, 5000, this.game));
        } else if (this.currentMap === 'e1') {
            // E1 -> E2 (destra)
            this.portals.push(new Portal(15000, 5000, 'e2', 1000, 5000, this.game));
        } else if (this.currentMap === 'e2') {
            // E2 -> E1 (sinistra) e E2 -> E3 (destra)
            this.portals.push(new Portal(1000, 5000, 'e1', 15000, 5000, this.game));
            this.portals.push(new Portal(15000, 5000, 'e3', 1000, 5000, this.game));
        } else if (this.currentMap === 'e3') {
            // E3 -> E2 (sinistra) e E3 -> T-1 (destra)
            this.portals.push(new Portal(1000, 5000, 'e2', 15000, 5000, this.game));
            this.portals.push(new Portal(15000, 5000, 't-1', 1000, 5000, this.game));
        } else if (this.currentMap === 'e4') {
            // E4 -> T-1 (sinistra) e E4 -> E5 (destra)
            this.portals.push(new Portal(1000, 5000, 't-1', 15000, 5000, this.game));
            this.portals.push(new Portal(15000, 5000, 'e5', 1000, 5000, this.game));
        } else if (this.currentMap === 'e5') {
            // E5 -> E4 (sinistra) e E5 -> E6 (destra)
            this.portals.push(new Portal(500, 5000, 'e4', 14000, 5000, this.game));
            this.portals.push(new Portal(15000, 5000, 'e6', 1000, 5000, this.game));
        } else if (this.currentMap === 'e6') {
            // E6 -> E5 (sinistra)
            this.portals.push(new Portal(500, 5000, 'e5', 14000, 5000, this.game));
        } else if (this.currentMap === 'x1') {
            // X2 -> X1 (lato sinistro) e X2 -> X3 (lato destro)
            this.portals.push(new Portal(500, 5000, 'x1', 14000, 5000, this.game));
            this.portals.push(new Portal(15000, 5000, 'x3', 1000, 5000, this.game));
        } else if (this.currentMap === 'x3') {
            // X3 -> X2 (lato sinistro) e X3 -> X4 (lato destro)
            this.portals.push(new Portal(500, 5000, 'x2', 14000, 5000, this.game));
            this.portals.push(new Portal(15000, 5000, 'x4', 1000, 5000, this.game));
        } else if (this.currentMap === 'x4') {
            // X4 -> X3 (lato sinistro) e X4 -> X5 (lato destro)
            this.portals.push(new Portal(500, 5000, 'x3', 14000, 5000, this.game));
            this.portals.push(new Portal(15000, 5000, 'x5', 1000, 5000, this.game));
        }
    }
    
    // Carica istanza della mappa corrente
    loadCurrentMapInstance() {
        this.currentInstance = this.persistence.getOrCreateInstance(this.currentMap);
        
        // Forza rigenerazione se l'istanza ha configurazione vecchia o se è X2 senza Lordakia
        if (this.currentInstance && (!this.currentInstance.config.npcType || 
            (this.currentMap === 'x2' && !this.hasLordakiaInInstance()))) {
            console.log(`🔄 Rigenerando istanza ${this.currentMap} con nuova configurazione NPC`);
            // Rigenera oggetti della mappa
            this.generateMapObjects();
        }
        
        this.syncInstanceToGame();
    }
    
    // Controlla se l'istanza ha Lordakia
    hasLordakiaInInstance() {
        if (!this.currentInstance) return false;
        // Per ora, assumiamo che non ci sia Lordakia nel nuovo sistema
        // TODO: Implementare controllo specifico per NPC
        return false;
    }
    
    // Sincronizza istanza con il gioco
    syncInstanceToGame() {
        if (!this.currentInstance) return;
        
        // Pulisci oggetti esistenti
        this.game.enemies = [];
        this.game.bonusBoxes = [];
        this.game.interactiveAsteroids = [];
        
        // Sincronizza oggetti dall'istanza al gioco
        this.syncObjectsFromInstance();
    }
    
    // Crea nemici dall'istanza
    createEnemiesFromInstance() {
        const enemyObjects = this.currentInstance.getObjectsByType('enemy');
        
        for (const obj of enemyObjects) {
            // Usa npcType dall'oggetto (ora sempre definito)
            const npcType = obj.npcType || this.currentInstance.config.npcType;
            
            const enemy = new Enemy(obj.x, obj.y, npcType);
            enemy.id = obj.id; // Assegna ID per tracking
            
            // Inizializza AI per il nemico
            enemy.initAI(this.game);
            
            this.objectManager.registerObject(obj.id, enemy, 'enemy');
            this.game.enemies.push(enemy);
        }
    }
    
    // Crea bonus box dall'istanza
    createBonusBoxesFromInstance() {
        const boxObjects = this.currentInstance.getObjectsByType('bonusbox');
        for (const obj of boxObjects) {
            if (obj.active) {
                const box = new BonusBox(obj.x, obj.y, this.game);
                box.id = obj.id;
                this.objectManager.registerObject(obj.id, box, 'bonusbox');
                this.game.bonusBoxes.push(box);
            }
        }
    }
    
    // Sincronizza oggetti dall'istanza al gioco
    syncObjectsFromInstance() {
        if (!this.currentInstance) return;
        
        // Genera oggetti basandosi sulla configurazione della mappa
        this.generateMapObjects();
        
        // Crea oggetti dall'istanza (ora che getObjectsByType è implementato)
        this.createEnemiesFromInstance();
        this.createBonusBoxesFromInstance();
        this.createAsteroidsFromInstance();
    }
    
    // Genera oggetti della mappa basandosi sulla configurazione
    generateMapObjects() {
        
        // Solo le mappe X1 hanno stazioni spaziali
        const mapsWithBase = ['v1', 'm1', 'e1'];
        
        // Genera stazione spaziale se la mappa è X1
        if (mapsWithBase.includes(this.currentMap)) {
            this.generateSpaceStation();
        }
        
        // Genera NPC/Nemici
        this.generateNPCs();
        
        // Genera asteroidi interattivi
        this.generateInteractiveAsteroids();
        
        // Genera bonus box
        this.generateBonusBoxes();
    }
    
    // Ottiene configurazione mappa dal MapSystem
    getMapConfigFromSystem() {
        console.log(`🔍 Cercando configurazione per mappa: ${this.currentMap}`);
        console.log(`🎮 Game mapSystem:`, this.game.mapSystem);
        
        if (!this.game.mapSystem) {
            console.warn(`⚠️ Game.mapSystem non disponibile`);
            return null;
        }
        
        const mapConnections = this.game.mapSystem.mapConnections;
        console.log(`🗺️ MapConnections disponibili:`, Object.keys(mapConnections));
        
        const config = mapConnections[this.currentMap] || null;
        console.log(`📋 Configurazione trovata:`, config);
        
        return config;
    }
    
    // Genera stazione spaziale
    generateSpaceStation() {
        // Rimuovi stazione esistente se presente
        if (this.game.spaceStation) {
            this.game.spaceStation = null;
        }
        
        // Crea nuova stazione spaziale al centro della mappa
        this.game.spaceStation = new SpaceStation(
            GameConfig.WORLD.CENTER_X, 
            GameConfig.WORLD.CENTER_Y
        );
    }
    
    // Genera asteroidi interattivi
    generateInteractiveAsteroids() {
        // Genera 10 asteroidi interattivi in posizioni casuali
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * GameConfig.WORLD.WIDTH;
            const y = Math.random() * GameConfig.WORLD.HEIGHT;
            const asteroid = new InteractiveAsteroid(x, y, this.game);
            this.game.interactiveAsteroids.push(asteroid);
        }
    }
    
    // Genera bonus box
    generateBonusBoxes() {
        // Genera 5 bonus box in posizioni casuali
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * GameConfig.WORLD.WIDTH;
            const y = Math.random() * GameConfig.WORLD.HEIGHT;
            const bonusBox = new BonusBox(x, y, this.game);
            this.game.bonusBoxes.push(bonusBox);
        }
    }
    
    // Genera NPC/Nemici
    generateNPCs() {
        
        // Configurazione NPC per mappa
        const npcConfig = this.getNPCConfigForMap();
        if (!npcConfig || npcConfig.types.length === 0) {
            return;
        }
        
        
        // Genera NPC per ogni tipo nella configurazione
        let npcIndex = 0;
        for (let i = 0; i < npcConfig.types.length; i++) {
            const npcType = npcConfig.types[i];
            const npcCount = npcConfig.counts[i];
            
            
            for (let j = 0; j < npcCount; j++) {
                // Posizione casuale ma non troppo vicina al centro
                let x, y;
                do {
                    x = Math.random() * GameConfig.WORLD.WIDTH;
                    y = Math.random() * GameConfig.WORLD.HEIGHT;
                } while (Math.abs(x - GameConfig.WORLD.CENTER_X) < 1000 && Math.abs(y - GameConfig.WORLD.CENTER_Y) < 1000);
                
                const enemy = new Enemy(x, y, npcType);
                enemy.id = `npc_${this.currentMap}_${npcIndex}`;
                
                // Inizializza AI per il nemico
                enemy.initAI(this.game);
                
                this.game.enemies.push(enemy);
                npcIndex++;
            }
        }
        
    }
    
    // Ottiene configurazione NPC per la mappa corrente
    getNPCConfigForMap() {
        const npcConfigs = {
            // X1 - Streuner per fazione (MASSIVAMENTE AUMENTATI)
            'v1': { types: ['streuner_vru'], counts: [30] },
            'm1': { types: ['streuner_mmo'], counts: [30] },
            'e1': { types: ['streuner_eic'], counts: [30] },
            
            // X2 - Lordakia per fazione (MASSIVAMENTE AUMENTATI)
            'v2': { types: ['lordakia_vru'], counts: [35] },
            'm2': { types: ['lordakia_mmo'], counts: [35] },
            'e2': { types: ['lordakia_eic'], counts: [35] },
            
            // X3 - Saimon + Mordon + Devolarium + Sibelon (MASSIVAMENTE AUMENTATI)
            'v3': { types: ['saimon_vru', 'mordon_vru', 'devolarium_vru', 'sibelon_vru'], counts: [15, 15, 8, 15] },
            'm3': { types: ['saimon_mmo', 'mordon_mmo', 'devolarium_mmo', 'sibelon_mmo'], counts: [15, 15, 8, 15] },
            'e3': { types: ['saimon_eic', 'mordon_eic', 'devolarium_eic', 'sibelon_eic'], counts: [15, 15, 8, 15] },
            
            // X4 - Sibelonit + Lordakium (MASSIVAMENTE AUMENTATI)
            'v4': { types: ['sibelonit_vru', 'lordakium_vru'], counts: [15, 8] },
            'm4': { types: ['sibelonit_mmo', 'lordakium_mmo'], counts: [15, 8] },
            'e4': { types: ['sibelonit_eic', 'lordakium_eic'], counts: [15, 8] },
            
            // X5 - Kristalling + Kristallon (MASSIVAMENTE AUMENTATI)
            'v5': { types: ['kristallin_vru', 'kristallon_vru'], counts: [15, 8] },
            'm5': { types: ['kristallin_mmo', 'kristallon_mmo'], counts: [15, 8] },
            'e5': { types: ['kristallin_eic', 'kristallon_eic'], counts: [15, 8] },
            
            // X6 - Cubikon + Kristallon + Lordakium (MASSIVAMENTE AUMENTATI)
            'v6': { types: ['cubikon_vru', 'kristallon_vru', 'lordakium_vru'], counts: [15, 8, 8] },
            'm6': { types: ['cubikon_mmo', 'kristallon_mmo', 'lordakium_mmo'], counts: [15, 8, 8] },
            'e6': { types: ['cubikon_eic', 'kristallon_eic', 'lordakium_eic'], counts: [15, 8, 8] },
            
            // T-1 - Nessun NPC
            't-1': { types: [], counts: [] }
        };
        
        return npcConfigs[this.currentMap] || null;
    }
    
    // Crea asteroidi dall'istanza
    createAsteroidsFromInstance() {
        const asteroidObjects = this.currentInstance.getObjectsByType('asteroid');
        for (const obj of asteroidObjects) {
            if (obj.active) {
                const asteroid = new InteractiveAsteroid(obj.x, obj.y, this.game);
                asteroid.id = obj.id;
                this.objectManager.registerObject(obj.id, asteroid, 'asteroid');
                this.game.interactiveAsteroids.push(asteroid);
            }
        }
    }
    
    // Cambia mappa
    changeMap(newMap, ship) {
        
        // Salva stato corrente prima del cambio
        this.saveCurrentMapState();
        
        // Salva la mappa di origine
        const fromMap = this.currentMap;
        
        // Cambia mappa nel sistema di mappe separate
        const playerData = {
            id: this.currentPlayerId,
            position: { x: ship.x, y: ship.y },
            faction: ship.faction || 'venus',
            stats: {
                hp: ship.hp || 100,
                shield: ship.shield || 50,
                maxHp: ship.maxHp || 100,
                maxShield: ship.maxShield || 50
            }
        };
        
        const success = this.mapServer.playerChangeMap(playerData, fromMap, newMap);
        if (!success) {
            console.error(`Failed to change map from ${fromMap} to ${newMap}`);
            return;
        }
        
        // Cambia mappa locale
        this.currentMap = newMap;
        
        // Ricrea i portali per la nuova mappa
        this.createPortalsForCurrentMap();
        
        // Posiziona al portale di arrivo in base alla mappa di origine
        const arrivalPortal = this.getArrivalPortal(newMap, fromMap);
        if (arrivalPortal) {
            ship.x = arrivalPortal.x + arrivalPortal.width / 2;
            ship.y = arrivalPortal.y + arrivalPortal.height / 2;
        }
        
        // Aggiorna la camera
        this.game.camera.x = ship.x - this.game.camera.width / 2;
        this.game.camera.y = ship.y - this.game.camera.height / 2;
        
        // Riproduci suono arrivo portale
        if (this.game && this.game.audioManager) {
            this.game.audioManager.playPortalDoneSound();
        }
        
        // Carica nuova istanza mappa
        this.loadCurrentMapInstance();
        
        // Notifica cambio mappa
        const mapConfig = this.currentInstance?.config;
        if (mapConfig) {
            this.game.notifications.add(`🌌 Benvenuto in ${mapConfig.name}!`, 'info');
            this.showMapWelcomeMessage(mapConfig);
        }
        
        // Aggiorna il background
        this.updateBackground();
        
        // Aggiorna posizione nel sistema di mappe
        this.updatePlayerPosition();
    }
    
    // Ottiene il portale di arrivo in base alla mappa di origine e destinazione
    getArrivalPortal(toMap, fromMap) {
        // VENUS RESEARCH DIVISION
        // Andata V1→V2→V3→T-1
        if (fromMap === 'v1' && toMap === 'v2') {
            return new Portal(1000, 5000, 'v1', 15000, 5000, this.game);
        } else if (fromMap === 'v2' && toMap === 'v3') {
            return new Portal(1000, 5000, 'v2', 15000, 5000, this.game);
        } else if (fromMap === 'v3' && toMap === 't-1') {
            return new Portal(1000, 2000, 'v3', 15000, 5000, this.game);
        }
        // Ritorno V5←V4←T-1
        else if (fromMap === 't-1' && toMap === 'v4') {
            return new Portal(1000, 5000, 't-1', 15000, 5000, this.game);
        } else if (fromMap === 'v4' && toMap === 'v5') {
            return new Portal(1000, 5000, 'v4', 15000, 5000, this.game);
        }
        // Ritorno inverso
        else if (fromMap === 'v2' && toMap === 'v1') {
            return new Portal(15000, 5000, 'v2', 1000, 5000, this.game);
        } else if (fromMap === 'v3' && toMap === 'v2') {
            return new Portal(15000, 5000, 'v3', 1000, 5000, this.game);
        } else if (fromMap === 'v5' && toMap === 'v4') {
            return new Portal(15000, 5000, 'v5', 1000, 5000, this.game);
        }

        // MARS MINING OPERATIONS
        // Andata M1→M2→M3→T-1
        else if (fromMap === 'm1' && toMap === 'm2') {
            return new Portal(1000, 5000, 'm1', 15000, 5000, this.game);
        } else if (fromMap === 'm2' && toMap === 'm3') {
            return new Portal(1000, 5000, 'm2', 15000, 5000, this.game);
        } else if (fromMap === 'm3' && toMap === 't-1') {
            return new Portal(1000, 5000, 'm3', 15000, 5000, this.game);
        }
        // Ritorno M5←M4←T-1
        else if (fromMap === 't-1' && toMap === 'm4') {
            return new Portal(1000, 5000, 't-1', 15000, 5000, this.game);
        } else if (fromMap === 'm4' && toMap === 'm5') {
            return new Portal(1000, 5000, 'm4', 15000, 5000, this.game);
        }
        // Ritorno inverso
        else if (fromMap === 'm2' && toMap === 'm1') {
            return new Portal(15000, 5000, 'm2', 1000, 5000, this.game);
        } else if (fromMap === 'm3' && toMap === 'm2') {
            return new Portal(15000, 5000, 'm3', 1000, 5000, this.game);
        } else if (fromMap === 'm5' && toMap === 'm4') {
            return new Portal(15000, 5000, 'm5', 1000, 5000, this.game);
        }

        // EARTH INDUSTRIES CORPORATION
        // Andata E1→E2→E3→T-1
        else if (fromMap === 'e1' && toMap === 'e2') {
            return new Portal(1000, 5000, 'e1', 15000, 5000, this.game);
        } else if (fromMap === 'e2' && toMap === 'e3') {
            return new Portal(1000, 5000, 'e2', 15000, 5000, this.game);
        } else if (fromMap === 'e3' && toMap === 't-1') {
            return new Portal(1000, 8000, 'e3', 15000, 5000, this.game);
        }
        // Ritorno E5←E4←T-1
        else if (fromMap === 't-1' && toMap === 'e4') {
            return new Portal(1000, 5000, 't-1', 15000, 5000, this.game);
        } else if (fromMap === 'e4' && toMap === 'e5') {
            return new Portal(1000, 5000, 'e4', 15000, 5000, this.game);
        }
        // Ritorno inverso
        else if (fromMap === 'e2' && toMap === 'e1') {
            return new Portal(15000, 5000, 'e2', 1000, 5000, this.game);
        } else if (fromMap === 'e3' && toMap === 'e2') {
            return new Portal(15000, 5000, 'e3', 1000, 5000, this.game);
        } else if (fromMap === 'e5' && toMap === 'e4') {
            return new Portal(15000, 5000, 'e5', 1000, 5000, this.game);
        }
        
        return null;
    }
    
    // Salva stato corrente della mappa
    saveCurrentMapState() {
        if (!this.currentInstance) return;
        
        // Salva stato degli oggetti
        this.syncGameToInstance();
        
        // Persiste l'istanza
        this.persistence.saveInstance(this.currentMap, this.currentInstance);
    }
    
    // Sincronizza stato del gioco con l'istanza
    syncGameToInstance() {
        if (!this.currentInstance) return;
        
        // TODO: Implementare sincronizzazione con il nuovo sistema MapInstance
        // Per ora, salva solo le informazioni base
        console.log('⚠️ Sincronizzazione gioco->istanza temporaneamente disabilitata per il nuovo sistema');
    }
    
    // Rigenera completamente la mappa (ora usa istanze)
    regenerateMap() {
        if (!this.currentInstance) return;
        
        // TODO: Implementare rigenerazione con il nuovo sistema MapInstance
        console.log('⚠️ Rigenerazione mappa temporaneamente disabilitata per il nuovo sistema');
        
        // Sincronizza con il gioco
        this.syncInstanceToGame();
        
        // Salva l'istanza aggiornata
        this.persistence.saveInstance(this.currentMap, this.currentInstance);
    }
    
    // Metodi di generazione ora gestiti da MapInstance
    
    // Aggiorna il background in base alla mappa corrente
    updateBackground() {
        if (this.currentInstance?.config) {
            const config = this.currentInstance.config;
            if (config.background === 'dreadspire') {
                this.game.backgroundType = 'dreadspire';
            } else {
                this.game.backgroundType = 'default';
            }
        }
    }
    
    // Controlla se la space station deve essere visibile nella mappa corrente
    shouldShowSpaceStation() {
        return this.currentInstance?.config?.hasSpaceStation || false;
    }
    
    // Ottiene il tipo di alieni per la mappa corrente (per compatibilità)
    getCurrentAlienType() {
        return this.currentInstance?.config?.npcType || 'npc_x1';
    }
    
    // Ottiene il tipo di NPC per la mappa corrente
    getCurrentNPCType() {
        return this.currentInstance?.config?.npcType || 'npc_x1';
    }
    
    // Ottiene configurazione mappa corrente
    getCurrentMapConfig() {
        return this.currentInstance?.config || null;
    }
    
    // Mostra messaggio di benvenuto per la mappa
    showMapWelcomeMessage(config) {
        if (!config || !config.name) {
            console.warn('⚠️ Config o config.name mancante in showMapWelcomeMessage');
            return;
        }
        
        if (this.game.zoneNotifications) {
            // Rimuovi eventuali notifiche di mappa precedenti
            this.game.zoneNotifications.removeZoneNotifications('MapWelcome');
            
            // Crea una notifica di zona nello stesso stile della spacestation
            const notificationId = this.game.zoneNotifications.addZoneNotification(
                'MapWelcome', 
                `Welcome to\n${config.name.toUpperCase()}\n[${config.description?.toUpperCase() || 'UNKNOWN AREA'}]`, 
                'info'
            );
            
            // Rimuovi automaticamente la notifica dopo 4 secondi
            setTimeout(() => {
                if (this.game.zoneNotifications) {
                    this.game.zoneNotifications.removeZoneNotification(notificationId);
                }
            }, 4000);
        }
    }
    
    // Ottiene la mappa corrente
    getCurrentMap() {
        if (!this.currentInstance?.config) return null;
        
        return {
            name: this.currentMap,
            config: this.currentInstance.config
        };
    }
    
    // Salva automaticamente lo stato (da chiamare periodicamente)
    autoSave() {
        this.saveCurrentMapState();
    }
    
    // Ottiene statistiche del sistema
    getSystemStats() {
        return {
            currentMap: this.currentMap,
            mapServerStats: this.mapServer.getGlobalStats(),
            currentMapStats: this.getCurrentMapStats(),
            instanceStats: this.currentInstance ? {
                objectCount: this.currentInstance.objects.size,
                lastUpdate: this.currentInstance.lastUpdate
            } : null,
            persistenceStats: this.persistence.getStats()
        };
    }
    
    // Forza rigenerazione di tutte le istanze (per aggiornamenti)
    forceRegenerateAllInstances() {
        console.log('🔄 Forzando rigenerazione di tutte le istanze...');
        this.persistence.clearAll();
        this.loadCurrentMapInstance();
        console.log('✅ Rigenerazione completata');
    }
    
    // Ottiene tutti i portali della mappa corrente (ora tutti i portali sono per la mappa corrente)
    getCurrentMapPortals() {
        return this.portals;
    }
    
    // Controlla se il giocatore è vicino a un portale
    checkPortalInteraction(ship) {
        const currentPortals = this.getCurrentMapPortals();
        for (let portal of currentPortals) {
            if (portal.checkCollision(ship)) {
                return portal;
            }
        }
        return null;
    }
    
    // Aggiorna tutti i portali
    update() {
        // TODO: Temporaneamente disabilitato per evitare conflitti con Minimap
        // this.mapServer.update(16); // 60 FPS
        
        // TODO: Temporaneamente disabilitato per evitare conflitti con Minimap
        // this.updatePlayerPosition();
        
        // Aggiorna portali legacy
        const currentPortals = this.getCurrentMapPortals();
        currentPortals.forEach(portal => {
            portal.update();
        });
    }
    
    // Disegna tutti i portali della mappa corrente
    draw(ctx, camera) {
        const currentPortals = this.getCurrentMapPortals();
        currentPortals.forEach(portal => {
            portal.draw(ctx, camera);
        });
    }
    
    // Disegna i portali nella minimappa
    drawMinimap(ctx, minimap) {
        const currentPortals = this.getCurrentMapPortals();
        currentPortals.forEach(portal => {
            portal.drawMinimap(ctx, minimap);
        });
    }
    
    // Gestisce l'interazione con i portali
    handlePortalInteraction() {
        const currentPortals = this.getCurrentMapPortals();
        for (let portal of currentPortals) {
            if (portal.handleInteraction()) {
                return true;
            }
        }
        return false;
    }
}
