import { UIComponent } from './UIComponent.js';
import { ShopTab } from './ShopTab.js';
import { ShopButton } from './ShopButton.js';
import { InventoryItem } from '../systems/InventoryItem.js';
import { ThemeConfig, ThemeUtils } from '../config/ThemeConfig.js';

// Pannello Home - Interfaccia principale del giocatore (Online-Ready)
export class HomePanel extends UIComponent {
    constructor(game) {
        super('home-panel', { x: 0, y: 0, width: 1200, height: 800 });
        this.game = game;
        this.visible = false;
        this.isOpen = false; // Aggiunta proprietà isOpen per compatibilità
        this.selectedCategory = 'info';
        this.lastSelectedCategory = 'info';
        
        // Fazioni
        this.selectedFactionId = null;
        this.hoveredFactionId = null;
        
        // Cronologia delle conversioni StarEnergy con esempi (solo ammo e missili)
        this.conversionHistory = [
            { timestamp: Date.now() - 5000, result: '+ 1 R3 missiles' },
            { timestamp: Date.now() - 15000, result: '+ 2 X3 ammo' },
            { timestamp: Date.now() - 30000, result: '+ 1 Star Energy' },
            { timestamp: Date.now() - 45000, result: '+ 3 R2 missiles' },
            { timestamp: Date.now() - 60000, result: '+ 5 X1 ammo' },
            { timestamp: Date.now() - 75000, result: '+ 1 Star Energy' },
            { timestamp: Date.now() - 90000, result: '+ 4 X2 ammo' },
            { timestamp: Date.now() - 105000, result: '+ 1 R1 missiles' },
            { timestamp: Date.now() - 120000, result: '+ 6 X3 ammo' },
            { timestamp: Date.now() - 135000, result: '+ 2 Star Energy' }
        ];
        this.maxHistoryLength = 50; // Mantiene gli ultimi 50 risultati
        this.historyScrollOffset = 0; // Offset per lo scroll della cronologia

        // Handler per lo scroll della cronologia migliorato
        this.handleWheel = (e) => {
            if (this.selectedCategory === 'starenergy') {
            const maxScroll = Math.max(0, (this.conversionHistory.length - 1) * 28 - 300);
            this.historyScrollOffset = Math.min(Math.max(0, this.historyScrollOffset + e.deltaY * 0.8), maxScroll);
            } else if (this.selectedCategory === 'quest') {
                // Scroll diretto delle quest con controlli rigorosi
                e.preventDefault();
                
                // Calcola la nuova posizione
                const newScrollY = this.questScrollY + e.deltaY;
                
                // Applica i limiti rigorosamente
                if (newScrollY < 0) {
                    this.questScrollY = 0; // Non può andare sopra
                } else if (newScrollY > this.maxQuestScrollY) {
                    this.questScrollY = this.maxQuestScrollY; // Non può andare sotto
                } else {
                    this.questScrollY = newScrollY; // Scroll normale
                }
            }
        };
        document.addEventListener('wheel', this.handleWheel);
        
        // Stato per scroll fluido della barra preview shop
        this.thumbnailScrollX = 0;
        this.thumbnailScrollTargetX = 0;
        this.thumbnailVelocityX = 0;
        this.thumbnailIsDragging = false;
        this.thumbnailDragStartX = 0;
        this.thumbnailLastPointerX = 0;
        this.thumbnailMaxScroll = 0;
        this.previewBounds = { x: 0, y: 0, width: 0, height: 0 };
        
        // Eventi per wheel/drag nella barra preview
        this.handlePreviewWheel = (e) => {
            if (this.selectedCategory !== 'shop') return;
            const rect = this.game.canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            const { x, y, width, height } = this.previewBounds;
            if (mx < x || mx > x + width || my < y || my > y + height) return;
            const delta = (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) || 0;
            this.thumbnailScrollTargetX = Math.max(-this.thumbnailMaxScroll, Math.min(0, this.thumbnailScrollTargetX - delta * 0.6));
            e.preventDefault();
        };
        this.handlePreviewDown = (e) => {
            if (this.selectedCategory !== 'shop') return;
            const rect = this.game.canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            const { x, y, width, height } = this.previewBounds;
            if (mx < x || mx > x + width || my < y || my > y + height) return;
            this.thumbnailIsDragging = true;
            this.thumbnailDragStartX = mx - this.thumbnailScrollX;
            this.thumbnailLastPointerX = mx;
            this.thumbnailVelocityX = 0;
        };
        this.handlePreviewMove = (e) => {
            if (!this.thumbnailIsDragging) return;
            const rect = this.game.canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const delta = mx - this.thumbnailLastPointerX;
            this.thumbnailLastPointerX = mx;
            this.thumbnailScrollX = Math.max(-this.thumbnailMaxScroll, Math.min(0, mx - this.thumbnailDragStartX));
            this.thumbnailScrollTargetX = this.thumbnailScrollX;
            this.thumbnailVelocityX = delta;
        };
        this.handlePreviewUp = () => {
            if (!this.thumbnailIsDragging) return;
            this.thumbnailIsDragging = false;
            this.thumbnailScrollTargetX = Math.max(-this.thumbnailMaxScroll, Math.min(0, this.thumbnailScrollX + this.thumbnailVelocityX * 10));
        };
        document.addEventListener('wheel', this.handlePreviewWheel, { passive: false });
        document.addEventListener('mousedown', this.handlePreviewDown);
        document.addEventListener('mousemove', this.handlePreviewMove);
        document.addEventListener('mouseup', this.handlePreviewUp);
        
        // Dati del giocatore (verranno aggiornati dinamicamente)
        // Genera un ID unico per il giocatore
        this.generatePlayerId();
        
        this.playerData = {
            id: this.playerId,
            level: 1,
            rank: '',
            credits: 0,
            uridium: 0,
            experience: 0,
            honor: 0,
            server: 'Europe 1'
        };
        
        // Categorie del menu
        this.categories = [
            { id: 'info', name: 'Info', icon: '📊', available: true },
            { id: 'shop', name: 'Negozio', icon: '🛒', available: true },
            { id: 'quest', name: 'Quest', icon: '📋', available: true },
            { id: 'clan', name: 'Clan', icon: '🏰', available: true },
            { id: 'factions', name: 'Fazioni', icon: '⚔️', available: true },
            { id: 'starenergy', name: 'Star Energy', icon: '⚡', available: true },
            { id: 'stats', name: 'Statistiche', icon: '📈', available: true },
            { id: 'map', name: 'Mappa spaziale', icon: '🗺️', available: true },
            { id: 'settings', name: 'Impostazioni', icon: '⚙️', available: true },
            { id: 'exit', name: 'Esci', icon: '🚪', available: true }
        ];
        
        // Sistema di log per notifiche (rimosso per semplificare)
        this.logs = [];
        this.maxLogs = 50; // Massimo 50 log
        
        // Cronologia e eventi (ora solo log reali)
        this.history = [];
        
        this.activeEvents = [
            // Per ora vuoto come nell'immagine
        ];
        
        // Dimensioni e posizioni
        // Dimensioni del pannello responsive
        this.panelWidth = Math.min(1200, this.game.canvas.width * 0.9);
        this.panelHeight = Math.min(800, this.game.canvas.height * 0.9);
        this.navWidth = 250;
        this.contentWidth = this.panelWidth - this.navWidth;
        
        
        // Sistema shop
        this.shopItems = {
            ammunition: {
                // Laser
                laser_x1: { name: 'Munizioni Laser x1', price: 10, amount: 100, max: 10000, icon: '🔴', type: 'laser', key: 'x1' },
                laser_x2: { name: 'Munizioni Laser x2', price: 25, amount: 50, max: 5000, icon: '🟠', type: 'laser', key: 'x2' },
                laser_x3: { name: 'Munizioni Laser x3', price: 50, amount: 20, max: 2000, icon: '🟡', type: 'laser', key: 'x3' },
                // Missili
                missile_r1: { name: 'Missili R1', price: 100, amount: 10, max: 500, icon: '🟢', type: 'missile', key: 'r1' },
                missile_r2: { name: 'Missili R2', price: 250, amount: 5, max: 250, icon: '🔵', type: 'missile', key: 'r2' },
                missile_r3: { name: 'Missili R3', price: 500, amount: 2, max: 100, icon: '🟣', type: 'missile', key: 'r3' }
            },
            equipment: {
                // Cannoni (nella categoria EQUIP)
                cannon_lf1: { name: 'Cannoni LF1', price: 200, amount: 5, max: 100, icon: '⚡', type: 'cannon', key: 'lf1' },
                cannon_lf2: { name: 'Cannoni LF2', price: 500, amount: 3, max: 50, icon: '⚡', type: 'cannon', key: 'lf2' },
                cannon_lf3: { name: 'Cannoni LF3', price: 1000, amount: 1, max: 25, icon: '⚡', type: 'cannon', key: 'lf3' }
            },
            laser: {
                // Laser (nella categoria LASER)
                lf1: { name: 'Laser LF1 (100 danno)', price: 150, amount: 10, max: 200, icon: '🔴', type: 'laser', key: 'lf1', damage: 100 },
                lf2: { name: 'Laser LF2 (200 danno)', price: 300, amount: 5, max: 100, icon: '🟠', type: 'laser', key: 'lf2', damage: 200 },
                lf3: { name: 'Laser LF3 (300 danno)', price: 600, amount: 2, max: 50, icon: '🟡', type: 'laser', key: 'lf3', damage: 300 },
                lf4: { name: 'Laser LF4 (400 danno)', price: 1200, amount: 1, max: 25, icon: '🟢', type: 'laser', key: 'lf4', damage: 400 }
            },
            generators: {
                // Generatori e Scudi (categoria GENERATORI)
                generator_1: { name: 'Generatore 1', price: 500, amount: 1, max: 50, icon: '⚡', type: 'generator', key: 'gen1' },
                generator_2: { name: 'Generatore 2', price: 1000, amount: 1, max: 30, icon: '⚡', type: 'generator', key: 'gen2' },
                generator_3: { name: 'Generatore 3', price: 2000, amount: 1, max: 20, icon: '⚡', type: 'generator', key: 'gen3' },
                // Scudi nella stessa categoria
                shield_1: { name: 'Shield 1', price: 600, amount: 1, max: 50, icon: '🛡️', type: 'shield', key: 'sh1', protection: 50 },
                shield_2: { name: 'Shield 2', price: 1200, amount: 1, max: 30, icon: '🛡️', type: 'shield', key: 'sh2', protection: 100 },
                shield_3: { name: 'Shield 3', price: 2400, amount: 1, max: 20, icon: '🛡️', type: 'shield', key: 'sh3', protection: 150 }
            },
            consumables: {
                // Placeholder per consumabili futuri
            },
            uav: {
                // Droni UAV
                flax_drone: { 
                    name: 'Flax Drone', 
                    price: 1000, 
                    amount: 1, 
                    max: 5, 
                    icon: '🚁', 
                    type: 'uav', 
                    key: 'flax_drone',
                    droneType: 'flax',
                    slots: 1,
                    description: 'Drone Flax - 1 slot per laser o scudi',
                    cost: { credits: 1000 }
                },
                iris_drone: { 
                    name: 'Iris Drone', 
                    price: 500, 
                    amount: 1, 
                    max: 3, 
                    icon: '🚁', 
                    type: 'uav', 
                    key: 'iris_drone',
                    droneType: 'iris',
                    slots: 2,
                    description: 'Drone Iris - 2 slot per laser o scudi',
                    cost: { uridium: 500 }
                }
            },
            ships: {
                ship_urus: { name: 'Urus Fighter', price: 50000, currency: 'credits', amount: 1, icon: '🚀', type: 'ship', shipNumber: 1, description: 'Nave base bilanciata (HP 1000 / Shield 1000)' },
                ship_alt:  { name: 'Interceptor Nova', price: 100000, currency: 'credits', amount: 1, icon: '🚀', type: 'ship', shipNumber: 2, description: 'Nave veloce (HP 1600 / Shield 600)' },
                ship_falcon: { name: 'Falcon', price: 120000, currency: 'credits', amount: 1, icon: '🛰️', type: 'ship', shipNumber: 3, description: 'Falcon (HP 1200 / Shield 1400)' },
                ship_liberator: { name: 'Liberator', price: 150000, currency: 'credits', amount: 1, icon: '🛸', type: 'ship', shipNumber: 4, description: 'HP 16000 / Shield 12000 / Velocità 300' },
                ship_piranha: { name: 'Piranha', price: 220000, currency: 'credits', amount: 1, icon: '🛸', type: 'ship', shipNumber: 5, description: 'HP 32000 / Shield 24000 / Velocità 340' },
                ship_nostromo: { name: 'Nostromo', price: 300000, currency: 'credits', amount: 1, icon: '🛸', type: 'ship', shipNumber: 6, description: 'HP 64000 / Shield 48000 / Velocità 300' },
                ship_bigboy: { name: 'BigBoy', price: 360000, currency: 'credits', amount: 1, icon: '🛸', type: 'ship', shipNumber: 7, description: 'HP 64000 / Shield 52000 / Velocità 240' },
                ship_vengeance: { name: 'Vengeance', price: 420000, currency: 'credits', amount: 1, icon: '🛸', type: 'ship', shipNumber: 8, description: 'HP 64000 / Shield 50000 / Velocità 380' },
                ship_goliath: { name: 'Goliath', price: 650000, currency: 'credits', amount: 1, icon: '🛸', type: 'ship', shipNumber: 9, description: 'HP 160000 / Shield 120000 / Velocità 300' },
                ship_leonov: { name: 'Leonov', price: 500000, currency: 'credits', amount: 1, icon: '🛸', type: 'ship', shipNumber: 10, description: 'HP 80000 / Shield 60000 / Velocità 360' }
            }
        };
        
        this.selectedShopCategory = 'ammunition';
        this.selectedShipItem = 'ship_urus';
        this.shopScrollY = 0;
        this.selectedAmmoItem = 'laser_x1'; // Item selezionato per visualizzazione
        this.selectedLaserItem = 'lf1'; // Item selezionato per laser
        this.selectedGeneratorItem = 'generator_1'; // Item selezionato per generatori
        this.selectedUAVItem = 'flax_drone'; // Item selezionato per UAV
        
        // Scroll orizzontale thumbnail
        this.thumbnailScrollX = 0;
        this.thumbnailScrollSpeed = 200;
        
        // Sistema popup
        this.popup = {
            visible: false,
            message: '',
            type: 'success', // 'success' o 'error'
            timer: 0,
            duration: 3000, // 3 secondi
            alpha: 0
        };
        
        // Sistema quest
        this.questTabs = ['disponibili', 'accettate', 'completate', 'tutte'];
        this.selectedQuestTab = 'disponibili';
        this.selectedQuest = null;
        this.questScrollY = 0;
        this.maxQuestScrollY = 0;
        this.questDetailsScrollY = 0;
        this.maxQuestDetailsScrollY = 0;
        
        // Dati quest reali con sistema progressivo
        this.questData = {
            disponibili: {
                'livello1': [
                    { 
                        id: 'kill_streuner', 
                        name: 'Uccidi 5 Streuner', 
                        level: 1, 
                        status: 'available',
                        description: 'Elimina 5 Streuner per dimostrare le tue abilità di combattimento.',
                        conditions: [
                            { type: 'kill_streuner', description: 'Uccidi Streuner', quantity: 5, completed: 0 }
                        ],
                        rewards: [
                            { type: 'experience', description: 'Esperienza', quantity: 500 },
                            { type: 'honor', description: 'Onore', quantity: 5 },
                            { type: 'credits', description: 'Crediti', quantity: 1000 }
                        ]
                    },
                    { 
                        id: 'collect_bonus_box', 
                        name: 'Raccogli 5 Bonus Box', 
                        level: 1, 
                        status: 'available',
                        description: 'Raccogli 5 Bonus Box per ottenere risorse preziose.',
                        conditions: [
                            { type: 'collect_bonus_box', description: 'Raccogli Bonus Box', quantity: 5, completed: 0 }
                        ],
                        rewards: [
                            { type: 'experience', description: 'Esperienza', quantity: 300 },
                            { type: 'credits', description: 'Crediti', quantity: 500 }
                        ]
                    },
                    { 
                        id: 'survive_2min', 
                        name: 'Sopravvivenza Base', 
                        level: 1, 
                        status: 'available',
                        description: 'Rimani vivo per 2 minuti in zona pericolosa.',
                        conditions: [
                            { type: 'survive_time', description: 'Sopravvivi', quantity: 120, completed: 0 }
                        ],
                        rewards: [
                            { type: 'experience', description: 'Esperienza', quantity: 400 },
                            { type: 'credits', description: 'Crediti', quantity: 800 }
                        ]
                    },
                    { 
                        id: 'kill_any_alien', 
                        name: 'Primo Contatto', 
                        level: 1, 
                        status: 'available',
                        description: 'Elimina 3 alieni qualsiasi per iniziare la tua carriera da cacciatore.',
                        conditions: [
                            { type: 'kill_any_alien', description: 'Uccidi alieni', quantity: 3, completed: 0 }
                        ],
                        rewards: [
                            { type: 'experience', description: 'Esperienza', quantity: 350 },
                            { type: 'honor', description: 'Onore', quantity: 3 },
                            { type: 'credits', description: 'Crediti', quantity: 600 }
                        ]
                    }
                ],
                'livello2': [
                    { 
                        id: 'kill_streuner_advanced', 
                        name: 'Cacciatore di Streuner', 
                        level: 2, 
                        status: 'available',
                        description: 'Elimina 15 Streuner per dimostrare la tua maestria.',
                        conditions: [
                            { type: 'kill_streuner', description: 'Uccidi Streuner', quantity: 15, completed: 0 }
                        ],
                        rewards: [
                            { type: 'experience', description: 'Esperienza', quantity: 1200 },
                            { type: 'honor', description: 'Onore', quantity: 12 },
                            { type: 'credits', description: 'Crediti', quantity: 2500 }
                        ]
                    },
                    { 
                        id: 'survive_5min', 
                        name: 'Resistenza', 
                        level: 2, 
                        status: 'available',
                        description: 'Sopravvivi per 5 minuti senza morire in zona alieni.',
                        conditions: [
                            { type: 'survive_time', description: 'Sopravvivi', quantity: 300, completed: 0 }
                        ],
                        rewards: [
                            { type: 'experience', description: 'Esperienza', quantity: 1000 },
                            { type: 'honor', description: 'Onore', quantity: 8 },
                            { type: 'credits', description: 'Crediti', quantity: 2000 }
                        ]
                    },
                    { 
                        id: 'kill_alien_type', 
                        name: 'Specialista', 
                        level: 2, 
                        status: 'available',
                        description: 'Elimina 10 alieni di un tipo specifico per diventare uno specialista.',
                        conditions: [
                            { type: 'kill_alien_type', description: 'Uccidi alieni specifici', quantity: 10, completed: 0 }
                        ],
                        rewards: [
                            { type: 'experience', description: 'Esperienza', quantity: 1500 },
                            { type: 'honor', description: 'Onore', quantity: 10 },
                            { type: 'credits', description: 'Crediti', quantity: 3000 }
                        ]
                    },
                    { 
                        id: 'collect_many_bonus', 
                        name: 'Raccoglitore Esperto', 
                        level: 2, 
                        status: 'available',
                        description: 'Raccogli 20 Bonus Box per dimostrare la tua efficienza.',
                        conditions: [
                            { type: 'collect_bonus_box', description: 'Raccogli Bonus Box', quantity: 20, completed: 0 }
                        ],
                        rewards: [
                            { type: 'experience', description: 'Esperienza', quantity: 800 },
                            { type: 'credits', description: 'Crediti', quantity: 1500 }
                        ]
                    }
                ],
                'livello3': [
                    { 
                        id: 'kill_streuner_master', 
                        name: 'Maestro Streuner', 
                        level: 3, 
                        status: 'available',
                        description: 'Elimina 50 Streuner per diventare un vero maestro.',
                        conditions: [
                            { type: 'kill_streuner', description: 'Uccidi Streuner', quantity: 50, completed: 0 }
                        ],
                        rewards: [
                            { type: 'experience', description: 'Esperienza', quantity: 3000 },
                            { type: 'honor', description: 'Onore', quantity: 25 },
                            { type: 'credits', description: 'Crediti', quantity: 5000 }
                        ]
                    },
                    { 
                        id: 'survive_10min', 
                        name: 'Sopravvivenza Estrema', 
                        level: 3, 
                        status: 'available',
                        description: 'Sopravvivi per 10 minuti in zona pericolosa - una vera sfida!',
                        conditions: [
                            { type: 'survive_time', description: 'Sopravvivi', quantity: 600, completed: 0 }
                        ],
                        rewards: [
                            { type: 'experience', description: 'Esperienza', quantity: 2500 },
                            { type: 'honor', description: 'Onore', quantity: 20 },
                            { type: 'credits', description: 'Crediti', quantity: 4000 }
                        ]
                    },
                    { 
                        id: 'kill_alien_boss', 
                        name: 'Cacciatore di Boss', 
                        level: 3, 
                        status: 'available',
                        description: 'Elimina 5 boss alieni per dimostrare la tua forza.',
                        conditions: [
                            { type: 'kill_alien_boss', description: 'Uccidi boss alieni', quantity: 5, completed: 0 }
                        ],
                        rewards: [
                            { type: 'experience', description: 'Esperienza', quantity: 4000 },
                            { type: 'honor', description: 'Onore', quantity: 30 },
                            { type: 'credits', description: 'Crediti', quantity: 6000 }
                        ]
                    },
                    { 
                        id: 'clear_map', 
                        name: 'Spazzino Spaziale', 
                        level: 3, 
                        status: 'available',
                        description: 'Pulisci completamente una mappa da tutti gli alieni.',
                        conditions: [
                            { type: 'clear_map', description: 'Pulisci mappa', quantity: 1, completed: 0 }
                        ],
                        rewards: [
                            { type: 'experience', description: 'Esperienza', quantity: 3500 },
                            { type: 'honor', description: 'Onore', quantity: 35 },
                            { type: 'credits', description: 'Crediti', quantity: 7000 }
                        ]
                    }
                ],
                'livello4': [
                    { 
                        id: 'kill_streuner_legend', 
                        name: 'Leggenda Streuner', 
                        level: 4, 
                        status: 'available',
                        description: 'Elimina 100 Streuner per diventare una leggenda.',
                        conditions: [
                            { type: 'kill_streuner', description: 'Uccidi Streuner', quantity: 100, completed: 0 }
                        ],
                        rewards: [
                            { type: 'experience', description: 'Esperienza', quantity: 6000 },
                            { type: 'honor', description: 'Onore', quantity: 50 },
                            { type: 'credits', description: 'Crediti', quantity: 10000 }
                        ]
                    },
                    { 
                        id: 'survive_20min', 
                        name: 'Sopravvivenza Leggendaria', 
                        level: 4, 
                        status: 'available',
                        description: 'Sopravvivi per 20 minuti - solo per i più coraggiosi!',
                        conditions: [
                            { type: 'survive_time', description: 'Sopravvivi', quantity: 1200, completed: 0 }
                        ],
                        rewards: [
                            { type: 'experience', description: 'Esperienza', quantity: 5000 },
                            { type: 'honor', description: 'Onore', quantity: 40 },
                            { type: 'credits', description: 'Crediti', quantity: 8000 }
                        ]
                    },
                    { 
                        id: 'kill_many_boss', 
                        name: 'Distruttore di Boss', 
                        level: 4, 
                        status: 'available',
                        description: 'Elimina 15 boss alieni per diventare un distruttore.',
                        conditions: [
                            { type: 'kill_alien_boss', description: 'Uccidi boss alieni', quantity: 15, completed: 0 }
                        ],
                        rewards: [
                            { type: 'experience', description: 'Esperienza', quantity: 8000 },
                            { type: 'honor', description: 'Onore', quantity: 60 },
                            { type: 'credits', description: 'Crediti', quantity: 12000 }
                        ]
                    },
                    { 
                        id: 'clear_multiple_maps', 
                        name: 'Pulitore Galattico', 
                        level: 4, 
                        status: 'available',
                        description: 'Pulisci 3 mappe completamente per diventare un pulitore galattico.',
                        conditions: [
                            { type: 'clear_map', description: 'Pulisci mappe', quantity: 3, completed: 0 }
                        ],
                        rewards: [
                            { type: 'experience', description: 'Esperienza', quantity: 7000 },
                            { type: 'honor', description: 'Onore', quantity: 70 },
                            { type: 'credits', description: 'Crediti', quantity: 15000 }
                        ]
                    }
                ],
                'livello5': [
                    { 
                        id: 'kill_streuner_god', 
                        name: 'Dio degli Streuner', 
                        level: 5, 
                        status: 'available',
                        description: 'Elimina 500 Streuner per diventare un dio del combattimento.',
                        conditions: [
                            { type: 'kill_streuner', description: 'Uccidi Streuner', quantity: 500, completed: 0 }
                        ],
                        rewards: [
                            { type: 'experience', description: 'Esperienza', quantity: 15000 },
                            { type: 'honor', description: 'Onore', quantity: 100 },
                            { type: 'credits', description: 'Crediti', quantity: 25000 }
                        ]
                    },
                    { 
                        id: 'survive_1hour', 
                        name: 'Sopravvivenza Eterna', 
                        level: 5, 
                        status: 'available',
                        description: 'Sopravvivi per 1 ora intera - la sfida definitiva!',
                        conditions: [
                            { type: 'survive_time', description: 'Sopravvivi', quantity: 3600, completed: 0 }
                        ],
                        rewards: [
                            { type: 'experience', description: 'Esperienza', quantity: 12000 },
                            { type: 'honor', description: 'Onore', quantity: 80 },
                            { type: 'credits', description: 'Crediti', quantity: 20000 }
                        ]
                    },
                    { 
                        id: 'kill_legendary_boss', 
                        name: 'Cacciatore di Leggende', 
                        level: 5, 
                        status: 'available',
                        description: 'Elimina 50 boss alieni per diventare un cacciatore di leggende.',
                        conditions: [
                            { type: 'kill_alien_boss', description: 'Uccidi boss alieni', quantity: 50, completed: 0 }
                        ],
                        rewards: [
                            { type: 'experience', description: 'Esperienza', quantity: 20000 },
                            { type: 'honor', description: 'Onore', quantity: 150 },
                            { type: 'credits', description: 'Crediti', quantity: 30000 }
                        ]
                    },
                    { 
                        id: 'clear_all_maps', 
                        name: 'Salvatore della Galassia', 
                        level: 5, 
                        status: 'available',
                        description: 'Pulisci tutte le mappe della galassia - la missione finale!',
                        conditions: [
                            { type: 'clear_map', description: 'Pulisci tutte le mappe', quantity: 10, completed: 0 }
                        ],
                        rewards: [
                            { type: 'experience', description: 'Esperienza', quantity: 25000 },
                            { type: 'honor', description: 'Onore', quantity: 200 },
                            { type: 'credits', description: 'Crediti', quantity: 50000 }
                        ]
                    }
                ]
            },
            accettate: {},
            completate: [],
            tutte: []
        };
        
        
        this.x = (this.game.canvas.width - this.panelWidth) / 2;
        this.y = (this.game.canvas.height - this.panelHeight) / 2;
        
        // Inizializza componenti UI
        this.shopTabs = [];
        this.shopButtons = [];
        this.setupUIComponents();
        this.setupEventListeners();
    }
    
