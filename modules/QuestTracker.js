// Quest Tracker - Mini pannello per mostrare le quest attive
export class QuestTracker {
    constructor(game) {
        this.game = game;
        this.visible = true;
        this.minimized = true; // Stato iniziale minimizzato
        console.log('🏗️ QuestTracker constructor - inizializzato come minimizzato:', this.minimized);
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.hasMoved = false; // Traccia se c'è stato movimento durante il drag
        
        // Sistema di animazione
        this.animating = false;
        this.animationProgress = 0; // 0 = minimizzato, 1 = espanso
        this.animationSpeed = 0.1; // Velocità animazione (più alto = più veloce)
        this.currentWidth = this.minimizedWidth;
        this.currentHeight = this.minimizedHeight;
        
        // Posizione e dimensioni
        this.width = 300;
        this.height = 200;
        this.minimizedWidth = 50; // Larghezza quando minimizzato
        this.minimizedHeight = 50; // Altezza quando minimizzato
        
        // Posizioni
        this.minimizedX = 20; // Posizione X quando minimizzato (alto a sinistra)
        this.minimizedY = 20; // Posizione Y quando minimizzato (alto a sinistra)
        this.expandedX = 0; // Sarà calcolata dinamicamente
        this.expandedY = 0; // Sarà calcolata dinamicamente
        
        // Posizione salvata per il ripristino
        this.savedExpandedX = null; // Posizione X salvata quando chiuso
        this.savedExpandedY = null; // Posizione Y salvata quando chiuso
        
        // Posizione iniziale (minimizzato)
        this.x = this.minimizedX;
        this.y = this.minimizedY;
        
        // Inizializza dimensioni animate
        this.currentWidth = this.minimizedWidth;
        this.currentHeight = this.minimizedHeight;
        
        // Assicurati che le dimensioni siano sempre valide
        if (!this.currentWidth) this.currentWidth = this.minimizedWidth;
        if (!this.currentHeight) this.currentHeight = this.minimizedHeight;
        
        
        // Quest attive (riferimento al sistema del HomePanel)
        this.activeQuests = [];
        
        // Stile
        this.backgroundColor = '#1a1a2e';
        this.borderColor = '#4a90e2';
        this.textColor = '#ffffff';
        this.titleColor = '#FFD700';
        this.progressColor = '#00ff00';
    }
    
    
    // Aggiorna le quest attive dal sistema del HomePanel
    update() {
        
        if (this.game.homePanel && this.game.homePanel.questData) {
            this.updateActiveQuests();
        }
        
        // Calcola posizioni espanso se non ancora calcolate
        if (this.expandedX === 0 && this.expandedY === 0) {
            this.expandedX = (this.game.canvas.width - this.width) / 2;
            this.expandedY = (this.game.canvas.height - this.height) / 2;
        }
        
        
        // Aggiorna animazione
        this.updateAnimation();
        
    }
    
    // Aggiorna l'animazione di apertura/chiusura
    updateAnimation() {
        // Assicurati che le dimensioni siano sempre valide
        if (!this.currentWidth) this.currentWidth = this.minimized ? this.minimizedWidth : this.width;
        if (!this.currentHeight) this.currentHeight = this.minimized ? this.minimizedHeight : this.height;
        
        
        if (!this.animating) return;
        
        const targetProgress = this.minimized ? 0 : 1;
        const diff = targetProgress - this.animationProgress;
        
        if (Math.abs(diff) < 0.01) {
            // Animazione completata
            this.animationProgress = targetProgress;
            this.animating = false;
        } else {
            // Continua l'animazione
            this.animationProgress += diff * this.animationSpeed;
        }
        
        // Calcola dimensioni interpolate
        this.currentWidth = this.lerp(this.minimizedWidth, this.width, this.animationProgress);
        this.currentHeight = this.lerp(this.minimizedHeight, this.height, this.animationProgress);
        
        // Calcola posizioni interpolate
        this.x = this.lerp(this.minimizedX, this.expandedX, this.animationProgress);
        this.y = this.lerp(this.minimizedY, this.expandedY, this.animationProgress);
    }
    
    // Interpolazione lineare
    lerp(start, end, t) {
        return start + (end - start) * t;
    }
    
    // Aggiorna la lista delle quest attive
    updateActiveQuests() {
        this.activeQuests = [];
        
        // Prendi le quest accettate dal sistema del HomePanel
        const acceptedQuests = this.game.homePanel.questData.accettate;
        if (acceptedQuests) {
            Object.keys(acceptedQuests).forEach(levelKey => {
                const levelQuests = acceptedQuests[levelKey];
                if (levelQuests && levelQuests.length > 0) {
                    levelQuests.forEach(quest => {
                        this.activeQuests.push(quest);
                    });
                }
            });
        }
    }
    
