// Pannello Home - Dashboard principale del gioco
export class HomePanel {
    constructor(game) {
        this.game = game;
        this.isOpen = false;
        this.width = 600;
        this.height = 400;
        this.x = 0;
        this.y = 0;
        this.dragging = false;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
    }
    
    // Apri/chiudi il pannello
    toggle() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.centerPanel();
        }
    }
    
    // Centra il pannello
    centerPanel() {
        this.x = (this.game.width - this.width) / 2;
        this.y = (this.game.height - this.height) / 2;
    }
    
    // Disegna il pannello
    draw(ctx) {
        if (!this.isOpen) return;
        
        // Sfondo scuro semi-trasparente
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, this.game.width, this.game.height);
        
        // Pannello principale (tema bianco e nero)
        ctx.fillStyle = '#000000';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        this.roundRect(ctx, this.x, this.y, this.width, this.height, 10);
        ctx.fill();
        ctx.stroke();
        
        // Titolo
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Home Dashboard', this.x + this.width/2, this.y + 35);
        
        // Pulsante chiudi
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + this.width - 35, this.y + 10, 25, 25);
        
        // Bordo pulsante
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x + this.width - 35, this.y + 10, 25, 25);
        
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('×', this.x + this.width - 22, this.y + 27);
        
        // Contenuto del pannello
        this.drawContent(ctx);
    }
    
    // Disegna il contenuto del pannello
    drawContent(ctx) {
        const startY = this.y + 80;
        const leftColumnX = this.x + 30;
        const rightColumnX = this.x + 320;
        
        // Titolo sezione sinistra
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Informazioni Giocatore', leftColumnX, startY);
        
        // Informazioni giocatore
        ctx.font = '14px Arial';
        const playerInfo = [
            `Nickname: ${this.game.ship.nickname || 'Player'}`,
            `Livello: ${this.game.ship.experience.getLevelInfo().level}`,
            `Esperienza: ${this.game.ship.experience.getLevelInfo().currentExp}/${this.game.ship.experience.getLevelInfo().expToNext}`,
            `Crediti: ${this.game.ship.credits || 0}`,
            `Settore: ${this.game.sectorSystem.currentSector || 'A1'}`
        ];
        
        playerInfo.forEach((info, index) => {
            ctx.fillText(info, leftColumnX, startY + 40 + (index * 25));
        });
        
        // Titolo sezione destra
        ctx.font = 'bold 18px Arial';
        ctx.fillText('Statistiche Rapide', rightColumnX, startY);
        
        // Statistiche
        ctx.font = '14px Arial';
        const stats = [
            `Nemici Eliminati: ${this.game.ship.enemiesKilled || 0}`,
            `Risorse Raccolte: ${this.game.ship.resourcesCollected || 0}`,
            `Missioni Completate: ${this.game.ship.questsCompleted || 0}`,
            `Tempo di Gioco: ${this.formatPlayTime()}`,
            `Velocità Massima: ${this.game.ship.maxSpeed || 5}`
        ];
        
        stats.forEach((stat, index) => {
            ctx.fillText(stat, rightColumnX, startY + 40 + (index * 25));
        });
        
        // Barra di progresso livello
        this.drawLevelProgress(ctx, leftColumnX, startY + 200);
        
        // Pulsanti di azione rapida
        this.drawQuickActions(ctx, rightColumnX, startY + 200);
    }
    
    // Disegna la barra di progresso del livello
    drawLevelProgress(ctx, x, y) {
        const barWidth = 250;
        const barHeight = 20;
        const progress = this.game.ship.experience.getLevelInfo().currentExp / this.game.ship.experience.getLevelInfo().expToNext;
        
        // Sfondo barra
        ctx.fillStyle = '#333333';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Bordo barra
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barWidth, barHeight);
        
        // Progresso barra
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y, barWidth * progress, barHeight);
        
        // Testo progresso
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Livello ${this.game.ship.experience.getLevelInfo().level}`, x + barWidth/2, y + 14);
    }
    
    // Disegna le azioni rapide
    drawQuickActions(ctx, x, y) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Azioni Rapide', x, y);
        
        // Pulsanti azioni
        const buttons = [
            { text: 'Inventario', action: 'inventory' },
            { text: 'Impostazioni', action: 'settings' },
            { text: 'Quest', action: 'quest' }
        ];
        
        buttons.forEach((button, index) => {
            const buttonY = y + 30 + (index * 35);
            
            // Sfondo pulsante
            ctx.fillStyle = '#333333';
            ctx.fillRect(x, buttonY, 120, 25);
            
            // Bordo pulsante
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, buttonY, 120, 25);
            
            // Testo pulsante
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(button.text, x + 60, buttonY + 16);
        });
    }
    
    // Formatta il tempo di gioco
    formatPlayTime() {
        const playTime = this.game.ship.playTime || 0;
        const hours = Math.floor(playTime / 3600);
        const minutes = Math.floor((playTime % 3600) / 60);
        return `${hours}h ${minutes}m`;
    }
    
    // Gestisce i click
    handleClick(x, y) {
        if (!this.isOpen) return false;
        
        // Controlla click su pulsante chiudi
        if (x >= this.x + this.width - 35 && x <= this.x + this.width - 10 &&
            y >= this.y + 10 && y <= this.y + 35) {
            this.toggle();
            return true;
        }
        
        // Controlla click su area drag (barra del titolo)
        if (x >= this.x + 10 && x <= this.x + this.width - 50 &&
            y >= this.y + 10 && y <= this.y + 40) {
            this.dragging = true;
            this.dragOffsetX = x - this.x;
            this.dragOffsetY = y - this.y;
            return true;
        }
        
        // Controlla click su pulsanti azioni rapide
        const rightColumnX = this.x + 320;
        const actionY = this.y + 230;
        const buttons = ['inventory', 'settings', 'quest'];
        
        buttons.forEach((action, index) => {
            const buttonY = actionY + (index * 35);
            if (x >= rightColumnX && x <= rightColumnX + 120 &&
                y >= buttonY && y <= buttonY + 25) {
                this.handleQuickAction(action);
                return true;
            }
        });
        
        return false;
    }
    
    // Gestisce le azioni rapide
    handleQuickAction(action) {
        switch (action) {
            case 'inventory':
                this.game.inventory.toggle();
                break;
            case 'settings':
                this.game.settingsPanel.toggle();
                break;
            case 'quest':
                this.game.questPanel.toggle();
                break;
        }
    }
    
    // Gestisce il movimento del mouse per il drag
    handleMouseMove(x, y) {
        if (this.dragging) {
            this.x = x - this.dragOffsetX;
            this.y = y - this.dragOffsetY;
            
            // Limita il pannello entro i bordi dello schermo
            this.x = Math.max(0, Math.min(this.x, this.game.width - this.width));
            this.y = Math.max(0, Math.min(this.y, this.game.height - this.height));
        }
    }
    
    // Ferma il drag
    stopDragging() {
        this.dragging = false;
    }
    
    // Utility per disegnare rettangoli arrotondati
    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
}
