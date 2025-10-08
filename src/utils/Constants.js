/**
 * Costanti del gioco
 * Valori immutabili utilizzati in tutto il progetto
 */

// Eventi del gioco
export const GAME_EVENTS = {
    // Eventi di sistema
    GAME_START: 'game:start',
    GAME_PAUSE: 'game:pause',
    GAME_RESUME: 'game:resume',
    GAME_END: 'game:end',
    
    // Eventi del player
    PLAYER_MOVE: 'player:move',
    PLAYER_DEATH: 'player:death',
    PLAYER_RESPAWN: 'player:respawn',
    PLAYER_LEVEL_UP: 'player:levelup',
    
    // Eventi di combattimento
    COMBAT_START: 'combat:start',
    COMBAT_END: 'combat:end',
    ENEMY_DESTROYED: 'enemy:destroyed',
    DAMAGE_DEALT: 'damage:dealt',
    DAMAGE_TAKEN: 'damage:taken',
    
    // Eventi UI
    UI_PANEL_OPEN: 'ui:panel:open',
    UI_PANEL_CLOSE: 'ui:panel:close',
    UI_NOTIFICATION: 'ui:notification',
    
    // Eventi di risorse
    RESOURCE_CHANGED: 'resource:changed',
    ITEM_ACQUIRED: 'item:acquired',
    ITEM_USED: 'item:used'
};

// Tipi di notifiche
export const NOTIFICATION_TYPES = {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error',
    REWARD: 'reward',
    DEATH: 'death'
};

// Tipi di risorse
export const RESOURCE_TYPES = {
    CREDITS: 'credits',
    URIDIUM: 'uridium',
    HONOR: 'honor',
    EXPERIENCE: 'experience',
    STAR_ENERGY: 'starEnergy'
};

// Tipi di armi
export const WEAPON_TYPES = {
    LASER: 'laser',
    MISSILE: 'missile'
};

// Configurazione missili
export const MISSILE_CONFIG = {
    SPEED: 15, // Velocità base dei missili (aumentata)
    DAMAGE: 50, // Danno base dei missili
    FIRE_RATE: 180, // Frequenza di sparo (frame)
    LIFETIME: 120, // Durata massima (frame) - ridotta per missili più veloci
    MAX_COUNT: 3, // Numero massimo di missili contemporanei
    ACCELERATION: 0.5, // Velocità di accelerazione (aumentata)
    MIN_SPEED_FACTOR: 0.7 // Fattore di velocità minima (aumentato)
};

// Tipi di laser
export const LASER_TYPES = {
    X1: 'x1',
    X2: 'x2',
    X3: 'x3',
    SAB: 'sab'
};

// Tipi di missili
export const MISSILE_TYPES = {
    R1: 'r1',
    R2: 'r2',
    R3: 'r3'
};

// Tipi di nemici
export const ENEMY_TYPES = {
    NPC_X1: 'npc_x1',
    NPC_X2: 'npc_x2'
};

// Stati del gioco
export const GAME_STATES = {
    LOADING: 'loading',
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    DEAD: 'dead'
};

// Direzioni
export const DIRECTIONS = {
    UP: 'up',
    DOWN: 'down',
    LEFT: 'left',
    RIGHT: 'right'
};

// Colori del gioco
export const COLORS = {
    PRIMARY: '#4A90E2',
    SECONDARY: '#7ED321',
    WARNING: '#F5A623',
    ERROR: '#D0021B',
    SUCCESS: '#7ED321',
    INFO: '#4A90E2',
    BACKGROUND: '#1a1a1a',
    TEXT: '#ffffff',
    BORDER: '#444444'
};

// Dimensioni UI
export const UI_SIZES = {
    ICON: 40,
    ICON_SMALL: 30,
    BUTTON_HEIGHT: 30,
    PANEL_PADDING: 20,
    BORDER_RADIUS: 8
};

// Z-Index layers
export const Z_INDEX = {
    BACKGROUND: 0,
    WORLD: 1,
    ENTITIES: 2,
    EFFECTS: 3,
    UI: 4,
    NOTIFICATIONS: 5,
    MODALS: 6
};

// Input keys
export const KEYS = {
    ESCAPE: 'Escape',
    SPACE: ' ',
    ENTER: 'Enter',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    HOME: 'Home',
    END: 'End',
    PAGE_UP: 'PageUp',
    PAGE_DOWN: 'PageDown'
};

// Mouse buttons
export const MOUSE_BUTTONS = {
    LEFT: 0,
    MIDDLE: 1,
    RIGHT: 2
};

// Timing constants
export const TIMING = {
    FRAME_RATE: 60,
    FRAME_TIME: 1000 / 60, // ~16.67ms
    NOTIFICATION_DURATION: 3000,
    AUTO_SAVE_INTERVAL: 30000, // 30 seconds
    COMBAT_TIMEOUT: 10000 // 10 seconds
};
