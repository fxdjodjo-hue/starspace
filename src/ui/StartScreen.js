// StartScreen Minimalista - Design Pulito e Funzionale
export class StartScreen {
    constructor(game) {
        console.log('🏗️ StartScreen constructor - creating minimalist StartScreen');
        this.game = game;
        this.isVisible = true;
        this.isTyping = true;
        
        // Inizializza posizioni
        this.updatePositions();
        
        // Input utente
        this.playerName = '';
        this.maxPlayerNameLength = 20;
        this.cursorVisible = true;
        this.cursorBlinkTime = 0;
        
        // Animazioni
        this.animationTime = 0;
        this.stars = this.generateStars(80);
        
        // Fazioni
        this.factions = [
            {
                id: 'venus',
                name: 'VENUS',
                fullName: 'Venus Research Union',
                description: 'Scienziati all\'avanguardia',
                color: '#9b59b6',
                icon: '🔬'
            },
            {
                id: 'mars',
                name: 'MARS',
                fullName: 'Mars Mining Organization',
                description: 'Minatori esperti',
                color: '#e74c3c',
                icon: '⛏️'
            },
            {
                id: 'eic',
                name: 'EIC',
                fullName: 'Earth Industries Corporation',
                description: 'Commercianti esperti',
                color: '#4a90e2',
                icon: '🏢'
            }
        ];
        
        this.selectedFaction = null;
        
        // Controlla se il giocatore ha già scelto una fazione
        this.hasChosenFaction = this.checkExistingFaction();
        if (this.hasChosenFaction) {
            this.selectedFaction = localStorage.getItem('mmorpg_player_faction');
        }

        // Stato salvataggi
        this.hasExistingSave = false;
        this.availableSaves = [];
        this.preferredSaveKey = 'main';
        this.errorMessage = '';
        this.successMessage = '';
        
        // Tracking dimensioni canvas
        this.lastCanvasWidth = this.game.canvas.width;
        this.lastCanvasHeight = this.game.canvas.height;
    }
    
