// Manager principale per il gioco online-ready
import { EventSystem } from './EventSystem.js';
import { GameState } from './GameState.js';
import { NetworkManager } from './NetworkManager.js';

export class OnlineGameManager {
    constructor() {
        // Inizializza i sistemi core
        this.eventSystem = new EventSystem();
        this.gameState = new GameState();
        this.networkManager = new NetworkManager(this.eventSystem);
        
        // Collega i sistemi
        this.gameState.setEventSystem(this.eventSystem);
        this.eventSystem.setNetworkManager(this.networkManager);
        
        // Stato di connessione
        this.isOnline = false;
        this.serverUrl = null;
        
        // Setup event listeners
        this.setupEventListeners();
    }
    
    // Setup event listeners per gestire la connessione
    setupEventListeners() {
        this.eventSystem.on('network:connected', () => {
            console.log('🌐 Connesso al server');
            this.isOnline = true;
            this.gameState.updateState('ui.connectionStatus', 'online');
        });
        
        this.eventSystem.on('network:disconnected', () => {
            console.log('🌐 Disconnesso dal server');
            this.isOnline = false;
            this.gameState.updateState('ui.connectionStatus', 'offline');
        });
        
        this.eventSystem.on('network:error', () => {
            console.log('🌐 Errore di connessione');
            this.gameState.updateState('ui.connectionStatus', 'error');
        });
    }
    
    // Connessione al server
    connect(serverUrl) {
        this.serverUrl = serverUrl;
        this.networkManager.connect(serverUrl);
    }
    
    // Alias per compatibilità
    connectToServer(serverUrl) {
        this.connect(serverUrl);
    }
    
    // Disconnessione
    disconnect() {
        this.networkManager.disconnect();
        this.isOnline = false;
    }
    
    // Modalità offline
    setOfflineMode() {
        this.disconnect();
        this.isOnline = false;
        this.gameState.updateState('ui.connectionStatus', 'offline');
    }
    
    // Ottiene lo stato della connessione
    getConnectionStatus() {
        return {
            isOnline: this.isOnline,
            serverUrl: this.serverUrl,
            ...this.networkManager.getConnectionStatus()
        };
    }
    
    // Ottiene il game state
    getGameState() {
        return this.gameState;
    }
    
    // Ottiene l'event system
    getEventSystem() {
        return this.eventSystem;
    }
    
    // Ottiene il network manager
    getNetworkManager() {
        return this.networkManager;
    }
    
    // Aggiorna lo stato del giocatore
    updatePlayerState(playerData) {
        this.gameState.updateState('player', playerData);
    }
    
    // Sincronizza con il server
    syncWithServer(serverState) {
        this.gameState.syncState(serverState);
    }
    
    // Pulisce tutto
    cleanup() {
        this.networkManager.disconnect();
        this.eventSystem.clear();
        this.gameState.reset();
    }
}
