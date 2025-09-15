// Sistema di Persistenza Mappe - Preparato per Online
import { MapInstance } from './MapInstance.js';

export class MapPersistence {
    constructor() {
        this.storageKey = 'mmorpg_map_instances';
        this.instances = new Map(); // mapId -> MapInstance
        this.lastSync = Date.now();
    }
    
    // Salva un'istanza di mappa
    saveInstance(mapId, instance) {
        this.instances.set(mapId, instance);
        this.persistToStorage();
        this.lastSync = Date.now();
    }
    
    // Carica un'istanza di mappa
    loadInstance(mapId) {
        if (this.instances.has(mapId)) {
            return this.instances.get(mapId);
        }
        
        // Prova a caricare dal localStorage
        const saved = this.loadFromStorage();
        if (saved && saved[mapId]) {
            const instance = MapInstance.deserialize(saved[mapId]);
            this.instances.set(mapId, instance);
            return instance;
        }
        
        return null;
    }
    
    // Crea o carica un'istanza
    getOrCreateInstance(mapId, instanceId = 'default') {
        let instance = this.loadInstance(mapId);
        if (!instance) {
            instance = new MapInstance(mapId, instanceId);
            this.saveInstance(mapId, instance);
        }
        return instance;
    }
    
    // Salva nel localStorage (per il futuro: database)
    persistToStorage() {
        try {
            const data = {};
            for (const [mapId, instance] of this.instances.entries()) {
                data[mapId] = instance.serialize();
            }
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.warn('Errore salvataggio mappe:', error);
        }
    }
    
    // Carica dal localStorage
    loadFromStorage() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.warn('Errore caricamento mappe:', error);
            return null;
        }
    }
    
    // Ottiene delta changes per sincronizzazione
    getDeltaChanges(sinceTimestamp) {
        const changes = {
            timestamp: this.lastSync,
            instances: {}
        };
        
        for (const [mapId, instance] of this.instances.entries()) {
            const modifiedObjects = instance.getObjectsModifiedAfter(sinceTimestamp);
            if (modifiedObjects.length > 0) {
                changes.instances[mapId] = {
                    mapId: mapId,
                    instanceId: instance.instanceId,
                    objects: modifiedObjects,
                    lastUpdate: instance.lastUpdate
                };
            }
        }
        
        return changes;
    }
    
    // Applica delta changes (per il futuro online)
    applyDeltaChanges(changes) {
        for (const [mapId, instanceData] of Object.entries(changes.instances)) {
            let instance = this.loadInstance(mapId);
            if (!instance) {
                instance = new MapInstance(mapId, instanceData.instanceId);
            }
            
            // Applica modifiche agli oggetti
            for (const obj of instanceData.objects) {
                instance.objects.set(obj.id, obj);
            }
            
            this.saveInstance(mapId, instance);
        }
        
        this.lastSync = changes.timestamp;
    }
    
    // Pulisce tutte le istanze
    clearAll() {
        this.instances.clear();
        localStorage.removeItem(this.storageKey);
        this.lastSync = Date.now();
    }
    
    // Ottiene statistiche
    getStats() {
        const stats = {
            totalInstances: this.instances.size,
            instances: {}
        };
        
        for (const [mapId, instance] of this.instances.entries()) {
            stats.instances[mapId] = {
                objectCount: instance.objects.size,
                lastUpdate: instance.lastUpdate,
                playerCount: instance.players.size
            };
        }
        
        return stats;
    }
}
