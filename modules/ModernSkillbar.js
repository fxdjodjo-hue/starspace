// ModernSkillbar - Sistema di skillbar moderno con griglia inventario
export class ModernSkillbar {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.width = 600;
        this.height = 60;
        this.game = null;
        
        // Stato della skillbar
        this.isExpanded = false;
        this.activeCategory = null;
        this.selectedWeapon = null;
        
        // Griglia inventario (20 slot)
        this.inventorySlots = Array(20).fill(null);
        
        // Categorie di armi e abilità (stessi dati della CategorySkillbar)
        this.categories = {
            laser: {
                name: 'LASER',
                icon: 'Laser',
                items: [
                    { id: 'laser_x1', name: 'X1', icon: 'X1', cooldown: 0, canUse: () => true, quantity: 1000 },
                    { id: 'laser_x2', name: 'X2', icon: 'X2', cooldown: 0, canUse: () => true, quantity: 500 },
                    { id: 'laser_x3', name: 'X3', icon: 'X3', cooldown: 0, canUse: () => true, quantity: 200 },
                    { id: 'laser_x4', name: 'X4', icon: 'X4', cooldown: 0, canUse: () => true, quantity: 100 },
                    { id: 'laser_xs', name: 'XS', icon: 'XS', cooldown: 0, canUse: () => true, quantity: 50 },
                    { id: 'laser_rdl', name: 'RDL', icon: 'RDL', cooldown: 0, canUse: () => true, quantity: 25 }
                ]
            },
            missili: {
                name: 'MISSILI',
                icon: 'Missili',
                items: [
                    { id: 'missile_r1', name: 'R1', icon: 'R1', cooldown: 0, canUse: () => true, quantity: 100 },
                    { id: 'missile_r2', name: 'R2', icon: 'R2', cooldown: 0, canUse: () => true, quantity: 50 },
                    { id: 'missile_r3', name: 'R3', icon: 'R3', cooldown: 0, canUse: () => true, quantity: 25 }
                ]
            },
            extra: {
                name: 'EXTRA',
                icon: 'Extra',
                items: [
                    { id: 'smartbomb', name: 'SMB', icon: 'SMB', cooldown: 0, canUse: () => this.game?.smartbomb?.canUse() || false, quantity: 10 },
                    { id: 'fastrepair', name: 'FR', icon: 'FR', cooldown: 0, canUse: () => this.game?.fastRepair?.canUse() || false, quantity: 5 },
                    { id: 'emp', name: 'EMP', icon: 'EMP', cooldown: 0, canUse: () => this.game?.emp?.canUse() || false, quantity: 3 },
                    { id: 'leech', name: 'Leech', icon: 'Leech', cooldown: 0, canUse: () => this.game?.leech?.canUse() || false, quantity: 2 }
                ]
            }
        };
        
