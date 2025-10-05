// StartScreen Minimalista - Design Pulito e Funzionale
export class StartScreen {
    constructor(game) {
        console.log('🏗️ StartScreen constructor - creating login/register screen');
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
        
        // Sistema account per-nickname (chiavi isolate)
        this.currentAccount = null;
        this.currentAccountId = null;
        this.accountExists = false;
        this.accountButtons = [];
        
        // Animazioni
        this.animationTime = 0;
        this.stars = this.generateStars(80);

        // Stato salvataggi
        this.hasExistingSave = false;
        this.availableSaves = [];
        this.preferredSaveKey = 'main';
        this.errorMessage = '';
        this.successMessage = '';
        
        // Tracking dimensioni canvas
        this.lastCanvasWidth = this.game.canvas.width;
        this.lastCanvasHeight = this.game.canvas.height;

        // Prepara lista account
        this.refreshAccountButtons();
    }
    // === Gestione indice account (nickname -> accountId) ===
    loadAccountsIndex() {
        try {
            const raw = localStorage.getItem('mmorpg_accounts_index');
            if (!raw) return { byName: {}, byId: {}, list: [] };
            const idx = JSON.parse(raw);
            idx.byName = idx.byName || {};
            idx.byId = idx.byId || {};
            idx.list = Array.isArray(idx.list) ? idx.list : [];
            return idx;
        } catch (_) {
            return { byName: {}, byId: {}, list: [] };
        }
    }

    saveAccountsIndex(index) {
        try {
            localStorage.setItem('mmorpg_accounts_index', JSON.stringify(index));
        } catch (_) {}
    }

    generateAccountId() {
        const rand = Math.random().toString(36).slice(2, 10);
        return `acc_${Date.now()}_${rand}`;
    }

