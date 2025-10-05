// Schermata di Selezione Iniziale - Design Moderno e Accattivante
export class StartScreen {
    constructor(game) {
        console.log('🏗️ StartScreen constructor - creating modern StartScreen');
        this.game = game;
        this.isVisible = true;
        this.isTyping = true;
        
        // Inizializza posizioni
        this.updatePositions();
        
        // Modalità: 'login' o 'register'
        this.mode = 'login';
        
        // Input utente
        this.nickname = '';
        this.password = '';
        this.maxNicknameLength = 20;
        this.maxPasswordLength = 30;
        this.cursorVisible = true;
        this.cursorBlinkTime = 0;
        this.currentInput = 'nickname';
        
        // Animazioni
        this.animationTime = 0;
        this.stars = this.generateStars(100);
        this.particleSystem = [];
        this.logoScale = 1;
        this.logoRotation = 0;
        
        
        // Fazioni con design migliorato
        this.factions = [
            {
                id: 'venus',
                name: 'VENUS',
                fullName: 'Venus Research Union',
                description: 'Scienziati all\'avanguardia con tecnologie avanzate',
                color: '#9b59b6',
                gradient: ['#9b59b6', '#8e44ad'],
                icon: '🔬',
                bgPattern: 'scientific'
            },
            {
                id: 'mars',
                name: 'MARS',
                fullName: 'Mars Mining Organization',
                description: 'Minatori esperti con equipaggiamenti robusti',
                color: '#e74c3c',
                gradient: ['#e74c3c', '#c0392b'],
                icon: '⛏️',
                bgPattern: 'mining'
            },
            {
                id: 'eic',
                name: 'EIC',
                fullName: 'Earth Industries Corporation',
                description: 'Commercianti con vasta rete di scambi',
                color: '#4a90e2',
                gradient: ['#4a90e2', '#2980b9'],
                icon: '🏢',
                bgPattern: 'corporate'
            }
        ];
        
        this.selectedFaction = null;
        

        // Stato salvataggi
        this.hasExistingSave = false;
        this.availableSaves = [];
        this.preferredSaveKey = 'main';
        this.errorMessage = '';
        this.successMessage = '';
        
        // Effetti visivi
        this.glowIntensity = 0;
        this.pulseScale = 1;
        
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
    
    // Aggiorna le posizioni degli elementi
    updatePositions() {
        // Dimensioni responsive
        this.width = Math.min(900, this.game.canvas.width * 0.8);
        this.height = Math.min(700, this.game.canvas.height * 0.8);
        this.x = Math.round((this.game.canvas.width - this.width) / 2);
        this.y = Math.round((this.game.canvas.height - this.height) / 2);
        
        // Input fields
        this.nicknameInput = {
            x: Math.round(this.x + 80),
            y: Math.round(this.y + 280),
            width: 400,
            height: 50,
            placeholder: 'Inserisci il tuo nickname...'
        };
        
        this.passwordInput = {
            x: Math.round(this.x + 80),
            y: Math.round(this.y + 350),
            width: 400,
            height: 50,
            placeholder: 'Inserisci la tua password...'
        };
        
        // Pulsanti
        this.loginButton = {
            x: Math.round(this.x + 80),
            y: Math.round(this.y + 450),
            width: 180,
            height: 55,
            text: 'LOGIN',
            gradient: ['#4a90e2', '#2980b9']
        };
        
        this.registerButton = {
            x: Math.round(this.x + 280),
            y: Math.round(this.y + 450),
            width: 180,
            height: 55,
            text: 'REGISTRATI',
            gradient: ['#27ae60', '#229954']
        };
        
        this.modeToggleButton = {
            x: Math.round(this.x + 480),
            y: Math.round(this.y + 450),
            width: 180,
            height: 55,
            text: 'NUOVO ACCOUNT',
            gradient: ['#f39c12', '#e67e22']
        };
        
        
        this.startGameButton = {
            x: Math.round(this.x + 300),
            y: Math.round(this.y + 450),
            width: 200,
            height: 55,
            text: 'INIZIA GIOCO',
            gradient: ['#e74c3c', '#c0392b']
        };
        
        // Rigenera stelle per le nuove dimensioni
        this.stars = this.generateStars(100);
    }
    
    // Aggiorna la schermata
    update(deltaTime) {
        // Aggiorna posizioni se le dimensioni del canvas sono cambiate
        if (this.game.canvas.width !== this.lastCanvasWidth || this.game.canvas.height !== this.lastCanvasHeight) {
            this.updatePositions();
            this.lastCanvasWidth = this.game.canvas.width;
            this.lastCanvasHeight = this.game.canvas.height;
        }
        
        // Blink del cursore
        this.cursorBlinkTime += deltaTime;
        if (this.cursorBlinkTime >= 500) {
            this.cursorVisible = !this.cursorVisible;
            this.cursorBlinkTime = 0;
        }
        
        // Animazioni
        this.logoScale = 1 + Math.sin(this.animationTime * 0.001) * 0.05;
        this.logoRotation = Math.sin(this.animationTime * 0.0005) * 0.1;
        this.glowIntensity = Math.sin(this.animationTime * 0.002) * 0.5 + 0.5;
        this.pulseScale = 1 + Math.sin(this.animationTime * 0.003) * 0.1;
        
        // Aggiorna stelle
        this.stars.forEach(star => {
            star.opacity += Math.sin(this.animationTime * star.twinkleSpeed) * 0.1;
        });
        
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
        
        // Sfondo con stelle animate
        this.drawAnimatedBackground(ctx);
        
        // Pannello principale con design moderno
        this.drawModernPanel(ctx);
        
        // Logo animato
        this.drawAnimatedLogo(ctx);
        
        // Input fields moderni
        if (!this.game.authSystem || !this.game.authSystem.isLoggedIn) {
            this.drawModernInputs(ctx);
        }
        
        // Selezione fazione
        if (this.mode === 'faction_selection') {
            this.drawModernFactionSelection(ctx);
        } else if (this.mode === 'register') {
            this.drawInfoMessage(ctx, 'La fazione verrà selezionata dopo la registrazione', '#4a90e2');
        } else {
            this.drawInfoMessage(ctx, 'La tua fazione sarà caricata automaticamente', '#4a90e2');
        }
        
        // Pulsanti moderni
        this.drawModernButtons(ctx);
        
        // Messaggi
        this.drawMessages(ctx);
    }
    
    // Disegna sfondo animato con stelle
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
        
        // Nebulosa di sfondo
        const nebulaGradient = ctx.createRadialGradient(
            this.game.canvas.width * 0.3, this.game.canvas.height * 0.2, 0,
            this.game.canvas.width * 0.3, this.game.canvas.height * 0.2, 300
        );
        nebulaGradient.addColorStop(0, 'rgba(74, 144, 226, 0.1)');
        nebulaGradient.addColorStop(1, 'rgba(74, 144, 226, 0)');
        
        ctx.fillStyle = nebulaGradient;
        ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);
    }
    
    // Disegna pannello principale moderno
    drawModernPanel(ctx) {
        // Ombra del pannello
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 10;
        
        // Sfondo del pannello con gradiente
        const panelGradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        panelGradient.addColorStop(0, 'rgba(26, 26, 26, 0.95)');
        panelGradient.addColorStop(1, 'rgba(20, 20, 20, 0.95)');
        
        ctx.fillStyle = panelGradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Bordo con glow
        ctx.shadowColor = '#4a90e2';
        ctx.shadowBlur = 15;
        ctx.strokeStyle = '#4a90e2';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Reset shadow
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Pattern di sfondo sottile
        ctx.strokeStyle = 'rgba(74, 144, 226, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i < this.width; i += 20) {
            ctx.beginPath();
            ctx.moveTo(this.x + i, this.y);
            ctx.lineTo(this.x + i, this.y + this.height);
            ctx.stroke();
        }
        for (let i = 0; i < this.height; i += 20) {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + i);
            ctx.lineTo(this.x + this.width, this.y + i);
            ctx.stroke();
        }
    }
    
    // Disegna logo animato
    drawAnimatedLogo(ctx) {
        ctx.save();
        
        // Posizione del logo
        const logoX = this.x + this.width / 2;
        const logoY = this.y + 80;
        
        // Trasformazioni per animazione
        ctx.translate(logoX, logoY);
        ctx.scale(this.logoScale, this.logoScale);
        ctx.rotate(this.logoRotation);
        
        // Glow effect
        ctx.shadowColor = '#4a90e2';
        ctx.shadowBlur = 20 * this.glowIntensity;
        
        // Titolo principale
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('STARSPACE', 0, 0);
        
        // Sottotitolo
        ctx.font = '18px Arial';
        ctx.fillStyle = '#4a90e2';
        ctx.fillText('MMORPG Spaziale', 0, 30);
        
        // Icona spaziale
        ctx.font = '32px Arial';
        ctx.fillText('🚀', 0, -40);
        
        ctx.restore();
        
        // Messaggio di benvenuto
        ctx.fillStyle = '#cccccc';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        if (this.game.authSystem && this.game.authSystem.isLoggedIn) {
            ctx.fillText(`Benvenuto ${this.game.authSystem.currentUser.nickname}!`, logoX, logoY + 60);
        } else {
            ctx.fillText('Accedi o registrati per iniziare la tua avventura spaziale', logoX, logoY + 60);
        }
    }
    
    // Disegna input fields moderni
    drawModernInputs(ctx) {
        this.drawModernInput(ctx, this.nicknameInput, 'Nickname:', this.nickname, this.currentInput === 'nickname');
        this.drawModernInput(ctx, this.passwordInput, 'Password:', this.password.replace(/./g, '*'), this.currentInput === 'password');
    }
    
    // Disegna singolo input moderno
    drawModernInput(ctx, input, label, value, isActive) {
        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(label, input.x, input.y - 15);
        
        // Glow effect quando attivo
        if (isActive) {
            ctx.shadowColor = '#4a90e2';
            ctx.shadowBlur = 15;
        }
        
        // Input field con gradiente
        const inputGradient = ctx.createLinearGradient(input.x, input.y, input.x, input.y + input.height);
        inputGradient.addColorStop(0, isActive ? 'rgba(74, 144, 226, 0.2)' : 'rgba(42, 42, 42, 0.8)');
        inputGradient.addColorStop(1, isActive ? 'rgba(74, 144, 226, 0.1)' : 'rgba(30, 30, 30, 0.8)');
        
        ctx.fillStyle = inputGradient;
        ctx.fillRect(input.x, input.y, input.width, input.height);
        
        // Bordo
        ctx.strokeStyle = isActive ? '#4a90e2' : '#666666';
        ctx.lineWidth = isActive ? 3 : 2;
        ctx.strokeRect(input.x, input.y, input.width, input.height);
        
        // Reset shadow
        ctx.shadowBlur = 0;
        
        // Testo
        ctx.fillStyle = value === '' ? '#666666' : '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        
        let displayText = value;
        if (displayText === '' && !isActive) {
            displayText = input.placeholder;
        }
        
        // Cursore
        if (isActive && this.cursorVisible) {
            displayText += '|';
        }
        
        ctx.fillText(displayText, input.x + 15, input.y + 30);
    }
    
    // Disegna selezione fazione moderna
    drawModernFactionSelection(ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Seleziona la tua fazione:', this.x + 80, this.y + 320);
        
        const cardWidth = 200;
        const cardHeight = 120;
        const cardSpacing = 20;
        const startX = this.x + 80;
        const startY = this.y + 350;
        
        this.factions.forEach((faction, index) => {
            const cardX = startX + index * (cardWidth + cardSpacing);
            const cardY = startY;
            const isSelected = this.selectedFaction === faction.id;
            
            // Glow effect per selezione
            if (isSelected) {
                ctx.shadowColor = faction.color;
                ctx.shadowBlur = 20;
            }
            
            // Gradiente della carta
            const cardGradient = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardHeight);
            cardGradient.addColorStop(0, isSelected ? `rgba(${this.hexToRgb(faction.color)}, 0.3)` : 'rgba(42, 42, 42, 0.8)');
            cardGradient.addColorStop(1, isSelected ? `rgba(${this.hexToRgb(faction.color)}, 0.1)` : 'rgba(30, 30, 30, 0.8)');
            
            ctx.fillStyle = cardGradient;
            ctx.fillRect(cardX, cardY, cardWidth, cardHeight);
            
            // Bordo
            ctx.strokeStyle = isSelected ? faction.color : '#666666';
            ctx.lineWidth = isSelected ? 3 : 2;
            ctx.strokeRect(cardX, cardY, cardWidth, cardHeight);
            
            // Reset shadow
            ctx.shadowBlur = 0;
            
            // Icona
            ctx.fillStyle = faction.color;
            ctx.font = '32px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(faction.icon, cardX + cardWidth / 2, cardY + 40);
            
            // Nome fazione
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px Arial';
            ctx.fillText(faction.name, cardX + cardWidth / 2, cardY + 65);
            
            // Descrizione
            ctx.fillStyle = '#cccccc';
            ctx.font = '12px Arial';
            const words = faction.description.split(' ');
            let line = '';
            let y = cardY + 85;
            words.forEach(word => {
                const testLine = line + word + ' ';
                const metrics = ctx.measureText(testLine);
                if (metrics.width > cardWidth - 20) {
                    ctx.fillText(line, cardX + cardWidth / 2, y);
                    line = word + ' ';
                    y += 14;
                } else {
                    line = testLine;
                }
            });
            ctx.fillText(line, cardX + cardWidth / 2, y);
        });
    }
    
    // Disegna pulsanti moderni
    drawModernButtons(ctx) {
        if (!this.game.authSystem || !this.game.authSystem.isLoggedIn) {
            this.drawModernButton(ctx, this.loginButton, this.mode === 'login');
            this.drawModernButton(ctx, this.registerButton, this.mode === 'register');
            this.drawModernButton(ctx, this.modeToggleButton, false);
        }
        
        if (this.game.authSystem && this.game.authSystem.isLoggedIn) {
            this.drawModernButton(ctx, this.startGameButton, false);
        }
    }
    
    // Disegna singolo pulsante moderno
    drawModernButton(ctx, button, isActive) {
        const isHovered = this.isMouseOverButton(button);
        
        // Glow effect
        if (isActive || isHovered) {
            ctx.shadowColor = button.gradient[0];
            ctx.shadowBlur = 15;
        }
        
        // Gradiente del pulsante
        const buttonGradient = ctx.createLinearGradient(button.x, button.y, button.x, button.y + button.height);
        if (isActive) {
            buttonGradient.addColorStop(0, button.gradient[0]);
            buttonGradient.addColorStop(1, button.gradient[1]);
        } else if (isHovered) {
            buttonGradient.addColorStop(0, this.lightenColor(button.gradient[0], 20));
            buttonGradient.addColorStop(1, this.lightenColor(button.gradient[1], 20));
        } else {
            buttonGradient.addColorStop(0, '#666666');
            buttonGradient.addColorStop(1, '#555555');
        }
        
        ctx.fillStyle = buttonGradient;
        ctx.fillRect(button.x, button.y, button.width, button.height);
        
        // Bordo
        ctx.strokeStyle = isActive ? '#ffffff' : '#999999';
        ctx.lineWidth = 2;
        ctx.strokeRect(button.x, button.y, button.width, button.height);
        
        // Reset shadow
        ctx.shadowBlur = 0;
        
        // Testo
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(button.text, button.x + button.width / 2, button.y + button.height / 2 + 5);
    }
    
    // Disegna messaggio informativo
    drawInfoMessage(ctx, message, color) {
        ctx.fillStyle = color;
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(message, this.x + this.width / 2, this.y + 420);
    }
    
    // Disegna messaggi di errore/successo
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
    
    // ... (mantieni tutti gli altri metodi esistenti per la funzionalità)
    // Gestisce input da tastiera
    handleKeyPress(key) {
        if (!this.isVisible || !this.isTyping) return false;
        
        console.log('🔑 StartScreen handleKeyPress - key:', key, 'currentInput:', this.currentInput);
        
        // Tab per cambiare input
        if (key === 'Tab') {
            this.currentInput = this.currentInput === 'nickname' ? 'password' : 'nickname';
            return true;
        }
        
        // Enter per confermare
        if (key === 'Enter') {
            if (this.game.authSystem && this.game.authSystem.isLoggedIn) {
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
        
        // Caratteri alfanumerici e spazio
        if (key.startsWith('Key') || key.startsWith('Digit') || key === 'Space') {
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
        
        // Click su input nickname
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
        
        // Click su fazioni
        if (this.mode === 'faction_selection') {
            let factionClicked = false;
            this.factions.forEach((faction, index) => {
                const cardWidth = 200;
                const cardHeight = 120;
                const cardSpacing = 20;
                const startX = this.x + 80;
                const startY = this.y + 350;
                const cardX = startX + index * (cardWidth + cardSpacing);
                const cardY = startY;
                
                if (x >= cardX && x <= cardX + cardWidth && y >= cardY && y <= cardY + cardHeight) {
                    console.log('✅ Click su fazione:', faction.name);
                    this.selectedFaction = faction.id;
                    factionClicked = true;
                }
            });
            if (factionClicked) {
                this.handleFactionSelection();
                return true;
            }
        }
        
        // Click su pulsanti
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
    
    // Mantieni tutti gli altri metodi esistenti...
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
    
    handleRegister() {
        if (!this.nickname.trim() || !this.password.trim()) {
            this.showError('Inserisci nickname e password');
            return;
        }
        
        if (!this.game.authSystem) {
            this.showError('Sistema di autenticazione non disponibile');
            return;
        }
        
        const result = this.game.authSystem.register(this.nickname.trim(), this.password, null);
        
        if (result.success) {
            this.showSuccess('Registrazione completata! Ora seleziona la tua fazione.');
            this.mode = 'faction_selection';
            this.clearMessages();
        } else {
            this.showError(result.error);
        }
    }
    
    handleFactionSelection() {
        if (!this.selectedFaction) {
            this.showError('Seleziona una fazione');
            return;
        }
        
        if (!this.game.authSystem) {
            this.showError('Sistema di autenticazione non disponibile');
            return;
        }
        
        console.log('🎮 Updating user faction to:', this.selectedFaction);
        const result = this.game.authSystem.updateUserFaction(this.selectedFaction);
        
        if (result.success) {
            console.log('🎮 Faction updated successfully, user data:', this.game.authSystem.currentUser);
            this.showSuccess('Fazione selezionata! Avvio del gioco...');
            setTimeout(() => {
                this.startGameFromLogin(this.game.authSystem.currentUser);
            }, 1000);
        } else {
            this.showError(result.error);
        }
    }
    
    handleLoadGame() {
        console.log('🎮 handleLoadGame called - isLoggedIn:', this.game.authSystem ? this.game.authSystem.isLoggedIn : false);
        if (this.game.authSystem && this.game.authSystem.isLoggedIn) {
            if (this.game.authSystem.loadUserGame()) {
                console.log('🎮 User game loaded, hiding StartScreen');
                
                const user = this.game.authSystem.currentUser;
                if (user) {
                    console.log('🎮 Loading user data:', user.nickname, user.faction);
                    this.game.playerProfile.setNickname(user.nickname);
                    this.game.ship.setPlayerName(user.nickname);
                    this.game.factionSystem.joinFaction(user.faction);
                    
                    console.log('🎮 Current faction after load:', this.game.factionSystem.currentFaction);
                }
                
                this.hide();
                this.game.notifications.add('Gioco caricato!', 'success');
            } else {
                this.showError('Errore nel caricamento del salvataggio');
            }
        } else if (this.game.saveSystem) {
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
    
    startGameFromLogin(user) {
        this.closeAllPanels();
        
        this.game.playerProfile.setNickname(user.nickname);
        this.game.ship.setPlayerName(user.nickname);
        this.game.factionSystem.joinFaction(user.faction);
        
        const startingMaps = {
            'venus': 'v1',
            'mars': 'm1',
            'eic': 'e1'
        };
        
        this.game.mapManager.currentMap = startingMaps[user.faction] || 'v1';
        this.game.mapManager.loadCurrentMapInstance();
        
        this.hide();
        this.game.startGameAudio();
        
        if (this.game.saveSystem) {
            this.game.saveSystem.save(this.game.authSystem.getUserSaveKey());
        }
        
        const faction = this.factions.find(f => f.id === user.faction);
        this.game.notifications.add(`Bentornato ${user.nickname} nella fazione ${faction.fullName}!`, 'success');
    }
    
    startGame() {
        this.closeAllPanels();
        
        this.game.playerProfile.setNickname(this.nickname.trim());
        this.game.ship.setPlayerName(this.nickname.trim());
        this.game.factionSystem.joinFaction(this.selectedFaction);
        
        const startingMaps = {
            'venus': 'v1',
            'mars': 'm1',
            'eic': 'e1'
        };
        
        this.game.mapManager.currentMap = startingMaps[this.selectedFaction] || 'v1';
        this.game.mapManager.loadCurrentMapInstance();
        
        if (this.game.authSystem && this.game.authSystem.isLoggedIn) {
            this.game.authSystem.saveUserGame();
        } else if (this.game.saveSystem) {
            this.game.saveSystem.save('main');
        }
        
        this.hide();
        this.game.startGameAudio();
        
        const faction = this.factions.find(f => f.id === this.selectedFaction);
        this.game.notifications.add(`Benvenuto ${this.nickname} nella fazione ${faction.fullName}!`, 'success');
    }
    
    showError(message) {
        this.errorMessage = message;
        this.successMessage = '';
        setTimeout(() => {
            this.errorMessage = '';
        }, 5000);
    }
    
    showSuccess(message) {
        this.successMessage = message;
        this.errorMessage = '';
        setTimeout(() => {
            this.successMessage = '';
        }, 3000);
    }
    
    handleLogout() {
        if (this.game.authSystem) {
            if (this.game.saveSystem) {
                this.game.saveSystem.save(this.game.authSystem.getUserSaveKey());
            }
            
            this.game.authSystem.logout();
            this.clearMessages();
            this.showSuccess('Logout effettuato');
            this.nickname = '';
            this.password = '';
            this.selectedFaction = null;
            this.mode = 'login';
        }
    }
    
    closeAllPanels() {
        console.log('🚪 Chiudendo tutti i pannelli aperti...');
        
        if (this.game.homePanel) {
            this.game.homePanel.hide();
        }
        
        if (this.game.profilePanel) {
            this.game.profilePanel.close();
        }
        
        if (this.game.settingsPanel) {
            this.game.settingsPanel.isOpen = false;
        }
        
        if (this.game.factionPanel) {
            this.game.factionPanel.close();
        }
        
        if (this.game.saveLoadPanel) {
            this.game.saveLoadPanel.isOpen = false;
        }
        
        if (this.game.spaceStationPanel) {
            this.game.spaceStationPanel.isOpen = false;
        }
        
        if (this.game.mapSystem) {
            this.game.mapSystem.isOpen = false;
        }
        
        console.log('✅ Tutti i pannelli chiusi');
    }
    
    clearMessages() {
        this.errorMessage = '';
        this.successMessage = '';
    }
    
    isMouseOverInput(input, x, y) {
        return x >= input.x && x <= input.x + input.width && 
               y >= input.y && y <= input.y + input.height;
    }
    
    isMouseOverButton(button) {
        const mousePos = this.game.input.getMousePosition();
        return mousePos.x >= button.x && mousePos.x <= button.x + button.width && 
               mousePos.y >= button.y && mousePos.y <= button.y + button.height;
    }
    
    show() {
        this.isVisible = true;
        this.isTyping = true;
        
        if (this.game.authSystem && this.game.authSystem.isLoggedIn) {
            console.log('🎮 Utente già loggato, mostrando StartScreen con opzioni...');
            
            if (!this.game.authSystem.currentUser.faction) {
                this.mode = 'faction_selection';
                this.showSuccess('Seleziona la tua fazione per continuare');
            }
            
            return;
        }
        
        console.log('🎮 StartScreen shown - typing enabled');
    }
    
    hide() {
        this.isVisible = false;
        this.isTyping = false;
        console.log('🎮 StartScreen hidden - isVisible:', this.isVisible);
    }
}