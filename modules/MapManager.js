import { Portal } from './Portal.js';
import { Enemy } from './Enemy.js';
import { BonusBox } from './BonusBox.js';
import { InteractiveAsteroid } from './InteractiveAsteroid.js';

// Gestore delle mappe e portali
export class MapManager {
    constructor(game) {
        this.game = game;
        this.currentMap = 'x1';
        this.maps = {
            x1: { 
                width: 16000, 
                height: 10000, 
                background: 'dreadspire',
                name: 'X1 Sector',
                description: 'Settore principale con stazione spaziale',
                hasSpaceStation: true,
                hasAliens: true,
                alienType: 'dreadspire'
            },
            x2: { 
                width: 16000, 
                height: 10000, 
                background: 'dreadspire',
                name: 'X2 Sector',
                description: 'Settore secondario senza stazione spaziale',
                hasSpaceStation: false,
                hasAliens: true,
                alienType: 'x2_aliens'
            }
        };
        this.portals = [];
        this.initPortals();
    }
    
    // Inizializza i portali
    initPortals() {
        // Portale da X1 a X2 (lato destro di X1)
        this.portals.push(new Portal(15000, 5000, 'x2', 1000, 5000, this.game));
        
        // Portale da X2 a X1 (lato sinistro di X2)
        this.portals.push(new Portal(500, 5000, 'x1', 14000, 5000, this.game));
        
    }
    
    // Cambia mappa
    changeMap(newMap, ship) {
        if (this.maps[newMap]) {
            this.currentMap = newMap;
            
            // Trova il portale di destinazione corretto
            // Il portale di destinazione è quello che porta DALLA mappa corrente ALLA mappa di destinazione
            const targetPortal = this.portals.find(p => p.targetMap === newMap);
            if (targetPortal) {
                // Posiziona la nave al centro del portale di destinazione
                // Usa le coordinate di destinazione del portale (targetX, targetY)
                ship.x = targetPortal.targetX + targetPortal.width / 2;
                ship.y = targetPortal.targetY + targetPortal.height / 2;
            }
            
            // Aggiorna la camera
            this.game.camera.x = ship.x - this.game.camera.width / 2;
            this.game.camera.y = ship.y - this.game.camera.height / 2;
            
            // Notifica cambio mappa con messaggio di benvenuto
            this.game.notifications.add(`🌌 Benvenuto in ${this.maps[newMap].name}!`, 'info');
            
            // Mostra messaggio di benvenuto nello stesso stile della spacestation
            this.showMapWelcomeMessage(newMap);
            
            // Aggiorna il background
            this.updateBackground();
            
            // Rigenera completamente la mappa
            this.regenerateMap();
        }
    }
    
    // Rigenera completamente la mappa
    regenerateMap() {
        const game = this.game;
        
        // Pulisci nemici esistenti
        game.enemies = [];
        
        // Pulisci bonus box esistenti
        game.bonusBoxes = [];
        
        // Pulisci asteroidi interattivi esistenti
        game.interactiveAsteroids = [];
        
        // Rigenera nemici per la mappa corrente
        this.generateEnemies();
        
        // Rigenera bonus box per la mappa corrente
        this.generateBonusBoxes();
        
        // Rigenera asteroidi interattivi per la mappa corrente
        this.generateInteractiveAsteroids();
    }
    
    // Genera nemici per la mappa corrente
    generateEnemies() {
        const game = this.game;
        const map = this.maps[this.currentMap];
        
        if (map.hasAliens) {
            // Genera nemici in base al tipo di mappa
            const enemyCount = this.currentMap === 'x1' ? 15 : 20; // X2 ha più nemici
            
            for (let i = 0; i < enemyCount; i++) {
                const x = Math.random() * (map.width - 200) + 100;
                const y = Math.random() * (map.height - 200) + 100;
                
                // Crea nemico in base al tipo di mappa
                const enemy = new Enemy(x, y, map.alienType);
                game.enemies.push(enemy);
            }
        }
    }
    
    // Genera bonus box per la mappa corrente
    generateBonusBoxes() {
        const game = this.game;
        const map = this.maps[this.currentMap];
        
        // Genera bonus box sparse per la mappa
        const boxCount = 8;
        for (let i = 0; i < boxCount; i++) {
            const x = Math.random() * (map.width - 100) + 50;
            const y = Math.random() * (map.height - 100) + 50;
            
            const box = new BonusBox(x, y, game);
            game.bonusBoxes.push(box);
        }
    }
    
    // Genera asteroidi interattivi per la mappa corrente
    generateInteractiveAsteroids() {
        const game = this.game;
        const map = this.maps[this.currentMap];
        
        // Genera asteroidi interattivi
        const asteroidCount = 10;
        for (let i = 0; i < asteroidCount; i++) {
            const x = Math.random() * (map.width - 200) + 100;
            const y = Math.random() * (map.height - 200) + 100;
            
            const asteroid = new InteractiveAsteroid(x, y, game);
            game.interactiveAsteroids.push(asteroid);
        }
    }
    
    // Aggiorna il background in base alla mappa corrente
    updateBackground() {
        const map = this.maps[this.currentMap];
        if (map.background === 'dreadspire') {
            // Usa il background Dreadspire esistente
            this.game.backgroundType = 'dreadspire';
        } else {
            // Usa un background diverso (da implementare)
            this.game.backgroundType = 'default';
        }
    }
    
    // Controlla se la space station deve essere visibile nella mappa corrente
    shouldShowSpaceStation() {
        const map = this.maps[this.currentMap];
        return map.hasSpaceStation;
    }
    
    // Ottiene il tipo di alieni per la mappa corrente
    getCurrentAlienType() {
        const map = this.maps[this.currentMap];
        return map.alienType;
    }
    
    // Mostra messaggio di benvenuto per la mappa
    showMapWelcomeMessage(mapId) {
        const map = this.maps[mapId];
        if (map && this.game.zoneNotifications) {
            // Rimuovi eventuali notifiche di mappa precedenti
            this.game.zoneNotifications.removeZoneNotifications('MapWelcome');
            
            // Crea una notifica di zona nello stesso stile della spacestation
            const notificationId = this.game.zoneNotifications.addZoneNotification(
                'MapWelcome', 
                `Welcome to\n${map.name.toUpperCase()}\n[${map.description.toUpperCase()}]`, 
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
        return this.maps[this.currentMap];
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
