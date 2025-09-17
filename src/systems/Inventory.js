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

        // Oggetto selezionato per equipaggiamento su drone
        this.selectedItemForDrone = null;
        
        // Scroll per droni UAV
        this.uavScrollY = 0;
        this.uavItemHeight = 80; // Altezza di ogni drone
        
        // Prevenzione click multipli
        this.lastEquipTime = 0;
        this.equipCooldown = 100; // 100ms di cooldown
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
                    
                    this.showPopup(`${item.name} equipaggiato su ${drone.name}!`, 'success');
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
                this.showPopup(`${item.name} rimosso da ${drone.name}`, 'info');
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
                window.gameInstance.ship.unequipLaser(item.key, 1);
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
        
        // Controlla se il mouse è sopra un oggetto per il tooltip
        if (this.currentTab === 'equipment') {
            this.checkTooltip(x, y);
        }
    }
    
    // Gestisci scroll per UAV
    handleUAVScroll(deltaY) {
        if (this.currentTab !== 'uav') return;
        
        const scrollSpeed = 20;
        this.uavScrollY -= deltaY * scrollSpeed;
        
        // Limita lo scroll
        const maxScroll = Math.max(0, (this.equipment.uav.length * this.uavItemHeight) - 400);
        this.uavScrollY = Math.max(0, Math.min(this.uavScrollY, maxScroll));
        
        // Controlla hover sugli oggetti equipaggiati
        this.checkEquipmentHover(x, y);
        
        // Controlla hover sugli oggetti dell'inventario
        this.checkInventoryHover(x, y);
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
        
        // Controlla se il click è dentro il pannello
        if (x < this.panelX || x > this.panelX + this.panelWidth ||
            y < this.panelY || y > this.panelY + this.panelHeight) {
            return false;
        }
        
        // Riproduci suono click solo per interfaccia
        if (window.gameInstance && window.gameInstance.audioManager) {
            window.gameInstance.audioManager.playClickSound();
        }
        
        // Controlla click su tab
        if (this.handleTabClick(x, y)) {
            return true;
        }
        
        // Gestisci click sugli slot di equipaggiamento
        this.handleEquipmentClick(x, y);
        
        // Gestisci click sui droni UAV se siamo nella tab UAV
        if (this.currentTab === 'uav') {
            this.handleUAVClick(x, y);
        }
        
        // Gestisci click sull'inventario
        this.handleInventoryClick(x, y);
        
        return true;
    }
    
    // Gestisci click su tab
    handleTabClick(x, y) {
        const tabHeight = 40;
        const tabY = this.panelY + 60;
        const tabWidth = this.panelWidth / this.tabs.length;
        
        // Controlla se il click è nell'area delle tab
        if (y >= tabY && y <= tabY + tabHeight) {
            this.tabs.forEach((tab, index) => {
                const tabX = this.panelX + index * tabWidth;
                if (x >= tabX && x <= tabX + tabWidth) {
                    this.currentTab = tab.id;
                    return true;
                }
            });
        }
        return false;
    }
    
    // Gestisci click sui droni UAV
    handleUAVClick(x, y) {
        const uavY = this.panelY + 120;
        const uavX = this.panelX + 50;
        const droneAreaWidth = 300;
        const droneAreaHeight = 400;

        // Assicurati che equipment.uav sia inizializzato
        if (!this.equipment.uav) {
            this.equipment.uav = [];
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

                // Click sui slot del drone
                const slotSize = 30;
                const slotSpacing = 5;
                const slotStartX = droneX + 10;
                const slotY = droneY + 35;

                for (let slotIndex = 0; slotIndex < drone.slots; slotIndex++) {
                    const slotX = slotStartX + slotIndex * (slotSize + slotSpacing);

                    if (x >= slotX && x <= slotX + slotSize &&
                        y >= slotY && y <= slotY + slotSize) {

                        // Se c'è un oggetto equipaggiato, rimuovilo
                        if (drone.equippedItems && drone.equippedItems[slotIndex]) {
                            console.log(`🚁 Click su slot equipaggiato: drone ${droneIndex}, slot ${slotIndex}`);
                            this.unequipItemFromDrone(droneIndex, slotIndex);
                        }
                        // Altrimenti mostra messaggio per equipaggiare dall'inventario
                        else {
                            console.log(`🚁 Click su slot vuoto: drone ${droneIndex}, slot ${slotIndex}`);
                            this.showPopup('Click su un oggetto dell\'inventario per equipaggiarlo', 'info');
                        }
                        return true;
                    }
                }
            }
        });

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
                    this.showPopup(`${item.name} equipaggiato su ${drone.name}!`, 'success');
                } else {
                    this.showPopup('I droni possono equipaggiare solo laser o scudi', 'error');
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
            // Bonus danno per laser sui droni
            const damage = item.damage || item.stats?.damage || 0;
            ship.droneDamageBonus += damage;
            
            console.log(`🚁 Drone ${drone.name}: +${damage} danno da ${item.name}`);
        } else if (item.type === 'shield') {
            // Bonus protezione per scudi sui droni
            const protection = item.protection || item.stats?.protection || 0;
            ship.droneShieldBonus += protection;
            
            console.log(`🚁 Drone ${drone.name}: +${protection} protezione da ${item.name}`);
        }
    }
    
    // Gestisci click sugli slot di equipaggiamento
    handleEquipmentClick(x, y) {
        const equipmentY = this.panelY + 80;
        const equipmentX = this.panelX + 50;
        const slotSpacing = 65; // Slot equipaggiamento più compatti
        
        // Controlla click su slot laser
        for (let i = 0; i < 3; i++) {
            const slotX = equipmentX + (i * slotSpacing);
            if (x >= slotX && x <= slotX + this.slotSize &&
                y >= equipmentY + 40 && y <= equipmentY + 40 + this.slotSize) {
                
                if (this.equipment.laser[i]) {
                    const item = this.unequipItem('laser', i);
                    if (item) {
                        this.showPopup(`${item.name} rimosso dall'equipaggiamento`, 'info');
                    }
                }
                // Non auto-equipaggiare su slot vuoti
                return;
            }
        }
        
        // Controlla click su slot scudi/generatori (6 slot totali)
        const shieldGenY = equipmentY + 180; // Allineato con il rendering
        
        // Tutti gli slot scudi/generatori
        for (let i = 0; i < 6; i++) {
            const slotX = equipmentX + (i * slotSpacing);
            if (x >= slotX && x <= slotX + this.slotSize &&
                y >= shieldGenY && y <= shieldGenY + this.slotSize) {
                
                if (this.equipment.shieldGen[i]) {
                    console.log('🔄 Disequipaggio slot shieldGen:', i);
                    const item = this.unequipItem('shieldGen', i);
                    if (item) {
                        console.log('✅ Item disequipaggiato:', item);
                        this.showPopup(`${item.name} rimosso dall'equipaggiamento`, 'info');
                    }
                }
                // Non auto-equipaggiare su slot vuoti
                return;
            }
        }
        
        // Controlla click su slot extra
        const extraY = equipmentY + 160;
        for (let i = 0; i < 3; i++) {
            const slotX = equipmentX + (i * slotSpacing);
            if (x >= slotX && x <= slotX + this.slotSize &&
                y >= extraY && y <= extraY + this.slotSize) {
                
                if (this.equipment.extra[i]) {
                    const item = this.unequipItem('extra', i);
                    if (item) {
                        this.showPopup(`${item.name} rimosso dall'equipaggiamento`, 'info');
                    }
                }
                // Non auto-equipaggiare su slot vuoti
                return;
            }
        }
    }
    
    // Controlla hover sugli oggetti equipaggiati
    checkEquipmentHover(x, y) {
        const equipmentY = this.panelY + 80;
        const equipmentX = this.panelX + 50;
        const slotSpacing = 65; // Slot equipaggiamento più compatti
        
        // Controlla hover su slot laser
        for (let i = 0; i < 3; i++) {
            const slotX = equipmentX + (i * slotSpacing);
            if (x >= slotX && x <= slotX + this.slotSize &&
                y >= equipmentY + 40 && y <= equipmentY + 40 + this.slotSize) {
                
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
        
                // Controlla hover su slot scudi/generatori (2 righe)
        const shieldGenY1 = equipmentY + 80;  // Prima riga
        const shieldGenY2 = equipmentY + 120; // Seconda riga
        
        // Prima riga (slot 0, 1, 2)
        for (let i = 0; i < 3; i++) {
            const slotX = equipmentX + (i * slotSpacing);
            if (x >= slotX && x <= slotX + this.slotSize &&
                y >= shieldGenY1 && y <= shieldGenY1 + this.slotSize) {
                
                if (this.equipment.shieldGen[i]) {
                    this.tooltip = {
                        item: this.equipment.shieldGen[i],
                        x: slotX,
                        y: shieldGenY1
                    };
                } else {
                    this.tooltip = null;
                }
                return;
            }
        }
        
        // Seconda riga (slot 3, 4, 5)
        for (let i = 3; i < 6; i++) {
            const slotX = equipmentX + ((i - 3) * slotSpacing);
            if (x >= slotX && x <= slotX + this.slotSize &&
                y >= shieldGenY2 && y <= shieldGenY2 + this.slotSize) {
                
                if (this.equipment.shieldGen[i]) {
                    this.tooltip = {
                        item: this.equipment.shieldGen[i],
                        x: slotX,
                        y: shieldGenY2
                    };
                } else {
                    this.tooltip = null;
                }
                return;
            }
        }
        
        // Controlla hover su slot extra
        const extraY = equipmentY + 160;
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
        const inventoryY = this.panelY + 80;
        const inventoryX = this.panelX + 650; // Posizionato molto più a destra
        const itemsPerRow = 5;
        
        for (let i = 0; i < this.items.length; i++) {
            const itemX = inventoryX + (i % itemsPerRow) * (this.slotSize + this.slotSpacing);
            const itemY = inventoryY + Math.floor(i / itemsPerRow) * (this.slotSize + this.slotSpacing);
            
            if (x >= itemX && x <= itemX + this.slotSize &&
                y >= itemY && y <= itemY + this.slotSize) {
                
                // Equipaggia automaticamente l'oggetto se possibile
                this.autoEquipItem(i);
                return;
            }
        }
    }
    
    // Equipaggia automaticamente un oggetto
    autoEquipItem(itemIndex) {
        const item = this.items[itemIndex];
        if (!item) return;
        
        // Trova il primo slot vuoto appropriato
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
            this.showPopup(`${item.name} equipaggiato!`, 'success');
        } else {
            // Determina il motivo per cui non può essere equipaggiato
            let reason = '';
            if (item.type === 'laser') reason = 'Tutti gli slot laser sono occupati';
            else if (item.type === 'shield' || item.type === 'generator') reason = 'Tutti gli slot scudi/generatori sono occupati';
            else if (item.type === 'extra') reason = 'Tutti gli slot extra sono occupati';
            
            this.showPopup(`Impossibile equipaggiare ${item.name}: ${reason}`, 'error');
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
        
        // Sfondo del pannello
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(this.panelX, this.panelY, this.panelWidth, this.panelHeight);
        
        // Bordo del pannello
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.panelX, this.panelY, this.panelWidth, this.panelHeight);
        
        // Titolo
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('INVENTARIO', this.panelX + this.panelWidth / 2, this.panelY + 40);
        
        // Disegna tab
        this.drawTabs(ctx);
        
        // Disegna contenuto basato sulla tab corrente
        if (this.currentTab === 'equipment') {
            this.drawEquipment(ctx);
            this.drawInventory(ctx);
        } else if (this.currentTab === 'uav') {
            this.drawUAV(ctx);
        }
        
        // Istruzioni
        ctx.fillStyle = '#cccccc';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Click su oggetti per equipaggiare automaticamente', this.panelX + this.panelWidth / 2, this.panelY + this.panelHeight - 20);
        
        // Disegna popup
        this.drawPopup(ctx);
        
        // Disegna tooltip
        this.drawTooltip(ctx);
    }
    
    // Disegna le tab
    drawTabs(ctx) {
        const tabHeight = 40;
        const tabY = this.panelY + 60;
        const tabWidth = this.panelWidth / this.tabs.length;
        
        this.tabs.forEach((tab, index) => {
            const tabX = this.panelX + index * tabWidth;
            const isActive = this.currentTab === tab.id;
            
            // Sfondo tab
            ctx.fillStyle = isActive ? tab.color : '#333333';
            ctx.fillRect(tabX, tabY, tabWidth, tabHeight);
            
            // Bordo tab
            ctx.strokeStyle = isActive ? '#ffffff' : '#666666';
            ctx.lineWidth = 2;
            ctx.strokeRect(tabX, tabY, tabWidth, tabHeight);
            
            // Testo tab
            ctx.fillStyle = isActive ? '#ffffff' : '#cccccc';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(tab.name, tabX + tabWidth / 2, tabY + 25);
        });
    }
    
    // Disegna sezione UAV
    drawUAV(ctx) {
        const uavY = this.panelY + 120;
        const uavX = this.panelX + 50;
        
        // Assicurati che equipment.uav sia inizializzato
        if (!this.equipment.uav) {
            this.equipment.uav = [];
        }
        
        // Titolo UAV con contatore
        ctx.fillStyle = '#ff6b6b';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`DRONI UAV (${this.equipment.uav.length}/8)`, uavX, uavY - 20);
        
        // Area droni con scroll
        const droneAreaWidth = 300;
        const droneAreaHeight = 400;
        const droneAreaX = uavX;
        const droneAreaY = uavY;
        
        // Sfondo area droni
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(droneAreaX, droneAreaY, droneAreaWidth, droneAreaHeight);
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 2;
        ctx.strokeRect(droneAreaX, droneAreaY, droneAreaWidth, droneAreaHeight);
        
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
        
        // Scrollbar se necessario
        if (maxScroll > 0) {
            this.drawUAVScrollbar(ctx, droneAreaX + droneAreaWidth - 10, droneAreaY, 10, droneAreaHeight, maxScroll);
        }
        
        // Inventario del player a destra
        this.drawUAVInventory(ctx, uavX + droneAreaWidth + 20, uavY - 20);
        
        // Informazioni UAV
        ctx.fillStyle = '#cccccc';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('I droni UAV possono equipaggiare laser o scudi', uavX, uavY + droneAreaHeight + 20);
        ctx.fillText('Flax: 1 slot | Iris: 2 slot', uavX, uavY + droneAreaHeight + 40);
        ctx.fillText('Massimo 8 droni totali (Flax + Iris)', uavX, uavY + droneAreaHeight + 60);
        ctx.fillText('I droni acquistati sono permanenti', uavX, uavY + droneAreaHeight + 80);
        ctx.fillText('Click su oggetti per equipaggiare automaticamente', uavX, uavY + droneAreaHeight + 100);
    }

    // Disegna drone verticalmente
    drawDroneVertical(ctx, x, y, width, height, drone, droneIndex) {
        // Sfondo drone
        ctx.fillStyle = '#333333';
        ctx.fillRect(x, y, width, height);
        
        // Bordo drone
        ctx.strokeStyle = drone.color || '#ff6b6b';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        
        // Nome drone
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(drone.name, x + 10, y + 20);
        
        // Icona drone
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Arial';
        ctx.fillText('🚁', x + width - 30, y + 20);
        
        // Slot del drone
        const slotSize = 30;
        const slotSpacing = 5;
        const slotStartX = x + 10;
        const slotY = y + 35;
        
        for (let i = 0; i < drone.slots; i++) {
            const slotX = slotStartX + i * (slotSize + slotSpacing);
            
            // Slot
            ctx.fillStyle = drone.equippedItems && drone.equippedItems[i] ? '#444444' : '#222222';
            ctx.fillRect(slotX, slotY, slotSize, slotSize);
            
            // Bordo slot
            ctx.strokeStyle = drone.equippedItems && drone.equippedItems[i] ? '#ffffff' : '#666666';
            ctx.lineWidth = 1;
            ctx.strokeRect(slotX, slotY, slotSize, slotSize);
            
            // Icona oggetto equipaggiato
            if (drone.equippedItems && drone.equippedItems[i]) {
                ctx.fillStyle = '#ffffff';
                ctx.font = '16px Arial';
                ctx.textAlign = 'center';
                
                const item = drone.equippedItems[i];
                if (item.type === 'laser') {
                    ctx.fillText('⚡', slotX + slotSize/2, slotY + slotSize/2 + 5);
                } else if (item.type === 'shield') {
                    ctx.fillText('🛡️', slotX + slotSize/2, slotY + slotSize/2 + 5);
                }
                ctx.textAlign = 'left';
            }
        }
    }
    
    // Disegna scrollbar per UAV
    drawUAVScrollbar(ctx, x, y, width, height, maxScroll) {
        // Sfondo scrollbar
        ctx.fillStyle = '#333333';
        ctx.fillRect(x, y, width, height);
        
        // Barra di scroll
        const scrollbarHeight = Math.max(20, (height * height) / (height + maxScroll));
        const scrollbarY = y + (this.uavScrollY / maxScroll) * (height - scrollbarHeight);
        
        ctx.fillStyle = '#666666';
        ctx.fillRect(x, scrollbarY, width, scrollbarHeight);
        
        // Bordo scrollbar
        ctx.strokeStyle = '#999999';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, scrollbarY, width, scrollbarHeight);
    }

    // Disegna inventario del player per UAV
    drawUAVInventory(ctx, x, y) {
        // Titolo inventario
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('INVENTARIO PLAYER', x, y);

        // Filtra solo laser e scudi
        const availableItems = this.items.filter(item => 
            item.type === 'laser' || item.type === 'shield'
        );

        if (availableItems.length === 0) {
            ctx.fillStyle = '#888888';
            ctx.font = '14px Arial';
            ctx.fillText('Nessun laser o scudo disponibile', x, y + 30);
            return;
        }

        // Disegna oggetti disponibili
        const itemSize = 50;
        const itemsPerRow = 4;
        let itemX = x;
        let itemY = y + 30;

        availableItems.forEach((item, index) => {
            if (index > 0 && index % itemsPerRow === 0) {
                itemX = x;
                itemY += itemSize + 10;
            }

            // Slot oggetto
            ctx.fillStyle = '#333333';
            ctx.fillRect(itemX, itemY, itemSize, itemSize);

            // Bordo oggetto (evidenzia se selezionato)
            const isSelected = this.selectedItemForDrone === item;
            ctx.strokeStyle = isSelected ? '#ffd700' : (item.type === 'laser' ? '#4a90e2' : '#50c878');
            ctx.lineWidth = isSelected ? 3 : 2;
            ctx.strokeRect(itemX, itemY, itemSize, itemSize);

            // Icona oggetto
            ctx.fillStyle = '#ffffff';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(item.type === 'laser' ? '⚡' : '🛡️', itemX + itemSize/2, itemY + itemSize/2 + 7);
            ctx.textAlign = 'left';

            // Nome oggetto
            ctx.fillStyle = isSelected ? '#ffd700' : '#ffffff';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(item.name, itemX + itemSize/2, itemY + itemSize + 15);
            ctx.textAlign = 'left';

            itemX += itemSize + 10;
        });
    }
    
    // Disegna drone equipaggiato con i suoi slot
    drawEquippedDrone(ctx, x, y, drone, droneIndex) {
        const droneWidth = this.slotSize * 2 + 10; // Larghezza per 2 slot + spazio
        const droneHeight = this.slotSize + 40; // Altezza slot + spazio per nome
        
        // Sfondo drone
        ctx.fillStyle = '#333333';
        ctx.fillRect(x, y, droneWidth, droneHeight);
        
        // Bordo drone
        ctx.strokeStyle = drone.color || '#ff6b6b';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, droneWidth, droneHeight);
        
        // Nome drone
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(drone.name, x + droneWidth / 2, y - 5);
        
        // Icona drone
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Arial';
        ctx.fillText('🚁', x + droneWidth / 2, y + 15);
        
        // Disegna slot del drone
        for (let i = 0; i < drone.slots; i++) {
            const slotX = x + 5 + i * (this.slotSize + 5);
            const slotY = y + 5;
            this.drawDroneSlot(ctx, slotX, slotY, drone.equippedItems ? drone.equippedItems[i] : null, droneIndex, i);
        }
    }
    
    // Disegna singolo slot del drone
    drawDroneSlot(ctx, x, y, item, droneIndex, slotIndex) {
        // Slot
        ctx.fillStyle = item ? '#444444' : '#222222';
        ctx.fillRect(x, y, this.slotSize, this.slotSize);
        
        // Bordo slot
        ctx.strokeStyle = item ? '#ffffff' : '#666666';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, this.slotSize, this.slotSize);
        
        if (item) {
            // Icona oggetto
            ctx.fillStyle = '#ffffff';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            
            if (item.type === 'laser') {
                ctx.fillText('⚡', x + this.slotSize / 2, y + this.slotSize / 2 + 5);
            } else if (item.type === 'shield') {
                ctx.fillText('🛡️', x + this.slotSize / 2, y + this.slotSize / 2 + 5);
            }
            
            ctx.textAlign = 'left';
        }
    }
    
    // Disegna equipaggiamento
    drawEquipment(ctx) {
        const equipmentY = this.panelY + 80;
        const equipmentX = this.panelX + 50;
        const slotSpacing = 65; // Slot equipaggiamento più compatti
        
        // Titolo equipaggiamento
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'left';
        ctx.fillText('EQUIPAGGIAMENTO', equipmentX, equipmentY - 20);
        
                // Disegna slot laser
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'left';
        ctx.fillText('LASER', equipmentX, equipmentY + 20); // Ancora più spazio dal titolo
        
        for (let i = 0; i < 3; i++) {
            const slotX = equipmentX + (i * slotSpacing);
            this.drawEquipmentSlot(ctx, slotX, equipmentY + 40, this.equipment.laser[i], `L${i+1}`); // Allineato con il nuovo titolo
        }
        
        // Disegna slot scudi/generatori
        const shieldGenY = equipmentY + 180; // Molto più spazio verticale
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('SCUDI/GENERATORI', equipmentX, shieldGenY - 15); // Più spazio dal titolo
        
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
        const extraY = equipmentY + 360; // Molto più spazio verticale
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('EXTRA', equipmentX, extraY - 15); // Più spazio dal titolo
        
        for (let i = 0; i < 3; i++) {
            const slotX = equipmentX + (i * slotSpacing);
            this.drawEquipmentSlot(ctx, slotX, extraY, this.equipment.extra[i], `E${i+1}`);
        }
    }
    
        // Disegna singolo slot di equipaggiamento
    drawEquipmentSlot(ctx, x, y, item, slotName) {
        if (item) {
            // Slot con oggetto
            ctx.fillStyle = '#333333';
            ctx.fillRect(x, y, this.slotSize, this.slotSize);
            
            // Colore bordo basato sul tipo
            let borderColor = '#ffffff';
            if (item.type === 'laser') borderColor = '#ff6b6b';
            else if (item.type === 'shield') borderColor = '#4ecdc4';
            else if (item.type === 'generator') borderColor = '#45b7d1';
            else if (item.type === 'extra') borderColor = '#96ceb4';
            
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, this.slotSize, this.slotSize);
            
            // Nome oggetto DENTRO il quadrato
        ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
            ctx.fillText(item.name, x + this.slotSize / 2, y + this.slotSize / 2 + 4);
                } else {
                    // Slot vuoto
            ctx.fillStyle = '#222222';
            ctx.fillRect(x, y, this.slotSize, this.slotSize);
            ctx.strokeStyle = '#666666';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, this.slotSize, this.slotSize);
            
            // Nome slot DENTRO il quadrato
            ctx.fillStyle = '#888888';
            ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
            ctx.fillText(slotName, x + this.slotSize / 2, y + this.slotSize / 2 + 4);
        }
    }
    
    // Disegna inventario
    drawInventory(ctx) {
        const inventoryY = this.panelY + 80;
        const inventoryX = this.panelX + 650; // Posizionato molto più a destra
        const itemsPerRow = 5;
        
        // Titolo inventario
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`INVENTARIO (${this.items.length}/15)`, inventoryX, inventoryY - 20);
        
        // Disegna oggetti
        for (let i = 0; i < this.items.length; i++) {
            const itemX = inventoryX + (i % itemsPerRow) * (this.slotSize + this.slotSpacing);
            const itemY = inventoryY + Math.floor(i / itemsPerRow) * (this.slotSize + this.slotSpacing);
            
            const item = this.items[i];
            
            // Colore basato sul tipo
            let itemColor = '#ffffff';
            if (item.type === 'purchase') {
                // Acquisti reali - colore dorato
                itemColor = '#ffd700';
            } else if (item.type === 'laser') itemColor = '#ff6b6b';
            else if (item.type === 'shield') itemColor = '#4ecdc4';
            else if (item.type === 'generator') itemColor = '#45b7d1';
            else if (item.type === 'extra') itemColor = '#96ceb4';
            
            // Sfondo slot
            ctx.fillStyle = '#333333';
            ctx.fillRect(itemX, itemY, this.slotSize, this.slotSize);
            
            // Bordo
            ctx.strokeStyle = itemColor;
            ctx.lineWidth = 2;
            ctx.strokeRect(itemX, itemY, this.slotSize, this.slotSize);
            
                        // Nome oggetto DENTRO il quadrato
        ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px Arial';
                ctx.textAlign = 'center';
            
            // Per acquisti reali, mostra anche la quantità
            let displayText = item.name;
            if (item.type === 'purchase' && item.amount > 1) {
                displayText = `${item.name} x${item.amount}`;
            }
            
            ctx.fillText(displayText, itemX + this.slotSize / 2, itemY + this.slotSize / 2 + 3);
        }
        
        // Disegna slot vuoti
        const totalSlots = Math.min(15, Math.ceil(this.items.length / itemsPerRow) * itemsPerRow);
        for (let i = this.items.length; i < totalSlots; i++) {
            const itemX = inventoryX + (i % itemsPerRow) * (this.slotSize + this.slotSpacing);
            const itemY = inventoryY + Math.floor(i / itemsPerRow) * (this.slotSize + this.slotSpacing);
            
            // Slot vuoto
            ctx.fillStyle = '#222222';
            ctx.fillRect(itemX, itemY, this.slotSize, this.slotSize);
            ctx.strokeStyle = '#444444';
            ctx.lineWidth = 1;
            ctx.strokeRect(itemX, itemY, this.slotSize, this.slotSize);
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
