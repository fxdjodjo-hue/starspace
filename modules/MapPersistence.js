// MapPersistence - Sistema di persistenza delle mappe
export class MapPersistence {
    constructor() {
        this.storageKey = 'mmorpg_map_persistence';
        this.data = this.loadData();
    }
    
    // Carica dati dal localStorage
    loadData() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error('Error loading map persistence data:', error);
            return {};
        }
    }
    
    // Salva dati nel localStorage
    saveData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
            return true;
        } catch (error) {
            console.error('Error saving map persistence data:', error);
            return false;
        }
    }
    
    // Salva stato di una mappa
    saveMapState(mapId, state) {
        this.data[mapId] = {
            ...state,
            lastSaved: Date.now()
        };
        return this.saveData();
    }
    
    // Carica stato di una mappa
    loadMapState(mapId) {
        return this.data[mapId] || null;
    }
    
    // Ottiene tutte le mappe salvate
    getAllMaps() {
        return Object.keys(this.data);
    }
    
    // Rimuove stato di una mappa
    removeMapState(mapId) {
        delete this.data[mapId];
        return this.saveData();
    }
    
    // Pulisce dati vecchi
    cleanupOldData(maxAge = 7 * 24 * 60 * 60 * 1000) { // 7 giorni
        const now = Date.now();
        let cleaned = false;
        
        for (const mapId in this.data) {
            const mapData = this.data[mapId];
            if (now - mapData.lastSaved > maxAge) {
                delete this.data[mapId];
                cleaned = true;
            }
        }
        
        if (cleaned) {
            this.saveData();
        }
        
        return cleaned;
    }
}
