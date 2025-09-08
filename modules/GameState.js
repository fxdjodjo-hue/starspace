// State management centralizzato per sincronizzazione online
export class GameState {
    constructor() {
        this.state = {
            player: {
                id: null,
                credits: 0,
                uridium: 0,
                honor: 0,
                experience: 0,
                level: 1
            },
            shop: {
                selectedCategory: 'ammunition',
                selectedAmmoItem: 'laser_x1',
                selectedLaserItem: 'lf1',
                selectedGeneratorItem: 'generator_1'
            },
            ui: {
                homePanel: { 
                    visible: false,
                    selectedCategory: 'info'
                }
            }
        };
        
        this.listeners = new Map();
        this.eventSystem = null;
    }
    
    // Collega il sistema di eventi
    setEventSystem(eventSystem) {
        this.eventSystem = eventSystem;
    }
    
    // Aggiorna stato con notifica
    updateState(path, value) {
        this.setNestedProperty(this.state, path, value);
        this.notifyListeners(path, value);
        
        // Emetti evento per sincronizzazione
        if (this.eventSystem) {
            this.eventSystem.emitLocal('state:update', { path, value });
        }
    }
    
    // Ottiene valore da path (es. 'player.credits')
    getState(path) {
        return this.getNestedProperty(this.state, path);
    }
    
    // Sincronizza con stato del server
    syncState(serverState) {
        this.state = this.deepMerge(this.state, serverState);
        this.notifyAllListeners();
        
        if (this.eventSystem) {
            this.eventSystem.emitSync('state:sync', this.state);
        }
    }
    
    // Registra listener per cambiamenti di stato
    subscribe(path, callback) {
        if (!this.listeners.has(path)) {
            this.listeners.set(path, []);
        }
        this.listeners.get(path).push(callback);
    }
    
    // Rimuove listener
    unsubscribe(path, callback) {
        if (!this.listeners.has(path)) return;
        const callbacks = this.listeners.get(path);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }
    
    // Notifica listener specifici
    notifyListeners(path, value) {
        if (!this.listeners.has(path)) return;
        
        this.listeners.get(path).forEach(callback => {
            try {
                callback(value, path);
            } catch (error) {
                console.error(`Error in state listener for ${path}:`, error);
            }
        });
    }
    
    // Notifica tutti i listener
    notifyAllListeners() {
        this.listeners.forEach((callbacks, path) => {
            const value = this.getNestedProperty(this.state, path);
            callbacks.forEach(callback => {
                try {
                    callback(value, path);
                } catch (error) {
                    console.error(`Error in state listener for ${path}:`, error);
                }
            });
        });
    }
    
    // Helper per impostare proprietà nested
    setNestedProperty(obj, path, value) {
        const keys = path.split('.');
        let current = obj;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
    }
    
    // Helper per ottenere proprietà nested
    getNestedProperty(obj, path) {
        const keys = path.split('.');
        let current = obj;
        
        for (const key of keys) {
            if (current === null || current === undefined) {
                return undefined;
            }
            current = current[key];
        }
        
        return current;
    }
    
    // Deep merge per sincronizzazione
    deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    }
    
    // Ottiene stato completo
    getFullState() {
        return JSON.parse(JSON.stringify(this.state));
    }
    
    // Reset stato
    reset() {
        this.state = {
            player: {
                id: null,
                credits: 0,
                uridium: 0,
                honor: 0,
                experience: 0,
                level: 1
            },
            shop: {
                selectedCategory: 'ammunition',
                selectedAmmoItem: 'laser_x1',
                selectedLaserItem: 'lf1',
                selectedGeneratorItem: 'generator_1'
            },
            ui: {
                homePanel: { 
                    visible: false,
                    selectedCategory: 'info'
                }
            }
        };
        this.notifyAllListeners();
    }
}
