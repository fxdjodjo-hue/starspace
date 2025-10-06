import { ThemeConfig, ThemeUtils } from '../config/ThemeConfig.js';

// Sistema Inventario Semplice
export class Inventory {
    constructor() {
        // Stato del pannello
        this.isOpen = false;
        
        // Hangar (equipaggiamento attivo) - 3 slot per categoria
        this.equipment = {
            laser: new Array(3).fill(null),      // 3 slot laser
            shieldGen: new Array(6).fill(null),  // 6 slot scudi/generatori (3+3)
            extra: new Array(3).fill(null),      // 3 slot extra
            uav: []                               // Droni UAV equipaggiati
        };
        
        // Inventario (oggetti posseduti)
        this.items = [];
        this.maxItems = 50; // Massimo 50 oggetti nell'inventario
        
        // Non aggiungere oggetti di esempio automaticamente
        
        // Dimensioni e posizioni
        this.panelWidth = 1100;
        this.panelHeight = 700;
        this.panelX = 0;
        this.panelY = 0;
        
        // Dimensioni slot
        this.slotSize = 60;
        this.slotSpacing = 5; // Slot inventario più compatti
        
        // Flag per evitare chiusura immediata
        this.justOpened = false;
        
        // Sistema di popup
        this.popup = null;
        this.popupDuration = 2000; // 2 secondi
        
        // Sistema di tooltip
        this.tooltip = null;
        this.mouseX = 0;
        this.mouseY = 0;
        
        // Sistema di tab
        this.currentTab = 'equipment'; // 'equipment', 'uav'
        this.tabs = [
            { id: 'equipment', name: 'EQUIPAGGIAMENTO', color: '#4a90e2' },
            { id: 'uav', name: 'UAV', color: '#ff6b6b' }
        ];

        // Sistema di equipaggiamento unificato per droni e equipaggiamento principale
        
        // Scroll per droni UAV
        this.uavScrollY = 0;
        this.uavItemHeight = 120; // Altezza di ogni drone (aumentata per più spazio slot)
        
        // Drag scroll per droni UAV
        this.isDraggingUAV = false;
        this.dragStartY = 0;
        this.scrollStartY = 0;
        this.uavScrollArea = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };
        
        // Prevenzione click multipli
        this.lastEquipTime = 0;
        this.equipCooldown = 100; // 100ms di cooldown
        
        // Immagini per equipaggiamenti N3
        this.equipImages = {
            laser3: null,
            shield3: null,
            gen3: null
        };
        
        // Carica le immagini
        this.loadEquipImages();
        
        // DEBUG: Aggiungi listener per test coordinate (disabilitato per performance)
        this.debugMode = false;
        
