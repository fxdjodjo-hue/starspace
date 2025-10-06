import { MapInstance } from './MapInstance.js';

export class MapServer {
    constructor() {
        this.maps = new Map();
        this.playerMapAssignments = new Map(); // playerId -> mapId
        
        // Inizializza tutte le mappe come istanze separate
        this.initializeMaps();
    }

    initializeMaps() {
        // Venus Maps
        this.maps.set('v1', new MapInstance('v1'));
        this.maps.set('v2', new MapInstance('v2'));
        this.maps.set('v3', new MapInstance('v3'));
        this.maps.set('v4', new MapInstance('v4'));
        this.maps.set('v5', new MapInstance('v5'));
        this.maps.set('v6', new MapInstance('v6'));

        // Mars Maps
        this.maps.set('m1', new MapInstance('m1'));
        this.maps.set('m2', new MapInstance('m2'));
        this.maps.set('m3', new MapInstance('m3'));
        this.maps.set('m4', new MapInstance('m4'));
        this.maps.set('m5', new MapInstance('m5'));
        this.maps.set('m6', new MapInstance('m6'));

        // Earth Maps
        this.maps.set('e1', new MapInstance('e1'));
        this.maps.set('e2', new MapInstance('e2'));
        this.maps.set('e3', new MapInstance('e3'));
        this.maps.set('e4', new MapInstance('e4'));
        this.maps.set('e5', new MapInstance('e5'));
        this.maps.set('e6', new MapInstance('e6'));

        // PvP Hub
        this.maps.set('t-1', new MapInstance('t-1'));
    }

    // Gestione transizioni tra mappe
    playerChangeMap(player, fromMapId, toMapId) {
        const toMap = this.maps.get(toMapId);

        if (!toMap) {
            console.error(`Map not found: ${toMapId}`);
            return false;
        }

        // Rimuovi da mappa corrente solo se esiste
        if (fromMapId) {
            const fromMap = this.maps.get(fromMapId);
            if (fromMap) {
                fromMap.removePlayer(player.id);
            }
        }

        // Aggiungi alla nuova mappa
        const success = toMap.addPlayer(player);
        if (success) {
            this.playerMapAssignments.set(player.id, toMapId);
            
            // Sincronizza stato della nuova mappa al client
            this.syncMapState(player, toMap);
            return true;
        }

        return false;
    }

    // Ottieni mappa corrente del giocatore
    getPlayerMap(playerId) {
        const mapId = this.playerMapAssignments.get(playerId);
        return mapId ? this.maps.get(mapId) : null;
    }

    // Ottieni tutti i giocatori in una mappa
    getPlayersInMap(mapId) {
        const map = this.maps.get(mapId);
        return map ? Array.from(map.players.values()) : [];
    }

    // Ottieni statistiche mappa
    getMapStats(mapId) {
        const map = this.maps.get(mapId);
        if (!map) return null;

        return {
            mapId: mapId,
            playerCount: map.players.size,
            maxPlayers: map.config.maxPlayers,
            activeCombats: map.activeCombats.size,
            npcCount: map.npcs.size,
            resourceCount: map.resources.length
        };
    }

    // Ottieni statistiche globali
    getGlobalStats() {
        const stats = {
            totalPlayers: 0,
            totalMaps: this.maps.size,
            maps: {}
        };

        this.maps.forEach((map, mapId) => {
            const mapStats = this.getMapStats(mapId);
            stats.maps[mapId] = mapStats;
            stats.totalPlayers += mapStats.playerCount;
        });

        return stats;
    }

    // Gestione combattimento cross-map
    startCombat(attackerId, defenderId) {
        const attackerMap = this.getPlayerMap(attackerId);
        const defenderMap = this.getPlayerMap(defenderId);

        // I giocatori devono essere nella stessa mappa per combattere
        if (!attackerMap || !defenderMap || attackerMap.mapId !== defenderMap.mapId) {
            return false;
        }

        return attackerMap.startCombat(attackerId, defenderId);
    }

    // Update globale
    update(deltaTime) {
        // Aggiorna tutte le mappe in parallelo
        this.maps.forEach(map => {
            map.update(deltaTime);
        });
    }

    // Sincronizzazione stato mappa
    syncMapState(player, map) {
        // Invia stato completo della mappa al giocatore
        const mapState = {
            mapId: map.mapId,
            players: Array.from(map.players.values()),
            objects: Array.from(map.objects.values()),
            npcs: Array.from(map.npcs.values()),
            config: map.config
        };

        // Implementare invio al client
        this.sendToPlayer(player.id, 'map_state', mapState);
    }

    // Metodi di rete (da implementare)
    sendToPlayer(playerId, event, data) {
        // Implementare con NetworkManager
    }

    // Gestione disconnessioni
    handlePlayerDisconnect(playerId) {
        const map = this.getPlayerMap(playerId);
        if (map) {
            map.removePlayer(playerId);
            this.playerMapAssignments.delete(playerId);
        }
    }

    // Salvataggio stato
    saveState() {
        const state = {
            maps: {},
            playerAssignments: Array.from(this.playerMapAssignments.entries())
        };

        this.maps.forEach((map, mapId) => {
            state.maps[mapId] = map.serialize();
        });

        return state;
    }

    loadState(state) {
        // Ricarica mappe
        Object.entries(state.maps).forEach(([mapId, mapData]) => {
            const map = this.maps.get(mapId);
            if (map) {
                map.deserialize(mapData);
            }
        });

        // Ricarica assegnazioni giocatori
        this.playerMapAssignments = new Map(state.playerAssignments);
    }
}

