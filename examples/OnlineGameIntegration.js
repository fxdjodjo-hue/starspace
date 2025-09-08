// Esempio di integrazione del sistema online nel game.js
import { OnlineGameManager } from '../modules/OnlineGameManager.js';
import { HomePanel } from '../modules/HomePanel.js';

export class OnlineGame extends Game {
    constructor() {
        super();
        
        // Inizializza il manager online
        this.onlineManager = new OnlineGameManager();
        
        // Collega l'HomePanel al sistema online
        this.setupOnlineHomePanel();
        
        // Setup event listeners per la sincronizzazione
        this.setupOnlineEventListeners();
    }
    
    // Setup dell'HomePanel online
    setupOnlineHomePanel() {
        // Collega l'HomePanel al sistema online
        this.homePanel.setEventSystem(this.onlineManager.getEventSystem());
        this.homePanel.setGameState(this.onlineManager.getGameState());
        
        // Aggiorna lo stato del giocatore
        this.updatePlayerState();
    }
    
    // Setup event listeners per la sincronizzazione
    setupOnlineEventListeners() {
        const eventSystem = this.onlineManager.getEventSystem();
        
        // Ascolta eventi di acquisto dal negozio
        eventSystem.on('local:shop:button:click', (data) => {
            console.log('🛒 Acquisto locale:', data);
            // Qui puoi aggiungere logica per processare l'acquisto
        });
        
        // Ascolta eventi di rete per acquisti
        eventSystem.on('network:shop:button:action', (data) => {
            console.log('🛒 Acquisto di rete:', data);
            // Qui puoi aggiungere logica per processare acquisti da altri giocatori
        });
        
        // Ascolta sincronizzazione stato
        eventSystem.on('sync:state:sync', (data) => {
            console.log('🔄 Sincronizzazione stato:', data);
            // Qui puoi aggiungere logica per aggiornare l'UI
        });
    }
    
    // Aggiorna lo stato del giocatore
    updatePlayerState() {
        if (this.ship) {
            const playerData = {
                id: this.ship.id || '883098',
                level: this.ship.currentLevel || 1,
                credits: this.ship.getResource('credits') || 0,
                uridium: this.ship.getResource('uridium') || 0,
                honor: this.ship.getResource('honor') || 0,
                experience: this.ship.getResource('experience') || 0
            };
            
            this.onlineManager.updatePlayerState(playerData);
        }
    }
    
    // Connessione al server
    connectToServer(serverUrl) {
        this.onlineManager.connect(serverUrl);
    }
    
    // Disconnessione
    disconnectFromServer() {
        this.onlineManager.disconnect();
    }
    
    // Modalità offline
    setOfflineMode() {
        this.onlineManager.setOfflineMode();
    }
    
    // Ottiene lo stato della connessione
    getConnectionStatus() {
        return this.onlineManager.getConnectionStatus();
    }
    
    // Override del metodo update per includere la sincronizzazione online
    update(deltaTime) {
        // Chiama il metodo update originale
        super.update(deltaTime);
        
        // Aggiorna lo stato del giocatore
        this.updatePlayerState();
        
        // Aggiorna l'HomePanel
        if (this.homePanel) {
            this.homePanel.updatePopup(deltaTime);
        }
    }
    
    // Override del metodo render per includere l'UI online
    render(ctx) {
        // Chiama il metodo render originale
        super.render(ctx);
        
        // Renderizza l'HomePanel
        if (this.homePanel) {
            this.homePanel.draw(ctx);
        }
    }
    
    // Override del metodo handleClick per includere l'UI online
    handleClick(x, y) {
        // Gestisci click nell'HomePanel
        if (this.homePanel && this.homePanel.visible) {
            const handled = this.homePanel.handleClick(x, y);
            if (handled) {
                return true;
            }
        }
        
        // Chiama il metodo handleClick originale
        return super.handleClick(x, y);
    }
    
    // Cleanup
    cleanup() {
        this.onlineManager.cleanup();
        super.cleanup();
    }
}
