import { ThemeConfig, ThemeUtils } from '../config/ThemeConfig.js';

// Quest Tracker - Mini pannello per mostrare le quest attive
export class QuestTracker {
    constructor(game) {
        this.game = game;
        this.visible = true;
        this.minimized = true; // Stato iniziale minimizzato
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
        this.width = 350;
        this.height = 250;
        this.minimizedWidth = 50; // Larghezza quando minimizzato
        this.minimizedHeight = 50; // Altezza quando minimizzato
        
        // Sistema di paginazione
        this.currentPage = 0; // Pagina corrente (0-based)
        this.questsPerPage = 1; // 1 quest per pagina
        this.maxPages = 5; // Massimo 5 pagine
        this.totalPages = 0; // Numero totale di pagine
        this.selectedQuestIndex = 0; // Indice della quest selezionata (sempre 0 con 1 quest per pagina)
        this.mouseOverTracker = false; // Se il mouse è sopra il tracker
        
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
        
        
        // Stile neutro
        this.backgroundColor = 'rgba(28,28,32,0.95)';
        this.borderColor = 'rgba(255,255,255,0.12)';
        this.textColor = '#ffffff';
        this.titleColor = '#ffffff';
        this.progressColor = '#ffffff';
    }
    
    
    // Aggiorna le quest attive dal sistema del HomePanel
    update() {
        
        if (this.game.homePanel && this.game.homePanel.questData) {
            // Aggiorna il progresso delle quest
            this.game.homePanel.updateQuestProgress();
            this.updateActiveQuests();
        }
        
        // Calcola posizioni espanso se non ancora calcolate
        if (this.expandedX === 0 && this.expandedY === 0) {
            this.expandedX = (this.game.canvas.width - this.width) / 2;
            this.expandedY = (this.game.canvas.height - this.height) / 2;
        }
        
        // Aggiorna proprietà di paginazione
        this.updatePaginationProperties();
        
        // Aggiorna stato del mouse sopra il tracker
        if (this.game.input) {
            const mousePos = this.game.input.getMousePosition();
            this.mouseOverTracker = this.isMouseOverTracker(mousePos.x, mousePos.y);
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
        
        // Debug per verificare il tracking (solo quando cambia)
        if (this.activeQuests.length > 0) {
            this.activeQuests.forEach(quest => {
                if (quest.conditions) {
                    quest.conditions.forEach(condition => {
                        if (condition.type === 'kill_streuner' && condition.completed > 0) {
                            console.log(`🔍 Quest Tracker - Streuner: ${condition.completed}/${condition.quantity}`);
                        }
                        if (condition.type === 'collect_bonus_box' && condition.completed > 0) {
                            console.log(`🔍 Quest Tracker - Bonus Box: ${condition.completed}/${condition.quantity}`);
                        }
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
        
        // Pulsante chiudi rimosso - il tracker non può essere chiuso
        
        // Se è minimizzato, cliccare ovunque lo espande
        if (this.minimized) {
            this.minimized = false;
            this.animating = true;
            // Aggiorna le posizioni target per l'espansione
            this.expandedX = (this.game.canvas.width - this.width) / 2;
            this.expandedY = (this.game.canvas.height - this.height) / 2;
            return true;
        }
        
        // Controlla click sul pulsante di chiusura
        if (this.isCloseButtonClicked(x, y)) {
            this.visible = false;
            return true;
        }
        
        // Controlla click sui cerchietti di paginazione
        if (this.handlePageDotClick(x, y)) {
            return true;
        }
        
        // Controlla click per selezione quest
        if (this.handleQuestSelection(x, y)) {
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
        // Aggiorna lo stato del mouse sopra il tracker
        this.mouseOverTracker = this.isMouseOverTracker(x, y);
        
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
    
    // Pulsante chiudi rimosso
    
    // Calcola l'altezza dinamica per una quest
    calculateQuestHeight(quest, width) {
        let height = 25; // Altezza base per il nome
        
        if (quest.conditions && quest.conditions.length > 0) {
            height += quest.conditions.length * 15; // 15px per ogni obiettivo
        }
        
        return height;
    }
    
    // Aggiorna le proprietà di paginazione
    updatePaginationProperties() {
        if (this.minimized) return;
        
        if (!this.activeQuests || this.activeQuests.length === 0) {
            this.totalPages = 0;
            this.currentPage = 0;
            return;
        }
        
        // Limita a massimo 5 pagine (5 quest)
        this.totalPages = Math.min(Math.ceil(this.activeQuests.length / this.questsPerPage), this.maxPages);
        
        // Assicurati che la pagina corrente sia valida
        if (this.currentPage >= this.totalPages) {
            this.currentPage = Math.max(0, this.totalPages - 1);
        }
        
        // Con 1 quest per pagina, selectedQuestIndex è sempre 0
        this.selectedQuestIndex = 0;
    }
    
    // Ottiene le quest della pagina corrente
    getQuestsOnCurrentPage() {
        if (!this.activeQuests || this.activeQuests.length === 0) {
            return [];
        }
        
        const startIndex = this.currentPage * this.questsPerPage;
        const endIndex = Math.min(startIndex + this.questsPerPage, this.activeQuests.length);
        
        // Limita a massimo 5 quest (5 pagine)
        const limitedQuests = this.activeQuests.slice(0, this.maxPages);
        return limitedQuests.slice(startIndex, endIndex);
    }
    
    // Gestisce la rotella del mouse per la paginazione
    handleWheelScroll(deltaY) {
        if (this.minimized || this.totalPages <= 1) return false;
        
        if (deltaY > 0) {
            // Scroll giù - pagina successiva
            this.nextPage();
        } else {
            // Scroll su - pagina precedente
            this.previousPage();
        }
        
        return true;
    }
    
    // Vai alla pagina successiva
    nextPage() {
        if (this.currentPage < this.totalPages - 1) {
            this.currentPage++;
            this.selectedQuestIndex = 0; // Con 1 quest per pagina, sempre 0
        }
    }
    
    // Vai alla pagina precedente
    previousPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.selectedQuestIndex = 0; // Con 1 quest per pagina, sempre 0
        }
    }
    
    // Vai a una pagina specifica
    goToPage(pageIndex) {
        if (pageIndex >= 0 && pageIndex < this.totalPages) {
            this.currentPage = pageIndex;
            this.selectedQuestIndex = 0; // Con 1 quest per pagina, sempre 0
        }
    }
    
    // Controlla se il click è su un cerchietto di paginazione
    isPageDotClicked(x, y) {
        if (this.minimized || this.totalPages <= 1) return false;
        
        const dotsY = this.y + this.currentHeight - 25; // 25px dal basso
        const dotSize = 8;
        const dotSpacing = 15;
        const totalWidth = this.totalPages * dotSpacing;
        const startX = this.x + (this.currentWidth - totalWidth) / 2;
        
        for (let i = 0; i < this.totalPages; i++) {
            const dotX = startX + i * dotSpacing;
            if (x >= dotX - dotSize/2 && x <= dotX + dotSize/2 &&
                y >= dotsY - dotSize/2 && y <= dotsY + dotSize/2) {
                return i; // Restituisce l'indice della pagina cliccata
            }
        }
        
        return -1; // Nessun cerchietto cliccato
    }
    
    // Gestisce il click sui cerchietti di paginazione
    handlePageDotClick(x, y) {
        const clickedPage = this.isPageDotClicked(x, y);
        if (clickedPage >= 0 && clickedPage !== this.currentPage) {
            this.goToPage(clickedPage);
            return true;
        }
        return false;
    }
    
    // Controlla se il click è su una quest per la selezione
    isQuestSelectionClicked(x, y) {
        if (this.minimized || !this.activeQuests || this.activeQuests.length === 0) return -1;
        
        const questsOnPage = this.getQuestsOnCurrentPage();
        if (questsOnPage.length === 0) return -1;
        
        const questStartY = this.y + 50;
        const questHeight = 30; // Altezza fissa per ogni quest
        
        // Con 1 quest per pagina, controlla solo la quest corrente
        const questY = questStartY;
        if (x >= this.x + 10 && x <= this.x + this.currentWidth - 10 &&
            y >= questY && y <= questY + questHeight) {
            return 0; // Con 1 quest per pagina, sempre indice 0
        }
        
        return -1; // Nessuna quest cliccata
    }
    
    // Gestisce la selezione di una quest
    handleQuestSelection(x, y) {
        const clickedQuestIndex = this.isQuestSelectionClicked(x, y);
        if (clickedQuestIndex >= 0) {
            this.selectedQuestIndex = clickedQuestIndex;
            return true;
        }
        return false;
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
    
    // Controlla se il click è sul pulsante di chiusura
    isCloseButtonClicked(x, y) {
        if (this.minimized) return false;
        
        const closeButtonSize = 20;
        const closeButtonX = this.x + this.currentWidth - closeButtonSize - 10;
        const closeButtonY = this.y + 10;
        
        return x >= closeButtonX && x <= closeButtonX + closeButtonSize &&
               y >= closeButtonY && y <= closeButtonY + closeButtonSize;
    }
    
    // Controlla se il click è su una quest
    isQuestClicked(x, y) {
        // Non gestire click su quest se non ci sono quest attive
        if (!this.activeQuests || this.activeQuests.length === 0) return false;
        
        const questsOnPage = this.getQuestsOnCurrentPage();
        if (questsOnPage.length === 0) return false;
        
        const questStartY = this.y + 50;
        const questHeight = 30; // Altezza fissa per ogni quest
        
        // Con 1 quest per pagina, controlla solo la quest corrente
        const questY = questStartY;
        if (x >= this.x + 10 && x <= this.x + this.currentWidth - 10 &&
            y >= questY && y <= questY + questHeight) {
            return true;
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
        
        // Solo bordo neutro (senza sfondo)
        ctx.strokeStyle = this.isActive ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, currentWidth, currentHeight);
        
        // Icona di drag (clipboard con checkmark) - centrata
        this.drawDragIcon(ctx, this.x + (currentWidth - 24) / 2, this.y + (currentHeight - 24) / 2);
        
        // Indicatore del numero di quest attive (sempre visibile)
        const questCount = this.activeQuests ? this.activeQuests.length : 0;
        if (questCount > 0) {
            // Sfondo per il contatore (neutro)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.beginPath();
            ctx.arc(this.x + currentWidth - 12, this.y + 12, 8, 0, Math.PI * 2);
            ctx.fill();
            
            // Bordo per il contatore (neutro)
            ctx.strokeStyle = 'rgba(255,255,255,0.12)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(this.x + currentWidth - 12, this.y + 12, 8, 0, Math.PI * 2);
            ctx.stroke();
            
            // Numero (neutro)
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(questCount.toString(), this.x + currentWidth - 12, this.y + 16);
        }
    }
    
    // Disegna il tracker espanso (completo)
    drawExpanded(ctx) {
        const currentWidth = this.currentWidth || this.width;
        const currentHeight = this.currentHeight || this.height;
        
        // Sfondo e bordo neutri
        ThemeUtils.drawPanel(ctx, this.x, this.y, currentWidth, currentHeight, {
            background: this.backgroundColor,
            border: this.isDragging ? 'rgba(255,255,255,0.18)' : this.borderColor,
            blur: false,
            shadow: false
        });
        
        // Effetto hover se in drag
        if (this.isDragging) {
            ctx.fillStyle = 'rgba(255,255,255,0.03)';
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
            
            // Pulsante chiudi (neutro)
            const closeButtonSize = 20;
            const closeButtonX = this.x + currentWidth - closeButtonSize - 10;
            const closeButtonY = this.y + 10;
            
            // Sfondo e bordo pulsante chiudi
            ThemeUtils.drawPanel(ctx, closeButtonX, closeButtonY, closeButtonSize, closeButtonSize, {
                background: 'rgba(28,28,32,0.95)',
                border: 'rgba(255,255,255,0.12)',
                blur: false,
                shadow: false
            });
            
            // X del pulsante chiudi (neutro)
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('×', closeButtonX + closeButtonSize/2, closeButtonY + closeButtonSize/2);
            ctx.textAlign = 'left';
            ctx.textBaseline = 'alphabetic';
        }
        
        // Lista quest con paginazione (solo se abbastanza grande)
        if (currentWidth > 200 && currentHeight > 100) {
            const questsOnPage = this.getQuestsOnCurrentPage();
            
            if (questsOnPage.length > 0) {
                const quest = questsOnPage[0]; // Con 1 quest per pagina, sempre la prima
                const questStartY = this.y + 50;
                const questHeight = this.currentHeight - 100; // Usa tutto lo spazio disponibile
                
                // Sfondo e bordo quest neutri
                ThemeUtils.drawPanel(ctx, this.x + 5, questStartY, currentWidth - 10, questHeight, {
                    background: 'rgba(28,28,32,0.95)',
                    border: 'rgba(255,255,255,0.12)',
                    blur: false,
                    shadow: false
                });
                
                // Nome quest
                ctx.fillStyle = this.titleColor;
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'left';
                ctx.fillText(quest.name, this.x + 10, questStartY + 20);
                
                // Calcola progresso generale della quest
                if (quest.conditions && quest.conditions.length > 0) {
                    const completedConditions = quest.conditions.filter(c => c.completed >= c.quantity).length;
                    const totalConditions = quest.conditions.length;
                    const questProgress = `${completedConditions}/${totalConditions}`;
                    
                    // Mostra progresso generale a destra
                    ctx.fillStyle = this.progressColor;
                    ctx.font = 'bold 12px Arial';
                    ctx.textAlign = 'right';
                    ctx.fillText(questProgress, this.x + currentWidth - 10, questStartY + 20);
                    ctx.textAlign = 'left';
                    
                    // Disegna gli obiettivi della quest
                    let objectiveY = questStartY + 40;
                    quest.conditions.forEach((condition, condIndex) => {
                        // Icona obiettivo
                        const isCompleted = condition.completed >= condition.quantity;
                        ctx.fillStyle = isCompleted ? this.progressColor : '#888888';
                        ctx.font = '14px Arial';
                        ctx.textAlign = 'left';
                        ctx.fillText(isCompleted ? '✓' : '○', this.x + 15, objectiveY + 10);
                        
                        // Testo obiettivo
                        ctx.fillStyle = isCompleted ? this.progressColor : this.textColor;
                        ctx.font = '12px Arial';
                        const objectiveText = condition.description;
                        ctx.fillText(objectiveText, this.x + 30, objectiveY + 10);
                        
                        // Numeri di progresso a destra
                        ctx.fillStyle = this.borderColor;
                        ctx.font = 'bold 12px Arial';
                        ctx.textAlign = 'right';
                        const progressText = `${condition.completed} / ${condition.quantity}`;
                        ctx.fillText(progressText, this.x + currentWidth - 15, objectiveY + 10);
                        ctx.textAlign = 'left';
                        
                        objectiveY += 25; // Spazio tra obiettivi
                    });
                }
            }
            
            // Disegna i cerchietti di paginazione
            if (this.totalPages > 1) {
                this.drawPageDots(ctx);
            }
            
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
    
    // Disegna i cerchietti di paginazione
    drawPageDots(ctx) {
        const dotsY = this.y + this.currentHeight - 25; // 25px dal basso
        const dotSize = 8;
        const dotSpacing = 15;
        const totalWidth = this.totalPages * dotSpacing;
        const startX = this.x + (this.currentWidth - totalWidth) / 2;
        
        for (let i = 0; i < this.totalPages; i++) {
            const dotX = startX + i * dotSpacing;
            const isCurrentPage = i === this.currentPage;
            
            // Sfondo del cerchietto
            if (isCurrentPage) {
                // Cerchietto pieno per la pagina corrente (neutro)
                ctx.fillStyle = 'rgba(255,255,255,0.18)';
                ctx.beginPath();
                ctx.arc(dotX, dotsY, dotSize/2, 0, Math.PI * 2);
                ctx.fill();
                
                // Bordo per la pagina corrente (neutro)
                ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(dotX, dotsY, dotSize/2, 0, Math.PI * 2);
                ctx.stroke();
            } else {
                // Cerchietto vuoto per le altre pagine (neutro)
                ctx.strokeStyle = 'rgba(255,255,255,0.12)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(dotX, dotsY, dotSize/2, 0, Math.PI * 2);
                ctx.stroke();
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
    
    // Disegna l'icona
    drawDragIcon(ctx, x, y) {
        const iconSize = 24;
        
        // Usa l'icona dal UIManager
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⭐', x + iconSize/2, y + iconSize/2);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    }
}