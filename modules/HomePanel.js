// Pannello Home - Interfaccia principale del giocatore
export class HomePanel {
    constructor(game) {
        this.game = game;
        this.visible = false;
        this.isOpen = false; // Aggiunta proprietà isOpen per compatibilità
        this.selectedCategory = 'info';
        this.lastSelectedCategory = 'info';
        
        // Dati del giocatore (verranno aggiornati dinamicamente)
        this.playerData = {
            id: '883098',
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
        this.panelWidth = 1200;
        this.panelHeight = 800;
        this.navWidth = 250;
        this.contentWidth = this.panelWidth - this.navWidth;
        
        
        // Sistema shop
        this.shopItems = {
            ammunition: {
                // Laser
                laser_x1: { name: 'Munizioni Laser X1', price: 10, amount: 100, max: 10000, icon: '🔴', type: 'laser', key: 'x1' },
                laser_x2: { name: 'Munizioni Laser X2', price: 25, amount: 50, max: 5000, icon: '🟠', type: 'laser', key: 'x2' },
                laser_x3: { name: 'Munizioni Laser X3', price: 50, amount: 20, max: 2000, icon: '🟡', type: 'laser', key: 'x3' },
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
                lf1: { name: 'Laser LF1', price: 150, amount: 10, max: 200, icon: '🔴', type: 'laser', key: 'lf1' },
                lf2: { name: 'Laser LF2', price: 300, amount: 5, max: 100, icon: '🟠', type: 'laser', key: 'lf2' },
                lf3: { name: 'Laser LF3', price: 600, amount: 2, max: 50, icon: '🟡', type: 'laser', key: 'lf3' },
                lf4: { name: 'Laser LF4', price: 1200, amount: 1, max: 25, icon: '🟢', type: 'laser', key: 'lf4' }
            },
            generators: {
                // Generatori (nella categoria GENERATORI)
                generator_1: { name: 'Generatore 1', price: 500, amount: 3, max: 50, icon: '⚡', type: 'generator', key: 'gen1' },
                generator_2: { name: 'Generatore 2', price: 1000, amount: 2, max: 30, icon: '⚡', type: 'generator', key: 'gen2' },
                generator_3: { name: 'Generatore 3', price: 2000, amount: 1, max: 20, icon: '⚡', type: 'generator', key: 'gen3' },
                generator_4: { name: 'Generatore 4', price: 4000, amount: 1, max: 10, icon: '⚡', type: 'generator', key: 'gen4' }
            },
            consumables: {
                // Placeholder per consumabili futuri
            }
        };
        
        this.selectedShopCategory = 'ammunition';
        this.shopScrollY = 0;
        this.selectedAmmoItem = 'laser_x1'; // Item selezionato per visualizzazione
        this.selectedLaserItem = 'lf1'; // Item selezionato per laser
        this.selectedGeneratorItem = 'generator_1'; // Item selezionato per generatori
        
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
        
        // Dati quest (basati sull'immagine)
        this.questData = {
            disponibili: {
                'livello1': [
                    { 
                        id: 'map_orientation', 
                        name: 'Map orientation', 
                        level: 1, 
                        status: 'available',
                        description: 'Impara le basi della navigazione spaziale e orientati nella mappa.',
                        conditions: [
                            { type: 'navigate', description: 'Esplora 3 settori diversi', quantity: 3, completed: 0 }
                        ],
                        rewards: [
                            { type: 'experience', description: 'Esperienza', quantity: 500 },
                            { type: 'honor', description: 'Onore', quantity: 5 },
                            { type: 'credits', description: 'Crediti', quantity: 1000 }
                        ]
                    },
                    { 
                        id: 'gaining_mercury', 
                        name: 'Gaining Mercury', 
                        level: 1, 
                        status: 'available',
                        description: 'Raccogli mercurio dagli asteroidi per guadagnare esperienza.',
                        conditions: [
                            { type: 'collect', description: 'Raccogli Mercurio', quantity: 10, completed: 0 }
                        ],
                        rewards: [
                            { type: 'experience', description: 'Esperienza', quantity: 300 },
                            { type: 'credits', description: 'Crediti', quantity: 500 }
                        ]
                    },
                    { 
                        id: 'cargo_boxes', 
                        name: 'Cargo Boxes', 
                        level: 1, 
                        status: 'available',
                        description: 'Trova e raccogli scatole di carico abbandonate nello spazio.',
                        conditions: [
                            { type: 'collect', description: 'Raccogli Scatole di Carico', quantity: 5, completed: 0 }
                        ],
                        rewards: [
                            { type: 'experience', description: 'Esperienza', quantity: 400 },
                            { type: 'honor', description: 'Onore', quantity: 3 },
                            { type: 'credits', description: 'Crediti', quantity: 800 }
                        ]
                    },
                    { 
                        id: 'empty_storage', 
                        name: 'Empty storage', 
                        level: 1, 
                        status: 'available',
                        description: 'Svuota il tuo magazzino vendendo risorse in eccesso.',
                        conditions: [
                            { type: 'sell', description: 'Vendi risorse', quantity: 20, completed: 0 }
                        ],
                        rewards: [
                            { type: 'experience', description: 'Esperienza', quantity: 200 },
                            { type: 'credits', description: 'Crediti', quantity: 300 }
                        ]
                    },
                    { 
                        id: 'warming_up', 
                        name: 'Warming-up', 
                        level: 1, 
                        status: 'available',
                        description: 'Riscaldati per il combattimento distruggendo alcuni nemici.',
                        conditions: [
                            { type: 'kill', description: 'Distruggi nemici', quantity: 5, completed: 0 }
                        ],
                        rewards: [
                            { type: 'experience', description: 'Esperienza', quantity: 600 },
                            { type: 'honor', description: 'Onore', quantity: 8 },
                            { type: 'credits', description: 'Crediti', quantity: 1200 }
                        ]
                    }
                ],
                'livello2': [
                    { 
                        id: 'get_better_equipment', 
                        name: 'Get better equipment', 
                        level: 2, 
                        status: 'available',
                        description: 'Congratulations! You took next level. That means you got an access to X-2 map of your faction. Before you visit new map you should know that in those sector is one more alien type bothering us - Mali. It is stronger than Hydro and you need to get good equipment to deal with it. Look at the shop and purchase required items. After you purchase - mount it on your ship. One tip about map access. You may have noticed that to jump into some maps you need higher level than you have. Yeah, there is some restriction. Each map has it\'s own required level to fly there. It made to protect you from dangerous areas of The Space. Gain experience and raise your level up to reach access for more maps.',
                        conditions: [
                            { type: 'buy', description: 'Compra LaserGun-1', quantity: 1, completed: 0 },
                            { type: 'buy', description: 'Compra ShieldGen-1', quantity: 1, completed: 0 },
                            { type: 'equip', description: 'Equipaggia LaserGun-1', quantity: 1, completed: 0 },
                            { type: 'equip', description: 'Equipaggia ShieldGen-1', quantity: 1, completed: 0 }
                        ],
                        rewards: [
                            { type: 'experience', description: 'Esperienza', quantity: 3200 },
                            { type: 'honor', description: 'Onore', quantity: 16 },
                            { type: 'credits', description: 'Crediti', quantity: 6400 },
                            { type: 'uridium', description: 'Uridium', quantity: 48 }
                        ]
                    },
                    { 
                        id: 'ammunition_resupply', 
                        name: 'Ammunition resupply', 
                        level: 2, 
                        status: 'available',
                        description: 'Rifornisci la tua nave con munizioni per il combattimento.',
                        conditions: [
                            { type: 'buy', description: 'Compra munizioni laser', quantity: 100, completed: 0 },
                            { type: 'buy', description: 'Compra munizioni missili', quantity: 50, completed: 0 }
                        ],
                        rewards: [
                            { type: 'experience', description: 'Esperienza', quantity: 800 },
                            { type: 'credits', description: 'Crediti', quantity: 1500 }
                        ]
                    },
                    { 
                        id: 'bonus_boxes', 
                        name: 'Bonus boxes', 
                        level: 2, 
                        status: 'available',
                        description: 'Trova e raccogli scatole bonus per ottenere ricompense speciali.',
                        conditions: [
                            { type: 'collect', description: 'Raccogli scatole bonus', quantity: 3, completed: 0 }
                        ],
                        rewards: [
                            { type: 'experience', description: 'Esperienza', quantity: 1000 },
                            { type: 'honor', description: 'Onore', quantity: 10 },
                            { type: 'credits', description: 'Crediti', quantity: 2000 }
                        ]
                    },
                    { 
                        id: 'new_aliens', 
                        name: 'New aliens', 
                        level: 2, 
                        status: 'available',
                        description: 'Affronta i nuovi tipi di alieni che minacciano lo spazio.',
                        conditions: [
                            { type: 'kill', description: 'Distruggi alieni Mali', quantity: 10, completed: 0 }
                        ],
                        rewards: [
                            { type: 'experience', description: 'Esperienza', quantity: 1500 },
                            { type: 'honor', description: 'Onore', quantity: 20 },
                            { type: 'credits', description: 'Crediti', quantity: 3000 }
                        ]
                    },
                    { 
                        id: 'bewitched_pumpkins', 
                        name: '* Bewitched pumpkins', 
                        level: 2, 
                        status: 'available',
                        description: 'Evento speciale: distruggi le zucche stregate per ottenere ricompense uniche.',
                        conditions: [
                            { type: 'kill', description: 'Distruggi zucche stregate', quantity: 15, completed: 0 }
                        ],
                        rewards: [
                            { type: 'experience', description: 'Esperienza', quantity: 2000 },
                            { type: 'honor', description: 'Onore', quantity: 25 },
                            { type: 'credits', description: 'Crediti', quantity: 4000 },
                            { type: 'uridium', description: 'Uridium', quantity: 20 }
                        ]
                    }
                ],
                'livello3': [
                    { 
                        id: 'hunting_hunters', 
                        name: 'Hunting the hunters', 
                        level: 3, 
                        status: 'available',
                        description: 'Diventa il cacciatore e elimina i cacciatori di taglie che minacciano i piloti.',
                        conditions: [
                            { type: 'kill', description: 'Elimina cacciatori', quantity: 8, completed: 0 }
                        ],
                        rewards: [
                            { type: 'experience', description: 'Esperienza', quantity: 2500 },
                            { type: 'honor', description: 'Onore', quantity: 30 },
                            { type: 'credits', description: 'Crediti', quantity: 5000 }
                        ]
                    },
                    { 
                        id: 'refine', 
                        name: 'Refine', 
                        level: 3, 
                        status: 'available',
                        description: 'Raffina le tue abilità di combattimento e migliora la tua nave.',
                        conditions: [
                            { type: 'upgrade', description: 'Migliora equipaggiamento', quantity: 3, completed: 0 },
                            { type: 'kill', description: 'Distruggi nemici forti', quantity: 20, completed: 0 }
                        ],
                        rewards: [
                            { type: 'experience', description: 'Esperienza', quantity: 4000 },
                            { type: 'honor', description: 'Onore', quantity: 40 },
                            { type: 'credits', description: 'Crediti', quantity: 8000 },
                            { type: 'uridium', description: 'Uridium', quantity: 60 }
                        ]
                    }
                ]
            },
            accettate: [],
            completate: [],
            tutte: []
        };
        
        
        this.x = (this.game.canvas.width - this.panelWidth) / 2;
        this.y = (this.game.canvas.height - this.panelHeight) / 2;
    }
    
    toggle() {
        this.visible = !this.visible;
        this.isOpen = this.visible; // Sincronizza isOpen con visible
        if (this.visible) {
            this.game.audioManager.playSound('stationpanel_open');
        }
    }
    
    show() {
        this.visible = true;
        this.isOpen = true; // Sincronizza isOpen con visible
        this.centerPanel();
    }
    
    hide() {
        this.visible = false;
        this.isOpen = false; // Sincronizza isOpen con visible
    }
    
    // Centra il pannello
    centerPanel() {
        this.x = (this.game.width - this.panelWidth) / 2;
        this.y = (this.game.height - this.panelHeight) / 2;
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
    
    
    updatePlayerData() {
        // Aggiorna i dati del giocatore con quelli reali
        if (this.game.ship) {
            // Leggi le risorse direttamente dalla nave (Single Source of Truth)
            this.playerData.credits = this.game.ship.getResource('credits');
            this.playerData.uridium = this.game.ship.getResource('uridium');
            this.playerData.honor = this.game.ship.getResource('honor');
            this.playerData.experience = this.game.ship.getResource('experience');
            
            // Leggi il livello dal sistema integrato
            this.playerData.level = this.game.ship.currentLevel;
            
            // Sincronizza con upgradeManager per compatibilità
            this.game.ship.upgradeManager.credits = this.playerData.credits;
            this.game.ship.upgradeManager.uridium = this.playerData.uridium;
            this.game.ship.upgradeManager.honor = this.playerData.honor;
            
        }
    }
    
    
    handleClick(x, y) {
        if (!this.visible) {
            return false;
        }
        
        // Controlla se il click è dentro il pannello
        const isInsidePanel = x >= this.x && x <= this.x + this.panelWidth && 
                             y >= this.y && y <= this.y + this.panelHeight;
        
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
        if (this.isCloseButtonClicked(x, y)) {
            this.hide();
            return true;
        }
        
        // Controlla se clicca su una categoria
        const clickedCategory = this.getClickedCategory(x, y);
        if (clickedCategory) {
            this.selectCategory(clickedCategory);
            return true;
        }
        
        // Se siamo nel shop, gestisci i click del shop
        if (this.selectedCategory === 'shop') {
            console.log(`🛒 Click nel shop: (${x}, ${y})`);
            const handled = this.handleShopClick(x, y);
            console.log(`🛒 Shop click gestito: ${handled}`);
            if (handled) {
                return true;
            }
        }
        
        // Se siamo nelle quest, gestisci i click delle quest
        if (this.selectedCategory === 'quest') {
            const handled = this.handleQuestClick(x, y);
            if (handled) {
                return true;
            }
        }
        
        // Se siamo nel pannello home e non è stato gestito, restituisci true
        // per evitare che il click venga gestito da altri elementi
        return true;
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
    
    isCloseButtonClicked(x, y) {
        const closeX = this.x + this.panelWidth - 40;
        const closeY = this.y + 20;
        return x >= closeX && x <= closeX + 20 && y >= closeY && y <= closeY + 20;
    }
    
    getClickedCategory(x, y) {
        const navX = this.x;
        const navY = this.y + 60; // Inizia dopo il titolo
        const itemHeight = 40;
        
        for (let i = 0; i < this.categories.length; i++) {
            const itemY = navY + i * itemHeight;
            if (x >= navX && x <= navX + this.navWidth && 
                y >= itemY && y <= itemY + itemHeight) {
                return this.categories[i];
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
        
        const popupWidth = 400;
        const popupHeight = 80;
        const popupX = (this.game.canvas.width - popupWidth) / 2;
        const popupY = 100;
        
        // Sfondo popup con trasparenza
        ctx.save();
        ctx.globalAlpha = this.popup.alpha;
        
        // Sfondo
        ctx.fillStyle = this.popup.type === 'success' ? '#2E7D32' : '#D32F2F';
        ctx.fillRect(popupX, popupY, popupWidth, popupHeight);
        
        // Bordo
        ctx.strokeStyle = this.popup.type === 'success' ? '#4CAF50' : '#F44336';
        ctx.lineWidth = 2;
        ctx.strokeRect(popupX, popupY, popupWidth, popupHeight);
        
        // Icona
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        const icon = this.popup.type === 'success' ? '✓' : '✗';
        ctx.fillText(icon, popupX + 40, popupY + 50);
        
        // Messaggio
        ctx.font = 'bold 16px Arial';
        ctx.fillText(this.popup.message, popupX + popupWidth / 2, popupY + 50);
        
        ctx.restore();
    }
    
    drawMainPanel(ctx) {
        // Sfondo del pannello
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(this.x, this.y, this.panelWidth, this.panelHeight);
        
        // Bordo
        ctx.strokeStyle = '#16213e';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.panelWidth, this.panelHeight);
        
        // Titolo
        ctx.fillStyle = '#e94560';
        ctx.font = 'bold 18px Arial';
        ctx.fillText('Pannello di controllo', this.x + 20, this.y + 30);
        
        // Pulsante chiudi
        ctx.fillStyle = '#e94560';
        ctx.fillRect(this.x + this.panelWidth - 40, this.y + 10, 30, 30);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('X', this.x + this.panelWidth - 25, this.y + 30);
    }
    
    drawNavigationPanel(ctx) {
        const navX = this.x;
        const navY = this.y + 60;
        
        // Sfondo navigazione
        ctx.fillStyle = '#0f3460';
        ctx.fillRect(navX, navY, this.navWidth, this.panelHeight - 60);
        
        // Pattern esagonale rimosso - grafica semplificata
        
        // Categorie
        this.categories.forEach((category, index) => {
            const itemY = navY + 20 + index * 40;
            const isSelected = this.selectedCategory === category.id;
            
            // Sfondo selezionato
            if (isSelected) {
                ctx.fillStyle = '#e94560';
                ctx.fillRect(navX + 10, itemY - 5, this.navWidth - 20, 35);
            }
            
            // Icona
            ctx.fillStyle = isSelected ? '#ffffff' : '#e94560';
            ctx.font = '16px Arial';
            ctx.fillText(category.icon, navX + 15, itemY + 15);
            
            // Nome
            ctx.fillStyle = isSelected ? '#ffffff' : '#ffffff';
        ctx.font = '14px Arial';
            ctx.fillText(category.name, navX + 40, itemY + 15);
            
            // Freccia selezionata
            if (isSelected) {
            ctx.fillStyle = '#ffffff';
                ctx.font = '16px Arial';
                ctx.fillText('→', navX + this.navWidth - 25, itemY + 15);
            }
        });
    }
    
    drawMainContent(ctx) {
        const contentX = this.x + this.navWidth;
        const contentY = this.y + 60;
        
        // Sfondo contenuto
        ctx.fillStyle = '#16213e';
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
                this.drawComingSoon(ctx, contentX, contentY, 'Esci');
                break;
        }
    }
    
    drawInfoContent(ctx, x, y) {
        // Nave spaziale e ID
        const centerX = x + this.contentWidth / 2;
        const shipY = y + 80;
        
        // Cerchio nave
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, shipY, 60, 0, Math.PI * 2);
        ctx.stroke();
        
        // Disegna nave spaziale (semplificata)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(centerX - 20, shipY - 10, 40, 20);
        ctx.fillRect(centerX - 10, shipY - 20, 20, 10);
        
        // ID
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`ID ${this.playerData.id}`, centerX, shipY + 40);
        ctx.textAlign = 'left';
        
        // Livello
        ctx.fillStyle = '#e94560';
        ctx.font = '16px Arial';
        ctx.fillText(`LIVELLO ${this.playerData.level}`, x + 20, shipY - 20);
        
        // Risorse
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.fillText(`${this.playerData.credits.toLocaleString()} CREDITS`, x + this.contentWidth - 200, shipY - 40);
        ctx.fillText(`${this.playerData.uridium.toLocaleString()} URIDIUM`, x + this.contentWidth - 200, shipY - 20);
        ctx.fillText(`${this.playerData.experience.toLocaleString()} ESPERIENZA`, x + this.contentWidth - 200, shipY);
        ctx.fillText(`${this.playerData.honor.toLocaleString()} ONORE`, x + this.contentWidth - 200, shipY + 20);
        
        // Divider
        ctx.strokeStyle = '#e94560';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 20, shipY + 80);
        ctx.lineTo(x + this.contentWidth - 20, shipY + 80);
        ctx.stroke();
        
        // Solo eventi attivi (centrato)
        const colWidth = this.contentWidth - 40;
        this.drawActiveEvents(ctx, x + 20, shipY + 100, colWidth);
    }
    
    
    