    // Genera stelle per lo sfondo
    generateStars(count) {
        const stars = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * this.game.canvas.width,
                y: Math.random() * this.game.canvas.height,
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.8 + 0.2,
                twinkleSpeed: Math.random() * 0.02 + 0.01
            });
        }
        return stars;
    }
    
    // Controlla se il giocatore ha già scelto una fazione
    checkExistingFaction() {
        const savedFaction = localStorage.getItem('mmorpg_player_faction');
        return savedFaction && ['venus', 'mars', 'eic'].includes(savedFaction);
    }
    
    // Aggiorna le posizioni degli elementi
    updatePositions() {
        // Dimensioni responsive
        this.width = Math.min(800, this.game.canvas.width * 0.7);
        this.height = Math.min(600, this.game.canvas.height * 0.7);
        this.x = Math.round((this.game.canvas.width - this.width) / 2);
        this.y = Math.round((this.game.canvas.height - this.height) / 2);
        
        // Input nome utente
        this.nameInput = {
            x: Math.round(this.x + 60),
            y: Math.round(this.y + 200),
            width: 400,
            height: 50,
            placeholder: 'Inserisci il tuo nome...'
        };
        
        // Pulsante inizia gioco
        this.startGameButton = {
            x: Math.round(this.x + this.width / 2 - 100),
            y: Math.round(this.y + 450),
            width: 200,
            height: 55,
            text: 'INIZIA GIOCO',
            gradient: ['#e74c3c', '#c0392b']
        };
        
        // Pulsanti salvataggi
        this.loadButtons = [];
        if (this.hasExistingSave) {
            this.availableSaves.forEach((save, index) => {
                this.loadButtons.push({
                    x: Math.round(this.x + 60 + (index * 120)),
                    y: Math.round(this.y + 500),
                    width: 100,
                    height: 40,
                    text: `Slot ${index + 1}`,
                    saveKey: save,
                    gradient: ['#8e44ad', '#9b59b6']
                });
            });
        }
        
        // Rigenera stelle per le nuove dimensioni
        this.stars = this.generateStars(80);
    }
    
    // Aggiorna la schermata
    update(deltaTime) {
        // Aggiorna posizioni se le dimensioni del canvas sono cambiate
        if (this.game.canvas.width !== this.lastCanvasWidth || this.game.canvas.height !== this.lastCanvasHeight) {
            this.updatePositions();
            this.lastCanvasWidth = this.game.canvas.width;
            this.lastCanvasHeight = this.game.canvas.height;
        }
        
        this.animationTime += deltaTime;
        
        // Blink del cursore
        this.cursorBlinkTime += deltaTime;
        if (this.cursorBlinkTime >= 500) {
            this.cursorVisible = !this.cursorVisible;
            this.cursorBlinkTime = 0;
        }

        // Aggiorna stelle
        this.stars.forEach(star => {
            star.opacity += Math.sin(this.animationTime * star.twinkleSpeed) * 0.1;
        });
        
        // Aggiorna stato salvataggi
        this.updateSaveState();
    }
    
    // Aggiorna stato salvataggi
    updateSaveState() {
        try {
            if (this.game.saveSystem) {
                const keysToCheck = ['main', 'slot_1', 'slot_2', 'slot_3'];
                this.availableSaves = keysToCheck.filter(k => this.game.saveSystem.hasSave(k));
                this.hasExistingSave = this.availableSaves.length > 0;
                this.preferredSaveKey = this.availableSaves.includes('main') ? 'main' : (this.availableSaves[0] || 'main');
                
                // Aggiorna pulsanti salvataggi
                this.loadButtons = [];
                this.availableSaves.forEach((save, index) => {
                    this.loadButtons.push({
                        x: Math.round(this.x + 60 + (index * 120)),
                        y: Math.round(this.y + 500),
                        width: 100,
                        height: 40,
                        text: `Slot ${index + 1}`,
                        saveKey: save,
                        gradient: ['#8e44ad', '#9b59b6']
                    });
                });
            } else {
                this.hasExistingSave = false;
                this.availableSaves = [];
                this.loadButtons = [];
            }
        } catch (e) {
            this.hasExistingSave = false;
            this.availableSaves = [];
            this.loadButtons = [];
        }
    }
    
    // Disegna la schermata
    draw(ctx) {
        if (!this.isVisible) return;
        
        // Sfondo con stelle animate
        this.drawAnimatedBackground(ctx);
        
        // Pannello principale
        this.drawMainPanel(ctx);
        
        // Logo
        this.drawLogo(ctx);
        
        // Input nome utente
        this.drawNameInput(ctx);
        
        // Selezione fazione
        this.drawFactionSelection(ctx);
        
        // Pulsante inizia gioco
        this.drawStartButton(ctx);
        
        // Salvataggi esistenti
        if (this.hasExistingSave) {
            this.drawLoadButtons(ctx);
        }
        
        // Messaggi
        this.drawMessages(ctx);
    }
    
    // Disegna sfondo animato
    drawAnimatedBackground(ctx) {
        // Sfondo gradiente
        const gradient = ctx.createLinearGradient(0, 0, 0, this.game.canvas.height);
        gradient.addColorStop(0, '#0a0a0a');
        gradient.addColorStop(0.5, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);
        
        // Stelle animate
        ctx.fillStyle = '#ffffff';
        this.stars.forEach(star => {
            ctx.globalAlpha = star.opacity;
            ctx.fillRect(star.x, star.y, star.size, star.size);
        });
        ctx.globalAlpha = 1;
    }
    
    // Disegna pannello principale
    drawMainPanel(ctx) {
        // Ombra del pannello
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 10;
        
        // Sfondo del pannello
        ctx.fillStyle = 'rgba(26, 26, 26, 0.95)';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Bordo
            ctx.shadowBlur = 0;
        ctx.strokeStyle = '#4a90e2';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    
    // Disegna logo
    drawLogo(ctx) {
        const logoX = this.x + this.width / 2;
        const logoY = this.y + 80;
        
        // Titolo principale
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('STARSPACE', logoX, logoY);
        
        // Sottotitolo
        ctx.font = '16px Arial';
        ctx.fillStyle = '#4a90e2';
        ctx.fillText('MMORPG Spaziale', logoX, logoY + 25);
    }
    
    // Disegna input nome utente
    drawNameInput(ctx) {
        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Inserisci il tuo nome:', this.nameInput.x, this.nameInput.y - 15);
        
        // Input field
        ctx.fillStyle = 'rgba(42, 42, 42, 0.8)';
        ctx.fillRect(this.nameInput.x, this.nameInput.y, this.nameInput.width, this.nameInput.height);
        
        // Bordo
        ctx.strokeStyle = '#4a90e2';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.nameInput.x, this.nameInput.y, this.nameInput.width, this.nameInput.height);
        
        // Testo
        ctx.fillStyle = this.playerName === '' ? '#666666' : '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        
        let displayText = this.playerName;
        if (displayText === '') {
            displayText = this.nameInput.placeholder;
        }
        
        // Cursore
        if (this.cursorVisible) {
            displayText += '|';
        }
        
        ctx.fillText(displayText, this.nameInput.x + 15, this.nameInput.y + 30);
    }
    
    // Disegna selezione fazione
    drawFactionSelection(ctx) {
        // Label dinamica
        const labelText = this.hasChosenFaction ? 'La tua fazione:' : 'Seleziona fazione:';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(labelText, this.x + 60, this.y + 280);
        
        const cardWidth = 180;
        const cardHeight = 100;
        const cardSpacing = 20;
        const startX = this.x + 60;
        const startY = this.y + 310;
        
        this.factions.forEach((faction, index) => {
            const cardX = startX + index * (cardWidth + cardSpacing);
            const cardY = startY;
            const isSelected = this.selectedFaction === faction.id;
            const isLocked = this.hasChosenFaction && !isSelected;
            
            // Sfondo carta
            if (isLocked) {
                ctx.fillStyle = 'rgba(30, 30, 30, 0.5)';
            } else {
                ctx.fillStyle = isSelected ? `rgba(${this.hexToRgb(faction.color)}, 0.3)` : 'rgba(42, 42, 42, 0.8)';
            }
            ctx.fillRect(cardX, cardY, cardWidth, cardHeight);
            
            // Bordo
            if (isLocked) {
                ctx.strokeStyle = '#333333';
                ctx.lineWidth = 1;
            } else {
                ctx.strokeStyle = isSelected ? faction.color : '#666666';
                ctx.lineWidth = isSelected ? 3 : 2;
            }
            ctx.strokeRect(cardX, cardY, cardWidth, cardHeight);
            
            // Icona
            ctx.fillStyle = isLocked ? '#555555' : faction.color;
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(faction.icon, cardX + cardWidth / 2, cardY + 35);
            
            // Nome fazione
            ctx.fillStyle = isLocked ? '#666666' : '#ffffff';
            ctx.font = 'bold 14px Arial';
            ctx.fillText(faction.name, cardX + cardWidth / 2, cardY + 55);
            
            // Descrizione
            ctx.fillStyle = isLocked ? '#444444' : '#cccccc';
            ctx.font = '11px Arial';
            ctx.fillText(faction.description, cardX + cardWidth / 2, cardY + 75);
            
            // Overlay "bloccato" se la fazione è già stata scelta
            if (isLocked) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(cardX, cardY, cardWidth, cardHeight);
                
                ctx.fillStyle = '#999999';
                ctx.font = 'bold 12px Arial';
                ctx.fillText('GIÀ SCELTA', cardX + cardWidth / 2, cardY + cardHeight / 2);
            }
        });
    }
    
    // Disegna pulsante inizia gioco
    drawStartButton(ctx) {
        const isHovered = this.isMouseOverButton(this.startGameButton);
        
        // Gradiente del pulsante
        const buttonGradient = ctx.createLinearGradient(
            this.startGameButton.x, this.startGameButton.y,
            this.startGameButton.x, this.startGameButton.y + this.startGameButton.height
        );
        
        if (isHovered) {
            buttonGradient.addColorStop(0, this.lightenColor(this.startGameButton.gradient[0], 20));
            buttonGradient.addColorStop(1, this.lightenColor(this.startGameButton.gradient[1], 20));
        } else {
            buttonGradient.addColorStop(0, this.startGameButton.gradient[0]);
            buttonGradient.addColorStop(1, this.startGameButton.gradient[1]);
        }
        
        ctx.fillStyle = buttonGradient;
        ctx.fillRect(this.startGameButton.x, this.startGameButton.y, this.startGameButton.width, this.startGameButton.height);
        
        // Bordo
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.startGameButton.x, this.startGameButton.y, this.startGameButton.width, this.startGameButton.height);
        
        // Testo
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.startGameButton.text, this.startGameButton.x + this.startGameButton.width / 2, this.startGameButton.y + this.startGameButton.height / 2 + 5);
    }
    
    // Disegna pulsanti salvataggi
    drawLoadButtons(ctx) {
        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Salvataggi esistenti:', this.x + 60, this.y + 480);
        
        this.loadButtons.forEach(button => {
            const isHovered = this.isMouseOverButton(button);
            
            // Gradiente del pulsante
            const buttonGradient = ctx.createLinearGradient(
                button.x, button.y,
                button.x, button.y + button.height
            );
            
            if (isHovered) {
                buttonGradient.addColorStop(0, this.lightenColor(button.gradient[0], 20));
                buttonGradient.addColorStop(1, this.lightenColor(button.gradient[1], 20));
            } else {
                buttonGradient.addColorStop(0, button.gradient[0]);
                buttonGradient.addColorStop(1, button.gradient[1]);
            }
            
            ctx.fillStyle = buttonGradient;
            ctx.fillRect(button.x, button.y, button.width, button.height);
            
            // Bordo
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(button.x, button.y, button.width, button.height);
            
            // Testo
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
            ctx.fillText(button.text, button.x + button.width / 2, button.y + button.height / 2 + 4);
        });
    }
    
    // Disegna messaggi
    drawMessages(ctx) {
        if (this.errorMessage) {
            ctx.fillStyle = '#e74c3c';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.errorMessage, this.x + this.width / 2, this.y + 140);
        }
        
        if (this.successMessage) {
            ctx.fillStyle = '#27ae60';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.successMessage, this.x + this.width / 2, this.y + 140);
        }
    }
    
    // Gestisce input da tastiera
    handleKeyPress(key) {
        if (!this.isVisible || !this.isTyping) return false;
        
        // Enter per iniziare il gioco
        if (key === 'Enter') {
            this.handleStartGame();
            return true;
        }
        
        // Escape per uscire
        if (key === 'Escape') {
            this.isTyping = false;
            return true;
        }
        
        // Backspace
        if (key === 'Backspace') {
            if (this.playerName.length > 0) {
                this.playerName = this.playerName.slice(0, -1);
            }
            return true;
        }
        
        // Caratteri alfanumerici e spazio
        if (key.startsWith('Key') || key.startsWith('Digit') || key === 'Space') {
            let char = '';
            if (key.startsWith('Key')) {
                char = key.replace('Key', '').toLowerCase();
            } else if (key.startsWith('Digit')) {
                char = key.replace('Digit', '');
            } else if (key === 'Space') {
                char = ' ';
            }
            
            if (this.playerName.length < this.maxPlayerNameLength) {
                this.playerName += char;
            }
            return true;
        }
        
        return false;
    }
    
    // Gestisce click del mouse
    handleClick(x, y) {
        if (!this.isVisible) return false;
        
        // Click su input nome
        if (this.isMouseOverInput(this.nameInput, x, y)) {
            this.isTyping = true;
            return true;
        }
        
        // Click su fazioni
        this.factions.forEach((faction, index) => {
            const cardWidth = 180;
            const cardHeight = 100;
            const cardSpacing = 20;
            const startX = this.x + 60;
            const startY = this.y + 310;
            const cardX = startX + index * (cardWidth + cardSpacing);
            const cardY = startY;
            
            if (x >= cardX && x <= cardX + cardWidth && y >= cardY && y <= cardY + cardHeight) {
                // Se la fazione è già stata scelta e non è quella selezionata, non permettere il cambio
                if (this.hasChosenFaction && this.selectedFaction !== faction.id) {
                    this.showError('Non puoi cambiare fazione! È una scelta permanente.');
                    return true;
                }
                
                this.selectedFaction = faction.id;
                return true;
            }
        });
        
        // Click su pulsante inizia gioco
        if (this.isMouseOverButton(this.startGameButton)) {
            this.handleStartGame();
            return true;
        }
        
        // Click su pulsanti salvataggi
        this.loadButtons.forEach(button => {
            if (this.isMouseOverButton(button)) {
                this.handleLoadGame(button.saveKey);
                return true;
            }
        });
        
        // Click fuori dall'input - stop typing
        if (this.isTyping) {
            this.isTyping = false;
        }
        
        return false;
    }
    
    // Gestisce avvio nuovo gioco
    handleStartGame() {
        // Se è la prima volta, richiedi selezione fazione
        if (!this.hasChosenFaction && !this.selectedFaction) {
            this.showError('Seleziona una fazione');
            return;
        }
        
        const playerName = this.playerName.trim() || 'Player';
        
        // Imposta nome giocatore
        this.game.playerProfile.setNickname(playerName);
        this.game.ship.setPlayerName(playerName);
        
        // Usa fazione esistente o quella appena selezionata
        const factionToUse = this.hasChosenFaction ? 
            localStorage.getItem('mmorpg_player_faction') : 
            this.selectedFaction;
        
        // Imposta fazione (scelta permanente)
        this.game.factionSystem.joinFaction(factionToUse);
        
        // Salva la scelta fazione nel localStorage solo se è la prima volta
        if (!this.hasChosenFaction) {
            localStorage.setItem('mmorpg_player_faction', this.selectedFaction);
        }
        
        // Imposta mappa iniziale
        const startingMaps = {
            'venus': 'v1',
            'mars': 'm1',
            'eic': 'e1'
        };
        
        this.game.mapManager.currentMap = startingMaps[factionToUse] || 'v1';
        this.game.mapManager.loadCurrentMapInstance();
        
        // Nasconde la StartScreen
        this.hide();
        
        // Avvia audio
        this.game.startGameAudio();
        
        // Salva automaticamente
        if (this.game.saveSystem) {
            this.game.saveSystem.save('main');
        }
        
        const faction = this.factions.find(f => f.id === factionToUse);
        const message = this.hasChosenFaction ? 
            `Bentornato ${playerName} nella fazione ${faction.fullName}!` :
            `Benvenuto ${playerName} nella fazione ${faction.fullName}!`;
        this.game.notifications.add(message, 'success');
    }
    
    // Gestisce caricamento salvataggio
    handleLoadGame(saveKey) {
        if (!this.game.saveSystem) {
            this.showError('Sistema di salvataggio non disponibile');
            return;
        }
        
        if (this.game.saveSystem.load(saveKey)) {
            this.game.mapManager.loadCurrentMapInstance();
        this.hide();
            this.game.notifications.add('Gioco caricato!', 'success');
        } else {
            this.showError('Errore nel caricamento del salvataggio');
        }
    }
    
    // Mostra messaggio di errore
    showError(message) {
        this.errorMessage = message;
        this.successMessage = '';
        setTimeout(() => {
            this.errorMessage = '';
        }, 5000);
    }
    
    // Mostra messaggio di successo
    showSuccess(message) {
        this.successMessage = message;
        this.errorMessage = '';
        setTimeout(() => {
            this.successMessage = '';
        }, 3000);
    }
    
    // Utility functions
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? 
            `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
            '74, 144, 226';
    }
    
    lightenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    
    // Controlla se il mouse è sopra un input
    isMouseOverInput(input, x, y) {
        return x >= input.x && x <= input.x + input.width && 
               y >= input.y && y <= input.y + input.height;
    }
    
    // Controlla se il mouse è sopra un pulsante
    isMouseOverButton(button) {
        const mousePos = this.game.input.getMousePosition();
        return mousePos.x >= button.x && mousePos.x <= button.x + button.width && 
               mousePos.y >= button.y && mousePos.y <= button.y + button.height;
    }
    
    // Mostra la schermata
    show() {
        this.isVisible = true;
        this.isTyping = true;
        console.log('🎮 StartScreen shown - typing enabled');
    }
    
    // Nasconde la schermata
    hide() {
        this.isVisible = false;
        this.isTyping = false;
        console.log('🎮 StartScreen hidden - isVisible:', this.isVisible);
    }
}