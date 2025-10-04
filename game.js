// Gioco Spaziale - File Principale
import { Ship } from './src/entities/Ship.js';
import { Camera } from './src/core/Camera.js';
import { Input } from './src/core/Input.js';
import { World } from './src/world/World.js';
import { Renderer } from './src/core/Renderer.js';
import { Minimap } from './modules/Minimap.js';
import { Enemy } from './src/entities/Enemy.js';
import { Notification } from './modules/Notification.js';
import { SectorSystem } from './src/world/SectorSystem.js';
import { ExplosionEffect } from './modules/ExplosionEffect.js';
import { ParallaxBackground } from './modules/ParallaxBackground.js';
import { AmbientEffects } from './modules/AmbientEffects.js';
import { RankSystem } from './src/systems/RankSystem.js';
import { PlayerProfile } from './modules/PlayerProfile.js';
import { AudioManager } from './src/systems/AudioManager.js';
import { SettingsPanel } from './src/ui/SettingsPanel.js';
import { BonusBox } from './src/entities/BonusBox.js';
import { SpaceStation } from './src/entities/SpaceStation.js';
import { ZoneNotification } from './modules/ZoneNotification.js';
import { SpaceStationPanel } from './src/ui/SpaceStationPanel.js';
import { InteractiveAsteroid } from './src/entities/InteractiveAsteroid.js';
import { DeathPopup } from './modules/DeathPopup.js';
import { Smartbomb } from './modules/Smartbomb.js';
import { FastRepair } from './modules/FastRepair.js';
import { EMP } from './modules/EMP.js';
import { Leech } from './modules/Leech.js';
import { Inventory } from './src/systems/Inventory.js';
import { InventoryItem } from './src/systems/InventoryItem.js';
// import { DreadspireBackground } from './modules/DreadspireBackground.js';
import { HomePanel } from './src/ui/HomePanel.js';
import { StartScreen } from './src/ui/StartScreen.js';
import { QuestTracker } from './src/systems/QuestTracker.js';
import { CategorySkillbar } from './src/ui/CategorySkillbar.js';
import { IconSystemUI } from './modules/IconSystemUI.js';
import { UIManager } from './src/ui/UIManager.js';
import { ProfilePanel } from './src/ui/ProfilePanel.js';
import { MapManager } from './src/world/MapManager.js';
import { MapSystem } from './src/world/MapSystem.js';
import { RadiationSystem } from './src/systems/RadiationSystem.js';
import { DamageNumberSystem } from './modules/DamageNumbers.js';
import { SaveSystem } from './src/systems/SaveSystem.js';
import { SaveLoadPanel } from './src/ui/SaveLoadPanel.js';
import { FactionSystem } from './src/systems/FactionSystem.js';
import { AuthSystem } from './src/systems/AuthSystem.js';
import { OnlineGameManager } from './modules/OnlineGameManager.js';