        // Dimensioni
        this.slotSize = 40;
        this.slotSpacing = 5;
        this.gridWidth = 10; // 10 slot per riga
        this.gridHeight = 2; // 2 righe
        this.toggleButtonSize = 30;
    }
    
    setGame(game) {
        this.game = game;
    }
    
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
    
    // Metodo update richiesto dal game.js
    update() {
        // Per ora vuoto, ma necessario per compatibilità
    }
    
    // Gestisce i click
    handleClick(mouseX, mouseY) {
        if (!this.game || !this.game.input) {
            return false;
        }
        
        const movementDistance = this.game.input.mouse.movementDistance || 0;
        if (movementDistance > 5) {
            return false;
        }
        
        // Click sulla griglia inventario
        if (this.isClickOnInventory(mouseX, mouseY)) {
            return this.handleInventoryClick(mouseX, mouseY);
        }
        
        // Click sul pulsante toggle
        if (this.isClickOnToggleButton(mouseX, mouseY)) {
            this.toggleExpanded();
            return true;
        }
        
        // Click sulla riga centrale (categorie)
        if (this.isExpanded && this.isClickOnCategoryRow(mouseX, mouseY)) {
            return this.handleCategoryClick(mouseX, mouseY);
        }
        
        // Click sulla riga superiore (armi della categoria)
        if (this.isExpanded && this.activeCategory && this.isClickOnWeaponRow(mouseX, mouseY)) {
            return this.handleWeaponClick(mouseX, mouseY);
        }
        
        return false;
    }
    
    // Controlla se il click è sulla griglia inventario
    isClickOnInventory(mouseX, mouseY) {
        const gridX = this.x;
        const gridY = this.y;
        const gridWidth = this.gridWidth * (this.slotSize + this.slotSpacing) - this.slotSpacing;
        const gridHeight = this.gridHeight * (this.slotSize + this.slotSpacing) - this.slotSpacing;
        
        return mouseX >= gridX && mouseX <= gridX + gridWidth &&
               mouseY >= gridY && mouseY <= gridY + gridHeight;
    }
    
    // Controlla se il click è sul pulsante toggle
    isClickOnToggleButton(mouseX, mouseY) {
        const buttonX = this.x + this.gridWidth * (this.slotSize + this.slotSpacing) + 10;
        const buttonY = this.y;
        
        return mouseX >= buttonX && mouseX <= buttonX + this.toggleButtonSize &&
               mouseY >= buttonY && mouseY <= buttonY + this.toggleButtonSize;
    }
    
    // Controlla se il click è sulla riga delle categorie
    isClickOnCategoryRow(mouseX, mouseY) {
        const categoryY = this.y + this.gridHeight * (this.slotSize + this.slotSpacing) + 20;
        const categoryHeight = 50;
        
        return mouseX >= this.x && mouseX <= this.x + this.width &&
               mouseY >= categoryY && mouseY <= categoryY + categoryHeight;
    }
    
    // Controlla se il click è sulla riga delle armi
    isClickOnWeaponRow(mouseX, mouseY) {
        const weaponY = this.y + this.gridHeight * (this.slotSize + this.slotSpacing) + 80;
        const weaponHeight = 50;
        
        return mouseX >= this.x && mouseX <= this.x + this.width &&
               mouseY >= weaponY && mouseY <= weaponY + weaponHeight;
    }
    
    // Gestisce click sulla griglia inventario
    handleInventoryClick(mouseX, mouseY) {
        const slotX = Math.floor((mouseX - this.x) / (this.slotSize + this.slotSpacing));
        const slotY = Math.floor((mouseY - this.y) / (this.slotSize + this.slotSpacing));
        const slotIndex = slotY * this.gridWidth + slotX;
        
        if (slotIndex >= 0 && slotIndex < this.inventorySlots.length) {
            // Seleziona slot
            this.selectedSlot = slotIndex;
            return true;
        }
        
        return false;
    }
    
    // Gestisce click sulle categorie
    handleCategoryClick(mouseX, mouseY) {
        const categoryWidth = this.width / 3;
        const categoryIndex = Math.floor((mouseX - this.x) / categoryWidth);
        const categoryNames = Object.keys(this.categories);
        
        if (categoryIndex >= 0 && categoryIndex < categoryNames.length) {
            const categoryKey = categoryNames[categoryIndex];
            this.activeCategory = categoryKey;
            this.selectedWeapon = null;
            return true;
        }
        
        return false;
    }
    
    // Gestisce click sulle armi
    handleWeaponClick(mouseX, mouseY) {
        if (!this.activeCategory) return false;
        
        const category = this.categories[this.activeCategory];
        const weaponWidth = this.width / category.items.length;
        const weaponIndex = Math.floor((mouseX - this.x) / weaponWidth);
        
        if (weaponIndex >= 0 && weaponIndex < category.items.length) {
            this.selectedWeapon = category.items[weaponIndex];
            return true;
        }
        
        return false;
    }
    
    // Toggle espansione
    toggleExpanded() {
        this.isExpanded = !this.isExpanded;
        if (!this.isExpanded) {
            this.activeCategory = null;
            this.selectedWeapon = null;
        }
    }
    
    // Disegna la skillbar
    draw(ctx) {
        // Griglia inventario
        this.drawInventoryGrid(ctx);
        
        // Pulsante toggle
        this.drawToggleButton(ctx);
        
        // Riga categorie (se espansa)
        if (this.isExpanded) {
            this.drawCategoryRow(ctx);
        }
        
        // Riga armi (se categoria selezionata)
        if (this.isExpanded && this.activeCategory) {
            this.drawWeaponRow(ctx);
        }
    }
    
    // Disegna la griglia inventario
    drawInventoryGrid(ctx) {
        const startX = this.x;
        const startY = this.y;
        
        for (let row = 0; row < this.gridHeight; row++) {
            for (let col = 0; col < this.gridWidth; col++) {
                const slotX = startX + col * (this.slotSize + this.slotSpacing);
                const slotY = startY + row * (this.slotSize + this.slotSpacing);
                const slotIndex = row * this.gridWidth + col;
                
                // Sfondo slot
                ctx.fillStyle = '#1a1a2e';
                ctx.fillRect(slotX, slotY, this.slotSize, this.slotSize);
                
                // Bordo
                ctx.strokeStyle = '#16213e';
                ctx.lineWidth = 2;
                ctx.strokeRect(slotX, slotY, this.slotSize, this.slotSize);
                
                // Bordo giallo se selezionato
                if (this.selectedSlot === slotIndex) {
                    ctx.strokeStyle = '#ffd700';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(slotX, slotY, this.slotSize, this.slotSize);
                }
                
                // Numero slot
                ctx.fillStyle = '#ffffff';
                ctx.font = '12px Arial';
                ctx.textAlign = 'left';
                ctx.fillText((slotIndex + 1).toString(), slotX + 2, slotY + this.slotSize - 2);
                
                // Contenuto slot (se presente)
                const slotContent = this.inventorySlots[slotIndex];
                if (slotContent) {
                    ctx.fillStyle = '#00ff00';
                    ctx.font = '10px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(slotContent.name, slotX + this.slotSize / 2, slotY + this.slotSize / 2);
                }
            }
        }
    }
    
    // Disegna il pulsante toggle
    drawToggleButton(ctx) {
        const buttonX = this.x + this.gridWidth * (this.slotSize + this.slotSpacing) + 10;
        const buttonY = this.y;
        
        // Sfondo pulsante
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(buttonX, buttonY, this.toggleButtonSize, this.toggleButtonSize);
        
        // Bordo
        ctx.strokeStyle = '#16213e';
        ctx.lineWidth = 2;
        ctx.strokeRect(buttonX, buttonY, this.toggleButtonSize, this.toggleButtonSize);
        
        // Icona freccia
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.isExpanded ? '▼' : '▶', buttonX + this.toggleButtonSize / 2, buttonY + this.toggleButtonSize / 2 + 5);
    }
    
    // Disegna la riga delle categorie
    drawCategoryRow(ctx) {
        const categoryY = this.y + this.gridHeight * (this.slotSize + this.slotSpacing) + 20;
        const categoryWidth = this.width / 3;
        const categoryHeight = 50;
        
        const categories = Object.values(this.categories);
        
        categories.forEach((category, index) => {
            const categoryX = this.x + index * categoryWidth;
            
            // Sfondo categoria
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(categoryX, categoryY, categoryWidth, categoryHeight);
            
            // Bordo
            ctx.strokeStyle = this.activeCategory === Object.keys(this.categories)[index] ? '#ffd700' : '#16213e';
            ctx.lineWidth = 2;
            ctx.strokeRect(categoryX, categoryY, categoryWidth, categoryHeight);
            
            // Icona categoria
            ctx.fillStyle = '#ffffff';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(category.icon, categoryX + categoryWidth / 2, categoryY + categoryHeight / 2 + 7);
        });
    }
    
    // Disegna la riga delle armi
    drawWeaponRow(ctx) {
        if (!this.activeCategory) return;
        
        const weaponY = this.y + this.gridHeight * (this.slotSize + this.slotSpacing) + 80;
        const weaponHeight = 50;
        const category = this.categories[this.activeCategory];
        const weaponWidth = this.width / category.items.length;
        
        category.items.forEach((weapon, index) => {
            const weaponX = this.x + index * weaponWidth;
            
            // Sfondo arma
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(weaponX, weaponY, weaponWidth, weaponHeight);
            
            // Bordo
            ctx.strokeStyle = this.selectedWeapon === weapon ? '#ffd700' : '#16213e';
            ctx.lineWidth = 2;
            ctx.strokeRect(weaponX, weaponY, weaponWidth, weaponHeight);
            
            // Nome arma
            ctx.fillStyle = '#ffffff';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(weapon.name, weaponX + weaponWidth / 2, weaponY + 20);
            
            // Quantità
            ctx.fillStyle = '#00ff00';
            ctx.font = '12px Arial';
            ctx.fillText(weapon.quantity.toString(), weaponX + weaponWidth / 2, weaponY + 35);
        });
    }
}
