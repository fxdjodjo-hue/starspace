// Schermata di Selezione Iniziale - Login/Registrazione e Fazione
export class StartScreen {
    constructor(game) {
        console.log('🏗️ StartScreen constructor - creating StartScreen');
        this.game = game;
        this.isVisible = true;
        this.isTyping = true; // Inizia automaticamente in modalità typing
        
        // Posizioni e dimensioni
        this.width = 800;
        this.height = 600;
        this.x = (game.width - this.width) / 2;
        this.y = (game.height - this.height) / 2;
        
        // Modalità: 'login' o 'register'
        this.mode = 'login';
        
        // Input utente
        this.nickname = '';
        this.password = '';
        this.maxNicknameLength = 20;
        this.maxPasswordLength = 30;
        this.cursorVisible = true;
        this.cursorBlinkTime = 0;
        this.currentInput = 'nickname'; // 'nickname' o 'password'
        
        // Input fields
        this.nicknameInput = {
            x: this.x + 100,
            y: this.y + 200,
            width: 300,
            height: 40,
            placeholder: 'Inserisci il tuo nickname...'
        };
        
        this.passwordInput = {
            x: this.x + 100,
            y: this.y + 260,
            width: 300,
            height: 40,
            placeholder: 'Inserisci la tua password...'
        };
        
        // Fazioni disponibili
        this.factions = [
            {
                id: 'venus',
                name: 'VENUS',
                fullName: 'Venus Research Union',
                description: 'Fazione scientifica avanzata con tecnologie all\'avanguardia',
                color: '#9b59b6',
                icon: '🔬'
            },
            {
                id: 'mars',
                name: 'MARS',
                fullName: 'Mars Mining Organization',
                description: 'Fazione mineraria con focus su estrazione e produzione',
                color: '#e74c3c',
                icon: '⛏️'
            },
            {
                id: 'eic',
                name: 'EIC',
                fullName: 'Earth Industries Corporation',
                description: 'Fazione commerciale con vasta rete di scambi',
                color: '#4a90e2',
                icon: '🏢'
            }
        ];
        
        // Fazione selezionata
        this.selectedFaction = null;
        
        // Pulsanti
        this.loginButton = {
            x: this.x + 100,
            y: this.y + 500,
            width: 150,
            height: 50,
            text: 'LOGIN'
        };
        
        this.registerButton = {
            x: this.x + 270,
            y: this.y + 500,
            width: 150,
            height: 50,
            text: 'REGISTRATI'
        };
        
        this.modeToggleButton = {
            x: this.x + 440,
            y: this.y + 500,
            width: 150,
            height: 50,
            text: 'NUOVO ACCOUNT'
        };
        
        this.loadButton = {
            x: this.x + 100,
            y: this.y + 570,
            width: 200,
            height: 50,
            text: 'CARICA SALVATAGGIO'
        };
        
        this.logoutButton = {
            x: this.x + 320,
            y: this.y + 570,
            width: 150,
            height: 50,
            text: 'LOGOUT'
        };
        
        this.startGameButton = {
            x: this.x + 300,
            y: this.y + 500,
            width: 200,
            height: 50,
            text: 'INIZIA GIOCO'
        };

        // Stato salvataggi
        this.hasExistingSave = false;
        this.availableSaves = [];
        this.preferredSaveKey = 'main';
        this.errorMessage = '';
        this.successMessage = '';
    }
    
    // Aggiorna la schermata
    update(deltaTime) {
        console.log('🔄 StartScreen update - isVisible:', this.isVisible, 'isTyping:', this.isTyping, 'mode:', this.mode);
        
        // Blink del cursore
        this.cursorBlinkTime += deltaTime;
        if (this.cursorBlinkTime >= 500) {
            this.cursorVisible = !this.cursorVisible;
            this.cursorBlinkTime = 0;
        }

        // Aggiorna stato salvataggio esistente
        try {
            if (this.game.authSystem && this.game.authSystem.isLoggedIn) {
                this.hasExistingSave = this.game.authSystem.hasUserSave();
            } else if (this.game.saveSystem) {
                const keysToCheck = ['main', 'slot_1', 'slot_2', 'slot_3'];
                this.availableSaves = keysToCheck.filter(k => this.game.saveSystem.hasSave(k));
                this.hasExistingSave = this.availableSaves.length > 0;
                this.preferredSaveKey = this.availableSaves.includes('main') ? 'main' : (this.availableSaves[0] || 'main');
            } else {
                this.hasExistingSave = false;
                this.availableSaves = [];
            }
        } catch (e) {
            this.hasExistingSave = false;
            this.availableSaves = [];
        }
    }
    
