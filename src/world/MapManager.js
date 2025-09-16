import { Portal } from './Portal.js';
import { Enemy } from '../entities/Enemy.js';
import { BonusBox } from '../entities/BonusBox.js';
import { InteractiveAsteroid } from '../entities/InteractiveAsteroid.js';
import { MapInstance } from './MapInstance.js';
import { MapPersistence } from './MapPersistence.js';
import { ObjectManager } from './ObjectManager.js';

// Gestore delle mappe e portali
export class MapManager {
    constructor(game) {
        this.game = game;
        this.currentMap = 'v1'; // Mappa di partenza per VENUS
        
        // Nuovo sistema di persistenza
        this.persistence = new MapPersistence();
        this.objectManager = new ObjectManager();
        this.currentInstance = null;
        
        // Configurazione mappe (ora in MapInstance)
        this.portals = [];
        this.initPortals();
        
        // Carica istanza iniziale
        this.loadCurrentMapInstance();
    }
    
    // Inizializza i portali (ora crea solo i portali per la mappa corrente)
    initPortals() {
        this.portals = []; // Pulisci i portali esistenti
        this.createPortalsForCurrentMap();
    }
    
    // Crea i portali per la mappa corrente - SISTEMA SEMPLICE: navigazione lineare X1->X2->X3->X4->X5
    createPortalsForCurrentMap() {
        this.portals = []; // Pulisci i portali esistenti
        
        if (this.currentMap === 'v1') {
            // V1 -> V2 (lato destro) e V1 -> T-1 (centro)
            this.portals.push(new Portal(15000, 5000, 'v2', 1000, 5000, this.game));
            this.portals.push(new Portal(8000, 5000, 't-1', 8000, 5000, this.game));
        } else if (this.currentMap === 'x1') {
            // X1 -> X2 (lato destro)
            this.portals.push(new Portal(15000, 5000, 'x2', 1000, 5000, this.game));
        } else if (this.currentMap === 'x2') {
            // X2 -> X1 (lato sinistro) e X2 -> X3 (lato destro)
            this.portals.push(new Portal(500, 5000, 'x1', 14000, 5000, this.game));
            this.portals.push(new Portal(15000, 5000, 'x3', 1000, 5000, this.game));
        } else if (this.currentMap === 'x3') {
            // X3 -> X2 (lato sinistro) e X3 -> X4 (lato destro)
            this.portals.push(new Portal(500, 5000, 'x2', 14000, 5000, this.game));
            this.portals.push(new Portal(15000, 5000, 'x4', 1000, 5000, this.game));
        } else if (this.currentMap === 'x4') {
            // X4 -> X3 (lato sinistro) e X4 -> X5 (lato destro)
            this.portals.push(new Portal(500, 5000, 'x3', 14000, 5000, this.game));
            this.portals.push(new Portal(15000, 5000, 'x5', 1000, 5000, this.game));
        } else if (this.currentMap === 'x5') {
            // X5 -> X4 (lato sinistro)
            this.portals.push(new Portal(500, 5000, 'x4', 14000, 5000, this.game));
        }
    }
    
    // Carica istanza della mappa corrente
    loadCurrentMapInstance() {
        this.currentInstance = this.persistence.getOrCreateInstance(this.currentMap);
        
        // Forza rigenerazione se l'istanza ha configurazione vecchia o se è X2 senza Lordakia
        if (this.currentInstance && (!this.currentInstance.config.npcType || 
            (this.currentMap === 'x2' && !this.hasLordakiaInInstance()))) {
            console.log(`🔄 Rigenerando istanza ${this.currentMap} con nuova configurazione NPC`);
            this.currentInstance.config = this.currentInstance.getMapConfig(this.currentMap);
            this.currentInstance.generateInitialObjects();
        }
        
        this.syncInstanceToGame();
    }
    
