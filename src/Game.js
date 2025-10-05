/**
 * Gioco Spaziale - Versione Refactorizzata
 * Utilizza la nuova architettura modulare e organizzata
 */
import { GameCore } from './core/GameCore.js';
import { GameLoop } from './core/GameLoop.js';
import { EventManager } from './core/EventManager.js';
import { Renderer } from './core/Renderer.js';
import { Camera } from './core/Camera.js';
import { Input } from './core/Input.js';

// Entities
import { Ship } from './entities/Ship.js';
import { Enemy } from './entities/Enemy.js';
import { Projectile } from './entities/Projectile.js';
import { Missile } from './entities/Missile.js';
import { BonusBox } from './entities/BonusBox.js';
import { SpaceStation } from './entities/SpaceStation.js';
import { InteractiveAsteroid } from './entities/InteractiveAsteroid.js';

// Systems
import { AudioManager } from './systems/AudioManager.js';
import { Inventory } from './systems/Inventory.js';
import { QuestTracker } from './systems/QuestTracker.js';
import { RankSystem } from './systems/RankSystem.js';
import { RewardManager } from './systems/RewardManager.js';
import { RadiationSystem } from './systems/RadiationSystem.js';
import { DroneManager } from './systems/DroneManager.js';

// UI
import { UIManager } from './ui/UIManager.js';
import { HomePanel } from './ui/HomePanel.js';
import { SettingsPanel } from './ui/SettingsPanel.js';
import { ProfilePanel } from './ui/ProfilePanel.js';
import { StarEnergyPanel } from './ui/panels/StarEnergyPanel.js';
import { StarEnergyIcon } from './ui/icons/StarEnergyIcon.js';
import { SpaceStationPanel } from './ui/SpaceStationPanel.js';
import { CategorySkillbar } from './ui/CategorySkillbar.js';

// World
import { World } from './world/World.js';
import { MapManager } from './world/MapManager.js';
import { MapSystem } from './world/MapSystem.js';
import { SectorSystem } from './world/SectorSystem.js';

// Utils
import { GameConfig } from './config/GameConfig.js';
import { GAME_EVENTS, GAME_STATES } from './utils/Constants.js';

// Moduli legacy (da refactorizzare in futuro)
import { Minimap } from '../modules/Minimap.js';
import { Notification } from '../modules/Notification.js';
import { ExplosionEffect } from '../modules/ExplosionEffect.js';
import { ParallaxBackground } from '../modules/ParallaxBackground.js';
import { AmbientEffects } from '../modules/AmbientEffects.js';
import { PlayerProfile } from '../modules/PlayerProfile.js';
import { ZoneNotification } from '../modules/ZoneNotification.js';
import { DeathPopup } from '../modules/DeathPopup.js';
import { Smartbomb } from '../modules/Smartbomb.js';
import { FastRepair } from '../modules/FastRepair.js';
import { EMP } from '../modules/EMP.js';
import { Leech } from '../modules/Leech.js';
import { InventoryItem } from '../modules/InventoryItem.js';
// import { IconSystemUI } from '../modules/IconSystemUI.js'; // legacy rimosso
import { MapInstance } from '../modules/MapInstance.js';
import { MapPersistence } from '../modules/MapPersistence.js';
import { Portal } from '../modules/Portal.js';
import { DamageNumberSystem } from '../modules/DamageNumbers.js';

export class Game {
    constructor() {
        console.log('🚁 Game.js: Constructor chiamato!');
        // Inizializza canvas e contesto
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Inizializza core systems
        this.gameCore = new GameCore();
        this.eventManager = new EventManager();
        this.renderer = new Renderer(this.canvas, this.width, this.height);
        this.gameLoop = new GameLoop(this.gameCore, this.renderer);
        
        // Inizializza sistemi core
        this.camera = new Camera(this.width, this.height);
        this.input = new Input(this.canvas);
        this.world = new World(this.width, this.height);
        
        // Registra sistemi nel core
        this.registerCoreSystems();
        
        // Inizializza entità
        this.initializeEntities();
        
        // Inizializza sistemi di gioco
        this.initializeSystems();
        
        // Inizializza UI
        this.initializeUI();
        
        // Inizializza mondo
        this.initializeWorld();
        
        // Inizializza sistemi legacy
        this.initializeLegacySystems();
        
        // Configura eventi
        this.setupEventHandlers();
        
        // Esponi globalmente per compatibilità
        window.gameInstance = this;
        
        // Avvia il gioco
        this.start();
    }