    drawActiveEvents(ctx, x, y, width) {
        ctx.fillStyle = '#e94560';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('Eventi attivi', x, y);
        
        ctx.fillStyle = '#888888';
        ctx.font = '12px Arial';
        ctx.fillText('Nessun evento attivo', x, y + 20);
    }
    
    
    drawQuestContent(ctx, x, y) {
        // Titolo sezione
        ctx.fillStyle = '#e94560';
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
            ctx.fillStyle = isSelected ? '#e94560' : '#2a2a3e';
            ctx.fillRect(tabX, y, tabWidth, tabHeight);
            
            // Bordo tab
            ctx.strokeStyle = isSelected ? '#ffffff' : '#666666';
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
                        ctx.fillStyle = isSelected ? '#4a90e2' : 'transparent';
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
        
        // Calcola l'altezza totale del contenuto
        const totalContentHeight = currentY - (y + 30 + 10) + this.questScrollY;
        this.maxQuestScrollY = Math.max(0, totalContentHeight - (listHeight - 30));
        
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
    
    // Gestisce i click nelle quest
    handleQuestClick(x, y) {
        const contentX = this.x + this.navWidth;
        const contentY = this.y + 60;
        
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
    
    // Gestisce lo scroll della rotella del mouse per le quest
    handleQuestScroll(deltaY) {
        if (this.selectedCategory !== 'quest') {
            return false;
        }
        
        // Scroll verso l'alto (deltaY negativo) o verso il basso (deltaY positivo)
        const scrollAmount = deltaY * 20; // Velocità di scroll
        
        // Se c'è una quest selezionata, scrolla i dettagli
        if (this.selectedQuest && this.maxQuestDetailsScrollY > 0) {
            this.questDetailsScrollY = Math.max(0, Math.min(this.maxQuestDetailsScrollY, this.questDetailsScrollY - scrollAmount));
            return true;
        }
        
        // Altrimenti scrolla la lista delle quest
        if (this.maxQuestScrollY > 0) {
            this.questScrollY = Math.max(0, Math.min(this.maxQuestScrollY, this.questScrollY - scrollAmount));
            return true;
        }
        
        return false;
    }
    
    // Metodi per il sistema shop
    handleShopClick(x, y) {
        const contentX = this.x + this.navWidth;
        const contentY = this.y + 60;
        
        console.log(`🛒 Shop click - contentX: ${contentX}, contentY: ${contentY}, click: (${x}, ${y})`);
        
        // Controlla click su tab del negozio (priorità alta)
        const tabY = contentY + 50;
        const tabWidth = 120;
        const tabHeight = 35;
        
        console.log(`🛒 Tab area - tabY: ${tabY}, tabWidth: ${tabWidth}, tabHeight: ${tabHeight}`);
        
        const tabs = ['ammunition', 'laser', 'generators'];
        for (let index = 0; index < tabs.length; index++) {
            const tabId = tabs[index];
            const tabX = contentX + 20 + index * tabWidth;
            console.log(`🛒 Tab ${tabId} - tabX: ${tabX}, area: (${tabX}, ${tabY}) to (${tabX + tabWidth}, ${tabY + tabHeight})`);
            if (x >= tabX && x <= tabX + tabWidth && 
                y >= tabY && y <= tabY + tabHeight) {
                console.log(`✅ Click su tab: ${tabId}`);
                this.selectedShopCategory = tabId;
                return true; // Click gestito, esci subito
            }
        }
        
        // Controlla click su thumbnail in basso (priorità alta)
        if (['ammunition', 'laser', 'generators'].includes(this.selectedShopCategory)) {
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
            
            console.log(`🛒 Purchase area - detailsX: ${detailsX}, detailsY: ${detailsY}, category: ${this.selectedShopCategory}`);
            
            if (this.selectedShopCategory === 'ammunition') {
                console.log(`🛒 Handling ammunition click`);
                return this.handleAmmunitionClick(x, y, detailsX, detailsY, items);
            } else if (this.selectedShopCategory === 'laser') {
                console.log(`🛒 Handling laser click`);
                return this.handleAmmunitionClick(x, y, detailsX, detailsY, items);
            } else if (this.selectedShopCategory === 'generators') {
                console.log(`🛒 Handling generators click`);
                return this.handleAmmunitionClick(x, y, detailsX, detailsY, items);
            } else if (this.selectedShopCategory === 'equipment') {
                console.log(`🛒 Handling equipment click`);
                return this.handleEquipmentClick(x, y, detailsX, detailsY, items);
            } else if (this.selectedShopCategory === 'consumables') {
                console.log(`🛒 Handling consumables click`);
                return this.handleConsumablesClick(x, y, detailsX, detailsY, items);
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
        console.log(`🛒 Tentativo acquisto: ${itemKey}, quantità: ${quantity}, prezzo: ${pricePerUnit}`);
        const totalPrice = pricePerUnit * quantity;
        console.log(`💰 Prezzo totale: ${totalPrice}, crediti disponibili: ${this.playerData.credits}`);
        
        if (this.playerData.credits >= totalPrice) {
            // Trova il tipo di item
            let itemType = 'laser';
            if (itemKey.startsWith('missile_')) {
                itemType = 'missile';
            }
            
            // Aggiungi munizioni alla nave (senza limiti)
            this.game.ship.addAmmunition(itemType, itemKey.split('_')[1], quantity);
            
            // Deduci crediti dalla nave (Single Source of Truth)
            this.game.ship.addResource('credits', -totalPrice);
            
            // Aggiorna i dati del pannello
            this.playerData.credits = this.game.ship.getResource('credits');
            
            // Mostra popup di successo
            this.showPopup(`Acquistate ${quantity.toLocaleString()} ${itemKey.replace('_', ' ')}`, 'success');
            
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
    
    buyItem(itemKey) {
        const item = this.shopItems[this.selectedShopCategory][itemKey];
        const totalPrice = item.price * item.amount;
        
        // Controlla se ha abbastanza crediti
        if (this.playerData.credits >= totalPrice) {
            // Per i cannoni, equipaggia direttamente
            if (item.type === 'cannon') {
                // Acquista e equipaggia
                this.game.ship.addResource('credits', -totalPrice);
                this.game.ship.equipCannon(item.key, item.amount);
                
                // Aggiorna i dati del pannello
                this.playerData.credits = this.game.ship.getResource('credits');
                
                // Notifica
                if (this.game.notifications) {
                    this.game.notifications.add(`✅ Equipaggiato: ${item.name} x${item.amount}`, 'success');
                }
                
                // Suono
                this.game.audioManager.playSound('collecting');
            } else {
                // Per laser e missili, controlla munizioni
                const currentAmmo = this.game.ship.getAmmunition(item.type, item.key);
                const maxAmmo = this.game.ship.maxAmmunition[item.type][item.key];
                
                if (currentAmmo + item.amount <= maxAmmo) {
                    // Acquista
                    this.game.ship.addResource('credits', -totalPrice);
                    this.game.ship.addAmmunition(item.type, item.key, item.amount);
                    
                    // Aggiorna i dati del pannello
                    this.playerData.credits = this.game.ship.getResource('credits');
                    
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
        // Header con titolo e risorse
        ctx.fillStyle = '#e94560';
        ctx.font = 'bold 28px Arial';
        ctx.fillText('Negozio', x + 20, y + 35);
        
        // Risorse in alto a destra
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`Crediti: ${this.playerData.credits.toLocaleString()}`, x + this.contentWidth - 20, y + 30);
        ctx.fillText(`Uridium: ${this.playerData.uridium.toLocaleString()}`, x + this.contentWidth - 20, y + 50);
        ctx.textAlign = 'left';
        
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
        
        // Sfondo area principale
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(x, y, this.contentWidth - 40, areaHeight);
        ctx.strokeStyle = '#4a90e2';
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
        }
        
        // Preview in basso
        this.drawItemPreview(ctx, x, y + areaHeight + 15, this.contentWidth - 40);
    }
    
    drawAmmunitionLayout(ctx, x, y, imageAreaWidth, detailsAreaWidth, areaHeight, items) {
        // Area immagine grande a sinistra
        const imageX = x + 20;
        const imageY = y + 20;
        const imageSize = 380;
        
        // Sfondo immagine
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(imageX, imageY, imageSize, imageSize);
        ctx.strokeStyle = '#4a90e2';
        ctx.lineWidth = 2;
        ctx.strokeRect(imageX, imageY, imageSize, imageSize);
        
        // Titolo item selezionato
        const selectedItem = items[this.selectedAmmoItem];
        if (selectedItem) {
            ctx.fillStyle = '#e94560';
            ctx.font = 'bold 28px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(selectedItem.name, imageX + imageSize/2, imageY + 40);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 18px Arial';
            ctx.fillText(selectedItem.type === 'laser' ? 'Munizioni laser' : 'Munizioni missile', imageX + imageSize/2, imageY + 70);
        }
        
        // Icona grande centrata
        ctx.fillStyle = selectedItem && selectedItem.type === 'laser' ? '#4a90e2' : '#50c878';
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
        ctx.fillStyle = '#e94560';
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
        
        // Sfondo opzione (più grande come nell'immagine)
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(x, y, width, 80);
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, 80);
        
        // Quantità (in alto a sinistra)
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Arial';
        ctx.fillText(`Quantità: ${quantity.toLocaleString()}`, x + 20, y + 25);
        
        // Prezzo (in alto a destra)
        ctx.fillStyle = '#e94560';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`${totalPrice.toLocaleString()} x Credits`, x + width - 20, y + 25);
        ctx.textAlign = 'left';
        
        // Pulsante acquista (centrato in basso)
        const buttonWidth = 120; // Aumentato per essere coerente
        const buttonHeight = 50; // Aumentato per essere coerente
        const buttonX = x + (width - buttonWidth) / 2;
        const buttonY = y + 25; // Ridotto per centrare meglio
        
        ctx.fillStyle = canBuy ? '#4CAF50' : '#666666';
        ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        ctx.strokeStyle = canBuy ? '#2E7D32' : '#444444';
        ctx.lineWidth = 1;
        ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('COMPRA', buttonX + buttonWidth/2, buttonY + 30); // Centrato nel pulsante più grande
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
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(imageX, imageY, imageSize, imageSize);
        ctx.strokeStyle = '#4a90e2';
        ctx.lineWidth = 2;
        ctx.strokeRect(imageX, imageY, imageSize, imageSize);
        
        // Mostra item selezionato
        const selectedItem = items[this.selectedLaserItem];
        if (selectedItem) {
            // Nome item
            ctx.fillStyle = '#e94560';
            ctx.font = 'bold 28px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(selectedItem.name, imageX + imageSize/2, imageY + 40);
            
            // Tipo item
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 18px Arial';
            ctx.fillText('LASER', imageX + imageSize/2, imageY + 70);
            
            // Icona grande
            ctx.fillStyle = '#4a90e2';
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
        // Area immagine a sinistra
        const imageX = x + 20;
        const imageY = y + 20;
        const imageSize = 380;
        
        // Sfondo area immagine
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(imageX, imageY, imageSize, imageSize);
        ctx.strokeStyle = '#50c878';
        ctx.lineWidth = 2;
        ctx.strokeRect(imageX, imageY, imageSize, imageSize);
        
        // Mostra item selezionato
        const selectedItem = items[this.selectedGeneratorItem];
        if (selectedItem) {
            // Nome item
            ctx.fillStyle = '#e94560';
            ctx.font = 'bold 28px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(selectedItem.name, imageX + imageSize/2, imageY + 40);
            
            // Tipo item
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 18px Arial';
            ctx.fillText('GENERATORE', imageX + imageSize/2, imageY + 70);
            
            // Icona grande
            ctx.fillStyle = '#50c878';
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
        
        // Sfondo preview
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(x, y, width, previewHeight);
        ctx.strokeStyle = '#4a90e2';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, previewHeight);
        
        // Clip area per scroll orizzontale
        ctx.save();
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
            }
            
            // Bordo evidenziato per item selezionato
            if (isSelected) {
                ctx.fillStyle = '#4a90e2';
                ctx.fillRect(thumbX - 3, thumbY - 3, thumbSize + 6, thumbSize + 6);
            }
            
            ctx.fillStyle = '#2a2a2a';
            ctx.fillRect(thumbX, thumbY, thumbSize, thumbSize);
            ctx.strokeStyle = isSelected ? '#e94560' : '#444444';
            ctx.lineWidth = isSelected ? 3 : 1;
            ctx.strokeRect(thumbX, thumbY, thumbSize, thumbSize);
            
            // Icona thumbnail
            ctx.fillStyle = item.type === 'laser' ? '#4a90e2' : item.type === 'generator' ? '#50c878' : '#e94560';
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
        
        // Indicatori di scroll cliccabili
        const totalWidth = allItems.length * thumbSpacing;
        const visibleWidth = width - 40;
        const maxScroll = Math.max(0, totalWidth - visibleWidth);
        
        // Freccia sinistra (più piccola per non interferire)
        if (this.thumbnailScrollX < 0) {
            ctx.fillStyle = '#4a90e2';
            ctx.fillRect(x + 8, y + 8, 30, previewHeight - 16);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('◀', x + 23, y + previewHeight/2 + 6);
            ctx.textAlign = 'left';
        }
        
        // Freccia destra (più piccola per non interferire)
        if (this.thumbnailScrollX > -maxScroll) {
            ctx.fillStyle = '#4a90e2';
            ctx.fillRect(x + width - 38, y + 8, 30, previewHeight - 16);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('▶', x + width - 23, y + previewHeight/2 + 6);
            ctx.textAlign = 'left';
        }
    }
    
    drawShopTabs(ctx, x, y) {
        const tabs = [
            { id: 'ammunition', name: 'MUNIZIONI', color: '#e94560' },
            { id: 'laser', name: 'LASER', color: '#4a90e2' },
            { id: 'generators', name: 'GENERATORI', color: '#50c878' }
        ];
        
        const tabWidth = 140;
        const tabHeight = 40;
        
        tabs.forEach((tab, index) => {
            const tabX = x + index * tabWidth;
            const isSelected = this.selectedShopCategory === tab.id;
            
            // Sfondo tab
            if (isSelected) {
                ctx.fillStyle = tab.color;
                ctx.fillRect(tabX, y, tabWidth, tabHeight);
                // Bordo evidenziato
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.strokeRect(tabX, y, tabWidth, tabHeight);
            } else {
                ctx.fillStyle = '#2a2a2a';
                ctx.fillRect(tabX, y, tabWidth, tabHeight);
                ctx.strokeStyle = '#444444';
                ctx.lineWidth = 1;
                ctx.strokeRect(tabX, y, tabWidth, tabHeight);
            }
            
            // Testo tab
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(tab.name, tabX + tabWidth/2, y + 26);
            ctx.textAlign = 'left';
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
        // Sfondo item
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(x, y, this.contentWidth - 40, 50);
        
        // Bordo
        ctx.strokeStyle = '#444444';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, this.contentWidth - 40, 50);
        
        // Icona
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Arial';
        ctx.fillText(item.icon, x + 10, y + 25);
        
        // Nome e quantità
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.fillText(item.name, x + 40, y + 20);
        ctx.fillText(`x${item.amount}`, x + 40, y + 35);
        
        // Prezzo
        const totalPrice = item.price * item.amount;
        ctx.fillStyle = '#e94560';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`${totalPrice.toLocaleString()} Credits`, x + 200, y + 25);
        
                    // Munizioni attuali (solo per laser e missili)
            if (item.type === 'cannon') {
                // Per i cannoni, mostra quanti sono equipaggiati
                const equipped = this.game.ship.getEquippedCannons(item.key);
                ctx.fillStyle = '#888888';
                ctx.font = '12px Arial';
                ctx.fillText(`Equipaggiati: ${equipped}`, x + 350, y + 25);
            } else {
                // Per laser e missili, mostra munizioni
                const currentAmmo = this.game.ship.getAmmunition(item.type, item.key);
                const maxAmmo = this.game.ship.maxAmmunition[item.type][item.key];
                ctx.fillStyle = '#888888';
                ctx.font = '12px Arial';
                ctx.fillText(`Possedute: ${currentAmmo}/${maxAmmo}`, x + 350, y + 25);
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
            
            ctx.fillStyle = canBuy ? '#4CAF50' : '#666666';
            ctx.fillRect(buyButtonX, buyButtonY, 80, 25);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(canBuy ? 'ACQUISTA' : 'NON DISP.', buyButtonX + 40, buyButtonY + 16);
            ctx.textAlign = 'left';
    }
    
}