    // Disegna la schermata
    draw(ctx) {
        if (!this.isVisible) return;
        
        console.log('🎨 Drawing StartScreen at:', this.x, this.y);
        
        // Sfondo semi-trasparente
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, this.game.width, this.game.height);
        
        // Pannello principale
        ctx.fillStyle = '#1a1a1a';
        ctx.strokeStyle = '#4a90e2';
        ctx.lineWidth = 2;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Titolo
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SPACE MMORPG', this.x + this.width / 2, this.y + 50);
        
        // Sottotitolo
        ctx.font = '18px Arial';
        ctx.fillStyle = '#cccccc';
        if (this.game.authSystem && this.game.authSystem.isLoggedIn) {
            ctx.fillText(`Benvenuto ${this.game.authSystem.currentUser.nickname}!`, this.x + this.width / 2, this.y + 80);
        } else {
            ctx.fillText('Accedi o registrati per iniziare', this.x + this.width / 2, this.y + 80);
        }
        
        // Input nickname (solo se non loggato)
        if (!this.game.authSystem || !this.game.authSystem.isLoggedIn) {
        this.drawNicknameInput(ctx);
            
            // Input password
            this.drawPasswordInput(ctx);
        }
        
        // Selezione fazione (solo per registrazione)
        if (this.mode === 'register') {
        this.drawFactionSelection(ctx);
        } else {
            // Messaggio informativo per login
            ctx.fillStyle = '#4a90e2';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('La tua fazione sarà caricata automaticamente', this.x + this.width / 2, this.y + 350);
        }
        
        // Pulsanti
        this.drawButtons(ctx);
        