    /**
     * Registra i sistemi core nel GameCore
     */
    registerCoreSystems() {
        this.gameCore.registerSystem('camera', this.camera);
        this.gameCore.registerSystem('input', this.input);
        this.gameCore.registerSystem('world', this.world);
        this.gameCore.registerSystem('renderer', this.renderer);
    }

    /**
     * Inizializza le entità del gioco
     */
    initializeEntities() {
        // Nave principale
        this.ship = new Ship(
            GameConfig.SHIP.START_X, 
            GameConfig.SHIP.START_Y, 
            GameConfig.SHIP.SIZE, 
            this
        );
        
        // Entità del mondo
        this.enemies = [];
        this.bonusBoxes = [];
        this.spaceStation = new SpaceStation(
            GameConfig.WORLD.CENTER_X, 
            GameConfig.WORLD.CENTER_Y
        );
        
        // Asteroidi interattivi
        this.interactiveAsteroids = this.createInteractiveAsteroids();
    }

    /**
     * Inizializza i sistemi di gioco
     */
    initializeSystems() {
        console.log('🚁 Game.js: initializeSystems chiamato!');
        // Sistemi di gioco
        this.audioManager = new AudioManager();
        this.inventory = new Inventory();
        this.rankSystem = new RankSystem();
        this.rewardManager = new RewardManager();
        this.radiationSystem = new RadiationSystem();
        console.log('🚁 Game.js: Creando DroneManager...');
        this.droneManager = new DroneManager(this);
        console.log('🚁 Game.js: DroneManager creato:', this.droneManager);
        
        // Registra sistemi nel core
        this.gameCore.registerSystem('audio', this.audioManager);
        this.gameCore.registerSystem('inventory', this.inventory);
        this.gameCore.registerSystem('rankSystem', this.rankSystem);
        this.gameCore.registerSystem('rewardManager', this.rewardManager);
        this.gameCore.registerSystem('radiationSystem', this.radiationSystem);
        this.gameCore.registerSystem('droneManager', this.droneManager);
    }

    /**
     * Inizializza l'interfaccia utente
     */
    initializeUI() {
        // UI Manager
        this.uiManager = new UIManager(this);
        
        // Pannelli
        this.homePanel = new HomePanel(this);
        this.settingsPanel = new SettingsPanel(this);
        this.profilePanel = new ProfilePanel(this);
        this.spaceStationPanel = new SpaceStationPanel();
        this.categorySkillbar = new CategorySkillbar();
        this.starEnergyPanel = new StarEnergyPanel(this);
        
        // Configura skillbar
        this.categorySkillbar.setGame(this);
        
        // Registra sistemi UI nel core
        this.gameCore.registerSystem('uiManager', this.uiManager);
        this.gameCore.registerSystem('homePanel', this.homePanel);
        this.gameCore.registerSystem('settingsPanel', this.settingsPanel);
        this.gameCore.registerSystem('profilePanel', this.profilePanel);
        this.gameCore.registerSystem('spaceStationPanel', this.spaceStationPanel);
        this.gameCore.registerSystem('categorySkillbar', this.categorySkillbar);
        this.gameCore.registerSystem('starEnergyPanel', this.starEnergyPanel);

        // Inizializza UI Manager con le icone
        this.initUIManager();
    }

    /**
     * Inizializza il mondo di gioco
     */
    initializeWorld() {
        // Mappe e settori
        this.mapManager = new MapManager(this);
        this.mapSystem = new MapSystem();
        this.sectorSystem = new SectorSystem();
        
        // Registra sistemi mondo nel core
        this.gameCore.registerSystem('mapManager', this.mapManager);
        this.gameCore.registerSystem('mapSystem', this.mapSystem);
        this.gameCore.registerSystem('sectorSystem', this.sectorSystem);
    }