    // Gestisce il click sul tracker (solo click veri, non drag)
    handleClick(x, y) {
        if (!this.visible || this.isDragging) {
            return false;
        }
        
        
        // Controlla click sul pulsante chiudi
        if (this.isCloseButtonClicked(x, y)) {
            this.visible = false;
            return true;
        }
        
        // Se è minimizzato, cliccare ovunque lo espande
        if (this.minimized) {
            this.minimized = false;
            this.animating = true;
            // Aggiorna le posizioni target per l'espansione
            this.expandedX = (this.game.canvas.width - this.width) / 2;
            this.expandedY = (this.game.canvas.height - this.height) / 2;
            return true;
        }
        
        // Se non è minimizzato, cliccare sulla barra del titolo lo minimizza
        if (this.isTitleBarClicked(x, y)) {
            this.minimized = true;
            this.animating = true;
            // Le posizioni minimizzate sono già impostate nel costruttore
            return true;
        }
        
        // Controlla click su una quest (rimosso - non apre più il pannello home)
        if (this.isQuestClicked(x, y)) {
            // Non fa nulla quando si clicca su una quest
            return true;
        }
        
        return false;
    }
    
    
    // Gestisce l'inizio del drag (chiamato quando si clicca sull'icona)
    startDrag(x, y) {
        // Se è minimizzato o in animazione, non permettere drag
        if (this.minimized || this.animating) {
            console.log('🚫 DRAG BLOCCATO - minimized:', this.minimized, 'animating:', this.animating);
            return false; // Non è un drag, ma il click verrà gestito da handleClick
        }
        
        // Se non è minimizzato, controlla se è nell'area draggabile
        if (!this.isDragAreaClicked(x, y)) {
            console.log('🚫 DRAG BLOCCATO - non nell\'area draggabile');
            return false;
        }
        
        console.log('✅ DRAG INIZIATO - posizione:', x, y);
        this.isDragging = true;
        this.hasMoved = false; // Reset del flag di movimento
        this.dragOffset.x = x - this.x;
        this.dragOffset.y = y - this.y;
        return true;
    }
    
    // Gestisce il movimento del mouse durante il drag
    handleMouseMove(x, y) {
        if (this.isDragging && !this.animating) {
            // Calcola la nuova posizione
            const newX = x - this.dragOffset.x;
            const newY = y - this.dragOffset.y;
            
            // Controlla se c'è stato movimento significativo (più di 5 pixel)
            const deltaX = Math.abs(newX - this.x);
            const deltaY = Math.abs(newY - this.y);
            if (deltaX > 5 || deltaY > 5) {
                this.hasMoved = true;
            }
            
            // Mantieni il tracker dentro i bordi dello schermo con margine
            const margin = 10;
            this.x = Math.max(margin, Math.min(newX, this.game.canvas.width - this.currentWidth - margin));
            this.y = Math.max(margin, Math.min(newY, this.game.canvas.height - this.currentHeight - margin));
            
            // Aggiorna le posizioni target per l'animazione
            if (this.minimized) {
                this.minimizedX = this.x;
                this.minimizedY = this.y;
            } else {
                this.expandedX = this.x;
                this.expandedY = this.y;
                // Salva anche la posizione per il ripristino futuro
                this.savedExpandedX = this.x;
                this.savedExpandedY = this.y;
            }
        }
    }
    
    // Gestisce il rilascio del mouse
    handleMouseRelease() {
        if (this.isDragging) {
            // Se c'è stato movimento, non gestire come click
            if (this.hasMoved) {
                this.isDragging = false;
                this.hasMoved = false;
                return false; // Non è un click
            }
            
            // Se non c'è stato movimento, gestisci come click
            this.isDragging = false;
            this.hasMoved = false;
            return true; // È un click
        }
        return false;
    }
    
    // Controlla se il click è sul pulsante chiudi
    isCloseButtonClicked(x, y) {
        const closeButtonSize = 20;
        const closeX = this.x + this.currentWidth - closeButtonSize - 5;
        const closeY = this.y + 5;
        
        return x >= closeX && x <= closeX + closeButtonSize && 
               y >= closeY && y <= closeY + closeButtonSize;
    }
    
    // Controlla se il click è nell'area draggabile (intero pannello quando espanso)
    isDragAreaClicked(x, y) {
        if (this.minimized) return false; // Non draggabile quando minimizzato
        
        // Intero pannello è draggabile quando espanso
        return x >= this.x && x <= this.x + this.currentWidth && 
               y >= this.y && y <= this.y + this.currentHeight;
    }
    
    // Controlla se il click è sulla barra del titolo (per minimizzare)
    isTitleBarClicked(x, y) {
        if (this.minimized) return false; // Non minimizzabile quando già minimizzato
        
        const titleBarHeight = 40;
        
        return x >= this.x && x <= this.x + this.currentWidth && 
               y >= this.y && y <= this.y + titleBarHeight;
    }
    
