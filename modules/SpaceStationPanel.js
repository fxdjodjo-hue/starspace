// Pannello della stazione spaziale
export class SpaceStationPanel {
    constructor() {
        this.isOpen = false;
        this.currentCategory = 'upgrades'; // 'upgrades', 'missions', 'hangar'
        this.categories = [
            { id: 'upgrades', name: 'Potenziamenti', icon: '⚡' },
            { id: 'info', name: 'Info', icon: '📊' },
            { id: 'rank', name: 'Rank', icon: '🏆' },
            { id: 'missions', name: 'Missioni', icon: '🎯' },
            { id: 'hangar', name: 'Hangar', icon: '🚀' }
        ];
        this.upgradeMessage = null;
        this.upgradeMessageTimer = 0;
        
        // Nessun scroll - tutto compatto
    }
    
    open() {
        this.isOpen = true;
        this.currentCategory = 'upgrades';
    }
    
    close() {
        this.isOpen = false;
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    setCategory(categoryId) {
        this.currentCategory = categoryId;
    }
    
    update() {
        // Aggiorna il timer del messaggio di upgrade
        if (this.upgradeMessage && this.upgradeMessageTimer > 0) {
            this.upgradeMessageTimer--;
            if (this.upgradeMessageTimer <= 0) {
                this.upgradeMessage = null;
            }
        }
    }
    
    showUpgradeMessage(message) {
        this.upgradeMessage = message;
        this.upgradeMessageTimer = 120; // 2 secondi a 60 FPS
    }
    
    draw(ctx, canvasWidth, canvasHeight, upgradeManager) {
        if (!this.isOpen) return;
        
        // Dimensioni del pannello
        const panelWidth = 600;
        const panelHeight = 500;
        const panelX = (canvasWidth - panelWidth) / 2;
        const panelY = (canvasHeight - panelHeight) / 2;
        
        // Sfondo scuro con trasparenza
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
        
        // Bordo bianco
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
        
        // Titolo
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🚀 STAZIONE SPAZIALE', panelX + panelWidth/2, panelY + 40);
        
        // Disegna le categorie con scroll
        this.drawCategories(ctx, panelX, panelY, panelWidth);
        
        // Disegna il contenuto della categoria corrente
        this.drawCategoryContent(ctx, panelX, panelY, panelWidth, panelHeight, upgradeManager);
        
        // Pulsante chiudi
        this.drawCloseButton(ctx, panelX + panelWidth - 40, panelY + 10);
        
        // Disegna il messaggio di upgrade se presente
        if (this.upgradeMessage) {
            this.drawUpgradeMessage(ctx, panelX, panelY, panelWidth);
        }
    }
    
    drawCategories(ctx, panelX, panelY, panelWidth) {
        const categoryHeight = 40;
        const categoryY = panelY + 70;
        const categoryWidth = (panelWidth - 40) / this.categories.length;
        
        this.categories.forEach((category, index) => {
            const categoryX = panelX + 20 + (index * categoryWidth);
            const isActive = this.currentCategory === category.id;
            
            // Sfondo categoria
            ctx.fillStyle = isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(categoryX, categoryY, categoryWidth - 2, categoryHeight);
            
            // Bordo categoria
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(categoryX, categoryY, categoryWidth - 2, categoryHeight);
            
            // Testo categoria
            ctx.fillStyle = isActive ? '#000000' : '#ffffff';
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${category.icon} ${category.name}`, categoryX + categoryWidth/2, categoryY + 25);
        });
    }
    
    drawCategoryContent(ctx, panelX, panelY, panelWidth, panelHeight, upgradeManager) {
        const contentX = panelX + 20;
        const contentY = panelY + 120;
        const contentWidth = panelWidth - 40;
        const contentHeight = panelHeight - 140;
        
        switch (this.currentCategory) {
            case 'upgrades':
                this.drawUpgradesContent(ctx, contentX, contentY, contentWidth, contentHeight, upgradeManager);
                break;
            case 'info':
                this.drawInfoContent(ctx, contentX, contentY, contentWidth, contentHeight, upgradeManager);
                break;
            case 'rank':
                this.drawRankContent(ctx, contentX, contentY, contentWidth, contentHeight, upgradeManager);
                break;
            case 'missions':
                this.drawMissionsContent(ctx, contentX, contentY, contentWidth, contentHeight);
                break;
            case 'hangar':
                this.drawHangarContent(ctx, contentX, contentY, contentWidth, contentHeight);
                break;
        }
    }
    
    drawUpgradesContent(ctx, x, y, width, height, upgradeManager) {
        // Controlla se si è nella safezone
        const isInSafeZone = this.isInSafeZone();
        
        // Titolo sezione
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Potenziamenti Disponibili', x, y + 25);
        
        // Se non si è nella safezone, mostra messaggio di blocco
        if (!isInSafeZone) {
            ctx.fillStyle = '#ff6b6b';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🔒 DISPONIBILE SOLO IN SAFE ZONE', x + width/2, y + 60);
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.font = '14px Arial';
            ctx.fillText('Vai alla Space Station per accedere ai potenziamenti', x + width/2, y + 85);
            return;
        }
        
        // Mostra crediti disponibili
        ctx.fillStyle = '#cccccc';
        ctx.font = '14px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`Crediti: ${upgradeManager ? upgradeManager.credits : 0}`, x + width, y + 25);
        
        // Lista potenziamenti
        if (upgradeManager && upgradeManager.upgrades) {
            const upgrades = upgradeManager.upgrades;
            let itemY = y + 60;
            const itemHeight = 50;
            
            Object.keys(upgrades).forEach(upgradeKey => {
                const upgrade = upgrades[upgradeKey];
                if (itemY > y + height - itemHeight) return; // Evita overflow
                
                this.drawUpgradeItem(ctx, x, itemY, width, itemHeight, upgradeKey, upgrade, upgradeManager);
                itemY += itemHeight + 10;
            });
        }
    }
    
    drawUpgradeItem(ctx, x, y, width, height, upgradeKey, upgrade, upgradeManager) {
        const currentLevel = upgradeManager[`${upgradeKey}Level`] || 1;
        const currentLevelData = upgrade.levels[currentLevel - 1];
        const nextLevelData = upgrade.levels[currentLevel];
        const isMaxLevel = currentLevel >= upgrade.levels.length;
        
        // Sfondo item
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(x, y, width, height);
        
        // Bordo item
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
        
        // Nome upgrade (sinistra)
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(upgrade.name, x + 15, y + 20);
        
        // Livello attuale (sotto il nome)
        ctx.fillStyle = '#cccccc';
        ctx.font = '12px Arial';
        ctx.fillText(`Livello ${currentLevel}`, x + 15, y + 35);
        
        // Valore attuale (centro-sinistra)
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`${currentLevelData.value}`, x + 200, y + 25);
        
        // Pulsante upgrade o "MAX" (destra)
        const buttonWidth = 100;
        const buttonHeight = 30;
        const buttonX = x + width - buttonWidth - 15;
        const buttonY = y + (height - buttonHeight) / 2;
        
        if (isMaxLevel) {
            // Pulsante MAX
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
            
            ctx.fillStyle = '#cccccc';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('MAX', buttonX + buttonWidth/2, buttonY + 20);
        } else {
            // Pulsante upgrade
            const canAfford = upgradeManager.credits >= nextLevelData.cost;
            ctx.fillStyle = canAfford ? '#ffffff' : 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
            ctx.strokeStyle = canAfford ? '#ffffff' : 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 1;
            ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
            
            ctx.fillStyle = canAfford ? '#000000' : '#888888';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${nextLevelData.cost} C`, buttonX + buttonWidth/2, buttonY + 20);
            
            // Mostra messaggio se non ci sono abbastanza crediti
            if (!canAfford) {
                ctx.fillStyle = '#ff6666';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Crediti insufficienti', buttonX + buttonWidth/2, buttonY + 35);
            }
        }
        
        // Barra di progresso (sotto il valore)
        const progressBarWidth = 150;
        const progressBarHeight = 6;
        const progressBarX = x + 200;
        const progressBarY = y + 35;
        
        // Sfondo barra
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);
        
        // Progresso barra
        const progress = currentLevel / upgrade.levels.length;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(progressBarX, progressBarY, progressBarWidth * progress, progressBarHeight);
        
        // Bordo barra
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);
    }
    
    drawMissionsContent(ctx, x, y, width, height) {
        // Titolo sezione
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Missioni', x, y + 25);
        
        // Messaggio coming soon
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('COMING SOON', x + width/2, y + height/2);
        
        ctx.fillStyle = '#cccccc';
        ctx.font = '16px Arial';
        ctx.fillText('Le missioni saranno disponibili presto!', x + width/2, y + height/2 + 30);
    }
    
    drawHangarContent(ctx, x, y, width, height) {
        // Controlla se si è nella safezone
        const isInSafeZone = this.isInSafeZone();
        
        // Titolo sezione
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Hangar', x, y + 25);
        
        // Se non si è nella safezone, mostra messaggio di blocco
        if (!isInSafeZone) {
            ctx.fillStyle = '#ff6b6b';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🔒 DISPONIBILE SOLO IN SAFE ZONE', x + width/2, y + 60);
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.font = '14px Arial';
            ctx.fillText('Vai alla Space Station per accedere all\'hangar', x + width/2, y + 85);
            return;
        }
        
        // Messaggio coming soon
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('COMING SOON', x + width/2, y + height/2);
        
        ctx.fillStyle = '#cccccc';
        ctx.font = '16px Arial';
        ctx.fillText('L\'hangar sarà disponibile presto!', x + width/2, y + height/2 + 30);
    }
    
    drawCloseButton(ctx, x, y) {
        // Sfondo pulsante
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y, 30, 30);
        
        // Bordo
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, 30, 30);
        
        // X
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('×', x + 15, y + 20);
    }
    
    handleClick(mouseX, mouseY, upgradeManager) {
        if (!this.isOpen) return false;
        
        const panelWidth = 600;
        const panelHeight = 500;
        const panelX = (window.innerWidth - panelWidth) / 2;
        const panelY = (window.innerHeight - panelHeight) / 2;
        
        // Controlla click su pulsante chiudi
        if (mouseX >= panelX + panelWidth - 40 && mouseX <= panelX + panelWidth - 10 &&
            mouseY >= panelY + 10 && mouseY <= panelY + 40) {
            this.close();
            return true;
        }
        
        // Controlla click su categorie
        const categoryY = panelY + 70;
        const categoryHeight = 40;
        const categoryWidth = (panelWidth - 40) / this.categories.length;
        
        this.categories.forEach((category, index) => {
            const categoryX = panelX + 20 + (index * categoryWidth);
            
            if (mouseX >= categoryX && mouseX <= categoryX + categoryWidth &&
                mouseY >= categoryY && mouseY <= categoryY + categoryHeight) {
                this.setCategory(category.id);
                return true;
            }
        });
        
        // Controlla click sui pulsanti upgrade
        if (this.currentCategory === 'upgrades' && upgradeManager) {
            const contentX = panelX + 20;
            const contentY = panelY + 140;
            const contentWidth = panelWidth - 40;
            
            const upgrades = upgradeManager.upgrades;
            let itemY = contentY + 60;
            const itemHeight = 50;
            
            for (const upgradeKey of Object.keys(upgrades)) {
                const upgrade = upgrades[upgradeKey];
                const currentLevel = upgradeManager[`${upgradeKey}Level`] || 1;
                const nextLevelData = upgrade.levels[currentLevel];
                const isMaxLevel = currentLevel >= upgrade.levels.length;
                
                if (!isMaxLevel) {
                    const buttonWidth = 100;
                    const buttonHeight = 30;
                    const buttonX = contentX + contentWidth - buttonWidth - 15;
                    const buttonY = itemY + (itemHeight - buttonHeight) / 2;
                    
                    if (mouseX >= buttonX && mouseX <= buttonX + buttonWidth &&
                        mouseY >= buttonY && mouseY <= buttonY + buttonHeight) {
                        // Tenta l'upgrade
                        if (upgradeManager.credits >= nextLevelData.cost) {
                            const success = upgradeManager.tryUpgrade(upgradeKey);
                            
                            if (success) {
                                // Mostra messaggio di successo
                                this.showUpgradeMessage(`⚡ ${upgrade.name} potenziato al livello ${currentLevel + 1}!`);
                                
                                // Aggiorna le statistiche della nave in tempo reale
                                if (window.gameInstance && window.gameInstance.ship) {
                                    window.gameInstance.ship.updateStats();
                                }
                            } else {
                                this.showUpgradeMessage(`❌ Errore durante l'upgrade!`);
                            }
                        } else {
                            // Mostra messaggio di errore
                            this.showUpgradeMessage(`❌ Crediti insufficienti! Ti servono ${nextLevelData.cost} crediti.`);
                        }
                        return true; // Esce dal metodo dopo il primo click rilevato
                    }
                }
                
                itemY += itemHeight + 10;
            }
        }
        
        return false;
    }
    
    drawUpgradeMessage(ctx, panelX, panelY, panelWidth) {
        if (!this.upgradeMessage) return;
        
        const messageY = panelY + 50;
        const messageHeight = 30;
        
        // Sfondo messaggio
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(panelX + 20, messageY, panelWidth - 40, messageHeight);
        
        // Bordo messaggio
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(panelX + 20, messageY, panelWidth - 40, messageHeight);
        
        // Testo messaggio
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.upgradeMessage, panelX + panelWidth/2, messageY + 20);
    }
    
    drawInfoContent(ctx, x, y, width, height, upgradeManager) {
        // Titolo sezione
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('📊 INFORMAZIONI NAVE', x + width/2, y + 25);
        
        // Ottieni le statistiche attuali
        const ship = window.gameInstance ? window.gameInstance.ship : null;
        if (!ship || !upgradeManager) return;
        
        const currentDamage = ship.getCurrentDamage();
        const currentSpeed = ship.getCurrentSpeed();
        const currentHP = ship.getCurrentHP();
        const maxHP = ship.maxHP;
        const currentLevel = ship.experience.currentLevel;
        const currentExp = ship.experience.currentExp;
        const expToNext = ship.experience.getExpToNextLevel();
        
        // Layout a due colonne
        const leftCol = x + 20;
        const rightCol = x + width/2 + 10;
        let leftY = y + 50;
        let rightY = y + 50;
        const lineHeight = 22;
        
        // COLONNA SINISTRA
        // Statistiche di combattimento
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('⚔️ COMBATTIMENTO', leftCol, leftY);
        leftY += lineHeight;
        
        ctx.fillStyle = '#cccccc';
        ctx.font = '14px Arial';
        ctx.fillText(`Danno: ${currentDamage}`, leftCol, leftY);
        leftY += lineHeight;
        
        ctx.fillText(`HP: ${ship.hp}/${maxHP}`, leftCol, leftY);
        leftY += lineHeight;
        
        // Barra HP
        const hpBarWidth = 120;
        const hpBarHeight = 6;
        const hpBarX = leftCol;
        const hpBarY = leftY + 2;
        
        // Sfondo barra HP
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
        
        // Progresso barra HP
        const hpProgress = ship.hp / maxHP;
        ctx.fillStyle = hpProgress > 0.3 ? '#ffffff' : '#ff6666';
        ctx.fillRect(hpBarX, hpBarY, hpBarWidth * hpProgress, hpBarHeight);
        
        // Bordo barra HP
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
        
        leftY += 10;
        
        // Scudo
        ctx.fillStyle = '#cccccc';
        ctx.font = '14px Arial';
        ctx.fillText(`Scudo: ${Math.floor(ship.shield)}/${ship.maxShield}`, leftCol, leftY);
        leftY += lineHeight;
        
        // Barra Scudo
        const shieldBarWidth = 120;
        const shieldBarHeight = 6;
        const shieldBarX = leftCol;
        const shieldBarY = leftY + 2;
        
        // Sfondo barra Scudo
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(shieldBarX, shieldBarY, shieldBarWidth, shieldBarHeight);
        
        // Progresso barra Scudo
        const shieldProgress = ship.shield / ship.maxShield;
        ctx.fillStyle = '#00aaff'; // Blu per lo scudo
        ctx.fillRect(shieldBarX, shieldBarY, shieldBarWidth * shieldProgress, shieldBarHeight);
        
        // Bordo barra Scudo
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(shieldBarX, shieldBarY, shieldBarWidth, shieldBarHeight);
        
        leftY += 15;
        
        // Statistiche di movimento
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('🚀 MOVIMENTO', leftCol, leftY);
        leftY += lineHeight;
        
        ctx.fillStyle = '#cccccc';
        ctx.font = '14px Arial';
        ctx.fillText(`Velocità: ${currentSpeed}`, leftCol, leftY);
        leftY += lineHeight;
        
        // COLONNA DESTRA
        // Esperienza e livello
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('⭐ ESPERIENZA', rightCol, rightY);
        rightY += lineHeight;
        
        ctx.fillStyle = '#cccccc';
        ctx.font = '14px Arial';
        ctx.fillText(`Livello: ${currentLevel}`, rightCol, rightY);
        rightY += lineHeight;
        
        ctx.fillText(`XP: ${currentExp}/${expToNext}`, rightCol, rightY);
        rightY += lineHeight;
        
        // Barra di esperienza
        const expBarWidth = 120;
        const expBarHeight = 6;
        const expBarX = rightCol;
        const expBarY = rightY + 2;
        
        // Sfondo barra
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(expBarX, expBarY, expBarWidth, expBarHeight);
        
        // Progresso barra
        const expProgress = currentExp / expToNext;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(expBarX, expBarY, expBarWidth * expProgress, expBarHeight);
        
        // Bordo barra
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(expBarX, expBarY, expBarWidth, expBarHeight);
        
        rightY += 20;
        
        // Risorse
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('💰 RISORSE', rightCol, rightY);
        rightY += lineHeight;
        
        ctx.fillStyle = '#cccccc';
        ctx.font = '14px Arial';
        ctx.fillText(`Crediti: ${upgradeManager.credits.toLocaleString()}`, rightCol, rightY);
        rightY += lineHeight;
        
        ctx.fillText(`Uridium: ${upgradeManager.uridium.toLocaleString()}`, rightCol, rightY);
        rightY += lineHeight;
        
        ctx.fillText(`Onore: ${ship.honor.toLocaleString()}`, rightCol, rightY);
        
        // Separatore centrale
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + width/2, y + 40);
        ctx.lineTo(x + width/2, y + height - 20);
        ctx.stroke();
    }
    
    drawRankContent(ctx, x, y, width, height, upgradeManager) {
        // Titolo sezione
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Sistema Rank', x, y + 25);
        
        // Ottieni informazioni sul rank
        const ship = window.gameInstance.ship;
        const rankSystem = window.gameInstance.rankSystem;
        const currentRank = rankSystem.getCurrentRank(ship.getHonor());
        const nextRank = rankSystem.getNextRank(ship.getHonor());
        const rankProgress = rankSystem.getRankProgress(ship.getHonor());
        
        // Rank corrente
        ctx.fillStyle = '#ffaa00';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${currentRank.symbol} ${currentRank.name}`, x + width/2, y + 60);
        
        // Onore attuale
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Onore Attuale: ${ship.getHonor().toLocaleString()}`, x + width/2, y + 85);
        
        // Se c'è un prossimo rank
        if (nextRank) {
            // Separatore
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x + 20, y + 110);
            ctx.lineTo(x + width - 20, y + 110);
            ctx.stroke();
            
            // Prossimo rank
            ctx.fillStyle = '#00ff88';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`Prossimo Rank: ${nextRank.symbol} ${nextRank.name}`, x + width/2, y + 135);
            
            // Onore necessario
            ctx.fillStyle = '#ffffff';
            ctx.font = '14px Arial';
            ctx.fillText(`Onore Necessario: ${rankProgress.needed.toLocaleString()}`, x + width/2, y + 160);
            
            // Barra di progresso
            const barWidth = width - 40;
            const barHeight = 8;
            const barX = x + 20;
            const barY = y + 180;
            
            // Sfondo barra
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            // Progresso barra
            ctx.fillStyle = '#ffaa00';
            ctx.fillRect(barX, barY, barWidth * rankProgress.progress, barHeight);
            
            // Bordo barra
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 1;
            ctx.strokeRect(barX, barY, barWidth, barHeight);
            
            // Percentuale
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${Math.round(rankProgress.progress * 100)}%`, x + width/2, barY + barHeight + 15);
        } else {
            // Rank massimo raggiunto
            ctx.fillStyle = '#ffaa00';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🏆 RANK MASSIMO RAGGIUNTO! 🏆', x + width/2, y + 135);
        }
    }
    
    // Controlla se il giocatore è nella safezone
    isInSafeZone() {
        if (!window.gameInstance || !window.gameInstance.ship || !window.gameInstance.spaceStation) {
            return false;
        }
        
        const ship = window.gameInstance.ship;
        const spaceStation = window.gameInstance.spaceStation;
        
        const dx = ship.x - spaceStation.x;
        const dy = ship.y - spaceStation.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < 1000; // Safe zone a 1000 pixel
    }
    

}
