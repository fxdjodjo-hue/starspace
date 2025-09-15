// Sistema Tipi NPC per Mappa - Preparato per Online
export class NPCTypes {
    constructor() {
        this.types = {
            // NPC per X1 - Settore Principale (Streuner)
            'npc_x1': {
                name: 'Streuner',
                description: 'Currently the weakest of aliens. Located in X-1, X-2.',
                sprite: 'alien',
                maxHP: 800, // HP base Streuner
                maxShield: 400, // Shield base Streuner
                shieldRegenRate: 1.0,
                shieldRegenDelay: 3000,
                speed: 2.8, // 280 base speed
                damage: 17.5, // Base damage (±2.5 variation = 15-20 range)
                radius: 16,
                hitboxRadius: 42,
                colors: {
                    primary: '#ff6b6b',
                    secondary: '#e74c3c',
                    shield: '#ff9f9f'
                },
                experience: 400,
                credits: 400,
                uridium: 1,
                honor: 2,
                // Configurazione AI
                ai: {
                    detectionRange: 400, // Aumentato da 250 a 400
                    attackRange: 150, // Aumentato da 100 a 150
                    fleeThreshold: 0.2,
                    isAggressive: false, // Non aggressivo
                    retaliateOnDamage: true, // Attacca solo se attaccato
                    fleeWhenLow: true,
                    attackCooldown: 90, // 1.5 secondi
                    alertDuration: 600, // Aumentato da 180 a 600 (10 secondi)
                    fleeDuration: 240 // 4 secondi
                }
            },
            
            // NPC per X2 - Settore Secondario (Streuner uguali a X1)
            'npc_x2': {
                name: 'Streuner',
                description: 'Currently the weakest of aliens. Located in X-1, X-2.',
                sprite: 'alien',
                maxHP: 800,  // HP base Streuner
                maxShield: 400,  // Shield base Streuner
                shieldRegenRate: 1.0,  // Stesso di X1
                shieldRegenDelay: 3000,  // Stesso di X1
                speed: 2.8,  // Stesso di X1
                damage: 17.5,  // Base damage (±2.5 variation = 15-20 range)
                radius: 16,  // Stesso di X1
                hitboxRadius: 42,  // Stesso di X1
                colors: {
                    primary: '#ff6b6b',  // Stesso di X1
                    secondary: '#e74c3c',  // Stesso di X1
                    shield: '#ff9f9f'  // Stesso di X1
                },
                experience: 400,  // Stesso di X1
                credits: 400,  // Stesso di X1
                uridium: 1,  // Stesso di X1
                honor: 2,  // Stesso di X1
                // Configurazione AI (stessa di X1)
                ai: {
                    detectionRange: 400, // Aumentato da 250 a 400
                    attackRange: 150, // Aumentato da 100 a 150
                    fleeThreshold: 0.2,
                    isAggressive: false, // Non aggressivo
                    retaliateOnDamage: true, // Attacca solo se attaccato
                    fleeWhenLow: true,
                    attackCooldown: 90,
                    alertDuration: 600, // Aumentato da 180 a 600 (10 secondi)
                    fleeDuration: 240
                }
            },
            
            // NPC per X2 - Lordakia (più forte)
            'npc_x2_lordakia': {
                name: 'Lordakia',
                description: 'Stronger alien with high damage output. Located in X-2.',
                sprite: 'alien',
                maxHP: 2000,
                maxShield: 2000,
                shieldRegenRate: 1.5,
                shieldRegenDelay: 2000,
                speed: 3.2, // 320 base speed
                damage: 70, // 60-80 average damage
                radius: 20,
                hitboxRadius: 50,
                colors: {
                    primary: '#ff8c00',
                    secondary: '#ff6600',
                    shield: '#ffaa44'
                },
                experience: 800,
                credits: 800,
                uridium: 2,
                honor: 4,
                // Configurazione AI aggressiva
                ai: {
                    detectionRange: 300, // Rileva da più lontano
                    attackRange: 120, // Attacca da più lontano
                    fleeThreshold: 0.1, // Scappa solo quando quasi morto
                    isAggressive: true, // Aggressivo - attacca quando vede il giocatore
                    retaliateOnDamage: true, // Attacca anche se attaccato
                    fleeWhenLow: false, // Non scappa, combatte fino alla fine
                    attackCooldown: 45, // Attacca più frequentemente
                    alertDuration: 120, // Reagisce più velocemente
                    fleeDuration: 0 // Non scappa mai
                }
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
            'x2': ['npc_x2', 'npc_x2_lordakia'], // X2 ha sia Streuner che Lordakia
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
            credits: config.credits,
            uridium: config.uridium || 0,
            honor: config.honor || 0
        };
    }
    
    // Crea configurazione per tipo specifico (per Lordakia)
    createNPCConfigForType(type) {
        const config = this.getNPCConfig(type);
        
        return {
            type: type,
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
            credits: config.credits,
            uridium: config.uridium || 0,
            honor: config.honor || 0
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
