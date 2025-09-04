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
import { Smartbomb } from './modules/Smartbomb.js';
import { FastRepair } from './modules/FastRepair.js';
import { EMP } from './modules/EMP.js';
import { Leech } from './modules/Leech.js';
import { Inventory } from './modules/Inventory.js';
import { InventoryItem } from './modules/InventoryItem.js';
import { DreadspireBackground } from './modules/DreadspireBackground.js';
import { CategorySkillbar } from './modules/CategorySkillbar.js';
import { QuestPanel } from './modules/QuestPanel.js';
import { QuestTracker } from './modules/QuestTracker.js';
import { IconSystemUI } from './modules/IconSystemUI.js';
import { HomePanel } from './modules/HomePanel.js';
import { MapManager } from './modules/MapManager.js';
import { RadiationSystem } from './modules/RadiationSystem.js';
import { LoginScreen } from './modules/LoginScreen.js';



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
        this.dreadspireBackground = new DreadspireBackground();
        this.categorySkillbar = new CategorySkillbar();
        this.categorySkillbar.setGame(this);
        this.ambientEffects = new AmbientEffects(this.width, this.height);
        this.rankSystem = new RankSystem();
        this.playerProfile = new PlayerProfile();
        this.audioManager = new AudioManager();
        this.settingsPanel = new SettingsPanel(this);
        this.radiationSystem = new RadiationSystem();
        this.loginScreen = new LoginScreen(this);
            
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
        
        // Smartbomb
        this.smartbomb = new Smartbomb();
        
        // FastRepair
        this.fastRepair = new FastRepair();
        
        // EMP
        this.emp = new EMP();
        
        // Leech
        this.leech = new Leech();
        
        // Inventario
        this.inventory = new Inventory();
        
        // Pannello Quest
        this.questPanel = new QuestPanel(this);
        
        // Tracker Quest (mini pannello UI)
        this.questTracker = new QuestTracker(this);
        
        // Pannello Home Dashboard
        this.homePanel = new HomePanel(this);
        
        // Sistema di gestione mappe e portali
        this.mapManager = new MapManager(this);
        
        // Sistema icone UI (in alto a sinistra)
        this.iconSystemUI = [];
        this.initIconSystemUI();
        

        
        // Pannello potenziamenti
        this.upgradePanelOpen = false;
        
        // Configura la nave per notificare quando arriva a destinazione
        this.ship.onArrival = () => {
            // Pulisce il target della minimappa quando la nave arriva
            this.minimap.clearTarget();
            // Pulisce anche le coordinate del click quando la nave arriva

        };
    }
    
    // Inizializza il sistema icone UI
    initIconSystemUI() {
        const iconSize = 40;
        const spacing = 10;
        const startX = 20;
        const startY = 20;
        
        // Icona Quest (già gestita dal QuestTracker)
        // Posizione 0: Quest Tracker (gestito separatamente)
        
        // Posizione 1: Profilo
        this.iconSystemUI.push(new IconSystemUI(startX + (iconSize + spacing) * 1, startY, 'profile', {
            size: iconSize,
            visible: true
        }));
        
        // Posizione 2: Inventario
        this.iconSystemUI.push(new IconSystemUI(startX + (iconSize + spacing) * 2, startY, 'inventory', {
            size: iconSize,
            visible: true
        }));
        
        // Posizione 3: Impostazioni
        this.iconSystemUI.push(new IconSystemUI(startX + (iconSize + spacing) * 3, startY, 'settings', {
            size: iconSize,
            visible: true
        }));
        
        // Posizione 4: Statistiche
        this.iconSystemUI.push(new IconSystemUI(startX + (iconSize + spacing) * 4, startY, 'stats', {
            size: iconSize,
            visible: true
        }));
        
        // Posizione 5: Livello
        this.iconSystemUI.push(new IconSystemUI(startX + (iconSize + spacing) * 5, startY, 'level', {
            size: iconSize,
            visible: true,
            subText: this.ship.experience.getLevelInfo().level.toString()
        }));
        
        // Posizione 6: Home Dashboard
        this.iconSystemUI.push(new IconSystemUI(startX + (iconSize + spacing) * 6, startY, 'home', {
            size: iconSize,
            visible: true
        }));
        
        // Inizializza l'audio
        this.audioManager.loadAllSounds();
        
        // Carica l'effetto esplosione
        this.explosionManager.load();
        
        // Carica il background Dreadspire
        this.dreadspireBackground.loadImages();
        
        // Test del suono del motore dopo il caricamento

        
        // Avvia la musica di sottofondo dopo un breve delay
        setTimeout(() => {
            this.audioManager.startBackgroundMusic();
        }, 1000);
        
        // Applica le impostazioni salvate
        this.settingsPanel.applyAudioSettings();
        
        // Aggiungi oggetti di esempio all'inventario (prima di caricare)
        this.initializeInventory();
        
        // Carica l'inventario (solo se non è stato inizializzato)
        if (this.inventory.items.length === 0) {
            this.inventory.load();
        }
        
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
    
    // Gestisce l'input per la schermata di login
    handleLoginInput() {
        // Gestisci tasti premuti
        this.input.keysJustPressed.forEach(key => {
            this.loginScreen.handleKeyPress(key);
        });
        
        // Gestisci tasti tenuti premuti per caratteri speciali
        if (this.input.keys['Backspace']) {
            this.loginScreen.handleKeyPress('Backspace');
        }
        if (this.input.keys['Enter']) {
            this.loginScreen.handleKeyPress('Enter');
        }
    }
    
    update() {
        // Se la schermata di login è visibile, gestisci input e aggiorna
        if (this.loginScreen.isVisible) {
            // Gestisci input da tastiera per la schermata di login
            this.handleLoginInput();
            
            this.loginScreen.update();
            return;
        }
        
        // Aggiorna la nave
        this.ship.update();
        
        // Aggiorna la CategorySkillbar
        this.categorySkillbar.update();
        this.ship.updateSprite();
        this.ship.updateTrail();
        
        // Controlla collisioni bonus box IMMEDIATAMENTE dopo il movimento della nave
        this.checkBonusBoxCollisions();
        
        // Aggiorna effetti di esplosione
        this.explosionManager.update();
        
        // Aggiorna smartbomb
        this.smartbomb.update(16); // 16ms = ~60fps
        
        // Aggiorna FastRepair
        this.fastRepair.update();
        
        // Aggiorna EMP
        this.emp.update();
        
        // Aggiorna Leech
        this.leech.update(this.ship);
        
        // Aggiorna inventario
        this.inventory.update();
        
        // Aggiorna tracker quest
        this.questTracker.update();
        
        // Aggiorna il sistema icone UI
        this.updateIconSystemUI();
        
        // Aggiorna il sistema di mappe e portali
        this.mapManager.update();
        
        // Aggiorna il sistema di radiazione
        const currentMap = this.mapManager.getCurrentMap();
        this.radiationSystem.update(this.ship, currentMap.width, currentMap.height, Date.now());
        
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
        
        // Debug input mouse generale
        if (this.input.isMouseJustPressed()) {
            console.log('🖱️ Click rilevato in generale!');
        }
        
        // Debug input mouse
        if (this.loginScreen.isVisible) {
            console.log('🔍 Login screen visibile, isMouseJustPressed:', this.input.isMouseJustPressed());
        }
        
        // Gestisci click su schermata di login (priorità massima quando visibile)
        if (this.loginScreen.isVisible && this.input.isMouseJustPressed()) {
            const mousePos = this.input.getMousePosition();
            console.log('🖱️ Click rilevato nel game.js:', mousePos.x, mousePos.y);
            this.loginScreen.handleClick(mousePos.x, mousePos.y);
            this.input.resetMouseJustPressed();
            return;
        }
        
        // Gestisci click su popup di morte
        if (this.input.isMouseJustPressed()) {
            const mousePos = this.input.getMousePosition();
            if (this.deathPopup.handleClick(mousePos.x, mousePos.y, this.ship, this.width, this.height)) {
                this.input.resetMouseJustPressed();
                return; // Click gestito dal popup
            }
        }
        
        // Gestisci movimento del mouse per la schermata di login
        if (this.loginScreen.isVisible) {
            const mousePos = this.input.getMousePosition();
            this.loginScreen.handleMouseMove(mousePos.x, mousePos.y);
        }
        
        // Gestisci movimento del mouse per l'inventario
        if (this.inventory.isOpen) {
            const mousePos = this.input.getMousePosition();
            this.inventory.handleMouseMove(mousePos.x, mousePos.y, this.width, this.height);
        }
        
        // Gestisci click sulle icone UI PRIMA dell'inventario
        if (this.input.isLeftClickJustReleased()) {
            const mousePos = this.input.getMousePosition();
            const movementDistance = this.input.mouse.movementDistance || 0;
            
            if (movementDistance <= 5) {
                // Controlla se il click è su un'icona UI
                let iconClicked = false;
                this.iconSystemUI.forEach(icon => {
                    if (icon.isMouseOver(mousePos.x, mousePos.y)) {
                        iconClicked = true;
                    }
                });
                
                if (iconClicked) {
                    this.handleIconSystemUIClick(mousePos.x, mousePos.y);
                    this.input.resetLeftClickReleased();
                    return; // Click gestito dalle icone UI
                }
            }
        }
        
        // Gestisci click sull'inventario
        if (this.input.isLeftClickJustReleased() && this.inventory.isOpen) {
            const mousePos = this.input.getMousePosition();
            if (this.inventory.handleClick(mousePos.x, mousePos.y, this.width, this.height)) {
                this.input.resetLeftClickReleased();
                return; // Click gestito dall'inventario
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
        
        // Gestisci click nel pannello impostazioni (solo se non è un click su icona UI)
        if (this.settingsPanel.isOpen && this.input.isMouseJustPressed()) {
            const mousePos = this.input.getMousePosition();
            
            // Controlla se il click è su un'icona UI
            let iconClicked = false;
            this.iconSystemUI.forEach(icon => {
                if (icon.isMouseOver(mousePos.x, mousePos.y)) {
                    iconClicked = true;
                }
            });
            
            // Se non è un click su icona UI, gestisci il pannello
            if (!iconClicked && this.settingsPanel.handleClick(mousePos.x, mousePos.y)) {
                this.input.resetMouseJustPressed();
                return; // Click gestito dal pannello
            }
        }
        
        // Gestisci click nel pannello quest (solo al primo click)
        if (this.questPanel.isOpen && this.input.isMouseJustPressed()) {
            const mousePos = this.input.getMousePosition();
            if (this.questPanel.handleClick(mousePos.x, mousePos.y)) {
                this.input.resetMouseJustPressed();
                return; // Click gestito dal pannello
            }
        }
        
        // Gestisci click nel pannello home (solo al primo click)
        if (this.homePanel.isOpen && this.input.isMouseJustPressed()) {
            const mousePos = this.input.getMousePosition();
            if (this.homePanel.handleClick(mousePos.x, mousePos.y)) {
                this.input.resetMouseJustPressed();
                return; // Click gestito dal pannello
            }
        }
        

        
        // Gestisci movimento mouse per drag del tracker
        if (this.input.isMouseDown() && this.questTracker.isDragging) {
            const mousePos = this.input.getMousePosition();
            this.questTracker.handleMouseMove(mousePos.x, mousePos.y);
        }
        
        // Gestisci rilascio mouse per drag del tracker
        if (this.input.isLeftClickJustReleased()) {
            if (this.questTracker.isDragging) {
                this.questTracker.handleMouseRelease();
                this.input.resetLeftClickReleased(); // Reset del flag per evitare interferenze
            } else {
                this.questTracker.handleMouseRelease();
            }
        }
        

        

        

        

        
        // Gestisci drag degli slider nel pannello impostazioni
        if (this.settingsPanel.isOpen && this.input.isMouseDown()) {
            const mousePos = this.input.getMousePosition();
            this.settingsPanel.handleMouseMove(mousePos.x, mousePos.y);
        }
        
        // Gestisci drag del pannello home
        if (this.homePanel.isOpen && this.input.isMouseDown()) {
            const mousePos = this.input.getMousePosition();
            this.homePanel.handleMouseMove(mousePos.x, mousePos.y);
        }
        
        // Ferma il drag quando si rilascia il mouse
        if (this.input.isLeftClickJustReleased()) {
            this.settingsPanel.stopDragging();
            this.homePanel.stopDragging();
            // Ferma il movimento della nave quando l'utente smette di cliccare
            // MA solo se non c'è un target attivo dalla minimappa E l'inventario non è aperto
            if (!this.minimap.currentTarget && !this.inventory.isOpen) {
                this.ship.stopMovement();
            }
        }
        

        
        // Reset del flag click appena premuto
        this.input.resetMouseJustPressed();
        
        // Controlla se il click è stato gestito dal tracker
        let clickHandledByTracker = false;
        if (this.input.isLeftClickJustReleased()) {
            const mousePos = this.input.getMousePosition();
            
            // Non gestire il click se è navigazione (movimento > 5px)
            const movementDistance = this.input.mouse.movementDistance || 0;
            if (movementDistance <= 5) {
                clickHandledByTracker = this.questTracker.handleClick(mousePos.x, mousePos.y);
                if (clickHandledByTracker) {
                    // Reset del flag dopo aver gestito il click
                    this.input.resetLeftClickReleased();
                }
            }
        }
        

        
        // Controlla se il mouse è sopra il tracker durante isMouseDown (esclusi i controlli di navigazione)
        let mouseOverTracker = false;
        let mouseOverUIIcon = false;
        if (this.input.isMouseDown()) {
            const mousePos = this.input.getMousePosition();
            mouseOverTracker = this.questTracker.isMouseOverTracker(mousePos.x, mousePos.y) || 
                              this.questTracker.isMouseOverIcon(mousePos.x, mousePos.y) ||
                              this.questTracker.isMouseOverCloseButton(mousePos.x, mousePos.y) ||
                              this.questTracker.isMouseOverDragArea(mousePos.x, mousePos.y);
            
            // Controlla se il mouse è sopra un'icona UI
            this.iconSystemUI.forEach(icon => {
                if (icon.isMouseOver(mousePos.x, mousePos.y)) {
                    mouseOverUIIcon = true;
                }
            });
        }
        
        // Gestisci input per il movimento (solo se non si sta facendo drag e non si è sopra il tracker o icone UI)
        if (this.input.isMouseDown() && !this.upgradePanelOpen && !this.settingsPanel.isOpen && !this.settingsPanel.draggingSlider && !this.spaceStationPanel.isOpen && !this.inventory.isOpen && !this.homePanel.isOpen && !this.questTracker.isDragging && !clickHandledByTracker && !mouseOverTracker && !mouseOverUIIcon) {
            const mousePos = this.input.getMousePosition();
            
            // Non muovere se il click è sulla skillbar E non è navigazione (movimento > 5px)
            if (this.isClickOnCategorySkillbar(mousePos.x, mousePos.y)) {
                const movementDistance = this.input.mouse.movementDistance || 0;
                if (movementDistance <= 5) {
                    return; // Solo se è un click effettivo, non navigazione
                }
                // Se è navigazione (movimento > 5px), continua il movimento anche sopra la skillbar
            }
            
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
        if (this.input.isRightClickJustReleased() && !this.upgradePanelOpen && !this.spaceStationPanel.isOpen && !this.inventory.isOpen) {
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
        
        // Le skills ora sono gestite dalla CategorySkillbar
        
        // Comando per cambiare nickname (tasto N)
        if (this.input.isKeyJustPressed('KeyN')) {
            const newNickname = prompt('Inserisci il tuo nickname:', this.playerProfile.getNickname());
            if (newNickname && newNickname.trim().length > 0) {
                this.playerProfile.setNickname(newNickname.trim());

            }
        }
        
        // Comando per aprire/chiudere inventario (tasto I)
        if (this.input.isKeyJustPressed('KeyI')) {
            this.inventory.toggle();
        }
        
        // Comando per aprire/chiudere pannello quest (tasto Q)
        if (this.input.isKeyJustPressed('KeyQ')) {
            if (this.questPanel.isOpen) {
                this.questPanel.close();
            } else {
                this.questPanel.open();
            }
        }
        

        

        
        // Gestisci click sui pulsanti di upgrade
        if (this.input.isLeftClickJustReleased() && this.upgradePanelOpen) {
            const mousePos = this.input.getMousePosition();
            this.handleUpgradeClick(mousePos.x, mousePos.y);
            // Reset del flag per evitare spam
            this.input.resetLeftClickReleased();
        }
        
        // Gestisci click sulla CategorySkillbar
        if (this.input.isLeftClickJustReleased() && !this.upgradePanelOpen && !this.settingsPanel.isOpen && !this.spaceStationPanel.isOpen && !this.inventory.isOpen) {
            const mousePos = this.input.getMousePosition();
            
            // Controlla se il mouse è sopra la skillbar
            if (this.isClickOnCategorySkillbar(mousePos.x, mousePos.y)) {
                const movementDistance = this.input.mouse.movementDistance || 0;
                
                // Se è navigazione (movimento > 5px), resetta il click e non gestire
                if (movementDistance > 5) {
                    this.input.resetLeftClickReleased();
                    return;
                }
                
                // Se è un click effettivo, gestisci il click sulla skillbar
                const handled = this.handleCategorySkillbarClick(mousePos.x, mousePos.y);
                if (handled) {
                    this.input.resetLeftClickReleased();
                    return; // Esci subito per evitare che la nave si muova
                }
            }
        }
        
        // Controllo aggiuntivo: se il mouse è sopra la skillbar e c'è un click rilasciato in sospeso, resettalo
        if (this.input.isLeftClickJustReleased() && !this.upgradePanelOpen && !this.settingsPanel.isOpen && !this.spaceStationPanel.isOpen && !this.inventory.isOpen) {
            const mousePos = this.input.getMousePosition();
            if (this.isClickOnCategorySkillbar(mousePos.x, mousePos.y)) {
                // Controlla se il click iniziale era fuori dalla skillbar
                const startX = this.input.mouse.startX || 0;
                const startY = this.input.mouse.startY || 0;
                const wasClickOutsideSkillbar = !this.isClickOnCategorySkillbar(startX, startY);
                
                // Se il click è iniziato fuori dalla skillbar e ora il mouse è sopra la skillbar,
                // resetta il click per evitare attivazioni accidentali
                if (wasClickOutsideSkillbar) {
                    this.input.resetLeftClickReleased();
                }
            }
        }
        
        // Protezione aggiuntiva: reset automatico di click "fantasma" dopo un certo tempo
        if (this.input.isLeftClickJustReleased() && !this.upgradePanelOpen && !this.settingsPanel.isOpen && !this.spaceStationPanel.isOpen && !this.inventory.isOpen) {
            const mousePos = this.input.getMousePosition();
            const movementDistance = this.input.mouse.movementDistance || 0;
            
            // Se il mouse è sopra la skillbar ma non c'è stato movimento significativo,
            // e il click è rimasto attivo per troppo tempo, resettalo
            if (this.isClickOnCategorySkillbar(mousePos.x, mousePos.y) && movementDistance <= 5) {
                // Reset aggressivo per click fantasma
                this.input.resetLeftClickReleased();
            }
        }
        
        // Sistema di movimento continuo minimappa rimosso - la nave si muove una volta verso il target
        
        // Aggiorna il mondo
        this.world.update();
        
        // Debug: traccia target prima di updateCombat
        // Sistema di combattimento
        this.updateCombat();
        
        // Reset dei flag dei tasti
        this.input.resetKeysJustPressed();
        
        // Gestisci zoom con rotella del mouse (solo se l'inventario non è aperto)
        if (this.input.hasWheelMovement() && !this.inventory.isOpen) {
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
        
        // Controlla interazione con la stazione spaziale (tasto E) solo se presente
        if (this.mapManager.shouldShowSpaceStation()) {
            this.checkSpaceStationInteraction();
        }
        
        // Controlla interazione con i portali (tasto E)
        this.checkPortalInteraction();
        
        // Gestisci tasto ESC per chiudere i pannelli
        if (this.input.isKeyJustPressed('Escape')) {
            if (this.spaceStationPanel.isOpen) {
                this.spaceStationPanel.close();
            } else if (this.questPanel.isOpen) {
                this.questPanel.close();
            } else if (this.settingsPanel.isOpen) {
                this.settingsPanel.close();
            } else if (this.inventory.isOpen) {
                this.inventory.close();
            }
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
        
        // Se la schermata di login è visibile, disegna solo quella
        if (this.loginScreen.isVisible) {
            this.loginScreen.draw(this.ctx);
            return;
        }
        
        // Salva il contesto per applicare lo zoom
        this.ctx.save();
        
        // Applica lo zoom centrato sullo schermo (con protezione)
        const safeZoom = Math.max(0.1, Math.min(this.camera.zoom, 5.0));
        this.ctx.translate(this.width / 2, this.height / 2);
        this.ctx.scale(safeZoom, safeZoom);
        this.ctx.translate(-this.width / 2, -this.height / 2);
        
        // Disegna sfondo parallax
        this.parallaxBackground.draw(this.ctx, this.camera);
        
        // Disegna background Dreadspire (sopra il parallax)
        this.dreadspireBackground.draw(this.ctx, this.camera);
        
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
        
        // Disegna stazione spaziale solo se presente nella mappa corrente
        if (this.mapManager.shouldShowSpaceStation()) {
            this.spaceStation.draw(this.ctx, this.camera);
        }
        
        // Disegna asteroidi interattivi
        for (let asteroid of this.interactiveAsteroids) {
            asteroid.draw(this.ctx, this.camera);
        }
        
        // Disegna la nave
        this.renderer.drawShip(this.ship, this.camera);
        
        // Disegna l'effetto di radiazione intorno alla nave (dentro la sezione zoom)
        this.radiationSystem.drawRadiationEffect(this.ctx, this.camera, this.ship);
        
        // Disegna i confini della mappa
        this.world.drawMapRectangle(this.ctx, this.camera);
        
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
        
        // Disegna smartbomb
        this.smartbomb.draw(this.ctx, this.camera);
        
        // Disegna FastRepair
        this.fastRepair.draw(this.ctx, this.camera, this.ship.x, this.ship.y);
        
        // Disegna EMP
        this.emp.draw(this.ctx, this.camera, this.ship.x, this.ship.y);
        
        // Disegna Leech
        this.leech.draw(this.ctx, this.camera, this.ship.x, this.ship.y);
        
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
        this.minimap.draw(this.ctx, this.ship, this.camera, this.enemies, this.sectorSystem, this.spaceStation, this.interactiveAsteroids, this.mapManager);
        
        // Disegna i portali nella minimappa
        this.mapManager.drawMinimap(this.ctx, this.minimap);
        
        // Disegna le notifiche (sempre sopra tutto, non influenzate dallo zoom)
        this.notifications.draw(this.ctx);
        
        // Disegna le notifiche di zona
        this.drawZoneNotifications();
        
        // Aggiorna e disegna il pannello della stazione spaziale
        if (this.spaceStationPanel.isOpen) {
            this.spaceStationPanel.update();
        }
        this.spaceStationPanel.draw(this.ctx, this.canvas.width, this.canvas.height, this.ship.upgradeManager);
        

        
        // Disegna CategorySkillbar (non influenzata dallo zoom)
        this.drawCategorySkillbar();
        
        // Disegna pulsante impostazioni
        this.drawSettingsButton();
        
        // Disegna pulsante Space Station
        this.drawSpaceStationButton();
        
        // Disegna pannello impostazioni se aperto
        this.settingsPanel.draw(this.ctx);
        
        // Disegna pannello home se aperto
        this.homePanel.draw(this.ctx);
        
        // Disegna i portali
        this.mapManager.draw(this.ctx, this.camera);
        
        // Disegna sistema icone UI DOPO i pannelli (per evitare che l'overlay le oscuri)
        this.drawIconSystemUI();
        
        // Disegna pannello potenziamenti se aperto
        if (this.upgradePanelOpen) {

            this.drawUpgradePanel();
        }
        
        // Disegna popup di morte (sempre sopra tutto)
        this.deathPopup.draw(this.ctx, this.width, this.height);
        
        // Disegna inventario
        this.inventory.draw(this.ctx, this.width, this.height);
        
        // Disegna pannello quest se aperto
        this.questPanel.draw(this.ctx);
        
        // Disegna tracker quest (sempre visibile se ci sono quest attive)
        this.questTracker.draw(this.ctx);
    }
    
    // Inizializza l'inventario con oggetti di esempio
    initializeInventory() {
        // Aggiungi alcuni oggetti di esempio se l'inventario è vuoto
        if (this.inventory.items.length === 0) {
            const exampleItems = InventoryItem.createExampleItems();
            
            // Aggiungi più oggetti per testare il sistema a 5 slot
            for (let i = 0; i < exampleItems.length; i++) {
                // Aggiungi 2-3 copie di ogni oggetto per testare l'equipaggiamento multiplo
                for (let j = 0; j < 2; j++) {
                    this.inventory.addItem(exampleItems[i]);
                }
            }
        }
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
    
    checkPortalInteraction() {
        // Controlla se il tasto E è stato premuto
        if (this.input.keysJustPressed.has('KeyE')) {
            this.mapManager.handlePortalInteraction();
        }
    }
    
    // Mostra schermata di benvenuto per le mappe
    showMapWelcomeScreen(mapName, description) {
        this.mapWelcomeScreen = {
            show: true,
            mapName: mapName,
            description: description,
            startTime: Date.now(),
            duration: 3000 // 3 secondi
        };
    }
    
    // Aggiorna la schermata di benvenuto
    updateMapWelcomeScreen() {
        if (this.mapWelcomeScreen && this.mapWelcomeScreen.show) {
            const elapsed = Date.now() - this.mapWelcomeScreen.startTime;
            if (elapsed >= this.mapWelcomeScreen.duration) {
                this.mapWelcomeScreen.show = false;
            }
        }
    }
    
    // Disegna la schermata di benvenuto
    drawMapWelcomeScreen(ctx) {
        if (this.mapWelcomeScreen && this.mapWelcomeScreen.show) {
            const elapsed = Date.now() - this.mapWelcomeScreen.startTime;
            const progress = Math.min(elapsed / this.mapWelcomeScreen.duration, 1);
            
            // Fade in/out
            const alpha = progress < 0.1 ? progress * 10 : (progress > 0.9 ? (1 - progress) * 10 : 1);
            
            ctx.save();
            ctx.globalAlpha = alpha;
            
            // Sfondo semi-trasparente
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            
            // Testo centrato
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Nome mappa grande
            ctx.font = 'bold 48px Arial';
            ctx.fillText(this.mapWelcomeScreen.mapName, ctx.canvas.width / 2, ctx.canvas.height / 2 - 50);
            
            // Descrizione
            ctx.font = '24px Arial';
            ctx.fillText(this.mapWelcomeScreen.description, ctx.canvas.width / 2, ctx.canvas.height / 2 + 20);
            
            ctx.restore();
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
    

    

    
    // Metodo standardizzato per disegnare le icone UI
    drawStandardIcon(x, y, mainText, subText = null) {
        const iconSize = 40;
        const cornerRadius = 8;
        
        // Sfondo dell'icona
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, iconSize, iconSize, cornerRadius);
        this.ctx.fill();
        
        // Bordo dell'icona
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Testo principale
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        if (subText) {
            // Se c'è un sottotesto, posiziona il testo principale più in alto
            this.ctx.fillText(mainText, x + iconSize/2, y + iconSize/2 - 4);
            
            // Sottotesto
            this.ctx.fillStyle = '#ffaa00';
            this.ctx.font = 'bold 10px Arial';
            this.ctx.fillText(subText, x + iconSize/2, y + iconSize/2 + 8);
        } else {
            // Solo testo principale centrato
            this.ctx.fillText(mainText, x + iconSize/2, y + iconSize/2 + 2);
        }
        
        // Ripristina allineamento
        this.ctx.textAlign = 'left';
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
    
    // Disegna CategorySkillbar
    drawCategorySkillbar() {
        // Posiziona la skillbar in basso al centro
        const x = (this.width - 600) / 2; // 600 è la larghezza della skillbar
        const y = this.height - 80; // 80px dal basso
        
        this.categorySkillbar.setPosition(x, y);
        this.categorySkillbar.draw(this.ctx);
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
        
        // Posizione della skillbar principale (slots 1-4)
        const skillbarX = panelX + autoattackWidth + 20;
        
        // Disegna 4 slot (1-4) - skillbar principale
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
            
            // Slot 1 (primo slot) - Smartbomb
            if (i === 0) {
                this.smartbomb.drawIcon(this.ctx, slotX, slotY, slotSize, this.smartbomb.canUse());
            }
            
            // Slot 2 (secondo slot) - FastRepair
            if (i === 1) {
                this.fastRepair.drawIcon(this.ctx, slotX, slotY, slotSize, this.fastRepair.canUse());
            }
            
            // Slot 3 (terzo slot) - EMP
            if (i === 2) {
                this.emp.drawIcon(this.ctx, slotX, slotY, slotSize, this.emp.canUse());
            }
            
            // Slot 4 (quarto slot) - Leech
            if (i === 3) {
                this.leech.drawIcon(this.ctx, slotX, slotY, slotSize, this.leech.canUse());
            }
            
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
    
    // Gestisce i click sulla CategorySkillbar
    handleCategorySkillbarClick(mouseX, mouseY) {
        return this.categorySkillbar.handleClick(mouseX, mouseY);
    }
    
    // Controlla se il click è sulla CategorySkillbar
    isClickOnCategorySkillbar(mouseX, mouseY) {
        // Posizione della skillbar
        const x = (this.width - 600) / 2; // 600 è la larghezza della skillbar
        const y = this.height - 80; // 80px dal basso
        const barWidth = 600;
        const barHeight = 60;
        
        // Zona di sicurezza (stessa logica della CategorySkillbar)
        const skillbarMargin = 5;
        let skillbarLeft = x - skillbarMargin;
        let skillbarRight = x + barWidth + skillbarMargin;
        let skillbarTop = y - skillbarMargin;
        let skillbarBottom = y + barHeight + skillbarMargin;
        
        // Se una categoria è aperta, estendi i bounds per includere il menu a tendina
        if (this.categorySkillbar.activeCategory) {
            const category = this.categorySkillbar.categories[this.categorySkillbar.getCategoryKeyByName(this.categorySkillbar.activeCategory)];
            if (category) {
                const itemsPerRow = 4;
                const rows = Math.ceil(category.items.length / itemsPerRow);
                const itemSize = 50;
                const itemSpacing = 10;
                const totalHeight = rows * (itemSize + itemSpacing) + itemSpacing;
                const menuTop = y - totalHeight - 10;
                skillbarTop = Math.min(skillbarTop, menuTop - skillbarMargin);
            }
        }
        
        // Controlla se il click è nella zona di sicurezza
        if (mouseX >= skillbarLeft && mouseX <= skillbarRight && mouseY >= skillbarTop && mouseY <= skillbarBottom) {
            return true;
        }
        
        // Se una categoria è aperta, controlla anche il menu a tendina
        if (this.categorySkillbar.activeCategory) {
            const category = this.categorySkillbar.categories[this.categorySkillbar.getCategoryKeyByName(this.categorySkillbar.activeCategory)];
            if (category) {
                const itemsPerRow = 4;
                const rows = Math.ceil(category.items.length / itemsPerRow);
                const itemSize = 50;
                const itemSpacing = 10;
                const totalHeight = rows * (itemSize + itemSpacing) + itemSpacing;
                
                const menuX = x;
                const menuY = y - totalHeight - 10;
                
                if (mouseX >= menuX && mouseX <= menuX + barWidth && mouseY >= menuY && mouseY <= menuY + totalHeight) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    // Gestisce i click sulla skillbar
    handleSkillbarClick(mouseX, mouseY) {
        const slotSize = 50;
        const slotSpacing = 5;
        const autoattackIconSize = 30;
        const autoattackSpacing = 5;
        
        // Calcola posizione per 4 slot (3-6) invece di 6
        const totalWidth = (slotSize * 4) + (slotSpacing * 3);
        const autoattackWidth = (autoattackIconSize * 2) + autoattackSpacing;
        const totalSkillbarWidth = totalWidth + autoattackWidth + 20;
        
        const panelX = (this.width - totalSkillbarWidth) / 2;
        const panelY = this.height - slotSize - 30;
        const skillbarX = panelX + autoattackWidth + 20;
        
        // Controlla click sui 4 slot della skillbar
        for (let i = 0; i < 4; i++) {
            const slotX = skillbarX + (i * (slotSize + slotSpacing));
            const slotY = panelY;
            
            if (mouseX >= slotX && mouseX <= slotX + slotSize &&
                mouseY >= slotY && mouseY <= slotY + slotSize) {
                
                // Slot 1 (primo slot) - Smartbomb
                if (i === 0) {
                    if (this.smartbomb.activate(this.ship, this.enemies, this.explosionManager)) {
                        this.notifications.add('💣 Smartbomb attivata!', 200, 'info');
                    } else {
                        const remaining = Math.ceil(this.smartbomb.getCooldownRemaining() / 1000);
                        this.notifications.add(`⏰ Smartbomb in cooldown: ${remaining}s`, 200, 'warning');
                    }
                }
                
                // Slot 2 (secondo slot) - FastRepair
                if (i === 1) {
                    if (this.fastRepair.activate(this.ship)) {
                        this.notifications.add('🔧 FastRepair attivato!', 200, 'info');
                    } else {
                        const remaining = Math.ceil(this.fastRepair.getCooldownRemaining() / 1000);
                        this.notifications.add(`⏰ FastRepair in cooldown: ${remaining}s`, 200, 'warning');
                    }
                }
                
                // Slot 3 (terzo slot) - EMP
                if (i === 2) {
                    if (this.emp.activate(this.ship, this.enemies)) {
                        this.notifications.add('⚡ EMP attivato!', 200, 'info');
                    } else {
                        const remaining = Math.ceil(this.emp.getCooldownRemaining() / 1000);
                        this.notifications.add(`⏰ EMP in cooldown: ${remaining}s`, 200, 'warning');
                    }
                }
                
                // Slot 4 (quarto slot) - Leech
                if (i === 3) {
                    if (this.leech.activate(this.ship)) {
                        this.notifications.add('🩸 Leech attivato!', 200, 'info');
                    } else {
                        const remaining = Math.ceil(this.leech.getCooldownRemaining() / 1000);
                        this.notifications.add(`⏰ Leech in cooldown: ${remaining}s`, 200, 'warning');
                    }
                }
                // Altri slot per future abilità
                break;
            }
        }
    }
    
    // Disegna pulsante impostazioni
    drawSettingsButton() {
        const buttonSize = 40;
        const buttonX = this.width - buttonSize - 20;
        const buttonY = 20;
        
        this.drawStandardIcon(buttonX, buttonY, '⚙');
    }
    
    // Disegna pulsante Space Station
    drawSpaceStationButton() {
        const buttonSize = 40;
        const buttonX = this.width - buttonSize - 20;
        const buttonY = 70; // Sotto il pulsante impostazioni
        
        this.drawStandardIcon(buttonX, buttonY, '🚀');
    }
    
    // Disegna il sistema icone UI
    drawIconSystemUI() {
        this.iconSystemUI.forEach(icon => {
            icon.draw(this.ctx);
        });
    }
    
    updateIconSystemUI() {
        // Gestisce i tooltip per le icone UI
        this.iconSystemUI.forEach(icon => {
            if (icon.isMouseOver(this.input.mouse.x, this.input.mouse.y)) {
                icon.setTooltipVisible(true);
            } else {
                icon.setTooltipVisible(false);
            }
        });
    }
    
    // Gestisce i click sul sistema icone UI
    handleIconSystemUIClick(x, y) {
        this.iconSystemUI.forEach((icon, index) => {
            if (icon.isMouseOver(x, y)) {
                console.log(`Click su icona UI: ${icon.type} (posizione ${index})`);
                
                switch (icon.type) {
                    case 'profile':
                        this.notifications.add('Profilo - In sviluppo', 'info');
                        break;
                    case 'inventory':
                        this.inventory.toggle();
                        break;
                    case 'settings':
                        this.settingsPanel.toggle();
                        break;
                    case 'stats':
                        this.notifications.add('Statistiche - In sviluppo', 'info');
                        break;
                    case 'level':
                        this.notifications.add(`Livello ${this.ship.experience.getLevelInfo().level}`, 'info');
                        break;
                    case 'home':
                        this.homePanel.toggle();
                        break;
                }
            }
        });
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