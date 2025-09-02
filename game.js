// Gioco Spaziale - File Principale
import { Ship } from './modules/Ship.js';
import { Camera } from './modules/Camera.js';
import { Input } from './modules/Input.js';
import { World } from './modules/World.js';
import { Renderer } from './modules/Renderer.js';
import { Minimap } from './modules/Minimap.js';
import { Enemy } from './modules/Enemy.js';
import { Notification } from './modules/Notification.js';
import { SectorSystem } from './modules/SectorSystem.js';
import { ExplosionEffect } from './modules/ExplosionEffect.js';
import { ParallaxBackground } from './modules/ParallaxBackground.js';
import { AmbientEffects } from './modules/AmbientEffects.js';
import { RankSystem } from './modules/RankSystem.js';
import { PlayerProfile } from './modules/PlayerProfile.js';
import { AudioManager } from './modules/AudioManager.js';
import { SettingsPanel } from './modules/SettingsPanel.js';
import { BonusBox } from './modules/BonusBox.js';
import { SpaceStation } from './modules/SpaceStation.js';
import { ZoneNotification } from './modules/ZoneNotification.js';
import { SpaceStationPanel } from './modules/SpaceStationPanel.js';
import { InteractiveAsteroid } from './modules/InteractiveAsteroid.js';
import { DeathPopup } from './modules/DeathPopup.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        
        // Inizializza tutti i moduli
        this.ship = new Ship(8000, 5000); // Centro del rettangolo 16000x10000
        this.camera = new Camera(this.width, this.height);
        this.input = new Input(this.canvas);
        this.world = new World(this.width, this.height);
        this.renderer = new Renderer(this.ctx, this.width, this.height);
        this.minimap = new Minimap(this.width, this.height);
        this.sectorSystem = new SectorSystem();
        this.notifications = new Notification();
        this.explosionManager = new ExplosionEffect();
        this.parallaxBackground = new ParallaxBackground(this.width, this.height);
        this.ambientEffects = new AmbientEffects(this.width, this.height);
        this.rankSystem = new RankSystem();
        this.playerProfile = new PlayerProfile();
        this.audioManager = new AudioManager();
        this.settingsPanel = new SettingsPanel(this);
            
            // Sistema di combattimento
        this.enemies = [];
        this.enemySpawnTimer = 0;
        this.enemySpawnRate = 60; // Ogni 1 secondo (60 FPS)
        
        // Sistema bonus box
        this.bonusBoxes = [];
        this.bonusBoxSpawnTimer = 0;
        this.bonusBoxSpawnRate = 10; // Ogni 10 frame per riempire velocemente
        this.maxBonusBoxes = 100; // 100 bonus box per riempire la mappa
        
        // Stazione spaziale
        this.spaceStation = new SpaceStation(8000, 5000); // Al centro del rettangolo 16000x10000
        
        // Asteroidi interattivi distribuiti nel rettangolo 16000x10000
        this.interactiveAsteroids = [
            new InteractiveAsteroid(12000, 2000),   // Alto-destra
            new InteractiveAsteroid(4000, 2000),    // Alto-sinistra
            new InteractiveAsteroid(12000, 8000),   // Basso-destra
            new InteractiveAsteroid(4000, 8000),    // Basso-sinistra
            new InteractiveAsteroid(14000, 3000),   // Estremo alto-destra
            new InteractiveAsteroid(2000, 8000),    // Estremo basso-sinistra
            new InteractiveAsteroid(8000, 8000),    // Basso centro
            new InteractiveAsteroid(2000, 3000),    // Estremo alto-sinistra
            new InteractiveAsteroid(10000, 1000),   // Centro-alto
            new InteractiveAsteroid(6000, 9000)     // Centro-basso
        ];
        
        // Sistema notifiche di zona
        this.zoneNotifications = new ZoneNotification();
        
        // Popup di morte
        this.deathPopup = new DeathPopup();
        
        // Pannello stazione spaziale
        this.spaceStationPanel = new SpaceStationPanel();
        
        // Pannello statistiche (apribile/chiudibile)
        this.statsPanelOpen = false;
        
        // Pannello potenziamenti
        this.upgradePanelOpen = false;
        
        // Configura la nave per notificare quando arriva a destinazione
        this.ship.onArrival = () => {
            // Pulisce il target della minimappa quando la nave arriva
            this.minimap.clearTarget();
            // Pulisce anche le coordinate del click quando la nave arriva

        };
        
        // Inizializza l'audio
        this.audioManager.loadAllSounds();
        
        // Carica l'effetto esplosione
        this.explosionManager.load();
        
        // Test del suono del motore dopo il caricamento

        
        // Avvia la musica di sottofondo dopo un breve delay
        setTimeout(() => {
            this.audioManager.startBackgroundMusic();
        }, 1000);
        
        // Applica le impostazioni salvate
        this.settingsPanel.applyAudioSettings();
        
        // Rendi l'istanza del gioco disponibile globalmente per il ridimensionamento
        window.gameInstance = this;
        
        // Avvia il gioco
        this.gameLoop();
    }
    
    // Gestisce il ridimensionamento del canvas
    handleResize(newWidth, newHeight) {
        this.width = newWidth;
        this.height = newHeight;
        
        // Aggiorna la camera
        this.camera.width = newWidth;
        this.camera.height = newHeight;
        
        // Aggiorna il renderer
        this.renderer.width = newWidth;
        this.renderer.height = newHeight;
        
        // Aggiorna il mondo
        this.world.width = newWidth;
        this.world.height = newHeight;
        
        // Aggiorna la minimappa
        this.minimap.updateSize(newWidth, newHeight);
        
        // Aggiorna il parallax
        this.parallaxBackground.updateSize(newWidth, newHeight);
        
        // Aggiorna effetti ambientali
        this.ambientEffects.updateSize(newWidth, newHeight);
    }
    
    update() {
        // Aggiorna la nave
        this.ship.update();
        this.ship.updateSprite();
        this.ship.updateTrail();
        
        // Controlla collisioni bonus box IMMEDIATAMENTE dopo il movimento della nave
        this.checkBonusBoxCollisions();
        
        // Aggiorna effetti di esplosione
        this.explosionManager.update();
        
        // Aggiorna la camera
        this.camera.update(this.ship);
        
        // Aggiorna sfondo parallax
        this.parallaxBackground.update(this.camera);
        
        // Aggiorna effetti ambientali
        this.ambientEffects.update(this.camera);
        
                // Se il pannello potenziamenti è aperto, blocca solo le interazioni del mondo
        if (this.upgradePanelOpen) {
            // Reset dei flag per evitare interazioni indesiderate
            this.input.resetRightClickReleased();
            this.input.resetCtrlJustPressed();
            // NON uscire dalla funzione update - permette al gioco di continuare
        }
        
        // Gestisci click su popup di morte (priorità massima)
        if (this.input.isMouseJustPressed()) {
            const mousePos = this.input.getMousePosition();
            if (this.deathPopup.handleClick(mousePos.x, mousePos.y, this.ship)) {
                this.input.resetMouseJustPressed();
                return; // Click gestito dal popup
            }
        }
        
        // Gestisci click su pulsante impostazioni (solo al primo click)
        if (this.input.isMouseJustPressed()) {
            const mousePos = this.input.getMousePosition();
            const buttonSize = 40;
            const buttonX = this.width - buttonSize - 20;
            const buttonY = 20;
            
            if (mousePos.x >= buttonX && mousePos.x <= buttonX + buttonSize &&
                mousePos.y >= buttonY && mousePos.y <= buttonY + buttonSize) {
                this.settingsPanel.toggle();
                this.input.resetMouseJustPressed();
                return; // Esci per evitare altri click
            }
            
            // Gestisci click su pulsante Space Station
            const spaceStationButtonY = 70;
            if (mousePos.x >= buttonX && mousePos.x <= buttonX + buttonSize &&
                mousePos.y >= spaceStationButtonY && mousePos.y <= spaceStationButtonY + buttonSize) {
                // Se il pannello si sta aprendo, riproduci il suono
                if (!this.spaceStationPanel.isOpen) {
                    if (this.audioManager) {
                        this.audioManager.playStationPanelOpenSound();
                    }
                }
                this.spaceStationPanel.toggle();
                this.input.resetMouseJustPressed();
                return; // Esci per evitare altri click
            }
        }
        
        // Click sinistro sulla minimappa rimosso - la minimappa funziona solo con click destro
        
        // Gestisci click nel pannello stazione spaziale
        if (this.spaceStationPanel.isOpen && this.input.isMouseJustPressed()) {
            const mousePos = this.input.getMousePosition();
            if (this.spaceStationPanel.handleClick(mousePos.x, mousePos.y, this.ship.upgradeManager, this.width, this.height)) {
                this.input.resetMouseJustPressed();
                return; // Click gestito dal pannello
            }
        }
        
        // Gestisci click nel pannello impostazioni (solo al primo click)
        if (this.settingsPanel.isOpen && this.input.isMouseJustPressed()) {
            const mousePos = this.input.getMousePosition();
            if (this.settingsPanel.handleClick(mousePos.x, mousePos.y)) {
                this.input.resetMouseJustPressed();
                return; // Click gestito dal pannello
            }
        }
        
        // Gestisci drag degli slider nel pannello impostazioni
        if (this.settingsPanel.isOpen && this.input.isMouseDown()) {
            const mousePos = this.input.getMousePosition();
            this.settingsPanel.handleMouseMove(mousePos.x, mousePos.y);
        }
        
        // Ferma il drag quando si rilascia il mouse
        if (this.input.isLeftClickJustReleased()) {
            this.settingsPanel.stopDragging();
            // Ferma il movimento della nave quando l'utente smette di cliccare
            // MA solo se non c'è un target attivo dalla minimappa
            if (!this.minimap.currentTarget) {
                this.ship.stopMovement();
            }
        }
        
        // Gestisci click destro sul pannello statistiche
        if (this.input.isRightClickJustReleased()) {
            const mousePos = this.input.getMousePosition();
            const panelX = 15;
            const panelY = 15;
            
            // Se il pannello è chiuso, controlla click destro sull'icona
            if (!this.statsPanelOpen) {
                const iconSize = 40;
                if (mousePos.x >= panelX && mousePos.x <= panelX + iconSize &&
                    mousePos.y >= panelY && mousePos.y <= panelY + iconSize) {
                    this.statsPanelOpen = true;
                    return;
                }
            } else {
                // Se il pannello è aperto, controlla click destro sul pulsante di chiusura
                const panelWidth = 220;
                const closeButtonSize = 20;
                const closeButtonX = panelX + panelWidth - closeButtonSize - 10;
                const closeButtonY = panelY + 10;
                
                if (mousePos.x >= closeButtonX && mousePos.x <= closeButtonX + closeButtonSize &&
                    mousePos.y >= closeButtonY && mousePos.y <= closeButtonY + closeButtonSize) {
                    this.statsPanelOpen = false;
                    return;
                }
            }
        }
        
        // Reset del flag click appena premuto
        this.input.resetMouseJustPressed();
        
        // Gestisci input per il movimento (solo se non si sta facendo drag)
        if (this.input.isMouseDown() && !this.upgradePanelOpen && !this.settingsPanel.isOpen && !this.settingsPanel.draggingSlider && !this.spaceStationPanel.isOpen) {
            const mousePos = this.input.getMousePosition();
            
            // Pulisci il target della minimappa quando si inizia il movimento normale
            this.minimap.currentTarget = null;
            
            // Click sinistro - movimento nave (solo se la nave non è morta)
            if (!this.ship.isDead) {
                const worldPos = this.camera.screenToWorld(mousePos.x, mousePos.y);
                this.ship.setTarget(worldPos.x, worldPos.y);
            }
            
            // Click nel mondo gestito - Pulisce il target della minimappa
            this.minimap.clearTarget();
        }
        
        // Gestisci click destro per selezione target E minimappa (solo se il pannello non è aperto)
        if (this.input.isRightClickJustReleased() && !this.upgradePanelOpen && !this.spaceStationPanel.isOpen) {
            const mousePos = this.input.getMousePosition();
            const worldPos = this.camera.screenToWorld(mousePos.x, mousePos.y);
            
            // Prima controlla se il click destro è su un asteroide interattivo
            for (let asteroid of this.interactiveAsteroids) {
                if (asteroid.active && asteroid.checkCollision(worldPos.x, worldPos.y)) {
                    if (asteroid.canInteract(this.ship)) {
                        asteroid.startMining(this.ship);
                    } else {
                        asteroid.showNotification('⛏️ Avvicinati all\'asteroide per iniziare il mining!');
                    }
                    return;
                }
            }
            
            // Poi controlla se il click destro è su un nemico
            const clickedEnemy = this.getEnemyAtPosition(mousePos.x, mousePos.y);
            if (clickedEnemy) {
                // Click destro su nemico - seleziona target
                this.ship.selectTarget(clickedEnemy);
                
                // Mostra notifica di target selezionato
                this.notifications.targetSelected(clickedEnemy.type);
            } else {
                // Click destro nel mondo - prova minimappa
                const minimapHandled = this.minimap.handleClick(mousePos.x, mousePos.y, this.ship, true);

            }
            
            // Resetta il flag del flag del click destro rilasciato
            this.input.resetRightClickReleased();
        }
        
        // Gestisci CTRL per toggle combattimento (solo se il pannello non è aperto)
        if (this.input.isCtrlJustPressed() && this.ship.selectedTarget && !this.upgradePanelOpen) {
            const combatResult = this.ship.toggleCombat();
            
            // Mostra notifica del combattimento
            if (combatResult) {
                if (combatResult.started) {
                    this.notifications.combatStarted(combatResult.enemyType);
                } else {
                    this.notifications.combatStopped();
                }
            }
            
            // Reset del flag per evitare spam
            this.input.resetCtrlJustPressed();
        }
        
        // Gestisci D per test morte player (solo se il pannello non è aperto)
        if (this.input.isDJustPressed() && !this.upgradePanelOpen) {
            this.ship.takeDamage(this.ship.hp); // Danno sufficiente per uccidere il player
            this.input.resetDJustPressed();
        }
        
        // Riparazione automatica - gestita in Ship.js
        
        // Pannello potenziamenti rimosso - ora disponibile nella stazione spaziale
        // if (this.input.isKeyJustPressed('KeyP')) {
        //     this.upgradePanelOpen = !this.upgradePanelOpen;
        //     console.log('Pannello potenziamenti:', this.upgradePanelOpen ? 'APERTO' : 'CHIUSO');
        // }
        
        // Comando per aggiungere crediti (tasto C)
        if (this.input.isKeyJustPressed('KeyC')) {
            this.ship.upgradeManager.addCredits(10000);

        }
        
        // Comando per aggiungere uridium (tasto U)
        if (this.input.isKeyJustPressed('KeyU')) {
            this.ship.upgradeManager.addUridium(100);

        }
        
        // Comando per aggiungere onore (tasto O)
        if (this.input.isKeyJustPressed('KeyO')) {
            this.ship.addHonor(500);

        }
        
        // Comando per cambiare nickname (tasto N)
        if (this.input.isKeyJustPressed('KeyN')) {
            const newNickname = prompt('Inserisci il tuo nickname:', this.playerProfile.getNickname());
            if (newNickname && newNickname.trim().length > 0) {
                this.playerProfile.setNickname(newNickname.trim());

            }
        }
        
        // Gestisci click sui pulsanti di upgrade
        if (this.input.isLeftClickJustReleased() && this.upgradePanelOpen) {
            const mousePos = this.input.getMousePosition();
            this.handleUpgradeClick(mousePos.x, mousePos.y);
            // Reset del flag per evitare spam
            this.input.resetLeftClickReleased();
        }
        
        // Sistema di movimento continuo minimappa rimosso - la nave si muove una volta verso il target
        
        // Aggiorna il mondo
        this.world.update();
        
        // Debug: traccia target prima di updateCombat
        // Sistema di combattimento
        this.updateCombat();
        
        // Reset dei flag dei tasti
        this.input.resetKeysJustPressed();
        
        // Gestisci zoom con rotella del mouse
        if (this.input.hasWheelMovement()) {
            if (this.input.mouse.wheelDelta > 0) {
                this.camera.zoomIn();
            } else if (this.input.mouse.wheelDelta < 0) {
                this.camera.zoomOut();
            }
            this.input.resetWheelDelta();
        }
    }
    
    updateCombat() {
        // Aggiorna combattimento della nave (solo se non è morta)
        if (this.ship.isDead) {
            return;
        }
        
        const combatResult = this.ship.updateCombat(this.explosionManager);

        
        // Controlla se un nemico è stato distrutto
        if (combatResult && combatResult.enemyDestroyed) {
            this.notifications.enemyDestroyed(combatResult.enemyType);
            
            // Aggiungi valute per il nemico ucciso
            const creditsGained = this.ship.getCreditsForEnemyType(combatResult.enemyType);
            const uridiumGained = this.ship.getUridiumForEnemyType(combatResult.enemyType);
            const honorGained = this.ship.getHonorForEnemyType(combatResult.enemyType);
            

            
            // Aggiungi le valute
            this.ship.upgradeManager.addCredits(creditsGained);
            this.ship.upgradeManager.addUridium(uridiumGained);
            this.ship.addHonor(honorGained);
            

            
            // Gestisci esperienza e salita di livello
            if (combatResult.expGained) {
                this.notifications.expGained(combatResult.expGained);
            }
            
            if (combatResult.levelUp) {
                this.notifications.levelUp(combatResult.levelUp.level, combatResult.levelUp.bonus);
            }
        }
        
        // Aggiorna nemici
        this.updateEnemies();
        
        // Aggiorna bonus box
        this.updateBonusBoxes();
        
        // Aggiorna stazione spaziale
        this.spaceStation.update();
        this.spaceStation.checkAndShowMessage(this.ship, this);
        
        // Aggiorna asteroidi interattivi
        for (let asteroid of this.interactiveAsteroids) {
            asteroid.update();
        }
        
        // Il mining non si interrompe più per distanza - solo per danno o attacchi
        
        // Controlla interazione con la stazione spaziale (tasto E)
        this.checkSpaceStationInteraction();
        
        // Gestisci tasto ESC per chiudere il pannello stazione spaziale
        if (this.input.isKeyJustPressed('Escape') && this.spaceStationPanel.isOpen) {
            this.spaceStationPanel.close();
        }
        
        // Tasto D per ricevere danno (test)
        if (this.input.isKeyJustPressed('KeyD')) {
            this.ship.takeDamage(10);
            this.notifications.add('💥 Danno ricevuto per test!', 200, 'warning');
        }
        
        // Aggiorna notifiche di zona
        this.zoneNotifications.update();
        
        // Spawn nemici
        this.spawnEnemies();
        
        // Spawn bonus box
        this.spawnBonusBoxes();
        
        // Aggiorna notifiche
        this.notifications.update();
    }
    
    updateEnemies() {
        this.enemies = this.enemies.filter(enemy => {
            enemy.update(this.ship);
            return enemy.active;
        });
    }
    
    // Controllo collisioni bonus box separato per massima reattività
    checkBonusBoxCollisions() {
        this.bonusBoxes = this.bonusBoxes.filter(box => {
            if (!box.active) return false;
            
            // Controlla collisione con la nave IMMEDIATAMENTE
            if (box.checkCollision(this.ship)) {
                // Riproduci suono di raccolta PRIMA della raccolta per maggiore reattività
                if (this.audioManager) {
                    this.audioManager.playCollectingSound();
                }
                
                box.collect(this.ship);
                return false; // Rimuovi la bonus box dopo la raccolta
            }
            
            return true;
        });
    }
    
    updateBonusBoxes() {
        this.bonusBoxes = this.bonusBoxes.filter(box => {
            if (!box.active) return false;
            
            // Aggiorna l'animazione
            box.update();
            
            return true;
        });
        
        // Respawna bonus box se ne mancano per mantenere la mappa piena
        this.respawnBonusBoxes();
    }
    
    // Respawna bonus box per mantenere la mappa piena
    respawnBonusBoxes() {
        const activeBonusBoxes = this.bonusBoxes.filter(box => box.active);
        const missingBoxes = this.maxBonusBoxes - activeBonusBoxes.length;
        
        if (missingBoxes > 0) {
            // Spawna le bonus box mancanti
            for (let i = 0; i < missingBoxes; i++) {
                let x, y;
                let attempts = 0;
                const maxAttempts = 10;
                
                do {
                    // Spawn in tutta la mappa
                    x = Math.random() * 16000; // 0-16000 (larghezza)
                    y = Math.random() * 10000; // 0-10000 (altezza)
                    attempts++;
                } while (attempts < maxAttempts && this.isTooCloseToShip(x, y, 200));
                
                // Crea bonus box casuale
                const bonusBox = BonusBox.createRandom(x, y);
                this.bonusBoxes.push(bonusBox);
            }
        }
    }
    
    // Sistema di collisioni rimosso - ora gestito da Ship.js per i crediti
    
    spawnEnemies() {
        this.enemySpawnTimer++;
        
        // Controlla se abbiamo già raggiunto il limite di NPC
        const activeEnemies = this.enemies.filter(e => e.active);
        if (activeEnemies.length >= 50) {
            return; // Non spawnare più nemici se abbiamo già 50
        }
        
        if (this.enemySpawnTimer >= this.enemySpawnRate) {
            this.enemySpawnTimer = 0;
            
            // Spawn nemico casuale in tutta la mappa rettangolare
            // Evita solo un'area centrale intorno al player per non spawnare troppo vicino
            const playerX = this.ship.x;
            const playerY = this.ship.y;
            const avoidRadius = 800; // Raggio di evitamento dal player
            
            let x, y;
            let attempts = 0;
            const maxAttempts = 10;
            
            do {
                // Spawn in tutta la mappa rettangolare
                x = Math.random() * 16000; // 0-16000 (larghezza completa)
                y = Math.random() * 10000; // 0-10000 (altezza completa)
                attempts++;
            } while (attempts < maxAttempts && 
                     Math.sqrt((x - playerX) ** 2 + (y - playerY) ** 2) < avoidRadius);
            
            // Solo nemici Barracuda
            const newEnemy = new Enemy(x, y, 'barracuda');
            this.enemies.push(newEnemy);
        }
    }
    
    // Sistema di spawning bonus box
    spawnBonusBoxes() {
        this.bonusBoxSpawnTimer++;
        
        // Controlla se abbiamo già raggiunto il limite di bonus box
        const activeBonusBoxes = this.bonusBoxes.filter(box => box.active);
        if (activeBonusBoxes.length >= this.maxBonusBoxes) {
            return; // Non spawnare più bonus box se abbiamo già 100
        }
        
        if (this.bonusBoxSpawnTimer >= this.bonusBoxSpawnRate) {
            this.bonusBoxSpawnTimer = 0;
            
            // Spawn bonus box in tutta la mappa
            let x, y;
            let attempts = 0;
            const maxAttempts = 5; // Riduciamo i tentativi per velocità
            
            do {
                // Spawn in tutta la mappa (0-16000 x 0-10000 per coprire tutto)
                x = Math.random() * 16000; // 0-16000 (larghezza)
                y = Math.random() * 10000; // 0-10000 (altezza)
                attempts++;
            } while (attempts < maxAttempts && this.isTooCloseToShip(x, y, 200)); // Riduciamo la distanza minima
            
            // Crea bonus box casuale
            const bonusBox = BonusBox.createRandom(x, y);
            this.bonusBoxes.push(bonusBox);
        }
    }
    
    // Controlla se una posizione è troppo vicina alla nave
    isTooCloseToShip(x, y, minDistance) {
        const distance = Math.sqrt(
            Math.pow(x - this.ship.x, 2) + Math.pow(y - this.ship.y, 2)
        );
        return distance < minDistance;
    }
    
    // Controlla se un click è su un nemico
    getEnemyAtPosition(screenX, screenY) {
        const worldPos = this.camera.screenToWorld(screenX, screenY);
        
        for (const enemy of this.enemies) {
            if (enemy.active) {
                const distance = Math.sqrt(
                    Math.pow(worldPos.x - enemy.x, 2) + 
                    Math.pow(worldPos.y - enemy.y, 2)
                );
                
                if (distance <= enemy.hitboxRadius) {
                    return enemy;
                }
            }
        }
        
        return null;
    }
    
    render() {
        // Pulisci il canvas
        this.renderer.clear();
        
        // Salva il contesto per applicare lo zoom
        this.ctx.save();
        
        // Applica lo zoom centrato sullo schermo (con protezione)
        const safeZoom = Math.max(0.1, Math.min(this.camera.zoom, 5.0));
        this.ctx.translate(this.width / 2, this.height / 2);
        this.ctx.scale(safeZoom, safeZoom);
        this.ctx.translate(-this.width / 2, -this.height / 2);
        
        // Disegna sfondo parallax
        this.parallaxBackground.draw(this.ctx, this.camera);
        
        // Disegna effetti ambientali
        this.ambientEffects.draw(this.ctx, this.camera);
        
        // Disegna nemici
        this.enemies.forEach(enemy => {
            if (enemy.active) {
                enemy.draw(this.ctx, this.camera);
            }
        });
        
        // Disegna bonus box
        this.bonusBoxes.forEach(box => {
            if (box.active) {
                box.draw(this.ctx, this.camera);
            }
        });
        
        // Disegna stazione spaziale
        this.spaceStation.draw(this.ctx, this.camera);
        
        // Disegna asteroidi interattivi
        for (let asteroid of this.interactiveAsteroids) {
            asteroid.draw(this.ctx, this.camera);
        }
        
        // Disegna la nave
        this.renderer.drawShip(this.ship, this.camera);
        
        // Disegna il nickname sotto la nave
        this.drawPlayerNickname();
        
        // Disegna le scie della nave
        this.renderer.drawTrail(this.ship, this.camera);
        
        // Disegna i proiettili
        this.renderer.drawProjectiles(this.ship, this.camera);
        
        // Disegna i missili
        this.renderer.drawMissiles(this.ship, this.camera);
        
        // Disegna effetti di esplosione
        this.explosionManager.draw(this.ctx, this.camera);
        
        // Disegna barra HP della nave
        this.ship.drawHealthBar(this.ctx, this.camera);
        
        // Disegna il target di movimento
        this.renderer.drawTarget(this.ship, this.camera);
        
        // Disegna target selezionato per combattimento
        if (this.ship.selectedTarget) {
            this.ship.drawSelectedTarget(this.ctx, this.camera);
        }
        
        // Ripristina il contesto (rimuove lo zoom)
        this.ctx.restore();
        
        // Disegna la minimappa (separata dal renderer, non influenzata dallo zoom)
        this.minimap.draw(this.ctx, this.ship, this.camera, this.enemies, this.sectorSystem, this.spaceStation, this.interactiveAsteroids);
        
        // Disegna le notifiche (sempre sopra tutto, non influenzate dallo zoom)
        this.notifications.draw(this.ctx);
        
        // Disegna le notifiche di zona
        this.drawZoneNotifications();
        
        // Aggiorna e disegna il pannello della stazione spaziale
        if (this.spaceStationPanel.isOpen) {
            this.spaceStationPanel.update();
        }
        this.spaceStationPanel.draw(this.ctx, this.canvas.width, this.canvas.height, this.ship.upgradeManager);
        
        // Disegna informazioni esperienza e livello (non influenzate dallo zoom)
        this.drawExperienceInfo();
        
        // Disegna skillbar MMORPG (non influenzata dallo zoom)
        this.drawSkillbar();
        
        // Disegna pulsante impostazioni
        this.drawSettingsButton();
        
        // Disegna pulsante Space Station
        this.drawSpaceStationButton();
        
        // Disegna pannello impostazioni se aperto
        this.settingsPanel.draw(this.ctx);
        
        // Disegna pannello potenziamenti se aperto
        if (this.upgradePanelOpen) {

            this.drawUpgradePanel();
        }
        
        // Disegna popup di morte (sempre sopra tutto)
        this.deathPopup.draw(this.ctx);
    }
    
    // Controlla l'interazione con la stazione spaziale
    checkSpaceStationInteraction() {
        // Controlla se il tasto E è stato premuto
        if (this.input.keysJustPressed.has('KeyE')) {
            // Se il pannello è già aperto, chiudilo
            if (this.spaceStationPanel.isOpen) {
                this.spaceStationPanel.close();
            } else {
                // Controlla se la nave è abbastanza vicina alla stazione
                if (this.spaceStation.canInteract(this.ship)) {
                    this.openSpaceStationPanel();
                }
            }
        }
    }
    
    // Apre il pannello della stazione spaziale
    openSpaceStationPanel() {

        this.spaceStationPanel.open();
        this.notifications.add('🚀 Stazione Spaziale - Pannello aperto!', 120, 'info');
        
        // Riproduci suono di apertura pannello
        if (this.audioManager) {
            this.audioManager.playStationPanelOpenSound();
        }
    }
    
    // Disegna le notifiche di zona
    drawZoneNotifications() {
        const activeNotifications = this.zoneNotifications.getActiveNotifications();
        if (activeNotifications.length === 0) return;
        
        // Posizione delle notifiche di zona (centro alto dello schermo)
        const startX = this.canvas.width / 2;
        const startY = 100;
        const spacing = 60;
        
        activeNotifications.forEach((notification, index) => {
            const y = startY + (index * spacing);
            
            // Applica l'alpha per il fade
            this.ctx.save();
            this.ctx.globalAlpha = notification.alpha;
            
            // Testo principale (tutto maiuscolo, senza emoji)
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // Effetto glow sottile
            this.ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
            this.ctx.shadowBlur = 10;
            
            // Rimuovi emoji e rendi tutto maiuscolo
            const cleanMessage = notification.message.replace(/[🚀🎯💎💰]/g, '').trim().toUpperCase();
            
            // Dividi il messaggio in righe
            const lines = cleanMessage.split('\n');
            
            // Disegna ogni riga
            lines.forEach((line, index) => {
                if (index === 0) {
                    // Prima riga (SPACESTATION) - più grande
                    this.ctx.fillText(line, startX, y + (index * 25));
                } else if (index === 1) {
                    // Seconda riga (SAFE ZONE) - media
                    this.ctx.shadowBlur = 0; // Reset shadow
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    this.ctx.font = 'bold 14px Arial';
                    this.ctx.fillText(line, startX, y + (index * 25));
                } else {
                    // Terza riga ([PREMI E]) - più piccola
                    this.ctx.shadowBlur = 0; // Reset shadow
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                    this.ctx.font = 'bold 12px Arial';
                    this.ctx.fillText(line, startX, y + (index * 25));
                }
            });
            
            this.ctx.restore();
        });
    }
    
    // Disegna informazioni esperienza e livello (angolo sinistro alto)
    drawExperienceInfo() {
        const expInfo = this.ship.experience.getLevelInfo();
        
        // Dimensioni e posizione del pannello
        const panelX = 15;
        const panelY = 15;
        
        // Se il pannello è chiuso, mostra solo l'icona
        if (!this.statsPanelOpen) {
            this.drawStatsIcon(panelX, panelY);
            return;
        }
        const panelWidth = 220;
        const panelHeight = 140;
        const cornerRadius = 8;
        
        // Sfondo principale con bordi arrotondati
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        this.roundRect(panelX, panelY, panelWidth, panelHeight, cornerRadius);
        this.ctx.fill();
        
        // Bordo sottile bianco
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        // Separatore orizzontale sottile
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(panelX + 15, panelY + 47);
        this.ctx.lineTo(panelX + panelWidth - 15, panelY + 47);
                this.ctx.stroke();
        
        // Testo livello (dimensioni bilanciate)
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Livello ${expInfo.level}`, panelX + 20, panelY + 30);
        
        // Testo XP (più piccolo e sottile)
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.font = '14px Arial';
        this.ctx.fillText(`XP: ${expInfo.expFormatted}`, panelX + 20, panelY + 58);
        
        // Testo Crediti (verde) - valuta base
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '14px Arial';
        this.ctx.fillText(`Crediti: ${this.ship.upgradeManager.getCredits()}`, panelX + 20, panelY + 78);
        
        // Testo Uridium (blu) - valuta premium
        this.ctx.fillStyle = '#0088ff';
        this.ctx.font = '14px Arial';
        this.ctx.fillText(`Uridium: ${this.ship.upgradeManager.getUridium()}`, panelX + 20, panelY + 98);
        
        // Onore (oro)
        this.ctx.fillStyle = '#ffaa00';
        this.ctx.font = '14px Arial';
        this.ctx.fillText(`Onore: ${this.ship.getHonor()}`, panelX + 20, panelY + 118);
        
        // Pulsante di chiusura (X)
        const closeButtonSize = 20;
        const closeButtonX = panelX + panelWidth - closeButtonSize - 10;
        const closeButtonY = panelY + 10;
        
        // Sfondo pulsante chiusura
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.beginPath();
        this.ctx.roundRect(closeButtonX, closeButtonY, closeButtonSize, closeButtonSize, 3);
        this.ctx.fill();
        
        // Bordo pulsante chiusura
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        // X del pulsante chiusura
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(closeButtonX + 5, closeButtonY + 5);
        this.ctx.lineTo(closeButtonX + closeButtonSize - 5, closeButtonY + closeButtonSize - 5);
        this.ctx.moveTo(closeButtonX + closeButtonSize - 5, closeButtonY + 5);
        this.ctx.lineTo(closeButtonX + 5, closeButtonY + closeButtonSize - 5);
        this.ctx.stroke();
        
        // Barra XP rimossa per uniformare il layout
    }
    
    // Disegna l'icona delle statistiche quando il pannello è chiuso
    drawStatsIcon(x, y) {
        const iconSize = 40;
        const cornerRadius = 6;
        
        // Sfondo dell'icona
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, iconSize, iconSize, cornerRadius);
        this.ctx.fill();
        
        // Bordo
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        // Icona (livello)
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('L', x + iconSize/2, y + iconSize/2 - 3);
        
        // Numero del livello
        this.ctx.fillStyle = '#ffaa00';
        this.ctx.font = 'bold 10px Arial';
        this.ctx.fillText(this.ship.experience.getLevelInfo().level.toString(), x + iconSize/2, y + iconSize/2 + 8);
    }
    
    // Disegna il nickname del giocatore sotto la nave
    drawPlayerNickname() {
        const currentRank = this.rankSystem.getCurrentRank(this.ship.getHonor());
        const screenPos = this.camera.worldToScreen(this.ship.x, this.ship.y);
        
        // Offset per posizionare il nickname sotto la nave
        const offsetY = 40;
        
        // Testo del nickname senza sfondo
        const nickname = `${currentRank.symbol} ${this.playerProfile.getNickname()}`;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(nickname, screenPos.x, screenPos.y + offsetY);
        
        // Ripristina l'allineamento del testo
        this.ctx.textAlign = 'left';
    }
    
    // Disegna skillbar MMORPG
    drawSkillbar() {
        const slotSize = 50;
        const slotSpacing = 5;
        const autoattackIconSize = 30; // Dimensioni icone autoattack più piccole
        const autoattackSpacing = 5;
        
        // Calcola posizione per 4 slot (3-6) invece di 6
        const totalWidth = (slotSize * 4) + (slotSpacing * 3); // 4 slot + 3 spazi
        const autoattackWidth = (autoattackIconSize * 2) + autoattackSpacing; // 2 icone autoattack
        const totalSkillbarWidth = totalWidth + autoattackWidth + 20; // +20 per spazio tra autoattack e skillbar
        
        const panelX = (this.width - totalSkillbarWidth) / 2; // Centrato
        const panelY = this.height - slotSize - 30; // In basso con margine
        
        // Disegna icone autoattack a sinistra
        this.drawAutoattackIcons(panelX, panelY, autoattackIconSize, autoattackSpacing);
        
        // Posizione della skillbar principale (slots 3-6)
        const skillbarX = panelX + autoattackWidth + 20;
        
        // Disegna 4 slot (3-6) - gli slot 1 e 2 sono ora icone autoattack separate
        for (let i = 0; i < 4; i++) {
            const slotX = skillbarX + (i * (slotSize + slotSpacing));
            const slotY = panelY;
            
            // Sfondo dello slot
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.roundRect(slotX, slotY, slotSize, slotSize, 6);
                this.ctx.fill();
    
            // Bordo dello slot
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
            this.roundRect(slotX, slotY, slotSize, slotSize, 6);
                this.ctx.stroke();
            
            // Gli slot 1 e 2 sono ora icone autoattack separate a sinistra
            // Questi slot (1-4) sono liberi per altre abilità
            
            // Numero del tasto (1-4)
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            this.ctx.font = 'bold 10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText((i + 1).toString(), slotX + slotSize/2, slotY + slotSize - 5);
        }
    }
    
    // Disegna le icone autoattack a sinistra della skillbar
    drawAutoattackIcons(startX, startY, iconSize, spacing) {
        const iconY = startY + (50 - iconSize) / 2; // Centra verticalmente rispetto agli slot
        
        // Icona autoattack (proiettili)
        const autoattackX = startX;
        this.drawAutoattackIcon(autoattackX, iconY, iconSize, 'autoattack');
        
        // Icona missili
        const missileX = startX + iconSize + spacing;
        this.drawAutoattackIcon(missileX, iconY, iconSize, 'missile');
    }
    
    // Disegna una singola icona autoattack
    drawAutoattackIcon(x, y, size, type) {
        // Sfondo dell'icona
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.roundRect(x, y, size, size, 4);
        this.ctx.fill();
        
        // Bordo dell'icona
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        this.roundRect(x, y, size, size, 4);
        this.ctx.stroke();
        
        if (type === 'autoattack') {
                // Calcola il progresso del cooldown solo se in combattimento
                const fireRate = this.ship.fireRate;
                const fireTimer = this.ship.fireTimer;
                const cooldownProgress = this.ship.isInCombat ? fireTimer / fireRate : 0;
                
                // Overlay di cooldown (grigio scuro) solo se in combattimento
                if (cooldownProgress > 0 && this.ship.isInCombat) {
                    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.roundRect(x, y, size, size, 4);
        this.ctx.fill();
        
                    // Barra di cooldown verticale
                const cooldownHeight = size * cooldownProgress;
                    this.ctx.fillStyle = 'rgba(255, 100, 100, 0.8)';
                this.roundRect(x, y + size - cooldownHeight, size, cooldownHeight, 4);
        this.ctx.fill();
    }
    
                // Icona dell'autoattack (cerchio con freccia)
                this.ctx.fillStyle = (cooldownProgress > 0 && this.ship.isInCombat) ? 'rgba(150, 150, 150, 0.8)' : '#4a90e2';
        this.ctx.beginPath();
            this.ctx.arc(x + size/2, y + size/2, size/3, 0, Math.PI * 2);
        this.ctx.fill();
        
                // Freccia al centro
                this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
            this.ctx.moveTo(x + size/2 - 3, y + size/2);
            this.ctx.lineTo(x + size/2 + 3, y + size/2);
            this.ctx.lineTo(x + size/2, y + size/2 - 5);
                    this.ctx.closePath();
        this.ctx.fill();
                
                // Testo del cooldown solo se in combattimento
                if (cooldownProgress > 0 && this.ship.isInCombat) {
                    this.ctx.fillStyle = '#ffffff';
                this.ctx.font = 'bold 8px Arial';
                    this.ctx.textAlign = 'center';
                    const cooldownText = Math.ceil((fireRate - fireTimer) / 60 * 10) / 10;
                this.ctx.fillText(cooldownText.toString(), x + size/2, y + size/2 + 2);
            }
        } else if (type === 'missile') {
            // Calcola il progresso del cooldown dei missili
            const missileFireRate = this.ship.missileFireRate;
            const missileTimer = this.ship.missileTimer;
            const missileCooldownProgress = this.ship.isInCombat ? missileTimer / missileFireRate : 0;
            
            // Overlay di cooldown (grigio scuro) solo se in combattimento
            if (missileCooldownProgress > 0 && this.ship.isInCombat) {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.roundRect(x, y, size, size, 4);
                this.ctx.fill();
                
                // Barra di cooldown verticale
                const cooldownHeight = size * missileCooldownProgress;
                this.ctx.fillStyle = 'rgba(255, 165, 0, 0.8)'; // Arancione per i missili
                this.roundRect(x, y + size - cooldownHeight, size, cooldownHeight, 4);
                this.ctx.fill();
            }
            
            // Icona dei missili (cerchio con razzo)
            this.ctx.fillStyle = (missileCooldownProgress > 0 && this.ship.isInCombat) ? 'rgba(150, 150, 150, 0.8)' : '#ff6600';
            this.ctx.beginPath();
            this.ctx.arc(x + size/2, y + size/2, size/3, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Razzo al centro (forma di missile)
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            // Corpo del razzo
            this.ctx.moveTo(x + size/2 - 2, y + size/2 + 4);
            this.ctx.lineTo(x + size/2 + 2, y + size/2 + 4);
            this.ctx.lineTo(x + size/2 + 1, y + size/2 - 4);
            this.ctx.lineTo(x + size/2 - 1, y + size/2 - 4);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Testo del cooldown solo se in combattimento
            if (missileCooldownProgress > 0 && this.ship.isInCombat) {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = 'bold 8px Arial';
            this.ctx.textAlign = 'center';
                const cooldownText = Math.ceil((missileFireRate - missileTimer) / 60 * 10) / 10;
                this.ctx.fillText(cooldownText.toString(), x + size/2, y + size/2 + 2);
            }
        }
    }
    
    // Metodo helper per disegnare rettangoli con bordi arrotondati
    roundRect(x, y, width, height, radius) {
                this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
                this.ctx.closePath();
    }
    
    // Disegna pannello potenziamenti completo
    drawUpgradePanel() {
        try {
            // Dimensioni e posizione del pannello (centrale e più grande)
            const panelWidth = 600;
            const panelHeight = 450;
            const panelX = (this.canvas.width - panelWidth) / 2;
            const panelY = (this.canvas.height - panelHeight) / 2;
            const cornerRadius = 15;
            
            // Sfondo scuro con bordi arrotondati
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
            this.roundRect(panelX, panelY, panelWidth, panelHeight, cornerRadius);
            this.ctx.fill();
            
            // Bordo verde sottile
            this.ctx.strokeStyle = '#00ff00';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Titolo
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('POTENZIAMENTI', panelX + panelWidth/2, panelY + 40);
            
            // Crediti
            try {
                const credits = this.ship.upgradeManager.getCredits();
                this.ctx.fillStyle = '#00ff00';
                this.ctx.font = 'bold 18px Arial';
                this.ctx.fillText(`Crediti: ${credits}`, panelX + panelWidth/2, panelY + 70);
            } catch (error) {
                this.ctx.fillStyle = '#ff0000';
                this.ctx.font = 'bold 18px Arial';
                this.ctx.fillText('Errore Crediti', panelX + panelWidth/2, panelY + 70);
            }
            
            // Separatore
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(panelX + 30, panelY + 90);
            this.ctx.lineTo(panelX + panelWidth - 30, panelY + 90);
            this.ctx.stroke();
            
            // Statistiche attuali del giocatore
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText('STATISTICHE ATTUALI:', panelX + 30, panelY + 120);
            
            try {
                const currentStats = [
                    { label: 'Danno Proiettili:', value: this.ship.projectileDamage || 'N/A', x: panelX + 30, y: panelY + 150 },
                    { label: 'HP Massimi:', value: this.ship.maxHP || 'N/A', x: panelX + 30, y: panelY + 175 },
                    { label: 'Velocità Movimento:', value: this.ship.speed || 'N/A', x: panelX + 30, y: panelY + 200 }
                ];
                

                
                currentStats.forEach(stat => {
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.font = '14px Arial';
                    this.ctx.fillText(stat.label, stat.x, stat.y);
                    this.ctx.fillStyle = '#00ff00';
                    this.ctx.fillText(stat.value.toString(), stat.x + 150, stat.y);
                });
            } catch (error) {
                console.error('Errore nel disegnare le statistiche:', error);
                this.ctx.fillStyle = '#ff0000';
                this.ctx.font = '14px Arial';
                this.ctx.fillText('Errore Statistiche', panelX + 30, panelY + 150);
            }
            
            // Separatore per potenziamenti
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.lineWidth = 1;
        this.ctx.beginPath();
            this.ctx.moveTo(panelX + 30, panelY + 250);
            this.ctx.lineTo(panelX + panelWidth - 30, panelY + 250);
        this.ctx.stroke();
        
            // Titolo sezione potenziamenti
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText('POTENZIAMENTI DISPONIBILI:', panelX + 30, panelY + 230);
            
                    // Statistiche potenziabili
        try {
            const uiInfo = this.ship.upgradeManager.getUIInfo();
            const stats = [
                { key: 'damage', label: 'Danno', y: 260 },
                { key: 'speed', label: 'Velocità Nave', y: 310 },
                { key: 'hp', label: 'HP', y: 360 }
            ];
                
                stats.forEach(stat => {
                    const statInfo = uiInfo[stat.key];
                    const upgradeInfo = statInfo.upgradeInfo;
                    
                    // Nome e valore attuale
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.font = 'bold 16px Arial';
                    this.ctx.textAlign = 'left';
                    this.ctx.fillText(`${stat.label}: ${statInfo.value}`, panelX + 40, panelY + stat.y);
                    
                    // Livello attuale
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                    this.ctx.font = '14px Arial';
                    this.ctx.fillText(`Livello ${statInfo.level}`, panelX + 40, panelY + stat.y + 20);
                    
                    // Pulsante upgrade se disponibile
                    if (upgradeInfo) {
                        const buttonWidth = 100;
                        const buttonHeight = 30;
                        const buttonX = panelX + panelWidth - buttonWidth - 40;
                        const buttonY = panelY + stat.y - 15;
                        
                        // Sfondo pulsante
                        this.ctx.fillStyle = upgradeInfo.canAfford ? '#00ff00' : '#666666';
                        this.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, 5);
            this.ctx.fill();
                        
                        // Bordo pulsante
                        this.ctx.strokeStyle = upgradeInfo.canAfford ? '#ffffff' : '#999999';
                        this.ctx.lineWidth = 1;
                        this.ctx.stroke();
                        
                        // Testo pulsante
                        this.ctx.fillStyle = upgradeInfo.canAfford ? '#000000' : '#cccccc';
                        this.ctx.font = 'bold 14px Arial';
                        this.ctx.textAlign = 'center';
                        this.ctx.fillText(`UPGRADE`, buttonX + buttonWidth/2, buttonY + buttonHeight/2 + 5);
                        
                        // Costo
                        this.ctx.fillStyle = upgradeInfo.canAfford ? '#00ff00' : '#ff6666';
                        this.ctx.font = '12px Arial';
                        this.ctx.fillText(`${upgradeInfo.cost} crediti`, buttonX + buttonWidth/2, buttonY + buttonHeight/2 + 20);
            } else {
                        // Livello massimo
                        this.ctx.fillStyle = '#ffff00';
                        this.ctx.font = 'bold 14px Arial';
                        this.ctx.textAlign = 'center';
                        this.ctx.fillText('LIVELLO MASSIMO', panelX + panelWidth - 100, panelY + stat.y + 5);
                        // Ripristina l'allineamento per gli altri testi
                        this.ctx.textAlign = 'left';
                    }
                });
            } catch (error) {
                this.ctx.fillStyle = '#ff0000';
                this.ctx.font = '14px Arial';
                this.ctx.fillText('Errore Potenziamenti', panelX + 30, panelY + 280);
            }
            
            // Istruzioni
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            this.ctx.font = '14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Premi P per chiudere', panelX + panelWidth/2, panelY + panelHeight - 20);
            
            // Comandi per i test
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            this.ctx.font = '12px Arial';
            this.ctx.fillText('Test: C=Crediti, U=Uridium, O=Onore', panelX + panelWidth/2, panelY + panelHeight - 5);
            
        } catch (error) {
            console.error('Errore nel rendering del pannello potenziamenti:', error);
            
            // Fallback: pannello di errore semplice
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.9)';
            this.ctx.fillRect(100, 100, 400, 200);
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('ERRORE PANNELLO', 350, 150);
            this.ctx.fillText('Premi P per chiudere', 350, 200);
        }
    }
    
    // Gestisce i click sui pulsanti di upgrade
    handleUpgradeClick(mouseX, mouseY) {
        if (!this.upgradePanelOpen) return false;
        
        const panelWidth = 600;
        const panelHeight = 450;
        const panelX = (this.canvas.width - panelWidth) / 2;
        const panelY = (this.canvas.height - panelHeight) / 2;
        
        // Controlla se il click è dentro il pannello
        if (mouseX < panelX || mouseX > panelX + panelWidth || 
            mouseY < panelY || mouseY > panelY + panelHeight) {
            return false;
        }
        
        // Calcola le posizioni dei pulsanti (basate su drawUpgradePanel)
        const buttonWidth = 100;
        const buttonHeight = 30;
        const buttonX = panelX + panelWidth - buttonWidth - 40;
        
        // Controlla click su pulsante Danno (Y = 260 - 15 = 245)
        const damageButtonY = panelY + 245;
        if (mouseX >= buttonX && mouseX <= buttonX + buttonWidth &&
            mouseY >= damageButtonY && mouseY <= damageButtonY + buttonHeight) {
            if (this.ship.upgradeManager.tryUpgrade('damage')) {
                this.ship.updateStats(); // Aggiorna le statistiche della nave
            }
            return true;
        }
        
        // Controlla click su pulsante Velocità (Y = 310 - 15 = 295)
        const speedButtonY = panelY + 295;
        if (mouseX >= buttonX && mouseX <= buttonX + buttonWidth &&
            mouseY >= speedButtonY && mouseY <= speedButtonY + buttonHeight) {
            if (this.ship.upgradeManager.tryUpgrade('speed')) {
                this.ship.updateStats(); // Aggiorna le statistiche della nave
            }
            return true;
        }
        
        // Controlla click su pulsante HP (Y = 360 - 15 = 345)
        const hpButtonY = panelY + 345;
        if (mouseX >= buttonX && mouseX <= buttonX + buttonWidth &&
            mouseY >= hpButtonY && mouseY <= hpButtonY + buttonHeight) {
            console.log('Click su pulsante HP');
            if (this.ship.upgradeManager.tryUpgrade('hp')) {
                this.ship.updateStats(); // Aggiorna le statistiche della nave
                console.log('HP aggiornati a:', this.ship.maxHP);
            }
            return true;
        }
        
        return false;
    }
    
    // Disegna pulsante impostazioni
    drawSettingsButton() {
        const buttonSize = 40;
        const buttonX = this.width - buttonSize - 20;
        const buttonY = 20;
        
        // Sfondo del pulsante
        this.ctx.fillStyle = '#000000';
        this.roundRect(buttonX, buttonY, buttonSize, buttonSize, 8);
        this.ctx.fill();
        
        // Bordo del pulsante
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Icona ingranaggio
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('⚙', buttonX + buttonSize/2, buttonY + buttonSize/2 + 7);
        
        // Ripristina allineamento
        this.ctx.textAlign = 'left';
    }
    
    // Disegna pulsante Space Station
    drawSpaceStationButton() {
        const buttonSize = 40;
        const buttonX = this.width - buttonSize - 20;
        const buttonY = 70; // Sotto il pulsante impostazioni
        
        // Sfondo del pulsante
        this.ctx.fillStyle = '#000000';
        this.roundRect(buttonX, buttonY, buttonSize, buttonSize, 8);
        this.ctx.fill();
        
        // Bordo del pulsante
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Icona Space Station
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🚀', buttonX + buttonSize/2, buttonY + buttonSize/2 + 7);
        
        // Ripristina allineamento
        this.ctx.textAlign = 'left';
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Avvia il gioco quando la pagina è caricata
window.addEventListener('load', () => {
    const game = new Game();
    
    // Riproduci suono di system ready dopo un breve delay
    setTimeout(() => {
        if (game.audioManager) {
            game.audioManager.playSystemReadySound();
        }
    }, 1000); // 1 secondo di delay per permettere il caricamento completo
});