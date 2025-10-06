// Sistema Tipi NPC per Mappa - Preparato per Online
export class NPCTypes {
    constructor() {
        this.types = {
            
            
            
            
            // NPC VENUS RESEARCH UNION (VRU)
            'streuner_vru': {
                name: 'Streuner',
                description: 'Currently the weakest of aliens. Located in X-1.',
                sprite: 'SpritesNPC/Streuner/alien10.png',
                maxHP: 1200,
                maxShield: 600,
                shieldRegenRate: 1.2,
                shieldRegenDelay: 2500,
                speed: 3.0,
                damage: 25,
                radius: 18,
                hitboxRadius: 45,
                colors: {
                    primary: '#9b59b6',
                    secondary: '#8e44ad',
                    shield: '#bb8fce'
                },
                experience: 500,
                credits: 500,
                uridium: 2,
                honor: 3,
                ai: {
                    detectionRange: 350,
                    attackRange: 140,
                    fleeThreshold: 0.25,
                    isAggressive: false,
                    retaliateOnDamage: true,
                    fleeWhenLow: true,
                    alertDuration: 500,
                    fleeDuration: 200
                }
            },
            'lordakia_vru': {
                name: 'Lordakia',
                description: 'Currently the weakest of aliens. Located in X-2.',
                sprite: 'SpritesNPC/Lordakia/alien20.png',
                maxHP: 1500,
                maxShield: 800,
                shieldRegenRate: 1.4,
                shieldRegenDelay: 2000,
                speed: 2.8,
                damage: 35,
                radius: 20,
                hitboxRadius: 50,
                colors: {
                    primary: '#8e44ad',
                    secondary: '#7d3c98',
                    shield: '#a569bd'
                },
                experience: 600,
                credits: 600,
                uridium: 3,
                honor: 4,
                ai: {
                    detectionRange: 400,
                    attackRange: 150,
                    fleeThreshold: 0.2,
                    isAggressive: false,
                    retaliateOnDamage: true,
                    fleeWhenLow: true,
                    alertDuration: 450,
                    fleeDuration: 180
                }
            },
            'npc_vru_5': {
                name: 'VRU Scientist',
                description: 'Scienziato della Venus Research Union',
                sprite: 'SpritesNPC/Kristallin/alien60.png',
                maxHP: 1800,
                maxShield: 1000,
                shieldRegenRate: 1.6,
                shieldRegenDelay: 1800,
                speed: 2.6,
                damage: 45,
                radius: 22,
                hitboxRadius: 55,
                colors: {
                    primary: '#7d3c98',
                    secondary: '#6c3483',
                    shield: '#9b59b6'
                },
                experience: 700,
                credits: 700,
                uridium: 4,
                honor: 5,
                ai: {
                    detectionRange: 450,
                    attackRange: 160,
                    fleeThreshold: 0.15,
                    isAggressive: false,
                    retaliateOnDamage: true,
                    fleeWhenLow: true,
                    alertDuration: 400,
                    fleeDuration: 160
                }
            },
            'npc_vru_4': {
                name: 'VRU Engineer',
                description: 'Ingegnere della Venus Research Union',
                sprite: 'SpritesNPC/Sibelonit/alien60.png',
                maxHP: 2200,
                maxShield: 1200,
                shieldRegenRate: 1.8,
                shieldRegenDelay: 1600,
                speed: 2.4,
                damage: 55,
                radius: 24,
                hitboxRadius: 60,
                colors: {
                    primary: '#6c3483',
                    secondary: '#5b2c6f',
                    shield: '#8e44ad'
                },
                experience: 800,
                credits: 800,
                uridium: 5,
                honor: 6,
                ai: {
                    detectionRange: 500,
                    attackRange: 170,
                    fleeThreshold: 0.1,
                    isAggressive: false,
                    retaliateOnDamage: true,
                    fleeWhenLow: true,
                    alertDuration: 350,
                    fleeDuration: 140
                }
            },
            'npc_vru_3': {
                name: 'VRU Commander',
                description: 'Comandante della Venus Research Union',
                sprite: 'SpritesNPC/Lordakium/alien70.png',
                maxHP: 2800,
                maxShield: 1500,
                shieldRegenRate: 2.0,
                shieldRegenDelay: 1400,
                speed: 2.2,
                damage: 70,
                radius: 26,
                hitboxRadius: 65,
                colors: {
                    primary: '#5b2c6f',
                    secondary: '#4a235a',
                    shield: '#7d3c98'
                },
                experience: 1000,
                credits: 1000,
                uridium: 6,
                honor: 8,
                ai: {
                    detectionRange: 550,
                    attackRange: 180,
                    fleeThreshold: 0.05,
                    isAggressive: false,
                    retaliateOnDamage: true,
                    fleeWhenLow: true,
                    alertDuration: 300,
                    fleeDuration: 120
                }
            },
            
            // NPC MARS MILITARY ORGANIZATION (MMO)
            'streuner_mmo': {
                name: 'Streuner',
                description: 'Currently the weakest of aliens. Located in X-1.',
                sprite: 'SpritesNPC/Streuner/alien10.png',
                maxHP: 1000,
                maxShield: 500,
                shieldRegenRate: 1.0,
                shieldRegenDelay: 3000,
                speed: 3.2,
                damage: 20,
                radius: 16,
                hitboxRadius: 40,
                colors: {
                    primary: '#e74c3c',
                    secondary: '#c0392b',
                    shield: '#ec7063'
                },
                experience: 400,
                credits: 400,
                uridium: 1,
                honor: 2,
                ai: {
                    detectionRange: 300,
                    attackRange: 130,
                    fleeThreshold: 0.3,
                    isAggressive: false,
                    retaliateOnDamage: true,
                    fleeWhenLow: true,
                    alertDuration: 600,
                    fleeDuration: 240
                }
            },
            'lordakia_mmo': {
                name: 'Lordakia',
                description: 'Currently the weakest of aliens. Located in X-2.',
                sprite: 'SpritesNPC/Lordakia/alien20.png',
                maxHP: 1300,
                maxShield: 700,
                shieldRegenRate: 1.2,
                shieldRegenDelay: 2500,
                speed: 3.0,
                damage: 30,
                radius: 18,
                hitboxRadius: 45,
                colors: {
                    primary: '#c0392b',
                    secondary: '#a93226',
                    shield: '#e74c3c'
                },
                experience: 500,
                credits: 500,
                uridium: 2,
                honor: 3,
                ai: {
                    detectionRange: 350,
                    attackRange: 140,
                    fleeThreshold: 0.25,
                    isAggressive: false,
                    retaliateOnDamage: true,
                    fleeWhenLow: true,
                    alertDuration: 500,
                    fleeDuration: 200
                }
            },
            'npc_mmo_5': {
                name: 'MMO Sergeant',
                description: 'Sergente della Mars Military Organization',
                sprite: 'SpritesNPC/Kristallin/alien60.png',
                maxHP: 1600,
                maxShield: 900,
                shieldRegenRate: 1.4,
                shieldRegenDelay: 2000,
                speed: 2.8,
                damage: 40,
                radius: 20,
                hitboxRadius: 50,
                colors: {
                    primary: '#a93226',
                    secondary: '#922b21',
                    shield: '#c0392b'
                },
                experience: 600,
                credits: 600,
                uridium: 3,
                honor: 4,
                ai: {
                    detectionRange: 400,
                    attackRange: 150,
                    fleeThreshold: 0.2,
                    isAggressive: false,
                    retaliateOnDamage: true,
                    fleeWhenLow: true,
                    alertDuration: 450,
                    fleeDuration: 180
                }
            },
            'npc_mmo_4': {
                name: 'MMO Lieutenant',
                description: 'Tenente della Mars Military Organization',
                sprite: 'SpritesNPC/Sibelonit/alien60.png',
                maxHP: 2000,
                maxShield: 1100,
                shieldRegenRate: 1.6,
                shieldRegenDelay: 1800,
                speed: 2.6,
                damage: 50,
                radius: 22,
                hitboxRadius: 55,
                colors: {
                    primary: '#922b21',
                    secondary: '#7b241c',
                    shield: '#a93226'
                },
                experience: 700,
                credits: 700,
                uridium: 4,
                honor: 5,
                ai: {
                    detectionRange: 450,
                    attackRange: 160,
                    fleeThreshold: 0.15,
                    isAggressive: false,
                    retaliateOnDamage: true,
                    fleeWhenLow: true,
                    alertDuration: 400,
                    fleeDuration: 160
                }
            },
            'npc_mmo_3': {
                name: 'MMO Captain',
                description: 'Capitano della Mars Military Organization',
                sprite: 'SpritesNPC/Lordakium/alien70.png',
                maxHP: 2500,
                maxShield: 1300,
                shieldRegenRate: 1.8,
                shieldRegenDelay: 1600,
                speed: 2.4,
                damage: 60,
                radius: 24,
                hitboxRadius: 60,
                colors: {
                    primary: '#7b241c',
                    secondary: '#641e16',
                    shield: '#922b21'
                },
                experience: 800,
                credits: 800,
                uridium: 5,
                honor: 6,
                ai: {
                    detectionRange: 500,
                    attackRange: 170,
                    fleeThreshold: 0.1,
                    isAggressive: false,
                    retaliateOnDamage: true,
                    fleeWhenLow: true,
                    alertDuration: 350,
                    fleeDuration: 140
                }
            },
            
            // NPC EARTH INDUSTRIES CORPORATION (EIC)
            'streuner_eic': {
                name: 'Streuner',
                description: 'Currently the weakest of aliens. Located in X-1.',
                sprite: 'SpritesNPC/Streuner/alien10.png',
                maxHP: 1100,
                maxShield: 550,
                shieldRegenRate: 1.1,
                shieldRegenDelay: 2800,
                speed: 2.9,
                damage: 22,
                radius: 17,
                hitboxRadius: 42,
                colors: {
                    primary: '#27ae60',
                    secondary: '#229954',
                    shield: '#58d68d'
                },
                experience: 450,
                credits: 450,
                uridium: 2,
                honor: 2,
                ai: {
                    detectionRange: 320,
                    attackRange: 135,
                    fleeThreshold: 0.28,
                    isAggressive: false,
                    retaliateOnDamage: true,
                    fleeWhenLow: true,
                    alertDuration: 550,
                    fleeDuration: 220
                }
            },
            'lordakia_eic': {
                name: 'Lordakia',
                description: 'Currently the weakest of aliens. Located in X-2.',
                sprite: 'SpritesNPC/Lordakia/alien20.png',
                maxHP: 1400,
                maxShield: 750,
                shieldRegenRate: 1.3,
                shieldRegenDelay: 2200,
                speed: 2.7,
                damage: 32,
                radius: 19,
                hitboxRadius: 47,
                colors: {
                    primary: '#229954',
                    secondary: '#1e8449',
                    shield: '#27ae60'
                },
                experience: 550,
                credits: 550,
                uridium: 3,
                honor: 3,
                ai: {
                    detectionRange: 370,
                    attackRange: 145,
                    fleeThreshold: 0.23,
                    isAggressive: false,
                    retaliateOnDamage: true,
                    fleeWhenLow: true,
                    alertDuration: 480,
                    fleeDuration: 190
                }
            },
            'npc_eic_5': {
                name: 'EIC Engineer',
                description: 'Ingegnere della Earth Industries Corporation',
                sprite: 'SpritesNPC/Kristallin/alien60.png',
                maxHP: 1700,
                maxShield: 950,
                shieldRegenRate: 1.5,
                shieldRegenDelay: 1900,
                speed: 2.5,
                damage: 42,
                radius: 21,
                hitboxRadius: 52,
                colors: {
                    primary: '#1e8449',
                    secondary: '#1b5e3f',
                    shield: '#229954'
                },
                experience: 650,
                credits: 650,
                uridium: 4,
                honor: 4,
                ai: {
                    detectionRange: 420,
                    attackRange: 155,
                    fleeThreshold: 0.18,
                    isAggressive: false,
                    retaliateOnDamage: true,
                    fleeWhenLow: true,
                    alertDuration: 420,
                    fleeDuration: 170
                }
            },
            'npc_eic_4': {
                name: 'EIC Manager',
                description: 'Manager della Earth Industries Corporation',
                sprite: 'SpritesNPC/Sibelonit/alien60.png',
                maxHP: 2100,
                maxShield: 1150,
                shieldRegenRate: 1.7,
                shieldRegenDelay: 1700,
                speed: 2.3,
                damage: 52,
                radius: 23,
                hitboxRadius: 57,
                colors: {
                    primary: '#1b5e3f',
                    secondary: '#184d35',
                    shield: '#1e8449'
                },
                experience: 750,
                credits: 750,
                uridium: 5,
                honor: 5,
                ai: {
                    detectionRange: 470,
                    attackRange: 165,
                    fleeThreshold: 0.13,
                    isAggressive: false,
                    retaliateOnDamage: true,
                    fleeWhenLow: true,
                    alertDuration: 380,
                    fleeDuration: 150
                }
            },
            'npc_eic_3': {
                name: 'EIC Director',
                description: 'Direttore della Earth Industries Corporation',
                sprite: 'SpritesNPC/Lordakium/alien70.png',
                maxHP: 2600,
                maxShield: 1400,
                shieldRegenRate: 1.9,
                shieldRegenDelay: 1500,
                speed: 2.1,
                damage: 65,
                radius: 25,
                hitboxRadius: 62,
                colors: {
                    primary: '#184d35',
                    secondary: '#153d2b',
                    shield: '#1b5e3f'
                },
                experience: 900,
                credits: 900,
                uridium: 6,
                honor: 7,
                ai: {
                    detectionRange: 520,
                    attackRange: 175,
                    fleeThreshold: 0.08,
                    isAggressive: false,
                    retaliateOnDamage: true,
                    fleeWhenLow: true,
                    alertDuration: 320,
                    fleeDuration: 130
                }
            },
            
            // NPC PVP HUB (T-1) - Nessun NPC
            
            // NPC LORDAKIA (X2, X4)
            'npc_vru_lordakia': {
                name: 'Lordakia',
                description: 'Stronger alien with high damage output. Located in X-2.',
                sprite: 'SpritesNPC/Lordakia/alien20.png',
                maxHP: 2000,
                maxShield: 2000,
                shieldRegenRate: 1.5,
                shieldRegenDelay: 2000,
                speed: 3.2,
                damage: 70,
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
                ai: {
                    detectionRange: 300,
                    attackRange: 120,
                    fleeThreshold: 0.1,
                    isAggressive: true,
                    retaliateOnDamage: true,
                    fleeWhenLow: false,
                    alertDuration: 120,
                    fleeDuration: 0
                }
            },
            'npc_mmo_lordakia': {
                name: 'Lordakia',
                description: 'Stronger alien with high damage output. Located in X-2.',
                sprite: 'SpritesNPC/Lordakia/alien20.png',
                maxHP: 2000,
                maxShield: 2000,
                shieldRegenRate: 1.5,
                shieldRegenDelay: 2000,
                speed: 3.2,
                damage: 70,
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
                ai: {
                    detectionRange: 300,
                    attackRange: 120,
                    fleeThreshold: 0.1,
                    isAggressive: true,
                    retaliateOnDamage: true,
                    fleeWhenLow: false,
                    alertDuration: 120,
                    fleeDuration: 0
                }
            },
            'npc_eic_lordakia': {
                name: 'Lordakia',
                description: 'Stronger alien with high damage output. Located in X-2.',
                sprite: 'SpritesNPC/Lordakia/alien20.png',
                maxHP: 2000,
                maxShield: 2000,
                shieldRegenRate: 1.5,
                shieldRegenDelay: 2000,
                speed: 3.2,
                damage: 70,
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
                ai: {
                    detectionRange: 300,
                    attackRange: 120,
                    fleeThreshold: 0.1,
                    isAggressive: true,
                    retaliateOnDamage: true,
                    fleeWhenLow: false,
                    alertDuration: 120,
                    fleeDuration: 0
                }
            },
            
            // NPC SAIMON (X3)
            'saimon_vru': {
                name: 'Saimon',
                description: 'Advanced alien with balanced stats. Located in X-3.',
                sprite: 'SpritesNPC/Saimon/alien30.png',
                maxHP: 2500,
                maxShield: 1500,
                shieldRegenRate: 1.8,
                shieldRegenDelay: 1800,
                speed: 2.8,
                damage: 85,
                radius: 22,
                hitboxRadius: 55,
                colors: {
                    primary: '#9b59b6',
                    secondary: '#8e44ad',
                    shield: '#bb8fce'
                },
                experience: 1000,
                credits: 1000,
                uridium: 3,
                honor: 5,
                ai: {
                    detectionRange: 400,
                    attackRange: 140,
                    fleeThreshold: 0.15,
                    isAggressive: true,
                    retaliateOnDamage: true,
                    fleeWhenLow: true,
                    alertDuration: 200,
                    fleeDuration: 300
                }
            },
            'saimon_mmo': {
                name: 'Saimon',
                description: 'Advanced alien with balanced stats. Located in X-3.',
                sprite: 'SpritesNPC/Saimon/alien30.png',
                maxHP: 2500,
                maxShield: 1500,
                shieldRegenRate: 1.8,
                shieldRegenDelay: 1800,
                speed: 2.8,
                damage: 85,
                radius: 22,
                hitboxRadius: 55,
                colors: {
                    primary: '#e74c3c',
                    secondary: '#c0392b',
                    shield: '#ec7063'
                },
                experience: 1000,
                credits: 1000,
                uridium: 3,
                honor: 5,
                ai: {
                    detectionRange: 400,
                    attackRange: 140,
                    fleeThreshold: 0.15,
                    isAggressive: true,
                    retaliateOnDamage: true,
                    fleeWhenLow: true,
                    alertDuration: 200,
                    fleeDuration: 300
                }
            },
            'saimon_eic': {
                name: 'Saimon',
                description: 'Advanced alien with balanced stats. Located in X-3.',
                sprite: 'SpritesNPC/Saimon/alien30.png',
                maxHP: 2500,
                maxShield: 1500,
                shieldRegenRate: 1.8,
                shieldRegenDelay: 1800,
                speed: 2.8,
                damage: 85,
                radius: 22,
                hitboxRadius: 55,
                colors: {
                    primary: '#27ae60',
                    secondary: '#229954',
                    shield: '#58d68d'
                },
                experience: 1000,
                credits: 1000,
                uridium: 3,
                honor: 5,
                ai: {
                    detectionRange: 400,
                    attackRange: 140,
                    fleeThreshold: 0.15,
                    isAggressive: true,
                    retaliateOnDamage: true,
                    fleeWhenLow: true,
                    alertDuration: 200,
                    fleeDuration: 300
                }
            },
            
            // NPC MORDON (X3)
            'mordon_vru': {
                name: 'Mordon',
                description: 'Heavy alien with high HP and defense. Located in X-3.',
                sprite: 'SpritesNPC/Mordon/alien40.png',
                maxHP: 2200,
                maxShield: 1800,
                shieldRegenRate: 2.0,
                shieldRegenDelay: 1600,
                speed: 2.6,
                damage: 75,
                radius: 24,
                hitboxRadius: 60,
                colors: {
                    primary: '#8e44ad',
                    secondary: '#7d3c98',
                    shield: '#a569bd'
                },
                experience: 900,
                credits: 900,
                uridium: 3,
                honor: 4,
                ai: {
                    detectionRange: 350,
                    attackRange: 130,
                    fleeThreshold: 0.2,
                    isAggressive: true,
                    retaliateOnDamage: true,
                    fleeWhenLow: true,
                    alertDuration: 250,
                    fleeDuration: 400
                }
            },
            'mordon_mmo': {
                name: 'Mordon',
                description: 'Heavy alien with high HP and defense. Located in X-3.',
                sprite: 'SpritesNPC/Mordon/alien40.png',
                maxHP: 2200,
                maxShield: 1800,
                shieldRegenRate: 2.0,
                shieldRegenDelay: 1600,
                speed: 2.6,
                damage: 75,
                radius: 24,
                hitboxRadius: 60,
                colors: {
                    primary: '#c0392b',
                    secondary: '#a93226',
                    shield: '#e74c3c'
                },
                experience: 900,
                credits: 900,
                uridium: 3,
                honor: 4,
                ai: {
                    detectionRange: 350,
                    attackRange: 130,
                    fleeThreshold: 0.2,
                    isAggressive: true,
                    retaliateOnDamage: true,
                    fleeWhenLow: true,
                    alertDuration: 250,
                    fleeDuration: 400
                }
            },
            'mordon_eic': {
                name: 'Mordon',
                description: 'Heavy alien with high HP and defense. Located in X-3.',
                sprite: 'SpritesNPC/Mordon/alien40.png',
                maxHP: 2200,
                maxShield: 1800,
                shieldRegenRate: 2.0,
                shieldRegenDelay: 1600,
                speed: 2.6,
                damage: 75,
                radius: 24,
                hitboxRadius: 60,
                colors: {
                    primary: '#229954',
                    secondary: '#1e8449',
                    shield: '#27ae60'
                },
                experience: 900,
                credits: 900,
                uridium: 3,
                honor: 4,
                ai: {
                    detectionRange: 350,
                    attackRange: 130,
                    fleeThreshold: 0.2,
                    isAggressive: true,
                    retaliateOnDamage: true,
                    fleeWhenLow: true,
                    alertDuration: 250,
                    fleeDuration: 400
                }
            },
            
            // NPC DEVOLARIUM (X3)
            'devolarium_vru': {
                name: 'Devolarium',
                description: 'Fast alien with high damage output. Located in X-3.',
                sprite: 'SpritesNPC/Devolarium/alien50.png',
                maxHP: 2800,
                maxShield: 1200,
                shieldRegenRate: 1.6,
                shieldRegenDelay: 2000,
                speed: 3.0,
                damage: 95,
                radius: 26,
                hitboxRadius: 65,
                colors: {
                    primary: '#7d3c98',
                    secondary: '#6c3483',
                    shield: '#9b59b6'
                },
                experience: 1100,
                credits: 1100,
                uridium: 4,
                honor: 6,
                ai: {
                    detectionRange: 450,
                    attackRange: 150,
                    fleeThreshold: 0.1,
                    isAggressive: true,
                    retaliateOnDamage: true,
                    fleeWhenLow: false,
                    alertDuration: 150,
                    fleeDuration: 0
                }
            },
            'devolarium_mmo': {
                name: 'Devolarium',
                description: 'Fast alien with high damage output. Located in X-3.',
                sprite: 'SpritesNPC/Devolarium/alien50.png',
                maxHP: 2800,
                maxShield: 1200,
                shieldRegenRate: 1.6,
                shieldRegenDelay: 2000,
                speed: 3.0,
                damage: 95,
                radius: 26,
                hitboxRadius: 65,
                colors: {
                    primary: '#a93226',
                    secondary: '#922b21',
                    shield: '#c0392b'
                },
                experience: 1100,
                credits: 1100,
                uridium: 4,
                honor: 6,
                ai: {
                    detectionRange: 450,
                    attackRange: 150,
                    fleeThreshold: 0.1,
                    isAggressive: true,
                    retaliateOnDamage: true,
                    fleeWhenLow: false,
                    alertDuration: 150,
                    fleeDuration: 0
                }
            },
            'devolarium_eic': {
                name: 'Devolarium',
                description: 'Fast alien with high damage output. Located in X-3.',
                sprite: 'SpritesNPC/Devolarium/alien50.png',
                maxHP: 2800,
                maxShield: 1200,
                shieldRegenRate: 1.6,
                shieldRegenDelay: 2000,
                speed: 3.0,
                damage: 95,
                radius: 26,
                hitboxRadius: 65,
                colors: {
                    primary: '#1e8449',
                    secondary: '#1b5e3f',
                    shield: '#229954'
                },
                experience: 1100,
                credits: 1100,
                uridium: 4,
                honor: 6,
                ai: {
                    detectionRange: 450,
                    attackRange: 150,
                    fleeThreshold: 0.1,
                    isAggressive: true,
                    retaliateOnDamage: true,
                    fleeWhenLow: false,
                    alertDuration: 150,
                    fleeDuration: 0
                }
            },
            
            // NPC SIBELON (X3)
            'sibelon_vru': {
                name: 'Sibelon',
                description: 'Elite alien with balanced stats. Located in X-3.',
                sprite: 'SpritesNPC/Sibelon/motron.png',
                maxHP: 2400,
                maxShield: 1600,
                shieldRegenRate: 1.9,
                shieldRegenDelay: 1700,
                speed: 2.7,
                damage: 80,
                radius: 25,
                hitboxRadius: 62,
                colors: {
                    primary: '#6c3483',
                    secondary: '#5b2c6f',
                    shield: '#8e44ad'
                },
                experience: 950,
                credits: 950,
                uridium: 3,
                honor: 5,
                ai: {
                    detectionRange: 380,
                    attackRange: 135,
                    fleeThreshold: 0.18,
                    isAggressive: true,
                    retaliateOnDamage: true,
                    fleeWhenLow: true,
                    alertDuration: 180,
                    fleeDuration: 350
                }
            },
            'sibelon_mmo': {
                name: 'Sibelon',
                description: 'Elite alien with balanced stats. Located in X-3.',
                sprite: 'SpritesNPC/Sibelon/motron.png',
                maxHP: 2400,
                maxShield: 1600,
                shieldRegenRate: 1.9,
                shieldRegenDelay: 1700,
                speed: 2.7,
                damage: 80,
                radius: 25,
                hitboxRadius: 62,
                colors: {
                    primary: '#922b21',
                    secondary: '#7b241c',
                    shield: '#a93226'
                },
                experience: 950,
                credits: 950,
                uridium: 3,
                honor: 5,
                ai: {
                    detectionRange: 380,
                    attackRange: 135,
                    fleeThreshold: 0.18,
                    isAggressive: true,
                    retaliateOnDamage: true,
                    fleeWhenLow: true,
                    alertDuration: 180,
                    fleeDuration: 350
                }
            },
            'sibelon_eic': {
                name: 'Sibelon',
                description: 'Elite alien with balanced stats. Located in X-3.',
                sprite: 'SpritesNPC/Sibelon/motron.png',
                maxHP: 2400,
                maxShield: 1600,
                shieldRegenRate: 1.9,
                shieldRegenDelay: 1700,
                speed: 2.7,
                damage: 80,
                radius: 25,
                hitboxRadius: 62,
                colors: {
                    primary: '#1b5e3f',
                    secondary: '#184d35',
                    shield: '#1e8449'
                },
                experience: 950,
                credits: 950,
                uridium: 3,
                honor: 5,
                ai: {
                    detectionRange: 380,
                    attackRange: 135,
                    fleeThreshold: 0.18,
                    isAggressive: true,
                    retaliateOnDamage: true,
                    fleeWhenLow: true,
                    alertDuration: 180,
                    fleeDuration: 350
                }
            },
            
            // NPC SIBELONIT (X4)
            'sibelonit_vru': {
                name: 'Sibelonit',
                description: 'Advanced alien with enhanced stats. Located in X-4.',
                sprite: 'SpritesNPC/Sibelonit/alien60.png',
                maxHP: 3000,
                maxShield: 2000,
                shieldRegenRate: 2.2,
                shieldRegenDelay: 1400,
                speed: 2.4,
                damage: 100,
                radius: 28,
                hitboxRadius: 70,
                colors: {
                    primary: '#5b2c6f',
                    secondary: '#4a235a',
                    shield: '#7d3c98'
                },
                experience: 1200,
                credits: 1200,
                uridium: 5,
                honor: 7,
                ai: {
                    detectionRange: 500,
                    attackRange: 160,
                    fleeThreshold: 0.08,
                    isAggressive: true,
                    retaliateOnDamage: true,
                    fleeWhenLow: false,
                    alertDuration: 120,
                    fleeDuration: 0
                }
            },
            'sibelonit_mmo': {
                name: 'Sibelonit',
                description: 'Advanced alien with enhanced stats. Located in X-4.',
                sprite: 'SpritesNPC/Sibelonit/alien60.png',
                maxHP: 3000,
                maxShield: 2000,
                shieldRegenRate: 2.2,
                shieldRegenDelay: 1400,
                speed: 2.4,
                damage: 100,
                radius: 28,
                hitboxRadius: 70,
                colors: {
                    primary: '#7b241c',
                    secondary: '#641e16',
                    shield: '#922b21'
                },
                experience: 1200,
                credits: 1200,
                uridium: 5,
                honor: 7,
                ai: {
                    detectionRange: 500,
                    attackRange: 160,
                    fleeThreshold: 0.08,
                    isAggressive: true,
                    retaliateOnDamage: true,
                    fleeWhenLow: false,
                    alertDuration: 120,
                    fleeDuration: 0
                }
            },
            'sibelonit_eic': {
                name: 'Sibelonit',
                description: 'Advanced alien with enhanced stats. Located in X-4.',
                sprite: 'SpritesNPC/Sibelonit/alien60.png',
                maxHP: 3000,
                maxShield: 2000,
                shieldRegenRate: 2.2,
                shieldRegenDelay: 1400,
                speed: 2.4,
                damage: 100,
                radius: 28,
                hitboxRadius: 70,
                colors: {
                    primary: '#184d35',
                    secondary: '#153d2b',
                    shield: '#1b5e3f'
                },
                experience: 1200,
                credits: 1200,
                uridium: 5,
                honor: 7,
                ai: {
                    detectionRange: 500,
                    attackRange: 160,
                    fleeThreshold: 0.08,
                    isAggressive: true,
                    retaliateOnDamage: true,
                    fleeWhenLow: false,
                    alertDuration: 120,
                    fleeDuration: 0
                }
            },
            
            // NPC LORDAKIUM (X4, X6)
            'lordakium_vru': {
                name: 'Lordakium',
                description: 'Elite alien with superior combat abilities. Located in X-4.',
                sprite: 'SpritesNPC/Lordakium/alien70.png',
                maxHP: 3200,
                maxShield: 2200,
                shieldRegenRate: 2.4,
                shieldRegenDelay: 1200,
                speed: 2.2,
                damage: 110,
                radius: 30,
                hitboxRadius: 75,
                colors: {
                    primary: '#4a235a',
                    secondary: '#3d1e4a',
                    shield: '#6c3483'
                },
                experience: 1300,
                credits: 1300,
                uridium: 6,
                honor: 8,
                ai: {
                    detectionRange: 550,
                    attackRange: 170,
                    fleeThreshold: 0.05,
                    isAggressive: true,
                    retaliateOnDamage: true,
                    fleeWhenLow: false,
                    alertDuration: 100,
                    fleeDuration: 0
                }
            },
            'lordakium_mmo': {
                name: 'Lordakium',
                description: 'Elite alien with superior combat abilities. Located in X-4.',
                sprite: 'SpritesNPC/Lordakium/alien70.png',
                maxHP: 3200,
                maxShield: 2200,
                shieldRegenRate: 2.4,
                shieldRegenDelay: 1200,
                speed: 2.2,
                damage: 110,
                radius: 30,
                hitboxRadius: 75,
                colors: {
                    primary: '#641e16',
                    secondary: '#511a12',
                    shield: '#7b241c'
                },
                experience: 1300,
                credits: 1300,
                uridium: 6,
                honor: 8,
                ai: {
                    detectionRange: 550,
                    attackRange: 170,
                    fleeThreshold: 0.05,
                    isAggressive: true,
                    retaliateOnDamage: true,
                    fleeWhenLow: false,
                    alertDuration: 100,
                    fleeDuration: 0
                }
            },
            'lordakium_eic': {
                name: 'Lordakium',
                description: 'Elite alien with superior combat abilities. Located in X-4.',
                sprite: 'SpritesNPC/Lordakium/alien70.png',
                maxHP: 3200,
                maxShield: 2200,
                shieldRegenRate: 2.4,
                shieldRegenDelay: 1200,
                speed: 2.2,
                damage: 110,
                radius: 30,
                hitboxRadius: 75,
                colors: {
                    primary: '#153d2b',
                    secondary: '#122e22',
                    shield: '#184d35'
                },
                experience: 1300,
                credits: 1300,
                uridium: 6,
                honor: 8,
                ai: {
                    detectionRange: 550,
                    attackRange: 170,
                    fleeThreshold: 0.05,
                    isAggressive: true,
                    retaliateOnDamage: true,
                    fleeWhenLow: false,
                    alertDuration: 100,
                    fleeDuration: 0
                }
            },
            
            // NPC KRISTALLING (X5)
            'kristallin_vru': {
                name: 'Kristallin',
                description: 'Crystalline alien with unique abilities. Located in X-5.',
                sprite: 'SpritesNPC/Kristallin/alien60.png',
                maxHP: 3500,
                maxShield: 2500,
                shieldRegenRate: 2.6,
                shieldRegenDelay: 1000,
                speed: 2.0,
                damage: 120,
                radius: 32,
                hitboxRadius: 80,
                colors: {
                    primary: '#3d1e4a',
                    secondary: '#301738',
                    shield: '#5b2c6f'
                },
                experience: 1400,
                credits: 1400,
                uridium: 7,
                honor: 9,
                ai: {
                    detectionRange: 600,
                    attackRange: 180,
                    fleeThreshold: 0.03,
                    isAggressive: true,
                    retaliateOnDamage: true,
                    fleeWhenLow: false,
                    alertDuration: 80,
                    fleeDuration: 0
                }
            },
            'kristallin_mmo': {
                name: 'Kristallin',
                description: 'Crystalline alien with unique abilities. Located in X-5.',
                sprite: 'SpritesNPC/Kristallin/alien60.png',
                maxHP: 3500,
                maxShield: 2500,
                shieldRegenRate: 2.6,
                shieldRegenDelay: 1000,
                speed: 2.0,
                damage: 120,
                radius: 32,
                hitboxRadius: 80,
                colors: {
                    primary: '#511a12',
                    secondary: '#3e140e',
                    shield: '#641e16'
                },
                experience: 1400,
                credits: 1400,
                uridium: 7,
                honor: 9,
                ai: {
                    detectionRange: 600,
                    attackRange: 180,
                    fleeThreshold: 0.03,
                    isAggressive: true,
                    retaliateOnDamage: true,
                    fleeWhenLow: false,
                    alertDuration: 80,
                    fleeDuration: 0
                }
            },
            'kristallin_eic': {
                name: 'Kristallin',
                description: 'Crystalline alien with unique abilities. Located in X-5.',
                sprite: 'SpritesNPC/Kristallin/alien60.png',
                maxHP: 3500,
                maxShield: 2500,
                shieldRegenRate: 2.6,
                shieldRegenDelay: 1000,
                speed: 2.0,
                damage: 120,
                radius: 32,
                hitboxRadius: 80,
                colors: {
                    primary: '#122e22',
                    secondary: '#0f241c',
                    shield: '#153d2b'
                },
                experience: 1400,
                credits: 1400,
                uridium: 7,
                honor: 9,
                ai: {
                    detectionRange: 600,
                    attackRange: 180,
                    fleeThreshold: 0.03,
                    isAggressive: true,
                    retaliateOnDamage: true,
                    fleeWhenLow: false,
                    alertDuration: 80,
                    fleeDuration: 0
                }
            },
            
            // NPC KRISTALLON (X5, X6)
            'kristallon_vru': {
                name: 'Kristallon',
                description: 'Ultimate crystalline alien. Located in X-5.',
                sprite: 'SpritesNPC/Kristallon/alien90.png',
                maxHP: 3800,
                maxShield: 2800,
                shieldRegenRate: 2.8,
                shieldRegenDelay: 800,
                speed: 1.8,
                damage: 130,
                radius: 34,
                hitboxRadius: 85,
                colors: {
                    primary: '#301738',
                    secondary: '#231028',
                    shield: '#4a235a'
                },
                experience: 1500,
                credits: 1500,
                uridium: 8,
                honor: 10,
                ai: {
                    detectionRange: 650,
                    attackRange: 190,
                    fleeThreshold: 0.02,
                    isAggressive: true,
                    retaliateOnDamage: true,
                    fleeWhenLow: false,
                    alertDuration: 60,
                    fleeDuration: 0
                }
            },
            'kristallon_mmo': {
                name: 'Kristallon',
                description: 'Ultimate crystalline alien. Located in X-5.',
                sprite: 'SpritesNPC/Kristallon/alien90.png',
                maxHP: 3800,
                maxShield: 2800,
                shieldRegenRate: 2.8,
                shieldRegenDelay: 800,
                speed: 1.8,
                damage: 130,
                radius: 34,
                hitboxRadius: 85,
                colors: {
                    primary: '#3e140e',
                    secondary: '#2b0f0a',
                    shield: '#511a12'
                },
                experience: 1500,
                credits: 1500,
                uridium: 8,
                honor: 10,
                ai: {
                    detectionRange: 650,
                    attackRange: 190,
                    fleeThreshold: 0.02,
                    isAggressive: true,
                    retaliateOnDamage: true,
                    fleeWhenLow: false,
                    alertDuration: 60,
                    fleeDuration: 0
                }
            },
            'kristallon_eic': {
                name: 'Kristallon',
                description: 'Ultimate crystalline alien. Located in X-5.',
                sprite: 'SpritesNPC/Kristallon/alien90.png',
                maxHP: 3800,
                maxShield: 2800,
                shieldRegenRate: 2.8,
                shieldRegenDelay: 800,
                speed: 1.8,
                damage: 130,
                radius: 34,
                hitboxRadius: 85,
                colors: {
                    primary: '#0f241c',
                    secondary: '#0c1a16',
                    shield: '#122e22'
                },
                experience: 1500,
                credits: 1500,
                uridium: 8,
                honor: 10,
                ai: {
                    detectionRange: 650,
                    attackRange: 190,
                    fleeThreshold: 0.02,
                    isAggressive: true,
                    retaliateOnDamage: true,
                    fleeWhenLow: false,
                    alertDuration: 60,
                    fleeDuration: 0
                }
            },
            
            // NPC CUBIKON (X6)
            'cubikon_vru': {
                name: 'Cubikon',
                description: 'Ultimate boss alien with maximum stats. Located in X-6.',
                sprite: 'SpritesNPC/Cubikon/cubikon.png',
                maxHP: 4000,
                maxShield: 3000,
                shieldRegenRate: 3.0,
                shieldRegenDelay: 600,
                speed: 1.6,
                damage: 140,
                radius: 36,
                hitboxRadius: 90,
                colors: {
                    primary: '#231028',
                    secondary: '#160a1a',
                    shield: '#301738'
                },
                experience: 1600,
                credits: 1600,
                uridium: 9,
                honor: 11,
                ai: {
                    detectionRange: 700,
                    attackRange: 200,
                    fleeThreshold: 0.01,
                    isAggressive: true,
                    retaliateOnDamage: true,
                    fleeWhenLow: false,
                    alertDuration: 40,
                    fleeDuration: 0
                }
            },
            'cubikon_mmo': {
                name: 'Cubikon',
                description: 'Ultimate boss alien with maximum stats. Located in X-6.',
                sprite: 'SpritesNPC/Cubikon/cubikon.png',
                maxHP: 4000,
                maxShield: 3000,
                shieldRegenRate: 3.0,
                shieldRegenDelay: 600,
                speed: 1.6,
                damage: 140,
                radius: 36,
                hitboxRadius: 90,
                colors: {
                    primary: '#2b0f0a',
                    secondary: '#1e0a07',
                    shield: '#3e140e'
                },
                experience: 1600,
                credits: 1600,
                uridium: 9,
                honor: 11,
                ai: {
                    detectionRange: 700,
                    attackRange: 200,
                    fleeThreshold: 0.01,
                    isAggressive: true,
                    retaliateOnDamage: true,
                    fleeWhenLow: false,
                    alertDuration: 40,
                    fleeDuration: 0
                }
            },
            'cubikon_eic': {
                name: 'Cubikon',
                description: 'Ultimate boss alien with maximum stats. Located in X-6.',
                sprite: 'SpritesNPC/Cubikon/cubikon.png',
                maxHP: 4000,
                maxShield: 3000,
                shieldRegenRate: 3.0,
                shieldRegenDelay: 600,
                speed: 1.6,
                damage: 140,
                radius: 36,
                hitboxRadius: 90,
                colors: {
                    primary: '#0c1a16',
                    secondary: '#091210',
                    shield: '#0f241c'
                },
                experience: 1600,
                credits: 1600,
                uridium: 9,
                honor: 11,
                ai: {
                    detectionRange: 700,
                    attackRange: 200,
                    fleeThreshold: 0.01,
                    isAggressive: true,
                    retaliateOnDamage: true,
                    fleeWhenLow: false,
                    alertDuration: 40,
                    fleeDuration: 0
                }
            }
        };
    }
    
