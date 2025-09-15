// Gestore Oggetti con ID Univoci - Preparato per Online
export class ObjectManager {
    constructor() {
        this.nextId = 1;
        this.objectRegistry = new Map(); // ID -> Object Reference
        this.typeRegistry = new Map(); // Type -> Set of IDs
    }
    
    // Genera un ID univoco
    generateId(prefix = 'obj') {
        const id = `${prefix}_${Date.now()}_${this.nextId++}`;
        return id;
    }
    
    // Registra un oggetto
    registerObject(id, object, type) {
        this.objectRegistry.set(id, object);
        
        if (!this.typeRegistry.has(type)) {
            this.typeRegistry.set(type, new Set());
        }
        this.typeRegistry.get(type).add(id);
        
        // Aggiungi ID all'oggetto se non ce l'ha
        if (object && typeof object === 'object') {
            object.id = id;
            object.type = type;
            object.created = Date.now();
            object.lastModified = Date.now();
        }
    }
    
    // Rimuove un oggetto
    unregisterObject(id) {
        const object = this.objectRegistry.get(id);
        if (object) {
            const type = object.type;
            this.objectRegistry.delete(id);
            
            if (this.typeRegistry.has(type)) {
                this.typeRegistry.get(type).delete(id);
            }
            return true;
        }
        return false;
    }
    
    // Ottiene un oggetto per ID
    getObject(id) {
        return this.objectRegistry.get(id);
    }
    
    // Ottiene tutti gli oggetti di un tipo
    getObjectsByType(type) {
        const ids = this.typeRegistry.get(type) || new Set();
        const objects = [];
        for (const id of ids) {
            const obj = this.objectRegistry.get(id);
            if (obj) {
                objects.push(obj);
            }
        }
        return objects;
    }
    
    // Aggiorna un oggetto
    updateObject(id, updates) {
        const object = this.objectRegistry.get(id);
        if (object) {
            Object.assign(object, updates);
            object.lastModified = Date.now();
            return true;
        }
        return false;
    }
    
    // Ottiene oggetti modificati dopo un timestamp
    getObjectsModifiedAfter(timestamp) {
        const result = [];
        for (const obj of this.objectRegistry.values()) {
            if (obj.lastModified > timestamp) {
                result.push(obj);
            }
        }
        return result;
    }
    
    // Pulisce tutti gli oggetti
    clear() {
        this.objectRegistry.clear();
        this.typeRegistry.clear();
        this.nextId = 1;
    }
    
    // Ottiene statistiche
    getStats() {
        const stats = {
            totalObjects: this.objectRegistry.size,
            byType: {}
        };
        
        for (const [type, ids] of this.typeRegistry.entries()) {
            stats.byType[type] = ids.size;
        }
        
        return stats;
    }
}