    // Setup componenti UI
    setupUIComponents() {
        this.createShopTabs();
        this.createShopButtons();
    }
    
    // Crea le tab del negozio
    createShopTabs() {
        const tabConfig = { width: 140, height: 40, yOffset: 70 };
        const tabColors = {
            'ammunition': '#e94560',
            'laser': '#4a90e2',
            'generators': '#50c878',
            'uav': '#ff6b6b'
        };
        
        ['ammunition', 'laser', 'generators', 'uav'].forEach((id, index) => {
            const tab = new ShopTab(
                id,
                id.toUpperCase(),
                { 
                    x: 20 + index * tabConfig.width, 
                    y: tabConfig.yOffset, 
                    width: tabConfig.width, 
                    height: tabConfig.height 
                },
                tabColors[id],
                this.selectedShopCategory === id
            );
            
            // Collega eventi e state
            if (this.eventSystem) {
                tab.setEventSystem(this.eventSystem);
            }
            if (this.gameState) {
                tab.setGameState(this.gameState);
            }
            
            this.shopTabs.push(tab);
        });
    }
    
    // Crea i pulsanti del negozio
    createShopButtons() {
        // Pulsanti per le opzioni di acquisto
        // Questi verranno creati dinamicamente in base all'item selezionato
    }
    
    // Setup event listeners
    setupEventListeners() {
        if (!this.eventSystem) return;
        
        // Ascolta eventi di rete
        this.eventSystem.on('network:shop:tab:change', (data) => {
            this.handleRemoteTabChange(data);
        });
        
        this.eventSystem.on('network:shop:button:action', (data) => {
            this.handleRemoteButtonAction(data);
        });
        
        // Ascolta aggiornamenti di stato
        this.eventSystem.on('sync:state:sync', (data) => {
            this.handleStateSync(data);
        });
    }
    
    // Gestisce cambio tab remoto
    handleRemoteTabChange(data) {
        if (data.tabId && data.tabId !== this.selectedShopCategory) {
            this.selectedShopCategory = data.tabId;
            this.updateShopTabsSelection();
        }
    }
    
    // Gestisce azione pulsante remoto
    handleRemoteButtonAction(data) {
        // Implementa logica per azioni remote
        console.log('Remote button action:', data);
    }
    
    // Gestisce sincronizzazione stato
    handleStateSync(data) {
        if (data.shop) {
            this.selectedShopCategory = data.shop.selectedCategory || 'ammunition';
            this.updateShopTabsSelection();
        }
    }
    
    // Aggiorna selezione tab
    updateShopTabsSelection() {
        this.shopTabs.forEach(tab => {
            tab.setSelected(tab.id === this.selectedShopCategory);
        });
    }
    
    toggle() {
        this.visible = !this.visible;
        this.isOpen = this.visible; // Sincronizza isOpen con visible
        if (this.visible) {
            this.game.audioManager.playSound('stationpanel_open');
            this.centerPanel();
        }
    }
    
    show() {
        this.visible = true;
        this.isOpen = true; // Sincronizza isOpen con visible
        this.updateDimensions(); // Aggiorna le dimensioni prima di centrare
        this.centerPanel();
    }
    
    hide() {
        this.visible = false;
        
        // Rimuovi gli event listener quando il pannello viene nascosto
        if (this.starEnergyClickHandler && this.game.canvas) {
            this.game.canvas.removeEventListener('click', this.starEnergyClickHandler);
            this.starEnergyClickHandler = null;
        }
        this.isOpen = false; // Sincronizza isOpen con visible
    }
    
    // Centra il pannello
    centerPanel() {
        this.x = (this.game.canvas.width - this.panelWidth) / 2;
        this.y = (this.game.canvas.height - this.panelHeight) / 2;
    }
    
    // Mostra popup di notifica
    showPopup(message, type = 'success') {
        this.popup.visible = true;
        this.popup.message = message;
        this.popup.type = type;
        this.popup.timer = 0;
        this.popup.alpha = 0;
    }
    
    // Aggiorna popup (da chiamare nel game loop)
    updatePopup(deltaTime) {
        if (!this.popup.visible) return;
        
        this.popup.timer += deltaTime;
        
        // Fade in (primi 200ms)
        if (this.popup.timer < 200) {
            this.popup.alpha = Math.min(1, this.popup.timer / 200);
        }
        // Fade out (ultimi 500ms)
        else if (this.popup.timer > this.popup.duration - 500) {
            this.popup.alpha = Math.max(0, (this.popup.duration - this.popup.timer) / 500);
        }
        // Visibile al 100%
        else {
            this.popup.alpha = 1;
        }
        
        // Nascondi popup quando scade
        if (this.popup.timer >= this.popup.duration) {
            this.popup.visible = false;
        }
    }
    
    stopDragging() {
        // Metodo per compatibilità con il sistema di drag
        // Il pannello Home non supporta il drag, quindi è vuoto
    }
    
    // Genera un ID unico per il giocatore
    generatePlayerId() {
        // RIMOSSO: const savedId = localStorage.getItem('mmorpg_player_id');
        // RIMOSSO: if (savedId) {
        //     this.playerId = savedId;
        // } else {
        //     // Genera un nuovo ID casuale di 6 cifre
        //     this.playerId = Math.floor(100000 + Math.random() * 900000).toString();
        //     // Salva l'ID per future sessioni
        //     // RIMOSSO: localStorage.setItem('mmorpg_player_id', this.playerId);
        // }
        
        // L'ID del giocatore è ora gestito per-account
        // Genera sempre un nuovo ID casuale di 6 cifre
        this.playerId = Math.floor(100000 + Math.random() * 900000).toString();
    }
    
    updatePlayerData() {
        // Aggiorna i dati del giocatore con quelli reali
        if (this.game.ship) {
            // Leggi le risorse direttamente dalla nave (Single Source of Truth)
            this.playerData.credits = this.game.ship.getResource('credits') || 0;
            this.playerData.uridium = this.game.ship.getResource('uridium') || 0;
            this.playerData.honor = this.game.ship.getResource('honor') || 0;
            this.playerData.experience = this.game.ship.getResource('experience') || 0;
            
            // Leggi il livello dal sistema integrato
            this.playerData.level = this.game.ship.currentLevel || 1;
            
            // Rimosso il codice di sincronizzazione con upgradeManager (non più necessario)
            
        }
    }
    
    // Aggiorna il progresso delle quest
    updateQuestProgress() {
        // Aggiorna solo le quest accettate
        Object.keys(this.questData.accettate).forEach(levelKey => {
            const levelQuests = this.questData.accettate[levelKey];
            if (levelQuests) {
                levelQuests.forEach(quest => {
                    this.updateQuestCondition(quest);
                });
            }
        });
    }
    
    // Aggiorna una condizione specifica di una quest
    updateQuestCondition(quest) {
        if (!quest.conditions) return;
        
        let allConditionsCompleted = true;
        
        quest.conditions.forEach(condition => {
            // Ottieni il progresso basato sullo snapshot (solo progressi dopo l'accettazione)
            let currentProgress = 0;
            
            if (this.game && this.game.ship && this.game.ship.getQuestProgress) {
                currentProgress = this.game.ship.getQuestProgress(condition.type);
            } else {
                // Fallback al sistema vecchio se il nuovo non è disponibile
            switch (condition.type) {
                case 'kill_streuner':
                        currentProgress = this.game.ship ? this.game.ship.streunerKilled : 0;
                        break;
                    case 'collect_bonus_box':
                        currentProgress = this.game.ship ? this.game.ship.bonusBoxesCollected : 0;
                        break;
                    case 'survive_time':
                        currentProgress = this.game.ship ? this.game.ship.survivalTime : 0;
                        break;
                    case 'kill_any_alien':
                        currentProgress = this.game.ship ? this.game.ship.aliensKilled : 0;
                        break;
                    case 'kill_alien_type':
                        currentProgress = this.game.ship ? this.game.ship.alienTypeKilled : 0;
                        break;
                    case 'kill_alien_boss':
                        currentProgress = this.game.ship ? this.game.ship.bossAliensKilled : 0;
                        break;
                    case 'clear_map':
                        currentProgress = this.game.ship ? this.game.ship.mapsCleared : 0;
                        break;
                }
            }
            
            // Aggiorna il progresso della condizione
            const newCompleted = Math.min(currentProgress, condition.quantity);
                        if (newCompleted !== condition.completed) {
                            condition.completed = newCompleted;
                        }
                        if (condition.completed < condition.quantity) {
                            allConditionsCompleted = false;
            }
        });
        
        // Se tutte le condizioni sono completate, completa la quest
        if (allConditionsCompleted && !quest.completed) {
            this.completeQuest(quest);
        }
    }
    
    // Completa una quest e accredita le ricompense
    completeQuest(quest) {
        console.log(`🎉 Quest completata: ${quest.name}`);
        
        // Marca la quest come completata
        quest.completed = true;
        quest.status = 'completed';
        
        // Sposta la quest dalla sezione accettate a quella completate
        this.moveQuestToCompleted(quest);
        
        // Accredita le ricompense
        this.giveQuestRewards(quest);
        
        // Mostra notifica di completamento
        if (this.game.notifications) {
            this.game.notifications.questCompleted(quest.name, quest.rewards);
        }
    }
    
    // Sposta una quest dalla sezione accettate a quella completate
    moveQuestToCompleted(quest) {
        // Rimuovi dalle quest accettate
        Object.keys(this.questData.accettate).forEach(levelKey => {
            const levelQuests = this.questData.accettate[levelKey];
            if (levelQuests) {
                const index = levelQuests.findIndex(q => q.id === quest.id);
                if (index !== -1) {
                    levelQuests.splice(index, 1);
                }
            }
        });
        
        // Aggiungi alle quest completate
        if (!this.questData.completate[quest.level]) {
            this.questData.completate[quest.level] = [];
        }
        this.questData.completate[quest.level].push(quest);
    }
    
    // Accredita le ricompense di una quest
    giveQuestRewards(quest) {
        if (!quest.rewards || !this.game.ship) return;
        
        quest.rewards.forEach(reward => {
            switch (reward.type) {
                case 'credits':
                    this.game.ship.addResource('credits', reward.quantity);
                    console.log(`💰 Ricompensa: +${reward.quantity} Crediti`);
                    break;
                case 'uridium':
                    this.game.ship.addResource('uridium', reward.quantity);
                    console.log(`💎 Ricompensa: +${reward.quantity} Uridium`);
                    break;
                case 'honor':
                    this.game.ship.addResource('honor', reward.quantity);
                    console.log(`🏆 Ricompensa: +${reward.quantity} Onore`);
                    break;
                case 'experience':
                    this.game.ship.addResource('experience', reward.quantity);
                    console.log(`⭐ Ricompensa: +${reward.quantity} Esperienza`);
                    break;
            }
        });
    }
    
    // Aggiorna le dimensioni del pannello quando il canvas cambia
    updateDimensions() {
        this.panelWidth = Math.min(1200, this.game.canvas.width * 0.9);
        this.panelHeight = Math.min(800, this.game.canvas.height * 0.9);
        this.contentWidth = this.panelWidth - this.navWidth;
    }
    
    
    handleClick(x, y) {
        if (!this.visible) {
            return false;
        }
        
        // Calcola posizione centrata (stesso calcolo di draw)
        const panelX = (this.game.canvas.width - this.panelWidth) / 2;
        const panelY = (this.game.canvas.height - this.panelHeight) / 2;
        
        // Controlla se il click è dentro il pannello
        const isInsidePanel = x >= panelX && x <= panelX + this.panelWidth && 
                             y >= panelY && y <= panelY + this.panelHeight;
        
        // Se il click è fuori dal pannello, chiudilo
        if (!isInsidePanel) {
            this.hide();
            return true;
        }
        
        
        // Riproduci suono click solo per interfaccia
        if (this.game.audioManager) {
            this.game.audioManager.playClickSound();
        }
        
        // Controlla se clicca su chiudi
        if (this.isCloseButtonClicked(x, y, panelX, panelY)) {
            this.hide();
            return true;
        }
        
        // Controlla se clicca su una categoria
        const clickedCategory = this.getClickedCategory(x, y, panelX, panelY);
        if (clickedCategory) {
            this.selectCategory(clickedCategory);
            return true;
        }
        
        // Se siamo nel shop, gestisci i click del shop
        if (this.selectedCategory === 'shop') {
            const handled = this.handleShopClick(x, y, panelX, panelY);
            if (handled) {
                return true;
            }
        }
        
        // Se siamo nelle quest, gestisci i click delle quest
        if (this.selectedCategory === 'quest') {
            const handled = this.handleQuestClick(x, y, panelX, panelY);
            if (handled) {
                return true;
            }
        }
        
        // Se siamo nel clan, gestisci i click del clan
        if (this.selectedCategory === 'clan') {
            const handled = this.handleClanClick(x, y, panelX, panelY);
            if (handled) {
                return true;
            }
        }
        
        // Se siamo in exit, gestisci i click del logout
        if (this.selectedCategory === 'exit') {
            const handled = this.handleLogoutClick(x, y, panelX, panelY);
            if (handled) {
                return true;
            }
        }
        
        // Se siamo nelle fazioni, gestisci i click delle fazioni
        if (this.selectedCategory === 'factions') {
            const contentX = panelX + this.navWidth;
            const contentY = panelY + 60;
            const handled = this.handleFactionClick(x, y, contentX, contentY);
            if (handled) {
                return true;
            }
        }
        
        // Se siamo nel pannello home e non è stato gestito, restituisci true
        // per evitare che il click venga gestito da altri elementi
        return true;
    }
    
