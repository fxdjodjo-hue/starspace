import { Portal } from './Portal.js';
import { Enemy } from './Enemy.js';
import { BonusBox } from './BonusBox.js';
import { InteractiveAsteroid } from './InteractiveAsteroid.js';
import { MapInstance } from './MapInstance.js';
import { MapPersistence } from './MapPersistence.js';
import { ObjectManager } from './ObjectManager.js';

// Gestore delle mappe e portali
export class MapManager {
    constructor(game) {
        this.game = game;
        this.currentMap = 'x1';
        
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
    
    // Inizializza i portali
    initPortals() {
        // Portale da X1 a X2 (lato destro di X1)
        this.portals.push(new Portal(15000, 5000, 'x2', 1000, 5000, this.game));
        
        // Portale da X2 a X1 (lato sinistro di X2)
        this.portals.push(new Portal(500, 5000, 'x1', 14000, 5000, this.game));
    }
    
    // Carica istanza della mappa corrente
    loadCurrentMapInstance() {
        this.currentInstance = this.persistence.getOrCreateInstance(this.currentMap);
        
        // Forza rigenerazione se l'istanza ha configurazione vecchia
        if (this.currentInstance && !this.currentInstance.config.npcType) {
            console.log(`🔄 Rigenerando istanza ${this.currentMap} con nuova configurazione NPC`);
            this.currentInstance.config = this.currentInstance.getMapConfig(this.currentMap);
            this.currentInstance.generateInitialObjects();
        }
        
        this.syncInstanceToGame();
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
            // Usa npcType dall'oggetto o fallback alla configurazione
            const npcType = obj.npcType || this.currentInstance.config.npcType;
            const enemy = new Enemy(obj.x, obj.y, npcType);
            enemy.id = obj.id; // Assegna ID per tracking
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
        
        // Cambia mappa
        this.currentMap = newMap;
        
        // Trova il portale di destinazione corretto
        const targetPortal = this.portals.find(p => p.targetMap === newMap);
        if (targetPortal) {
            // Posiziona la nave al centro del portale di destinazione
            ship.x = targetPortal.targetX + targetPortal.width / 2;
            ship.y = targetPortal.targetY + targetPortal.height / 2;
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
    
    // Ottiene tutti i portali della mappa corrente
    getCurrentMapPortals() {
        return this.portals.filter(portal => {
            // Filtra i portali in base alla mappa corrente
            if (this.currentMap === 'x1') {
                // Nella mappa X1, mostra solo il portale che porta alla X2
                return portal.targetMap === 'x2';
            } else if (this.currentMap === 'x2') {
                // Nella mappa X2, mostra solo il portale che porta alla X1
                return portal.targetMap === 'x1';
            }
            return false;
        });
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