class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Imposta dimensioni dinamiche del canvas
        this.setCanvasSize();
        
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Inizializza tutti i moduli
        this.ship = new Ship(8000, 5000, 40, this); // Centro del rettangolo 16000x10000
        this.camera = new Camera(this.width, this.height);
        this.input = new Input(this.canvas);
        this.world = new World(this.width, this.height);
        this.renderer = new Renderer(this.ctx, this.width, this.height);
        this.minimap = new Minimap(this.width, this.height);
        this.sectorSystem = new SectorSystem();
        this.notifications = new Notification();
        
        // Sistema numeri di danno
        this.damageNumbers = new DamageNumberSystem();
        
        // Inizializza RewardManager della nave DOPO aver creato le notifiche
        this.ship.initRewardManager(this.notifications);
        this.explosionManager = new ExplosionEffect();
        this.parallaxBackground = new ParallaxBackground(this.width, this.height);
        // this.dreadspireBackground = new DreadspireBackground(); // Rimosso - solo parallax
        this.categorySkillbar = new CategorySkillbar();
        this.categorySkillbar.setGame(this);
        this.ambientEffects = new AmbientEffects(this.width, this.height);
        this.rankSystem = new RankSystem();
        this.playerProfile = new PlayerProfile();
        this.audioManager = new AudioManager();
        this.settingsPanel = new SettingsPanel(this);
        this.radiationSystem = new RadiationSystem();
            
            // Sistema di combattimento
        this.enemies = [];
        // Sistema di spawning automatico rimosso - ora gestito da MapInstance
        
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
        
        // Sistema di salvataggio
        this.saveSystem = new SaveSystem(this);
        this.authSystem = new AuthSystem(this);
        this.saveLoadPanel = new SaveLoadPanel(this);
        
        // Sistema fazioni
        this.factionSystem = new FactionSystem();
        
        // Sistema multiplayer
        this.onlineManager = new OnlineGameManager();
        this.onlinePlayers = new Map(); // playerId -> playerData
        this.isOnlineMode = false;
        this.playerId = null;
        
        // Inizializza eventi multiplayer
        this.initMultiplayerEvents();
        
        // Sistema visualizzazione mappe (dopo factionSystem)
        this.mapSystem = new MapSystem();
        this.mapSystem.setFactionSystem(this.factionSystem);
        
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
        
        // Pannello Home Dashboard
        this.homePanel = new HomePanel(this);
        
        // Schermata di selezione iniziale
        this.startScreen = new StartScreen(this);
        console.log('✅ StartScreen created - isVisible:', this.startScreen.isVisible, 'isTyping:', this.startScreen.isTyping);
        
        // Test globale per verificare se gli eventi da tastiera funzionano
        document.addEventListener('keydown', (e) => {
            console.log('🔑 GLOBAL KEYDOWN TEST:', e.code, e.key);
            
        });
        
        // Quest Tracker (mini pannello per quest attive)
        this.questTracker = new QuestTracker(this);
        
        // Profile panel
        this.profilePanel = new ProfilePanel(this);
        
        // Esponi il pannello Home globalmente per il sistema di log
        window.gameInstance = this;
        
        // Sistema di gestione mappe e portali
        this.mapManager = new MapManager(this);
        
        // Connessione automatica al multiplayer dopo l'inizializzazione
        setTimeout(() => {
            this.connectToServer();
        }, 2000); // Aspetta 2 secondi per permettere il caricamento completo
        
        // Sistema visualizzazione mappe (inizializzato dopo factionSystem)
        // this.mapSystem sarà inizializzato dopo factionSystem
        
        // Sistema icone UI (in alto a sinistra)
        this.iconSystemUI = [];
        this.initIconSystemUI();
        
        // Nuovo sistema unificato icone UI
        this.uiManager = new UIManager(this);
        this.initUIManager();
        
        
        // Il logout è ora gestito dalla HomePanel
        
        // Etichetta build (overlay)
        this.buildLabel = {
            text: 'PRE-ALPHA BUILD',
            color: '#9aa4b2'
        };
        
        // Inizializza audio e altri sistemi
        this.initAudio();
        

        
        // Pannello potenziamenti
        this.upgradePanelOpen = false;
        
        // Configura la nave per notificare quando arriva a destinazione
        this.ship.onArrival = () => {
            // Pulisce il target della minimappa quando la nave arriva
            this.minimap.clearTarget();
            // Pulisce anche le coordinate del click quando la nave arriva

        };
    }
    
    // Disegna un semplice badge di build in alto a destra
    drawBuildBadge() {
        try {
            const padding = 14;
            const labelText = (this.buildLabel && this.buildLabel.text) ? this.buildLabel.text : 'PRE-ALPHA BUILD';
            const color = (this.buildLabel && this.buildLabel.color) ? this.buildLabel.color : '#9aa4b2';
            this.ctx.save();
            this.ctx.font = 'bold 12px Inter, Arial, sans-serif';
            this.ctx.textAlign = 'right';
            this.ctx.textBaseline = 'top';
            this.ctx.fillStyle = color;
            this.ctx.globalAlpha = 0.9;
            this.ctx.fillText(labelText, this.canvas.width - padding, padding);
            this.ctx.restore();
        } catch (e) {
            // Evita di bloccare il loop in caso di errori inattesi
        }
    }

    // Imposta le dimensioni del canvas dinamicamente
    setCanvasSize() {
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Imposta le dimensioni del canvas
        this.canvas.width = containerWidth;
        this.canvas.height = containerHeight;
        
        console.log('📐 Canvas size set to:', containerWidth, 'x', containerHeight);
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
        
        // Posizione 3: Home Dashboard
        this.iconSystemUI.push(new IconSystemUI(startX + (iconSize + spacing) * 3, startY, 'home', {
            size: iconSize,
            visible: true
        }));
        
        // Posizione 4: Impostazioni
        this.iconSystemUI.push(new IconSystemUI(startX + (iconSize + spacing) * 4, startY, 'settings', {
            size: iconSize,
            visible: true
        }));
    }
    
    // Inizializza il nuovo sistema unificato icone UI
    initUIManager() {
        const configs = UIManager.getDefaultConfigs();
        
        // Registra le icone con i pannelli associati
        this.uiManager.registerIcon({
            ...configs.quest,
            panel: this.questTracker
        });
        
        this.uiManager.registerIcon({
            ...configs.profile,
            panel: this.profilePanel
        });
        
        this.uiManager.registerIcon({
            ...configs.inventory,
            panel: this.inventory
        });
        
        this.uiManager.registerIcon({
            ...configs.home,
            panel: this.homePanel
        });
        
        this.uiManager.registerIcon({
            ...configs.settings,
            panel: this.settingsPanel
        });
    }
    
    // Inizializza l'audio
    initAudio() {
        this.audioManager.loadAllSounds();
        
        // Carica l'effetto esplosione
        this.explosionManager.load();
        
        // Carica il background Dreadspire
        // this.dreadspireBackground.loadImages(); // Rimosso - solo parallax
        
        // Test del suono del motore dopo il caricamento

        
        // NON avviare la musica automaticamente - solo quando il gioco inizia
    }
    
    // Avvia l'audio del gioco (chiamato quando il gioco inizia davvero)
    startGameAudio() {
        if (this.audioManager) {
            this.audioManager.startBackgroundMusic();
            
            // Riproduci suono di system ready
            setTimeout(() => {
                this.audioManager.playSystemReadySound();
            }, 500);
            
        }
        
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
        
        // NON avviare il game loop qui - sarà avviato dopo il caricamento degli asset
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
        // Aggiorna l'input PRIMA di tutto
        this.input.update();
        
        // Se la StartScreen è visibile, gestisci SOLO quella e ferma tutto il resto
        if (this.startScreen.isVisible) {
            this.startScreen.update(16); // 16ms = ~60fps

            // Tastiera (nickname)
            const keys = this.input.getPressedKeys();
            keys.forEach(key => {
                if (this.startScreen.handleKeyPress(key)) {
                    this.input.resetKey(key);
                }
            });
            
            // Reset solo dei tasti processati nel StartScreen
            this.input.resetKeysJustPressed();

            // Mouse (click su input/fazioni/start)
            if (this.input.isLeftClickJustReleased()) {
                const mousePos = this.input.getMousePosition();
                if (this.startScreen.handleClick(mousePos.x, mousePos.y)) {
                    this.input.resetLeftClickReleased();
                }
            }

            return; // STOP - Non aggiornare/gestire altro finché la start screen è visibile
        }
        
        // Il gioco principale inizia SOLO quando la StartScreen non è visibile
        
        // Gestisci cambio nave con tasti 1 e 2
        if (this.input.isKey1JustPressed()) {
            this.ship.sprite.switchShip(1);
            this.notifications.add("Nave base selezionata", "info");
            this.input.resetKey1JustPressed();
        }
        if (this.input.isKey2JustPressed()) {
            this.ship.sprite.switchShip(2);
            this.notifications.add("Urus Fighter selezionata", "info");
            this.input.resetKey2JustPressed();
        }

        // === GESTIONE EVENTI UI (PRIORITÀ MASSIMA) ===
        const mousePos = this.input.getMousePosition();
        let uiEventHandled = false;
        
        // Controlla se il mouse è sopra le icone UI e il quest tracker
        let mouseOverUIIcon = false;
        let mouseOverQuestTracker = false;
        
        // Controlla se il mouse è sopra un'icona UI del nuovo sistema
        if (this.uiManager.isMouseOverAnyIcon(mousePos.x, mousePos.y)) {
            mouseOverUIIcon = true;
        }
        
        // Controlla se il mouse è sopra un'icona UI del vecchio sistema
        this.iconSystemUI.forEach(icon => {
            if (icon.isMouseOver(mousePos.x, mousePos.y)) {
                mouseOverUIIcon = true;
            }
        });
        
        // Controlla se il mouse è sopra il quest tracker
        if (this.questTracker.isMouseOverTracker(mousePos.x, mousePos.y)) {
            mouseOverQuestTracker = true;
        }
        
        // Click della start screen già gestiti nel blocco sopra quando visibile
        
        // Gestisci click sul quest tracker PRIMA di tutto (priorità massima)
        if (this.input.isLeftClickJustReleased() && mouseOverQuestTracker) {
            console.log('🖱️ CLICK RILEVATO - QuestTracker minimized:', this.questTracker.minimized, 'mousePos:', mousePos);
            
            // Se il quest tracker è minimizzato, gestisci il click per aprire/chiudere
            if (this.questTracker.minimized) {
                console.log('✅ QUEST TRACKER MINIMIZZATO - APERTURA');
                this.questTracker.toggleMinimized();
                this.input.resetLeftClickReleased();
                // Imposta il flag per bloccare il movimento in questo frame
                uiEventHandled = true;
                return; // Salta tutto il resto
            } else {
                console.log('❌ QUEST TRACKER NON MINIMIZZATO - CONTINUANDO');
                // Se è espanso, controlla se è un click valido (non un drag)
                if (this.questTracker.handleMouseRelease()) {
                    // È un click valido, gestiscilo
                    const handled = this.questTracker.handleClick(mousePos.x, mousePos.y);
                    if (handled) {
                        this.input.resetLeftClickReleased();
                        uiEventHandled = true;
                        return; // Salta tutto il resto
                    }
                } else {
                    // È stato un drag, resetta solo il flag
                    this.input.resetLeftClickReleased();
                    uiEventHandled = true;
                    return; // Salta tutto il resto
                }
            }
        }
        
        // Gestisci click sul profile panel (priorità alta)
        if (this.input.isLeftClickJustReleased() && this.profilePanel.isMouseOver(mousePos.x, mousePos.y)) {
            console.log('🖱️ CLICK RILEVATO - ProfilePanel visible:', this.profilePanel.visible, 'mousePos:', mousePos);
            
            // Se il profile panel è chiuso, gestisci il click per aprire
            if (!this.profilePanel.visible) {
                console.log('✅ PROFILE PANEL CHIUSO - APERTURA');
                this.profilePanel.visible = true;
                this.input.resetLeftClickReleased();
                uiEventHandled = true;
                return; // Salta tutto il resto
            } else {
                console.log('❌ PROFILE PANEL APERTO - CONTINUANDO');
                // Se è aperto, controlla se è un click valido (non un drag)
                if (this.profilePanel.handleMouseRelease()) {
                    // È un click valido, gestiscilo
                    const handled = this.profilePanel.handleClick(mousePos.x, mousePos.y);
                    if (handled) {
                        this.input.resetLeftClickReleased();
                        uiEventHandled = true;
                        return; // Salta tutto il resto
                    }
                } else {
                    // È stato un drag, resetta solo il flag
                    this.input.resetLeftClickReleased();
                    uiEventHandled = true;
                    return; // Salta tutto il resto
                }
            }
        }
        
        // Gestisci eventi UI PRIMA di tutto
        uiEventHandled = this.handleUIEvents(mousePos, mouseOverUIIcon, mouseOverQuestTracker);
        
        // Se un evento UI è stato gestito, salta la logica di gioco
        if (uiEventHandled) {
            return;
        }
        
        // === GESTIONE EVENTI DI GIOCO (PRIORITÀ BASSA) ===
        this.handleGameEvents(mousePos, uiEventHandled);
        
        // Aggiorna la nave solo se nessun evento UI è stato gestito
        if (!uiEventHandled) {
            // console.log('🚀 NAVE AGGIORNATA - uiEventHandled:', uiEventHandled);
            this.ship.update();
            this.ship.updateSprite();
            this.ship.updateTrail();
        } else {
            // console.log('🚫 NAVE NON AGGIORNATA - uiEventHandled:', uiEventHandled);
        }
        
        // Aggiorna la camera (sempre, ma solo se la nave si è mossa)
        this.camera.update(this.ship);
        
        // Invia movimento al server multiplayer (ogni 5 frame per ridurre traffico)
        if (this.isOnlineMode && this.frameCount % 5 === 0) {
            this.sendPlayerMove();
        }
        
        // Aggiorna la ModernSkillbar
        this.categorySkillbar.update();
        
        // Aggiorna popup del pannello Home
        if (this.homePanel.visible) {
            this.homePanel.updatePopup(16); // 16ms = ~60fps
        }
        
        // Aggiorna pannello salvataggio/caricamento
        if (this.saveLoadPanel.isOpen) {
            this.saveLoadPanel.update();
        }
        
        
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
        
        // Aggiorna i droni UAV (follow nave, formazione, rotazione)
        if (this.droneManager) {
            this.droneManager.update(16); // ~60fps
        }
        
        // Aggiorna quest tracker
        this.questTracker.update();
        
        // Aggiorna profile panel
        this.profilePanel.update();
        
        // Aggiorna il sistema icone UI
        this.updateIconSystemUI();
        
        // Aggiorna il nuovo sistema unificato icone UI
        this.uiManager.update();
        
        
        // Gestisce mouse move per tooltip
        this.uiManager.handleMouseMove(mousePos.x, mousePos.y);
        
        // Aggiorna il sistema di mappe e portali
        this.mapManager.update();
        
        // Aggiorna il sistema di radiazione
        const currentMap = this.mapManager.getCurrentMap();
        this.radiationSystem.update(this.ship, currentMap.width, currentMap.height, Date.now());
        
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
        
        
        
        // Gestisci click su popup di morte
        if (this.input.isMouseJustPressed()) {
            const mousePos = this.input.getMousePosition();
            if (this.deathPopup.handleClick(mousePos.x, mousePos.y, this.ship, this.width, this.height)) {
                this.input.resetMouseJustPressed();
                return; // Click gestito dal popup
            }
        }
        
        
        // Gestisci movimento del mouse per l'inventario
        if (this.inventory.isOpen) {
            const mousePos = this.input.getMousePosition();
            this.inventory.handleMouseMove(mousePos.x, mousePos.y, this.width, this.height);
        }
        
        // Gestione eventi UI spostata in handleUIEvents()
        
        // Gestione eventi UI spostata in handleUIEvents()
        
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
        
        
        // Gestisci click su elementi UI (incluso logout button)
        if (this.input.isLeftClickJustReleased()) {
            const mousePos = this.input.getMousePosition();
            if (this.uiManager.handleClick(mousePos.x, mousePos.y)) {
                this.input.resetLeftClickReleased();
                return; // Click gestito dal sistema UI
            }
        }
        
        // Gestisci click nel pannello home
        if (this.homePanel.visible && this.input.isLeftClickJustReleased()) {
            const mousePos = this.input.getMousePosition();
            const handled = this.homePanel.handleClick(mousePos.x, mousePos.y);
            if (handled) {
                this.input.resetLeftClickReleased();
                return; // Click gestito dal pannello
            }
        }
        
        // Gestisci click nel pannello salvataggio/caricamento
        if (this.saveLoadPanel.isOpen && this.input.isMouseJustPressed()) {
            const mousePos = this.input.getMousePosition();
            if (this.saveLoadPanel.handleClick(mousePos.x, mousePos.y)) {
                this.input.resetMouseJustPressed();
                return; // Click gestito dal pannello
            }
        }
        
        
        // Gestisci click nel quest tracker (inizio drag)
        if (this.input.isMouseJustPressed() && mouseOverQuestTracker) {
            const mousePos = this.input.getMousePosition();
            if (this.questTracker.startDrag(mousePos.x, mousePos.y)) {
                this.input.resetMouseJustPressed();
                return; // Drag iniziato
            }
            
        }
        
        // Gestione eventi UI spostata in handleUIEvents()
        

        
        

        

        

        

        
        // Gestisci drag degli slider nel pannello impostazioni
        if (this.settingsPanel.isOpen && this.input.isMouseDown()) {
            const mousePos = this.input.getMousePosition();
            this.settingsPanel.handleMouseMove(mousePos.x, mousePos.y);
        }
        
        // Gestisci drag del quest tracker
        if (this.questTracker.isDragging && this.input.isMouseDown()) {
            const mousePos = this.input.getMousePosition();
            this.questTracker.handleMouseMove(mousePos.x, mousePos.y);
        }
        
        // Gestisci drag del profile panel
        if (this.profilePanel.isDragging && this.input.isMouseDown()) {
            const mousePos = this.input.getMousePosition();
            this.profilePanel.handleMouseMove(mousePos.x, mousePos.y);
        }
        
        
        // Gestisci movimento mouse nel pannello home
        if (this.homePanel.visible) {
            const mousePos = this.input.getMousePosition();
            this.homePanel.handleMouseMove(mousePos.x, mousePos.y);
        }
        
        // Gestisci inizio drag del profile panel (quando si clicca sulla barra del titolo)
        if (this.input.isMouseJustPressed() && this.profilePanel.visible && this.profilePanel.isMouseOver(mousePos.x, mousePos.y)) {
            if (this.profilePanel.startDrag(mousePos.x, mousePos.y)) {
                console.log('✅ DRAG PROFILE PANEL INIZIATO');
                this.input.resetMouseJustPressed();
                return; // Drag iniziato
            }
        }
        
        // Gestisci drag del pannello home (rimosso - HomePanel non supporta drag)
        // if (this.homePanel.isOpen && this.input.isMouseDown()) {
        //     const mousePos = this.input.getMousePosition();
        //     this.homePanel.handleMouseMove(mousePos.x, mousePos.y);
        // }
        
        // Rimuovo gestione rotella per thumbnail - solo frecce cliccabili
        
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
        

        
        // Reset del flag click appena premuto (spostato alla fine)
        // this.input.resetMouseJustPressed();
        
        

        
        // Gestione eventi di gioco spostata in handleGameEvents()
        

        
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
                
                // Mostra notifica di target selezionato con nome specifico
                const enemyName = clickedEnemy.config ? clickedEnemy.config.name : clickedEnemy.type;
                this.notifications.targetSelected(enemyName);
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
            this.ship.addResource('credits', 10000);
        }
        
        // Comando per aggiungere uridium (tasto U)
        if (this.input.isKeyJustPressed('KeyU')) {
            this.ship.addResource('uridium', 100);
        }
        
        // Comando per aggiungere onore (tasto O)
        if (this.input.isKeyJustPressed('KeyO')) {
            this.ship.addResource('honor', 500);
        }
        
        // Comando per mostrare/nascondere il range di attacco (tasto R)
        if (this.input.isKeyJustPressed('KeyR')) {
            this.ship.showAttackRange = !this.ship.showAttackRange;
            this.notifications.add(this.ship.showAttackRange ? 'Range di attacco: VISIBILE' : 'Range di attacco: NASCOSTO', 'info');
        }
        
        // Comando per aggiungere esperienza (tasto X)
        if (this.input.isKeyJustPressed('KeyX')) {
            this.ship.addResource('experience', 1000);
        }
        
        // Le skills ora sono gestite dalla CategorySkillbar
        
        // Comando per cambiare nickname (tasto N)
        if (this.input.isKeyJustPressed('KeyN')) {
            const newNickname = prompt('Inserisci il tuo nickname:', this.playerProfile.getNickname());
            if (newNickname && newNickname.trim().length > 0) {
                this.playerProfile.setNickname(newNickname.trim());
                this.notifications.add(`Nickname cambiato in: ${this.playerProfile.getNickname()}`, 3000, 'success');
            }
        }
        
        // Comando per connettersi al multiplayer (tasto M)
        if (this.input.isKeyJustPressed('KeyM')) {
            if (!this.isOnlineMode) {
                this.connectToServer();
                this.notifications.add("Tentativo di connessione al server multiplayer...", 3000, 'info');
            } else {
                this.notifications.add("Già connesso al server multiplayer", 3000, 'info');
            }
        }
        
        // Comando per aprire/chiudere inventario (tasto I)
        if (this.input.isKeyJustPressed('KeyI')) {
            this.inventory.toggle();
        }
        
        
        // Comando per aprire/chiudere sistema mappe (tasto M)
        if (this.input.isKeyJustPressed('KeyM') && this.mapSystem) {
            console.log('🗺️ Toggle MapSystem');
            this.mapSystem.toggle();
        }
        
        // Comando per aprire/chiudere pannello Home (tasto Home)
        if (this.input.isKeyJustPressed('Home')) {
            this.homePanel.toggle();
        }
        
        // Gestore duplicato rimosso - gestito sopra
        
        // Gestisci click sui nodi del sistema mappe (PRIORITÀ ALTA)
        if (this.mapSystem && this.mapSystem.isOpen && this.input.isLeftClickJustReleased()) {
            const mousePos = this.input.getMousePosition();
            const handled = this.mapSystem.handleClick(mousePos.x, mousePos.y, this.mapManager.currentMap, this.mapManager);
            if (handled) {
                this.input.resetLeftClickReleased();
                return; // Esce dalla funzione per evitare altri gestori
            }
        }
        

        

        
        // Gestisci click sui pulsanti di upgrade
        if (this.input.isLeftClickJustReleased() && this.upgradePanelOpen) {
            const mousePos = this.input.getMousePosition();
            this.handleUpgradeClick(mousePos.x, mousePos.y);
            // Reset del flag per evitare spam
            this.input.resetLeftClickReleased();
        }
        
        // Gestisci click sulla ModernSkillbar
        if (this.input.isMouseJustPressed() && !this.upgradePanelOpen && !this.settingsPanel.isOpen && !this.spaceStationPanel.isOpen && !this.inventory.isOpen) {
            const mousePos = this.input.getMousePosition();
            
            // Controlla se il mouse è sopra la skillbar
            if (this.isClickOnCategorySkillbar(mousePos.x, mousePos.y)) {
                const movementDistance = this.input.mouse.movementDistance || 0;
                
                // Se è navigazione (movimento > 5px), resetta il click e non gestire
                if (movementDistance > 5) {
                    this.input.resetMouseJustPressed();
                    return;
                }
                
                // Se è un click effettivo, gestisci il click sulla skillbar
                const handled = this.handleCategorySkillbarClick(mousePos.x, mousePos.y);
                if (handled) {
                    this.input.resetMouseJustPressed(); // Reset dopo l'uso
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
        
        // Gestisci zoom con rotella del mouse (solo se l'inventario e il pannello home non sono aperti)
        if (this.input.hasWheelMovement() && !this.inventory.isOpen && !this.homePanel.visible) {
            if (this.input.mouse.wheelDelta > 0) {
                this.camera.zoomIn();
            } else if (this.input.mouse.wheelDelta < 0) {
                this.camera.zoomOut();
            }
            this.input.resetWheelDelta();
        }
        
        // Gestisci scroll delle quest se il pannello home è aperto
        if (this.input.hasWheelMovement() && this.homePanel.visible && this.homePanel.selectedCategory === 'quest') {
            const handled = this.homePanel.handleQuestScroll(this.input.mouse.wheelDelta);
            if (handled) {
                this.input.resetWheelDelta();
            }
        }
        
        // Gestione scroll per Quest Tracker (solo se mouse è sopra il tracker)
        if (this.input.hasWheelMovement() && this.questTracker.visible && !this.questTracker.minimized && this.questTracker.mouseOverTracker) {
            const handled = this.questTracker.handleWheelScroll(this.input.mouse.wheelDelta);
            if (handled) {
                this.input.resetWheelDelta();
            }
        }
        
        // Gestione scroll per UAV (solo se l'inventario è aperto e siamo nella tab UAV)
        if (this.input.hasWheelMovement() && this.inventory.isOpen && this.inventory.currentTab === 'uav') {
            this.inventory.handleUAVScroll(this.input.mouse.wheelDelta);
            this.input.resetWheelDelta();
        }
        
        // Reset del flag click appena premuto (alla fine di tutti i gestori)
        this.input.resetMouseJustPressed();
    }
    
    updateCombat() {
        // Aggiorna combattimento della nave (solo se non è morta)
        if (this.ship.isDead) {
            return;
        }
        
        const combatResult = this.ship.updateCombat(this.explosionManager);

        
        // Controlla se un nemico è stato distrutto
        if (combatResult && combatResult.enemyDestroyed) {
            // Mostra prima la notifica di nemico distrutto
            const enemyName = combatResult.enemyName || combatResult.enemyType;
            this.notifications.enemyDestroyed(enemyName);
            
            // Poi processa i reward (RewardManager gestisce le notifiche delle ricompense)
            const enemyConfig = combatResult.enemyConfig || this.ship.getEnemyConfig(combatResult.enemyType);
            this.ship.processEnemyKill(combatResult.enemyType, enemyConfig);
            
            // Aggiorna il progresso delle quest
            this.homePanel.updateQuestProgress();
            this.questTracker.updateActiveQuests();
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
        
        // Controlli per il sistema di salvataggio
        // Tasto F3 per debug nave
        if (this.input.isKeyJustPressed('F3')) {
            this.ship.toggleDebug();
        }
        
        // Tasto F5 per salvare
        if (this.input.isKeyJustPressed('F5')) {
            this.saveSystem.save();
        }
        
        // Tasto F9 per caricare
        if (this.input.isKeyJustPressed('F9')) {
            this.saveSystem.load();
        }
        
        // Tasto F6 per aprire pannello salvataggio
        if (this.input.isKeyJustPressed('F6')) {
            this.saveLoadPanel.open('save');
        }
        
        // Tasto F7 per aprire pannello caricamento
        if (this.input.isKeyJustPressed('F7')) {
            this.saveLoadPanel.open('load');
        }
        
        // Tasto F8 per aprire pannello home (ora include fazioni)
        if (this.input.isKeyJustPressed('F8')) {
            this.homePanel.toggle();
            if (this.homePanel.visible) {
                this.homePanel.selectedCategory = 'factions';
            }
        }
        
        // Aggiorna notifiche di zona
        this.zoneNotifications.update();
        
        // Spawn nemici (disabilitato - ora gestito da MapInstance)
        // this.spawnEnemies();
        
        // Spawn bonus box
        this.spawnBonusBoxes();
        
        // Aggiorna notifiche
        this.notifications.update();
        
        // Aggiorna i numeri di danno
        this.damageNumbers.update();
        

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
                
                // Tracking per quest
                this.ship.bonusBoxesCollected++;
                console.log(`📦 Bonus Box raccolta! Totale: ${this.ship.bonusBoxesCollected}`);
                
                box.collect(this.ship);
                
                // Aggiorna il progresso delle quest
                this.homePanel.updateQuestProgress();
                this.questTracker.updateActiveQuests();
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
    // Sistema di spawning nemici rimosso - ora gestito da MapInstance
    
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
        
        // Disegna la schermata di selezione iniziale se visibile
        if (this.startScreen.isVisible) {
            this.startScreen.draw(this.ctx);
            return; // Non disegnare il gioco se la start screen è visibile
        }
        
        // Il pulsante di logout verrà disegnato alla fine, dopo tutti gli altri elementi UI
        
        
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
        
        // Disegna stazione spaziale solo se presente nella mappa corrente
        if (this.mapManager.shouldShowSpaceStation()) {
            this.spaceStation.draw(this.ctx, this.camera);
        }
        
        // Disegna asteroidi interattivi
        for (let asteroid of this.interactiveAsteroids) {
            asteroid.draw(this.ctx, this.camera);
        }
        
        // Disegna i portali (prima della nave per il layering corretto)
        this.mapManager.draw(this.ctx, this.camera);
        
        // Disegna la nave
        this.renderer.drawShip(this.ship, this.camera);
        
        // Disegna altri giocatori online
        this.renderOnlinePlayers();
        
        // Disegna droni del DroneManager (sprite iris)
        if (this.droneManager) {
            this.droneManager.draw(this.ctx, this.camera);
        }
        

        // Disegna i droni UAV semplici
        if (this.inventory && this.inventory.equipment && this.inventory.equipment.uav && this.inventory.equipment.uav.length > 0) {
            // Sostituito dai droni gestiti dal DroneManager (sprite iris)
            // this.renderer.drawUAVDrones(this.ship, this.camera, this.inventory);
        }
        
        // Sistema droni semplificato - gestito dal Renderer
        
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
        
        // Badge build (overlay in alto a destra)
        this.drawBuildBadge();
        
        // Disegna la minimappa (separata dal renderer, non influenzata dallo zoom)
        this.minimap.draw(this.ctx, this.ship, this.camera, this.enemies, this.sectorSystem, this.spaceStation, this.interactiveAsteroids, this.mapManager);
        
        // Disegna i portali nella minimappa
        this.mapManager.drawMinimap(this.ctx, this.minimap);
        
        // Disegna le notifiche di zona (sotto)
        this.drawZoneNotifications();
        
        // Disegna le notifiche (sempre sopra tutto, non influenzate dallo zoom)
        this.notifications.draw(this.ctx);
        
        // Disegna i numeri di danno
        this.damageNumbers.draw(this.ctx, this.camera);
        
        // Aggiorna e disegna il pannello della stazione spaziale solo se presente nella mappa
        if (this.mapManager.shouldShowSpaceStation()) {
            if (this.spaceStationPanel.isOpen) {
                this.spaceStationPanel.update();
            }
            this.spaceStationPanel.draw(this.ctx, this.canvas.width, this.canvas.height, this.ship.upgradeManager);
        }
        

        
        // Disegna CategorySkillbar (non influenzata dallo zoom)
        this.drawCategorySkillbar();
        
        
        // Disegna pannello impostazioni se aperto
        this.settingsPanel.draw(this.ctx);
        
        // Disegna pannello home se aperto
        this.homePanel.draw(this.ctx);
        
        // Disegna pannello salvataggio/caricamento se aperto
        this.saveLoadPanel.draw(this.ctx);
        
        
        // Disegna sistema mappe se aperto
        if (this.mapSystem) {
            this.mapSystem.draw(this.ctx, this.mapManager.currentMap);
        }
        
        // Disegna sistema icone UI DOPO i pannelli (per evitare che l'overlay le oscuri)
        // this.drawIconSystemUI(); // Temporaneamente disabilitato per testare il nuovo sistema
        
        // Disegna il nuovo sistema unificato icone UI
        this.uiManager.draw(this.ctx);
        
        // Disegna pannello potenziamenti se aperto
        if (this.upgradePanelOpen) {

            this.drawUpgradePanel();
        }
        
        // Disegna popup di morte (sempre sopra tutto)
        this.deathPopup.draw(this.ctx, this.width, this.height);
        
        // Disegna inventario
        this.inventory.draw(this.ctx, this.width, this.height);
        
        // Disegna quest tracker
        this.questTracker.draw(this.ctx);
        
        // Disegna profile panel
        this.profilePanel.draw(this.ctx);
        
        // Disegna pannello quest se aperto
        
        // Il pulsante di logout è ora gestito dal UIManager
        
        // Badge build in alto a destra
        this.ctx.save();
        this.ctx.font = 'bold 12px Inter, Arial, sans-serif';
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'top';
        this.ctx.fillStyle = (this.buildLabel && this.buildLabel.color) ? this.buildLabel.color : '#9aa4b2';
        const labelText = (this.buildLabel && this.buildLabel.text) ? this.buildLabel.text : 'PRE-ALPHA BUILD';
        this.ctx.globalAlpha = 0.9;
        this.ctx.fillText(labelText, this.canvas.width - 14, 14);
        this.ctx.restore();
    }
    
    // Inizializza l'inventario (nessun mock)
    initializeInventory() {
        // Intenzionalmente vuoto: niente dati mock in inventario
        return;
    }
    
    // Controlla l'interazione con la stazione spaziale
    checkSpaceStationInteraction() {
        // Controlla se la stazione è presente nella mappa corrente
        if (!this.mapManager.shouldShowSpaceStation()) {
            return;
        }
        
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
        
        // Costruisci il testo del nickname con clan tag
        let nickname = `${currentRank.symbol} `;
        
        // Aggiungi clan tag se il giocatore è in un clan
        if (this.ship.clan.isInClan && this.ship.clan.tag) {
            nickname += `[${this.ship.clan.tag}] `;
        }
        
        nickname += this.playerProfile.getNickname();
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(nickname, screenPos.x, screenPos.y + offsetY);
        
        // Aggiungi pallino colorato della fazione se il giocatore è in una fazione
        const currentFaction = this.factionSystem?.getCurrentFaction();
        if (currentFaction) {
            const textWidth = this.ctx.measureText(nickname).width;
            const dotX = screenPos.x + textWidth/2 + 8; // 8px di spazio dal testo
            const dotY = screenPos.y + offsetY - 2; // Allineato con il testo
            
            // Disegna il pallino colorato
            this.ctx.fillStyle = currentFaction.color;
            this.ctx.beginPath();
            this.ctx.arc(dotX, dotY, 4, 0, 2 * Math.PI);
            this.ctx.fill();
        }
        
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
    
    // Controlla se il click è sulla ModernSkillbar
    isClickOnCategorySkillbar(mouseX, mouseY) {
        // Posizione della skillbar
        const x = (this.width - 600) / 2; // 600 è la larghezza della skillbar
        const y = this.height - 80; // 80px dal basso
        const barWidth = 600;
        const barHeight = 60;
        
        // Zona di sicurezza
        const skillbarMargin = 5;
        let skillbarLeft = x - skillbarMargin;
        let skillbarRight = x + barWidth + skillbarMargin;
        let skillbarTop = y - skillbarMargin;
        let skillbarBottom = y + barHeight + skillbarMargin;
        
        // Se la skillbar è espansa, estendi i bounds per includere le categorie e armi
        if (this.categorySkillbar.isExpanded) {
            skillbarBottom = y + barHeight + 200; // Altezza aggiuntiva per categorie e armi
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
    
    // Gestisce tutti gli eventi UI con priorità alta
    handleUIEvents(mousePos, mouseOverUIIcon, mouseOverQuestTracker) {
        // Gestisci click sul nuovo sistema unificato icone UI (PRIORITÀ MASSIMA)
        if (this.input.isLeftClickJustReleased()) {
            const movementDistance = this.input.mouse.movementDistance || 0;
            
            if (movementDistance <= 5) {
                // Controlla se il click è su una icona del nuovo sistema
                if (this.uiManager.handleClick(mousePos.x, mousePos.y)) {
                    this.input.resetLeftClickReleased();
                    return true; // Evento UI gestito
                }
            }
        }
        
        // Gestisci click sulle icone UI vecchie (per compatibilità)
        if (this.input.isLeftClickJustReleased()) {
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
                    return true; // Evento UI gestito
                }
            }
        }
        
        // Gestisci click sull'inventario
        if (this.input.isLeftClickJustReleased() && this.inventory.isOpen) {
            if (this.inventory.handleClick(mousePos.x, mousePos.y, this.width, this.height)) {
                this.input.resetLeftClickReleased();
                return true; // Evento UI gestito
            }
        }
        
        // Gestisci click nel quest tracker (click normale) - PRIORITÀ ALTA
        if (this.input.isLeftClickJustReleased() && this.questTracker.isMouseOverTracker(mousePos.x, mousePos.y)) {
            // Controlla se è un click valido (non un drag)
            if (this.questTracker.handleMouseRelease()) {
                // È un click valido, gestiscilo
                const handled = this.questTracker.handleClick(mousePos.x, mousePos.y);
                if (handled) {
                    this.input.resetLeftClickReleased();
                    return true; // Evento UI gestito
                }
            } else {
                // È stato un drag, resetta solo il flag
                this.input.resetLeftClickReleased();
                return true; // Evento UI gestito
            }
        }
        
        // Gestisci click nel profile panel - PRIORITÀ ALTA
        if (this.input.isLeftClickJustReleased() && this.profilePanel.isMouseOver(mousePos.x, mousePos.y)) {
            // Controlla se è un click valido (non un drag)
            if (this.profilePanel.handleMouseRelease()) {
                // È un click valido, gestiscilo
                const handled = this.profilePanel.handleClick(mousePos.x, mousePos.y);
                if (handled) {
                    this.input.resetLeftClickReleased();
                    return true; // Evento UI gestito
                }
            } else {
                // È stato un drag, resetta solo il flag
                this.input.resetLeftClickReleased();
                return true; // Evento UI gestito
            }
        }
        
        // Gestisci drag del profile panel (rimosso - gestito nel metodo principale)
        // if (this.profilePanel.isDragging && this.input.isMouseDown()) {
        //     this.profilePanel.handleMouseMove(mousePos.x, mousePos.y);
        //     return true; // Evento UI gestito
        // }
        
        // Gestisci altri eventi UI...
        // (altri pannelli, pulsanti, ecc.)
        
        return false; // Nessun evento UI gestito
    }
    
    // Gestisce tutti gli eventi di gioco con priorità bassa
    handleGameEvents(mousePos, uiEventHandled = false) {
        // Gestisci input per il movimento continuo (solo se non si è sopra le icone UI o il quest tracker)
        if (this.input.isMouseDown() && !uiEventHandled && !this.upgradePanelOpen && !this.settingsPanel.isOpen && !this.settingsPanel.draggingSlider && !this.spaceStationPanel.isOpen && !this.inventory.isOpen && !this.homePanel.visible && !(this.mapSystem && this.mapSystem.isOpen)) {
            // Non muovere se il click è sulla skillbar E non è navigazione (movimento > 5px)
            if (this.isClickOnCategorySkillbar(mousePos.x, mousePos.y)) {
                const movementDistance = this.input.mouse.movementDistance || 0;
                if (movementDistance <= 5) {
                    return; // Solo se è un click effettivo, non navigazione
                }
                // Se è navigazione (movimento > 5px), continua il movimento anche sopra la skillbar
            }
            
            // NON muovere se il click è sull'icona del QuestTracker O se il QuestTracker è in drag
            if (this.questTracker.isMouseOverTracker(mousePos.x, mousePos.y) || this.questTracker.isDragging) {
                console.log('🚫 CLICK/DRAG SU QUEST TRACKER - BLOCCANDO MOVIMENTO');
                return; // Blocca il movimento
            }
            
            // NON muovere se il click è su una icona del nuovo sistema UI
            if (this.uiManager.isMouseOverAnyIcon(mousePos.x, mousePos.y)) {
                console.log('🚫 CLICK SU ICONA UI - BLOCCANDO MOVIMENTO');
                return; // Blocca il movimento
            }
            
            // NON muovere se il click è sul profile panel
            if (this.profilePanel.isMouseOver(mousePos.x, mousePos.y) || this.profilePanel.isDragging) {
                console.log('🚫 CLICK/DRAG SU PROFILE PANEL - BLOCCANDO MOVIMENTO');
                return; // Blocca il movimento
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
        
        // Gestisci click per movimento del player (solo se non ci sono click sui pannelli UI)
        if (this.input.isLeftClickJustReleased() && !uiEventHandled && !this.upgradePanelOpen && !this.settingsPanel.isOpen && !this.spaceStationPanel.isOpen && !this.inventory.isOpen && !this.homePanel.visible && !(this.mapSystem && this.mapSystem.isOpen)) {
            // Non muovere se il click è sulla skillbar E non è navigazione (movimento > 5px)
            if (this.isClickOnCategorySkillbar(mousePos.x, mousePos.y)) {
                const movementDistance = this.input.mouse.movementDistance || 0;
                if (movementDistance <= 5) {
                    this.input.resetLeftClickReleased();
                    return; // Solo se è un click effettivo, non navigazione
                }
                // Se è navigazione (movimento > 5px), continua il movimento anche sopra la skillbar
            }
            
            // NON muovere se il click è sull'icona del QuestTracker O se il QuestTracker è in drag
            if (this.questTracker.isMouseOverTracker(mousePos.x, mousePos.y) || this.questTracker.isDragging) {
                console.log('🚫 CLICK/DRAG SU QUEST TRACKER - BLOCCANDO MOVIMENTO');
                this.input.resetLeftClickReleased();
                return; // Blocca il movimento
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
            
            // Reset del click per evitare gestione duplicata
            this.input.resetLeftClickReleased();
        }
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
                    case 'home':
                        this.homePanel.toggle();
                        break;
                }
            }
        });
    }
    
    gameLoop() {
        try {
            this.update();
            this.render();
            requestAnimationFrame(() => this.gameLoop());
        } catch (error) {
            console.error('❌ Error in game loop:', error);
            // Riavvia il game loop dopo un errore
            setTimeout(() => this.gameLoop(), 100);
        }
    }
    
    /**
     * Resetta il gioco per iniziare una nuova partita
     */
    // === METODI MULTIPLAYER ===
    
    initMultiplayerEvents() {
        const eventSystem = this.onlineManager.getEventSystem();
        
        // Eventi di connessione
        eventSystem.on('network:connected', () => {
            console.log('🌐 Connesso al server multiplayer');
            this.isOnlineMode = true;
            this.notifications.add('🌐 Connesso al server multiplayer!', 3000, 'success');
            this.joinGame();
        });
        
        eventSystem.on('network:disconnected', () => {
            console.log('🔌 Disconnesso dal server multiplayer');
            this.isOnlineMode = false;
            this.notifications.add('🔌 Disconnesso dal server multiplayer', 3000, 'warning');
        });
        
        eventSystem.on('network:error', () => {
            console.log('❌ Errore di connessione multiplayer');
            this.isOnlineMode = false;
            this.notifications.add('❌ Errore di connessione multiplayer', 3000, 'error');
        });
        
        // Eventi giocatori
        eventSystem.on('sync:player:joined', (data) => {
            this.handlePlayerJoined(data);
        });
        
        eventSystem.on('sync:player:left', (data) => {
            this.handlePlayerLeft(data);
        });
        
        eventSystem.on('sync:player:moved', (data) => {
            this.handlePlayerMoved(data);
        });
        
        eventSystem.on('sync:player:attacked', (data) => {
            this.handlePlayerAttacked(data);
        });
        
        eventSystem.on('sync:player:updated', (data) => {
            this.handlePlayerUpdated(data);
        });
        
        eventSystem.on('sync:player:join:success', (data) => {
            this.handlePlayerJoinSuccess(data);
        });
    }
    
    connectToServer(serverUrl = null) {
        const defaultUrl = this.onlineManager.getNetworkManager().getDefaultServerUrl();
        const url = serverUrl || defaultUrl;
        console.log('🔌 Tentativo di connessione al server:', url);
        this.onlineManager.connectToServer(url);
    }
    
    joinGame() {
        if (!this.isOnlineMode) return;
        
        const playerData = {
            playerId: this.playerId || this.generatePlayerId(),
            nickname: this.playerProfile.getNickname(),
            x: this.ship.x,
            y: this.ship.y,
            credits: this.ship.credits,
            uridium: this.ship.uridium,
            honor: this.ship.honor,
            level: this.ship.level,
            faction: this.factionSystem.getCurrentFaction()
        };
        
        this.playerId = playerData.playerId;
        
        this.onlineManager.getNetworkManager().sendAction('player:join', playerData);
        console.log('👤 Invio richiesta di join:', playerData);
    }
    
    sendPlayerMove() {
        if (!this.isOnlineMode) return;
        
        this.onlineManager.getNetworkManager().sendAction('player:move', {
            x: this.ship.x,
            y: this.ship.y
        });
    }
    
    sendPlayerAttack(targetId, damage) {
        if (!this.isOnlineMode) return;
        
        this.onlineManager.getNetworkManager().sendAction('player:attack', {
            targetId: targetId,
            damage: damage
        });
    }
    
    sendPlayerUpdate(data) {
        if (!this.isOnlineMode) return;
        
        this.onlineManager.getNetworkManager().sendAction('player:update', data);
    }
    
    handlePlayerJoined(data) {
        this.onlinePlayers.set(data.id, data);
        console.log('👤 Giocatore connesso:', data.nickname);
        this.notifications.add(`👤 ${data.nickname} si è unito al gioco`, 2000, 'info');
    }
    
    handlePlayerLeft(data) {
        this.onlinePlayers.delete(data.playerId);
        console.log('👋 Giocatore disconnesso:', data.playerId);
        this.notifications.add('👋 Un giocatore si è disconnesso', 2000, 'info');
    }
    
    handlePlayerMoved(data) {
        const player = this.onlinePlayers.get(data.playerId);
        if (player) {
            player.x = data.x;
            player.y = data.y;
        }
    }
    
    handlePlayerAttacked(data) {
        // Mostra effetto di attacco per altri giocatori
        if (data.playerId !== this.playerId) {
            console.log('⚔️ Giocatore attacca:', data);
        }
    }
    
    handlePlayerUpdated(data) {
        const player = this.onlinePlayers.get(data.playerId);
        if (player) {
            Object.assign(player, data);
        }
    }
    
    handlePlayerJoinSuccess(data) {
        this.playerId = data.playerId;
        console.log('✅ Join riuscito! Player ID:', this.playerId);
        
        // Sincronizza stato del gioco
        if (data.gameState) {
            this.syncGameState(data.gameState);
        }
    }
    
    syncGameState(gameState) {
        // Sincronizza stato del gioco con quello del server
        if (gameState.players) {
            this.onlinePlayers.clear();
            for (const [playerId, playerData] of Object.entries(gameState.players)) {
                if (playerId !== this.playerId) {
                    this.onlinePlayers.set(playerId, playerData);
                }
            }
        }
    }
    
    generatePlayerId() {
        return 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    renderOnlinePlayers() {
        if (!this.isOnlineMode) return;
        
        this.onlinePlayers.forEach((player, playerId) => {
            if (playerId === this.playerId) return; // Non renderizzare se stesso
            
            // Calcola posizione relativa alla camera
            const screenX = player.x - this.camera.x;
            const screenY = player.y - this.camera.y;
            
            // Renderizza solo se è visibile sullo schermo
            if (screenX > -50 && screenX < this.width + 50 && 
                screenY > -50 && screenY < this.height + 50) {
                
                // Disegna nave giocatore online
                this.ctx.save();
                this.ctx.translate(screenX, screenY);
                
                // Disegna nave semplice per altri giocatori
                this.ctx.fillStyle = '#00ff00';
                this.ctx.fillRect(-15, -10, 30, 20);
                
                // Disegna nickname
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(player.nickname, 0, -20);
                
                this.ctx.restore();
            }
        });
    }

    resetGame() {
        // Reset della nave
        this.ship.x = 8000;
        this.ship.y = 5000;
        this.ship.hp = this.ship.maxHP;
        this.ship.shield = this.ship.maxShield;
        this.ship.currentLevel = 1;
        this.ship.resources.experience = 0;
        this.ship.resources.credits = 100000;
        this.ship.resources.uridium = 5000;
        this.ship.resources.honor = 0;
        this.ship.resources.starEnergy = 100;
        this.ship.streunerKilled = 0;
        this.ship.bonusBoxesCollected = 0;
        this.ship.isDead = false;
        this.ship.active = true;
        
        // Reset equipaggiamento
        this.ship.equippedLasers = { lf1: 0, lf2: 0, lf3: 0, lf4: 0 };
        this.ship.ammunition = {
            laser: { x1: 1000, x2: 500, x3: 200, sab: 100 },
            missile: { r1: 50, r2: 25, r3: 10 }
        };
        this.ship.selectedLaser = 'x1';
        this.ship.selectedMissile = 'r1';
        
        // Reset clan
        this.ship.clan = {
            id: null,
            name: '',
            tag: '',
            role: 'none',
            joinedAt: null,
            isInClan: false
        };
        
        // Reset quest
        if (this.questTracker) {
            this.questTracker.activeQuests = [];
            this.questTracker.completedQuests = [];
        }
        
        // Reset inventario
        if (this.inventory) {
            this.inventory.items = [];
            this.inventory.equipment = {
                laser: new Array(3).fill(null),
                shieldGen: new Array(6).fill(null),
                extra: new Array(3).fill(null)
            };
        }
        
        // Reset mappa: usa la fazione corrente se disponibile
        if (this.mapManager) {
            const factionId = this.factionSystem?.currentFaction || null;
            const startingMaps = { venus: 'v1', mars: 'm1', eic: 'e1' };
            this.mapManager.currentMap = startingMaps[factionId] || 'v1';
        }
        
        // Reset camera
        this.camera.x = this.ship.x - this.width / 2;
        this.camera.y = this.ship.y - this.height / 2;
        
        // Pulisci nemici e bonus box
        this.enemies = [];
        this.bonusBoxes = [];
        
        // Notifica il giocatore
        if (this.notifications) {
            this.notifications.add('🆕 Nuovo gioco iniziato!', 3000, 'success');
        }
        
        console.log('🆕 Gioco resettato per nuova partita');
    }
}

// Avvia il gioco quando la pagina è caricata
window.addEventListener('load', () => {
    const game = new Game();
    
    // Mostra sempre la StartScreen all'avvio
    console.log('🎮 Avvio gioco - mostrando StartScreen');
    game.startScreen.show();
    
    // Avvia il game loop dopo un breve delay per permettere il caricamento degli asset
    setTimeout(() => {
        try {
            game.gameLoop();
        } catch (error) {
            console.error('❌ Error starting game loop:', error);
        }
    }, 1000); // 1 secondo di delay per permettere il caricamento degli asset
    
    // NON riprodurre suoni automaticamente - solo quando il gioco inizia davvero
});