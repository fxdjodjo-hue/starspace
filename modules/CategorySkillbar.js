// CategorySkillbar - Sistema di skillbar a categorie per MMORPG
export class CategorySkillbar {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.width = 600;
        this.height = 60;
        this.activeCategory = null;
        this.game = null;
        
        // Categorie di armi e abilità
        this.categories = {
            laser: {
                name: 'LASER',
                icon: '🔴',
                items: [
                    { id: 'laser_x1', name: 'Laser X1', icon: '🔴', cooldown: 0, canUse: () => true },
                    { id: 'laser_x2', name: 'Laser X2', icon: '🔴', cooldown: 0, canUse: () => true },
                    { id: 'laser_x3', name: 'Laser X3', icon: '🔴', cooldown: 0, canUse: () => true }
                ]
            },
            missili: {
                name: 'MISSILI',
                icon: '🚀',
                items: [
                    { id: 'missile_r1', name: 'Missile R1', icon: '🚀', cooldown: 0, canUse: () => true },
                    { id: 'missile_r2', name: 'Missile R2', icon: '🚀', cooldown: 0, canUse: () => true },
                    { id: 'missile_r3', name: 'Missile R3', icon: '🚀', cooldown: 0, canUse: () => true }
                ]
            },
            extra: {
                name: 'EXTRA',
                icon: '⚡',
                items: [
                    { id: 'smartbomb', name: 'Smartbomb', icon: '💣', cooldown: 0, canUse: () => this.game?.smartbomb?.canUse() || false },
                    { id: 'fastrepair', name: 'Fast Repair', icon: '🔧', cooldown: 0, canUse: () => this.game?.fastRepair?.canUse() || false },
                    { id: 'emp', name: 'EMP', icon: '⚡', cooldown: 0, canUse: () => this.game?.emp?.canUse() || false },
                    { id: 'leech', name: 'Leech', icon: '🩸', cooldown: 0, canUse: () => this.game?.leech?.canUse() || false }
                ]
            }
        };
    }
    
    setGame(game) {
        this.game = game;
    }
    
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
    
    update() {
        // Aggiorna i cooldown delle abilità
        if (this.game) {
            // Aggiorna smartbomb
            if (this.game.smartbomb) {
                const smartbombItem = this.categories.extra.items.find(item => item.id === 'smartbomb');
                if (smartbombItem) {
                    smartbombItem.cooldown = this.game.smartbomb.getCooldownRemaining();
                }
            }
            
            // Aggiorna fastrepair
            if (this.game.fastRepair) {
                const fastrepairItem = this.categories.extra.items.find(item => item.id === 'fastrepair');
                if (fastrepairItem) {
                    fastrepairItem.cooldown = this.game.fastRepair.getCooldownRemaining();
                }
            }
            
            // Aggiorna emp
            if (this.game.emp) {
                const empItem = this.categories.extra.items.find(item => item.id === 'emp');
                if (empItem) {
                    empItem.cooldown = this.game.emp.getCooldownRemaining();
                }
            }
            
            // Aggiorna leech
            if (this.game.leech) {
                const leechItem = this.categories.extra.items.find(item => item.id === 'leech');
                if (leechItem) {
                    leechItem.cooldown = this.game.leech.getCooldownRemaining();
                }
            }
        }
    }
    
    draw(ctx) {
        // Disegna la barra principale
        this.drawMainBar(ctx);
        
        // Se una categoria è attiva, disegna il menu a tendina
        if (this.activeCategory) {
            this.drawDropdownMenu(ctx);
        }
    }
    
    drawMainBar(ctx) {
        const cornerRadius = 8;
        
        // Sfondo principale
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, cornerRadius);
        ctx.fill();
        
        // Bordo
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Disegna le categorie
        const categoryWidth = this.width / Object.keys(this.categories).length;
        let categoryIndex = 0;
        
        for (const [key, category] of Object.entries(this.categories)) {
            const categoryX = this.x + (categoryIndex * categoryWidth);
            const categoryY = this.y;
            
            // Evidenzia la categoria attiva
            if (this.activeCategory === category.name) {
                ctx.fillStyle = 'rgba(74, 144, 226, 0.3)';
                ctx.beginPath();
                ctx.roundRect(categoryX, categoryY, categoryWidth, this.height, cornerRadius);
                ctx.fill();
            }
            
            // Icona della categoria
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(category.icon, categoryX + categoryWidth/2, categoryY + this.height/2 - 8);
            
            // Nome della categoria
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = 'bold 10px Arial';
            ctx.fillText(category.name, categoryX + categoryWidth/2, categoryY + this.height/2 + 12);
            
            categoryIndex++;
        }
    }
    
    drawDropdownMenu(ctx) {
        const category = this.categories[this.getCategoryKeyByName(this.activeCategory)];
        if (!category) return;
        
        const itemsPerRow = 4;
        const rows = Math.ceil(category.items.length / itemsPerRow);
        const itemSize = 50;
        const itemSpacing = 10;
        const totalHeight = rows * (itemSize + itemSpacing) + itemSpacing;
        
        const menuX = this.x;
        const menuY = this.y - totalHeight - 10;
        
        // Sfondo del menu
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.beginPath();
        ctx.roundRect(menuX, menuY, this.width, totalHeight, 8);
        ctx.fill();
        
        // Bordo del menu
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Disegna gli oggetti
        category.items.forEach((item, index) => {
            const row = Math.floor(index / itemsPerRow);
            const col = index % itemsPerRow;
            
            const itemX = menuX + (col * (itemSize + itemSpacing)) + itemSpacing;
            const itemY = menuY + (row * (itemSize + itemSpacing)) + itemSpacing;
            
            // Sfondo dell'oggetto
            const canUse = item.canUse();
            const isSelected = this.isItemSelected(item);
            
            // Colore di sfondo basato su selezione e disponibilità
            if (isSelected) {
                ctx.fillStyle = 'rgba(255, 215, 0, 0.4)'; // Oro per selezionato
            } else if (canUse) {
                ctx.fillStyle = 'rgba(74, 144, 226, 0.3)'; // Blu per disponibile
            } else {
                ctx.fillStyle = 'rgba(100, 100, 100, 0.3)'; // Grigio per non disponibile
            }
            ctx.beginPath();
            ctx.roundRect(itemX, itemY, itemSize, itemSize, 6);
            ctx.fill();
            
            // Bordo dell'oggetto
            if (isSelected) {
                ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)'; // Bordo oro per selezionato
                ctx.lineWidth = 2;
            } else {
                ctx.strokeStyle = canUse ? 'rgba(255, 255, 255, 0.5)' : 'rgba(150, 150, 150, 0.5)';
                ctx.lineWidth = 1;
            }
            ctx.stroke();
            
            // Icona dell'oggetto
            ctx.fillStyle = canUse ? '#ffffff' : 'rgba(150, 150, 150, 0.8)';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(item.icon, itemX + itemSize/2, itemY + itemSize/2 - 5);
            
            // Nome dell'oggetto
            ctx.fillStyle = canUse ? 'rgba(255, 255, 255, 0.8)' : 'rgba(150, 150, 150, 0.6)';
            ctx.font = 'bold 8px Arial';
            ctx.fillText(item.name, itemX + itemSize/2, itemY + itemSize/2 + 12);
            
            // Cooldown per le skills EXTRA
            if (item.cooldown > 0) {
                const cooldownProgress = Math.min(item.cooldown / 10000, 1); // Assumendo 10s max cooldown
                const cooldownHeight = itemSize * cooldownProgress;
                
                ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
                ctx.beginPath();
                ctx.roundRect(itemX, itemY + itemSize - cooldownHeight, itemSize, cooldownHeight, 6);
                ctx.fill();
                
                // Testo del cooldown
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 10px Arial';
                ctx.fillText(Math.ceil(item.cooldown / 1000).toString(), itemX + itemSize/2, itemY + itemSize/2);
            }
            
            // Countdown per armi selezionate (laser e missili) - solo in combattimento
            if (isSelected && this.game && this.game.ship && this.game.ship.isInCombat) {
                const countdown = this.getWeaponCountdown(item);
                if (countdown > 0) {
                    const countdownProgress = Math.min(countdown / this.getMaxCountdown(item), 1);
                    const countdownHeight = itemSize * countdownProgress;
                    
                    ctx.fillStyle = 'rgba(255, 165, 0, 0.7)'; // Arancione per countdown armi
                    ctx.beginPath();
                    ctx.roundRect(itemX, itemY + itemSize - countdownHeight, itemSize, countdownHeight, 6);
                    ctx.fill();
                    
                    // Testo del countdown
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 10px Arial';
                    ctx.fillText(Math.ceil(countdown / 1000).toString(), itemX + itemSize/2, itemY + itemSize/2);
                }
            }
        });
    }
    
    handleClick(mouseX, mouseY) {
        // Controlla se è un click effettivo (non un rilascio dopo navigazione)
        if (!this.game || !this.game.input) {
            return false;
        }
        
        // Controlla la distanza del movimento del mouse
        const movementDistance = this.game.input.mouse.movementDistance || 0;
        if (movementDistance > 5) {
            return false; // Non è un click effettivo, è navigazione
        }
        
        // Controlla click sulla barra principale
        if (mouseX >= this.x && mouseX <= this.x + this.width &&
            mouseY >= this.y && mouseY <= this.y + this.height) {
            
            const categoryWidth = this.width / Object.keys(this.categories).length;
            const clickedCategoryIndex = Math.floor((mouseX - this.x) / categoryWidth);
            const categoryNames = Object.keys(this.categories);
            
            if (clickedCategoryIndex >= 0 && clickedCategoryIndex < categoryNames.length) {
                const categoryName = this.categories[categoryNames[clickedCategoryIndex]].name;
                
                // Toggle della categoria
                if (this.activeCategory === categoryName) {
                    this.activeCategory = null;
                } else {
                    this.activeCategory = categoryName;
                }
                return true;
            }
        }
        
        // Controlla click nel menu a tendina
        if (this.activeCategory) {
            const category = this.categories[this.getCategoryKeyByName(this.activeCategory)];
            if (category) {
                const itemsPerRow = 4;
                const rows = Math.ceil(category.items.length / itemsPerRow);
                const itemSize = 50;
                const itemSpacing = 10;
                const totalHeight = rows * (itemSize + itemSpacing) + itemSpacing;
                
                const menuX = this.x;
                const menuY = this.y - totalHeight - 10;
                
                if (mouseX >= menuX && mouseX <= menuX + this.width &&
                    mouseY >= menuY && mouseY <= menuY + totalHeight) {
                    
                    // Calcola quale oggetto è stato cliccato
                    const relativeX = mouseX - menuX - itemSpacing;
                    const relativeY = mouseY - menuY - itemSpacing;
                    
                    const col = Math.floor(relativeX / (itemSize + itemSpacing));
                    const row = Math.floor(relativeY / (itemSize + itemSpacing));
                    const itemIndex = row * itemsPerRow + col;
                    
                    if (itemIndex >= 0 && itemIndex < category.items.length) {
                        const item = category.items[itemIndex];
                        this.activateItem(item);
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    activateItem(item) {
        if (!this.game || !item.canUse()) return;
        
        switch (item.id) {
            // Laser
            case 'laser_x1':
                if (this.game.ship.selectLaser('x1')) {
                    this.game.notifications.add('🔴 Laser X1 selezionato!', 200, 'info');
                }
                break;
            case 'laser_x2':
                if (this.game.ship.selectLaser('x2')) {
                    this.game.notifications.add('🔴 Laser X2 selezionato!', 200, 'info');
                }
                break;
            case 'laser_x3':
                if (this.game.ship.selectLaser('x3')) {
                    this.game.notifications.add('🔴 Laser X3 selezionato!', 200, 'info');
                }
                break;
            
            // Missili
            case 'missile_r1':
                if (this.game.ship.selectMissile('r1')) {
                    this.game.notifications.add('🚀 Missile R1 selezionato!', 200, 'info');
                }
                break;
            case 'missile_r2':
                if (this.game.ship.selectMissile('r2')) {
                    this.game.notifications.add('🚀 Missile R2 selezionato!', 200, 'info');
                }
                break;
            case 'missile_r3':
                if (this.game.ship.selectMissile('r3')) {
                    this.game.notifications.add('🚀 Missile R3 selezionato!', 200, 'info');
                }
                break;
            
            // Extra (Skills esistenti)
            case 'smartbomb':
                if (this.game.smartbomb.activate(this.game.ship, this.game.enemies, this.game.explosionManager)) {
                    this.game.notifications.add('💣 Smartbomb attivata!', 200, 'info');
                }
                break;
            case 'fastrepair':
                if (this.game.fastRepair.activate(this.game.ship)) {
                    this.game.notifications.add('🔧 FastRepair attivato!', 200, 'info');
                }
                break;
            case 'emp':
                if (this.game.emp.activate(this.game.ship, this.game.enemies)) {
                    this.game.notifications.add('⚡ EMP attivato!', 200, 'info');
                }
                break;
            case 'leech':
                if (this.game.leech.activate(this.game.ship)) {
                    this.game.notifications.add('🩸 Leech attivato!', 200, 'info');
                }
                break;
        }
    }
    
    getCategoryKeyByName(name) {
        for (const [key, category] of Object.entries(this.categories)) {
            if (category.name === name) {
                return key;
            }
        }
        return null;
    }
    
    isItemSelected(item) {
        if (!this.game || !this.game.ship) return false;
        
        // Controlla se è un laser selezionato
        if (item.id.startsWith('laser_')) {
            const laserType = item.id.replace('laser_', '');
            return this.game.ship.selectedLaser === laserType;
        }
        
        // Controlla se è un missile selezionato
        if (item.id.startsWith('missile_')) {
            const missileType = item.id.replace('missile_', '');
            return this.game.ship.selectedMissile === missileType;
        }
        
        return false;
    }
    
    getWeaponCountdown(item) {
        if (!this.game || !this.game.ship) return 0;
        
        // Countdown per laser selezionato
        if (item.id.startsWith('laser_')) {
            const laserType = item.id.replace('laser_', '');
            if (this.game.ship.selectedLaser === laserType) {
                // Converte il fireTimer da frame a millisecondi
                return (this.game.ship.fireTimer / 60) * 1000;
            }
        }
        
        // Countdown per missile selezionato
        if (item.id.startsWith('missile_')) {
            const missileType = item.id.replace('missile_', '');
            if (this.game.ship.selectedMissile === missileType) {
                // Converte il missileTimer da frame a millisecondi
                return (this.game.ship.missileTimer / 60) * 1000;
            }
        }
        
        return 0;
    }
    
    getMaxCountdown(item) {
        if (!this.game || !this.game.ship) return 1000;
        
        // Max countdown per laser selezionato
        if (item.id.startsWith('laser_')) {
            const laserType = item.id.replace('laser_', '');
            if (this.game.ship.selectedLaser === laserType) {
                // Converte il fireRate da frame a millisecondi
                return (this.game.ship.fireRate / 60) * 1000;
            }
        }
        
        // Max countdown per missile selezionato
        if (item.id.startsWith('missile_')) {
            const missileType = item.id.replace('missile_', '');
            if (this.game.ship.selectedMissile === missileType) {
                // Converte il missileFireRate da frame a millisecondi
                return (this.game.ship.missileFireRate / 60) * 1000;
            }
        }
        
        return 1000;
    }
}
