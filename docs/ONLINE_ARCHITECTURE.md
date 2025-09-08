# Architettura Online-Ready per MMORPG

## Panoramica

Questo sistema fornisce un'architettura scalabile e modulare per implementare funzionalità online nel gioco MMORPG. È progettato per essere **online-ready** sin dall'inizio, permettendo una transizione fluida da modalità offline a online.

## Componenti Principali

### 1. **EventSystem** (`modules/EventSystem.js`)
Sistema di eventi centralizzato per la comunicazione tra componenti.

```javascript
// Emette evento locale (solo UI)
eventSystem.emitLocal('shop:item:click', { itemId: 'laser_x1' });

// Emette evento di rete (da inviare al server)
eventSystem.emitNetwork('shop:purchase', { itemId: 'laser_x1', quantity: 100 });

// Emette evento sincronizzato (da server a tutti i client)
eventSystem.emitSync('player:update', { credits: 5000 });
```

### 2. **GameState** (`modules/GameState.js`)
Gestione centralizzata dello stato del gioco con sincronizzazione.

```javascript
// Aggiorna stato
gameState.updateState('player.credits', 5000);

// Ottiene stato
const credits = gameState.getState('player.credits');

// Sincronizza con server
gameState.syncState(serverState);
```

### 3. **UIComponent** (`modules/UIComponent.js`)
Classe base per tutti i componenti UI scalabili.

```javascript
class MyComponent extends UIComponent {
    constructor(id, bounds, config) {
        super(id, bounds, config);
    }
    
    draw(ctx) {
        // Rendering del componente
    }
    
    onClick(x, y) {
        // Gestione click
        this.emitLocal('my:component:click', { data: 'example' });
    }
}
```

### 4. **NetworkManager** (`modules/NetworkManager.js`)
Gestione della comunicazione di rete con fallback offline.

```javascript
// Connessione
networkManager.connect('ws://localhost:8080');

// Invio azione
networkManager.sendAction('shop:purchase', { itemId: 'laser_x1' });

// Gestione messaggi
networkManager.on('shop:purchase:success', (data) => {
    console.log('Acquisto confermato:', data);
});
```

## Architettura Online-Ready

### **Separazione Client/Server**

```javascript
// CLIENT - Solo rendering e input
class GameClient {
    handleLocalClick(x, y) {
        return this.ui.handleClick(x, y);
    }
    
    sendToServer(action, data) {
        this.network.send(action, data);
    }
}

// SERVER - Logica di business
class GameServer {
    processShopPurchase(playerId, itemId, quantity) {
        // Validazione, controllo crediti, aggiornamento database
        return this.validateAndProcessPurchase(playerId, itemId, quantity);
    }
}
```

### **Sincronizzazione Stato**

```javascript
// Client invia azione
eventSystem.emitNetwork('shop:purchase', { itemId: 'laser_x1', quantity: 100 });

// Server processa e invia conferma
eventSystem.emitSync('shop:purchase:success', { 
    itemId: 'laser_x1', 
    quantity: 100, 
    newCredits: 4000 
});

// Client aggiorna UI
eventSystem.on('sync:shop:purchase:success', (data) => {
    gameState.updateState('player.credits', data.newCredits);
});
```

## Integrazione nel Gioco

### **1. Setup Base**

```javascript
import { OnlineGameManager } from './modules/OnlineGameManager.js';

class Game {
    constructor() {
        // Inizializza manager online
        this.onlineManager = new OnlineGameManager();
        
        // Collega componenti
        this.homePanel.setEventSystem(this.onlineManager.getEventSystem());
        this.homePanel.setGameState(this.onlineManager.getGameState());
    }
}
```

### **2. Modalità Online/Offline**

```javascript
// Modalità online
game.connectToServer('ws://localhost:8080');

// Modalità offline
game.setOfflineMode();

// Controllo stato
const status = game.getConnectionStatus();
console.log('Online:', status.isOnline);
```

### **3. Gestione Eventi**

```javascript
// Eventi locali (solo UI)
eventSystem.on('local:ui:click', (data) => {
    // Gestione click UI
});

// Eventi di rete (da inviare al server)
eventSystem.on('network:player:move', (data) => {
    // Invio movimento al server
});

// Eventi sincronizzati (da server)
eventSystem.on('sync:player:update', (data) => {
    // Aggiornamento stato da server
});
```

## Vantaggi dell'Architettura

### **1. Scalabilità**
- Componenti modulari e riutilizzabili
- Separazione chiara tra logica client e server
- Sistema di eventi flessibile

### **2. Manutenibilità**
- Codice organizzato in moduli
- Interfacce chiare tra componenti
- Facile testing e debugging

### **3. Online-Ready**
- Transizione fluida da offline a online
- Fallback automatico in caso di disconnessione
- Sincronizzazione stato automatica

### **4. Performance**
- Rendering ottimizzato
- Gestione efficiente degli eventi
- Caching intelligente dello stato

## Best Practices

### **1. Separazione Responsabilità**
```javascript
// ❌ SBAGLIATO - Logica mista
class ShopItem {
    buy() {
        // UI logic
        this.updateDisplay();
        // Business logic
        this.processPayment();
        // Network logic
        this.sendToServer();
    }
}

// ✅ CORRETTO - Responsabilità separate
class ShopItem extends UIComponent {
    buy() {
        this.emitNetwork('shop:purchase', { itemId: this.id });
    }
}

class ShopServer {
    processPurchase(data) {
        // Business logic
        return this.validateAndProcess(data);
    }
}
```

### **2. Gestione Stato**
```javascript
// ❌ SBAGLIATO - Stato distribuito
class Player {
    credits = 0;
    updateCredits(value) {
        this.credits = value;
        this.ui.updateCredits(value);
        this.shop.updateCredits(value);
    }
}

// ✅ CORRETTO - Stato centralizzato
class GameState {
    updateState('player.credits', value) {
        this.state.player.credits = value;
        this.notifyListeners('player.credits', value);
    }
}
```

### **3. Gestione Errori**
```javascript
// ✅ CORRETTO - Gestione errori robusta
try {
    const result = await this.networkManager.sendAction('shop:purchase', data);
    this.handleSuccess(result);
} catch (error) {
    this.handleError(error);
    // Fallback offline
    this.processOffline(data);
}
```

## Conclusione

Questa architettura fornisce una base solida per implementare funzionalità online nel gioco MMORPG. È progettata per essere:

- **Scalabile**: Facile aggiungere nuove funzionalità
- **Manutenibile**: Codice organizzato e modulare
- **Online-Ready**: Transizione fluida da offline a online
- **Performante**: Ottimizzata per il rendering e la sincronizzazione

Il sistema è già integrato nell'HomePanel e può essere facilmente esteso per altre parti del gioco.
