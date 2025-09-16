// Pannello Fazioni - Selezione e gestione fazioni
import { UIComponent } from './UIComponent.js';

export class FactionPanel extends UIComponent {
    constructor(game) {
        super('faction-panel', { x: 0, y: 0, width: 700, height: 500 });
        this.game = game;
        this.visible = false;
        this.isOpen = false;
        this.selectedFactionId = null;
        this.hoveredFactionId = null;
        
        // Posizione centrata
        this.x = (this.game.width - this.width) / 2;
        this.y = (this.game.height - this.height) / 2;
        
        // Stile
        this.backgroundColor = '#1a1a2e';
        this.borderColor = '#4a90e2';
        this.textColor = '#ffffff';
        this.titleColor = '#FFD700';
        this.buttonColor = '#4a90e2';
        this.buttonHoverColor = '#5ba0f2';
        this.dangerColor = '#e74c3c';
        this.successColor = '#27ae60';
        
        // Dimensioni elementi
        this.factionCardWidth = 180;
        this.factionCardHeight = 250;
        this.factionCardSpacing = 15;
    }
    
    /**
     * Apri il pannello
     */
    open() {
        this.visible = true;
        this.isOpen = true;
        this.selectedFactionId = this.game.factionSystem?.currentFaction || null;
    }
    
    /**
     * Chiudi il pannello
     */
    close() {
        this.visible = false;
        this.isOpen = false;
        this.selectedFactionId = null;
        this.hoveredFactionId = null;
    }
    
    /**
     * Toggle del pannello
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    /**
     * Gestisce i click
     */
    handleClick(x, y) {
        if (!this.visible) return false;
        
        // Pulsante Chiudi
        if (this.isPointInButton(x, y, this.x + this.width - 40, this.y + 10, 30, 30)) {
            this.close();
            return true;
        }
        
        // Click su carte fazioni
        const factions = this.game.factionSystem?.getAllFactions() || [];
        const startX = this.x + 30;
        const startY = this.y + 80;
        
        factions.forEach((faction, index) => {
            const cardX = startX + (index % 3) * (this.factionCardWidth + this.factionCardSpacing);
            const cardY = startY + Math.floor(index / 3) * (this.factionCardHeight + this.factionCardSpacing);
            
            if (this.isPointInButton(x, y, cardX, cardY, this.factionCardWidth, this.factionCardHeight)) {
                this.selectedFactionId = faction.id;
                return true;
            }
        });
        
        // Pulsante Seleziona Fazione
        if (this.selectedFactionId && this.isPointInButton(x, y, this.x + 30, this.y + 400, 200, 50)) {
            this.selectFaction();
            return true;
        }
        
        // Pulsante Abbandona Fazione
        if (this.game.factionSystem?.currentFaction && this.isPointInButton(x, y, this.x + 250, this.y + 400, 200, 50)) {
            this.leaveFaction();
            return true;
        }
        
        return false;
    }
    
    /**
     * Gestisce il movimento del mouse
     */
    handleMouseMove(x, y) {
        if (!this.visible) return;
        
        // Reset hover
        this.hoveredFactionId = null;
        
        // Controlla hover su carte fazioni
        const factions = this.game.factionSystem?.getAllFactions() || [];
        const startX = this.x + 30;
        const startY = this.y + 80;
        
        factions.forEach((faction, index) => {
            const cardX = startX + (index % 3) * (this.factionCardWidth + this.factionCardSpacing);
            const cardY = startY + Math.floor(index / 3) * (this.factionCardHeight + this.factionCardSpacing);
            
            if (this.isPointInButton(x, y, cardX, cardY, this.factionCardWidth, this.factionCardHeight)) {
                this.hoveredFactionId = faction.id;
            }
        });
    }
    
    /**
     * Seleziona la fazione
     */
    selectFaction() {
        if (!this.selectedFactionId || !this.game.factionSystem) return;
        
        const success = this.game.factionSystem.selectFaction(this.selectedFactionId, this.game.ship);
        
        if (success) {
            // Notifica successo
            if (this.game.notifications) {
                const faction = this.game.factionSystem.getCurrentFaction();
                this.game.notifications.add(`🎯 Fazione ${faction.name} selezionata!`, 3000, 'success');
            }
            
            this.close();
        } else {
            // Notifica errore
            if (this.game.notifications) {
                this.game.notifications.add('❌ Impossibile selezionare la fazione', 3000, 'error');
            }
        }
    }
    