    // Controlla se l'istanza ha Lordakia
    hasLordakiaInInstance() {
        if (!this.currentInstance) return false;
        const enemyObjects = this.currentInstance.getObjectsByType('enemy');
        return enemyObjects.some(obj => obj.npcType === 'npc_x2_lordakia');
    }
    
    // Sincronizza istanza con il gioco
    syncInstanceToGame() {
        if (!this.currentInstance) return;
        
        // Pulisci oggetti esistenti
        this.game.enemies = [];
        this.game.bonusBoxes = [];
        this.game.interactiveAsteroids = [];
        
        // Ricrea oggetti dall'istanza
        this.createEnemiesFromInstance();
        this.createBonusBoxesFromInstance();
        this.createAsteroidsFromInstance();
    }
    
    // Crea nemici dall'istanza
    createEnemiesFromInstance() {
        const enemyObjects = this.currentInstance.getObjectsByType('enemy');
        
        for (const obj of enemyObjects) {
            // Usa npcType dall'oggetto (ora sempre definito)
            const npcType = obj.npcType || this.currentInstance.config.npcType;
            
            const enemy = new Enemy(obj.x, obj.y, npcType);
            enemy.id = obj.id; // Assegna ID per tracking
            
            // Inizializza AI per il nemico
            enemy.initAI(this.game);
            
            this.objectManager.registerObject(obj.id, enemy, 'enemy');
            this.game.enemies.push(enemy);
        }
    }
    
    // Crea bonus box dall'istanza
    createBonusBoxesFromInstance() {
        const boxObjects = this.currentInstance.getObjectsByType('bonusbox');
        for (const obj of boxObjects) {
            if (obj.active) {
                const box = new BonusBox(obj.x, obj.y, this.game);
                box.id = obj.id;
                this.objectManager.registerObject(obj.id, box, 'bonusbox');
                this.game.bonusBoxes.push(box);
            }
        }
    }
    
    // Crea asteroidi dall'istanza
    createAsteroidsFromInstance() {
        const asteroidObjects = this.currentInstance.getObjectsByType('asteroid');
        for (const obj of asteroidObjects) {
            if (obj.active) {
                const asteroid = new InteractiveAsteroid(obj.x, obj.y, this.game);
                asteroid.id = obj.id;
                this.objectManager.registerObject(obj.id, asteroid, 'asteroid');
                this.game.interactiveAsteroids.push(asteroid);
            }
        }
    }
    
    // Cambia mappa
    changeMap(newMap, ship) {
        // Salva stato corrente prima del cambio
        this.saveCurrentMapState();
        
        // Salva la mappa di origine
        const fromMap = this.currentMap;
        
        // Cambia mappa
        this.currentMap = newMap;
        
        // Ricrea i portali per la nuova mappa
        this.createPortalsForCurrentMap();
        
        // Trova il portale di arrivo in base alla mappa di origine
        const arrivalPortal = this.getArrivalPortal(newMap, fromMap);
        if (arrivalPortal) {
            // Posiziona la nave al centro del portale di arrivo
            ship.x = arrivalPortal.x + arrivalPortal.width / 2;
            ship.y = arrivalPortal.y + arrivalPortal.height / 2;
        }
        
        // Aggiorna la camera
        this.game.camera.x = ship.x - this.game.camera.width / 2;
        this.game.camera.y = ship.y - this.game.camera.height / 2;
        
        // Riproduci suono arrivo portale
        if (this.game && this.game.audioManager) {
            this.game.audioManager.playPortalDoneSound();
        }
        
        // Carica nuova istanza mappa
        this.loadCurrentMapInstance();
        
        // Notifica cambio mappa
        const mapConfig = this.currentInstance?.config;
        if (mapConfig) {
            this.game.notifications.add(`🌌 Benvenuto in ${mapConfig.name}!`, 'info');
            this.showMapWelcomeMessage(newMap);
        }
        
        // Aggiorna il background
        this.updateBackground();
    }
    