    // Gestisce il movimento del mouse per hover effects
    handleMouseMove(x, y) {
        if (!this.visible) {
            return;
        }
        
        // Calcola posizione centrata (stesso calcolo di draw)
        const panelX = (this.game.canvas.width - this.panelWidth) / 2;
        const panelY = (this.game.canvas.height - this.panelHeight) / 2;
        
        // Se siamo nelle fazioni, gestisci il movimento del mouse per hover
        if (this.selectedCategory === 'factions') {
            const contentX = panelX + this.navWidth;
            const contentY = panelY + 60;
            this.handleFactionMouseMove(x, y, contentX, contentY);
        }
    }
    
    
    scrollThumbnailsLeft() {
        if (this.selectedCategory === 'shop' && ['ammunition', 'laser', 'generators'].includes(this.selectedShopCategory)) {
            const items = this.shopItems[this.selectedShopCategory];
            const thumbSpacing = 200;
            const totalWidth = Object.keys(items).length * thumbSpacing;
            const visibleWidth = this.contentWidth - 40;
            const maxScroll = Math.max(0, totalWidth - visibleWidth);
            
            this.thumbnailScrollX += this.thumbnailScrollSpeed;
            this.thumbnailScrollX = Math.max(-maxScroll, Math.min(0, this.thumbnailScrollX));
        }
    }
    
    scrollThumbnailsRight() {
        if (this.selectedCategory === 'shop' && ['ammunition', 'laser', 'generators'].includes(this.selectedShopCategory)) {
            const items = this.shopItems[this.selectedShopCategory];
            const thumbSpacing = 200;
            const totalWidth = Object.keys(items).length * thumbSpacing;
            const visibleWidth = this.contentWidth - 40;
            const maxScroll = Math.max(0, totalWidth - visibleWidth);
            
            this.thumbnailScrollX -= this.thumbnailScrollSpeed;
            this.thumbnailScrollX = Math.max(-maxScroll, Math.min(0, this.thumbnailScrollX));
        }
    }
    
    isCloseButtonClicked(x, y, panelX, panelY) {
        const closeX = panelX + this.panelWidth - 40;
        const closeY = panelY + 20;
        return x >= closeX && x <= closeX + 20 && y >= closeY && y <= closeY + 20;
    }
    
    getClickedCategory(x, y, panelX, panelY) {
        const navX = panelX;
        const navY = panelY + 60; // Inizia dopo il titolo
        const itemHeight = 40;
        // Rimuoviamo il padding per rendere l'intera area cliccabile
        for (let i = 0; i < this.categories.length; i++) {
            const itemY = navY + i * itemHeight;
            const category = this.categories[i];
            
            // Controlla se il click è nell'area dell'elemento
            if (x >= navX && x <= navX + this.navWidth && 
                y >= itemY && y <= itemY + itemHeight) {
                return category;
            }
        }
        return null;
    }
    
    selectCategory(category) {
        this.selectedCategory = category.id;
        // Aggiorna categoria precedente per tracking
        if (this.lastSelectedCategory !== category.id) {
            this.lastSelectedCategory = category.id;
        }
    }
    
    draw(ctx) {
        if (!this.visible) return;
        
        // Aggiorna i dati del giocatore
        this.updatePlayerData();
        
        // Aggiorna il progresso delle quest
        this.updateQuestProgress();
        
        // Calcola posizione centrata ogni volta
        this.x = (this.game.canvas.width - this.panelWidth) / 2;
        this.y = (this.game.canvas.height - this.panelHeight) / 2;
        
        // Overlay scuro
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);
        
        // Pannello principale
        this.drawMainPanel(ctx);
        
        // Pannello di navigazione
        this.drawNavigationPanel(ctx);
        
        // Contenuto principale
        this.drawMainContent(ctx);
        