    /**
     * Abbandona la fazione corrente
     */
    leaveFaction() {
        if (!this.game.factionSystem?.currentFaction) return;
        
        if (confirm('Sei sicuro di voler abbandonare la fazione corrente?')) {
            const oldFaction = this.game.factionSystem.getCurrentFaction();
            this.game.factionSystem.currentFaction = null;
            this.game.factionSystem.removeFactionBonuses(this.game.ship);
            
            // Notifica
            if (this.game.notifications) {
                this.game.notifications.add(`🚪 Fazione ${oldFaction.name} abbandonata`, 3000, 'info');
            }
            
            this.close();
        }
    }
    
    /**
     * Disegna il pannello
     */
    draw(ctx) {
        if (!this.visible) return;
        
        // Sfondo semi-trasparente
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.game.width, this.game.height);
        
        // Pannello principale
        ctx.fillStyle = this.backgroundColor;
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 2;
        
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Titolo
        ctx.fillStyle = this.titleColor;
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🎯 Selezione Fazione', this.x + this.width / 2, this.y + 40);
        
        // Pulsante Chiudi
        ctx.fillStyle = this.dangerColor;
        ctx.fillRect(this.x + this.width - 40, this.y + 10, 30, 30);
        ctx.fillStyle = this.textColor;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('✕', this.x + this.width - 25, this.y + 30);
        
        // Disegna carte fazioni
        this.drawFactionCards(ctx);
        
        // Disegna pulsanti
        this.drawButtons(ctx);
        