    // Controlla se il click è su una quest
    isQuestClicked(x, y) {
        // Non gestire click su quest se non ci sono quest attive
        if (!this.activeQuests || this.activeQuests.length === 0) return false;
        
        const questStartY = this.y + 40;
        const questHeight = 25;
        
        for (let i = 0; i < this.activeQuests.length; i++) {
            const questY = questStartY + i * questHeight;
            if (x >= this.x + 10 && x <= this.x + this.currentWidth - 10 && 
                y >= questY && y <= questY + questHeight) {
                return true;
            }
        }
        
        return false;
    }
    
    // Controlla se il mouse è sopra il tracker
    isMouseOverTracker(x, y) {
        // Se è minimizzato, controlla solo l'area dell'icona in alto a sinistra
        if (this.minimized) {
            const isOver = x >= this.minimizedX && x <= this.minimizedX + this.minimizedWidth && 
                           y >= this.minimizedY && y <= this.minimizedY + this.minimizedHeight;
            return isOver;
        }
        
        // Se è espanso, controlla l'area del pannello espanso
        const isOver = x >= this.x && x <= this.x + this.currentWidth && 
                       y >= this.y && y <= this.y + this.currentHeight;
        
        return isOver;
    }
    
    // Disegna il tracker
    draw(ctx) {
        // Debug solo per i primi frame
        if (this.game.frameCount && this.game.frameCount < 5) {
            console.log('🐛 Debug draw chiamato:', {
                frame: this.game.frameCount,
                visible: this.visible,
                minimized: this.minimized,
                x: this.x,
                y: this.y,
                currentWidth: this.currentWidth,
                currentHeight: this.currentHeight
            });
        }
        
        if (!this.visible) return;
        
        if (this.minimized) {
            this.drawMinimized(ctx);
        } else {
            this.drawExpanded(ctx);
        }
    }
    
    // Disegna il tracker minimizzato (solo icona)
    drawMinimized(ctx) {
        const currentWidth = this.currentWidth || this.minimizedWidth;
        const currentHeight = this.currentHeight || this.minimizedHeight;
        
        // Assicurati che le dimensioni siano valide
        if (currentWidth <= 0 || currentHeight <= 0) {
            console.warn('QuestTracker: dimensioni non valide', { currentWidth, currentHeight });
            return;
        }
        
        // Debug solo per i primi frame
        if (this.game.frameCount && this.game.frameCount < 5) {
            console.log('🐛 Debug drawMinimized:', {
                frame: this.game.frameCount,
                currentWidth,
                currentHeight,
                minimizedWidth: this.minimizedWidth,
                minimizedHeight: this.minimizedHeight,
                x: this.x,
                y: this.y,
                visible: this.visible,
                minimized: this.minimized
            });
        }
        
        // Sfondo
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(this.x, this.y, currentWidth, currentHeight);
        
        // Bordo
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, currentWidth, currentHeight);
        
        // Icona di drag (clipboard con checkmark) - centrata
        this.drawDragIcon(ctx, this.x + (currentWidth - 24) / 2, this.y + (currentHeight - 24) / 2);
        
