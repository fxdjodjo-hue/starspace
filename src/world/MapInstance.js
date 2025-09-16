// Sistema di Istanze Mappa - Preparato per Online
import { NPCTypes } from '../entities/NPCTypes.js';

export class MapInstance {
    constructor(mapId, instanceId = 'default') {
        this.mapId = mapId;
        this.instanceId = instanceId;
        this.players = new Set(); // Per il futuro online
        this.objects = new Map(); // ID -> Object
        this.lastUpdate = Date.now();
        this.isActive = true;
        
        // Sistema NPC
        this.npcTypes = new NPCTypes();
        
        // Configurazione mappa
        this.config = this.getMapConfig(mapId);
        
        // Genera oggetti iniziali
        this.generateInitialObjects();
    }
    
    // Configurazione delle mappe
    getMapConfig(mapId) {
        const configs = {
            // Mappe legacy (mantenute per compatibilità)
            x1: { 
                width: 16000, 
                height: 10000,
                background: 'dreadspire',
                name: 'X1 Sector',
                description: 'Settore principale con stazione spaziale',
                hasSpaceStation: true,
                hasAliens: true,
                npcType: 'npc_x1',
                enemyCount: 15,
                bonusBoxCount: 8,
                asteroidCount: 10
            },
            x2: { 
                width: 16000, 
                height: 10000,
                background: 'dreadspire',
                name: 'X2 Sector',
                description: 'Settore secondario senza stazione spaziale',
                hasSpaceStation: false,
                hasAliens: true,
                npcType: 'npc_x2', // Usa nuovo sistema NPC
                enemyCount: 20,
                bonusBoxCount: 8,
                asteroidCount: 10
            },
            x3: { 
                width: 16000, 
                height: 10000,
                background: 'dreadspire',
                name: 'X3 Sector',
                description: 'Settore asteroidi - Zona ricca di risorse',
                hasSpaceStation: false,
                hasAliens: false, // Solo asteroidi
                npcType: null,
                enemyCount: 0,
                bonusBoxCount: 12, // Più bonus box per compensare
                asteroidCount: 25 // Molti più asteroidi
            },
            x4: { 
                width: 16000, 
                height: 10000,
                background: 'dreadspire',
                name: 'X4 Sector',
                description: 'Settore minerario - Asteroidi preziosi',
                hasSpaceStation: false,
                hasAliens: false, // Solo asteroidi
                npcType: null,
                enemyCount: 0,
                bonusBoxCount: 15, // Ancora più bonus box
                asteroidCount: 30 // Asteroidi rari
            },
            x5: { 
                width: 16000, 
                height: 10000,
                background: 'dreadspire',
                name: 'X5 Sector',
                description: 'Settore estremo - Zona più pericolosa',
                hasSpaceStation: false,
                hasAliens: false, // Solo asteroidi per ora
                npcType: null,
                enemyCount: 0,
                bonusBoxCount: 20, // Massimo bonus box
                asteroidCount: 35 // Asteroidi estremi
            },

            // MAPPE VRU (VENUS)
            'v1': {
                width: 16000,
                height: 10000,
                background: 'dreadspire',
                name: 'V1 Research Station Alpha',
                description: 'Stazione di ricerca avanzata con tecnologie all\'avanguardia',
                hasSpaceStation: true,
                hasAliens: true,
                npcType: 'npc_vru_7',
                enemyCount: 12,
                bonusBoxCount: 10,
                asteroidCount: 8,
                faction: 'venus'
            },
            'v2': {
                width: 16000,
                height: 10000,
                background: 'dreadspire',
                name: 'V2 Research Station Beta',
                description: 'Laboratorio di ricerca secondario con esperimenti avanzati',
                hasSpaceStation: false,
                hasAliens: true,
                npcType: 'npc_vru_6',
                enemyCount: 15,
                bonusBoxCount: 8,
                asteroidCount: 12,
                faction: 'venus'
            },
            'v3': {
                width: 16000,
                height: 10000,
                background: 'dreadspire',
                name: 'V3 Research Station Gamma',
                description: 'Centro di ricerca principale con tecnologie sperimentali',
                hasSpaceStation: false,
                hasAliens: true,
                npcType: 'npc_vru_5',
                enemyCount: 18,
                bonusBoxCount: 12,
                asteroidCount: 10,
                faction: 'venus'
            },
            'v4': {
                width: 16000,
                height: 10000,
                background: 'dreadspire',
                name: 'V4 Research Station Delta',
                description: 'Zona di test per nuove tecnologie e armi',
                hasSpaceStation: false,
                hasAliens: true,
                npcType: 'npc_vru_2',
                enemyCount: 22,
                bonusBoxCount: 10,
                asteroidCount: 15,
                faction: 'venus'
            },
            'v5': {
                width: 16000,
                height: 10000,
                background: 'dreadspire',
                name: 'V5 Research Station Omega',
                description: 'Stazione di ricerca principale con tecnologie più avanzate',
                hasSpaceStation: false,
                hasAliens: true,
                npcType: 'npc_vru_1',
                enemyCount: 25,
                bonusBoxCount: 15,
                asteroidCount: 12,
                faction: 'venus'
            },
            'v6': {
                width: 16000,
                height: 10000,
                background: 'dreadspire',
                name: 'V6 Research Station Epsilon',
                description: 'Zona di ricerca avanzata con esperimenti pericolosi',
                hasSpaceStation: false,
                hasAliens: true,
                npcType: 'npc_vru_3',
                enemyCount: 30,
                bonusBoxCount: 20,
                asteroidCount: 18,
                faction: 'venus'
            },

            // MAPPE MMO (MARS)
            'm1': {
                width: 16000,
                height: 10000,
                background: 'dreadspire',
                name: 'M1 Mining Outpost Alpha',
                description: 'Avamposto minerario principale con estrazione di risorse',
                hasSpaceStation: true,
                hasAliens: true,
                npcType: 'npc_mmo_7',
                enemyCount: 10,
                bonusBoxCount: 12,
                asteroidCount: 20,
                faction: 'mars'
            },
            'mmo-6': {
                width: 16000,
                height: 10000,
                background: 'dreadspire',
                name: 'MMO-6 Mining Outpost Beta',
                description: 'Zona di estrazione secondaria con miniere attive',
                hasSpaceStation: false,
                hasAliens: true,
                npcType: 'npc_mmo_6',
                enemyCount: 14,
                bonusBoxCount: 10,
                asteroidCount: 25,
                faction: 'mars'
            },
            'mmo-5': {
                width: 16000,
                height: 10000,
                background: 'dreadspire',
                name: 'MMO-5 Mining Outpost Gamma',
                description: 'Centro di produzione mineraria con raffinerie',
                hasSpaceStation: false,
                hasAliens: true,
                npcType: 'npc_mmo_5',
                enemyCount: 16,
                bonusBoxCount: 14,
                asteroidCount: 30,
                faction: 'mars'
            },
            'mmo-3': {
                width: 16000,
                height: 10000,
                background: 'dreadspire',
                name: 'MMO-3 Mining Outpost Delta',
                description: 'Zona di estrazione profonda con miniere pericolose',
                hasSpaceStation: false,
                hasAliens: true,
                npcType: 'npc_mmo_3',
                enemyCount: 20,
                bonusBoxCount: 12,
                asteroidCount: 35,
                faction: 'mars'
            },
            'mmo-2': {
                width: 16000,
                height: 10000,
                background: 'dreadspire',
                name: 'MMO-2 Mining Outpost Epsilon',
                description: 'Centro di produzione principale con raffinerie avanzate',
                hasSpaceStation: false,
                hasAliens: true,
                npcType: 'npc_mmo_2',
                enemyCount: 24,
                bonusBoxCount: 16,
                asteroidCount: 28,
                faction: 'mars'
            },
            'mmo-1': {
                width: 16000,
                height: 10000,
                background: 'dreadspire',
                name: 'MMO-1 Mining Outpost Omega',
                description: 'Zona di estrazione estrema con miniere più profonde',
                hasSpaceStation: false,
                hasAliens: true,
                npcType: 'npc_mmo_1',
                enemyCount: 28,
                bonusBoxCount: 18,
                asteroidCount: 40,
                faction: 'mars'
            },

            // MAPPE EIC (EIC)
            'e1': {
                width: 16000,
                height: 10000,
                background: 'dreadspire',
                name: 'E1 Corporation Alpha',
                description: 'Sede principale della corporazione terrestre',
                hasSpaceStation: true,
                hasAliens: true,
                npcType: 'npc_eic_7',
                enemyCount: 8,
                bonusBoxCount: 15,
                asteroidCount: 6,
                faction: 'eic'
            },
            'eic-7': {
                width: 16000,
                height: 10000,
                background: 'dreadspire',
                name: 'EIC-7 Corporation Alpha',
                description: 'Sede principale della corporazione terrestre',
                hasSpaceStation: false,
                hasAliens: true,
                npcType: 'npc_eic_7',
                enemyCount: 8,
                bonusBoxCount: 15,
                asteroidCount: 6,
                faction: 'eic'
            },
            'eic-6': {
                width: 16000,
                height: 10000,
                background: 'dreadspire',
                name: 'EIC-6 Corporation Beta',
                description: 'Centro commerciale secondario con mercati attivi',
                hasSpaceStation: false,
                hasAliens: true,
                npcType: 'npc_eic_6',
                enemyCount: 12,
                bonusBoxCount: 18,
                asteroidCount: 8,
                faction: 'eic'
            },
            'eic-5': {
                width: 16000,
                height: 10000,
                background: 'dreadspire',
                name: 'EIC-5 Corporation Gamma',
                description: 'Hub commerciale principale con scambi interplanetari',
                hasSpaceStation: false,
                hasAliens: true,
                npcType: 'npc_eic_5',
                enemyCount: 15,
                bonusBoxCount: 20,
                asteroidCount: 10,
                faction: 'eic'
            },
            'eic-3': {
                width: 16000,
                height: 10000,
                background: 'dreadspire',
                name: 'EIC-3 Corporation Delta',
                description: 'Zona di produzione industriale con fabbriche',
                hasSpaceStation: false,
                hasAliens: true,
                npcType: 'npc_eic_3',
                enemyCount: 18,
                bonusBoxCount: 16,
                asteroidCount: 12,
                faction: 'eic'
            },
            'eic-2': {
                width: 16000,
                height: 10000,
                background: 'dreadspire',
                name: 'EIC-2 Corporation Epsilon',
                description: 'Centro di produzione avanzata con tecnologie industriali',
                hasSpaceStation: false,
                hasAliens: true,
                npcType: 'npc_eic_2',
                enemyCount: 22,
                bonusBoxCount: 22,
                asteroidCount: 14,
                faction: 'eic'
            },
            'eic-1': {
                width: 16000,
                height: 10000,
                background: 'dreadspire',
                name: 'EIC-1 Corporation Omega',
                description: 'Sede centrale della corporazione con tecnologie più avanzate',
                hasSpaceStation: false,
                hasAliens: true,
                npcType: 'npc_eic_1',
                enemyCount: 26,
                bonusBoxCount: 25,
                asteroidCount: 16,
                faction: 'eic'
            },

            // MAPPA PVP
            't-1': {
                width: 16000,
                height: 10000,
                background: 'dreadspire',
                name: 'T-1 PvP Battle Zone',
                description: 'Zona di combattimento PvP tra fazioni - Attualmente vuota',
                hasSpaceStation: false,
                hasAliens: false,
                npcType: null,
                enemyCount: 0,
                bonusBoxCount: 0,
                asteroidCount: 0,
                faction: 'neutral',
                isPvP: true
            }
        };
        
        return configs[mapId] || configs.v1;
    }
    