        // Aggiungi listener per mouse events
        this.setupMouseEvents();
    }
    
    // Configura eventi del mouse per drag scroll
    setupMouseEvents() {
        // Mouse down
        document.addEventListener('mousedown', (e) => {
            if (!this.isOpen || this.currentTab !== 'uav') return;
            
            const rect = document.querySelector('canvas').getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            if (this.isInsideUAVScrollArea(x, y)) {
                this.startDragScroll(x, y);
                e.preventDefault();
            }
        });
        
        // Mouse move
        document.addEventListener('mousemove', (e) => {
            if (!this.isOpen || this.currentTab !== 'uav' || !this.isDraggingUAV) return;
            
            const rect = document.querySelector('canvas').getBoundingClientRect();
            const y = e.clientY - rect.top;
            
            this.updateDragScroll(y);
            e.preventDefault();
        });
        
        // Mouse up
        document.addEventListener('mouseup', (e) => {
            if (this.isDraggingUAV) {
                this.endDragScroll();
            }
        });
        
        // Mouse leave
        document.addEventListener('mouseleave', (e) => {
            if (this.isDraggingUAV) {
                this.endDragScroll();
            }
        });
        
        // Mouse wheel per scroll
        document.addEventListener('wheel', (e) => {
            if (!this.isOpen || this.currentTab !== 'uav') return;
            
            const rect = document.querySelector('canvas').getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            if (this.isInsideUAVScrollArea(x, y)) {
                const scrollAmount = e.deltaY * 0.5; // Sensibilità scroll
                const maxScroll = Math.max(0, (this.equipment.uav.length * this.uavItemHeight) - this.uavScrollArea.height);
                this.uavScrollY = Math.max(0, Math.min(this.uavScrollY + scrollAmount, maxScroll));
                e.preventDefault();
            }
        });
    }
    
    // Controlla se il click è nell'area di scroll UAV
    isInsideUAVScrollArea(x, y) {
        return x >= this.uavScrollArea.x && 
               x <= this.uavScrollArea.x + this.uavScrollArea.width &&
               y >= this.uavScrollArea.y && 
               y <= this.uavScrollArea.y + this.uavScrollArea.height;
    }
    
    // Inizia il drag scroll
    startDragScroll(x, y) {
        this.isDraggingUAV = true;
        this.dragStartY = y;
        this.scrollStartY = this.uavScrollY;
    }
    
    // Aggiorna il drag scroll
    updateDragScroll(y) {
        if (!this.isDraggingUAV) return;
        
        const deltaY = y - this.dragStartY;
        const newScrollY = this.scrollStartY - deltaY;
        
        // Calcola i limiti di scroll
        const maxScroll = Math.max(0, (this.equipment.uav.length * this.uavItemHeight) - this.uavScrollArea.height);
        this.uavScrollY = Math.max(0, Math.min(newScrollY, maxScroll));
    }
    
    // Termina il drag scroll
    endDragScroll() {
        this.isDraggingUAV = false;
    }
    
    // Carica le immagini degli equipaggiamenti N3
    loadEquipImages() {
        // Carica laser N3
        const laser3Img = new Image();
        laser3Img.onload = () => {
            this.equipImages.laser3 = laser3Img;
        };
        laser3Img.onerror = () => {
            console.warn('⚠️ Errore nel caricamento immagine laser N3');
        };
        laser3Img.src = 'equip_image/igun3.png';
        
        // Carica scudo N3
        const shield3Img = new Image();
        shield3Img.onload = () => {
            this.equipImages.shield3 = shield3Img;
        };
        shield3Img.onerror = () => {
            console.warn('⚠️ Errore nel caricamento immagine scudo N3');
        };
        shield3Img.src = 'equip_image/ish3.png';
        
        // Carica generatore N3
        const gen3Img = new Image();
        gen3Img.onload = () => {
            this.equipImages.gen3 = gen3Img;
        };
        gen3Img.onerror = () => {
            console.warn('⚠️ Errore nel caricamento immagine generatore N3');
        };
        gen3Img.src = 'equip_image/isp3.png';
    }
    
    // Rimuovi droni dall'inventario generale (dovrebbero essere solo in equipment.uav)
    cleanupDronesFromInventory() {
        this.items = this.items.filter(item => item.type !== 'uav');
    }
    
    
    
    // Apri/chiudi inventario
    toggle() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.justOpened = true;
            setTimeout(() => {
                this.justOpened = false;
            }, 100);
        }
    }
    
    open() {
        this.isOpen = true;
        this.justOpened = true;
        setTimeout(() => {
            this.justOpened = false;
        }, 100);
    }
    
    close() {
        this.isOpen = false;
    }
    
    // Aggiungi oggetto all'inventario
    addItem(item) {
        console.log('📥 Inventory.addItem chiamato con:', item);
        if (this.items.length < this.maxItems) {
            this.items.push(item);
            console.log('💾 Salvataggio inventory:', this.items);
            this.save();
            return true;
        }
        console.log('❌ Inventory pieno:', this.items.length, '>=', this.maxItems);
        return false; // Inventario pieno
    }
    
    // Aggiungi acquisto reale all'inventario
    addPurchasedItem(purchase) {
        // Cerca se esiste già un acquisto dello stesso tipo
        const existingIndex = this.items.findIndex(item => 
            item.type === 'purchase' && 
            item.key === purchase.key && 
            item.purchasedAt === purchase.purchasedAt
        );
        
        if (existingIndex >= 0) {
            // Aggiorna quantità se esiste già
            this.items[existingIndex].amount += purchase.amount;
        } else {
            // Crea nuovo oggetto acquisto
            const purchasedItem = {
                id: Date.now() + Math.random().toString(36).substr(2, 9),
                name: purchase.name,
                type: 'purchase',
                key: purchase.key,
                amount: purchase.amount,
                price: purchase.price,
                purchasedAt: purchase.purchasedAt,
                stats: {
                    category: purchase.type,
                    originalPrice: purchase.price
                }
            };
            this.items.push(purchasedItem);
        }
        
        this.save();
    }
    
    // Rimuovi oggetto dall'inventario
    removeItem(index) {
        if (index >= 0 && index < this.items.length) {
            return this.items.splice(index, 1)[0];
        }
        return null;
    }
    
    // Equipaggia oggetto (metodo unificato)
    equipItem(itemIndex, slotType, slotIndex, droneIndex = null) {
        const item = this.removeItem(itemIndex);
        if (item) {
            // Equipaggiamento su drone UAV
            if (droneIndex !== null && slotType === 'uav') {
                const drone = this.equipment.uav[droneIndex];
                if (drone && drone.equippedItems && drone.equippedItems[slotIndex] === null) {
                    drone.equippedItems[slotIndex] = item;
                    
                    // Applica effetti del drone alla nave
                    this.applyDroneEffects();
                    return true;
                }
            }
            // Equipaggiamento normale
            else if (this.equipment[slotType][slotIndex] === null) {
                this.equipment[slotType][slotIndex] = item;
                
                // Aggiorna la nave quando equipaggi un laser
                if (slotType === 'laser' && window.gameInstance && window.gameInstance.ship) {
                    console.log('🔍 Equipaggio laser:', {
                        item,
                        name: item.name,
                        type: item.type,
                        stats: item.stats,
                        key: item.stats?.key
                    });
                    window.gameInstance.ship.equipLaser(item.stats.key, 1);
                    console.log('✅ Laser equipaggiati:', window.gameInstance.ship.equippedLasers);
                }
                // Aggiorna la nave quando equipaggi un generatore (speed +2 per ognuno)
                if (slotType === 'shieldGen' && window.gameInstance && window.gameInstance.ship) {
                    // Determina se è un generatore o uno scudo guardando stats.key
                    const key = item.stats?.key || '';
                    if (key.startsWith('gen')) {
                        window.gameInstance.ship.equipGenerator(key, 1);
                    } else if (key.startsWith('sh')) {
                        // Scudi: aumenta la capacità scudo
                        const extra = Number(item.stats?.protection || 0);
                        window.gameInstance.ship.maxShield += extra;
                        window.gameInstance.ship.shield += extra;
                    }
                }
                
                return true;
            }
        }
        // Se non può essere equipaggiato, rimetti nell'inventario
        if (item) {
            this.items.splice(itemIndex, 0, item);
        }
        return false;
    }
    
    // Rimuovi equipaggiamento (metodo unificato)
    unequipItem(slotType, slotIndex, droneIndex = null) {
        // Rimozione da drone UAV
        if (droneIndex !== null && slotType === 'uav') {
            const drone = this.equipment.uav[droneIndex];
            if (drone && drone.equippedItems && drone.equippedItems[slotIndex]) {
                const item = drone.equippedItems[slotIndex];
                console.log(`🚁 Rimuovendo ${item.name} da drone ${droneIndex}, slot ${slotIndex}`);
                drone.equippedItems[slotIndex] = null;
                
                // Riapplica effetti dei droni (senza l'oggetto rimosso)
                this.applyDroneEffects();
                
                this.addItem(item);
                return item;
            } else {
                console.log(`🚁 Nessun oggetto da rimuovere: drone ${droneIndex}, slot ${slotIndex}`);
            }
        }
        // Rimozione normale
        else if (this.equipment[slotType][slotIndex]) {
            const item = this.equipment[slotType][slotIndex];
            this.equipment[slotType][slotIndex] = null;
            
            // Aggiorna la nave quando rimuovi un laser
            if (slotType === 'laser' && window.gameInstance && window.gameInstance.ship) {
                const laserKey = item.stats?.key || item.key;
                window.gameInstance.ship.unequipLaser(laserKey, 1);
            }
            if (slotType === 'shieldGen' && window.gameInstance && window.gameInstance.ship) {
                const key = item.stats?.key || '';
                if (key.startsWith('gen')) {
                    window.gameInstance.ship.unequipGenerator(key, 1);
                } else if (key.startsWith('sh')) {
                    const extra = Number(item.stats?.protection || 0);
                    window.gameInstance.ship.maxShield = Math.max(0, window.gameInstance.ship.maxShield - extra);
                    window.gameInstance.ship.shield = Math.min(window.gameInstance.ship.shield, window.gameInstance.ship.maxShield);
                }
            }
            
            this.addItem(item);
            return item;
        }
        return null;
    }
    
    // Salva inventario
    save() {
        const inventoryData = {
            equipment: this.equipment,
            items: this.items
        };
        localStorage.setItem('inventory', JSON.stringify(inventoryData));
    }
    
    // Carica inventario
    load() {
        const savedData = localStorage.getItem('inventory');
        if (savedData) {
            const inventoryData = JSON.parse(savedData);
            this.equipment = inventoryData.equipment || this.equipment;
            this.items = inventoryData.items || this.items;
            
            // Assicurati che equipment.uav sia sempre inizializzato
            if (!this.equipment.uav) {
                this.equipment.uav = [];
            }

            // Inizializza equippedItems per tutti i droni
            this.equipment.uav.forEach(drone => {
                if (!drone.equippedItems) {
                    drone.equippedItems = new Array(drone.slots).fill(null);
                }
            });
            
            // Applica effetti dei droni al caricamento
            this.applyDroneEffects();
            
            // Pulisci eventuali droni dall'inventario generale
            this.cleanupDronesFromInventory();
            
            
            // Riapplica gli effetti degli item equipaggiati
            if (window.gameInstance && window.gameInstance.ship) {
                // Riapplica laser
                Object.entries(this.equipment.laser).forEach(([index, item]) => {
                    if (item && item.stats && item.stats.key) {
                        console.log('🔄 Riapplico laser:', item);
                        window.gameInstance.ship.equipLaser(item.stats.key, 1);
                    }
                });
                
                // Riapplica scudi e generatori
                Object.entries(this.equipment.shieldGen).forEach(([index, item]) => {
                    if (item && item.stats && item.stats.key) {
                        const key = item.stats.key;
                        console.log('🔄 Riapplico shield/gen:', item);
                        if (key.startsWith('gen')) {
                            window.gameInstance.ship.equipGenerator(key, 1);
                        } else if (key.startsWith('sh')) {
                            const extra = Number(item.stats?.protection || 0);
                            window.gameInstance.ship.maxShield += extra;
                            window.gameInstance.ship.shield += extra;
                        }
                    }
                });
            }
        }
    }
    
    // Gestisci movimento del mouse
    handleMouseMove(x, y, canvasWidth, canvasHeight) {
        if (!this.isOpen) return;
        
        this.mouseX = x;
        this.mouseY = y;
        
        // Calcola posizione del pannello (centrato)
        this.panelX = (canvasWidth - this.panelWidth) / 2;
        this.panelY = (canvasHeight - this.panelHeight) / 2;
        
        // Controlla se il mouse è dentro il pannello
        if (x < this.panelX || x > this.panelX + this.panelWidth ||
            y < this.panelY || y > this.panelY + this.panelHeight) {
            this.tooltip = null;
            return;
        }
        
        // Gestisci hover per tooltip se siamo nella tab UAV
        if (this.currentTab === 'uav') {
            this.checkUAVHover(x, y);
        }
    }
    
    // Gestisci scroll per UAV (metodo semplificato con pulsanti)
    handleUAVScroll(deltaY) {
        if (this.currentTab !== 'uav') return;
        
        const scrollSpeed = 20;
        this.uavScrollY -= deltaY * scrollSpeed;
        
        // Limita lo scroll
        const maxScroll = Math.max(0, (this.equipment.uav.length * this.uavItemHeight) - 400);
        this.uavScrollY = Math.max(0, Math.min(this.uavScrollY, maxScroll));
    }
    
    // Controlla hover per UAV
    checkUAVHover(x, y) {
        const uavY = this.panelY + 200;
        const uavX = this.panelX + 50;
        const droneAreaWidth = 300;
        const droneAreaHeight = 400;

        // Assicurati che equipment.uav sia inizializzato
        if (!this.equipment.uav) {
            this.equipment.uav = [];
        }

        // Se non ci sono droni, non c'è hover
        if (this.equipment.uav.length === 0) {
            this.hoveredDrone = -1;
            return false;
        }

        // Controlla hover sui droni equipaggiati
        this.equipment.uav.forEach((drone, droneIndex) => {
            const droneY = uavY + (droneIndex * this.uavItemHeight) - this.uavScrollY;
            const droneX = uavX + 10;
            const droneWidth = droneAreaWidth - 20;
            const droneHeight = this.uavItemHeight - 20;

            // Hover sul drone
            if (x >= droneX && x <= droneX + droneWidth &&
                y >= droneY && y <= droneY + droneHeight) {

                // Hover sui slot del drone
                const slotSize = 30;
                const slotSpacing = 5;
                const slotStartX = droneX + 10;
                const slotY = droneY + 35;

                for (let slotIndex = 0; slotIndex < drone.slots; slotIndex++) {
                    const slotX = slotStartX + slotIndex * (slotSize + slotSpacing);

                    if (x >= slotX && x <= slotX + slotSize &&
                        y >= slotY && y <= slotY + slotSize) {

                        // Se c'è un oggetto equipaggiato, mostra tooltip
                        if (drone.equippedItems && drone.equippedItems[slotIndex]) {
                            this.tooltip = {
                                item: drone.equippedItems[slotIndex],
                                x: slotX,
                                y: slotY
                            };
                        } else {
                            this.tooltip = null;
                        }
                        return;
                    }
                }
            }
        });

        // Controlla hover sull'inventario del player
        const inventoryX = uavX + droneAreaWidth + 20;
        const inventoryY = uavY - 20;
        const itemSize = 50;
        const itemsPerRow = 4;

        const availableItems = this.items.filter(item => 
            item.type === 'laser' || item.type === 'shield'
        );

        let itemX = inventoryX;
        let itemY = inventoryY + 30;

        availableItems.forEach((item, index) => {
            if (index > 0 && index % itemsPerRow === 0) {
                itemX = inventoryX;
                itemY += itemSize + 10;
            }

            if (x >= itemX && x <= itemX + itemSize && 
                y >= itemY && y <= itemY + itemSize) {
                
                this.tooltip = {
                    item: item,
                    x: itemX,
                    y: itemY
                };
                return;
            }

            itemX += itemSize + 10;
        });

        // Se non è sopra nessun oggetto, rimuovi il tooltip
        this.tooltip = null;
    }
    
    // Gestisci click del mouse
    handleClick(x, y, canvasWidth, canvasHeight) {
        if (!this.isOpen) return false;
        
        // Ignora click se l'inventario è appena stato aperto
        if (this.justOpened) {
            return true;
        }
        
        // Calcola posizione del pannello (centrato)
        this.panelX = (canvasWidth - this.panelWidth) / 2;
        this.panelY = (canvasHeight - this.panelHeight) / 2;
        
        // DEBUG: Log dettagliato del click (disabilitato per performance)
        // console.log('🖱️ CLICK DEBUG:', { clickX: x, clickY: y, currentTab: this.currentTab });
        
        // Controlla se il click è dentro il pannello
        if (x < this.panelX || x > this.panelX + this.panelWidth ||
            y < this.panelY || y > this.panelY + this.panelHeight) {
            return false;
        }
        
        // Suono click rimosso per evitare fastidio
        
        // Controlla click su tab
        if (this.handleTabClick(x, y)) {
            return true;
        }
        
        // Gestisci click sui droni UAV se siamo nella tab UAV (priorità alta)
        if (this.currentTab === 'uav') {
            const uavHandled = this.handleUAVClick(x, y);
            if (uavHandled) {
                return true;
            }
        }
        
        // Gestisci click sugli slot di equipaggiamento
        const equipmentHandled = this.handleEquipmentClick(x, y);
        if (equipmentHandled) {
            return true;
        }
        
        // Gestisci click sull'inventario
        const inventoryHandled = this.handleInventoryClick(x, y);
        if (inventoryHandled) {
            return true;
        }
        
        return true;
    }
    
    // Gestisci click su tab
    handleTabClick(x, y) {
        const tabHeight = 40;
        const tabY = this.panelY + 80; // Aggiornato per corrispondere al drawTabs
        const tabWidth = this.panelWidth / this.tabs.length;
        
        // Controlla se il click è nell'area delle tab
        if (y >= tabY && y <= tabY + tabHeight) {
            for (let index = 0; index < this.tabs.length; index++) {
                const tabX = this.panelX + index * tabWidth;
                if (x >= tabX && x <= tabX + tabWidth) {
                    this.currentTab = this.tabs[index].id;
                    return true; // Restituisce true quando trova una tab cliccata
                }
            }
        }
        return false;
    }
    
    // Gestisci click sui droni UAV
    handleUAVClick(x, y) {
        const uavY = this.panelY + 200;
        const uavX = this.panelX + 50;
        const droneAreaWidth = 450; // Aggiornato per corrispondere al drawUAV
        const droneAreaHeight = 400;

        // Assicurati che equipment.uav sia inizializzato
        if (!this.equipment.uav) {
            this.equipment.uav = [];
        }

        // Se non ci sono droni, non c'è click
        if (this.equipment.uav.length === 0) {
            return false;
        }

        // Controlla click sui droni equipaggiati (layout verticale)
        this.equipment.uav.forEach((drone, droneIndex) => {
            const droneY = uavY + (droneIndex * this.uavItemHeight) - this.uavScrollY;
            const droneX = uavX + 10;
            const droneWidth = droneAreaWidth - 20;
            const droneHeight = this.uavItemHeight - 20;

            // Click sul drone (area generale)
            if (x >= droneX && x <= droneX + droneWidth &&
                y >= droneY && y <= droneY + droneHeight) {

                // Click sui slot del drone (nuovo layout: icona drone a sinistra, slot equipaggiamento a destra)
                const slotSize = 50;
                const slotSpacing = 15;
                const slotStartX = droneX + 20;
                const slotY = droneY + 35; // Aggiornato per corrispondere al drawDroneVertical
                const equipSlotsX = droneX + droneWidth - 150; // Posizionato a destra con più spazio
                const equipSlotsY = slotY; // Aggiunto per corrispondere al drawDroneVertical

                // Click su icona drone (slot 0 - non cliccabile per ora)
                const droneIconX = slotStartX;
                const droneIconY = slotY;
                if (x >= droneIconX && x <= droneIconX + slotSize &&
                    y >= droneIconY && y <= droneIconY + slotSize) {
                    // Icona drone non cliccabile per ora
                    return true;
                }

                // Click su slot equipaggiamento (slot 0+) - layout orizzontale
                for (let slotIndex = 0; slotIndex < drone.slots; slotIndex++) {
                    const slotX = equipSlotsX + slotIndex * (slotSize + slotSpacing);
                    const slotY = equipSlotsY;

                    if (x >= slotX && x <= slotX + slotSize &&
                        y >= slotY && y <= slotY + slotSize) {

                        // Inizializza equippedItems se non esiste
                        if (!drone.equippedItems) {
                            drone.equippedItems = new Array(drone.slots).fill(null);
                        }

                        // Se c'è un oggetto equipaggiato, rimuovilo
                        if (drone.equippedItems[slotIndex]) {
                            this.unequipItemFromDrone(droneIndex, slotIndex);
                        }
                        // Altrimenti slot vuoto - nessuna azione necessaria
                        else {
                        }
                        return true;
                    }
                }
            }
        });

        // Controlla click sulla scrollbar moderna
        const maxScroll = Math.max(0, (this.equipment.uav.length * this.uavItemHeight) - 400);
        if (maxScroll > 0) {
            const scrollbarWidth = 8;
            const scrollbarX = uavX + droneAreaWidth - scrollbarWidth - 5;
            const scrollbarY = uavY + 5;
            const scrollbarHeight = droneAreaHeight - 10;
            
            // Click sulla scrollbar
            if (x >= scrollbarX && x <= scrollbarX + scrollbarWidth &&
                y >= scrollbarY && y <= scrollbarY + scrollbarHeight) {
                
                // Calcola nuova posizione scroll basata sul click
                const clickRatio = (y - scrollbarY) / scrollbarHeight;
                this.uavScrollY = clickRatio * maxScroll;
                return true;
            }
        }

        // Controlla click sull'inventario del player
        const inventoryX = uavX + droneAreaWidth + 20;
        const inventoryY = uavY - 20;
        const itemSize = 50;
        const itemsPerRow = 4;

        const availableItems = this.items.filter(item => 
            item.type === 'laser' || item.type === 'shield'
        );

        let itemX = inventoryX;
        let itemY = inventoryY + 30;

        availableItems.forEach((item, index) => {
            if (index > 0 && index % itemsPerRow === 0) {
                itemX = inventoryX;
                itemY += itemSize + 10;
            }

            if (x >= itemX && x <= itemX + itemSize && 
                y >= itemY && y <= itemY + itemSize) {
                
                // Click su oggetto dell'inventario - equipaggia automaticamente
                // Controlla che l'oggetto sia ancora nell'inventario
                if (this.items.includes(item)) {
                    this.equipItemToFirstAvailableSlot(item);
                }
                return true;
            }

            itemX += itemSize + 10;
        });

        return false;
    }
    
    // Equipaggia oggetto automaticamente nel primo slot disponibile (usa metodo unificato)
    equipItemToFirstAvailableSlot(item) {
        // Controlla cooldown per evitare click multipli
        const currentTime = Date.now();
        if (currentTime - this.lastEquipTime < this.equipCooldown) {
            return false;
        }
        this.lastEquipTime = currentTime;
        
        // Trova l'oggetto nell'inventario per ottenere l'indice corretto
        const itemIndex = this.items.findIndex(i => i === item);
        if (itemIndex === -1) {
            this.showPopup('Oggetto non trovato nell\'inventario', 'error');
            return false;
        }
        
        // Trova il primo drone con slot disponibili
        for (let droneIndex = 0; droneIndex < this.equipment.uav.length; droneIndex++) {
            const drone = this.equipment.uav[droneIndex];
            
            // Inizializza equippedItems se non esiste
            if (!drone.equippedItems) {
                drone.equippedItems = new Array(drone.slots).fill(null);
            }
            
            // Cerca il primo slot vuoto
            for (let slotIndex = 0; slotIndex < drone.slots; slotIndex++) {
                if (!drone.equippedItems[slotIndex]) {
                    // Usa il metodo unificato di equipaggiamento
                    return this.equipItem(itemIndex, 'uav', slotIndex, droneIndex);
                }
            }
        }
        
        // Nessun slot disponibile
        this.showPopup('Tutti i slot dei droni sono occupati!', 'error');
        return false;
    }

    // Equipaggia oggetto su drone dall'inventario
    equipItemOnDroneFromInventory(droneIndex, slotIndex) {
        // Se c'è un oggetto selezionato, usalo
        if (this.selectedItemForDrone) {
            const item = this.selectedItemForDrone;
            const itemIndex = this.items.findIndex(i => i === item);
            
            if (itemIndex !== -1) {
                this.equipItemOnDrone(droneIndex, slotIndex, item);
                this.items.splice(itemIndex, 1);
                this.selectedItemForDrone = null; // Reset selezione
            }
        } else {
            // Trova il primo laser o scudo disponibile nell'inventario
            const itemIndex = this.items.findIndex(item => 
                item.type === 'laser' || item.type === 'shield'
            );

            if (itemIndex !== -1) {
                const item = this.items[itemIndex];
                this.equipItemOnDrone(droneIndex, slotIndex, item);
                this.items.splice(itemIndex, 1);
            } else {
                this.showPopup('Nessun laser o scudo disponibile nell\'inventario', 'error');
            }
        }
    }
    
    // I droni UAV vengono aggiunti direttamente alla tab UAV quando acquistati
    // Non possono essere equipaggiati/rimossi dall'inventario generale
    
    // I droni UAV non possono essere rimossi una volta acquistati
    // Sono permanenti nella tab UAV
    
    // Equipaggia oggetto su drone
    equipItemOnDrone(droneIndex, slotIndex, item) {
        if (droneIndex >= 0 && droneIndex < this.equipment.uav.length) {
            const drone = this.equipment.uav[droneIndex];
            
            // Inizializza equippedItems se non esiste
            if (!drone.equippedItems) {
                drone.equippedItems = new Array(drone.slots).fill(null);
            }
            
            if (slotIndex >= 0 && slotIndex < drone.slots) {
                // Controlla che l'oggetto sia laser o scudo
                if (item.type === 'laser' || item.type === 'shield') {
                    drone.equippedItems[slotIndex] = item;
                    
                    // Rimuovi l'oggetto dall'inventario
                    const itemIndex = this.items.findIndex(invItem => invItem === item);
                    if (itemIndex !== -1) {
                        this.items.splice(itemIndex, 1);
                    }
                    
                    // Applica effetti dei droni dopo l'equipaggiamento
                    this.applyDroneEffects();
                    
                    const droneName = drone.name || drone.droneType || 'Drone';
                } else {
                }
            }
        }
    }
    
    // Rimuovi oggetto da drone (usa metodo unificato)
    unequipItemFromDrone(droneIndex, slotIndex) {
        return this.unequipItem('uav', slotIndex, droneIndex);
    }
    
    // Applica effetti dei droni UAV alla nave
    applyDroneEffects() {
        if (!window.gameInstance || !window.gameInstance.ship) return;
        
        // Reset effetti precedenti dei droni
        this.resetDroneEffects();
        
        // Applica effetti di tutti i droni equipaggiati
        this.equipment.uav.forEach((drone, droneIndex) => {
            if (drone.equippedItems) {
                drone.equippedItems.forEach((item, slotIndex) => {
                    if (item) {
                        this.applyDroneItemEffect(item, drone);
                    }
                });
            }
        });
    }
    
    // Reset effetti dei droni
    resetDroneEffects() {
        if (!window.gameInstance || !window.gameInstance.ship) return;
        
        const ship = window.gameInstance.ship;
        
        // Reset danno bonus dei droni
        if (ship.droneDamageBonus) {
            ship.droneDamageBonus = 0;
        }
        
        // Reset protezione bonus dei droni
        if (ship.droneShieldBonus) {
            ship.droneShieldBonus = 0;
        }
    }
    
    // Applica effetto di un oggetto equipaggiato su drone
    applyDroneItemEffect(item, drone) {
        if (!window.gameInstance || !window.gameInstance.ship) return;
        
        const ship = window.gameInstance.ship;
        
        // Inizializza bonus se non esistono
        if (!ship.droneDamageBonus) ship.droneDamageBonus = 0;
        if (!ship.droneShieldBonus) ship.droneShieldBonus = 0;
        
        // Applica bonus basato sul tipo di oggetto
        if (item.type === 'laser') {
            // Per i laser, usa il sistema della nave per calcolare il danno
            const laserKey = item.stats?.key || item.key;
            if (laserKey && ship.laserDamage[laserKey]) {
                const damage = ship.laserDamage[laserKey];
            ship.droneDamageBonus += damage;
            
                console.log(`🚁 Drone ${drone.name}: +${damage} danno da ${item.name} (${laserKey})`);
            }
        } else if (item.type === 'shield') {
            // Bonus protezione per scudi sui droni
            const protection = item.protection || item.stats?.protection || 0;
            ship.droneShieldBonus += protection;
            
            console.log(`🚁 Drone ${drone.name}: +${protection} protezione da ${item.name}`);
        }
    }
    
    // Gestisci click sugli slot di equipaggiamento
    handleEquipmentClick(x, y) {
        const equipmentY = this.panelY + 200; // Corretto per corrispondere a drawEquipment
        const equipmentX = this.panelX + 50;
        const slotSpacing = 65; // Slot equipaggiamento più compatti
        
        // DEBUG: Equipment click debug (disabilitato per performance)
        // console.log('🔧 EQUIPMENT CLICK DEBUG:', { clickX: x, clickY: y });
        
        // Controlla click su slot laser
        for (let i = 0; i < 3; i++) {
            const slotX = equipmentX + (i * slotSpacing);
            const slotY = equipmentY + 10;
            const slotRight = slotX + this.slotSize;
            const slotBottom = slotY + this.slotSize;
                
            // DEBUG: Laser slot debug (disabilitato per performance)
            // console.log(`🔍 Laser slot ${i}:`, { slotX, slotY, isInside: x >= slotX && x <= slotRight && y >= slotY && y <= slotBottom });
            
            if (x >= slotX && x <= slotRight && y >= slotY && y <= slotBottom) {
                if (this.equipment.laser[i]) {
                    const item = this.unequipItem('laser', i);
                }
                // Non auto-equipaggiare su slot vuoti
                return true;
            }
        }
        
        // Controlla click su slot scudi/generatori (6 slot totali)
        const shieldGenY = equipmentY + 150; // Corretto per corrispondere a drawEquipment
        
        // Tutti gli slot scudi/generatori
        for (let i = 0; i < 6; i++) {
            const slotX = equipmentX + (i * slotSpacing);
            const slotRight = slotX + this.slotSize;
            const slotBottom = shieldGenY + this.slotSize;
                
            // DEBUG: Shield/Gen slot debug (disabilitato per performance)
            // console.log(`🔍 Shield/Gen slot ${i}:`, { slotX, slotY: shieldGenY, isInside: x >= slotX && x <= slotRight && y >= shieldGenY && y <= slotBottom });
            
            if (x >= slotX && x <= slotRight && y >= shieldGenY && y <= slotBottom) {
                if (this.equipment.shieldGen[i]) {
                    const item = this.unequipItem('shieldGen', i);
                }
                // Non auto-equipaggiare su slot vuoti
                return true;
            }
        }
        
        // Controlla click su slot extra
        const extraY = equipmentY + 300; // Corretto per corrispondere a drawEquipment
        for (let i = 0; i < 3; i++) {
            const slotX = equipmentX + (i * slotSpacing);
            const slotRight = slotX + this.slotSize;
            const slotBottom = extraY + this.slotSize;
                
            // DEBUG: Extra slot debug (disabilitato per performance)
            // console.log(`🔍 Extra slot ${i}:`, { slotX, slotY: extraY, isInside: x >= slotX && x <= slotRight && y >= extraY && y <= slotBottom });
            
            if (x >= slotX && x <= slotRight && y >= extraY && y <= slotBottom) {
                if (this.equipment.extra[i]) {
                    const item = this.unequipItem('extra', i);
                }
                // Non auto-equipaggiare su slot vuoti
                return true;
            }
        }
        
        return false;
    }
    
    // Controlla hover sugli oggetti equipaggiati
    checkEquipmentHover(x, y) {
        const equipmentY = this.panelY + 200; // Corretto per corrispondere a drawEquipment
        const equipmentX = this.panelX + 50;
        const slotSpacing = 65; // Slot equipaggiamento più compatti
        
        // Controlla hover su slot laser
        for (let i = 0; i < 3; i++) {
            const slotX = equipmentX + (i * slotSpacing);
            if (x >= slotX && x <= slotX + this.slotSize &&
                y >= equipmentY + 10 && y <= equipmentY + 10 + this.slotSize) {
                
                if (this.equipment.laser[i]) {
                    this.tooltip = {
                        item: this.equipment.laser[i],
                        x: slotX,
                        y: equipmentY + 40
                    };
                } else {
                    this.tooltip = null;
                }
                return;
            }
        }
        
                // Controlla hover su slot scudi/generatori (6 slot in una riga)
        const shieldGenY = equipmentY + 150; // Corretto per corrispondere a drawEquipment
        
        // Tutti gli slot scudi/generatori
        for (let i = 0; i < 6; i++) {
            const slotX = equipmentX + (i * slotSpacing);
            if (x >= slotX && x <= slotX + this.slotSize &&
                y >= shieldGenY && y <= shieldGenY + this.slotSize) {
                
                if (this.equipment.shieldGen[i]) {
                    this.tooltip = {
                        item: this.equipment.shieldGen[i],
                        x: slotX,
                        y: shieldGenY
                    };
                } else {
                    this.tooltip = null;
                }
                return;
            }
        }
        
        // Controlla hover su slot extra
        const extraY = equipmentY + 300; // Corretto per corrispondere a drawEquipment
        for (let i = 0; i < 3; i++) {
            const slotX = equipmentX + (i * slotSpacing);
            if (x >= slotX && x <= slotX + this.slotSize &&
                y >= extraY && y <= extraY + this.slotSize) {
                
                if (this.equipment.extra[i]) {
                    this.tooltip = {
                        item: this.equipment.extra[i],
                        x: slotX,
                        y: extraY
                    };
                } else {
                    this.tooltip = null;
                }
            return;
        }
        }
    }
    
    // Controlla hover sugli oggetti dell'inventario
    checkInventoryHover(x, y) {
        const inventoryY = this.panelY + 80;
        const inventoryX = this.panelX + 650; // Posizionato molto più a destra
        const itemsPerRow = 5;
        
        for (let i = 0; i < this.items.length; i++) {
            const itemX = inventoryX + (i % itemsPerRow) * (this.slotSize + this.slotSpacing);
            const itemY = inventoryY + Math.floor(i / itemsPerRow) * (this.slotSize + this.slotSpacing);
            
            if (x >= itemX && x <= itemX + this.slotSize &&
                y >= itemY && y <= itemY + this.slotSize) {
                
                this.tooltip = {
                    item: this.items[i],
                    x: itemX,
                    y: itemY
                };
                    return;
                }
            }
            
        // Se non è sopra nessun oggetto, rimuovi il tooltip
        this.tooltip = null;
    }
    
    // Equipaggia il primo oggetto compatibile
    equipFirstCompatibleItem(slotType, slotIndex) {
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            if (this.isItemCompatible(item, slotType)) {
                this.equipItem(i, slotType, slotIndex);
                    return;
                }
        }
    }
    
    // Controlla se un oggetto è compatibile con uno slot
    isItemCompatible(item, slotType) {
        if (slotType === 'laser' && item.type === 'laser') return true;
        if (slotType === 'shieldGen' && (item.type === 'shield' || item.type === 'generator')) return true;
        if (slotType === 'extra' && item.type === 'extra') return true;
        return false;
    }
    
    // Gestisci click sull'inventario
    handleInventoryClick(x, y) {
        const inventoryY = this.panelY + 160; // Corretto per corrispondere a drawInventory
        const inventoryX = this.panelX + 600; // Corretto per corrispondere a drawInventory
        const itemsPerRow = 6; // Corretto per corrispondere a drawInventory
        const slotSize = 60; // Corretto per corrispondere a drawInventory
        const slotSpacing = 10; // Corretto per corrispondere a drawInventory
        
        // DEBUG: Inventory click debug (disabilitato per performance)
        // console.log('📦 INVENTORY CLICK DEBUG:', { clickX: x, clickY: y, itemsCount: this.items.length });
        
        for (let i = 0; i < this.items.length; i++) {
            const itemX = inventoryX + (i % itemsPerRow) * (slotSize + slotSpacing);
            const itemY = inventoryY + Math.floor(i / itemsPerRow) * (slotSize + slotSpacing);
            const itemRight = itemX + slotSize;
            const itemBottom = itemY + slotSize;
            
            // DEBUG: Inventory item debug (disabilitato per performance)
            // console.log(`🔍 Inventory item ${i}:`, { itemX, itemY, isInside: x >= itemX && x <= itemRight && y >= itemY && y <= itemBottom });
            
            if (x >= itemX && x <= itemRight && y >= itemY && y <= itemBottom) {
                // Equipaggia automaticamente l'oggetto se possibile
                this.autoEquipItem(i);
                return true;
            }
        }
        
        return false;
    }
    
    // Equipaggia automaticamente un oggetto
    autoEquipItem(itemIndex) {
        const item = this.items[itemIndex];
        if (!item) {
            return;
        }
        
        // DEBUG: Auto equip debug (disabilitato per performance)
        // console.log('🔧 AUTO EQUIP DEBUG:', { itemIndex, itemType: item.type, itemName: item.name });
        
        // Se siamo nella tab UAV, equipaggia sui droni (sistema unificato)
        if (this.currentTab === 'uav') {
            // Controlla che l'oggetto sia compatibile con i droni
            if (item.type === 'laser' || item.type === 'shield') {
                // Trova il primo drone con slot libero
                for (let droneIndex = 0; droneIndex < this.equipment.uav.length; droneIndex++) {
                    const drone = this.equipment.uav[droneIndex];
                    
                    // Inizializza equippedItems se non esiste
                    if (!drone.equippedItems) {
                        drone.equippedItems = new Array(drone.slots).fill(null);
                    }
                    
                    // Cerca slot libero (slot 0+ per equipaggiamento, slot 0 è per equipaggiamento)
                    for (let slotIndex = 0; slotIndex < drone.slots; slotIndex++) {
                        if (!drone.equippedItems[slotIndex]) {
                            this.equipItemOnDrone(droneIndex, slotIndex, item);
                            return;
                        }
                    }
                }
                
                // Se non ci sono slot liberi - nessuna azione necessaria
                return;
            } else {
                return;
            }
        }
        
        // Trova il primo slot vuoto appropriato per equipaggiamento principale
        let targetSlotType = null;
        let targetSlotIndex = -1;
        
        if (item.type === 'laser') {
            for (let i = 0; i < 3; i++) {
                if (!this.equipment.laser[i]) {
                    targetSlotType = 'laser';
                    targetSlotIndex = i;
                    break;
                }
            }
        } else if (item.type === 'shield' || item.type === 'generator') {
            for (let i = 0; i < 6; i++) {
                if (!this.equipment.shieldGen[i]) {
                    targetSlotType = 'shieldGen';
                    targetSlotIndex = i;
                    break;
                }
            }
        } else if (item.type === 'extra') {
            for (let i = 0; i < 3; i++) {
                if (!this.equipment.extra[i]) {
                    targetSlotType = 'extra';
                    targetSlotIndex = i;
                    break;
                }
            }
        }
        
        if (targetSlotType !== null && targetSlotIndex !== -1) {
            this.equipItem(itemIndex, targetSlotType, targetSlotIndex);
        }
    }
    
    // Mostra popup
    showPopup(message, type = 'info') {
        this.popup = {
            message: message,
            type: type, // 'success', 'error', 'info'
            timestamp: Date.now(),
            duration: this.popupDuration
        };
    }
    
    // Aggiorna popup
    updatePopup() {
        if (this.popup) {
            const now = Date.now();
            if ((now - this.popup.timestamp) >= this.popup.duration) {
                this.popup = null;
            }
        }
    }
    
    // Aggiorna inventario
    update() {
        // Aggiorna popup
        this.updatePopup();
        
        // Salva automaticamente ogni 5 secondi
        if (!this.saveTimer) {
            this.saveTimer = 0;
        }
        this.saveTimer++;
        
        if (this.saveTimer >= 300) { // 300 frame = 5 secondi a 60 FPS
            this.save();
            this.saveTimer = 0;
        }
    }
    
    // Disegna inventario
    draw(ctx, canvasWidth, canvasHeight) {
        if (!this.isOpen) return;
        
        // Calcola posizione del pannello (centrato)
        this.panelX = (canvasWidth - this.panelWidth) / 2;
        this.panelY = (canvasHeight - this.panelHeight) / 2;
        
        // Sfondo del pannello uniforme scuro (senza blur/glow)
        ThemeUtils.drawPanel(ctx, this.panelX, this.panelY, this.panelWidth, this.panelHeight, {
            background: 'rgba(18,18,20,0.94)',
            border: 'rgba(255,255,255,0.12)',
            borderWidth: ThemeConfig.borders.width.normal,
            radius: ThemeConfig.borders.radius.lg,
            blur: false,
            glow: false
        });
        
        // Titolo elegante (più in basso)
        ThemeUtils.drawText(ctx, 'INVENTARIO', this.panelX + this.panelWidth / 2, this.panelY + 60, {
            color: ThemeConfig.colors.text.secondary, // Colore più tenue
            size: ThemeConfig.typography.sizes['2xl'], // Dimensione leggermente ridotta
            weight: ThemeConfig.typography.weights.semibold, // Peso ridotto
            align: 'center',
            baseline: 'middle',
            glow: false
        });
        
        // Disegna tab
        this.drawTabs(ctx);
        
        // Disegna contenuto basato sulla tab corrente
        if (this.currentTab === 'equipment') {
            this.drawEquipment(ctx);
            this.drawInventory(ctx);
        } else if (this.currentTab === 'uav') {
            this.drawUAV(ctx);
        }
        
        // Istruzioni (più in basso)
        ThemeUtils.drawText(ctx, 'Click su oggetti per equipaggiare automaticamente', this.panelX + this.panelWidth / 2, this.panelY + this.panelHeight - 40, {
            color: ThemeConfig.colors.text.secondary,
            size: ThemeConfig.typography.sizes.base,
            align: 'center',
            baseline: 'middle'
        });
        
        // Disegna popup
        this.drawPopup(ctx);
        
        // Disegna tooltip
        this.drawTooltip(ctx);
        
        // DEBUG: Disegna coordinate se debug mode è attivo (disabilitato per performance)
        // if (this.debugMode) {
        //     this.drawDebugInfo(ctx);
        // }
    }
    
    // Disegna informazioni di debug
    drawDebugInfo(ctx) {
        const equipmentY = this.panelY + 200;
        const equipmentX = this.panelX + 50;
        const slotSpacing = 65;
        
        // Disegna coordinate slot laser
        ctx.fillStyle = 'red';
        ctx.font = '12px Arial';
        for (let i = 0; i < 3; i++) {
            const slotX = equipmentX + (i * slotSpacing);
            const slotY = equipmentY + 10;
            ctx.fillText(`L${i}: ${slotX},${slotY}`, slotX, slotY - 5);
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.strokeRect(slotX, slotY, this.slotSize, this.slotSize);
        }
        
        // Disegna coordinate slot scudi/generatori
        const shieldGenY = equipmentY + 150;
        ctx.fillStyle = 'blue';
        for (let i = 0; i < 6; i++) {
            const slotX = equipmentX + (i * slotSpacing);
            ctx.fillText(`S${i}: ${slotX},${shieldGenY}`, slotX, shieldGenY - 5);
            ctx.strokeStyle = 'blue';
            ctx.lineWidth = 2;
            ctx.strokeRect(slotX, shieldGenY, this.slotSize, this.slotSize);
        }
        
        // Disegna coordinate slot extra
        const extraY = equipmentY + 300;
        ctx.fillStyle = 'green';
        for (let i = 0; i < 3; i++) {
            const slotX = equipmentX + (i * slotSpacing);
            ctx.fillText(`E${i}: ${slotX},${extraY}`, slotX, extraY - 5);
            ctx.strokeStyle = 'green';
            ctx.lineWidth = 2;
            ctx.strokeRect(slotX, extraY, this.slotSize, this.slotSize);
        }
        
        // Disegna coordinate inventario
        const inventoryY = this.panelY + 160;
        const inventoryX = this.panelX + 600;
        ctx.fillStyle = 'yellow';
        ctx.fillText(`INV: ${inventoryX},${inventoryY}`, inventoryX, inventoryY - 5);
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 2;
        ctx.strokeRect(inventoryX, inventoryY, 360, 120); // 6*60 slot
    }
    
    // Disegna le tab
    drawTabs(ctx) {
        const tabHeight = 40;
        const tabY = this.panelY + 80;
        const tabWidth = this.panelWidth / this.tabs.length;
        
        this.tabs.forEach((tab, index) => {
            const tabX = this.panelX + index * tabWidth;
            const isActive = this.currentTab === tab.id;
            
            // Disegna tab moderna
            ThemeUtils.drawButton(ctx, tabX, tabY, tabWidth, tabHeight, {
                text: tab.name,
                size: 'md',
                isHovered: false,
                isActive: isActive,
                textColor: '#ffffff',
                background: isActive ? 'rgba(40,40,44,0.95)' : 'rgba(28,28,32,0.95)',
                border: isActive ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.12)',
                glow: false
            });
        });
    }
    
    // Disegna sezione UAV
    drawUAV(ctx) {
        const uavY = this.panelY + 200;
        const uavX = this.panelX + 50;
        
        // Assicurati che equipment.uav sia inizializzato
        if (!this.equipment.uav) {
            this.equipment.uav = [];
        }
        
        // Titolo UAV con contatore
        ThemeUtils.drawText(ctx, `DRONI UAV (${this.equipment.uav.length}/8)`, uavX, uavY - 20, {
            color: ThemeConfig.colors.accent.danger,
            size: ThemeConfig.typography.sizes.lg,
            weight: ThemeConfig.typography.weights.bold
        });
        
        // Se non ci sono droni, mostra messaggio
        if (this.equipment.uav.length === 0) {
            ThemeUtils.drawText(ctx, 'Non hai UAV', uavX, uavY + 50, {
                color: ThemeConfig.colors.text.muted,
                size: ThemeConfig.typography.sizes.base,
                weight: ThemeConfig.typography.weights.normal
            });
            return;
        }
        
        // Area droni senza pannello (allargata)
        const droneAreaWidth = 450; // Aumentato da 300 a 450
        const droneAreaHeight = 400;
        const droneAreaX = uavX;
        const droneAreaY = uavY;
        
        // Aggiorna area di scroll per drag
        this.uavScrollArea = {
            x: droneAreaX,
            y: droneAreaY,
            width: droneAreaWidth,
            height: droneAreaHeight
        };
        
        // Calcola scroll
        const maxScroll = Math.max(0, (this.equipment.uav.length * this.uavItemHeight) - droneAreaHeight);
        this.uavScrollY = Math.max(0, Math.min(this.uavScrollY, maxScroll));
        
        // Disegna droni con scroll
        ctx.save();
        ctx.rect(droneAreaX, droneAreaY, droneAreaWidth, droneAreaHeight);
        ctx.clip();
        
        this.equipment.uav.forEach((drone, index) => {
            const droneY = droneAreaY + (index * this.uavItemHeight) - this.uavScrollY;
            if (droneY + this.uavItemHeight > droneAreaY && droneY < droneAreaY + droneAreaHeight) {
                this.drawDroneVertical(ctx, droneAreaX + 10, droneY + 10, droneAreaWidth - 20, this.uavItemHeight - 20, drone, index);
            }
        });
        
        ctx.restore();
        
        // Disegna scrollbar moderna se necessario
        if (maxScroll > 0) {
            this.drawModernScrollbar(ctx, droneAreaX, droneAreaY, droneAreaWidth, droneAreaHeight, maxScroll);
        }
        
        // Inventario del player a destra (stesso di equipaggiamento)
        this.drawInventory(ctx);
        
        // Informazioni UAV rimosse per pulizia
    }

    // Disegna drone verticalmente (moderno)
    drawDroneVertical(ctx, x, y, width, height, drone, droneIndex) {
        // Pannello drone moderno (grigio neutro)
        ThemeUtils.drawPanel(ctx, x, y, width, height, {
            background: ThemeConfig.colors.background.card,
            border: ThemeConfig.colors.border.primary,
            borderWidth: ThemeConfig.borders.width.normal,
            radius: ThemeConfig.borders.radius.md,
            blur: false
        });
        
        // Nome drone
        ThemeUtils.drawText(ctx, drone.name, x + 20, y + 20, {
            color: ThemeConfig.colors.text.primary,
            size: ThemeConfig.typography.sizes.base,
            weight: ThemeConfig.typography.weights.bold
        });
        
        
        // Slot del drone (layout: 1 icona drone a sinistra, slot equipaggiamento a destra)
        const slotSize = 50;
        const slotSpacing = 15;
        const slotStartX = x + 20;
        const slotStartY = y + 35; // Spostato più in alto
        
        // Layout specifico: icona drone a sinistra, slot equipaggiamento a destra
        const droneIconX = slotStartX;
        const droneIconY = slotStartY;
        const equipSlotsX = x + width - 150; // Posizionato a destra con più spazio
        const equipSlotsY = slotStartY;
        
        // Disegna icona drone (slot 0 - sempre vuoto, per futura immagine)
        ThemeUtils.drawPanel(ctx, droneIconX, droneIconY, slotSize, slotSize, {
            background: ThemeConfig.colors.background.tertiary,
            border: ThemeConfig.colors.border.primary,
            borderWidth: ThemeConfig.borders.width.thin,
            radius: ThemeConfig.borders.radius.sm,
            blur: false
        });
        
        // Disegna slot equipaggiamento (slot 0+) - layout orizzontale usando sistema unificato
        for (let i = 0; i < drone.slots; i++) {
            const slotX = equipSlotsX + i * (slotSize + slotSpacing);
            const slotY = equipSlotsY;
            
            const item = drone.equippedItems && drone.equippedItems[i] ? drone.equippedItems[i] : null;
            const slotName = `D${i + 1}`; // Nome slot drone (1-based per display)
            
            // Usa lo stesso sistema dell'equipaggiamento principale
            this.drawEquipmentSlot(ctx, slotX, slotY, item, slotName);
        }
    }
    
    // Disegna scrollbar moderna per UAV
    drawModernScrollbar(ctx, x, y, width, height, maxScroll) {
        const scrollbarWidth = 8;
        const scrollbarX = x + width - scrollbarWidth - 5;
        const scrollbarY = y + 5;
        const scrollbarHeight = height - 10;
        
        // Sfondo scrollbar (trasparente)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(scrollbarX, scrollbarY, scrollbarWidth, scrollbarHeight);
        
        // Calcola dimensioni e posizione della barra di scroll
        const thumbHeight = Math.max(20, (scrollbarHeight * scrollbarHeight) / (scrollbarHeight + maxScroll));
        const thumbY = scrollbarY + (this.uavScrollY / maxScroll) * (scrollbarHeight - thumbHeight);
        
        // Barra di scroll (thumb)
        const gradient = ctx.createLinearGradient(scrollbarX, thumbY, scrollbarX, thumbY + thumbHeight);
        gradient.addColorStop(0, ThemeConfig.colors.accent.primary);
        gradient.addColorStop(1, ThemeConfig.colors.accent.secondary);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(scrollbarX, thumbY, scrollbarWidth, thumbHeight);
        
        // Bordo della barra di scroll
        ctx.strokeStyle = ThemeConfig.colors.border.glass;
        ctx.lineWidth = 1;
        ctx.strokeRect(scrollbarX, thumbY, scrollbarWidth, thumbHeight);
        
        // Effetto glow selezionato
        if (this.isDraggingUAV) {
            ctx.shadowColor = ThemeConfig.colors.accent.primary;
            ctx.shadowBlur = 10;
            ctx.fillStyle = 'rgba(0, 245, 255, 0.3)';
            ctx.fillRect(scrollbarX - 2, thumbY - 2, scrollbarWidth + 4, thumbHeight + 4);
            ctx.shadowBlur = 0;
        }
    }
    

    // Metodo drawUAVInventory rimosso - ora usiamo drawInventory per entrambe le tab
    
    // Metodo drawEquippedDrone rimosso - ora usiamo drawDroneVertical
    
    // Metodo drawDroneSlot rimosso - ora usiamo ThemeUtils.drawPanel
    
    // Disegna equipaggiamento
    drawEquipment(ctx) {
        const equipmentY = this.panelY + 200;
        const equipmentX = this.panelX + 50;
        const slotSpacing = 65; // Slot equipaggiamento più compatti
        
        // Titolo equipaggiamento rimosso per pulizia
        
                // Disegna slot laser
        ThemeUtils.drawText(ctx, 'LASER', equipmentX, equipmentY - 10, {
            color: ThemeConfig.colors.accent.warning,
            size: ThemeConfig.typography.sizes.base,
            weight: ThemeConfig.typography.weights.bold
        }); // Ancora più spazio dal titolo
        
        for (let i = 0; i < 3; i++) {
            const slotX = equipmentX + (i * slotSpacing);
            this.drawEquipmentSlot(ctx, slotX, equipmentY + 10, this.equipment.laser[i], `L${i+1}`); // Allineato con il nuovo titolo
        }
        
        // Disegna slot scudi/generatori
        const shieldGenY = equipmentY + 150; // Spazio ottimizzato
        ThemeUtils.drawText(ctx, 'SCUDI/GENERATORI', equipmentX, shieldGenY - 15, {
            color: ThemeConfig.colors.accent.info,
            size: ThemeConfig.typography.sizes.base,
            weight: ThemeConfig.typography.weights.bold
        });
        
        for (let i = 0; i < 6; i++) {
            const slotX = equipmentX + (i * slotSpacing);
            let slotName = '';
            if (i < 3) {
                slotName = `S${i+1}`;
                } else {
                slotName = `G${i-2}`;
            }
            this.drawEquipmentSlot(ctx, slotX, shieldGenY, this.equipment.shieldGen[i], slotName);
        }
        
        // Disegna slot extra
        const extraY = equipmentY + 300; // Spazio ottimizzato
        ThemeUtils.drawText(ctx, 'EXTRA', equipmentX, extraY - 15, {
            color: ThemeConfig.colors.accent.success,
            size: ThemeConfig.typography.sizes.base,
            weight: ThemeConfig.typography.weights.bold
        });
        
        for (let i = 0; i < 3; i++) {
            const slotX = equipmentX + (i * slotSpacing);
            this.drawEquipmentSlot(ctx, slotX, extraY, this.equipment.extra[i], `E${i+1}`);
        }
    }
    
        // Disegna singolo slot di equipaggiamento
    drawEquipmentSlot(ctx, x, y, item, slotName) {
        if (item) {
            // Colore bordo basato sul tipo
            let borderColor = ThemeConfig.colors.border.primary;
            if (item.type === 'laser') borderColor = ThemeConfig.colors.accent.danger;
            else if (item.type === 'shield') borderColor = ThemeConfig.colors.accent.info;
            else if (item.type === 'generator') borderColor = ThemeConfig.colors.accent.success; // Verde per generatori
            else if (item.type === 'extra') borderColor = ThemeConfig.colors.accent.success;
            
            // Slot con oggetto moderno
            ThemeUtils.drawPanel(ctx, x, y, this.slotSize, this.slotSize, {
                background: ThemeConfig.colors.background.card,
                border: borderColor,
                borderWidth: ThemeConfig.borders.width.normal,
                radius: ThemeConfig.borders.radius.md,
                blur: false,
                glow: borderColor
            });
            
            // Disegna immagine per tipi N3, altrimenti testo
            if (this.shouldShowImage(item)) {
                this.drawItemImage(ctx, x, y, item);
            } else {
            // Nome oggetto DENTRO il quadrato
                ThemeUtils.drawText(ctx, item.name, x + this.slotSize / 2, y + this.slotSize / 2 + 4, {
                    color: ThemeConfig.colors.text.primary,
                    size: ThemeConfig.typography.sizes.sm,
                    weight: ThemeConfig.typography.weights.bold,
                    align: 'center',
                    baseline: 'middle'
                });
            }
                } else {
            // Slot vuoto moderno
            ThemeUtils.drawPanel(ctx, x, y, this.slotSize, this.slotSize, {
                background: ThemeConfig.colors.background.tertiary,
                border: ThemeConfig.colors.border.primary,
                borderWidth: ThemeConfig.borders.width.thin,
                radius: ThemeConfig.borders.radius.md,
                blur: false
            });
            
            // Nome slot DENTRO il quadrato
            ThemeUtils.drawText(ctx, slotName, x + this.slotSize / 2, y + this.slotSize / 2 + 4, {
                color: ThemeConfig.colors.text.muted,
                size: ThemeConfig.typography.sizes.sm,
                weight: ThemeConfig.typography.weights.bold,
                align: 'center',
                baseline: 'middle'
            });
        }
    }
    
    // Determina se mostrare l'immagine per un oggetto
    shouldShowImage(item) {
        if (!item) return false;
        
        // Mostra immagine solo per tipi N3
        const isLaser3 = item.type === 'laser' && item.name && item.name.toLowerCase().includes('3');
        const isShield3 = item.type === 'shield' && item.name && item.name.toLowerCase().includes('3');
        const isGen3 = item.type === 'generator' && item.name && item.name.toLowerCase().includes('3');
        
        return (isLaser3 && this.equipImages.laser3) || 
               (isShield3 && this.equipImages.shield3) || 
               (isGen3 && this.equipImages.gen3);
    }
    
    // Disegna l'immagine dell'oggetto
    drawItemImage(ctx, x, y, item, slotSize = null) {
        let image = null;
        
        // Determina quale immagine usare
        if (item.type === 'laser' && item.name && item.name.toLowerCase().includes('3')) {
            image = this.equipImages.laser3;
        } else if (item.type === 'shield' && item.name && item.name.toLowerCase().includes('3')) {
            image = this.equipImages.shield3;
        } else if (item.type === 'generator' && item.name && item.name.toLowerCase().includes('3')) {
            image = this.equipImages.gen3;
        }
        
        if (image && image.complete) {
            // Usa la dimensione dello slot passata o quella di default
            const currentSlotSize = slotSize || this.slotSize;
            const padding = 8;
            const imageSize = currentSlotSize - (padding * 2);
            const imageX = x + padding;
            const imageY = y + padding;
            
            // Disegna l'immagine
            ctx.drawImage(image, imageX, imageY, imageSize, imageSize);
        } else {
            // Fallback al testo se l'immagine non è caricata
            const currentSlotSize = slotSize || this.slotSize;
            ThemeUtils.drawText(ctx, item.name, x + currentSlotSize / 2, y + currentSlotSize / 2 + 4, {
                color: ThemeConfig.colors.text.primary,
                size: ThemeConfig.typography.sizes.sm,
                weight: ThemeConfig.typography.weights.bold,
                align: 'center',
                baseline: 'middle'
            });
        }
    }
    
    // Disegna inventario
    drawInventory(ctx) {
        const inventoryY = this.panelY + 160;
        const inventoryX = this.panelX + 600; // Posizionato a destra
        const itemsPerRow = 6; // Più oggetti per riga
        const slotSize = 60; // Slot più grandi
        const slotSpacing = 10;
        
        // Titolo inventario rimosso per pulizia
        
        // Disegna oggetti
        for (let i = 0; i < this.items.length; i++) {
            const itemX = inventoryX + (i % itemsPerRow) * (slotSize + slotSpacing);
            const itemY = inventoryY + Math.floor(i / itemsPerRow) * (slotSize + slotSpacing);
            
            const item = this.items[i];
            
            // Colore basato sul tipo usando il tema
            let itemColor = ThemeConfig.colors.border.primary;
            if (item.type === 'purchase') {
                itemColor = ThemeConfig.colors.accent.warning; // Oro
            } else if (item.type === 'laser') itemColor = ThemeConfig.colors.accent.danger;
            else if (item.type === 'shield') itemColor = ThemeConfig.colors.accent.info;
            else if (item.type === 'generator') itemColor = ThemeConfig.colors.accent.success; // Verde per generatori
            else if (item.type === 'extra') itemColor = ThemeConfig.colors.accent.success;
            
            // Disegna slot moderna (senza blur)
            ThemeUtils.drawPanel(ctx, itemX, itemY, slotSize, slotSize, {
                background: ThemeConfig.colors.background.card,
                border: itemColor,
                borderWidth: ThemeConfig.borders.width.normal,
                radius: ThemeConfig.borders.radius.md,
                blur: false,
                glow: itemColor === ThemeConfig.colors.accent.warning ? ThemeConfig.colors.accent.warning : null
            });
            
            // Disegna immagine per tipi N3, altrimenti testo
            if (this.shouldShowImage(item)) {
                this.drawItemImage(ctx, itemX, itemY, item, slotSize);
            } else {
                // Nome oggetto
            let displayText = item.name;
            if (item.type === 'purchase' && item.amount > 1) {
                displayText = `${item.name} x${item.amount}`;
            }
            
                ThemeUtils.drawText(ctx, displayText, itemX + slotSize / 2, itemY + slotSize / 2, {
                    color: item.type === 'purchase' ? ThemeConfig.colors.text.accent : ThemeConfig.colors.text.primary,
                    size: ThemeConfig.typography.sizes.sm,
                    weight: ThemeConfig.typography.weights.semibold,
                    align: 'center',
                    baseline: 'middle',
                    glow: item.type === 'purchase'
                });
            }
        }
        
        // Disegna slot vuoti per completare la griglia (sempre 15 slot)
        const totalSlots = 15;
        for (let i = this.items.length; i < totalSlots; i++) {
            const itemX = inventoryX + (i % itemsPerRow) * (slotSize + slotSpacing);
            const itemY = inventoryY + Math.floor(i / itemsPerRow) * (slotSize + slotSpacing);
            
            // Slot vuoto moderno
            ThemeUtils.drawPanel(ctx, itemX, itemY, slotSize, slotSize, {
                background: ThemeConfig.colors.background.tertiary,
                border: ThemeConfig.colors.border.primary,
                borderWidth: ThemeConfig.borders.width.thin,
                radius: ThemeConfig.borders.radius.md,
                blur: false
            });
        }
    }
    
    // Disegna popup
    drawPopup(ctx) {
        if (!this.popup) return;
        
        // Calcola posizione del popup (centrato e più in basso)
        const popupWidth = 450;
        const popupHeight = 60;
        const popupX = this.panelX + (this.panelWidth - popupWidth) / 2;
        const popupY = this.panelY + (this.panelHeight - popupHeight) / 2 + 50; // 50px più in basso
        
        // Colore basato sul tipo
        let bgColor = '#333333';
        let textColor = '#ffffff';
        let borderColor = '#666666';
        
        if (this.popup.type === 'success') {
            bgColor = '#2d5a2d';
            borderColor = '#4caf50';
            textColor = '#ffffff';
        } else if (this.popup.type === 'error') {
            bgColor = '#5a2d2d';
            borderColor = '#f44336';
            textColor = '#ffffff';
        } else if (this.popup.type === 'info') {
            bgColor = '#2d3d5a';
            borderColor = '#2196f3';
            textColor = '#ffffff';
        }
        
        // Sfondo popup
        ctx.fillStyle = bgColor;
        ctx.fillRect(popupX, popupY, popupWidth, popupHeight);
        
        // Bordo popup
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(popupX, popupY, popupWidth, popupHeight);
        
        // Testo popup
        ctx.fillStyle = textColor;
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.popup.message, popupX + popupWidth / 2, popupY + popupHeight / 2 + 5);
    }
    
    // Disegna tooltip
    drawTooltip(ctx) {
        if (!this.tooltip) return;
        
        const item = this.tooltip.item;
        const tooltipX = this.tooltip.x + this.slotSize + 10;
        const tooltipY = this.tooltip.y;
        
        // Calcola dimensioni del tooltip
        const padding = 10;
        const lineHeight = 16;
        const lines = [
            item.name,
            `Tipo: ${item.type}`,
            ...Object.entries(item.stats).map(([key, value]) => `${key}: ${value}`)
        ];
        
        const maxWidth = Math.max(...lines.map(line => ctx.measureText(line).width));
        const tooltipWidth = maxWidth + (padding * 2);
        const tooltipHeight = (lines.length * lineHeight) + (padding * 2);
        
        // Sfondo tooltip
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);
        
        // Bordo tooltip
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);
        
        // Testo tooltip
            ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const y = tooltipY + padding + (i * lineHeight) + 12;
            
            // Colore diverso per il nome
            if (i === 0) {
                ctx.fillStyle = '#ffff00'; // Giallo per il nome
            } else if (i === 1) {
                ctx.fillStyle = '#00ffff'; // Ciano per il tipo
            } else {
                ctx.fillStyle = '#ffffff'; // Bianco per le statistiche
            }
            
            ctx.fillText(line, tooltipX + padding, y);
        }
    }
}