        // Indicatore del numero di quest attive (sempre visibile)
        const questCount = this.activeQuests ? this.activeQuests.length : 0;
        ctx.fillStyle = questCount > 0 ? '#00ff00' : '#888888';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(questCount.toString(), this.x + currentWidth - 8, this.y + 12);
    }
    
    // Disegna il tracker espanso (completo)
    drawExpanded(ctx) {
        const currentWidth = this.currentWidth || this.width;
        const currentHeight = this.currentHeight || this.height;
        
        // Sfondo
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(this.x, this.y, currentWidth, currentHeight);
        
        // Bordo (più spesso se in drag)
        ctx.strokeStyle = this.isDragging ? '#00ff00' : this.borderColor;
        ctx.lineWidth = this.isDragging ? 3 : 2;
        ctx.strokeRect(this.x, this.y, currentWidth, currentHeight);
        
        // Effetto trasparenza se in drag
        if (this.isDragging) {
            ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
            ctx.fillRect(this.x, this.y, currentWidth, currentHeight);
        }
        
        // Icona di drag (clipboard con checkmark)
        this.drawDragIcon(ctx, this.x + 8, this.y + 8);
        
        // Titolo (solo se abbastanza grande)
        if (currentWidth > 100) {
            ctx.fillStyle = this.titleColor;
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('Quest Attive', this.x + 40, this.y + 20);
        }
        
        // Pulsante chiudi (solo se abbastanza grande)
        if (currentWidth > 80) {
            ctx.fillStyle = '#ff4444';
            ctx.fillRect(this.x + currentWidth - 25, this.y + 5, 20, 20);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('×', this.x + currentWidth - 15, this.y + 18);
            ctx.textAlign = 'left';
        }
        
        // Lista quest (solo se abbastanza grande)
        if (currentWidth > 150 && currentHeight > 80) {
            const questStartY = this.y + 40;
            const questHeight = 25;
            
            this.activeQuests.forEach((quest, index) => {
                const questY = questStartY + index * questHeight;
                
                // Sfondo quest (alternato)
                if (index % 2 === 0) {
                    ctx.fillStyle = 'rgba(74, 144, 226, 0.1)';
                    ctx.fillRect(this.x + 5, questY, currentWidth - 10, questHeight);
                }
            
                // Nome quest
                ctx.fillStyle = this.textColor;
                ctx.font = '12px Arial';
                ctx.fillText(quest.name, this.x + 10, questY + 15);
                
                // Progresso quest (se disponibile)
                if (quest.conditions && quest.conditions.length > 0) {
                    const completedConditions = quest.conditions.filter(c => c.completed >= c.quantity).length;
                    const totalConditions = quest.conditions.length;
                    const progress = `${completedConditions}/${totalConditions}`;
                    
                    ctx.fillStyle = this.progressColor;
                    ctx.font = '10px Arial';
                    ctx.textAlign = 'right';
                    ctx.fillText(progress, this.x + currentWidth - 10, questY + 15);
                    ctx.textAlign = 'left';
                }
            });
            
            // Messaggio se nessuna quest
            if (!this.activeQuests || this.activeQuests.length === 0) {
                ctx.fillStyle = '#888888';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Nessuna quest attiva', this.x + currentWidth / 2, this.y + currentHeight / 2);
                ctx.textAlign = 'left';
            }
        }
    }
    
    // Mostra il tracker
    show() {
        this.visible = true;
    }
    
    // Nasconde il tracker
    hide() {
        this.visible = false;
    }
    
    // Toggle del tracker
    toggle() {
        this.visible = !this.visible;
    }
    
    // Toggle dello stato minimizzato
    toggleMinimized() {
        this.minimized = !this.minimized;
        this.animating = true;
        
        // Aggiorna le posizioni target
        if (this.minimized) {
            // Sta diventando minimizzato, salva la posizione corrente come posizione espansa
            this.savedExpandedX = this.x;
            this.savedExpandedY = this.y;
            
            // Usa le posizioni minimizzate
            this.minimizedX = 20;
            this.minimizedY = 20;
        } else {
            // Sta diventando espanso, ripristina la posizione salvata o usa il centro
            if (this.savedExpandedX !== null && this.savedExpandedY !== null) {
                // Ripristina la posizione salvata
                this.expandedX = this.savedExpandedX;
                this.expandedY = this.savedExpandedY;
                console.log('📍 RIPRISTINATA POSIZIONE SALVATA:', this.expandedX, this.expandedY);
            } else {
                // Prima volta che si apre, usa il centro
                this.expandedX = (this.game.canvas.width - this.width) / 2;
                this.expandedY = (this.game.canvas.height - this.height) / 2;
                console.log('📍 PRIMA APERTURA - POSIZIONE CENTRALE:', this.expandedX, this.expandedY);
            }
        }
    }
    
    // Disegna l'icona di drag (clipboard con checkmark)
    drawDragIcon(ctx, x, y) {
        const iconSize = 24;
        
        // Sfondo dell'icona (cerchio con bordo)
        const bgColor = this.isDragging ? 'rgba(0, 255, 0, 0.3)' : 'rgba(74, 144, 226, 0.2)';
        ctx.fillStyle = bgColor;
        ctx.beginPath();
        ctx.arc(x + iconSize/2, y + iconSize/2, iconSize/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Bordo dell'icona
        ctx.strokeStyle = this.isDragging ? '#00ff00' : this.borderColor;
        ctx.lineWidth = this.isDragging ? 3 : 2;
        ctx.beginPath();
        ctx.arc(x + iconSize/2, y + iconSize/2, iconSize/2, 0, Math.PI * 2);
        ctx.stroke();
        
        // Clipboard (rettangolo con clip)
        ctx.fillStyle = this.textColor;
        ctx.fillRect(x + 6, y + 4, 12, 16);
        
        // Clip del clipboard
        ctx.fillRect(x + 4, y + 2, 16, 3);
        
        // Checkmark
        ctx.strokeStyle = this.progressColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 8, y + 10);
        ctx.lineTo(x + 10, y + 12);
        ctx.lineTo(x + 16, y + 6);
        ctx.stroke();
        
        // Punti di grip per indicare che è trascinabile
        ctx.fillStyle = this.borderColor;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 2; j++) {
                ctx.fillRect(x + 18 + i * 2, y + 18 + j * 2, 1, 1);
            }
        }
    }
}