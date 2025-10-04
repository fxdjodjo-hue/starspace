const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');
const path = require('path');

class MMORPGGameServer {
    constructor(port = process.env.PORT || 8080) {
        this.port = port;
        this.clients = new Map(); // playerId -> WebSocket
        this.players = new Map(); // playerId -> playerData
        this.playerInputs = new Map(); // playerId -> current input state
        this.gameState = {
            players: {},
            entities: {},
            world: {
                width: 16000,
                height: 10000
            }
        };
        
        // Server tick system
        this.tickRate = 60; // 60 FPS
        this.tickInterval = 1000 / this.tickRate; // ~16.67ms
        this.lastTick = Date.now();
        this.frameCount = 0;
        
        this.setupExpress();
        this.setupWebSocket();
        this.startGameLoop();
        this.startFakePlayers();
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
            case 'player:position':
                this.handlePlayerPosition(ws, data);
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
            rotation: data.rotation || 0,
            size: data.size || 1,
            floatingOffset: data.floatingOffset || 0,
            floatingAmplitude: data.floatingAmplitude || 0,
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
        
        // Notifica il nuovo giocatore di tutti i player fake esistenti
        for (const [existingPlayerId, existingPlayer] of this.players) {
            if (existingPlayer.isFake && existingPlayerId !== playerId) {
                ws.send(JSON.stringify({
                    action: 'player:joined',
                    data: existingPlayer
                }));
                console.log(`📡 Inviato bot esistente ${existingPlayer.nickname} al nuovo giocatore`);
            }
        }
        
        // Notifica altri giocatori
        this.broadcastToOthers(playerId, {
            action: 'player:joined',
            data: playerData
        });
        
        console.log(`👤 Giocatore ${playerData.nickname} (${playerId}) si è unito al gioco`);
    }
    
