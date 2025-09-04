// Modulo Tracker Quest per UI in tempo reale
export class QuestTracker {
    constructor(game) {
        this.game = game;
        this.isVisible = true;
        this.isDragging = false;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        this.dragStartTime = 0;
        this.lastClickTime = 0;
        this.mouseWasDown = false;
        
        // Navigazione quest
        this.currentQuestIndex = 0;
        this.questsPerPage = 1;
        

        
        // Posizione e dimensioni
        this.x = 20;
        this.y = 20;
        this.width = 320;
        this.maxHeight = 400;
        this.questHeight = 100;
        this.maxQuests = 3; // Massimo 3 quest visibili
        
        // Icona "!" per aprire il tracker
        this.iconX = 100;
        this.iconY = 20;
        this.iconSize = 40;
        this.iconVisible = true;
        
        // Stili
        this.backgroundColor = 'rgba(26, 26, 46, 0.9)';
        this.borderColor = '#16213e';
        this.textColor = '#ffffff';
        this.progressColor = '#4CAF50';
        this.progressBgColor = '#444444';
        this.iconColor = '#FFD700';
        this.iconBgColor = 'rgba(26, 26, 46, 0.9)';
        
        // Carica posizione salvata
        this.loadPosition();
    }
    
    // Carica posizione salvata
    loadPosition() {
        const saved = localStorage.getItem('questTrackerPosition');
        if (saved) {
            const pos = JSON.parse(saved);
            this.x = pos.x || 20;
            this.y = pos.y || 20;
        }
    }
    
    // Salva posizione
    savePosition() {
        localStorage.setItem('questTrackerPosition', JSON.stringify({
            x: this.x,
            y: this.y
        }));
    }
    
    // Aggiorna il tracker
    update() {
        // Il tracker si aggiorna automaticamente quando le quest cambiano
    }
    
    // Disegna l'icona "!"
    drawIcon(ctx) {
        if (!this.iconVisible) return;
        
        // Sfondo icona
        ctx.fillStyle = this.iconBgColor;
        ctx.strokeStyle = this.iconColor;
        ctx.lineWidth = 2;
        this.roundRect(ctx, this.iconX, this.iconY, this.iconSize, this.iconSize, 6);
        ctx.fill();
        ctx.stroke();
        
        // Testo "!"
        ctx.fillStyle = this.iconColor;
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', this.iconX + this.iconSize/2, this.iconY + this.iconSize/2);
    }
    
    // Disegna il tracker
    draw(ctx) {
        // Disegna sempre l'icona
        this.drawIcon(ctx);
        
        if (!this.isVisible || !this.game.questPanel) return;
        
        const activeQuests = this.game.questPanel.quests.active;
        if (activeQuests.length === 0) return;
        
        // Assicurati che l'indice sia valido
        if (this.currentQuestIndex >= activeQuests.length) {
            this.currentQuestIndex = 0;
        }
        
        // Altezza fissa per una quest
        const totalHeight = this.questHeight + 80;
        
        // Sfondo del tracker
        ctx.fillStyle = this.backgroundColor;
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 2;
        this.roundRect(ctx, this.x, this.y, this.width, totalHeight, 8);
        ctx.fill();
        ctx.stroke();
        
        // Titolo con pulsante chiudi
        ctx.fillStyle = this.textColor;
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Quest Attive', this.x + 15, this.y + 20);
        
        // Pulsante chiudi (X)
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(this.x + this.width - 25, this.y + 5, 20, 20);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('×', this.x + this.width - 15, this.y + 18);
        
        // Disegna la quest corrente
        const currentQuest = activeQuests[this.currentQuestIndex];
        const questY = this.y + 35;
        this.drawQuest(ctx, currentQuest, questY);
        
        // Disegna i controlli di navigazione se ci sono più di una quest
        if (activeQuests.length > 1) {
            this.drawNavigationControls(ctx, activeQuests.length);
        }
    }
    