    /**
     * Inizializza i sistemi legacy (da refactorizzare)
     */
    initializeLegacySystems() {
        // Sistemi legacy
        this.minimap = new Minimap(this.width, this.height);
        this.notifications = new Notification();
        this.explosionManager = new ExplosionEffect();
        this.parallaxBackground = new ParallaxBackground(this.width, this.height);
        this.ambientEffects = new AmbientEffects(this.width, this.height);
        this.playerProfile = new PlayerProfile();
        this.zoneNotifications = new ZoneNotification();
        this.deathPopup = new DeathPopup();
        this.smartbomb = new Smartbomb();
        this.fastRepair = new FastRepair();
        this.emp = new EMP();
        this.leech = new Leech();
        this.damageNumbers = new DamageNumberSystem();
        
        // Inizializza RewardManager della nave
        this.ship.initRewardManager(this.notifications);
        
        // Sistema icone UI legacy
        this.iconSystemUI = [];
        
        // Inizializza audio
        this.initAudio();
    }

    /**
     * Crea asteroidi interattivi
     */
    createInteractiveAsteroids() {
        return [
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
    }

    // initIconSystemUI legacy rimosso (UIManager in uso)

    /**
     * Inizializza il nuovo sistema unificato icone UI
     */
    initUIManager() {
        const configs = UIManager.getDefaultConfigs();
        
        // Registra le icone con i pannelli associati
        this.questTracker = new QuestTracker(this);
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

        this.uiManager.registerIcon({
            ...configs.starenergy,
            panel: this.starEnergyPanel
        });
    }

    /**
     * Inizializza l'audio
     */
    initAudio() {
        this.audioManager.loadAllSounds();
        this.explosionManager.load();
        
        // Avvia la musica di sottofondo
        setTimeout(() => {
            this.audioManager.startBackgroundMusic();
        }, 1000);
        
        // Applica le impostazioni salvate
        this.settingsPanel.applyAudioSettings();
        
        // Inizializza inventario
        this.initializeInventory();
        
        // Carica l'inventario
        if (this.inventory.items.length === 0) {
            this.inventory.load();
        }
    }

    /**
     * Inizializza l'inventario
     */
    initializeInventory() {
        // Intenzionalmente vuoto: niente dati mock in inventario
        return;
    }

    /**
     * Configura i gestori di eventi
     */
    setupEventHandlers() {
        // Eventi di resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Eventi del gioco
        this.gameCore.on(GAME_EVENTS.GAME_START, () => {
            console.log('Game started');
        });
        
        this.gameCore.on(GAME_EVENTS.GAME_PAUSE, () => {
            console.log('Game paused');
        });
        
        this.gameCore.on(GAME_EVENTS.GAME_RESUME, () => {
            console.log('Game resumed');
        });
        
        // Configura callback della nave
        this.ship.onArrival = () => {
            this.minimap.clearTarget();
        };
    }

    /**
     * Avvia il gioco
     */
    start() {
        this.gameLoop.start();
        
        // Riproduci suono di system ready
        setTimeout(() => {
            if (this.audioManager) {
                this.audioManager.playSystemReadySound();
            }
        }, 1000);
    }

    /**
     * Ferma il gioco
     */
    stop() {
        this.gameLoop.stop();
    }

    /**
     * Pausa il gioco
     */
    pause() {
        this.gameLoop.pause();
    }

    /**
     * Riprendi il gioco
     */
    resume() {
        this.gameLoop.resume();
    }

    /**
     * Gestisce il ridimensionamento del canvas
     */
    handleResize() {
        const newWidth = this.canvas.clientWidth;
        const newHeight = this.canvas.clientHeight;
        
        this.width = newWidth;
        this.height = newHeight;
        
        // Aggiorna il renderer
        this.renderer.resize(newWidth, newHeight);
        
        // Aggiorna la camera
        this.camera.width = newWidth;
        this.camera.height = newHeight;
        
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

    /**
     * Ottiene le statistiche del gioco
     */
    getStats() {
        return {
            ...this.gameLoop.getStats(),
            entities: {
                enemies: this.enemies.length,
                bonusBoxes: this.bonusBoxes.length,
                projectiles: this.ship.projectiles.length,
                missiles: this.ship.missiles.length
            }
        };
    }

    /**
     * Pulisce le risorse del gioco
     */
    cleanup() {
        this.gameLoop.cleanup();
        this.gameCore.cleanup();
        this.eventManager.cleanup();
        this.renderer.cleanup();
        
        // Pulisci entità
        this.enemies = [];
        this.bonusBoxes = [];
        this.interactiveAsteroids = [];
        
        // Pulisci sistemi
        this.audioManager = null;
        this.inventory = null;
        this.questTracker = null;
        
        // Rimuovi riferimento globale
        window.gameInstance = null;
    }
}