    // Ottiene configurazione NPC per tipo
    getNPCConfig(type) {
        return this.types[type] || this.types['streuner_vru'];
    }
    
    // Ottiene tutti i tipi disponibili
    getAllTypes() {
        return Object.keys(this.types);
    }
    
    // Ottiene tipi per mappa specifica
    getTypesForMap(mapId) {
        const mapTypes = {
            'x1': ['streuner_vru', 'streuner_mmo', 'streuner_eic'], // X1: Streuner per tutte le fazioni
            'x2': ['lordakia_vru', 'lordakia_mmo', 'lordakia_eic'], // X2: Lordakia per tutte le fazioni
            'x3': ['saimon_vru', 'saimon_mmo', 'saimon_eic', 'mordon_vru', 'mordon_mmo', 'mordon_eic', 'devolarium_vru', 'devolarium_mmo', 'devolarium_eic', 'sibelon_vru', 'sibelon_mmo', 'sibelon_eic'], // X3: Saimon + Mordon + Devolarium + Sibelon per tutte le fazioni
            'x4': ['sibelonit_vru', 'sibelonit_mmo', 'sibelonit_eic', 'lordakium_vru', 'lordakium_mmo', 'lordakium_eic'], // X4: Sibelonit + Lordakium per tutte le fazioni
            'x5': ['kristallin_vru', 'kristallin_mmo', 'kristallin_eic', 'kristallon_vru', 'kristallon_mmo', 'kristallon_eic'], // X5: Kristallin + Kristallon per tutte le fazioni
            'x6': ['cubikon_vru', 'cubikon_mmo', 'cubikon_eic'], // X6: Cubikon per tutte le fazioni
        };
        
        return mapTypes[mapId] || ['streuner_vru'];
    }
    
    // Ottiene tipo principale per mappa
    getMainTypeForMap(mapId) {
        const mainTypes = {
            'x1': 'streuner_vru', // Default VRU Scout per X1
            'x2': 'lordakia_vru', // Default VRU Lordakia per X2
            'x3': 'saimon_vru', // Default VRU Saimon per X3
            'x4': 'sibelonit_vru', // Default VRU Sibelonit per X4
            'x5': 'kristallin_vru', // Default VRU Kristallin per X5
            'x6': 'cubikon_vru' // Default VRU Cubikon per X6
        };
        
        return mainTypes[mapId] || 'streuner_vru';
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