        // Messaggi di errore/successo
        this.drawMessages(ctx);
    }
    
    // Disegna input nickname
    drawNicknameInput(ctx) {
        const input = this.nicknameInput;
        
        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Nickname:', input.x, input.y - 10);
        
        // Input field
        ctx.fillStyle = '#2a2a2a';
        ctx.strokeStyle = this.currentInput === 'nickname' ? '#4a90e2' : '#666666';
        ctx.lineWidth = this.currentInput === 'nickname' ? 3 : 2;
        ctx.fillRect(input.x, input.y, input.width, input.height);
        ctx.strokeRect(input.x, input.y, input.width, input.height);
        
        // Glow effect quando attivo
        if (this.currentInput === 'nickname') {
            ctx.shadowColor = '#4a90e2';
            ctx.shadowBlur = 10;
            ctx.strokeRect(input.x, input.y, input.width, input.height);
            ctx.shadowBlur = 0;
        }
        
        // Testo inserito
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        let displayText = this.nickname;
        if (displayText === '' && this.currentInput !== 'nickname') {
            displayText = input.placeholder;
            ctx.fillStyle = '#666666';
        }
        
        // Cursore
        if (this.currentInput === 'nickname' && this.cursorVisible) {
            displayText += '|';
        }
        
        ctx.fillText(displayText, input.x + 10, input.y + 25);
    }
    
    // Disegna input password
    drawPasswordInput(ctx) {
        const input = this.passwordInput;
        
        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Password:', input.x, input.y - 10);
        
        // Input field
        ctx.fillStyle = '#2a2a2a';
        ctx.strokeStyle = this.currentInput === 'password' ? '#4a90e2' : '#666666';
        ctx.lineWidth = this.currentInput === 'password' ? 3 : 2;
        ctx.fillRect(input.x, input.y, input.width, input.height);
        ctx.strokeRect(input.x, input.y, input.width, input.height);
        
        // Glow effect quando attivo
        if (this.currentInput === 'password') {
            ctx.shadowColor = '#4a90e2';
            ctx.shadowBlur = 10;
            ctx.strokeRect(input.x, input.y, input.width, input.height);
            ctx.shadowBlur = 0;
        }
        
        // Testo inserito (mascherare con asterischi)
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        let displayText = this.password.replace(/./g, '*');
        if (displayText === '' && this.currentInput !== 'password') {
            displayText = input.placeholder;
            ctx.fillStyle = '#666666';
        }
        
        // Cursore
        if (this.currentInput === 'password' && this.cursorVisible) {
            displayText += '|';
        }
        
        ctx.fillText(displayText, input.x + 10, input.y + 25);
    }
    
    // Disegna selezione fazione
    drawFactionSelection(ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Fazione:', this.x + 100, this.y + 350);
        
        const cardWidth = 180;
        const cardHeight = 100;
        const cardSpacing = 20;
        const startX = this.x + 100;
        const startY = this.y + 370;
        
        this.factions.forEach((faction, index) => {
            const cardX = startX + index * (cardWidth + cardSpacing);
            const cardY = startY;
            
            // Colore bordo basato su selezione
            const isSelected = this.selectedFaction === faction.id;
            ctx.strokeStyle = isSelected ? faction.color : '#666666';
            ctx.lineWidth = isSelected ? 3 : 2;
            
            // Sfondo carta
            ctx.fillStyle = isSelected ? 'rgba(74, 144, 226, 0.1)' : '#2a2a2a';
            ctx.fillRect(cardX, cardY, cardWidth, cardHeight);
            ctx.strokeRect(cardX, cardY, cardWidth, cardHeight);
            
            // Icona
            ctx.fillStyle = faction.color;
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(faction.icon, cardX + cardWidth / 2, cardY + 30);
            
            // Nome fazione
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px Arial';
            ctx.fillText(faction.name, cardX + cardWidth / 2, cardY + 50);
            
            // Descrizione
            ctx.fillStyle = '#cccccc';
            ctx.font = '10px Arial';
            const words = faction.description.split(' ');
            let line = '';
            let y = cardY + 70;
            words.forEach(word => {
                const testLine = line + word + ' ';
                const metrics = ctx.measureText(testLine);
                if (metrics.width > cardWidth - 10) {
                    ctx.fillText(line, cardX + cardWidth / 2, y);
                    line = word + ' ';
                    y += 12;
                } else {
                    line = testLine;
                }
            });
            ctx.fillText(line, cardX + cardWidth / 2, y);
        });
    }
    
    // Disegna pulsanti
    drawButtons(ctx) {
        // Pulsanti di login/registrazione (solo se non loggato)
        if (!this.game.authSystem || !this.game.authSystem.isLoggedIn) {
            // Pulsante Login
            this.drawButton(ctx, this.loginButton, this.mode === 'login');
            
            // Pulsante Registrati
            this.drawButton(ctx, this.registerButton, this.mode === 'register');
            
            // Pulsante toggle modalità
            this.drawButton(ctx, this.modeToggleButton, false);
        }
        
        // Pulsante carica salvataggio (solo se c'è un salvataggio)
        if (this.hasExistingSave) {
            this.drawButton(ctx, this.loadButton, false);
        }
        
        // Pulsanti per utente loggato
        if (this.game.authSystem && this.game.authSystem.isLoggedIn) {
            // Pulsante inizia gioco
            this.drawButton(ctx, this.startGameButton, false);
        }
    }
    
    // Disegna singolo pulsante
    drawButton(ctx, button, isActive) {
        const isHovered = this.isMouseOverButton(button);
        
        // Colore sfondo
        if (isActive) {
            ctx.fillStyle = '#4a90e2';
        } else if (isHovered) {
            ctx.fillStyle = '#5ba0f2';
        } else {
            ctx.fillStyle = '#666666';
        }
        
        // Disegna pulsante
        ctx.fillRect(button.x, button.y, button.width, button.height);
        
        // Bordo
        ctx.strokeStyle = isActive ? '#ffffff' : '#999999';
        ctx.lineWidth = 2;
        ctx.strokeRect(button.x, button.y, button.width, button.height);
        
        // Testo
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(button.text, button.x + button.width / 2, button.y + 30);
    }
    
    // Disegna messaggi di errore/successo
    drawMessages(ctx) {
        if (this.errorMessage) {
            ctx.fillStyle = '#e74c3c';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.errorMessage, this.x + this.width / 2, this.y + 120);
        }
        
        if (this.successMessage) {
            ctx.fillStyle = '#27ae60';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.successMessage, this.x + this.width / 2, this.y + 120);
        }
    }
    
    // Gestisce input da tastiera
    handleKeyPress(key) {
        if (!this.isVisible || !this.isTyping) return false;
        
        console.log('🔑 StartScreen handleKeyPress - key:', key, 'currentInput:', this.currentInput);
        
        // Tab per cambiare input
        if (key === 'Tab') {
            this.currentInput = this.currentInput === 'nickname' ? 'password' : 'nickname';
            return true;
        }
        
        // Enter per confermare (solo se non siamo in modalità login automatica)
        if (key === 'Enter') {
            if (this.game.authSystem && this.game.authSystem.isLoggedIn) {
                // Se già loggato, non fare nulla con Enter
                return true;
            }
            
            if (this.mode === 'login') {
                this.handleLogin();
            } else {
                this.handleRegister();
            }
            return true;
        }
        
        // Escape per uscire
        if (key === 'Escape') {
            this.isTyping = false;
            return true;
        }
        
        // Backspace
        if (key === 'Backspace') {
            if (this.currentInput === 'nickname' && this.nickname.length > 0) {
                this.nickname = this.nickname.slice(0, -1);
            } else if (this.currentInput === 'password' && this.password.length > 0) {
                this.password = this.password.slice(0, -1);
            }
            return true;
        }
        
        // Caratteri alfanumerici e spazio (solo se non siamo in modalità login automatica)
        if (key.startsWith('Key') || key.startsWith('Digit') || key === 'Space') {
            // Se siamo già loggati, non permettere input
            if (this.game.authSystem && this.game.authSystem.isLoggedIn) {
                return true;
            }
            
            let char = '';
            if (key.startsWith('Key')) {
                char = key.replace('Key', '').toLowerCase();
            } else if (key.startsWith('Digit')) {
                char = key.replace('Digit', '');
            } else if (key === 'Space') {
                char = ' ';
            }
            
            if (this.currentInput === 'nickname' && this.nickname.length < this.maxNicknameLength) {
                this.nickname += char;
            } else if (this.currentInput === 'password' && this.password.length < this.maxPasswordLength) {
                this.password += char;
            }
            return true;
        }
        
        return false;
    }
    
    // Gestisce click del mouse
    handleClick(x, y) {
        if (!this.isVisible) return false;
        
        console.log('🎯 StartScreen handleClick at:', x, y);
        
        // Click su input nickname (solo se non loggato)
        if (!this.game.authSystem || !this.game.authSystem.isLoggedIn) {
            if (this.isMouseOverInput(this.nicknameInput, x, y)) {
            console.log('✅ Click su input nickname');
                this.currentInput = 'nickname';
                this.isTyping = true;
                return true;
            }
            
            // Click su input password
            if (this.isMouseOverInput(this.passwordInput, x, y)) {
                console.log('✅ Click su input password');
                this.currentInput = 'password';
            this.isTyping = true;
            return true;
            }
        }
        
        // Click su fazioni (solo per registrazione)
        if (this.mode === 'register') {
            let factionClicked = false;
        this.factions.forEach((faction, index) => {
            const cardWidth = 180;
                const cardHeight = 100;
                const cardSpacing = 20;
                const startX = this.x + 100;
                const startY = this.y + 370;
                const cardX = startX + index * (cardWidth + cardSpacing);
                const cardY = startY;
                
                if (x >= cardX && x <= cardX + cardWidth && y >= cardY && y <= cardY + cardHeight) {
                console.log('✅ Click su fazione:', faction.name);
                this.selectedFaction = faction.id;
                    factionClicked = true;
                }
            });
            if (factionClicked) {
                return true;
            }
        }
        
        // Click su pulsanti (solo se non loggato)
        if (!this.game.authSystem || !this.game.authSystem.isLoggedIn) {
            if (this.isMouseOverButton(this.loginButton)) {
                console.log('✅ Click su pulsante login');
                this.handleLogin();
                return true;
            }
            
            if (this.isMouseOverButton(this.registerButton)) {
                console.log('✅ Click su pulsante registrati');
                this.handleRegister();
                return true;
            }
            
            if (this.isMouseOverButton(this.modeToggleButton)) {
                console.log('✅ Click su toggle modalità');
                this.mode = this.mode === 'login' ? 'register' : 'login';
                this.clearMessages();
            return true;
            }
        }
        
        if (this.hasExistingSave && this.isMouseOverButton(this.loadButton)) {
            console.log('✅ Click su pulsante carica salvataggio');
            this.handleLoadGame();
            return true;
        }
        
        if (this.game.authSystem && this.game.authSystem.isLoggedIn) {
            if (this.isMouseOverButton(this.startGameButton)) {
                console.log('✅ Click su pulsante inizia gioco');
                this.handleLoadGame();
                return true;
            }
        }
        
        // Click fuori dagli input - stop typing
        if (this.isTyping) {
            console.log('🔄 Click fuori dagli input - stop typing');
            this.isTyping = false;
        }
        
        return false;
    }
    
    // Gestisce login
    handleLogin() {
        if (!this.nickname.trim() || !this.password.trim()) {
            this.showError('Inserisci nickname e password');
            return;
        }
        
        if (!this.game.authSystem) {
            this.showError('Sistema di autenticazione non disponibile');
            return;
        }
        
        const result = this.game.authSystem.login(this.nickname.trim(), this.password);
        
        if (result.success) {
            this.showSuccess('Login effettuato con successo!');
            setTimeout(() => {
                this.startGameFromLogin(result.user);
            }, 1000);
        } else {
            this.showError(result.error);
        }
    }
    
    // Gestisce registrazione
    handleRegister() {
        if (!this.nickname.trim() || !this.password.trim()) {
            this.showError('Inserisci nickname e password');
            return;
        }
        
        if (!this.selectedFaction) {
            this.showError('Seleziona una fazione');
            return;
        }
        
        if (!this.game.authSystem) {
            this.showError('Sistema di autenticazione non disponibile');
            return;
        }
        
        const result = this.game.authSystem.register(this.nickname.trim(), this.password, this.selectedFaction);
        
        if (result.success) {
            this.showSuccess('Registrazione completata!');
            setTimeout(() => {
                this.startGame();
            }, 1000);
        } else {
            this.showError(result.error);
        }
    }
    
    // Gestisce caricamento gioco
    handleLoadGame() {
        if (this.game.authSystem && this.game.authSystem.isLoggedIn) {
            // Carica salvataggio utente
            if (this.game.authSystem.loadUserGame()) {
                this.hide();
                this.game.notifications.add('Gioco caricato!', 'success');
            } else {
                this.showError('Errore nel caricamento del salvataggio');
            }
        } else if (this.game.saveSystem) {
            // Carica salvataggio tradizionale
            const keysToCheck = ['main', 'slot_1', 'slot_2', 'slot_3'];
            for (const key of keysToCheck) {
                if (this.game.saveSystem.hasSave(key)) {
                    this.game.saveSystem.load(key);
                    this.game.mapManager.loadCurrentMapInstance();
                    this.hide();
                    this.game.notifications.add('Gioco caricato!', 'success');
                    return;
                }
            }
            this.showError('Nessun salvataggio trovato');
        }
    }
    
    // Avvia il gioco da login (usa fazione esistente)
    startGameFromLogin(user) {
        // Chiudi tutti i pannelli aperti
        this.closeAllPanels();
        
        // Imposta nickname e fazione dall'utente loggato
        this.game.playerProfile.setNickname(user.nickname);
        this.game.factionSystem.joinFaction(user.faction);
        
        // Imposta mappa di partenza basata sulla fazione dell'utente
        const startingMaps = {
            'venus': 'v1',
            'mars': 'm1',
            'eic': 'e1'
        };
        
        this.game.mapManager.currentMap = startingMaps[user.faction] || 'v1';
        this.game.mapManager.loadCurrentMapInstance();
        
        // Nascondi la schermata
        this.hide();
        
        // Avvia l'audio del gioco
        this.game.startGameAudio();
        
        // Notifica di benvenuto
        const faction = this.factions.find(f => f.id === user.faction);
        this.game.notifications.add(`Bentornato ${user.nickname} nella fazione ${faction.fullName}!`, 'success');
    }
    
    // Avvia il gioco da registrazione (usa fazione selezionata)
    startGame() {
        // Chiudi tutti i pannelli aperti
        this.closeAllPanels();
        
        // Imposta nickname e fazione
        this.game.playerProfile.setNickname(this.nickname.trim());
        this.game.factionSystem.joinFaction(this.selectedFaction);
        
        // Imposta mappa di partenza basata sulla fazione
        const startingMaps = {
            'venus': 'v1',
            'mars': 'm1',
            'eic': 'e1'
        };
        
        this.game.mapManager.currentMap = startingMaps[this.selectedFaction] || 'v1';
        this.game.mapManager.loadCurrentMapInstance();
        
        // Salva il gioco se l'utente è loggato
        if (this.game.authSystem && this.game.authSystem.isLoggedIn) {
            this.game.authSystem.saveUserGame();
        } else if (this.game.saveSystem) {
            this.game.saveSystem.save('main');
        }
        
        // Nascondi la schermata
        this.hide();
        
        // Avvia l'audio del gioco
        this.game.startGameAudio();
        
        // Notifica di benvenuto
        const faction = this.factions.find(f => f.id === this.selectedFaction);
        this.game.notifications.add(`Benvenuto ${this.nickname} nella fazione ${faction.fullName}!`, 'success');
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
    
    // Gestisce logout
    handleLogout() {
        if (this.game.authSystem) {
            this.game.authSystem.logout();
            this.clearMessages();
            this.showSuccess('Logout effettuato');
            // Reset dei campi
            this.nickname = '';
            this.password = '';
            this.selectedFaction = null;
            this.mode = 'login';
        }
    }
    
    // Chiude tutti i pannelli aperti
    closeAllPanels() {
        console.log('🚪 Chiudendo tutti i pannelli aperti...');
        
        // HomePanel
        if (this.game.homePanel) {
            this.game.homePanel.hide();
        }
        
        // ProfilePanel
        if (this.game.profilePanel) {
            this.game.profilePanel.close();
        }
        
        // SettingsPanel
        if (this.game.settingsPanel) {
            this.game.settingsPanel.isOpen = false;
        }
        
        // FactionPanel
        if (this.game.factionPanel) {
            this.game.factionPanel.close();
        }
        
        // SaveLoadPanel
        if (this.game.saveLoadPanel) {
            this.game.saveLoadPanel.isOpen = false;
        }
        
        // SpaceStationPanel
        if (this.game.spaceStationPanel) {
            this.game.spaceStationPanel.isOpen = false;
        }
        
        // MapSystem
        if (this.game.mapSystem) {
            this.game.mapSystem.isOpen = false;
        }
        
        console.log('✅ Tutti i pannelli chiusi');
    }
    
    // Pulisce i messaggi
    clearMessages() {
        this.errorMessage = '';
        this.successMessage = '';
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
        
        // Controlla se c'è già una sessione attiva
        if (this.game.authSystem && this.game.authSystem.isLoggedIn) {
            console.log('🎮 Utente già loggato, mostrando StartScreen con opzioni...');
            // Non nascondere automaticamente, mostra le opzioni
            return;
        }
        
        console.log('🎮 StartScreen shown - typing enabled');
    }
    
    // Nasconde la schermata
    hide() {
        this.isVisible = false;
        this.isTyping = false;
        console.log('🎮 StartScreen hidden');
    }
}
