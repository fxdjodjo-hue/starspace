/**
 * Pannello per gestire salvataggi e caricamenti
 */
export class SaveLoadPanel {
    constructor(game) {
        this.game = game;
        this.visible = false;
        this.selectedSlot = 0;
        this.slots = 3; // 3 slot di salvataggio
    }

    /**
     * Mostra/nasconde il pannello
     */
    toggle() {
        this.visible = !this.visible;
    }

    /**
     * Disegna il pannello
     */
    draw(ctx) {
        if (!this.visible) return;

        const canvas = this.game.canvas;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const panelWidth = 500;
        const panelHeight = 400;

        // Sfondo semi-trasparente
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Pannello principale
        ctx.fillStyle = 'rgba(20, 20, 40, 0.95)';
        ctx.fillRect(centerX - panelWidth/2, centerY - panelHeight/2, panelWidth, panelHeight);

        // Bordo
        ctx.strokeStyle = '#4a90e2';
        ctx.lineWidth = 2;
        ctx.strokeRect(centerX - panelWidth/2, centerY - panelHeight/2, panelWidth, panelHeight);

        // Titolo
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Gestione Salvataggi', centerX, centerY - panelHeight/2 + 40);

        // Slot di salvataggio
        this.drawSaveSlots(ctx, centerX, centerY, panelWidth, panelHeight);

        // Pulsanti
        this.drawButtons(ctx, centerX, centerY, panelWidth, panelHeight);

        ctx.textAlign = 'left';
    }