    // Ottiene il portale di arrivo in base alla mappa di origine e destinazione
    getArrivalPortal(toMap, fromMap) {
        // ANDATA: X1→X2→X3→X4→X5
        if (fromMap === 'x1' && toMap === 'x2') {
            // X1 destro → atterri in X2 sinistro (quello che porta a X1)
            return new Portal(500, 5000, 'x1', 14000, 5000, this.game);
        } else if (fromMap === 'x2' && toMap === 'x3') {
            // X2 destro → atterri in X3 sinistro (quello che porta a X2)
            return new Portal(500, 5000, 'x2', 14000, 5000, this.game);
        } else if (fromMap === 'x3' && toMap === 'x4') {
            // X3 destro → atterri in X4 sinistro (quello che porta a X3)
            return new Portal(500, 5000, 'x3', 14000, 5000, this.game);
        } else if (fromMap === 'x4' && toMap === 'x5') {
            // X4 destro → atterri in X5 sinistro (quello che porta a X4)
            return new Portal(500, 5000, 'x4', 14000, 5000, this.game);
        }
        
        // RITORNO: X5→X4→X3→X2→X1
        else if (fromMap === 'x5' && toMap === 'x4') {
            // X5 sinistro → atterri in X4 destro (quello che porta a X5)
            return new Portal(15000, 5000, 'x5', 1000, 5000, this.game);
        } else if (fromMap === 'x4' && toMap === 'x3') {
            // X4 sinistro → atterri in X3 destro (quello che porta a X4)
            return new Portal(15000, 5000, 'x4', 1000, 5000, this.game);
        } else if (fromMap === 'x3' && toMap === 'x2') {
            // X3 sinistro → atterri in X2 destro (quello che porta a X3)
            return new Portal(15000, 5000, 'x3', 1000, 5000, this.game);
        } else if (fromMap === 'x2' && toMap === 'x1') {
            // X2 sinistro → atterri in X1 destro (quello che porta a X2)
            return new Portal(15000, 5000, 'x2', 1000, 5000, this.game);
        }
        
        return null;
    }
    
    // Salva stato corrente della mappa
    saveCurrentMapState() {
        if (!this.currentInstance) return;
        
        // Salva stato degli oggetti
        this.syncGameToInstance();
        
        // Persiste l'istanza
        this.persistence.saveInstance(this.currentMap, this.currentInstance);
    }
    
    // Sincronizza stato del gioco con l'istanza
    syncGameToInstance() {
        if (!this.currentInstance) return;
        
        // Aggiorna nemici
        for (const enemy of this.game.enemies) {
            if (enemy.id) {
                this.currentInstance.updateObject(enemy.id, {
                    x: enemy.x,
                    y: enemy.y,
                    active: enemy.active !== false
                });
            }
        }
        
        // Aggiorna bonus box
        for (const box of this.game.bonusBoxes) {
            if (box.id) {
                this.currentInstance.updateObject(box.id, {
                    x: box.x,
                    y: box.y,
                    active: box.active !== false
                });
            }
        }
        
        // Aggiorna asteroidi
        for (const asteroid of this.game.interactiveAsteroids) {
            if (asteroid.id) {
                this.currentInstance.updateObject(asteroid.id, {
                    x: asteroid.x,
                    y: asteroid.y,
                    active: asteroid.active !== false
                });
            }
        }
    }
    
    // Rigenera completamente la mappa (ora usa istanze)
    regenerateMap() {
        if (!this.currentInstance) return;
        
        // Rigenera oggetti nell'istanza
        this.currentInstance.generateInitialObjects();
        
        // Sincronizza con il gioco
        this.syncInstanceToGame();
        
        // Salva l'istanza aggiornata
        this.persistence.saveInstance(this.currentMap, this.currentInstance);
    }
    
    // Metodi di generazione ora gestiti da MapInstance
    
    // Aggiorna il background in base alla mappa corrente
    updateBackground() {
        if (this.currentInstance?.config) {
            const config = this.currentInstance.config;
            if (config.background === 'dreadspire') {
                this.game.backgroundType = 'dreadspire';
            } else {
                this.game.backgroundType = 'default';
            }
        }
    }
    
