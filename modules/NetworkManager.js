// Network Manager per comunicazione online/offline
export class NetworkManager {
    constructor(eventSystem) {
        this.eventSystem = eventSystem;
        this.socket = null;
        this.isOnline = false;
        this.serverUrl = null;
        this.pendingActions = [];
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
    }
    
    // Connessione al server
    connect(serverUrl) {
        this.serverUrl = serverUrl;
        
        try {
            this.socket = new WebSocket(serverUrl);
            this.setupEventHandlers();
        } catch (error) {
            console.error('Failed to connect to server:', error);
            this.handleConnectionError();
        }
    }
    
    // Setup event handlers per WebSocket
    setupEventHandlers() {
        this.socket.onopen = () => {
            console.log('Connected to server');
            this.isOnline = true;
            this.reconnectAttempts = 0;
            this.processPendingActions();
            this.eventSystem.emit('network:connected');
        };
        
        this.socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                this.handleServerMessage(message);
            } catch (error) {
                console.error('Error parsing server message:', error);
            }
        };
        
        this.socket.onclose = () => {
            console.log('Disconnected from server');
            this.isOnline = false;
            this.eventSystem.emit('network:disconnected');
            this.attemptReconnect();
        };
        
        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.handleConnectionError();
        };
    }
    
    // Gestisce messaggi dal server
    handleServerMessage(message) {
        const { action, data, timestamp } = message;
        
        switch (action) {
            case 'shop:purchase:success':
                this.handleShopPurchaseSuccess(data);
                break;
            case 'shop:purchase:error':
                this.handleShopPurchaseError(data);
                break;
            case 'player:update':
                this.handlePlayerUpdate(data);
                break;
            case 'state:sync':
                this.handleStateSync(data);
                break;
            case 'ping':
                this.handlePing(data);
                break;
            default:
                console.log('Unknown server message:', action, data);
        }
    }
    
    // Invia azione al server
    sendAction(action, data) {
        const message = {
            action,
            data,
            timestamp: Date.now()
        };
        
        if (this.isOnline && this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            // Modalità offline - salva per sync successiva
            this.pendingActions.push(message);
            console.log('Action queued for offline mode:', action);
        }
    }
    
    // Processa azioni in sospeso quando si riconnette
    processPendingActions() {
        if (this.pendingActions.length === 0) return;
        
        console.log(`Processing ${this.pendingActions.length} pending actions`);
        
        this.pendingActions.forEach(action => {
            this.socket.send(JSON.stringify(action));
        });
        
        this.pendingActions = [];
    }
    
    // Gestisce successo acquisto
    handleShopPurchaseSuccess(data) {
        this.eventSystem.emitSync('shop:purchase:success', data);
    }
    
    // Gestisce errore acquisto
    handleShopPurchaseError(data) {
        this.eventSystem.emitSync('shop:purchase:error', data);
    }
    
    // Gestisce aggiornamento giocatore
    handlePlayerUpdate(data) {
        this.eventSystem.emitSync('player:update', data);
    }
    
    // Gestisce sincronizzazione stato
    handleStateSync(data) {
        this.eventSystem.emitSync('state:sync', data);
    }
    
    // Gestisce ping
    handlePing(data) {
        this.sendAction('pong', { timestamp: Date.now() });
    }
    
    // Gestisce errore di connessione
    handleConnectionError() {
        this.isOnline = false;
        this.eventSystem.emit('network:error');
    }
    
    // Tenta riconnessione
    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('Max reconnection attempts reached');
            return;
        }
        
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
        
        console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
        
        setTimeout(() => {
            if (this.serverUrl) {
                this.connect(this.serverUrl);
            }
        }, delay);
    }
    
    // Disconnessione
    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.isOnline = false;
        this.reconnectAttempts = 0;
    }
    
    // Ottiene stato della connessione
    getConnectionStatus() {
        return {
            isOnline: this.isOnline,
            pendingActions: this.pendingActions.length,
            reconnectAttempts: this.reconnectAttempts
        };
    }
    
    // Pulisce azioni in sospeso
    clearPendingActions() {
        this.pendingActions = [];
    }
}