    /**
     * Disegna gli slot di salvataggio
     */
    drawSaveSlots(ctx, centerX, centerY, panelWidth, panelHeight) {
        const slotWidth = panelWidth - 40;
        const slotHeight = 60;
        const startY = centerY - panelHeight/2 + 80;

        for (let i = 0; i < this.slots; i++) {
            const slotY = startY + i * (slotHeight + 10);
            const isSelected = i === this.selectedSlot;
            const hasSave = this.game.saveSystem.hasSave(`slot_${i + 1}`);

            // Sfondo slot
            ctx.fillStyle = isSelected ? 'rgba(74, 144, 226, 0.3)' : 'rgba(40, 40, 60, 0.8)';
            ctx.fillRect(centerX - slotWidth/2, slotY, slotWidth, slotHeight);

            // Bordo
            ctx.strokeStyle = isSelected ? '#4a90e2' : '#666666';
            ctx.lineWidth = isSelected ? 2 : 1;
            ctx.strokeRect(centerX - slotWidth/2, slotY, slotWidth, slotHeight);

            // Testo slot
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`Slot ${i + 1}`, centerX - slotWidth/2 + 15, slotY + 25);

            if (hasSave) {
                // Data salvataggio
                const saveData = this.game.saveSystem.getSaveData(`slot_${i + 1}`);
                ctx.font = '12px Arial';
                ctx.fillStyle = '#cccccc';
                ctx.fillText(`Salvato: ${saveData.timestamp || 'Data sconosciuta'}`, centerX - slotWidth/2 + 15, slotY + 45);
            } else {
                ctx.font = '12px Arial';
                ctx.fillStyle = '#888888';
                ctx.fillText('Vuoto', centerX - slotWidth/2 + 15, slotY + 45);
            }
        }
    }

    /**
     * Disegna i pulsanti
     */
    drawButtons(ctx, centerX, centerY, panelWidth, panelHeight) {
        const buttonWidth = 100;
        const buttonHeight = 35;
        const buttonY = centerY + panelHeight/2 - 60;
        const buttonSpacing = 20;

        // Pulsante Salva
        const saveX = centerX - buttonWidth - buttonSpacing/2;
        this.drawButton(ctx, 'Salva', saveX, buttonY, buttonWidth, buttonHeight, '#4a90e2');

        // Pulsante Carica
        const loadX = centerX + buttonSpacing/2;
        this.drawButton(ctx, 'Carica', loadX, buttonY, buttonWidth, buttonHeight, '#28a745');

        // Pulsante Elimina
        const deleteX = centerX - buttonWidth/2;
        const deleteY = buttonY + buttonHeight + 10;
        this.drawButton(ctx, 'Elimina', deleteX, deleteY, buttonWidth, buttonHeight, '#dc3545');

        // Pulsante Chiudi
        const closeX = centerX + panelWidth/2 - 30;
        const closeY = centerY - panelHeight/2 + 10;
        this.drawButton(ctx, '×', closeX, closeY, 25, 25, '#dc3545');
    }

    /**
     * Disegna un singolo pulsante
     */
    drawButton(ctx, text, x, y, width, height, color) {
        // Sfondo
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height);

        // Bordo
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);

        // Testo
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, x + width/2, y + height/2 + 5);
    }

    /**
     * Gestisce i click
     */
    handleClick(x, y) {
        if (!this.visible) return false;

        const canvas = this.game.canvas;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const panelWidth = 500;
        const panelHeight = 400;

        // Pulsante Chiudi
        const closeX = centerX + panelWidth/2 - 30;
        const closeY = centerY - panelHeight/2 + 10;
        if (x >= closeX && x <= closeX + 25 && y >= closeY && y <= closeY + 25) {
            this.visible = false;
            return true;
        }

        // Slot di salvataggio
        const slotWidth = panelWidth - 40;
        const slotHeight = 60;
        const startY = centerY - panelHeight/2 + 80;

        for (let i = 0; i < this.slots; i++) {
            const slotY = startY + i * (slotHeight + 10);
            if (x >= centerX - slotWidth/2 && x <= centerX + slotWidth/2 && 
                y >= slotY && y <= slotY + slotHeight) {
                this.selectedSlot = i;
                return true;
            }
        }

        // Pulsanti
        const buttonWidth = 100;
        const buttonHeight = 35;
        const buttonY = centerY + panelHeight/2 - 60;
        const buttonSpacing = 20;

        // Pulsante Salva
        const saveX = centerX - buttonWidth - buttonSpacing/2;
        if (x >= saveX && x <= saveX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight) {
            this.saveToSlot();
            return true;
        }

        // Pulsante Carica
        const loadX = centerX + buttonSpacing/2;
        if (x >= loadX && x <= loadX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight) {
            this.loadFromSlot();
            return true;
        }

        // Pulsante Elimina
        const deleteX = centerX - buttonWidth/2;
        const deleteY = buttonY + buttonHeight + 10;
        if (x >= deleteX && x <= deleteX + buttonWidth && y >= deleteY && y <= deleteY + buttonHeight) {
            this.deleteSlot();
            return true;
        }

        return true; // Blocca altri click
    }

    /**
     * Salva nel slot selezionato
     */
    saveToSlot() {
        const slotKey = `slot_${this.selectedSlot + 1}`;
        this.game.saveSystem.save(slotKey);
        console.log(`💾 Salvataggio nel slot ${this.selectedSlot + 1}`);
    }

    /**
     * Carica dal slot selezionato
     */
    loadFromSlot() {
        const slotKey = `slot_${this.selectedSlot + 1}`;
        if (this.game.saveSystem.hasSave(slotKey)) {
            this.game.saveSystem.load(slotKey);
            console.log(`📁 Caricamento dal slot ${this.selectedSlot + 1}`);
        } else {
            console.log('❌ Nessun salvataggio nel slot selezionato');
        }
    }

    /**
     * Elimina il slot selezionato
     */
    deleteSlot() {
        const slotKey = `slot_${this.selectedSlot + 1}`;
        if (this.game.saveSystem.hasSave(slotKey)) {
            this.game.saveSystem.deleteSave(slotKey);
            console.log(`🗑️ Slot ${this.selectedSlot + 1} eliminato`);
        } else {
            console.log('❌ Nessun salvataggio da eliminare nel slot selezionato');
        }
    }

    /**
     * Aggiorna il pannello
     */
    update() {
        // Logica di aggiornamento se necessaria
    }
}