        // Disegna popup se visibile
        if (this.popup.visible) {
            this.drawPopup(ctx);
        }
    }
    
    // Disegna popup di notifica
    drawPopup(ctx) {
        if (!this.popup.visible || this.popup.alpha <= 0) return;
        
        const popupWidth = 360;
        const popupHeight = 64;
        const popupX = (this.game.canvas.width - popupWidth) / 2;
        const popupY = 90;
        
        // Sfondo popup con trasparenza
        ctx.save();
        ctx.globalAlpha = this.popup.alpha;
        
        // Pannello popup neutro
        const bg = 'rgba(28,28,32,0.96)';
        const border = 'rgba(255,255,255,0.18)';
        ThemeUtils.drawPanel(ctx, popupX, popupY, popupWidth, popupHeight, {
            background: bg,
            border: border,
            blur: false,
            shadow: false
        });
        
        // Icona
        const icon = this.popup.type === 'success' ? '✓' : '✗';
        ThemeUtils.drawText(ctx, icon, popupX + 24, popupY + popupHeight / 2, {
            size: 20,
            weight: 'bold',
            color: '#ffffff',
            glow: false,
            align: 'center',
            baseline: 'middle'
        });
        
        // Messaggio
        ThemeUtils.drawText(ctx, this.popup.message, popupX + 48, popupY + popupHeight / 2, {
            size: 14,
            weight: 'bold',
            color: '#ffffff',
            glow: false,
            align: 'left',
            baseline: 'middle'
        });
        
        ctx.restore();
    }
    
    drawMainPanel(ctx) {
        // Sfondo del pannello con stile uniforme scuro, senza blur/glow
        ThemeUtils.drawPanel(ctx, this.x, this.y, this.panelWidth, this.panelHeight, {
            background: 'rgba(18,18,20,0.94)',
            border: 'rgba(255,255,255,0.12)',
            blur: false,
            shadow: false
        });
        
        // Titolo con tema moderno
        ThemeUtils.drawText(ctx, 'Pannello di controllo', this.x + 20, this.y + 30, {
            size: 18,
            weight: 'bold',
            color: '#ffffff',
            glow: false
        });
        
        // Pulsante chiudi con tema moderno
        ThemeUtils.drawButton(ctx, this.x + this.panelWidth - 40, this.y + 10, 30, 30, {
            text: 'X',
            textSize: 16,
            textWeight: 'bold',
            textColor: '#ffffff',
            background: 'rgba(28,28,32,0.95)',
            border: 'rgba(255,255,255,0.18)',
            hover: false,
            glow: false
        });
    }
    
    drawNavigationPanel(ctx) {
        const navX = this.x;
        const navY = this.y + 60;
        
        // Sfondo navigazione uniforme scuro
        ThemeUtils.drawPanel(ctx, navX, navY, this.navWidth, this.panelHeight - 60, {
            background: 'rgba(18,18,20,0.94)',
            border: 'rgba(255,255,255,0.12)',
            blur: false,
            shadow: false
        });
        
        // Categorie con tema moderno
        this.categories.forEach((category, index) => {
            const itemY = navY + 20 + index * 40;
            const isSelected = this.selectedCategory === category.id;
            
            // Pulsante categoria stile neutro
            ThemeUtils.drawButton(ctx, navX + 10, itemY - 5, this.navWidth - 20, 35, {
                text: `${category.icon} ${category.name}`,
                textSize: 14,
                textWeight: isSelected ? 'bold' : 'normal',
                textColor: isSelected ? '#ffffff' : '#cfcfcf',
                background: isSelected ? 'rgba(40,40,44,0.95)' : 'transparent',
                border: isSelected ? 'rgba(255,255,255,0.18)' : 'transparent',
                hover: false,
                glow: false
            });
            
            // Freccia selezionata
            if (isSelected) {
                ThemeUtils.drawText(ctx, '→', navX + this.navWidth - 25, itemY + 15, {
                    size: 16,
                    weight: 'bold',
                    color: '#ffffff',
                    glow: false
                });
            }
        });
    }
    
    drawMainContent(ctx) {
        const contentX = this.x + this.navWidth;
        const contentY = this.y + 60;
        
        // Sfondo contenuto neutro scuro
        ctx.fillStyle = 'rgba(12,12,14,0.95)';
        ctx.fillRect(contentX, contentY, this.contentWidth, this.panelHeight - 60);
        
        switch (this.selectedCategory) {
            case 'info':
                this.drawInfoContent(ctx, contentX, contentY);
                break;
            case 'shop':
                this.drawShopContent(ctx, contentX, contentY);
                break;
            case 'quest':
                this.drawQuestContent(ctx, contentX, contentY);
                break;
            case 'clan':
                this.drawClanContent(ctx, contentX, contentY);
                break;
            case 'starenergy':
                this.drawStarEnergyContent(ctx, contentX, contentY);
                break;
            case 'factions':
                this.drawFactionContent(ctx, contentX, contentY);
                break;
            case 'stats':
                this.drawComingSoon(ctx, contentX, contentY, 'Statistiche');
                break;
            case 'map':
                this.drawComingSoon(ctx, contentX, contentY, 'Mappa spaziale');
                break;
            case 'settings':
                this.drawComingSoon(ctx, contentX, contentY, 'Impostazioni');
                break;
            case 'exit':
                this.drawLogoutContent(ctx, contentX, contentY);
                break;
        }
    }
    
    drawInfoContent(ctx, x, y) {
        // Nave spaziale e ID
        const centerX = x + this.contentWidth / 2;
        const shipY = y + 80;
        
        // Cerchio nave con tema moderno
        ThemeUtils.drawPanel(ctx, centerX - 60, shipY - 60, 120, 120, {
            background: 'transparent',
            border: 'rgba(255,255,255,0.18)',
            blur: false,
            shadow: false
        });
        
        // Disegna nave spaziale (semplificata)
        ctx.fillStyle = ThemeConfig.colors.text.primary;
        ctx.fillRect(centerX - 20, shipY - 10, 40, 20);
        ctx.fillRect(centerX - 10, shipY - 20, 20, 10);
        
        // ID con tema moderno
        ThemeUtils.drawText(ctx, `ID ${this.playerData.id}`, centerX, shipY + 40, {
            size: 14,
            weight: 'normal',
            color: '#ffffff',
            glow: false
        });
        
        // Livello con tema moderno
        ThemeUtils.drawText(ctx, `LIVELLO ${this.playerData.level}`, x + 20, shipY - 20, {
            size: 16,
            weight: 'bold',
            color: '#ffffff',
            glow: false
        });
        
        // Risorse con tema moderno
        const resources = [
            { label: 'CREDITS', value: (this.playerData.credits || 0).toLocaleString() },
            { label: 'URIDIUM', value: (this.playerData.uridium || 0).toLocaleString() },
            { label: 'ESPERIENZA', value: (this.playerData.experience || 0).toLocaleString() },
            { label: 'ONORE', value: (this.playerData.honor || 0).toLocaleString() }
        ];
        
        resources.forEach((resource, index) => {
            ThemeUtils.drawText(ctx, `${resource.value} ${resource.label}`, x + this.contentWidth - 200, shipY - 40 + (index * 20), {
                size: 14,
                weight: 'normal',
                color: ThemeConfig.colors.text.secondary,
                glow: false
            });
        });
        
        // Divider con tema moderno
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 20, shipY + 80);
        ctx.lineTo(x + this.contentWidth - 20, shipY + 80);
        ctx.stroke();
        
        // Rimuoviamo la sezione eventi attivi
    }
    
    
    
    
    
    drawQuestContent(ctx, x, y) {
        // Titolo sezione
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Quest', x + this.contentWidth/2, y + 40);
        
        // Tab quest
        this.drawQuestTabs(ctx, x + 20, y + 70);
        
        // Layout a due colonne
        const leftWidth = (this.contentWidth - 60) / 2;
        const rightWidth = (this.contentWidth - 60) / 2;
        const contentY = y + 120;
        
        // Lista quest a sinistra
        this.drawQuestList(ctx, x + 20, contentY, leftWidth);
        
        // Dettagli quest a destra
        this.drawQuestDetails(ctx, x + 20 + leftWidth + 20, contentY, rightWidth);
        
        ctx.textAlign = 'left';
    }
    
    // Disegna le tab delle quest
    drawQuestTabs(ctx, x, y) {
        const tabWidth = 100;
        const tabHeight = 35;
        const tabSpacing = 5;
        
        this.questTabs.forEach((tab, index) => {
            const tabX = x + index * (tabWidth + tabSpacing);
            const isSelected = this.selectedQuestTab === tab;
            
            // Sfondo tab
            ctx.fillStyle = isSelected ? 'rgba(40,40,44,0.95)' : 'rgba(28,28,32,0.95)';
            ctx.fillRect(tabX, y, tabWidth, tabHeight);
            
            // Bordo tab
            ctx.strokeStyle = isSelected ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.12)';
            ctx.lineWidth = isSelected ? 2 : 1;
            ctx.strokeRect(tabX, y, tabWidth, tabHeight);
            
            // Testo tab
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            const tabName = this.getQuestTabName(tab);
            ctx.fillText(tabName, tabX + tabWidth/2, y + 22);
        });
    }
    
    // Nome delle tab quest
    getQuestTabName(tab) {
        const names = {
            'disponibili': 'Disponibili',
            'accettate': 'Accettate',
            'completate': 'Completate',
            'tutte': 'Tutte'
        };
        return names[tab] || tab.toUpperCase();
    }
    
    // Disegna la lista delle quest
    drawQuestList(ctx, x, y, width) {
        const listHeight = 400; // Altezza fissa della lista
        
        // Titolo lista (fuori dall'area di clipping)
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Lista delle quest (0/5)', x, y);
        
        // Salva il contesto per il clipping
        ctx.save();
        
        // Crea area di clipping per la lista (inizia dopo il titolo con margine)
        ctx.beginPath();
        ctx.rect(x, y + 30, width, listHeight - 30);
        ctx.clip();
        
        // Contenuto delle quest per livello con scroll (inizia con margine per i titoli)
        let currentY = y + 30 - this.questScrollY + 10;
        
        const quests = this.questData[this.selectedQuestTab];
        if (quests) {
            Object.keys(quests).forEach(levelKey => {
                const levelQuests = quests[levelKey];
                if (levelQuests && levelQuests.length > 0) {
                    // Titolo livello
                    ctx.fillStyle = '#FFD700';
                    ctx.font = 'bold 14px Arial';
                    ctx.fillText(`Livello ${levelQuests[0].level}:`, x, currentY);
                    currentY += 25;
                    
                    // Lista quest del livello
                    levelQuests.forEach(quest => {
                        const isSelected = this.selectedQuest && this.selectedQuest.id === quest.id;
                        
                        // Sfondo quest
                    ctx.fillStyle = isSelected ? 'rgba(40,40,44,0.95)' : 'transparent';
                        ctx.fillRect(x, currentY - 5, width - 10, 20);
                        
                        // Nome quest
                        ctx.fillStyle = '#ffffff';
                        ctx.font = '12px Arial';
                        ctx.fillText(quest.name, x + 5, currentY + 8);
                        
                        currentY += 25;
                    });
                    
                    currentY += 10; // Spazio tra livelli
                }
            });
        }
        
        // NON ricalcolare maxQuestScrollY ogni frame - solo se è 0 (prima volta)
        if (this.maxQuestScrollY === 0) {
            const totalContentHeight = currentY - (y + 30 + 10);
        this.maxQuestScrollY = Math.max(0, totalContentHeight - (listHeight - 30));
        }
        
        // Ripristina il contesto
        ctx.restore();
        
        // Disegna scrollbar se necessario
        if (this.maxQuestScrollY > 0) {
            this.drawQuestScrollbar(ctx, x + width - 15, y + 30, listHeight - 30);
        }
    }
    
    // Disegna la scrollbar per la lista quest
    drawQuestScrollbar(ctx, x, y, height) {
        const scrollbarWidth = 10;
        const scrollbarHeight = height;
        
        // Sfondo scrollbar
        ctx.fillStyle = '#333333';
        ctx.fillRect(x, y, scrollbarWidth, scrollbarHeight);
        
        // Calcola la posizione del thumb
        const thumbHeight = Math.max(20, (scrollbarHeight * scrollbarHeight) / (scrollbarHeight + this.maxQuestScrollY));
        const thumbY = y + (this.questScrollY / this.maxQuestScrollY) * (scrollbarHeight - thumbHeight);
        
        // Thumb della scrollbar
        ctx.fillStyle = '#666666';
        ctx.fillRect(x + 1, thumbY, scrollbarWidth - 2, thumbHeight);
        
        // Bordi del thumb
        ctx.strokeStyle = '#999999';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 1, thumbY, scrollbarWidth - 2, thumbHeight);
    }
    
    // Disegna i dettagli della quest
    drawQuestDetails(ctx, x, y, width) {
        const detailsHeight = 400;
        
        // Salva il contesto per il clipping
        ctx.save();
        
        // Crea area di clipping per i dettagli
        ctx.beginPath();
        ctx.rect(x, y, width, detailsHeight);
        ctx.clip();
        
        // Sfondo pannello dettagli
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(x, y, width, detailsHeight);
        ctx.strokeStyle = '#4a90e2';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, detailsHeight);
        
        if (this.selectedQuest) {
            let currentY = y + 20 - this.questDetailsScrollY;
            
            // Titolo quest
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(this.selectedQuest.name, x + 15, currentY);
            
            // Sottolineatura del titolo
            ctx.strokeStyle = '#4a90e2';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x + 15, currentY + 5);
            ctx.lineTo(x + 15 + ctx.measureText(this.selectedQuest.name).width, currentY + 5);
            ctx.stroke();
            
            currentY += 40;
            
            // Sezione Descrizione
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 14px Arial';
            ctx.fillText('Descrizione', x + 15, currentY);
            currentY += 25;
            
            // Testo descrizione
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            const description = this.selectedQuest.description;
            const maxWidth = width - 30;
            const lines = this.wrapText(ctx, description, maxWidth);
            
            lines.forEach(line => {
                ctx.fillText(line, x + 15, currentY);
                currentY += 15;
            });
            
            currentY += 20;
            
            // Sezione Condizioni
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 14px Arial';
            ctx.fillText('Condizioni', x + 15, currentY);
            currentY += 25;
            
            // Lista condizioni
            this.selectedQuest.conditions.forEach(condition => {
                ctx.fillStyle = '#ffffff';
                ctx.font = '12px Arial';
                const progress = `${condition.completed}/${condition.quantity}`;
                const conditionText = `${condition.description} (${progress})`;
                ctx.fillText(conditionText, x + 15, currentY);
                currentY += 18;
            });
            
            currentY += 20;
            
            // Sezione Ricompense
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 14px Arial';
            ctx.fillText('Ricompensa', x + 15, currentY);
            currentY += 25;
            
            // Lista ricompense
            this.selectedQuest.rewards.forEach(reward => {
                ctx.fillStyle = '#ffffff';
                ctx.font = '12px Arial';
                const rewardText = `${reward.description}: ${reward.quantity.toLocaleString()}`;
                ctx.fillText(rewardText, x + 15, currentY);
                currentY += 18;
            });
            
            // Calcola l'altezza totale del contenuto
            const totalContentHeight = currentY - (y + 20) + this.questDetailsScrollY;
            this.maxQuestDetailsScrollY = Math.max(0, totalContentHeight - detailsHeight + 100);
            
            // Pulsante Accettare (sempre visibile in basso)
            const buttonWidth = 120;
            const buttonHeight = 35;
            const buttonX = x + width - buttonWidth - 15;
            const buttonY = y + detailsHeight - buttonHeight - 15;
            
            // Sfondo pulsante
            ctx.fillStyle = '#4a90e2';
            ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
            
            // Bordo pulsante
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
            
            // Testo pulsante
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Accettare', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2 + 5);
            ctx.textAlign = 'left';
            
        } else {
            // Messaggio di default
            ctx.fillStyle = '#888888';
            ctx.font = '14px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('Scegli una quest dalla lista', x + 15, y + 30);
            ctx.fillText('per leggerne i dettagli', x + 15, y + 50);
            
            // Informazioni aggiuntive
            ctx.font = '12px Arial';
            ctx.fillText('I tuoi progressi ricevuti verranno', x + 15, y + 80);
            ctx.fillText('conteggiati, prima di tutto, nella', x + 15, y + 100);
            ctx.fillText('condizione dell\'attività prioritaria!', x + 15, y + 120);
            
            ctx.fillText('L\'attività prioritaria è la prima', x + 15, y + 150);
            ctx.fillText('attività nell\'elenco nel widget', x + 15, y + 170);
            ctx.fillText('delle attività.', x + 15, y + 190);
            
            ctx.fillText('Puoi impostare la priorità sul', x + 15, y + 220);
            ctx.fillText('widget delle attività!', x + 15, y + 240);
            
            // Icona frecce
            ctx.fillStyle = '#FFD700';
            ctx.font = '16px Arial';
            ctx.fillText('↑', x + 15, y + 270);
            ctx.fillText('- pulsante per aumentare la', x + 35, y + 270);
            ctx.fillText('priorità dell\'attività.', x + 15, y + 290);
        }
        
        // Ripristina il contesto
        ctx.restore();
        
        // Disegna scrollbar per i dettagli se necessario
        if (this.maxQuestDetailsScrollY > 0) {
            this.drawQuestDetailsScrollbar(ctx, x + width - 15, y, detailsHeight);
        }
    }
    
    // Disegna la scrollbar per i dettagli quest
    drawQuestDetailsScrollbar(ctx, x, y, height) {
        const scrollbarWidth = 10;
        const scrollbarHeight = height;
        
        // Sfondo scrollbar
        ctx.fillStyle = '#333333';
        ctx.fillRect(x, y, scrollbarWidth, scrollbarHeight);
        
        // Calcola la posizione del thumb
        const thumbHeight = Math.max(20, (scrollbarHeight * scrollbarHeight) / (scrollbarHeight + this.maxQuestDetailsScrollY));
        const thumbY = y + (this.questDetailsScrollY / this.maxQuestDetailsScrollY) * (scrollbarHeight - thumbHeight);
        
        // Thumb della scrollbar
        ctx.fillStyle = '#666666';
        ctx.fillRect(x + 1, thumbY, scrollbarWidth - 2, thumbHeight);
        
        // Bordi del thumb
        ctx.strokeStyle = '#999999';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 1, thumbY, scrollbarWidth - 2, thumbHeight);
    }
    
    // Helper per wrappare il testo
    wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];
        
        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + ' ' + word).width;
            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }
    
    drawComingSoon(ctx, x, y, title) {
        ctx.fillStyle = '#e94560';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(title, x + this.contentWidth / 2, y + this.panelHeight / 2 - 50);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px Arial';
        ctx.fillText('Coming Soon...', x + this.contentWidth / 2, y + this.panelHeight / 2);
        
        ctx.textAlign = 'left';
    }
    
    drawLogoutContent(ctx, x, y) {
        const centerX = x + this.contentWidth / 2;
        
        // Titolo
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🚪 Logout', centerX, y + 50);
        
        // Messaggio informativo
        ctx.fillStyle = '#cccccc';
        ctx.font = '16px Arial';
        ctx.fillText('Sei sicuro di voler uscire dal gioco?', centerX, y + 100);
        
        // Informazioni utente corrente
        if (this.game.authSystem && this.game.authSystem.currentUser) {
            ctx.fillStyle = '#4a90e2';
            ctx.font = '14px Arial';
            ctx.fillText(`Utente: ${this.game.authSystem.currentUser.nickname}`, centerX, y + 130);
            ctx.fillText(`Fazione: ${this.game.authSystem.currentUser.faction}`, centerX, y + 150);
        }
        
        // Pulsante di logout
        const buttonX = centerX - 100;
        const buttonY = y + 200;
        const buttonWidth = 200;
        const buttonHeight = 50;
        
        // Sfondo pulsante
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        // Bordo pulsante
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        // Testo pulsante
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('CONFERMA LOGOUT', centerX, buttonY + 32);
        
        // Messaggio di avviso
        ctx.fillStyle = '#ff6b6b';
        ctx.font = '12px Arial';
        ctx.fillText('Il gioco verrà salvato e uscirai in 5 secondi', centerX, y + 280);
        
        ctx.textAlign = 'left';
    }
    
    // Gestisce i click nella sezione logout
    handleLogoutClick(x, y, panelX, panelY) {
        const contentX = panelX + this.navWidth;
        const contentY = panelY + 60;
        
        const centerX = contentX + this.contentWidth / 2;
        const buttonX = centerX - 100;
        const buttonY = contentY + 200;
        const buttonWidth = 200;
        const buttonHeight = 50;
        
        // Controlla se clicca sul pulsante di logout
        if (x >= buttonX && x <= buttonX + buttonWidth && 
            y >= buttonY && y <= buttonY + buttonHeight) {
            
            // Esegui il logout (con countdown)
            if (this.game.authSystem) {
                // Salva il gioco prima del logout
                if (this.game.saveSystem) {
                    this.game.saveSystem.save('main');
                }
                
                // Chiudi il pannello home
                this.hide();
                
                // Avvia il logout con countdown
                this.game.authSystem.logout();
            }
            
            return true;
        }
        
        return false;
    }
    
    // Gestisce i click nelle quest
    handleQuestClick(x, y, panelX, panelY) {
        const contentX = panelX + this.navWidth;
        const contentY = panelY + 60;
        
        // Controlla click sulle tab
        const tabY = contentY + 70;
        const tabWidth = 100;
        const tabHeight = 35;
        const tabSpacing = 5;
        
        for (let i = 0; i < this.questTabs.length; i++) {
            const tabX = contentX + 20 + i * (tabWidth + tabSpacing);
            
            // Area cliccabile più generosa per le tab
            const clickMargin = 3; // Margine extra per facilitare il click
            const clickX1 = tabX - clickMargin;
            const clickX2 = tabX + tabWidth + clickMargin;
            const clickY1 = tabY - clickMargin;
            const clickY2 = tabY + tabHeight + clickMargin;
            
            if (x >= clickX1 && x <= clickX2 && 
                y >= clickY1 && y <= clickY2) {
                this.selectedQuestTab = this.questTabs[i];
                this.selectedQuest = null; // Reset quest selezionata
                this.questScrollY = 0; // Reset scroll quando si cambia tab
                this.maxQuestScrollY = 0; // Reset per ricalcolare il limite
                return true;
            }
        }
        
        // Controlla click sulla lista quest
        const leftWidth = (this.contentWidth - 60) / 2;
        const listX = contentX + 20;
        const listY = contentY + 120;
        const listWidth = leftWidth;
        
        // Area cliccabile più generosa per la lista
        const listClickMargin = 5;
        const listClickX1 = listX - listClickMargin;
        const listClickX2 = listX + listWidth + listClickMargin;
        const listClickY1 = listY - listClickMargin;
        const listClickY2 = listY + 400; // Altezza approssimativa della lista
        
        if (x >= listClickX1 && x <= listClickX2 && 
            y >= listClickY1 && y <= listClickY2) {
            this.handleQuestListClick(x, y, listX, listY, listWidth);
            return true;
        }
        
        // Controlla click sul pulsante Accettare
        if (this.selectedQuest) {
            const rightWidth = (this.contentWidth - 60) / 2;
            const detailsX = contentX + 20 + leftWidth + 20;
            const detailsY = contentY + 120;
            const detailsHeight = 400;
            
            const buttonWidth = 120;
            const buttonHeight = 35;
            const buttonX = detailsX + rightWidth - buttonWidth - 15;
            const buttonY = detailsY + detailsHeight - buttonHeight - 15;
            
            if (x >= buttonX && x <= buttonX + buttonWidth && 
                y >= buttonY && y <= buttonY + buttonHeight) {
                this.acceptQuest(this.selectedQuest);
                return true;
            }
        }
        
        return false;
    }
    
    // Gestisce i click sulla lista delle quest
    handleQuestListClick(x, y, listX, listY, listWidth) {
        const quests = this.questData[this.selectedQuestTab];
        if (!quests) return false;
        
        let currentY = listY + 30 - this.questScrollY; // Inizia dopo il titolo "Lista delle quest" con scroll
        
        // Controlla solo le quest del livello selezionato
        const levelKeys = Object.keys(quests);
        for (let levelIndex = 0; levelIndex < levelKeys.length; levelIndex++) {
            const levelKey = levelKeys[levelIndex];
            const levelQuests = quests[levelKey];
            
            if (levelQuests && levelQuests.length > 0) {
                // Salta il titolo del livello (25px)
                currentY += 25;
                
                for (let questIndex = 0; questIndex < levelQuests.length; questIndex++) {
                    const quest = levelQuests[questIndex];
                    
                    // Calcolo preciso delle coordinate Y con scroll
                    const questY = currentY;
                    const questHeight = 20;
                    
                    // Area cliccabile PRECISA senza margini
                    const clickX1 = listX;
                    const clickX2 = listX + listWidth - 25; // Lascia spazio per la scrollbar
                    const clickY1 = questY - 5;
                    const clickY2 = questY + questHeight;
                    
                    if (x >= clickX1 && x <= clickX2 && 
                        y >= clickY1 && y <= clickY2) {
                        this.selectedQuest = quest;
                        this.questDetailsScrollY = 0; // Reset scroll dettagli
                        return true; // FERMA IMMEDIATAMENTE
                    }
                    
                    // Passa alla prossima quest
                    currentY += 25;
                }
                
                // Spazio tra livelli
                currentY += 10;
            }
        }
        
        return false;
    }
    
    // Accetta una quest
    acceptQuest(quest) {
        if (!quest || quest.status !== 'available') {
            return;
        }
        
        // Crea uno snapshot delle statistiche attuali quando si accetta la quest
        if (this.game && this.game.ship && this.game.ship.createQuestSnapshot) {
            this.game.ship.createQuestSnapshot();
        }
        
        // Sposta la quest da disponibili ad accettate
        this.moveQuestToAccepted(quest);
        
        // Mostra popup di conferma
        this.showPopup(`Quest "${quest.name}" accettata!`, 'success');
        
        // Reset selezione
        this.selectedQuest = null;
    }
    
    // Sposta una quest da disponibili ad accettate
    moveQuestToAccepted(quest) {
        // Rimuovi da disponibili
        const availableQuests = this.questData.disponibili;
        Object.keys(availableQuests).forEach(levelKey => {
            const levelQuests = availableQuests[levelKey];
            if (levelQuests) {
                const index = levelQuests.findIndex(q => q.id === quest.id);
                if (index !== -1) {
                    levelQuests.splice(index, 1);
                }
            }
        });
        
        // Aggiungi ad accettate
        if (!this.questData.accettate[`livello${quest.level}`]) {
            this.questData.accettate[`livello${quest.level}`] = [];
        }
        
        const acceptedQuest = { ...quest, status: 'accepted' };
        this.questData.accettate[`livello${quest.level}`].push(acceptedQuest);
    }
    
    // Metodi per il sistema shop
    handleShopClick(x, y, panelX, panelY) {
        const contentX = panelX + this.navWidth;
        const contentY = panelY + 60;
        
        // Controlla click su tab del negozio (priorità alta)
        const tabY = contentY + 70; // Corretto per matchare drawShopTabs
        const tabWidth = 140; // Corretto per matchare drawShopTabs
        const tabHeight = 40; // Corretto per matchare drawShopTabs
        
        const tabs = ['ammunition', 'laser', 'generators', 'uav', 'ships'];
        for (let index = 0; index < tabs.length; index++) {
            const tabId = tabs[index];
            const tabX = contentX + 20 + index * tabWidth;
            if (x >= tabX && x <= tabX + tabWidth && 
                y >= tabY && y <= tabY + tabHeight) {
                this.selectedShopCategory = tabId;
                return true; // Click gestito, esci subito
            }
        }
        
        // Controlla click su thumbnail in basso (priorità alta)
        if (['ammunition', 'laser', 'generators', 'uav', 'ships'].includes(this.selectedShopCategory)) {
            const previewY = contentY + 90 + 500 + 10;
            
            // Controlla click su frecce di scroll
            if (this.handleThumbnailScrollClick(x, y, contentX + 20, previewY)) {
                return true;
            }
            
            if (this.handleThumbnailClick(x, y, contentX + 20, previewY)) {
                return true;
            }
        }
        
        // Controlla click su pulsanti acquisto nel nuovo layout
        const items = this.shopItems[this.selectedShopCategory];
        if (items && Object.keys(items).length > 0) {
            const startY = contentY + 90;
            const imageAreaWidth = 400;
            const detailsAreaWidth = this.contentWidth - imageAreaWidth - 40;
            const areaHeight = 500;
            
            // Area dettagli a destra
            const detailsX = contentX + 20 + imageAreaWidth + 20;
            const detailsY = startY + 20;
            
            if (this.selectedShopCategory === 'ammunition') {
                return this.handleAmmunitionClick(x, y, detailsX, detailsY, items);
            } else if (this.selectedShopCategory === 'laser') {
                return this.handleLaserClick(x, y, detailsX, detailsY, items);
            } else if (this.selectedShopCategory === 'generators') {
                return this.handleAmmunitionClick(x, y, detailsX, detailsY, items);
            } else if (this.selectedShopCategory === 'equipment') {
                return this.handleEquipmentClick(x, y, detailsX, detailsY, items);
            } else if (this.selectedShopCategory === 'consumables') {
                return this.handleConsumablesClick(x, y, detailsX, detailsY, items);
            } else if (this.selectedShopCategory === 'uav') {
                return this.handleUAVClick(x, y, detailsX, detailsY, items);
            } else if (this.selectedShopCategory === 'ships') {
                return this.handleShipsClick(x, y, detailsX, detailsY, items);
            }
        }
        
        return false; // Nessun click gestito
    }
    
    handleThumbnailScrollClick(x, y, previewX, previewY) {
        const previewHeight = 110;
        
        // Freccia sinistra (area ridotta)
        if (x >= previewX + 8 && x <= previewX + 38 && 
            y >= previewY + 8 && y <= previewY + previewHeight - 8) {
            this.scrollThumbnailsLeft();
            return true;
        }
        
        // Freccia destra (area ridotta)
        const previewWidth = this.contentWidth - 40;
        if (x >= previewX + previewWidth - 38 && x <= previewX + previewWidth - 8 && 
            y >= previewY + 8 && y <= previewY + previewHeight - 8) {
            this.scrollThumbnailsRight();
            return true;
        }
        
        return false;
    }
    
    handleThumbnailClick(x, y, previewX, previewY) {
        const items = this.shopItems[this.selectedShopCategory];
        const thumbSize = 70;
        const thumbSpacing = 180;
        let thumbX = previewX + 20 + this.thumbnailScrollX;
        const thumbY = previewY + 15;
        
        // Controlla click su ogni thumbnail
        const allItems = Object.keys(items);
        for (let i = 0; i < allItems.length; i++) {
            const itemKey = allItems[i];
            
            if (x >= thumbX && x <= thumbX + thumbSize && 
                y >= thumbY && y <= thumbY + thumbSize) {
                // Seleziona questo item in base alla categoria
                if (this.selectedShopCategory === 'ammunition') {
                    this.selectedAmmoItem = itemKey;
                } else if (this.selectedShopCategory === 'laser') {
                    this.selectedLaserItem = itemKey;
                } else if (this.selectedShopCategory === 'generators') {
                    this.selectedGeneratorItem = itemKey;
                } else if (this.selectedShopCategory === 'uav') {
                    this.selectedUAVItem = itemKey;
                } else if (this.selectedShopCategory === 'ships') {
                    this.selectedShipItem = itemKey;
                }
                return true; // Click gestito
            }
            
            thumbX += thumbSpacing;
        }
        
        return false; // Nessun thumbnail cliccato
    }
    
    handleAmmunitionClick(x, y, detailsX, detailsY, items) {
        // Opzioni per l'item selezionato
        let selectedItem, quantities, pricePerUnit, itemKey;
        if (this.selectedShopCategory === 'ammunition') {
            selectedItem = items[this.selectedAmmoItem];
            quantities = selectedItem.type === 'laser' ? [100, 1000, 10000, 100000] : [10, 100];
            pricePerUnit = selectedItem.type === 'laser' ? 10 : 100;
            itemKey = this.selectedAmmoItem;
        } else if (this.selectedShopCategory === 'laser') {
            selectedItem = items[this.selectedLaserItem];
            quantities = [1, 5, 10, 25];
            pricePerUnit = selectedItem.price;
            itemKey = this.selectedLaserItem;
        } else if (this.selectedShopCategory === 'generators') {
            selectedItem = items[this.selectedGeneratorItem];
            quantities = [1, 2, 5, 10];
            pricePerUnit = selectedItem.price;
            itemKey = this.selectedGeneratorItem;
        }
        
        if (selectedItem) {
            const buttonWidth = 120; // Aumentato da 100 a 120
            const buttonHeight = 50; // Aumentato da 35 a 50
            const detailsAreaWidth = this.contentWidth - 400 - 40;
            const buyButtonX = detailsX + (detailsAreaWidth - buttonWidth) / 2;
            
            for (let i = 0; i < quantities.length; i++) {
                const quantity = quantities[i];
                // Calcolo diretto delle coordinate Y basato su drawPurchaseOptions
                const optionY = detailsY + 25 + i * (70 + 12);
                const buyButtonY = optionY + 25; // Ridotto da 35 a 25 per centrare meglio
                
                // Area cliccabile più generosa con margini
                const clickMargin = 10; // Margine extra per facilitare il click
                const clickX1 = buyButtonX - clickMargin;
                const clickX2 = buyButtonX + buttonWidth + clickMargin;
                const clickY1 = buyButtonY - clickMargin;
                const clickY2 = buyButtonY + buttonHeight + clickMargin;
                
                if (x >= clickX1 && x <= clickX2 && 
                    y >= clickY1 && y <= clickY2) {
                    // Acquista con quantità specifica
                    this.buyItemWithQuantity(itemKey, quantity, pricePerUnit);
                    return true;
                }
            }
        }
        
        return false;
    }
    
    buyItemWithQuantity(itemKey, quantity, pricePerUnit) {
        const totalPrice = pricePerUnit * quantity;
        
        if (this.playerData.credits >= totalPrice) {
            // Deduci crediti dalla nave (Single Source of Truth)
            this.game.ship.addResource('credits', -totalPrice);
            
            if (this.selectedShopCategory === 'laser' || this.selectedShopCategory === 'generators') {
                // Per gli item equipaggiabili (laser/generatori/scudi), aggiungi all'inventario
                const item = this.shopItems[this.selectedShopCategory][itemKey];
                console.log('🛍️ Creo item dal negozio:', { 
                    category: this.selectedShopCategory,
                    itemKey, 
                    item
                });

                // Aggiungi all'inventario per ogni quantità
                for (let i = 0; i < quantity; i++) {
                    let invItem;
                    if (this.selectedShopCategory === 'laser') {
                        invItem = new InventoryItem(
                            item.name,
                            'laser',
                            { damage: item.damage, fireRate: 1.0, key: itemKey }
                        );
                    } else {
                        // Generatori/Scudi
                        invItem = new InventoryItem(
                            item.name,
                            item.type, // 'generator' o 'shield'
                            { key: item.key, protection: item.protection || 0 }
                        );
                    }
                    console.log('✨ Item creato:', invItem);
                    this.game.inventory.addItem(invItem);
                }
                
                // Mostra popup di successo
                this.showPopup(`Acquistato ${quantity}x ${item.name}`, 'success');
            } else {
                // Per le munizioni, aggiungi al contatore munizioni
                let itemType = 'laser';
                if (itemKey.startsWith('missile_')) {
                    itemType = 'missile';
                }
                
                // Aggiungi munizioni alla nave (senza limiti)
                this.game.ship.addAmmunition(itemType, itemKey.split('_')[1], quantity);
                
                // Mostra popup di successo
                this.showPopup(`Acquistate ${quantity.toLocaleString()} ${itemKey.replace('_', ' ')}`, 'success');
            }
            
            // Aggiorna i dati del pannello
            this.playerData.credits = this.game.ship.getResource('credits');
            
            // Salva l'inventario
            this.game.inventory.save();
            
            // Suono
            if (this.game.audioManager) {
                this.game.audioManager.playSound('collecting');
            }
        } else {
            // Crediti insufficienti
            this.showPopup('Crediti insufficienti', 'error');
        }
    }
    
    handleEquipmentClick(x, y, detailsX, detailsY, items) {
        let currentY = detailsY + 20;
        const itemHeight = 65;
        
        const cannonItems = Object.keys(items).filter(key => key.startsWith('cannon_'));
        for (let index = 0; index < cannonItems.length; index++) {
            const key = cannonItems[index];
            const itemY = currentY + index * (itemHeight + 10);
            const buyButtonX = detailsX + this.contentWidth - 300 - 100;
            const buyButtonY = itemY + itemHeight - 25;
            
            if (x >= buyButtonX && x <= buyButtonX + 80 && 
                y >= buyButtonY && y <= buyButtonY + 20) {
                this.buyItem(key);
                return true;
            }
        }
        
        return false;
    }
    
    handleConsumablesClick(x, y, detailsX, detailsY, items) {
        // Placeholder per consumabili
        return false;
    }
    
    handleUAVClick(x, y, detailsX, detailsY, items) {
        // Gestisce click sui droni UAV nel negozio
        const selectedItem = items[this.selectedUAVItem];
        if (!selectedItem) return false;
        
        // Area pulsanti acquisto
        const buttonY = detailsY + 300;
        const buttonWidth = 120;
        const buttonHeight = 35;
        const buttonSpacing = 10;
        
        // Pulsante "Acquista 1"
        const buy1X = detailsX + 20;
        if (x >= buy1X && x <= buy1X + buttonWidth && 
            y >= buttonY && y <= buttonY + buttonHeight) {
            
            // Controlla se il limite è stato raggiunto
            const currentUAVCount = this.game.inventory.equipment.uav.length;
            if (currentUAVCount >= 8) {
                this.game.notifications.add('Limite massimo droni UAV raggiunto! (8/8)', 'error');
                return true;
            }
            
            this.buyUAVItem(this.selectedUAVItem, 1);
            return true;
        }
        
        return false;
    }
    
    
    // Acquista drone UAV
    buyUAVItem(itemKey, quantity = 1) {
        const item = this.shopItems.uav[itemKey];
        if (!item) return;
        
        const totalPrice = item.price * quantity;
        const currency = item.cost.credits ? 'credits' : 'uridium';
        const playerCurrency = currency === 'credits' ? this.playerData.credits : this.playerData.uridium;
        
        // Controlla se ha abbastanza valuta
        if (playerCurrency >= totalPrice) {
            // Controlla limite massimo droni UAV (8 totali)
            const currentUAVCount = this.game.inventory.equipment.uav.length;
            if (currentUAVCount + quantity > 8) {
                this.game.notifications.add(`Limite massimo droni UAV raggiunto! (${currentUAVCount}/8)`, 'error');
                return;
            }
            
            // Deduci valuta
            if (currency === 'credits') {
                this.game.ship.addResource('credits', -totalPrice);
            } else {
                this.game.ship.addResource('uridium', -totalPrice);
            }
            
                    // Crea il drone per l'inventario UAV
                    const droneData = {
                        id: item.key,
                        name: item.name,
                        type: 'uav',
                        droneType: item.droneType,
                        rarity: item.droneType === 'flax' ? 'common' : 'rare',
                        description: item.description,
                        cost: item.cost,
                        slots: item.slots,
                        icon: item.icon,
                        color: item.droneType === 'flax' ? '#4a90e2' : '#ff6b6b',
                        equippedItems: new Array(item.slots).fill(null) // Inizializza slot vuoti
                    };
                    
                    // Aggiungi alla tab UAV dell'inventario (istanze uniche con ID univoco)
                    for (let i = 0; i < quantity; i++) {
                        const invDrone = { ...droneData, id: `${droneData.droneType}_${Date.now()}_${i}` };
                        this.game.inventory.equipment.uav.push(invDrone);
                    }
                    
                    // Crea droni reali nel DroneManager
                    if (this.game.droneManager) {
                        for (let i = 0; i < quantity; i++) {
                            // Crea un ID univoco per ogni drone
                            const uniqueDroneData = {
                                ...droneData,
                                id: `${droneData.droneType}_${Date.now()}_${i}`
                            };
                            this.game.droneManager.addDrone(uniqueDroneData);
                        }
                        if (this.game.droneManager.updateFormations) {
                            this.game.droneManager.updateFormations();
                        }
                        // Mantieni coerenza e posizionamento
                        if (this.game.droneManager.removeDuplicates) {
                            this.game.droneManager.removeDuplicates();
                        }
                        if (this.game.droneManager.repositionDrones) {
                            this.game.droneManager.repositionDrones();
                        }
                    } else {
                        console.log('🚁 DroneManager non disponibile, creando al volo...');
                        // Importa e crea DroneManager al volo
                        import('../systems/DroneManager.js').then(({ DroneManager }) => {
                            this.game.droneManager = new DroneManager(this.game);
                            console.log('🚁 DroneManager creato al volo:', this.game.droneManager);
                            
                            // Aggiungi i droni
                            for (let i = 0; i < quantity; i++) {
                                const uniqueDroneData = {
                                    ...droneData,
                                    id: `${droneData.droneType}_${Date.now()}_${i}`
                                };
                                this.game.droneManager.addDrone(uniqueDroneData);
                            }
                            if (this.game.droneManager.updateFormations) {
                                this.game.droneManager.updateFormations();
                            }
                            if (this.game.droneManager.removeDuplicates) {
                                this.game.droneManager.removeDuplicates();
                            }
                            if (this.game.droneManager.repositionDrones) {
                                this.game.droneManager.repositionDrones();
                            }
                        }).catch(error => {
                            console.error('🚁 Errore nel caricamento DroneManager:', error);
                        });
                    }
            
            // Salva l'inventario
            this.game.inventory.save();
            
            // Notifica acquisto
            this.game.notifications.add(`${item.name} acquistato! (${currentUAVCount + quantity}/8 droni)`, 'success');
            
            console.log('🛍️ Drone acquistato:', {
                item: item.name,
                quantity: quantity,
                totalPrice: totalPrice,
                currency: currency,
                addedToUAV: true,
                totalDrones: currentUAVCount + quantity
            });
        } else {
            this.game.notifications.add(`Valuta insufficiente!`, 'error');
        }
    }

    handleLaserClick(x, y, detailsX, detailsY, items) {
        console.log('⚡ Click su laser:', { x, y, detailsX, detailsY, items });
        // Usa lo stesso sistema delle munizioni
        return this.handleAmmunitionClick(x, y, detailsX, detailsY, items);
    }

    handleGeneratorClick(x, y, detailsX, detailsY, items) {
        console.log('⚡ Click su generatore:', { x, y, detailsX, detailsY, items });
        // Usa lo stesso sistema delle munizioni
        return this.handleAmmunitionClick(x, y, detailsX, detailsY, items);
    }
    
    buyItem(itemKey) {
        console.log('🛒 buyItem chiamato con:', itemKey);
        const item = this.shopItems[this.selectedShopCategory][itemKey];
        console.log('📝 Item trovato:', item);
        const totalPrice = item.price * item.amount;
        
        // Controlla se ha abbastanza crediti
        if (this.playerData.credits >= totalPrice) {
            // Per i cannoni, equipaggia direttamente
            if (item.type === 'cannon') {
                // Acquista e equipaggia
                this.game.ship.addResource('credits', -totalPrice);
                this.game.ship.equipCannon(item.key, item.amount);
                
                // Aggiungi all'inventario come acquisto reale
                this.game.inventory.addPurchasedItem({
                    name: item.name,
                    type: 'cannon',
                    key: item.key,
                    amount: item.amount,
                    price: item.price,
                    purchasedAt: Date.now()
                });
                
                // Aggiorna i dati del pannello
                this.playerData.credits = this.game.ship.getResource('credits');
                
                // Salva l'inventario
                this.game.inventory.save();
                
                // Notifica
                if (this.game.notifications) {
                    this.game.notifications.add(`✅ Equipaggiato: ${item.name} x${item.amount}`, 'success');
                }
                
                // Suono
                this.game.audioManager.playSound('collecting');
            } else {
                // Gestione separata: ammo vs equip (generatori/scudi)
                const isAmmo = (item.type === 'laser' || item.type === 'missile');
                let canPurchase = true;
                if (isAmmo) {
                    const currentAmmo = this.game.ship.getAmmunition(item.type, item.key);
                    const maxAmmo = this.game.ship.maxAmmunition[item.type][item.key];
                    canPurchase = (currentAmmo + item.amount <= maxAmmo);
                }

                if (canPurchase) {
                    // Acquista
                    this.game.ship.addResource('credits', -totalPrice);
                    if (isAmmo) {
                        // Ammunizioni
                        this.game.ship.addAmmunition(item.type, item.key, item.amount);
                    }
                    
                    // Debug acquisto
                    console.log('🛍️ Acquisto:', {
                        category: this.selectedShopCategory,
                        item: item,
                        isAmmo: isAmmo
                    });

                    // Aggiungi all'inventario come item equipaggiabile
                    const invItem = {
                        id: Date.now() + Math.random().toString(36).substr(2, 9),
                        name: item.name,
                        type: item.type,
                        stats: {
                            key: item.key,
                            protection: item.protection || 0,
                            damage: item.damage || 0
                        }
                    };
                    console.log('📦 Item da aggiungere:', invItem);
                    
                    const added = this.game.inventory.addItem(invItem);
                    console.log('✅ Item aggiunto:', added);
                    
                    // Aggiorna i dati del pannello
                    this.playerData.credits = this.game.ship.getResource('credits');
                    
                    // Salva l'inventario
                    this.game.inventory.save();
                    
                    // Notifica
                    if (this.game.notifications) {
                        this.game.notifications.add(`✅ Acquistato: ${item.name} x${item.amount}`, 'success');
                    }
                    
                    // Suono
                    this.game.audioManager.playSound('collecting');
                } else {
                    // Inventario pieno
                    if (this.game.notifications) {
                        this.game.notifications.add(`❌ Inventario pieno per ${item.name}`, 'error');
                    }
                }
            }
        } else {
            // Crediti insufficienti
            if (this.game.notifications) {
                this.game.notifications.add(`❌ Crediti insufficienti`, 'error');
            }
        }
    }
    
    drawShopContent(ctx, x, y) {
        // Header con titolo e risorse con tema moderno
        ThemeUtils.drawText(ctx, 'Negozio', x + 20, y + 35, {
            size: 28,
            weight: 'bold',
            color: '#ffffff',
            glow: false
        });
        
        // Risorse in alto a destra con tema moderno
        ThemeUtils.drawText(ctx, `Crediti: ${this.playerData.credits.toLocaleString()}`, x + this.contentWidth - 20, y + 30, {
            size: 18,
            weight: 'bold',
            color: '#ffffff',
            glow: false,
            align: 'right'
        });
        ThemeUtils.drawText(ctx, `Uridium: ${this.playerData.uridium.toLocaleString()}`, x + this.contentWidth - 20, y + 50, {
            size: 18,
            weight: 'bold',
            color: '#ffffff',
            glow: false,
            align: 'right'
        });
        
        // Tab orizzontali del negozio
        this.drawShopTabs(ctx, x + 20, y + 70);
        
        // Area principale del negozio
        this.drawShopMainArea(ctx, x + 20, y + 110); // Ridotto da 120 a 110
    }
    
    drawShopMainArea(ctx, x, y) {
        const items = this.shopItems[this.selectedShopCategory];
        
        if (!items || Object.keys(items).length === 0) {
            ctx.fillStyle = '#888888';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Coming Soon...', x + this.contentWidth/2, y + 150);
            ctx.textAlign = 'left';
            return;
        }
        
        // Layout a due colonne: immagine grande a sinistra, dettagli a destra
        const imageAreaWidth = 420;
        const detailsAreaWidth = this.contentWidth - imageAreaWidth - 60;
        const areaHeight = 450; // Ridotto da 480 a 450
        
        // Sfondo area principale neutro
        ctx.fillStyle = 'rgba(18,18,20,0.94)';
        ctx.fillRect(x, y, this.contentWidth - 40, areaHeight);
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, this.contentWidth - 40, areaHeight);
        
        if (this.selectedShopCategory === 'ammunition') {
            this.drawAmmunitionLayout(ctx, x, y, imageAreaWidth, detailsAreaWidth, areaHeight, items);
        } else if (this.selectedShopCategory === 'equipment') {
            this.drawEquipmentLayout(ctx, x, y, imageAreaWidth, detailsAreaWidth, areaHeight, items);
        } else if (this.selectedShopCategory === 'laser') {
            this.drawLaserLayout(ctx, x, y, imageAreaWidth, detailsAreaWidth, areaHeight, items);
        } else if (this.selectedShopCategory === 'generators') {
            this.drawGeneratorsLayout(ctx, x, y, imageAreaWidth, detailsAreaWidth, areaHeight, items);
        } else if (this.selectedShopCategory === 'consumables') {
            this.drawConsumablesLayout(ctx, x, y, imageAreaWidth, detailsAreaWidth, areaHeight, items);
        } else if (this.selectedShopCategory === 'uav') {
            this.drawUAVLayout(ctx, x, y, imageAreaWidth, detailsAreaWidth, areaHeight, items);
        } else if (this.selectedShopCategory === 'ships') {
            this.drawShipsLayout(ctx, x, y, imageAreaWidth, detailsAreaWidth, areaHeight, items);
        }
        
        // Preview in basso
        this.drawItemPreview(ctx, x, y + areaHeight + 15, this.contentWidth - 40);
    }

    // Layout per categoria NAVI
    drawShipsLayout(ctx, x, y, imageAreaWidth, detailsAreaWidth, areaHeight, items) {
        const imageX = x + 20;
        const imageY = y + 20;
        const imageSize = 380;
        const detailsX = x + 20 + imageAreaWidth + 20;
        const detailsY = y + 20;

        // Placeholder immagine nave
        ThemeUtils.drawPanel(ctx, imageX, imageY, imageAreaWidth - 40, imageSize, {
            background: 'rgba(0,0,0,0.4)',
            border: 'rgba(255,255,255,0.1)'
        });

        // Dettagli nave selezionata
        const item = items[this.selectedShipItem];
        const ownedShips = (window.gameInstance?.playerOwnedShips) || [1];
        const isOwned = ownedShips.includes(item.shipNumber);
        // Determina nave equipaggiata: preferisci stato runtime, poi localStorage
        let isEquipped = false;
        try {
            const runtimeSel = (window.gameInstance?.selectedShipNumber);
            if (runtimeSel === item.shipNumber) {
                isEquipped = true;
            } else {
                // RIMOSSO: const storedSel = parseInt(localStorage.getItem('selectedShipNumber') || '0', 10);
                isEquipped = storedSel === item.shipNumber;
            }
        } catch (_) { isEquipped = false; }
        ThemeUtils.drawText(ctx, item.name, detailsX, detailsY + 10, {
            size: 22,
            weight: 'bold',
            color: '#ffffff'
        });
        // Badge stato
        if (isEquipped) {
            ThemeUtils.drawText(ctx, 'EQUIPAGGIATA', detailsX + 220, detailsY + 10, {
                size: 12,
                weight: 'bold',
                color: '#00ff88'
            });
        } else if (isOwned) {
            ThemeUtils.drawText(ctx, 'POSSEDUTA', detailsX + 220, detailsY + 10, {
                size: 12,
                weight: 'bold',
                color: '#57b7ff'
            });
        }

        ThemeUtils.drawText(ctx, item.description, detailsX, detailsY + 40, {
            size: 14,
            weight: 'normal',
            color: '#cccccc'
        });

        // Stats dinamiche dal modello nave
        const shipModel = this.getShipModel(item.shipNumber);
        if (shipModel) {
            ThemeUtils.drawText(ctx, `HP: ${shipModel.maxHP.toLocaleString()}`, detailsX, detailsY + 80, { size: 14, weight: 'bold', color: '#7ed957' });
            ThemeUtils.drawText(ctx, `Shield: ${shipModel.maxShield.toLocaleString()}`, detailsX + 140, detailsY + 80, { size: 14, weight: 'bold', color: '#57b7ff' });
            ThemeUtils.drawText(ctx, `Velocità: ${shipModel.velocity}`, detailsX, detailsY + 100, { size: 12, weight: 'bold', color: '#ffd700' });
            ThemeUtils.drawText(ctx, `Laser: ${shipModel.laserSlots} | Gen: ${shipModel.generatorSlots} | Extra: ${shipModel.extraSlots}`, detailsX, detailsY + 120, { size: 11, weight: 'normal', color: '#cccccc' });
        }

        // Pulsante acquista/seleziona
        const buyX = detailsX;
        const buyY = detailsY + 140;
        const buttonText = isEquipped ? 'EQUIPAGGIATA' : (isOwned ? 'SELEZIONA' : `ACQUISTA (${(item.price||0).toLocaleString()} ${item.currency==='uridium'?'Uridium':'Credits'})`);
        const canAfford = item.currency === 'uridium' ? (this.playerData.uridium >= (item.price||0)) : (this.playerData.credits >= (item.price||0));
        const enabledBg = ThemeConfig.colors.background.secondary;
        const disabledBg = ThemeConfig.colors.background.disabled;
        const borderCol = ThemeConfig.colors.border.secondary;
        // Disegna manualmente un pulsante grigio neutro per evitare fallback a variant primary
        ThemeUtils.drawPanel(ctx, buyX, buyY, 220, 36, {
            background: (isEquipped ? disabledBg : (isOwned || canAfford ? enabledBg : disabledBg)),
            border: borderCol,
            radius: ThemeConfig.borders.radius.md,
            shadow: false
        });
        ThemeUtils.drawText(ctx, buttonText, buyX + 110, buyY + 18, {
            color: ThemeConfig.colors.text.primary,
            size: 14,
            weight: 'bold',
            align: 'center',
            baseline: 'middle'
        });

        // Le thumbnail sono disegnate e gestite dal preview condiviso in basso
    }
    
    // Ottiene il modello nave dalle stats centrali
    getShipModel(shipNumber) {
        // Importa SHIP_MODELS da Ship.js
        const SHIP_MODELS = {
            1: { maxHP: 4000, maxShield: 4000, velocity: 320, laserSlots: 1, generatorSlots: 1, extraSlots: 1 },
            2: { maxHP: 8000, maxShield: 8000, velocity: 340, laserSlots: 2, generatorSlots: 2, extraSlots: 1 },
            3: { maxHP: 12000, maxShield: 12000, velocity: 280, laserSlots: 3, generatorSlots: 5, extraSlots: 2 },
            4: { maxHP: 16000, maxShield: 16000, velocity: 330, laserSlots: 4, generatorSlots: 6, extraSlots: 2 },
            5: { maxHP: 64000, maxShield: 64000, velocity: 360, laserSlots: 6, generatorSlots: 8, extraSlots: 2 },
            6: { maxHP: 120000, maxShield: 120000, velocity: 340, laserSlots: 7, generatorSlots: 10, extraSlots: 3 },
            7: { maxHP: 160000, maxShield: 160000, velocity: 260, laserSlots: 8, generatorSlots: 15, extraSlots: 3 },
            8: { maxHP: 180000, maxShield: 180000, velocity: 380, laserSlots: 10, generatorSlots: 10, extraSlots: 2 },
            9: { maxHP: 256000, maxShield: 256000, velocity: 300, laserSlots: 15, generatorSlots: 15, extraSlots: 3 },
            10: { maxHP: 64000, maxShield: 64000, velocity: 360, laserSlots: 6, generatorSlots: 6, extraSlots: 1 }
        };
        return SHIP_MODELS[shipNumber] || null;
    }
    
    handleShipsClick(x, y, detailsX, detailsY, items) {
        // Pulsante acquista/seleziona
        const buyX = detailsX;
        const buyY = detailsY + 140;
        if (x >= buyX && x <= buyX + 220 && y >= buyY && y <= buyY + 36) {
            const item = items[this.selectedShipItem];
            const currency = item.currency === 'uridium' ? 'uridium' : 'credits';
            const price = item.price || 0;
            const ownedShips = (window.gameInstance?.playerOwnedShips) || [1];
            const isOwned = ownedShips.includes(item.shipNumber);
            
            if (!isOwned) {
                const hasFunds = currency === 'uridium' ? (this.game.ship.getResource('uridium') >= price) : (this.game.ship.getResource('credits') >= price);
                if (!hasFunds) {
                    this.game.notifications?.add('❌ Valuta insufficiente', 1200, 'error');
                    return true;
                }
                // Deduce e segna come posseduta
                this.game.ship.addResource(currency, -price);
                try {
                    const stored = window.gameInstance.playerOwnedShips || [1];
                    if (!stored.includes(item.shipNumber)) stored.push(item.shipNumber);
                    window.gameInstance.playerOwnedShips = stored;
                    // RIMOSSO: localStorage.setItem('ownedShips', JSON.stringify(stored));
                } catch (_){ }
                // Aggiorna UI crediti
                this.playerData.credits = this.game.ship.getResource('credits');
                this.playerData.uridium = this.game.ship.getResource('uridium');
                this.game.notifications?.add(`✅ Acquistata: ${item.name}`, 1200, 'success');
            }
            // Seleziona/applica nave (sia per acquisto che per selezione)
            if (this.game.ship.isInCombat) {
                this.game.notifications?.add("Impossibile cambiare nave durante il combattimento!", 2000, 'warning');
                return true;
            }
            this.game.ship.switchShip(item.shipNumber);
            window.gameInstance.selectedShipNumber = item.shipNumber;
            // RIMOSSO: localStorage.setItem('selectedShipNumber', String(item.shipNumber));
            this.game.notifications?.add(`🚀 ${item.name} selezionata`, 1200, 'success');
            return true;
        }
        return false;
    }
    
    drawAmmunitionLayout(ctx, x, y, imageAreaWidth, detailsAreaWidth, areaHeight, items) {
        // Area immagine grande a sinistra
        const imageX = x + 20;
        const imageY = y + 20;
        const imageSize = 380;
        
        // Sfondo immagine
        ctx.fillStyle = 'rgba(18,18,20,0.94)';
        ctx.fillRect(imageX, imageY, imageSize, imageSize);
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 2;
        ctx.strokeRect(imageX, imageY, imageSize, imageSize);
        
        // Titolo item selezionato
        const selectedItem = items[this.selectedAmmoItem];
        if (selectedItem) {
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 28px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(selectedItem.name, imageX + imageSize/2, imageY + 40);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 18px Arial';
            ctx.fillText(selectedItem.type === 'laser' ? 'Munizioni laser' : 'Munizioni missile', imageX + imageSize/2, imageY + 70);
        }
        
        // Icona grande centrata
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 100px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(selectedItem ? selectedItem.icon : '⚡', imageX + imageSize/2, imageY + imageSize/2 + 40);
        ctx.textAlign = 'left';
        
        // Stats item
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Danno: x1', imageX + imageSize/2, imageY + imageSize - 30);
        ctx.textAlign = 'left';
        
        // Area dettagli a destra con opzioni acquisto
        const detailsX = x + imageAreaWidth + 20;
        const detailsY = y + 20;
        
        // Opzioni di acquisto multiple
        this.drawPurchaseOptions(ctx, detailsX, detailsY, detailsAreaWidth, items);
    }
    
    drawPurchaseOptions(ctx, x, y, width, items) {
        const optionHeight = 70; // Ridotto da 80 a 70
        const spacing = 12; // Ridotto da 15 a 12
        
        // Titolo sezione
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Arial'; // Ridotto da 22 a 20
        ctx.fillText('OPZIONI ACQUISTO', x, y);
        
        let currentY = y + 25; // Ridotto da 30 a 25
        
        // Mostra solo opzioni per l'item selezionato
        let selectedItem;
        if (this.selectedShopCategory === 'ammunition') {
            selectedItem = items[this.selectedAmmoItem];
        } else if (this.selectedShopCategory === 'laser') {
            selectedItem = items[this.selectedLaserItem];
        } else if (this.selectedShopCategory === 'generators') {
            selectedItem = items[this.selectedGeneratorItem];
        } else {
            selectedItem = items[Object.keys(items)[0]]; // Fallback
        }
        
        if (selectedItem) {
            let quantities, pricePerUnit;
            if (this.selectedShopCategory === 'ammunition') {
                quantities = selectedItem.type === 'laser' ? [100, 1000, 10000, 100000] : [10, 100];
                pricePerUnit = selectedItem.type === 'laser' ? 10 : 100;
            } else if (this.selectedShopCategory === 'laser') {
                quantities = [1, 5, 10, 25];
                pricePerUnit = selectedItem.price;
            } else if (this.selectedShopCategory === 'generators') {
                quantities = [1, 2, 5, 10];
                pricePerUnit = selectedItem.price;
            } else {
                quantities = [1, 5, 10];
                pricePerUnit = selectedItem.price;
            }
            
            quantities.forEach(quantity => {
                let itemKey;
                if (this.selectedShopCategory === 'ammunition') {
                    itemKey = this.selectedAmmoItem;
                } else if (this.selectedShopCategory === 'laser') {
                    itemKey = this.selectedLaserItem;
                } else if (this.selectedShopCategory === 'generators') {
                    itemKey = this.selectedGeneratorItem;
                } else {
                    itemKey = Object.keys(items)[0];
                }
                this.drawPurchaseOption(ctx, x, currentY, width, selectedItem, itemKey, quantity, pricePerUnit);
                currentY += optionHeight + spacing;
            });
        }
    }
    
    drawPurchaseOption(ctx, x, y, width, item, key, quantity, pricePerUnit) {
        const totalPrice = pricePerUnit * quantity;
        const canBuy = this.playerData.credits >= totalPrice;
        
        // Metrics uniformi
        const h = 76;
        const padX = 20;
        const centerY = y + h / 2;
        
        // Sfondo opzione allineato
        ctx.fillStyle = 'rgba(28,28,32,0.95)';
        ctx.fillRect(x, y, width, h);
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, h);
        
        // Quantità (sinistra, uniforme con prezzo)
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`Quantità: ${quantity.toLocaleString()}`, x + padX, centerY);
        
        // Prezzo (destra, stessa baseline)
        ctx.fillStyle = canBuy ? '#d0d0d0' : '#8a8a8a';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${totalPrice.toLocaleString()} x Credits`, x + width - padX, centerY);
        ctx.textAlign = 'left';
        
        // Pulsante acquista (centrato verticalmente)
        const buttonWidth = 120;
        const buttonHeight = 42;
        const buttonX = x + Math.round((width - buttonWidth) / 2);
        const buttonY = Math.round(centerY - buttonHeight / 2);
        
        ctx.fillStyle = canBuy ? '#4CAF50' : '#666666';
        ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        ctx.strokeStyle = canBuy ? '#2E7D32' : '#444444';
        ctx.lineWidth = 1;
        ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('COMPRA', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
        ctx.textAlign = 'left';
    }
    
    drawEquipmentLayout(ctx, x, y, imageAreaWidth, detailsAreaWidth, areaHeight, items) {
        // Area immagine a sinistra
        const imageX = x + 20;
        const imageY = y + 20;
        const imageSize = 300;
        
        // Sfondo immagine
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(imageX, imageY, imageSize, imageSize);
        ctx.strokeStyle = '#444444';
        ctx.lineWidth = 2;
        ctx.strokeRect(imageX, imageY, imageSize, imageSize);
        
        // Icona placeholder per cannoni
        ctx.fillStyle = '#e94560';
        ctx.font = 'bold 64px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⚡', imageX + imageSize/2, imageY + imageSize/2 + 20);
        
        // Testo descrittivo
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Arial';
        ctx.fillText('CANNONI LASER', imageX + imageSize/2, imageY + imageSize + 40);
        ctx.textAlign = 'left';
        
        // Area dettagli a destra
        const detailsX = x + imageAreaWidth + 20;
        const detailsY = y + 20;
        
        // Titolo sezione
        ctx.fillStyle = '#4a90e2';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('CANNONI LASER', detailsX, detailsY);
        
        // Lista cannoni
        let currentY = detailsY + 20;
        const itemHeight = 65;
        
        const cannonItems = Object.keys(items).filter(key => key.startsWith('cannon_'));
        cannonItems.forEach((key, index) => {
            if (currentY + itemHeight > y + areaHeight - 20) return;
            
            const item = items[key];
            this.drawModernShopItem(ctx, detailsX, currentY, item, key, detailsAreaWidth - 20, itemHeight);
            currentY += itemHeight + 10;
        });
    }
    
    drawLaserLayout(ctx, x, y, imageAreaWidth, detailsAreaWidth, areaHeight, items) {
        // Area immagine a sinistra
        const imageX = x + 20;
        const imageY = y + 20;
        const imageSize = 380;
        
        // Sfondo area immagine
        ctx.fillStyle = 'rgba(18,18,20,0.94)';
        ctx.fillRect(imageX, imageY, imageSize, imageSize);
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 2;
        ctx.strokeRect(imageX, imageY, imageSize, imageSize);
        
        // Mostra item selezionato
        const selectedItem = items[this.selectedLaserItem];
        if (selectedItem) {
            // Nome item
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 28px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(selectedItem.name, imageX + imageSize/2, imageY + 40);
            
            // Tipo item
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 18px Arial';
            ctx.fillText('LASER', imageX + imageSize/2, imageY + 70);
            
            // Icona grande
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 100px Arial';
            ctx.fillText(selectedItem.icon, imageX + imageSize/2, imageY + imageSize/2 + 40);
            
            // Descrizione
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px Arial';
            ctx.fillText('LASER', imageX + imageSize/2, imageY + imageSize/2 + 90);
            
            // Danno
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Danno: ' + (selectedItem.key === 'lf1' ? '60' : selectedItem.key === 'lf2' ? '120' : selectedItem.key === 'lf3' ? '200' : '300'), imageX + imageSize/2, imageY + imageSize - 30);
        }
        
        ctx.textAlign = 'left';
        
        // Area dettagli a destra con opzioni acquisto
        const detailsX = x + imageAreaWidth + 20;
        const detailsY = y + 20;
        
        // Opzioni di acquisto multiple
        this.drawPurchaseOptions(ctx, detailsX, detailsY, detailsAreaWidth, items);
    }
    
    drawGeneratorsLayout(ctx, x, y, imageAreaWidth, detailsAreaWidth, areaHeight, items) {
        console.log('🎨 Disegno layout generatori:', { items });
        // Area immagine a sinistra
        const imageX = x + 20;
        const imageY = y + 20;
        const imageSize = 380;
        
        // Sfondo area immagine
        ctx.fillStyle = 'rgba(18,18,20,0.94)';
        ctx.fillRect(imageX, imageY, imageSize, imageSize);
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 2;
        ctx.strokeRect(imageX, imageY, imageSize, imageSize);
        
        // Mostra item selezionato
        const selectedItem = items[this.selectedGeneratorItem];
        if (selectedItem) {
            // Nome item
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 28px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(selectedItem.name, imageX + imageSize/2, imageY + 40);
            
            // Tipo item
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 18px Arial';
            ctx.fillText('GENERATORE', imageX + imageSize/2, imageY + 70);
            
            // Icona grande
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 100px Arial';
            ctx.fillText(selectedItem.icon, imageX + imageSize/2, imageY + imageSize/2 + 40);
            
            // Descrizione
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px Arial';
            ctx.fillText('GENERATORE', imageX + imageSize/2, imageY + imageSize/2 + 90);
            
            // Potenza
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Potenza: ' + (selectedItem.key === 'gen1' ? '100' : selectedItem.key === 'gen2' ? '200' : selectedItem.key === 'gen3' ? '400' : '800'), imageX + imageSize/2, imageY + imageSize - 30);
        }
        
        ctx.textAlign = 'left';
        
        // Area dettagli a destra con opzioni acquisto
        const detailsX = x + imageAreaWidth + 20;
        const detailsY = y + 20;
        
        // Opzioni di acquisto multiple
        this.drawPurchaseOptions(ctx, detailsX, detailsY, detailsAreaWidth, items);
    }
    
    drawConsumablesLayout(ctx, x, y, imageAreaWidth, detailsAreaWidth, areaHeight, items) {
        // Placeholder per consumabili
        ctx.fillStyle = '#888888';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Coming Soon...', x + (this.contentWidth - 40)/2, y + areaHeight/2);
        ctx.textAlign = 'left';
    }
    
    drawUAVLayout(ctx, x, y, imageAreaWidth, detailsAreaWidth, areaHeight, items) {
        // Area immagine grande a sinistra
        const imageX = x + 20;
        const imageY = y + 20;
        const imageSize = 380;
        
        // Sfondo immagine
        ctx.fillStyle = 'rgba(18,18,20,0.94)';
        ctx.fillRect(imageX, imageY, imageSize, imageSize);
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 2;
        ctx.strokeRect(imageX, imageY, imageSize, imageSize);
        
        // Titolo drone selezionato
        const selectedItem = items[this.selectedUAVItem];
        if (selectedItem) {
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 28px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(selectedItem.name, imageX + imageSize/2, imageY + 40);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 18px Arial';
            ctx.fillText('Drone UAV', imageX + imageSize/2, imageY + 70);
        }
        
        // Icona drone grande centrata
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 100px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🚁', imageX + imageSize/2, imageY + imageSize/2 + 40);
        ctx.textAlign = 'left';
        
        // Stats drone
        if (selectedItem) {
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`Slot: ${selectedItem.slots}`, imageX + imageSize/2, imageY + imageSize - 50);
            ctx.fillText(`Tipo: ${selectedItem.droneType.toUpperCase()}`, imageX + imageSize/2, imageY + imageSize - 30);
            ctx.textAlign = 'left';
        }
        
        // Area dettagli a destra
        const detailsX = x + 20 + imageAreaWidth + 20;
        const detailsY = y + 20;
        
        // Titolo dettagli
        ctx.fillStyle = '#ff6b6b';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('Dettagli Drone', detailsX, detailsY + 30);
        
        if (selectedItem) {
            // Descrizione
            ctx.fillStyle = '#ffffff';
            ctx.font = '16px Arial';
            ctx.fillText(selectedItem.description, detailsX, detailsY + 70);
            
            // Caratteristiche
            ctx.fillStyle = '#cccccc';
            ctx.font = 'bold 18px Arial';
            ctx.fillText('Caratteristiche:', detailsX, detailsY + 120);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '14px Arial';
            ctx.fillText(`• Slot disponibili: ${selectedItem.slots}`, detailsX, detailsY + 150);
            ctx.fillText(`• Tipo: ${selectedItem.droneType}`, detailsX, detailsY + 170);
            ctx.fillText(`• Può equipaggiare: Laser e Scudi`, detailsX, detailsY + 190);
            
            // Prezzo
            const currency = selectedItem.cost.credits ? 'Crediti' : 'Uridium';
            const price = selectedItem.cost.credits || selectedItem.cost.uridium;
            
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 20px Arial';
            ctx.fillText(`Prezzo: ${price.toLocaleString()} ${currency}`, detailsX, detailsY + 230);
            
            // Pulsante acquisto
            const buttonY = detailsY + 280;
            const buttonWidth = 120;
            const buttonHeight = 35;
            
            // Controlla se il limite è stato raggiunto
            const currentUAVCount = this.game.inventory.equipment.uav.length;
            const canBuy = currentUAVCount < 8;
            
            // Sfondo pulsante
            ctx.fillStyle = canBuy ? '#ff6b6b' : '#666666';
            ctx.fillRect(detailsX + 20, buttonY, buttonWidth, buttonHeight);
            
            // Bordo pulsante
            ctx.strokeStyle = canBuy ? '#ffffff' : '#999999';
            ctx.lineWidth = 2;
            ctx.strokeRect(detailsX + 20, buttonY, buttonWidth, buttonHeight);
            
            // Testo pulsante
            ctx.fillStyle = canBuy ? '#ffffff' : '#cccccc';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(canBuy ? 'Acquista 1' : 'Limite Raggiunto', detailsX + 20 + buttonWidth/2, buttonY + buttonHeight/2 + 5);
            ctx.textAlign = 'left';
            
            // Mostra contatore droni
            ctx.fillStyle = '#cccccc';
            ctx.font = '14px Arial';
            ctx.fillText(`Droni attuali: ${currentUAVCount}/8`, detailsX + 20, buttonY + buttonHeight + 20);
        }
    }
    
    
    drawModernShopItem(ctx, x, y, item, key, width, height) {
        // Sfondo item
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = '#444444';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
        
        // Icona
        ctx.fillStyle = item.icon === '⚡' ? '#4a90e2' : '#e94560';
        ctx.font = '24px Arial';
        ctx.fillText(item.icon, x + 15, y + 25);
        
        // Nome
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(item.name, x + 50, y + 20);
        
        // Quantità
        ctx.fillStyle = '#888888';
        ctx.font = '12px Arial';
        ctx.fillText(`x${item.amount}`, x + 50, y + 35);
        
        // Prezzo
        const totalPrice = item.price * item.amount;
        ctx.fillStyle = '#e94560';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`${totalPrice.toLocaleString()} Credits`, x + width - 10, y + 25);
        ctx.textAlign = 'left';
        
        // Info possedute/equipaggiate
        ctx.fillStyle = '#888888';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        if (item.type === 'cannon') {
            const equipped = this.game.ship.getEquippedCannons(item.key);
            ctx.fillText(`Equipaggiati: ${equipped}`, x + width - 10, y + 40);
        } else {
            const current = this.game.ship.getAmmunition(item.type, item.key);
            const max = this.game.ship.maxAmmunition[item.type][item.key];
            ctx.fillText(`Possedute: ${current}/${max}`, x + width - 10, y + 40);
        }
        ctx.textAlign = 'left';
        
        // Pulsante acquista
        const canBuy = this.playerData.credits >= totalPrice;
        const buttonX = x + width - 100;
        const buttonY = y + height - 25;
        const buttonWidth = 80;
        const buttonHeight = 20;
        
        ctx.fillStyle = canBuy ? '#4CAF50' : '#666666';
        ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        ctx.strokeStyle = canBuy ? '#2E7D32' : '#444444';
        ctx.lineWidth = 1;
        ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('ACQUISTA', buttonX + buttonWidth/2, buttonY + 14);
        ctx.textAlign = 'left';
    }
    
    drawItemPreview(ctx, x, y, width) {
        const previewHeight = 110;
        
        // Sfondo preview neutro
        ctx.fillStyle = 'rgba(18,18,20,0.94)';
        ctx.fillRect(x, y, width, previewHeight);
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, previewHeight);
        
        // Salva bounds per interazioni e clip area per scroll orizzontale
        ctx.save();
        this.previewBounds = { x, y, width, height: previewHeight };
        ctx.rect(x, y, width, previewHeight);
        ctx.clip();
        
        // Mostra tutti gli items disponibili con scroll
        const items = this.shopItems[this.selectedShopCategory];
        const thumbSize = 70;
        const thumbSpacing = 180;
        let thumbX = x + 20 + this.thumbnailScrollX;
        const thumbY = y + 15;
        
        // Lista tutti gli items
        const allItems = Object.keys(items);
        allItems.forEach((itemKey, index) => {
            const item = items[itemKey];
            let isSelected = false;
            if (this.selectedShopCategory === 'ammunition') {
                isSelected = itemKey === this.selectedAmmoItem;
            } else if (this.selectedShopCategory === 'laser') {
                isSelected = itemKey === this.selectedLaserItem;
            } else if (this.selectedShopCategory === 'generators') {
                isSelected = itemKey === this.selectedGeneratorItem;
            } else if (this.selectedShopCategory === 'uav') {
                isSelected = itemKey === this.selectedUAVItem;
            } else if (this.selectedShopCategory === 'ships') {
                isSelected = itemKey === this.selectedShipItem;
            }
            
            // Bordo evidenziato per item selezionato
            if (isSelected) {
                ctx.fillStyle = 'rgba(40,40,44,0.95)';
                ctx.fillRect(thumbX - 3, thumbY - 3, thumbSize + 6, thumbSize + 6);
            }
            
            ctx.fillStyle = '#2a2a2a';
            ctx.fillRect(thumbX, thumbY, thumbSize, thumbSize);
            ctx.strokeStyle = isSelected ? '#e94560' : '#444444';
            ctx.lineWidth = isSelected ? 3 : 1;
            ctx.strokeRect(thumbX, thumbY, thumbSize, thumbSize);
            
            // Icona thumbnail
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(item.icon, thumbX + thumbSize/2, thumbY + thumbSize/2 + 12);
            ctx.textAlign = 'left';
            
            // Solo nome item sotto l'icona
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(item.name, thumbX + thumbSize/2, thumbY + thumbSize + 18);
            ctx.textAlign = 'left';
            
            thumbX += thumbSpacing;
        });
        
        ctx.restore();
        
        // Aggiorna max scroll per inerzia
        const totalWidth = allItems.length * thumbSpacing;
        const visibleWidth = width - 40;
        const maxScroll = Math.max(0, totalWidth - visibleWidth);
        this.thumbnailMaxScroll = maxScroll;
        // Aggiorna easing verso il target
        if (!this.thumbnailIsDragging) {
            const k = 0.15;
            const delta = this.thumbnailScrollTargetX - this.thumbnailScrollX;
            if (Math.abs(delta) > 0.1) {
                this.thumbnailScrollX += delta * k;
            } else {
                this.thumbnailScrollX = this.thumbnailScrollTargetX;
            }
        }
        
        // Nessuna freccia: scroll con wheel/drag + inerzia
    }
    
    drawShopTabs(ctx, x, y) {
        const tabs = [
            { id: 'ammunition', name: 'MUNIZIONI' },
            { id: 'laser', name: 'LASER' },
            { id: 'generators', name: 'GENERATORI' },
            { id: 'uav', name: 'UAV' },
            { id: 'ships', name: 'NAVI' }
        ];
        
        const tabWidth = 140;
        const tabHeight = 40;
        
        tabs.forEach((tab, index) => {
            const tabX = x + index * tabWidth;
            const isSelected = this.selectedShopCategory === tab.id;
            
            // Pulsante tab con tema moderno
            ThemeUtils.drawButton(ctx, tabX, y, tabWidth, tabHeight, {
                text: tab.name,
                textSize: 16,
                textWeight: 'bold',
                textColor: '#ffffff',
                background: isSelected ? 'rgba(40,40,44,0.95)' : 'rgba(28,28,32,0.95)',
                border: isSelected ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.12)',
                hover: false,
                glow: false
            });
        });
    }
    
    drawShopItems(ctx, x, y) {
        const items = this.shopItems[this.selectedShopCategory];
        
        // Se non ci sono oggetti per questa categoria
        if (!items || Object.keys(items).length === 0) {
            ctx.fillStyle = '#888888';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Coming Soon...', x + this.contentWidth/2, y + 100);
            ctx.textAlign = 'left';
            return;
        }
        
        const startY = y;
        const itemHeight = 60;
        let currentY = startY;
        
        if (this.selectedShopCategory === 'ammunition') {
            // Sezione Laser
            ctx.fillStyle = '#e94560';
            ctx.font = 'bold 16px Arial';
            ctx.fillText('LASER', x, currentY);
            currentY += 25;
            
            // Laser items
            const laserItems = Object.keys(items).filter(key => key.startsWith('laser_'));
            laserItems.forEach((key, index) => {
                const item = items[key];
                const itemY = currentY + index * itemHeight;
                this.drawShopItem(ctx, x, itemY, item, key);
            });
            
            currentY += laserItems.length * itemHeight + 20;
            
            // Separatore
            ctx.strokeStyle = '#444444';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, currentY);
            ctx.lineTo(x + this.contentWidth - 40, currentY);
        ctx.stroke();
            currentY += 20;
            
            // Sezione Missili
            ctx.fillStyle = '#e94560';
            ctx.font = 'bold 16px Arial';
            ctx.fillText('MISSILI', x, currentY);
            currentY += 25;
            
            // Missile items
            const missileItems = Object.keys(items).filter(key => key.startsWith('missile_'));
            missileItems.forEach((key, index) => {
                const item = items[key];
                const itemY = currentY + index * itemHeight;
                this.drawShopItem(ctx, x, itemY, item, key);
            });
        } else if (this.selectedShopCategory === 'equipment') {
            // Sezione Cannoni
            ctx.fillStyle = '#e94560';
            ctx.font = 'bold 16px Arial';
            ctx.fillText('CANNONI', x, currentY);
            currentY += 25;
            
            // Cannon items
            const cannonItems = Object.keys(items).filter(key => key.startsWith('cannon_'));
            cannonItems.forEach((key, index) => {
                const item = items[key];
                const itemY = currentY + index * itemHeight;
                this.drawShopItem(ctx, x, itemY, item, key);
            });
        } else if (this.selectedShopCategory === 'consumables') {
            // Sezione Consumabili
            ctx.fillStyle = '#e94560';
            ctx.font = 'bold 16px Arial';
            ctx.fillText('CONSUMABILI', x, currentY);
            currentY += 25;
            
            // Consumable items
            const consumableItems = Object.keys(items).filter(key => key.startsWith('consumable_'));
            consumableItems.forEach((key, index) => {
                const item = items[key];
                const itemY = currentY + index * itemHeight;
                this.drawShopItem(ctx, x, itemY, item, key);
            });
        }
    }
    
    drawShopItem(ctx, x, y, item, key) {
        // Pannello item con tema moderno
        ThemeUtils.drawPanel(ctx, x, y, this.contentWidth - 40, 50, {
            background: ThemeConfig.colors.background.secondary,
            border: ThemeConfig.colors.border.secondary,
            blur: false,
            shadow: true
        });
        
        // Icona
        ThemeUtils.drawText(ctx, item.icon, x + 10, y + 25, {
            size: 20,
            weight: 'normal',
            color: ThemeConfig.colors.text.primary,
            glow: false
        });
        
        // Nome e quantità
        ThemeUtils.drawText(ctx, item.name, x + 40, y + 20, {
            size: 14,
            weight: 'normal',
            color: ThemeConfig.colors.text.primary,
            glow: false
        });
        ThemeUtils.drawText(ctx, `x${item.amount}`, x + 40, y + 35, {
            size: 14,
            weight: 'normal',
            color: ThemeConfig.colors.text.secondary,
            glow: false
        });
        
        // Prezzo
        const totalPrice = item.price * item.amount;
        ThemeUtils.drawText(ctx, `${totalPrice.toLocaleString()} Credits`, x + 200, y + 25, {
            size: 14,
            weight: 'bold',
            color: ThemeConfig.colors.accent.primary,
            glow: true
        });
        
        // Munizioni attuali (solo per laser e missili)
        if (item.type === 'cannon') {
            // Per i cannoni, mostra quanti sono equipaggiati
            const equipped = this.game.ship.getEquippedCannons(item.key);
            ThemeUtils.drawText(ctx, `Equipaggiati: ${equipped}`, x + 350, y + 25, {
                size: 12,
                weight: 'normal',
                color: ThemeConfig.colors.text.secondary,
                glow: false
            });
        } else {
            // Per laser e missili, mostra munizioni
            const currentAmmo = this.game.ship.getAmmunition(item.type, item.key);
            const maxAmmo = this.game.ship.maxAmmunition[item.type][item.key];
            ThemeUtils.drawText(ctx, `Possedute: ${currentAmmo}/${maxAmmo}`, x + 350, y + 25, {
                size: 12,
                weight: 'normal',
                color: ThemeConfig.colors.text.secondary,
                glow: false
            });
        }
            
        // Pulsante acquista
        const buyButtonX = x + this.contentWidth - 120;
        const buyButtonY = y + 15;
        
        // Controlla se può acquistare
        const canAfford = this.playerData.credits >= totalPrice;
        let canBuy = canAfford;
        
        // Per laser e missili, controlla anche le munizioni
        if (item.type !== 'cannon') {
            const currentAmmo = this.game.ship.getAmmunition(item.type, item.key);
            const maxAmmo = this.game.ship.maxAmmunition[item.type][item.key];
            const canFit = currentAmmo + item.amount <= maxAmmo;
            canBuy = canAfford && canFit;
        }
        
        // Pulsante acquista con tema moderno
        ThemeUtils.drawButton(ctx, buyButtonX, buyButtonY, 80, 25, {
            text: canBuy ? 'ACQUISTA' : 'NON DISP.',
            textSize: 12,
            textWeight: 'bold',
            textColor: ThemeConfig.colors.text.primary,
            background: canBuy ? ThemeConfig.colors.accent.success : ThemeConfig.colors.background.disabled,
            border: canBuy ? ThemeConfig.colors.border.success : ThemeConfig.colors.border.disabled,
            hover: false,
            glow: canBuy
        });
    }
    
    // Metodo per disegnare il contenuto della categoria Clan
    useStarEnergy() {
        // Consuma 1 StarEnergy (lascia che Ship gestisca la notifica insufficienza)
        if (!this.game.ship.useStarEnergy(1)) {
            this.lastConversionResult = "Non hai abbastanza Star Energy!";
            return;
        }

        // Decidi il tipo di ricompensa: missili (50%), ammo (35%), star energy (15%)
        const random = Math.random();
        
        if (random < 0.50) {
            // Missili (50%)
            const missileTypes = ['r1', 'r2', 'r3'];
            const randomType = missileTypes[Math.floor(Math.random() * missileTypes.length)];
            const amount = Math.floor(Math.random() * 3) + 1;
            
            this.game.ship.addAmmunition('missile', randomType, amount);
            
            const result = `+ ${amount} ${randomType.toUpperCase()} missiles`;
            this.lastConversionResult = result;
            this.conversionHistory.unshift({ result, timestamp: Date.now() });
            if (this.conversionHistory.length > this.maxHistoryLength) {
                this.conversionHistory.pop();
            }
            
            if (this.game.notifications) {
                this.game.notifications.add(`🚀 Hai ottenuto ${amount} missili ${randomType.toUpperCase()}!`, "reward");
            }
        } else if (random < 0.85) {
            // Ammo (35%)
            const ammoTypes = ['x1', 'x2', 'x3'];
            const randomType = ammoTypes[Math.floor(Math.random() * ammoTypes.length)];
            const amount = Math.floor(Math.random() * 10) + 5; // 5-15 munizioni
            
            this.game.ship.addAmmunition('laser', randomType, amount);
            
            const result = `+ ${amount} ${randomType.toUpperCase()} ammo`;
            this.lastConversionResult = result;
            this.conversionHistory.unshift({ result, timestamp: Date.now() });
            if (this.conversionHistory.length > this.maxHistoryLength) {
                this.conversionHistory.pop();
            }
            
            if (this.game.notifications) {
                this.game.notifications.add(`💥 Hai ottenuto ${amount} munizioni ${randomType.toUpperCase()}!`, "reward");
            }
        } else {
            // Star Energy (15%)
            const amount = Math.floor(Math.random() * 2) + 1; // 1-2 Star Energy
            
            this.game.ship.addResource('starEnergy', amount);
            
            const result = `+ ${amount} Star Energy`;
            this.lastConversionResult = result;
            this.conversionHistory.unshift({ result, timestamp: Date.now() });
            if (this.conversionHistory.length > this.maxHistoryLength) {
                this.conversionHistory.pop();
            }
            
            if (this.game.notifications) {
                this.game.notifications.add(`⭐ Hai ottenuto ${amount} Star Energy!`, "reward");
            }
        }
    }

    drawStarEnergyContent(ctx, x, y) {
        const starEnergyInfo = this.game.ship.getStarEnergyInfo();
        
        // Layout migliorato con disposizione più organizzata
        const centerX = x + this.contentWidth / 2 - 250;
        const centerY = y + 20;
        const panelWidth = 500;
        const panelHeight = 650;

        // Aggiungi handler per il click se non esiste
        if (!this.starEnergyClickHandler) {
            this.starEnergyClickHandler = (e) => {
                if (this.selectedCategory !== 'starenergy') return;
                if (!this.game.canvas) return;

                // Ottieni le coordinate reali del canvas
                const canvasRect = this.game.canvas.getBoundingClientRect();
                
                // Calcola le coordinate del click relative al canvas
                const canvasX = e.clientX - canvasRect.left;
                const canvasY = e.clientY - canvasRect.top;
                
                // Coordinate del bottone nel canvas
                const buttonX = centerX + panelWidth/2 - 120;
                const buttonY = centerY + 150;
                const buttonWidth = 240;
                const buttonHeight = 40;

                // Controlla se il click è sul bottone con un piccolo padding per maggiore tolleranza
                const padding = 2;
                if (canvasX >= buttonX - padding && 
                    canvasX <= buttonX + buttonWidth + padding &&
                    canvasY >= buttonY - padding && 
                    canvasY <= buttonY + buttonHeight + padding) {
                    this.useStarEnergy();
                }
            };
            
            // Aggiungi l'event listener al canvas invece che al document
            if (this.game.canvas) {
                this.game.canvas.addEventListener('click', this.starEnergyClickHandler);
            }
        }

        // Sfondo pannello principale (uniforme scuro)
        ctx.fillStyle = 'rgba(18,18,20,0.94)';
        ctx.fillRect(centerX, centerY, panelWidth, panelHeight);
        
        // Bordo tenue uniforme
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 2;
        ctx.strokeRect(centerX, centerY, panelWidth, panelHeight);

        // Titolo principale
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'transparent';
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('STAR ENERGY', centerX + panelWidth/2, centerY + 35);

        // Sezione energia corrente - più compatta
        const energySectionY = centerY + 60;
        
        // Sfondo sezione energia
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(centerX + 20, energySectionY, panelWidth - 40, 60);
        
        // Bordo sezione energia
        ctx.strokeStyle = 'rgba(74, 144, 226, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(centerX + 20, energySectionY, panelWidth - 40, 60);

        // Valore energia con effetto glow
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#4a90e2';
        ctx.shadowBlur = 12;
        ctx.font = 'bold 48px Arial';
        ctx.fillText(`${Math.floor(starEnergyInfo.current)}`, centerX + panelWidth/2, energySectionY + 45);
        ctx.shadowBlur = 0;
        
        // Bottone di conversione - più compatto
        const buttonX = centerX + panelWidth/2 - 120;
        const buttonY = centerY + 150;
        const buttonWidth = 240;
        const buttonHeight = 40;

        // Sfondo bottone con gradiente
        const buttonGradient = ctx.createLinearGradient(buttonX, buttonY, buttonX, buttonY + buttonHeight);
        buttonGradient.addColorStop(0, '#1a3f5c');
        buttonGradient.addColorStop(1, '#2a4f6c');
        ctx.fillStyle = buttonGradient;
        ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        // Bordo bottone con glow
        ctx.strokeStyle = '#4a90e2';
        ctx.shadowColor = '#4a90e2';
        ctx.shadowBlur = 5;
        ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
        ctx.shadowBlur = 0;

        // Testo bottone
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('CONVERT (1 ENERGY)', centerX + panelWidth/2, buttonY + 26);

        // Descrizione conversione
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '12px Arial';
        ctx.fillText('Convert to ammo or missiles', centerX + panelWidth/2, buttonY + 50);

        // Risultato ultima conversione
        if (this.lastConversionResult) {
            ctx.fillStyle = '#00ff00';
            ctx.shadowColor = '#00ff00';
            ctx.shadowBlur = 8;
            ctx.font = 'bold 16px Arial';
            ctx.fillText(this.lastConversionResult, centerX + panelWidth/2, buttonY + 75);
            ctx.shadowBlur = 0;
        }

        // Sezione cronologia - più organizzata
        const historyY = buttonY + 100;
        
        // Titolo cronologia
        ctx.fillStyle = '#4a90e2';
        ctx.shadowColor = '#4a90e2';
        ctx.shadowBlur = 6;
        ctx.font = 'bold 16px Arial';
        ctx.fillText('CONVERSION HISTORY', centerX + panelWidth/2, historyY);
        ctx.shadowBlur = 0;

        // Sfondo area cronologia
        const historyAreaX = centerX + 20;
        const historyAreaY = historyY + 20;
        const historyAreaWidth = panelWidth - 40;
        const historyAreaHeight = 300;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(historyAreaX, historyAreaY, historyAreaWidth, historyAreaHeight);
        
        // Bordo area cronologia
        ctx.strokeStyle = 'rgba(74, 144, 226, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(historyAreaX, historyAreaY, historyAreaWidth, historyAreaHeight);

        // Area di clip per la cronologia
        ctx.save();
        ctx.beginPath();
        ctx.rect(historyAreaX, historyAreaY, historyAreaWidth, historyAreaHeight);
        ctx.clip();

        // Lista cronologia con layout migliorato
        const maxVisibleItems = Math.floor(historyAreaHeight / 28);
        
        this.conversionHistory.forEach((entry, index) => {
            if (index === 0) return; // Salta il primo che è già mostrato sopra
            
            const itemY = historyAreaY + 12 + ((index - 1) * 28) - this.historyScrollOffset;
            
            // Mostra solo se nell'area visibile
            if (itemY >= historyAreaY && itemY <= historyAreaY + historyAreaHeight - 28) {
                // Sfondo alternato per le righe
                if ((index - 1) % 2 === 0) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
                    ctx.fillRect(historyAreaX + 8, itemY - 8, historyAreaWidth - 16, 24);
                }
                
                // Icona tipo munizione
                const iconX = historyAreaX + 15;
                const iconY = itemY - 2;
                
                // Determina icona e colore basato sul tipo
                let icon = '⚡';
                let iconColor = '#00ff00';
                
                if (entry.result.includes('missiles')) {
                    icon = '🚀';
                    iconColor = '#ff6b6b';
                } else if (entry.result.includes('Star Energy')) {
                    icon = '⭐';
                    iconColor = '#4a90e2';
                } else if (entry.result.includes('ammo')) {
                    icon = '💥';
                    iconColor = '#ffd93d';
                }
                
                // Disegna icona
                ctx.fillStyle = iconColor;
                ctx.font = '14px Arial';
                ctx.fillText(icon, iconX, iconY);
                
                // Tempo con formato migliorato
                const timeAgo = Math.floor((Date.now() - entry.timestamp) / 1000);
                let timeStr;
                if (timeAgo < 60) {
                    timeStr = `${timeAgo}s ago`;
                } else if (timeAgo < 3600) {
                    timeStr = `${Math.floor(timeAgo/60)}m ago`;
                } else {
                    timeStr = `${Math.floor(timeAgo/3600)}h ago`;
                }
                
                ctx.fillStyle = '#888888';
                ctx.font = '11px Arial';
                ctx.fillText(timeStr, iconX + 20, iconY);
                
                // Risultato conversione
                ctx.fillStyle = iconColor;
                ctx.font = 'bold 13px Arial';
                ctx.fillText(entry.result, iconX + 100, iconY);
                
                // Separatore sottile
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(historyAreaX + 10, itemY + 6);
                ctx.lineTo(historyAreaX + historyAreaWidth - 10, itemY + 6);
                ctx.stroke();
            }
        });
        
        ctx.restore();
        
        // Scrollbar personalizzata se necessario
        const totalItems = this.conversionHistory.length - 1;
        if (totalItems > maxVisibleItems) {
            const scrollbarWidth = 6;
            const scrollbarX = historyAreaX + historyAreaWidth - scrollbarWidth - 5;
            const scrollbarHeight = historyAreaHeight - 10;
            const scrollbarY = historyAreaY + 5;
            
            // Sfondo scrollbar
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(scrollbarX, scrollbarY, scrollbarWidth, scrollbarHeight);
            
            // Handle scrollbar
            const handleHeight = (scrollbarHeight * maxVisibleItems) / totalItems;
            const handleY = scrollbarY + (this.historyScrollOffset / (totalItems * 28)) * (scrollbarHeight - handleHeight);
            
            ctx.fillStyle = '#4a90e2';
            ctx.fillRect(scrollbarX, handleY, scrollbarWidth, handleHeight);
        }
    }

    drawClanContent(ctx, x, y) {
        const centerX = x + this.contentWidth / 2;
        const startY = y + 30;
        
        // Titolo
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🏰 GESTIONE CLAN', centerX, startY);
        
        // Informazioni clan attuale
        const clanInfo = this.game.ship.getClanInfo();
        
        if (clanInfo) {
            // Il giocatore è in un clan
            this.drawClanInfo(ctx, x, y, clanInfo);
        } else {
            // Il giocatore non è in un clan
            this.drawNoClanInfo(ctx, x, y);
        }
    }
    
    // Disegna le informazioni del clan quando il giocatore è in un clan
    drawClanInfo(ctx, x, y, clanInfo) {
        const centerX = x + this.contentWidth / 2;
        const startY = y + 80;
        
        // Box informazioni clan
        const infoBoxX = x + 50;
        const infoBoxY = startY;
        const infoBoxWidth = this.contentWidth - 100;
        const infoBoxHeight = 200;
        
        // Sfondo box
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(infoBoxX, infoBoxY, infoBoxWidth, infoBoxHeight);
        ctx.strokeStyle = '#4a90e2';
        ctx.lineWidth = 2;
        ctx.strokeRect(infoBoxX, infoBoxY, infoBoxWidth, infoBoxHeight);
        
        // Titolo clan
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`🏰 ${clanInfo.name} [${clanInfo.tag}]`, infoBoxX + 20, infoBoxY + 30);
        
        // Ruolo
        ctx.fillStyle = '#4a90e2';
        ctx.font = '16px Arial';
        const roleText = this.getRoleDisplayName(clanInfo.role);
        ctx.fillText(`Ruolo: ${roleText}`, infoBoxX + 20, infoBoxY + 60);
        
        // Membro dal
        ctx.fillStyle = '#cccccc';
        ctx.font = '14px Arial';
        ctx.fillText(`Membro dal: ${clanInfo.memberSince}`, infoBoxX + 20, infoBoxY + 85);
        
        // Pulsanti azione
        const buttonY = infoBoxY + 120;
        const buttonWidth = 120;
        const buttonHeight = 35;
        const buttonSpacing = 20;
        
        // Pulsante "Lascia Clan"
        const leaveButtonX = infoBoxX + 20;
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(leaveButtonX, buttonY, buttonWidth, buttonHeight);
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('LASCIA CLAN', leaveButtonX + buttonWidth/2, buttonY + 22);
        
        // Pulsante "Gestisci Clan" (solo per leader)
        if (clanInfo.role === 'leader') {
            const manageButtonX = leaveButtonX + buttonWidth + buttonSpacing;
            ctx.fillStyle = '#4a90e2';
            ctx.fillRect(manageButtonX, buttonY, buttonWidth, buttonHeight);
            ctx.fillStyle = '#ffffff';
            ctx.fillText('GESTISCI', manageButtonX + buttonWidth/2, buttonY + 22);
        }
        
        ctx.textAlign = 'left';
    }
    
    // Disegna le informazioni quando il giocatore non è in un clan
    drawNoClanInfo(ctx, x, y) {
        const centerX = x + this.contentWidth / 2;
        const startY = y + 80;
        
        // Messaggio principale
        ctx.fillStyle = '#cccccc';
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Non sei in nessun clan', centerX, startY);
        
        // Box opzioni
        const optionsBoxX = x + 50;
        const optionsBoxY = startY + 50;
        const optionsBoxWidth = this.contentWidth - 100;
        const optionsBoxHeight = 200;
        
        // Sfondo box
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(optionsBoxX, optionsBoxY, optionsBoxWidth, optionsBoxHeight);
        ctx.strokeStyle = '#4a90e2';
        ctx.lineWidth = 2;
        ctx.strokeRect(optionsBoxX, optionsBoxY, optionsBoxWidth, optionsBoxHeight);
        
        // Pulsanti
        const buttonY = optionsBoxY + 50;
        const buttonWidth = 150;
        const buttonHeight = 40;
        const buttonSpacing = 30;
        
        // Pulsante "Crea Clan"
        const createButtonX = optionsBoxX + 50;
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(createButtonX, buttonY, buttonWidth, buttonHeight);
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🏰 CREA CLAN', createButtonX + buttonWidth/2, buttonY + 25);
        
        // Pulsante "Cerca Clan"
        const searchButtonX = createButtonX + buttonWidth + buttonSpacing;
        ctx.fillStyle = '#3498db';
        ctx.fillRect(searchButtonX, buttonY, buttonWidth, buttonHeight);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('🔍 CERCA CLAN', searchButtonX + buttonWidth/2, buttonY + 25);
        
        // Pulsante "Entra per Invito"
        const inviteButtonX = createButtonX;
        const inviteButtonY = buttonY + buttonHeight + 20;
        ctx.fillStyle = '#9b59b6';
        ctx.fillRect(inviteButtonX, inviteButtonY, buttonWidth, buttonHeight);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('📨 INVITO', inviteButtonX + buttonWidth/2, inviteButtonY + 25);
        
        ctx.textAlign = 'left';
    }
    
    // Converte il ruolo in nome visualizzato
    getRoleDisplayName(role) {
        const roleNames = {
            'leader': 'Leader',
            'officer': 'Ufficiale',
            'member': 'Membro',
            'none': 'Nessuno'
        };
        return roleNames[role] || 'Sconosciuto';
    }
    
    // Gestisce i click nella categoria clan
    handleClanClick(x, y, panelX, panelY) {
        const contentX = panelX + this.navWidth;
        const contentY = panelY + 60;
        
        const clanInfo = this.game.ship.getClanInfo();
        
        if (clanInfo) {
            // Il giocatore è in un clan - gestisci pulsanti
            return this.handleClanMemberClick(x, y, contentX, contentY, clanInfo);
        } else {
            // Il giocatore non è in un clan - gestisci opzioni
            return this.handleNoClanClick(x, y, contentX, contentY);
        }
    }
    
    // Gestisce i click quando il giocatore è in un clan
    handleClanMemberClick(x, y, contentX, contentY, clanInfo) {
        const startY = contentY + 80;
        const infoBoxX = contentX + 50;
        const infoBoxY = startY;
        const buttonY = infoBoxY + 120;
        const buttonWidth = 120;
        const buttonHeight = 35;
        const buttonSpacing = 20;
        
        // Pulsante "Lascia Clan"
        const leaveButtonX = infoBoxX + 20;
        if (x >= leaveButtonX && x <= leaveButtonX + buttonWidth && 
            y >= buttonY && y <= buttonY + buttonHeight) {
            
            const result = this.game.ship.leaveClan();
            if (this.game.notifications) {
                this.game.notifications.add(result.message, 3000, result.success ? 'success' : 'error');
            }
            return true;
        }
        
        // Pulsante "Gestisci Clan" (solo per leader)
        if (clanInfo.role === 'leader') {
            const manageButtonX = leaveButtonX + buttonWidth + buttonSpacing;
            if (x >= manageButtonX && x <= manageButtonX + buttonWidth && 
                y >= buttonY && y <= buttonY + buttonHeight) {
                
                if (this.game.notifications) {
                    this.game.notifications.add('Funzione di gestione clan in arrivo!', 3000, 'info');
                }
                return true;
            }
        }
        
        return false;
    }
    
    // Gestisce i click quando il giocatore non è in un clan
    handleNoClanClick(x, y, contentX, contentY) {
        const startY = contentY + 80;
        const optionsBoxX = contentX + 50;
        const optionsBoxY = startY + 50;
        const buttonY = optionsBoxY + 50;
        const buttonWidth = 150;
        const buttonHeight = 40;
        const buttonSpacing = 30;
        
        // Pulsante "Crea Clan"
        const createButtonX = optionsBoxX + 50;
        if (x >= createButtonX && x <= createButtonX + buttonWidth && 
            y >= buttonY && y <= buttonY + buttonHeight) {
            
            this.showCreateClanDialog();
            return true;
        }
        
        // Pulsante "Cerca Clan"
        const searchButtonX = createButtonX + buttonWidth + buttonSpacing;
        if (x >= searchButtonX && x <= searchButtonX + buttonWidth && 
            y >= buttonY && y <= buttonY + buttonHeight) {
            
            if (this.game.notifications) {
                this.game.notifications.add('Funzione di ricerca clan in arrivo!', 3000, 'info');
            }
            return true;
        }
        
        // Pulsante "Entra per Invito"
        const inviteButtonX = createButtonX;
        const inviteButtonY = buttonY + buttonHeight + 20;
        if (x >= inviteButtonX && x <= inviteButtonX + buttonWidth && 
            y >= inviteButtonY && y <= inviteButtonY + buttonHeight) {
            
            if (this.game.notifications) {
                this.game.notifications.add('Funzione di invito clan in arrivo!', 3000, 'info');
            }
            return true;
        }
        
        return false;
    }
    
    // Mostra dialog per creare un clan
    showCreateClanDialog() {
        const clanName = prompt('Inserisci il nome del clan (3-20 caratteri):');
        if (!clanName) return;
        
        const clanTag = prompt('Inserisci il tag del clan (2-5 caratteri):');
        if (!clanTag) return;
        
        const result = this.game.ship.createClan(clanName, clanTag);
        if (this.game.notifications) {
            this.game.notifications.add(result.message, 3000, result.success ? 'success' : 'error');
        }
    }
    
    // Disegna il contenuto delle fazioni
    drawFactionContent(ctx, x, y) {
        if (!this.game.factionSystem) {
            this.drawComingSoon(ctx, x, y, 'Sistema Fazioni');
            return;
        }
        
        const currentFaction = this.game.factionSystem.getCurrentFaction();
        const allFactions = this.game.factionSystem.getAllFactions();
        
        // Calcola le dimensioni e posizioni per centrare tutto
        const panelWidth = Math.min(800, this.contentWidth - 40); // Adattivo alla larghezza disponibile
        const panelHeight = 120; // Ridotto per lasciare più spazio alle carte
        const panelX = x + (this.contentWidth - panelWidth) / 2; // Centrato orizzontalmente
        const panelY = y + 20; // Spostato più in alto
        
        // Titolo centrato
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Sistema Fazioni', panelX + panelWidth/2, panelY - 10);
        ctx.textAlign = 'left';
        
        // Informazioni fazione corrente
        if (currentFaction) {
            this.drawCurrentFactionInfo(ctx, panelX, panelY, currentFaction, panelWidth, panelHeight);
        } else {
            this.drawNoFactionInfo(ctx, panelX, panelY, panelWidth, panelHeight);
        }
        
        // Lista fazioni disponibili - centrata e spaziata uniformemente
        const cardSpacing = 20;
        const availableWidth = this.contentWidth - 40; // Spazio disponibile con margini
        const cardWidth = Math.min(260, (availableWidth - (cardSpacing * (allFactions.length - 1))) / allFactions.length);
        const cardHeight = 300; // Altezza fissa per le carte
        const totalWidth = (cardWidth * allFactions.length) + (cardSpacing * (allFactions.length - 1));
        const cardsStartX = x + (this.contentWidth - totalWidth) / 2; // Centrato orizzontalmente
        const cardsStartY = panelY + panelHeight + 80; // Aumentato lo spazio verticale da 30 a 80
        
        this.drawFactionList(ctx, cardsStartX, cardsStartY, allFactions, currentFaction, cardWidth, cardHeight, cardSpacing);
    }
    
    // Disegna informazioni fazione corrente
    drawCurrentFactionInfo(ctx, x, y, faction, panelWidth = 600, panelHeight = 180) {
        
        // Sfondo
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(x, y, panelWidth, panelHeight);
        
        // Bordo colorato
        ctx.strokeStyle = faction.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, panelWidth, panelHeight);
        
        // Icona e nome (più grandi)
        ctx.fillStyle = faction.color;
        ctx.font = 'bold 24px Arial';
        ctx.fillText(`${faction.icon} ${faction.name}`, x + 15, y + 35);
        
        // Nome completo
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.fillText(faction.fullName, x + 15, y + 60);
        
        // Descrizione (più spazio)
        ctx.font = '14px Arial';
        ctx.fillStyle = '#cccccc';
        const description = this.wrapText(ctx, faction.description, panelWidth - 40);
        let textY = y + 85;
        description.forEach(line => {
            ctx.fillText(line, x + 15, textY);
            textY += 18;
        });
        
        // Pulsante abbandona
        const buttonWidth = 100;
        const buttonHeight = 25;
        const buttonX = x + panelWidth - buttonWidth - 20;
        const buttonY = y + panelHeight - buttonHeight - 10;
        
        ctx.fillStyle = '#e94560';
        ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Abbandona', buttonX + buttonWidth/2, buttonY + 17);
        ctx.textAlign = 'left';
    }
    
    // Disegna informazioni quando non si è in una fazione
    drawNoFactionInfo(ctx, x, y, panelWidth = 600, panelHeight = 180) {
        
        // Sfondo
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(x, y, panelWidth, panelHeight);
        
        // Bordo grigio
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, panelWidth, panelHeight);
        
        // Testo
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Arial';
        ctx.fillText('Nessuna Fazione', x + 15, y + 30);
        
        ctx.font = '14px Arial';
        ctx.fillStyle = '#cccccc';
        ctx.fillText('Scegli una fazione per iniziare la tua avventura!', x + 15, y + 55);
    }
    
    // Disegna lista delle fazioni
    drawFactionList(ctx, x, y, factions, currentFaction, cardWidth = 280, cardHeight = 300, cardSpacing = 20) {
        // Titolo centrato
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        const totalWidth = (cardWidth * factions.length) + (cardSpacing * (factions.length - 1));
        ctx.fillText('Fazioni Disponibili', x + totalWidth/2, y - 35); // Spostato il titolo più in alto
        ctx.textAlign = 'left';
        
        const startX = x;
        const startY = y;
        
        factions.forEach((faction, index) => {
            const cardX = startX + index * (cardWidth + cardSpacing);
            const cardY = startY;
            
            this.drawFactionCard(ctx, cardX, cardY, cardWidth, cardHeight, faction, currentFaction);
        });
    }
    
    // Disegna una carta fazione
    drawFactionCard(ctx, x, y, width, height, faction, currentFaction) {
        const isCurrentFaction = currentFaction && currentFaction.id === faction.id;
        
        // Sfondo con gradiente
        const gradient = ctx.createLinearGradient(x, y, x, y + height);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
        gradient.addColorStop(1, 'rgba(20, 20, 20, 0.9)');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, width, height);
        
        // Bordo con glow per la fazione attiva
        if (isCurrentFaction) {
            ctx.shadowColor = faction.color;
            ctx.shadowBlur = 10;
        }
        ctx.strokeStyle = isCurrentFaction ? '#00ff00' : faction.color;
        ctx.lineWidth = isCurrentFaction ? 2 : 1;
        ctx.strokeRect(x, y, width, height);
        ctx.shadowBlur = 0;
        
        // Icona fazione
        ctx.fillStyle = faction.color;
        ctx.font = '28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(faction.icon, x + width/2, y + 35);
        
        // Nome fazione
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Arial';
        ctx.fillText(faction.name, x + width/2, y + 65);
        
        // Nome completo
        ctx.font = '13px Arial';
        ctx.fillStyle = '#cccccc';
        ctx.fillText(faction.fullName, x + width/2, y + 85);
        
        // Descrizione
        ctx.font = '12px Arial';
        ctx.fillStyle = '#aaaaaa';
        const description = this.wrapText(ctx, faction.description, width - 20);
        let textY = y + 110;
        description.forEach(line => {
            ctx.fillText(line, x + width/2, textY);
            textY += 15;
        });
        
        // Stato fazione
        const statusY = y + height - 20;
        
        if (isCurrentFaction) {
            ctx.fillStyle = '#00ff00';
            ctx.font = 'bold 13px Arial';
            ctx.fillText('✓ Fazione Attiva', x + width/2, statusY);
        } else {
            ctx.fillStyle = '#cccccc';
            ctx.font = '12px Arial';
            ctx.fillText('Clicca per selezionare', x + width/2, statusY);
        }
        
        ctx.textAlign = 'left';
    }
    
    // Gestisce i click nel contenuto delle fazioni
    handleFactionClick(x, y, contentX, contentY) {
        if (this.selectedCategory !== 'factions') return false;
        
        const currentFaction = this.game.factionSystem?.getCurrentFaction();
        const allFactions = this.game.factionSystem?.getAllFactions() || [];
        
        // Calcola le dimensioni e posizioni dinamicamente - sfruttiamo tutto lo spazio
        const panelWidth = 600;
        const panelHeight = 180;
        const panelX = contentX + 20;
        const panelY = contentY + 30;
        
        // Pulsante abbandona fazione corrente (se presente)
        if (currentFaction) {
            const buttonWidth = 100;
            const buttonHeight = 25;
            const buttonX = panelX + panelWidth - buttonWidth - 20;
            const buttonY = panelY + panelHeight - buttonHeight - 10;
            
            if (x >= buttonX && x <= buttonX + buttonWidth && 
                y >= buttonY && y <= buttonY + buttonHeight) {
                this.leaveFaction();
                return true;
            }
        }
        
        // Click sulle carte fazioni - sfruttiamo tutto lo spazio
        const cardWidth = 280;
        const cardHeight = 300;
        const cardSpacing = 20;
        const cardsStartX = panelX;
        const cardsStartY = panelY + panelHeight + 30;
        
        allFactions.forEach((faction, index) => {
            const cardX = cardsStartX + index * (cardWidth + cardSpacing);
            const cardY = cardsStartY;
            
            // L'intera area della card è cliccabile
            if (x >= cardX && x <= cardX + cardWidth && 
                y >= cardY && y <= cardY + cardHeight) {
                
                if (currentFaction && currentFaction.id === faction.id) {
                    // Se è la fazione corrente, non fare nulla (già attiva)
                    return true;
                }
                
                // Unisciti alla fazione cliccata
                this.joinFaction(faction);
                return true;
            }
        });
        return false;
    }
    
    // Gestisce il movimento del mouse per hover
    handleFactionMouseMove(x, y, contentX, contentY) {
        if (this.selectedCategory !== 'factions') {
            this.hoveredFactionId = null;
            return;
        }
        
        const allFactions = this.game.factionSystem?.getAllFactions() || [];
        const cardWidth = 200;
        const cardHeight = 280;
        const cardSpacing = 20;
        const startX = contentX + 20;
        const startY = contentY + 200 + 30;
        
        this.hoveredFactionId = null;
        
        allFactions.forEach((faction, index) => {
            const cardX = startX + index * (cardWidth + cardSpacing);
            const cardY = startY;
            
            if (x >= cardX && x <= cardX + cardWidth && 
                y >= cardY && y <= cardY + cardHeight) {
                this.hoveredFactionId = faction.id;
                return;
            }
        });
    }
    
    // Unisce una fazione
    joinFaction(faction) {
        if (!this.game.factionSystem) {
            return;
        }
        
        if (typeof this.game.factionSystem.joinFaction !== 'function') {
            if (this.game.notifications) {
                this.game.notifications.add('Errore: Sistema fazioni non disponibile', 3000, 'error');
            }
            return;
        }
        
        const result = this.game.factionSystem.joinFaction(faction.id);
        
        if (this.game.notifications) {
            this.game.notifications.add(result.message, 3000, result.success ? 'success' : 'error');
        }
        
        if (result.success) {
            this.selectedFactionId = null;
        }
    }
    
    // Abbandona la fazione corrente
    leaveFaction() {
        if (!this.game.factionSystem) return;
        
        const result = this.game.factionSystem.leaveFaction();
        
        if (this.game.notifications) {
            this.game.notifications.add(result.message, 3000, result.success ? 'success' : 'error');
        }
    }
    
    // Wraps text to fit within a given width
    wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];
        
        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + ' ' + word).width;
            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }
    
}