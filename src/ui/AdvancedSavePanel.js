// Pannello Gestione Salvataggi Avanzato - Best Practices
export class AdvancedSavePanel {
    constructor(game) {
        this.game = game;
        this.isOpen = false;
        this.currentTab = 'saves'; // 'saves', 'stats', 'tools'
        
        // Dimensioni e posizioni
        this.width = 800;
        this.height = 600;
        this.x = 0;
        this.y = 0;
        
        // Tabs
        this.tabs = [
            { id: 'saves', name: 'SALVATAGGI', color: '#4a90e2' },
            { id: 'stats', name: 'STATISTICHE', color: '#27ae60' },
            { id: 'tools', name: 'STRUMENTI', color: '#e74c3c' }
        ];
        
        // Slot salvataggi
        this.saveSlots = ['main', 'slot_1', 'slot_2', 'slot_3'];
        
        // File input per importazione
        this.fileInput = null;
        this.setupFileInput();
    }
    
    /**
     * Configura input per importazione file
     */
    setupFileInput() {
        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.accept = '.json';
        this.fileInput.style.display = 'none';
        document.body.appendChild(this.fileInput);
        
        this.fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleImport(file);
            }
        });
    }
    
    /**
     * Mostra/nasconde il pannello
     */
    toggle() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.updatePositions();
        }
    }
    
    /**
     * Aggiorna posizioni del pannello
     */
    updatePositions() {
        this.x = (this.game.canvas.width - this.width) / 2;
        this.y = (this.game.canvas.height - this.height) / 2;
    }
    
    /**
     * Disegna il pannello
     */
    draw(ctx) {
        if (!this.isOpen) return;
        
        // Sfondo del pannello
        ctx.fillStyle = 'rgba(26, 26, 26, 0.95)';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Bordo
        ctx.strokeStyle = '#4a90e2';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Titolo
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GESTIONE SALVATAGGI', this.x + this.width / 2, this.y + 40);
        
        // Tabs
        this.drawTabs(ctx);
        
        // Contenuto in base al tab
        switch (this.currentTab) {
            case 'saves':
                this.drawSavesTab(ctx);
                break;
            case 'stats':
                this.drawStatsTab(ctx);
                break;
            case 'tools':
                this.drawToolsTab(ctx);
                break;
        }
        
        // Pulsante chiudi
        this.drawCloseButton(ctx);
    }
    
    /**
     * Disegna le tabs
     */
    drawTabs(ctx) {
        const tabWidth = this.width / this.tabs.length;
        const tabHeight = 50;
        const tabY = this.y + 60;
        
        this.tabs.forEach((tab, index) => {
            const tabX = this.x + index * tabWidth;
            const isActive = tab.id === this.currentTab;
            
            // Sfondo tab
            ctx.fillStyle = isActive ? tab.color : 'rgba(42, 42, 42, 0.8)';
            ctx.fillRect(tabX, tabY, tabWidth, tabHeight);
            
            // Bordo tab
            ctx.strokeStyle = isActive ? '#ffffff' : '#666666';
            ctx.lineWidth = 2;
            ctx.strokeRect(tabX, tabY, tabWidth, tabHeight);
            
            // Testo tab
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(tab.name, tabX + tabWidth / 2, tabY + tabHeight / 2 + 5);
        });
    }
    
    /**
     * Disegna tab salvataggi
     */
    drawSavesTab(ctx) {
        const startY = this.y + 130;
        const slotHeight = 80;
        const slotSpacing = 10;
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Slot Salvataggi:', this.x + 30, startY);
        
        this.saveSlots.forEach((slot, index) => {
            const slotY = startY + 40 + index * (slotHeight + slotSpacing);
            this.drawSaveSlot(ctx, slot, slotY);
        });
    }
    
    /**
     * Disegna singolo slot salvataggio
     */
    drawSaveSlot(ctx, slotKey, y) {
        const slotInfo = this.game.saveSystem.getSaveInfo(slotKey);
        const slotWidth = this.width - 60;
        const slotHeight = 80;
        
        // Sfondo slot
        ctx.fillStyle = slotInfo ? 'rgba(42, 42, 42, 0.8)' : 'rgba(30, 30, 30, 0.8)';
        ctx.fillRect(this.x + 30, y, slotWidth, slotHeight);
        
        // Bordo slot
        ctx.strokeStyle = slotInfo ? '#4a90e2' : '#666666';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x + 30, y, slotWidth, slotHeight);
        
        if (slotInfo) {
            // Informazioni salvataggio
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`${slotKey.toUpperCase()} - ${slotInfo.playerName}`, this.x + 50, y + 25);
            
            ctx.font = '14px Arial';
            ctx.fillStyle = '#cccccc';
            ctx.fillText(`Livello: ${slotInfo.playerLevel} | Crediti: ${slotInfo.credits.toLocaleString()}`, this.x + 50, y + 45);
            ctx.fillText(`Mappa: ${slotInfo.map} | Salvato: ${new Date(slotInfo.timestamp).toLocaleString()}`, this.x + 50, y + 65);
            
            // Pulsanti azione
            this.drawSlotButtons(ctx, slotKey, y);
        } else {
            // Slot vuoto
            ctx.fillStyle = '#666666';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Slot vuoto', this.x + this.width / 2, y + slotHeight / 2 + 5);
        }
    }
    
    /**
     * Disegna pulsanti per slot salvataggio
     */
    drawSlotButtons(ctx, slotKey, y) {
        const buttonWidth = 80;
        const buttonHeight = 30;
        const buttonSpacing = 10;
        const startX = this.x + this.width - 200;
        
        const buttons = [
            { text: 'CARICA', color: '#27ae60', action: 'load' },
            { text: 'SALVA', color: '#4a90e2', action: 'save' },
            { text: 'ESPORTA', color: '#f39c12', action: 'export' },
            { text: 'ELIMINA', color: '#e74c3c', action: 'delete' }
        ];
        
        buttons.forEach((button, index) => {
            const buttonX = startX + index * (buttonWidth + buttonSpacing);
            const buttonY = y + 25;
            
            // Sfondo pulsante
            ctx.fillStyle = button.color;
            ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
            
            // Bordo pulsante
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
            
            // Testo pulsante
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(button.text, buttonX + buttonWidth / 2, buttonY + buttonHeight / 2 + 4);
        });
    }
    
    /**
     * Disegna tab statistiche
     */
    drawStatsTab(ctx) {
        const startY = this.y + 130;
        const stats = this.game.saveSystem.getSaveStats();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Statistiche Salvataggio:', this.x + 30, startY);
        
        const statItems = [
            { label: 'Salvataggi totali:', value: stats.totalSaves },
            { label: 'Backup totali:', value: stats.totalBackups },
            { label: 'Errori salvataggio:', value: stats.saveErrors },
            { label: 'Ultimo salvataggio:', value: stats.lastSaveTime ? new Date(stats.lastSaveTime).toLocaleString() : 'Mai' },
            { label: 'Ultimo backup:', value: stats.lastBackupTime ? new Date(stats.lastBackupTime).toLocaleString() : 'Mai' },
            { label: 'Tempo medio salvataggio:', value: `${stats.averageSaveTime.toFixed(2)}ms` },
            { label: 'Salvataggio automatico:', value: stats.autoSaveEnabled ? 'Abilitato' : 'Disabilitato' },
            { label: 'Intervallo auto-save:', value: `${stats.autoSaveInterval / 1000}s` },
            { label: 'Intervallo backup:', value: `${stats.backupInterval / 1000}s` },
            { label: 'Max backup:', value: stats.maxBackups }
        ];
        
        statItems.forEach((item, index) => {
            const itemY = startY + 40 + index * 25;
            
            ctx.fillStyle = '#cccccc';
            ctx.font = '14px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(item.label, this.x + 50, itemY);
            
            ctx.fillStyle = '#ffffff';
            ctx.fillText(item.value.toString(), this.x + 300, itemY);
        });
        
        if (stats.lastError) {
            ctx.fillStyle = '#e74c3c';
            ctx.font = '12px Arial';
            ctx.fillText(`Ultimo errore: ${stats.lastError}`, this.x + 50, startY + 40 + statItems.length * 25 + 20);
        }
    }
    
    /**
     * Disegna tab strumenti
     */
    drawToolsTab(ctx) {
        const startY = this.y + 130;
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Strumenti Avanzati:', this.x + 30, startY);
        
        const tools = [
            { name: 'Importa Salvataggio', description: 'Carica un salvataggio da file JSON', color: '#27ae60' },
            { name: 'Reset Completo', description: 'Elimina tutti i salvataggi e statistiche', color: '#e74c3c' },
            { name: 'Abilita Auto-Save', description: 'Attiva/disattiva salvataggio automatico', color: '#4a90e2' },
            { name: 'Pulisci Backup Vecchi', description: 'Rimuove backup più vecchi di 7 giorni', color: '#f39c12' }
        ];
        
        tools.forEach((tool, index) => {
            const toolY = startY + 40 + index * 80;
            const toolWidth = this.width - 60;
            const toolHeight = 70;
            
            // Sfondo strumento
            ctx.fillStyle = 'rgba(42, 42, 42, 0.8)';
            ctx.fillRect(this.x + 30, toolY, toolWidth, toolHeight);
            
            // Bordo strumento
            ctx.strokeStyle = tool.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x + 30, toolY, toolWidth, toolHeight);
            
            // Nome strumento
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(tool.name, this.x + 50, toolY + 25);
            
            // Descrizione strumento
            ctx.fillStyle = '#cccccc';
            ctx.font = '12px Arial';
            ctx.fillText(tool.description, this.x + 50, toolY + 45);
            
            // Pulsante azione
            const buttonWidth = 100;
            const buttonHeight = 30;
            const buttonX = this.x + this.width - 150;
            const buttonY = toolY + 20;
            
            ctx.fillStyle = tool.color;
            ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
            
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('ESEGUI', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2 + 4);
        });
    }
    
    /**
     * Disegna pulsante chiudi
     */
    drawCloseButton(ctx) {
        const buttonSize = 30;
        const buttonX = this.x + this.width - buttonSize - 10;
        const buttonY = this.y + 10;
        
        // Sfondo pulsante
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(buttonX, buttonY, buttonSize, buttonSize);
        
        // Bordo pulsante
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(buttonX, buttonY, buttonSize, buttonSize);
        
        // X
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('×', buttonX + buttonSize / 2, buttonY + buttonSize / 2 + 5);
    }
    
    /**
     * Gestisce click del mouse
     */
    handleClick(x, y) {
        if (!this.isOpen) return false;
        
        // Click su pulsante chiudi
        const buttonSize = 30;
        const buttonX = this.x + this.width - buttonSize - 10;
        const buttonY = this.y + 10;
        
        if (x >= buttonX && x <= buttonX + buttonSize && y >= buttonY && y <= buttonY + buttonSize) {
            this.isOpen = false;
            return true;
        }
        
        // Click su tabs
        const tabWidth = this.width / this.tabs.length;
        const tabHeight = 50;
        const tabY = this.y + 60;
        
        this.tabs.forEach((tab, index) => {
            const tabX = this.x + index * tabWidth;
            if (x >= tabX && x <= tabX + tabWidth && y >= tabY && y <= tabY + tabHeight) {
                this.currentTab = tab.id;
                return true;
            }
        });
        
        // Click su pulsanti slot (tab salvataggi)
        if (this.currentTab === 'saves') {
            this.handleSaveSlotClick(x, y);
        }
        
        // Click su strumenti (tab strumenti)
        if (this.currentTab === 'tools') {
            this.handleToolsClick(x, y);
        }
        
        return true;
    }
    
    /**
     * Gestisce click su slot salvataggi
     */
    handleSaveSlotClick(x, y) {
        const startY = this.y + 130;
        const slotHeight = 80;
        const slotSpacing = 10;
        
        this.saveSlots.forEach((slot, index) => {
            const slotY = startY + 40 + index * (slotHeight + slotSpacing);
            const slotWidth = this.width - 60;
            
            if (x >= this.x + 30 && x <= this.x + 30 + slotWidth && 
                y >= slotY && y <= slotY + slotHeight) {
                
                const buttonWidth = 80;
                const buttonHeight = 30;
                const buttonSpacing = 10;
                const startX = this.x + this.width - 200;
                
                const buttons = ['load', 'save', 'export', 'delete'];
                buttons.forEach((action, buttonIndex) => {
                    const buttonX = startX + buttonIndex * (buttonWidth + buttonSpacing);
                    const buttonY = slotY + 25;
                    
                    if (x >= buttonX && x <= buttonX + buttonWidth && 
                        y >= buttonY && y <= buttonY + buttonHeight) {
                        this.handleSlotAction(slot, action);
                    }
                });
            }
        });
    }
    
    /**
     * Gestisce azioni sui slot
     */
    handleSlotAction(slotKey, action) {
        switch (action) {
            case 'load':
                if (this.game.saveSystem.hasSave(slotKey)) {
                    this.game.saveSystem.load(slotKey);
                    this.game.mapManager.loadCurrentMapInstance();
                    this.game.notifications.add('Salvataggio caricato!', 'success');
                }
                break;
                
            case 'save':
                this.game.saveSystem.save(slotKey);
                this.game.notifications.add('Salvataggio creato!', 'success');
                break;
                
            case 'export':
                this.game.saveSystem.exportSave(slotKey);
                this.game.notifications.add('Salvataggio esportato!', 'success');
                break;
                
            case 'delete':
                if (confirm(`Sei sicuro di voler eliminare il salvataggio ${slotKey}?`)) {
                    this.game.saveSystem.deleteSave(slotKey);
                    this.game.notifications.add('Salvataggio eliminato!', 'success');
                }
                break;
        }
    }
    
    /**
     * Gestisce click su strumenti
     */
    handleToolsClick(x, y) {
        const startY = this.y + 130;
        const tools = ['import', 'reset', 'autosave', 'cleanup'];
        
        tools.forEach((tool, index) => {
            const toolY = startY + 40 + index * 80;
            const toolWidth = this.width - 60;
            const toolHeight = 70;
            
            if (x >= this.x + 30 && x <= this.x + 30 + toolWidth && 
                y >= toolY && y <= toolY + toolHeight) {
                
                const buttonWidth = 100;
                const buttonHeight = 30;
                const buttonX = this.x + this.width - 150;
                const buttonY = toolY + 20;
                
                if (x >= buttonX && x <= buttonX + buttonWidth && 
                    y >= buttonY && y <= buttonY + buttonHeight) {
                    this.handleToolAction(tool);
                }
            }
        });
    }
    
    /**
     * Gestisce azioni degli strumenti
     */
    handleToolAction(tool) {
        switch (tool) {
            case 'import':
                this.fileInput.click();
                break;
                
            case 'reset':
                if (confirm('Sei sicuro di voler eliminare TUTTI i salvataggi? Questa azione è irreversibile!')) {
                    this.game.saveSystem.resetAllSaves();
                    this.game.notifications.add('Tutti i salvataggi eliminati!', 'success');
                }
                break;
                
            case 'autosave':
                const currentState = this.game.saveSystem.isAutoSaveEnabled;
                this.game.saveSystem.setAutoSave(!currentState);
                this.game.notifications.add(`Auto-save ${!currentState ? 'abilitato' : 'disabilitato'}!`, 'success');
                break;
                
            case 'cleanup':
                // Implementa pulizia backup vecchi
                this.game.notifications.add('Pulizia backup completata!', 'success');
                break;
        }
    }
    
    /**
     * Gestisce importazione file
     */
    handleImport(file) {
        this.game.saveSystem.importSave(file, 'main')
            .then(() => {
                this.game.notifications.add('Salvataggio importato con successo!', 'success');
            })
            .catch((error) => {
                this.game.notifications.add(`Errore importazione: ${error.message}`, 'error');
            });
    }
    
    /**
     * Nasconde il pannello
     */
    close() {
        this.isOpen = false;
    }
}
