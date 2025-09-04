// Sistema Inventario Semplice
export class Inventory {
    constructor() {
        // Stato del pannello
        this.isOpen = false;
        
        // Hangar (equipaggiamento attivo) - 3 slot per categoria
        this.equipment = {
            laser: new Array(3).fill(null),      // 3 slot laser
            shieldGen: new Array(6).fill(null),  // 6 slot scudi/generatori (3+3)
            extra: new Array(3).fill(null)       // 3 slot extra
        };
        
        // Inventario (oggetti posseduti)
        this.items = [];
        this.maxItems = 50; // Massimo 50 oggetti nell'inventario
        
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
        if (this.items.length < this.maxItems) {
            this.items.push(item);
            return true;
        }
        return false; // Inventario pieno
    }
    
    // Rimuovi oggetto dall'inventario
    removeItem(index) {
        if (index >= 0 && index < this.items.length) {
            return this.items.splice(index, 1)[0];
        }
        return null;
    }
    
    // Equipaggia oggetto
    equipItem(itemIndex, slotType, slotIndex) {
        const item = this.removeItem(itemIndex);
        if (item && this.equipment[slotType][slotIndex] === null) {
            this.equipment[slotType][slotIndex] = item;
            return true;
        }
        // Se non può essere equipaggiato, rimetti nell'inventario
        if (item) {
            this.items.splice(itemIndex, 0, item);
        }
        return false;
    }
    
    // Rimuovi equipaggiamento
    unequipItem(slotType, slotIndex) {
        if (this.equipment[slotType][slotIndex]) {
            const item = this.equipment[slotType][slotIndex];
            this.equipment[slotType][slotIndex] = null;
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
        
        // Gestisci click sugli slot di equipaggiamento
        this.handleEquipmentClick(x, y);
        
        // Gestisci click sull'inventario
        this.handleInventoryClick(x, y);
        
        return true;
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
        
        // Controlla click su slot scudi/generatori (6 slot totali - 2 righe da 3)
        const shieldGenY1 = equipmentY + 80;  // Prima riga
        const shieldGenY2 = equipmentY + 120; // Seconda riga
        
        // Prima riga (slot 0, 1, 2)
        for (let i = 0; i < 3; i++) {
            const slotX = equipmentX + (i * slotSpacing);
            if (x >= slotX && x <= slotX + this.slotSize &&
                y >= shieldGenY1 && y <= shieldGenY1 + this.slotSize) {
                
                if (this.equipment.shieldGen[i]) {
                    const item = this.unequipItem('shieldGen', i);
                    if (item) {
                        this.showPopup(`${item.name} rimosso dall'equipaggiamento`, 'info');
                    }
                }
                // Non auto-equipaggiare su slot vuoti
                return;
            }
        }
        
        // Seconda riga (slot 3, 4, 5)
        for (let i = 3; i < 6; i++) {
            const slotX = equipmentX + ((i - 3) * slotSpacing);
            if (x >= slotX && x <= slotX + this.slotSize &&
                y >= shieldGenY2 && y <= shieldGenY2 + this.slotSize) {
                
                if (this.equipment.shieldGen[i]) {
                    const item = this.unequipItem('shieldGen', i);
                    if (item) {
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
        
        // Disegna equipaggiamento
        this.drawEquipment(ctx);
        
        // Disegna inventario
        this.drawInventory(ctx);
        
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
            if (item.type === 'laser') itemColor = '#ff6b6b';
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
            ctx.fillText(item.name, itemX + this.slotSize / 2, itemY + this.slotSize / 2 + 3);
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