    handlePlayerPosition(ws, data) {
        const playerId = this.getPlayerIdBySocket(ws);
        if (!playerId) return;
        
        // SEMPLICE: Aggiorna solo la posizione del giocatore
        const player = this.players.get(playerId);
        if (player) {
            player.x = data.x;
            player.y = data.y;
            player.rotation = data.rotation;
            player.lastSeen = Date.now();
            
            // Aggiorna game state
            this.gameState.players[playerId] = player;
            
            // Debug: log posizione ricevuta ogni 60 frame
            if (this.frameCount % 60 === 0) {
                console.log(`🎮 Posizione ricevuta da ${player.nickname}: (${data.x}, ${data.y})`);
            }
        }
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
    
    startGameLoop() {
        const gameLoop = () => {
            const now = Date.now();
            const deltaTime = (now - this.lastTick) / 1000; // Converti in secondi
            
            if (deltaTime >= this.tickInterval) {
                this.updateGame(deltaTime);
                this.lastTick = now;
            }
            
            setTimeout(gameLoop, 1); // Controlla ogni millisecondo
        };
        
        gameLoop();
        console.log(`🎮 Server game loop avviato a ${this.tickRate} FPS`);
    }
    
    startFakePlayers() {
        // Crea 3 player fake per testing
        const fakePlayerNames = ['BotAlpha', 'BotBeta', 'BotGamma'];
        
        fakePlayerNames.forEach((name, index) => {
            setTimeout(() => {
                this.createFakePlayer(name, index);
            }, index * 2000); // Crea ogni 2 secondi
        });
        
        console.log('🤖 Sistema player fake avviato');
    }
    
    createFakePlayer(name, index) {
        const playerId = `fake_${name}_${Date.now()}`;
        const playerData = {
            id: playerId,
            nickname: name,
            x: 1000 + (index * 200), // Posizioni diverse
            y: 1000 + (index * 200),
            rotation: 0,
            size: 1,
            floatingOffset: 0,
            floatingAmplitude: 0,
            credits: 1000,
            uridium: 0,
            honor: 0,
            level: 1,
            faction: 'EIC',
            lastSeen: Date.now(),
            isFake: true
        };
        
        // Registra il giocatore fake
        this.players.set(playerId, playerData);
        this.gameState.players[playerId] = playerData;
        
        // Notifica tutti i client connessi del nuovo player fake
        this.broadcast({
            action: 'player:joined',
            data: playerData
        });
        
        // Simula input fake
        this.simulateFakePlayerInput(playerId, playerData);
        
        console.log(`🤖 Player fake creato: ${name} (${playerId})`);
        console.log(`🤖 Player fake posizione: (${playerData.x}, ${playerData.y})`);
        console.log(`🤖 Totale player nel server: ${this.players.size}`);
    }
    
    simulateFakePlayerInput(playerId, player) {
        // Simula movimento casuale ogni 3-5 secondi
        const moveInterval = () => {
            if (this.players.has(playerId)) {
                // Genera target casuale
                const targetX = Math.random() * this.gameState.world.width;
                const targetY = Math.random() * this.gameState.world.height;
                
                // Salva input fake
                this.playerInputs.set(playerId, {
                    targetX: targetX,
                    targetY: targetY,
                    currentX: player.x,
                    currentY: player.y,
                    timestamp: Date.now()
                });
                
                console.log(`🤖 ${player.nickname} si muove verso: (${targetX.toFixed(0)}, ${targetY.toFixed(0)})`);
                
                // Programma prossimo movimento
                setTimeout(moveInterval, 3000 + Math.random() * 2000); // 3-5 secondi
            }
        };
        
        // Inizia il movimento dopo 5 secondi
        setTimeout(moveInterval, 5000);
    }
    
    updateGame(deltaTime) {
        this.frameCount++;
        
        // SEMPLICE: Solo sincronizzazione posizioni, niente logica di gioco
        // Il client gestisce tutto come offline
        
        // Broadcast stato aggiornato a tutti i client ogni 10 frame (6 volte al secondo)
        if (this.frameCount % 10 === 0) {
            this.broadcastGameState();
        }
    }
    
    updatePlayerPosition(playerId, player, input, deltaTime) {
        const speed = 200; // pixels per secondo
        
        // Calcola direzione verso il target
        const dx = input.targetX - player.x;
        const dy = input.targetY - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Se siamo già al target, non muovere
        if (distance < 5) {
            return;
        }
        
        // Calcola movimento verso il target
        const moveX = (dx / distance) * speed * deltaTime;
        const moveY = (dy / distance) * speed * deltaTime;
        
        // Debug: log movimento se c'è input
        if (moveX !== 0 || moveY !== 0) {
            console.log(`🚀 ${player.nickname} si muove: dx=${moveX.toFixed(2)}, dy=${moveY.toFixed(2)}`);
        }
        
        // Applica movimento
        player.x += moveX;
        player.y += moveY;
        
        // Aggiorna parametri di rendering
        player.rotation = Math.atan2(dy, dx);
        player.lastSeen = Date.now();
        
        // Mantieni il giocatore nei confini del mondo
        player.x = Math.max(0, Math.min(this.gameState.world.width, player.x));
        player.y = Math.max(0, Math.min(this.gameState.world.height, player.y));
        
        // Aggiorna game state
        this.gameState.players[playerId] = player;
    }
    
    broadcastGameState() {
        // Invia stato aggiornato a tutti i client
        this.broadcast({
            action: 'game:state:update',
            data: {
                players: Object.fromEntries(this.players),
                timestamp: Date.now()
            }
        });
        
        // Debug: log stato inviato ogni 60 frame
        if (this.frameCount % 60 === 0) {
            console.log('📡 Broadcast game state:', Object.keys(Object.fromEntries(this.players)).length, 'players');
            for (const [playerId, player] of this.players) {
                if (player.isFake) {
                    console.log(`📡 Bot ${player.nickname}: posizione (${player.x}, ${player.y})`);
                }
            }
        }
    }
    
    start() {
        const httpPort = process.env.HTTP_PORT || 3000;
        
        this.app.listen(httpPort, () => {
            console.log('🚀 Server HTTP avviato su http://localhost:' + httpPort);
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