    // Genera oggetti iniziali per la mappa
    generateInitialObjects() {
        // Per ora generiamo come prima, ma con ID univoci
        this.generateEnemies();
        this.generateBonusBoxes();
        this.generateInteractiveAsteroids();
    }
    
    // Genera nemici con ID univoci
    generateEnemies() {
        if (!this.config.hasAliens) return;
        
        for (let i = 0; i < this.config.enemyCount; i++) {
            const x = Math.random() * (this.config.width - 200) + 100;
            const y = Math.random() * (this.config.height - 200) + 100;
            const id = `enemy_${this.mapId}_${Date.now()}_${i}`;
            
            // Per X2, genera metà Streuner e metà Lordakia
            let npcType = this.config.npcType;
            if (this.mapId === 'x2') {
                // Prima metà = Streuner, seconda metà = Lordakia
                npcType = i < this.config.enemyCount / 2 ? 'npc_x2' : 'npc_x2_lordakia';
            }
            
            this.objects.set(id, {
                id: id,
                type: 'enemy',
                x: x,
                y: y,
                npcType: npcType,
                created: Date.now(),
                lastModified: Date.now()
            });
        }
    }
    
    // Genera bonus box con ID univoci
    generateBonusBoxes() {
        for (let i = 0; i < this.config.bonusBoxCount; i++) {
            const x = Math.random() * (this.config.width - 100) + 50;
            const y = Math.random() * (this.config.height - 100) + 50;
            const id = `bonusbox_${this.mapId}_${Date.now()}_${i}`;
            
            this.objects.set(id, {
                id: id,
                type: 'bonusbox',
                x: x,
                y: y,
                active: true,
                created: Date.now(),
                lastModified: Date.now()
            });
        }
    }
    
