const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');
const path = require('path');

class MMORPGGameServer {
    constructor(port = 8080) {
        this.port = port;
        this.clients = new Map(); // playerId -> WebSocket
        this.players = new Map(); // playerId -> playerData
        this.gameState = {
            players: {},
            entities: {},
            world: {
                width: 16000,
                height: 10000
            }
        };
        
        this.setupExpress();
        this.setupWebSocket();
    }
    
    setupExpress() {
        this.app = express();
        this.app.use(cors());
        this.app.use(express.static('.'));
        
        // Serve il gioco
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'index.html'));
        });
        
        // API endpoints
        this.app.get('/api/players', (req, res) => {
            res.json(Array.from(this.players.values()));
        });
        
        this.app.get('/api/gamestate', (req, res) => {
            res.json(this.gameState);
        });
    }
    
    setupWebSocket() {
        this.wss = new WebSocket.Server({ 
            port: this.port,
            path: '/ws'
        });
        
        this.wss.on('connection', (ws, req) => {
            console.log('🔌 Nuova connessione WebSocket');
            
            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data);
                    this.handleMessage(ws, message);
                } catch (error) {
                    console.error('❌ Errore parsing messaggio:', error);
                }
            });
            
            ws.on('close', () => {
                this.handleDisconnection(ws);
            });
            
            ws.on('error', (error) => {
                console.error('❌ Errore WebSocket:', error);
            });
        });
        
        // Heartbeat per mantenere connessioni vive
        setInterval(() => {
            this.broadcast({ action: 'ping', timestamp: Date.now() });
        }, 30000);
    }
    
    handleMessage(ws, message) {
        const { action, data, timestamp } = message;
        
        switch (action) {
            case 'player:join':
                this.handlePlayerJoin(ws, data);
                break;
            case 'player:move':
                this.handlePlayerMove(ws, data);
                break;
            case 'player:attack':
                this.handlePlayerAttack(ws, data);
                break;
            case 'player:update':
                this.handlePlayerUpdate(ws, data);
                break;
            case 'shop:purchase':
                this.handleShopPurchase(ws, data);
                break;
            case 'pong':
                // Risposta al ping
                break;
            default:
                console.log('❓ Azione sconosciuta:', action, data);
        }
    }
    
    handlePlayerJoin(ws, data) {
        const playerId = data.playerId || this.generatePlayerId();
        const playerData = {
            id: playerId,
            nickname: data.nickname || 'Player' + playerId,
            x: data.x || 0,
            y: data.y || 0,
            credits: data.credits || 1000,
            uridium: data.uridium || 0,
            honor: data.honor || 0,
            level: data.level || 1,
            faction: data.faction || 'EIC',
            lastSeen: Date.now()
        };
        
        // Registra il giocatore
        this.clients.set(playerId, ws);
        this.players.set(playerId, playerData);
        this.gameState.players[playerId] = playerData;
        
        // Invia conferma al giocatore
        ws.send(JSON.stringify({
            action: 'player:join:success',
            data: { playerId, gameState: this.gameState }
        }));
        
        // Notifica altri giocatori
        this.broadcastToOthers(playerId, {
            action: 'player:joined',
            data: playerData
        });
        
        console.log(`👤 Giocatore ${playerData.nickname} (${playerId}) si è unito al gioco`);
    }
    
    handlePlayerMove(ws, data) {
        const playerId = this.getPlayerIdBySocket(ws);
        if (!playerId) return;
        
        const player = this.players.get(playerId);
        if (!player) return;
        
        // Aggiorna posizione
        player.x = data.x;
        player.y = data.y;
        player.lastSeen = Date.now();
        
        this.gameState.players[playerId] = player;
        
        // Broadcast movimento a tutti gli altri giocatori
        this.broadcastToOthers(playerId, {
            action: 'player:moved',
            data: { playerId, x: data.x, y: data.y }
        });
    }
    
    handlePlayerAttack(ws, data) {
        const playerId = this.getPlayerIdBySocket(ws);
        if (!playerId) return;
        
        // Broadcast attacco a tutti i giocatori vicini
        this.broadcast({
            action: 'player:attacked',
            data: { playerId, targetId: data.targetId, damage: data.damage }
        });
    }
    
    handlePlayerUpdate(ws, data) {
        const playerId = this.getPlayerIdBySocket(ws);
        if (!playerId) return;
        
        const player = this.players.get(playerId);
        if (!player) return;
        
        // Aggiorna dati giocatore
        Object.assign(player, data);
        player.lastSeen = Date.now();
        
        this.gameState.players[playerId] = player;
        
        // Notifica aggiornamento
        this.broadcastToOthers(playerId, {
            action: 'player:updated',
            data: { playerId, ...data }
        });
    }
    
    handleShopPurchase(ws, data) {
        const playerId = this.getPlayerIdBySocket(ws);
        if (!playerId) return;
        
        const player = this.players.get(playerId);
        if (!player) return;
        
        // Simula acquisto (qui potresti aggiungere logica di validazione)
        const { itemId, quantity, cost } = data;
        
        if (player.credits >= cost) {
            player.credits -= cost;
            player.lastSeen = Date.now();
            
            this.gameState.players[playerId] = player;
            
            // Conferma acquisto
            ws.send(JSON.stringify({
                action: 'shop:purchase:success',
                data: { itemId, quantity, newCredits: player.credits }
            }));
            
            console.log(`🛒 ${player.nickname} ha acquistato ${quantity}x ${itemId} per ${cost} crediti`);
        } else {
            // Errore: crediti insufficienti
            ws.send(JSON.stringify({
                action: 'shop:purchase:error',
                data: { error: 'Crediti insufficienti', required: cost, available: player.credits }
            }));
        }
    }
    
    handleDisconnection(ws) {
        const playerId = this.getPlayerIdBySocket(ws);
        if (!playerId) return;
        
        const player = this.players.get(playerId);
        if (player) {
            console.log(`👋 Giocatore ${player.nickname} (${playerId}) si è disconnesso`);
            
            // Notifica altri giocatori
            this.broadcastToOthers(playerId, {
                action: 'player:left',
                data: { playerId }
            });
            
            // Rimuovi giocatore
            this.clients.delete(playerId);
            this.players.delete(playerId);
            delete this.gameState.players[playerId];
        }
    }
    
    getPlayerIdBySocket(ws) {
        for (const [playerId, socket] of this.clients) {
            if (socket === ws) {
                return playerId;
            }
        }
        return null;
    }
    
    broadcast(message) {
        const data = JSON.stringify(message);
        this.clients.forEach((ws) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(data);
            }
        });
    }
    
    broadcastToOthers(excludePlayerId, message) {
        const data = JSON.stringify(message);
        this.clients.forEach((ws, playerId) => {
            if (playerId !== excludePlayerId && ws.readyState === WebSocket.OPEN) {
                ws.send(data);
            }
        });
    }
    
    generatePlayerId() {
        return 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    start() {
        this.app.listen(3000, () => {
            console.log('🚀 Server HTTP avviato su http://localhost:3000');
        });
        
        console.log(`🎮 Server WebSocket MMORPG avviato su ws://localhost:${this.port}/ws`);
        console.log(`👥 Giocatori connessi: ${this.clients.size}`);
        
        // Cleanup giocatori inattivi ogni 5 minuti
        setInterval(() => {
            this.cleanupInactivePlayers();
        }, 300000);
    }
    
    cleanupInactivePlayers() {
        const now = Date.now();
        const inactiveThreshold = 5 * 60 * 1000; // 5 minuti
        
        for (const [playerId, player] of this.players) {
            if (now - player.lastSeen > inactiveThreshold) {
                console.log(`🧹 Rimuovo giocatore inattivo: ${player.nickname}`);
                this.clients.delete(playerId);
                this.players.delete(playerId);
                delete this.gameState.players[playerId];
            }
        }
    }
}

// Avvia il server
const server = new MMORPGGameServer(8080);
server.start();

module.exports = MMORPGGameServer;