    // Disegna i controlli di navigazione
    drawNavigationControls(ctx, totalQuests) {
        const controlY = this.y + this.questHeight + 60;
        const controlSpacing = 8;
        const controlSize = 6;
        const totalWidth = (totalQuests * controlSize) + ((totalQuests - 1) * controlSpacing);
        const startX = this.x + (this.width - totalWidth) / 2;
        
        for (let i = 0; i < totalQuests; i++) {
            const controlX = startX + (i * (controlSize + controlSpacing));
            
            // Colore del controllo (attivo o inattivo)
            if (i === this.currentQuestIndex) {
                ctx.fillStyle = '#ffffff';
            } else {
                ctx.fillStyle = '#666666';
            }
            
            // Disegna il cerchio
            ctx.beginPath();
            ctx.arc(controlX + controlSize/2, controlY, controlSize/2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Disegna una singola quest
    drawQuest(ctx, quest, y) {
        // Sfondo quest
        ctx.fillStyle = 'rgba(42, 42, 62, 0.8)';
        ctx.strokeStyle = 'rgba(74, 74, 94, 0.6)';
        ctx.lineWidth = 1;
        this.roundRect(ctx, this.x + 10, y, this.width - 20, this.questHeight - 5, 4);
        ctx.fill();
        ctx.stroke();
        
        // Titolo quest (troncato se troppo lungo)
        ctx.fillStyle = this.textColor;
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        const title = this.truncateText(quest.title, this.width - 40);
        ctx.fillText(title, this.x + 15, y + 20);
        
        // Descrizione (troncata)
        ctx.fillStyle = '#cccccc';
        ctx.font = '11px Arial';
        const description = this.truncateText(quest.description, this.width - 40);
        ctx.fillText(description, this.x + 15, y + 40);
        
        // Seconda riga di descrizione se c'è spazio
        if (quest.description.length > 47) {
            const secondLine = quest.description.substring(47);
            const secondLineTruncated = this.truncateText(secondLine, this.width - 40);
            ctx.fillText(secondLineTruncated, this.x + 15, y + 55);
        }
        
        // Barra di progresso
        const progressPercent = quest.progress / quest.maxProgress;
        const progressWidth = (this.width - 50) * progressPercent;
        
        // Sfondo barra progresso
        ctx.fillStyle = this.progressBgColor;
        ctx.fillRect(this.x + 15, y + 70, this.width - 50, 8);
        
        // Barra progresso
        ctx.fillStyle = this.progressColor;
        ctx.fillRect(this.x + 15, y + 70, progressWidth, 8);
        
        // Testo progresso
        ctx.fillStyle = this.textColor;
        ctx.font = '10px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`${quest.progress}/${quest.maxProgress}`, this.x + this.width - 20, y + 78);
    }
    
    // Tronca il testo se troppo lungo
    truncateText(text, maxWidth) {
        if (text.length <= 50) return text;
        return text.substring(0, 47) + '...';
    }
    
    // Mostra/nascondi il tracker
    toggle() {
        this.isVisible = !this.isVisible;
    }
    
    // Mostra il tracker
    show() {
        this.isVisible = true;
    }
    
    // Nascondi il tracker
    hide() {
        this.isVisible = false;
    }
    
    // Controlla se il mouse è sopra l'icona
    isMouseOverIcon(x, y) {
        return x >= this.iconX && x <= this.iconX + this.iconSize && 
               y >= this.iconY && y <= this.iconY + this.iconSize;
    }
    
    // Controlla se il mouse è sopra il tracker
    isMouseOverTracker(x, y) {
        if (!this.isVisible) return false;
        
        // Altezza fissa per una quest (stessa logica del draw)
        const totalHeight = this.questHeight + 80;
        
        return x >= this.x && x <= this.x + this.width && 
               y >= this.y && y <= this.y + totalHeight;
    }
    
    // Controlla se il mouse è sopra l'area di drag (titolo)
    isMouseOverDragArea(x, y) {
        if (!this.isVisible) return false;
        return x >= this.x && x <= this.x + this.width - 25 && 
               y >= this.y && y <= this.y + 40;
    }
    
    // Controlla se il mouse è sopra il pulsante chiudi
    isMouseOverCloseButton(x, y) {
        if (!this.isVisible) return false;
        return x >= this.x + this.width - 25 && x <= this.x + this.width - 5 &&
               y >= this.y + 5 && y <= this.y + 25;
    }
    
    // Controlla se il mouse è sopra i controlli di navigazione
    isMouseOverNavigationControls(x, y) {
        if (!this.isVisible || !this.game.questPanel) return -1;
        
        const activeQuests = this.game.questPanel.quests.active;
        if (activeQuests.length <= 1) return -1;
        
        const controlY = this.y + this.questHeight + 60;
        const controlSpacing = 8;
        const controlSize = 6;
        const totalWidth = (activeQuests.length * controlSize) + ((activeQuests.length - 1) * controlSpacing);
        const startX = this.x + (this.width - totalWidth) / 2;
        
        // Controlla se il mouse è nell'area dei controlli
        if (y < controlY - controlSize/2 || y > controlY + controlSize/2) return -1;
        
        for (let i = 0; i < activeQuests.length; i++) {
            const controlX = startX + (i * (controlSize + controlSpacing));
            if (x >= controlX && x <= controlX + controlSize) {
                return i;
            }
        }
        
        return -1;
    }
    
    // Gestisce click sul tracker
    handleClick(x, y) {
        // Click sull'icona "!"
        if (this.isMouseOverIcon(x, y)) {
            this.toggle();
            return true;
        }
        
        // Click sul pulsante chiudi
        if (this.isMouseOverCloseButton(x, y)) {
            this.hide();
            return true;
        }
        
        // Click sui controlli di navigazione
        const navigationIndex = this.isMouseOverNavigationControls(x, y);
        if (navigationIndex !== -1) {
            this.currentQuestIndex = navigationIndex;
            return true;
        }
        
        // Click sull'area di drag (inizia drag)
        if (this.isMouseOverDragArea(x, y)) {
            this.isDragging = true;
            this.dragOffsetX = x - this.x;
            this.dragOffsetY = y - this.y;
            this.dragStartTime = Date.now();
            this.mouseWasDown = true;
            return true;
        }
        

        
        return false;
    }
    
    // Gestisce il movimento del mouse durante il drag
    handleMouseMove(x, y) {
        if (this.isDragging) {
            this.x = x - this.dragOffsetX;
            this.y = y - this.dragOffsetY;
            
            // Mantieni il tracker dentro lo schermo
            this.x = Math.max(0, Math.min(this.x, this.game.width - this.width));
            this.y = Math.max(0, Math.min(this.y, this.game.height - this.maxHeight));
            
            this.savePosition();
        }
    }
    
    // Gestisce il rilascio del mouse
    handleMouseRelease() {
        if (this.isDragging) {
            this.isDragging = false;
            this.mouseWasDown = false;
        }
    }
    
    // Forza il reset del flag dragging (per sicurezza)
    forceResetDragging() {
        this.isDragging = false;
        this.dragStartTime = 0;
        this.mouseWasDown = false;
    }
    
    // Controlla se il mouse è ancora premuto
    isMouseStillDown() {
        return this.mouseWasDown;
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
