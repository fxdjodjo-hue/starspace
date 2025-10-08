/**
 * Configurazione centrale del gioco
 * Single source of truth per tutte le impostazioni
 */
export const GameConfig = {
    // Build/Version
    BUILD: {
        VERSION: '0.1.0',      // aggiorna manualmente prima dei test/release
        LABEL: 'ALPHA PRE-BUILD'
    },
    // Configurazione Canvas
    CANVAS: {
        WIDTH: 1920,
        HEIGHT: 1080,
        BACKGROUND_COLOR: '#1a1a1a'
    },

    // Configurazione Mondo
    WORLD: {
        WIDTH: 16000,
        HEIGHT: 10000,
        CENTER_X: 8000,
        CENTER_Y: 5000
    },

    // Configurazione Nave
    SHIP: {
        START_X: 8000,
        START_Y: 5000,
        SIZE: 40,
        SPEED: 2,
        MAX_HP: 1000,
        MAX_SHIELD: 0,
        ATTACK_RANGE: 400
    },

    // Configurazione UI
    UI: {
        ICON_SIZE: 40,
        ICON_SPACING: 10,
        ICON_START_X: 20,
        ICON_START_Y: 20,
        NOTIFICATION_DURATION: 3000
    },

    // Configurazione Audio
    AUDIO: {
        MASTER_VOLUME: 0.7,
        SFX_VOLUME: 0.8,
        MUSIC_VOLUME: 0.6,
        ENGINE_VOLUME: 0.5
    },

    // Configurazione Performance
    PERFORMANCE: {
        TARGET_FPS: 60,
        MAX_PARTICLES: 100,
        MAX_ENEMIES: 50,
        MAX_BONUS_BOXES: 100
    },

    // Configurazione Debug
    DEBUG: {
        SHOW_FPS: false,
        SHOW_COLLISION_BOXES: false,
        SHOW_ATTACK_RANGE: false,
        VERBOSE_LOGGING: false
    }
};

/**
 * Configurazione delle risorse
 */
export const ResourceConfig = {
    CREDITS: {
        START: 100000,
        MAX: Infinity
    },
    URIDIUM: {
        START: 5000,
        MAX: Infinity
    },
    HONOR: {
        START: 0,
        MAX: Infinity
    },
    EXPERIENCE: {
        START: 0,
        MAX: Infinity
    },
    STAR_ENERGY: {
        START: 100,
        MAX: 1000
    }
};

/**
 * Configurazione dei livelli
 */
export const LevelConfig = {
    REQUIREMENTS: {
        1: 0, 2: 10000, 3: 20000, 4: 40000, 5: 80000,
        6: 160000, 7: 320000, 8: 640000, 9: 1280000, 10: 2560000,
        11: 5120000, 12: 10240000, 13: 20480000, 14: 40960000, 15: 81920000,
        16: 163840000, 17: 327680000, 18: 655360000, 19: 1310720000, 20: 2621440000,
        21: 5242880000, 22: 10485760000, 23: 20971520000, 24: 41943040000, 25: 83886080000,
        26: 167772160000, 27: 335544320000, 28: 671088640000, 29: 1342177280000, 30: 2684354560000,
        31: 5368709120000, 32: 10737418240000, 33: 21474836480000, 34: 42949672960000, 35: 85899345920000,
        36: 171798691840000, 37: 343597383680000, 38: 687194767360000, 39: 1374389534720000, 40: 2748779069440000,
        41: 5497558138880000, 42: 10995116277760000, 43: 21990232555520000, 44: 43980465111040000, 45: 87960930222080000,
        46: 175921860444160000, 47: 351843720888320000, 48: 703687441776640000, 49: 1407374883553280000, 50: 2814749767106560000
    }
};

/**
 * Configurazione delle armi
 */
export const WeaponConfig = {
    LASER: {
        FIRE_RATE: 60,
        SPEED: 16,
        DAMAGE_MULTIPLIER: {
            x1: 1,
            x2: 2,
            x3: 3,
            sab: 0 // SAB non fa danno
        }
    },
    MISSILE: {
        r1: { damage: 50, fireRate: 180, speed: 12, color: '#00ff00' },
        r2: { damage: 80, fireRate: 150, speed: 15, color: '#00aaff' },
        r3: { damage: 120, fireRate: 120, speed: 18, color: '#ff00ff' }
    }
};

/**
 * Configurazione dei nemici
 */
export const EnemyConfig = {
    TYPES: {
        'npc_x1': {
            name: 'Streuner X1',
            hp: 100,
            damage: 10,
            speed: 1,
            credits: 50,
            uridium: 5,
            honor: 1,
            experience: 25
        },
        'npc_x2': {
            name: 'Streuner X2',
            hp: 200,
            damage: 20,
            speed: 1.5,
            credits: 100,
            uridium: 10,
            honor: 2,
            experience: 50
        }
    }
};