    // Controlla se la space station deve essere visibile nella mappa corrente
    shouldShowSpaceStation() {
        return this.currentInstance?.config?.hasSpaceStation || false;
    }
    
    // Ottiene il tipo di alieni per la mappa corrente (per compatibilità)
    getCurrentAlienType() {
        return this.currentInstance?.config?.npcType || 'npc_x1';
    }
    
    // Ottiene il tipo di NPC per la mappa corrente
    getCurrentNPCType() {
        return this.currentInstance?.config?.npcType || 'npc_x1';
    }
    
    // Ottiene configurazione mappa corrente
    getCurrentMapConfig() {
        return this.currentInstance?.config || null;
    }
    
    // Mostra messaggio di benvenuto per la mappa
    showMapWelcomeMessage(mapId) {
        const config = this.getCurrentMapConfig();
        if (config && this.game.zoneNotifications) {
            // Rimuovi eventuali notifiche di mappa precedenti
            this.game.zoneNotifications.removeZoneNotifications('MapWelcome');
            
            // Crea una notifica di zona nello stesso stile della spacestation
            const notificationId = this.game.zoneNotifications.addZoneNotification(
                'MapWelcome', 
                `Welcome to\n${config.name.toUpperCase()}\n[${config.description.toUpperCase()}]`, 
                'info'
            );
            
            // Rimuovi automaticamente la notifica dopo 4 secondi
            setTimeout(() => {
                if (this.game.zoneNotifications) {
                    this.game.zoneNotifications.removeZoneNotification(notificationId);
                }
            }, 4000);
        }
    }
    
    // Ottiene la mappa corrente
    getCurrentMap() {
        return this.currentInstance?.config || null;
    }
    
    // Salva automaticamente lo stato (da chiamare periodicamente)
    autoSave() {
        this.saveCurrentMapState();
    }
    
    // Ottiene statistiche del sistema
    getSystemStats() {
        return {
            currentMap: this.currentMap,
            instanceStats: this.currentInstance ? {
                objectCount: this.currentInstance.objects.size,
                lastUpdate: this.currentInstance.lastUpdate
            } : null,
            persistenceStats: this.persistence.getStats()
        };
    }
    
    // Forza rigenerazione di tutte le istanze (per aggiornamenti)
    forceRegenerateAllInstances() {
        console.log('🔄 Forzando rigenerazione di tutte le istanze...');
        this.persistence.clearAll();
        this.loadCurrentMapInstance();
        console.log('✅ Rigenerazione completata');
    }
    
    // Ottiene tutti i portali della mappa corrente (ora tutti i portali sono per la mappa corrente)
    getCurrentMapPortals() {
        return this.portals;
    }
    
    // Controlla se il giocatore è vicino a un portale
    checkPortalInteraction(ship) {
        const currentPortals = this.getCurrentMapPortals();
        for (let portal of currentPortals) {
            if (portal.checkCollision(ship)) {
                return portal;
            }
        }
        return null;
    }
    
    // Aggiorna tutti i portali
    update() {
        const currentPortals = this.getCurrentMapPortals();
        currentPortals.forEach(portal => {
            portal.update();
        });
    }
    
    // Disegna tutti i portali della mappa corrente
    draw(ctx, camera) {
        const currentPortals = this.getCurrentMapPortals();
        currentPortals.forEach(portal => {
            portal.draw(ctx, camera);
        });
    }
    
    // Disegna i portali nella minimappa
    drawMinimap(ctx, minimap) {
        const currentPortals = this.getCurrentMapPortals();
        currentPortals.forEach(portal => {
            portal.drawMinimap(ctx, minimap);
        });
    }
    
    // Gestisce l'interazione con i portali
    handlePortalInteraction() {
        const currentPortals = this.getCurrentMapPortals();
        for (let portal of currentPortals) {
            if (portal.handleInteraction()) {
                return true;
            }
        }
        return false;
    }
}
