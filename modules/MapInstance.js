// MapInstance - Gestione istanze di mappa per multiplayer
export class MapInstance {
    constructor(mapId, maxPlayers = 50) {
        this.mapId = mapId;
        this.maxPlayers = maxPlayers;
        this.players = new Map();
        this.objects = new Map();
        this.lastUpdate = Date.now();
        this.isActive = true;
    }
    
    // Aggiunge un giocatore all'istanza
    addPlayer(playerId, playerData) {
        if (this.players.size >= this.maxPlayers) {
            return false;
        }
        
        this.players.set(playerId, {
            ...playerData,
            joinedAt: Date.now(),
            lastSeen: Date.now()
        });
        
        return true;
    }
    
    // Rimuove un giocatore dall'istanza
    removePlayer(playerId) {
        return this.players.delete(playerId);
    }
    
    // Aggiorna dati giocatore
    updatePlayer(playerId, playerData) {
        if (this.players.has(playerId)) {
            const player = this.players.get(playerId);
            Object.assign(player, playerData);
            player.lastSeen = Date.now();
            return true;
        }
        return false;
    }
    
    // Ottiene tutti i giocatori
    getPlayers() {
        return Array.from(this.players.values());
    }
    
    // Ottiene stato dell'istanza
    getState() {
        return {
            mapId: this.mapId,
            playerCount: this.players.size,
            maxPlayers: this.maxPlayers,
            isActive: this.isActive,
            lastUpdate: this.lastUpdate
        };
    }
    
    // Cleanup giocatori inattivi
    cleanupInactivePlayers(timeout = 30000) {
        const now = Date.now();
        for (const [playerId, player] of this.players) {
            if (now - player.lastSeen > timeout) {
                this.players.delete(playerId);
            }
        }
    }
}
