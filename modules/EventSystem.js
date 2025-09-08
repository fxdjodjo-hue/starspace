// Sistema di eventi per sincronizzazione online/offline
export class EventSystem {
    constructor() {
        this.listeners = new Map();
        this.networkManager = null;
    }
    
    // Registra listener per eventi
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    
    // Rimuove listener
    off(event, callback) {
        if (!this.listeners.has(event)) return;
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }
    
    // Emette evento locale (solo UI)
    emitLocal(event, data) {
        this.emit(`local:${event}`, data);
    }
    
    // Emette evento di rete (da inviare al server)
    emitNetwork(event, data) {
        this.emit(`network:${event}`, data);
        
        // Se siamo online, invia al server
        if (this.networkManager && this.networkManager.isOnline) {
            this.networkManager.sendAction(event, data);
        }
    }
    
    // Emette evento sincronizzato (da server a tutti i client)
    emitSync(event, data) {
        this.emit(`sync:${event}`, data);
    }
    
    // Emette evento generico
    emit(event, data) {
        if (!this.listeners.has(event)) return;
        
        this.listeners.get(event).forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event listener for ${event}:`, error);
            }
        });
    }
    
    // Collega il network manager
    setNetworkManager(networkManager) {
        this.networkManager = networkManager;
    }
    
    // Pulisce tutti i listener
    clear() {
        this.listeners.clear();
    }
}
