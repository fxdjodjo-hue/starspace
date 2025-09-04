// Sistema Tipi NPC per Mappa - Preparato per Online
export class NPCTypes {
    constructor() {
        this.types = {
            // NPC per X1 - Settore Principale (più facili)
            'npc_x1': {
                name: 'X1 Patrol',
                description: 'Pattuglia del settore principale',
                sprite: 'alien', // Stesso sprite
                maxHP: 300,
                maxShield: 20,
                shieldRegenRate: 0.5,
                shieldRegenDelay: 4000,
                speed: 1.8,
                damage: 15,
                radius: 15,
                hitboxRadius: 40,
                colors: {
                    primary: '#4a90e2',
                    secondary: '#2c5aa0',
                    shield: '#00bfff'
                },
                experience: 50,
                credits: 25
            },
            
            // NPC per X2 - Settore Secondario (più difficili)
            'npc_x2': {
                name: 'X2 Elite',
                description: 'Elite del settore secondario',
                sprite: 'alien', // Stesso sprite
                maxHP: 800,
                maxShield: 50,
                shieldRegenRate: 1.2,
                shieldRegenDelay: 2500,
                speed: 2.5,
                damage: 25,
                radius: 18,
                hitboxRadius: 45,
                colors: {
                    primary: '#e74c3c',
                    secondary: '#c0392b',
                    shield: '#ff6b6b'
                },
                experience: 120,
                credits: 60
            },
            
            // NPC per future mappe
            'npc_x3': {
                name: 'X3 Guardian',
                description: 'Guardiano del settore avanzato',
                sprite: 'alien',
                maxHP: 1500,
                maxShield: 100,
                shieldRegenRate: 2.0,
                shieldRegenDelay: 2000,
                speed: 3.0,
                damage: 40,
                radius: 20,
                hitboxRadius: 50,
                colors: {
                    primary: '#9b59b6',
                    secondary: '#8e44ad',
                    shield: '#e67e22'
                },
                experience: 250,
                credits: 150
            }
        };
    }
    
    // Ottiene configurazione NPC per tipo
    getNPCConfig(type) {
        return this.types[type] || this.types['npc_x1'];
    }
    
    // Ottiene tutti i tipi disponibili
    getAllTypes() {
        return Object.keys(this.types);
    }
    
    // Ottiene tipi per mappa specifica
    getTypesForMap(mapId) {
        const mapTypes = {
            'x1': ['npc_x1'],
            'x2': ['npc_x2'],
            'x3': ['npc_x3']
        };
        
        return mapTypes[mapId] || ['npc_x1'];
    }
    
    // Ottiene tipo principale per mappa
    getMainTypeForMap(mapId) {
        const mainTypes = {
            'x1': 'npc_x1',
            'x2': 'npc_x2',
            'x3': 'npc_x3'
        };
        
        return mainTypes[mapId] || 'npc_x1';
    }
    
    // Crea configurazione per mappa
    createMapNPCConfig(mapId) {
        const mainType = this.getMainTypeForMap(mapId);
        const config = this.getNPCConfig(mainType);
        
        return {
            type: mainType,
            name: config.name,
            description: config.description,
            sprite: config.sprite,
            maxHP: config.maxHP,
            maxShield: config.maxShield,
            shieldRegenRate: config.shieldRegenRate,
            shieldRegenDelay: config.shieldRegenDelay,
            speed: config.speed,
            damage: config.damage,
            radius: config.radius,
            hitboxRadius: config.hitboxRadius,
            colors: config.colors,
            experience: config.experience,
            credits: config.credits
        };
    }
    
    // Valida tipo NPC
    isValidType(type) {
        return this.types.hasOwnProperty(type);
    }
    
    // Ottiene statistiche comparative
    getComparisonStats() {
        const stats = {};
        for (const [type, config] of Object.entries(this.types)) {
            stats[type] = {
                name: config.name,
                maxHP: config.maxHP,
                maxShield: config.maxShield,
                speed: config.speed,
                damage: config.damage,
                experience: config.experience,
                credits: config.credits
            };
        }
        return stats;
    }
}
