export class MapInstance {
    constructor(mapId) {
        this.mapId = mapId;
        this.players = new Map();  // playerId -> playerData
        this.objects = new Map();  // objectId -> objectData
        this.npcs = new Map();     // npcId -> npcData
        
        // Dati specifici della mappa
        this.config = {
            spawnPoints: [],       // Punti di spawn nella mappa
            safeZones: [],         // Zone sicure (no PvP)
            resources: [],         // Risorse nella mappa
            maxPlayers: 50         // Limite giocatori per mappa
        };
        
        // Stato real-time
        this.activeCombats = new Map();  // Traccia combattimenti in corso
        this.activeEffects = new Map();  // Effetti attivi nella mappa
        
        // Inizializza array per risorse e NPC
        this.resources = [];  // Array delle risorse nella mappa
        this.npcs = [];       // Array degli NPC nella mappa
        
        // Inizializza configurazione specifica per mappa
        this.initializeMapConfig();
    }

    initializeMapConfig() {
        // Configurazione base per tutte le mappe
        this.config.spawnPoints = [
            { x: 100, y: 100 },
            { x: 200, y: 150 },
            { x: 300, y: 200 }
        ];

        // Configurazione specifica per mappa PvP
        if (this.mapId === 't-1') {
            this.config.safeZones = []; // Nessuna safe zone in PvP
            this.config.maxPlayers = 100;
        } else {
            // Safe zone intorno ai portali
            this.config.safeZones = [
                { x: 50, y: 50, width: 100, height: 100 }
            ];
        }
        
        // Aggiungi configurazione base per compatibilità
        this.config.name = this.mapId.toUpperCase();
        this.config.description = `Map ${this.mapId}`;
        this.config.npcType = `npc_${this.mapId}`;
        
        // Solo le mappe X1 hanno stazioni spaziali
        const mapsWithBase = ['v1', 'm1', 'e1'];
        this.config.hasSpaceStation = mapsWithBase.includes(this.mapId);
    }

    // Gestione giocatori
    addPlayer(player) {
        if (this.players.size >= this.config.maxPlayers) {
            return false; // Mappa piena
        }

        this.players.set(player.id, {
            id: player.id,
            position: player.position,
            faction: player.faction,
            stats: player.stats,
            lastUpdate: Date.now()
        });

        // Notifica altri giocatori
        this.broadcastPlayerJoined(player);
        return true;
    }

    removePlayer(playerId) {
        const player = this.players.get(playerId);
        if (player) {
            this.players.delete(playerId);
            this.broadcastPlayerLeft(playerId);
            return true;
        }
        return false;
    }

    updatePlayerPosition(playerId, newPosition) {
        const player = this.players.get(playerId);
        if (player) {
            player.position = newPosition;
            player.lastUpdate = Date.now();
            
            // Notifica altri giocatori della nuova posizione
            this.broadcastPlayerMoved(playerId, newPosition);
        }
    }

    // Gestione combattimento
    startCombat(attackerId, defenderId) {
        const attacker = this.players.get(attackerId);
        const defender = this.players.get(defenderId);

        if (!attacker || !defender) return false;

        // Verifica safe zone
        if (this.isInSafeZone(defender.position)) {
            return false; // No PvP in safe zone
        }

        const combatId = `${attackerId}_${defenderId}`;
        this.activeCombats.set(combatId, {
            attacker: attackerId,
            defender: defenderId,
            startTime: Date.now(),
            lastHit: Date.now()
        });

        // Notifica i giocatori coinvolti
        this.broadcastCombatStart(attackerId, defenderId);
        return true;
    }

    endCombat(combatId) {
        const combat = this.activeCombats.get(combatId);
        if (combat) {
            this.activeCombats.delete(combatId);
            this.broadcastCombatEnd(combat.attacker, combat.defender);
        }
    }

    // Verifica safe zone
    isInSafeZone(position) {
        return this.config.safeZones.some(zone => 
            position.x >= zone.x && 
            position.x <= zone.x + zone.width &&
            position.y >= zone.y && 
            position.y <= zone.y + zone.height
        );
    }

    // Update in tempo reale
    update(deltaTime) {
        // Aggiorna combattimenti
        this.activeCombats.forEach((combat, combatId) => {
            // Timeout combattimento dopo 30 secondi di inattività
            if (Date.now() - combat.lastHit > 30000) {
                this.endCombat(combatId);
            }
        });

        // Aggiorna NPC
        this.npcs.forEach(npc => {
            this.updateNPC(npc);
        });

        // Aggiorna risorse
        this.resources.forEach(resource => {
            this.updateResource(resource);
        });
    }

    // Metodi di broadcast (da implementare con il sistema di rete)
    broadcastPlayerJoined(player) {
        // Implementare con NetworkManager
    }

    broadcastPlayerLeft(playerId) {
        // Implementare con NetworkManager
    }

    broadcastPlayerMoved(playerId, position) {
        // Implementare con NetworkManager
    }

    broadcastCombatStart(attackerId, defenderId) {
        // Implementare con NetworkManager
    }

    broadcastCombatEnd(attackerId, defenderId) {
        // Implementare con NetworkManager
    }

    // Metodi di aggiornamento
    updateNPC(npc) {
        // Logica aggiornamento NPC
    }

    updateResource(resource) {
        // Logica aggiornamento risorse
    }
    
    // Metodi per gestire oggetti
    getObjectsByType(type) {
        const objects = [];
        this.objects.forEach((obj, id) => {
            if (obj.type === type) {
                objects.push(obj);
            }
        });
        return objects;
    }
    
    addObject(object) {
        this.objects.set(object.id, object);
    }
    
    removeObject(objectId) {
        return this.objects.delete(objectId);
    }

    // Serializzazione per salvataggio
    serialize() {
        return {
            mapId: this.mapId,
            players: Array.from(this.players.entries()),
            objects: Array.from(this.objects.entries()),
            npcs: Array.from(this.npcs.entries()),
            activeCombats: Array.from(this.activeCombats.entries()),
            config: this.config
        };
    }

    deserialize(data) {
        this.mapId = data.mapId;
        this.players = new Map(data.players);
        this.objects = new Map(data.objects);
        this.npcs = new Map(data.npcs);
        this.activeCombats = new Map(data.activeCombats);
        this.config = data.config;
    }
}