    // Genera asteroidi interattivi con ID univoci
    generateInteractiveAsteroids() {
        for (let i = 0; i < this.config.asteroidCount; i++) {
            const x = Math.random() * (this.config.width - 200) + 100;
            const y = Math.random() * (this.config.height - 200) + 100;
            const id = `asteroid_${this.mapId}_${Date.now()}_${i}`;
            
            this.objects.set(id, {
                id: id,
                type: 'asteroid',
                x: x,
                y: y,
                active: true,
                created: Date.now(),
                lastModified: Date.now()
            });
        }
    }
    
    // Aggiunge un giocatore all'istanza (per il futuro online)
    addPlayer(playerId) {
        this.players.add(playerId);
        this.lastUpdate = Date.now();
    }
    
    // Rimuove un giocatore dall'istanza
    removePlayer(playerId) {
        this.players.delete(playerId);
        this.lastUpdate = Date.now();
    }
    
    // Aggiorna un oggetto
    updateObject(objectId, updates) {
        if (this.objects.has(objectId)) {
            const obj = this.objects.get(objectId);
            Object.assign(obj, updates);
            obj.lastModified = Date.now();
            this.lastUpdate = Date.now();
            return true;
        }
        return false;
    }
    
    // Rimuove un oggetto
    removeObject(objectId) {
        if (this.objects.has(objectId)) {
            this.objects.delete(objectId);
            this.lastUpdate = Date.now();
            return true;
        }
        return false;
    }
    
    // Ottiene tutti gli oggetti di un tipo
    getObjectsByType(type) {
        const result = [];
        for (const obj of this.objects.values()) {
            if (obj.type === type) {
                result.push(obj);
            }
        }
        return result;
    }
    
    // Ottiene oggetti modificati dopo un timestamp (per delta sync)
    getObjectsModifiedAfter(timestamp) {
        const result = [];
        for (const obj of this.objects.values()) {
            if (obj.lastModified > timestamp) {
                result.push(obj);
            }
        }
        return result;
    }
    
    // Serializza l'istanza per il salvataggio
    serialize() {
        return {
            mapId: this.mapId,
            instanceId: this.instanceId,
            lastUpdate: this.lastUpdate,
            objects: Array.from(this.objects.entries()),
            players: Array.from(this.players)
        };
    }
    
    // Deserializza un'istanza dal salvataggio
    static deserialize(data) {
        const instance = new MapInstance(data.mapId, data.instanceId);
        instance.lastUpdate = data.lastUpdate;
        instance.objects = new Map(data.objects);
        instance.players = new Set(data.players);
        return instance;
    }
}