    // Crea bottoni per gli account esistenti
    refreshAccountButtons() {
        const idx = this.loadAccountsIndex();
        const listIds = Array.isArray(idx.list) ? idx.list : [];
        const items = listIds.map(id => {
            // Prova a leggere il nickname dal salvataggio per coerenza
            let nickname = (idx.byId?.[id]?.nickname) || '';
            try {
                const raw = localStorage.getItem(`mmorpg_account_${id}`);
                if (raw) {
                    const data = JSON.parse(raw);
                    // Preferisci nickname salvato nel player
                    nickname = data?.player?.nickname || data?.nickname || nickname || id;
                }
            } catch (_) {}
            if (!nickname) {
                nickname = Object.keys(idx.byName || {}).find(n => idx.byName[n] === id) || id;
            }
            return { id, nickname, lastPlayed: idx.byId?.[id]?.lastPlayed || 0 };
        });
        // Ordina per lastPlayed desc
        items.sort((a,b) => (b.lastPlayed||0) - (a.lastPlayed||0));

        // Layout centrato sotto l'input
        const w = 300; // larghezza come prima per i bottoni
        const x = Math.round(this.x + (this.width - w) / 2);
        const startY = Math.round(this.nameInput ? (this.nameInput.y + this.nameInput.height + 24) : (this.y + 260));
        const h = 36;
        const gap = 12;
        this.accountButtons = items.slice(0, 8).map((acc, i) => ({
            x, y: startY + i * (h + gap), width: w, height: h, accountId: acc.id, label: acc.nickname
        }));
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
    
    // Controlla se il giocatore ha già scelto una fazione (legacy)
    checkExistingFaction() {
        const savedFaction = localStorage.getItem('mmorpg_player_faction');
        return savedFaction && ['venus', 'mars', 'eic'].includes(savedFaction);
    }
    
    // Controlla se esiste l'account (per-nickname)
    checkAccountExists(accountName) {
        const index = this.loadAccountsIndex();
        const accountId = index.byName[accountName] || null;
        if (!accountId) return false;
        const accountKey = `mmorpg_account_${accountId}`;
        return localStorage.getItem(accountKey) !== null;
    }
    
    // Carica i dati dell'account specifico
    loadAccountDataById(accountId) {
        const accountKey = `mmorpg_account_${accountId}`;
        const accountData = localStorage.getItem(accountKey);
        
        if (accountData) {
            try {
                const data = JSON.parse(accountData);
                
                // Carica fazione (supporto sia a string id che a oggetto exportato)
                if (data.faction) {
                    try {
                        if (typeof data.faction === 'string') {
                            this.game.factionSystem.joinFaction(data.faction);
                        } else {
                            // Oggetto exportato dal SaveSystem
                            if (typeof this.game.factionSystem.importData === 'function') {
                                this.game.factionSystem.importData(data.faction);
                            } else if (data.faction.currentFaction) {
                                this.game.factionSystem.joinFaction(data.faction.currentFaction);
                            }
                        }
                    } catch (_) {}
                }
                
                // Carica mappa
                if (data.currentMap) {
                    this.game.mapManager.currentMap = data.currentMap;
                    this.game.mapManager.loadCurrentMapInstance();
                }
                
                // Carica dati nave
                if (data.ship) {
                    Object.assign(this.game.ship, data.ship);
                }
                
                // Carica inventario
                if (data.inventory) {
                    Object.assign(this.game.inventory, data.inventory);
                }
                
                // Carica risorse
                if (data.resources) {
                    Object.assign(this.game.ship.resources, data.resources);
                }

                // Forza nickname dall'indice account per allineamento (evita "TestPlayer")
                const idx = this.loadAccountsIndex();
                const forcedName = idx?.byId?.[accountId]?.nickname;
                if (forcedName) {
                    if (this.game.playerProfile && typeof this.game.playerProfile.setNickname === 'function') {
                        this.game.playerProfile.setNickname(forcedName);
                    }
                    if (this.game.ship && typeof this.game.ship.setPlayerName === 'function') {
                        this.game.ship.setPlayerName(forcedName);
                    } else if (this.game.ship) {
                        this.game.ship.playerName = forcedName;
                    }
                }
                
                console.log(`✅ Account ${accountId} caricato con successo`);
            } catch (error) {
                console.error('❌ Errore nel caricamento account:', error);
                this.showError('Errore nel caricamento account');
            }
        }
    }
    
    
    // Aggiorna le posizioni degli elementi
    updatePositions() {
        // Dimensioni responsive
        this.width = Math.min(800, this.game.canvas.width * 0.7);
        this.height = Math.min(600, this.game.canvas.height * 0.7);
        this.x = Math.round((this.game.canvas.width - this.width) / 2);
        this.y = Math.round((this.game.canvas.height - this.height) / 2);
        
        // Input nome utente (centrato)
        const inputWidth = 400;
        this.nameInput = {
            x: Math.round(this.x + (this.width - inputWidth) / 2),
            y: Math.round(this.y + 200),
            width: inputWidth,
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
        
        // Pulsanti salvataggi (rimossi)
        this.loadButtons = [];
        
        // Aggiorna lista account con nuovo layout e armonizza pulsante start
        this.refreshAccountButtons();
        if (this.accountButtons && this.accountButtons.length > 0) {
            const lastBtn = this.accountButtons[this.accountButtons.length - 1];
            const spacingBelow = 28;
            this.startGameButton.y = lastBtn.y + lastBtn.height + spacingBelow;
        } else {
            // Se non ci sono account, posiziona sotto l'input
            this.startGameButton.y = this.nameInput.y + this.nameInput.height + 36;
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
        
        // (Rimosso) Aggiorna stato salvataggi
    }
    
    // (Rimosso) updateSaveState
    
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
        
        // Pulsante inizia gioco
        this.drawStartButton(ctx);
        
        // (Rimosso) Salvataggi esistenti
        
        // Messaggi
        this.drawMessages(ctx);

        // Lista account esistenti centrata sotto l'input
        this.drawAccountsList(ctx);
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
        
        // Reset completo delle ombre per evitare ghost sui testi
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowColor = 'transparent';
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

        // Assicurati che i testi successivi non ereditino ombre
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
    }
    
    // Disegna input nome utente
    drawNameInput(ctx) {
        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Inserisci il tuo nome:', this.x + this.width / 2, this.nameInput.y - 15);
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
        
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
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
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
        
        // Click su un account salvato
        for (const btn of this.accountButtons) {
            if (x >= btn.x && x <= btn.x + btn.width && y >= btn.y && y <= btn.y + btn.height) {
                // Imposta accountId corrente e carica
                this.currentAccountId = btn.accountId;
                this.game.currentAccountId = btn.accountId;
                this.loadAccountDataById(btn.accountId);
                this.hide();
                this.game.startGameAudio();
                return true;
            }
        }
        
        
        // Click su pulsante inizia gioco
        if (this.isMouseOverButton(this.startGameButton)) {
            this.handleStartGame();
            return true;
        }
        
        // (Rimosso) Click su pulsanti salvataggi
        
        // Click fuori dall'input - stop typing
        if (this.isTyping) {
            this.isTyping = false;
        }
        
        return false;
    }
    
    // Gestisce avvio nuovo gioco
    handleStartGame() {
        const playerName = this.playerName.trim() || 'Player';
        
        // Imposta nickname visuale
        this.currentAccount = playerName;
        this.game.playerProfile.setNickname(playerName);
        this.game.ship.setPlayerName(playerName);
        
        // Controlla se esiste già l'account per-nickname
        this.accountExists = this.checkAccountExists(playerName);
        
        if (this.accountExists) {
            // Account esistente: risolvi accountId da indice e carica
            const index = this.loadAccountsIndex();
            const accountId = index.byName[playerName];
            this.currentAccountId = accountId;
            this.game.currentAccountId = accountId;
            this.loadAccountDataById(accountId);
            // Aggiorna lastPlayed
            index.byId[accountId] = index.byId[accountId] || { nickname: playerName, createdAt: Date.now() };
            index.byId[accountId].lastPlayed = Date.now();
            this.saveAccountsIndex(index);
            
            // Nasconde la StartScreen
            this.hide();
            
            // Avvia audio
            this.game.startGameAudio();
            
            this.game.notifications.add(`Bentornato ${playerName}!`, 'success');
        } else {
            // Nuovo account: genera accountId, aggiorna indice e vai a selezione fazione
            const index = this.loadAccountsIndex();
            const newId = this.generateAccountId();
            index.byName[playerName] = newId;
            index.byId[newId] = { nickname: playerName, createdAt: Date.now(), lastPlayed: Date.now() };
            index.list.push(newId);
            this.saveAccountsIndex(index);

            this.currentAccountId = newId;
            this.game.currentAccountId = newId;

            this.hide();
            this.game.factionSelectionScreen.show();
        }
    }

    // Disegna lista degli account salvati
    drawAccountsList(ctx) {
        if (!this.accountButtons || this.accountButtons.length === 0) return;
        // (Rimosso) Titolo lista account

        // Bottoni
        const mouse = this.game.input?.mouse || { x: -1, y: -1 };
        this.accountButtons.forEach(btn => {
            const hover = mouse.x >= btn.x && mouse.x <= btn.x + btn.width && mouse.y >= btn.y && mouse.y <= btn.y + btn.height;
            ctx.fillStyle = hover ? 'rgba(74,144,226,0.8)' : 'rgba(42,42,42,0.8)';
            ctx.fillRect(btn.x, btn.y, btn.width, btn.height);
            ctx.strokeStyle = hover ? '#4a90e2' : '#666666';
            ctx.lineWidth = 2;
            ctx.strokeRect(btn.x, btn.y, btn.width, btn.height);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 13px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(btn.label, btn.x + btn.width / 2, btn.y + 24);
        });
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