// Sistema di Istanze Mappa - Preparato per Online
import { NPCTypes } from './NPCTypes.js';

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
            x1: { 
                width: 16000, 
                height: 10000,
                background: 'dreadspire',
                name: 'X1 Sector',
                description: 'Settore principale con stazione spaziale',
                hasSpaceStation: true,
                hasAliens: true,
                npcType: 'npc_x1', // Usa nuovo sistema NPC
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
            }
        };
        
        return configs[mapId] || configs.x1;
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
            
            this.objects.set(id, {
                id: id,
                type: 'enemy',
                x: x,
                y: y,
                npcType: this.config.npcType, // Usa nuovo sistema NPC
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