        // Disegna informazioni fazione corrente
        this.drawCurrentFactionInfo(ctx);
    }
    
    /**
     * Disegna le carte delle fazioni
     */
    drawFactionCards(ctx) {
        const factions = this.game.factionSystem?.getAllFactions() || [];
        const startX = this.x + 30;
        const startY = this.y + 80;
        
        factions.forEach((faction, index) => {
            const cardX = startX + (index % 3) * (this.factionCardWidth + this.factionCardSpacing);
            const cardY = startY + Math.floor(index / 3) * (this.factionCardHeight + this.factionCardSpacing);
            
            this.drawFactionCard(ctx, faction, cardX, cardY);
        });
    }
    
    /**
     * Disegna una singola carta fazione
     */
    drawFactionCard(ctx, faction, x, y) {
        const isSelected = this.selectedFactionId === faction.id;
        const isHovered = this.hoveredFactionId === faction.id;
        const isCurrent = this.game.factionSystem?.currentFaction === faction.id;
        
        // Colore bordo
        let borderColor = this.borderColor;
        if (isCurrent) {
            borderColor = this.successColor;
        } else if (isSelected) {
            borderColor = this.buttonColor;
        } else if (isHovered) {
            borderColor = this.buttonHoverColor;
        }
        
        // Sfondo carta
        ctx.fillStyle = isHovered ? '#2a2a3e' : '#1a1a2e';
        ctx.fillRect(x, y, this.factionCardWidth, this.factionCardHeight);
        
        // Bordo
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = isSelected ? 3 : 1;
        ctx.strokeRect(x, y, this.factionCardWidth, this.factionCardHeight);
        
        // Icona fazione
        ctx.fillStyle = faction.color;
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(faction.icon, x + this.factionCardWidth / 2, y + 60);
        
        // Nome fazione
        ctx.fillStyle = this.titleColor;
        ctx.font = 'bold 18px Arial';
        ctx.fillText(faction.name, x + this.factionCardWidth / 2, y + 90);
        
        // Nome completo
        ctx.fillStyle = this.textColor;
        ctx.font = '12px Arial';
        ctx.fillText(faction.fullName, x + this.factionCardWidth / 2, y + 110);
        
        // Descrizione
        ctx.font = '11px Arial';
        const description = this.wrapText(ctx, faction.description, this.factionCardWidth - 20);
        let textY = y + 130;
        description.forEach(line => {
            ctx.fillText(line, x + 10, textY);
            textY += 12;
        });
        
        // Tecnologie esclusive
        ctx.fillStyle = this.successColor;
        ctx.font = 'bold 12px Arial';
        ctx.fillText('Tecnologie:', x + 10, textY + 10);
        
        ctx.fillStyle = this.textColor;
        ctx.font = '10px Arial';
        let techY = textY + 25;
        
        faction.exclusiveTech.forEach((tech, index) => {
            if (index < 2) { // Mostra solo le prime 2 tecnologie per spazio
                ctx.fillText(`• ${tech}`, x + 10, techY);
                techY += 12;
            }
        });
        
        if (faction.exclusiveTech.length > 2) {
            ctx.fillText(`• +${faction.exclusiveTech.length - 2} altre...`, x + 10, techY);
        }
        
        // Stato corrente
        if (isCurrent) {
            ctx.fillStyle = this.successColor;
            ctx.font = 'bold 14px Arial';
            ctx.fillText('ATTIVA', x + this.factionCardWidth / 2, y + this.factionCardHeight - 10);
        }
    }
    
    /**
     * Disegna i pulsanti
     */
    drawButtons(ctx) {
        const buttonY = this.y + 400;
        const buttonWidth = 200;
        const buttonHeight = 50;
        const buttonSpacing = 20;
        
        // Pulsante Seleziona Fazione
        if (this.selectedFactionId && this.selectedFactionId !== this.game.factionSystem?.currentFaction) {
            this.drawButton(ctx, '🎯 Seleziona Fazione', this.x + 30, buttonY, buttonWidth, buttonHeight);
        }
        
        // Pulsante Abbandona Fazione
        if (this.game.factionSystem?.currentFaction) {
            this.drawButton(ctx, '🚪 Abbandona Fazione', this.x + 250, buttonY, buttonWidth, buttonHeight, false, this.dangerColor);
        }
    }
    
    /**
     * Disegna informazioni fazione corrente
     */
    drawCurrentFactionInfo(ctx) {
        const currentFaction = this.game.factionSystem?.getCurrentFaction();
        if (!currentFaction) return;
        
        const infoX = this.x + 450;
        const infoY = this.y + 80;
        
        // Titolo
        ctx.fillStyle = this.titleColor;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Fazione Attiva:', infoX, infoY);
        
        // Nome fazione
        ctx.fillStyle = currentFaction.color;
        ctx.font = 'bold 20px Arial';
        ctx.fillText(`${currentFaction.icon} ${currentFaction.name}`, infoX, infoY + 30);
        
        // Reputazione
        const reputation = this.game.factionSystem?.getReputation(currentFaction.id) || 0;
        ctx.fillStyle = this.textColor;
        ctx.font = '14px Arial';
        ctx.fillText(`Reputazione: ${reputation}`, infoX, infoY + 60);
        
        // Tecnologie esclusive
        ctx.fillText('Tecnologie Esclusive:', infoX, infoY + 90);
        ctx.font = '12px Arial';
        currentFaction.exclusiveTech.forEach((tech, index) => {
            ctx.fillText(`• ${tech}`, infoX, infoY + 110 + (index * 15));
        });
    }
    
    /**
     * Disegna un pulsante
     */
    drawButton(ctx, text, x, y, width, height, disabled = false, color = null) {
        const buttonColor = color || (disabled ? '#666666' : this.buttonColor);
        
        ctx.fillStyle = buttonColor;
        ctx.fillRect(x, y, width, height);
        
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
        
        ctx.fillStyle = disabled ? '#999999' : this.textColor;
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, x + width / 2, y + height / 2 + 5);
    }
    
    /**
     * Wrappa il testo per adattarlo alla larghezza
     */
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
    
    /**
     * Controlla se un punto è dentro un pulsante
     */
    isPointInButton(x, y, buttonX, buttonY, buttonWidth, buttonHeight) {
        return x >= buttonX && x <= buttonX + buttonWidth && 
               y >= buttonY && y <= buttonY + buttonHeight;
    }
    
    /**
     * Aggiorna il pannello
     */
    update() {
        // Aggiorna posizione se la finestra è stata ridimensionata
        this.x = (this.game.width - this.width) / 2;
        this.y = (this.game.height - this.height) / 2;
    }
}

