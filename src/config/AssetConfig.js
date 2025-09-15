/**
 * Configurazione degli asset del gioco
 * Definisce tutti i percorsi degli asset utilizzati nel gioco
 */
export const AssetConfig = {
    // Immagini e sprite
    IMAGES: {
        // Nave
        'ship_base': 'Urus/ship02.png',
        'ship_urus': 'Urus/ship103.png',
        
        // Nemici
        'alien1': 'alien/alien1/alien1.png',
        'alien60': 'alien60.png',
        
        // Proiettili e missili
        'laser1': 'laser1.png',
        'missile1': 'missile1.png',
        'rocket3': 'rocket3.png',
        
        // Oggetti
        'bonusbox': 'bonusbox.png',
        'asteroid1': 'asteroid1.png',
        'asteroid2': 'asteroid2.png',
        'asteroid3': 'asteroid3.png',
        
        // Sfondo
        'background': 'bg.jpg',
        'spacestation': 'spacestation.png',
        'queststation': 'queststation.png',
        'radiation': 'radiation.png',
        'grid': 'grid.png',
        
        // Risorse
        'resource1': 'resources/resource_1.png',
        'resource2': 'resources/resource_2.png',
        'resource3': 'resources/resource_3.png',
        'resource4': 'resources/resource_4.png'
    },

    // Atlas (immagini + JSON)
    ATLAS: {
        'ship02': {
            image: 'Urus/ship02.png',
            json: 'Urus/ship02.atlas'
        },
        'ship103': {
            image: 'Urus/ship103.png',
            json: 'Urus/ship103.json'
        },
        'alien1': {
            image: 'alien/alien1/alien1.png',
            json: 'alien/alien1/alien1.atlas'
        },
        'bonusbox': {
            image: 'bonusbox.png',
            json: 'bonusbox.atlas'
        },
        'explosion': {
            image: 'explosion_effect/explosion.png',
            json: 'explosion_effect/explosion.atlas'
        },
        'hprestore': {
            image: 'hprestore/hprestore.png',
            json: 'hprestore/hprestore.atlas'
        },
        'shieldrestore': {
            image: 'shieldrestore/shieldrestore.atlas',
            json: 'shieldrestore/shieldrestore.atlas'
        },
        'smoke1': {
            image: 'smoke1/smoke1.png',
            json: 'smoke1/smoke1.atlas'
        },
        'resource1': {
            image: 'resources/resource_1.png',
            json: 'resources/resource_1.atlas'
        },
        'resource2': {
            image: 'resources/resource_2.png',
            json: 'resources/resource_2.atlas'
        },
        'resource3': {
            image: 'resources/resource_3.png',
            json: 'resources/resource_3.atlas'
        },
        'resource4': {
            image: 'resources/resource_4.png',
            json: 'resources/resource_4.atlas'
        }
    },

    // File audio
    AUDIO: {
        // Musica di sottofondo
        'background_music': 'sounds/background-music.mp3',
        'spacestation_music': 'sounds/spacestationsounds.mp3',
        
        // Effetti sonori
        'laser_sound': 'sounds/laser_1.wav',
        'missile_sound': 'sounds/rocket_1.wav',
        'explosion_sound': 'sounds/explosion.mp3',
        'collecting_sound': 'sounds/collecting.mp3',
        'death_sound': 'sounds/death.mp3',
        'engine_sound': 'sounds/engine.mp3',
        'click_sound': 'click.mp3',
        'system_ready': 'sounds/system_ready.mp3',
        'station_panel_open': 'sounds/stationpanel_open.mp3',
        
        // Abilità
        'emp_sound': 'skills/emp/emp.mp3',
        'fastrepair_sound': 'skills/fastrepair/fastrepair.mp3',
        'smartbomb_sound': 'skills/smartbomb/smartbomb.mp3'
    },

    // File JSON di configurazione
    JSON: {
        'maps': 'Dreadspire WU/maps.json',
        'ship103_data': 'Urus/ship103.json'
    }
};

/**
 * Configurazione per il caricamento degli asset
 */
export const AssetLoadingConfig = {
    // Priorità di caricamento
    PRIORITY: {
        CRITICAL: 1,    // Asset essenziali per il gioco
        HIGH: 2,        // Asset importanti
        MEDIUM: 3,      // Asset secondari
        LOW: 4          // Asset opzionali
    },

    // Asset critici (devono essere caricati prima di iniziare)
    CRITICAL_ASSETS: [
        'ship_base',
        'background',
        'laser_sound',
        'explosion_sound'
    ],

    // Asset ad alta priorità
    HIGH_PRIORITY_ASSETS: [
        'alien1',
        'bonusbox',
        'missile1',
        'background_music'
    ],

    // Asset a media priorità
    MEDIUM_PRIORITY_ASSETS: [
        'ship_urus',
        'asteroid1',
        'asteroid2',
        'asteroid3',
        'spacestation'
    ],

    // Asset a bassa priorità
    LOW_PRIORITY_ASSETS: [
        'resource1',
        'resource2',
        'resource3',
        'resource4',
        'queststation'
    ]
};
