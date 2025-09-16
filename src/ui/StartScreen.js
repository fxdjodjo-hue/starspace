// Schermata di Selezione Iniziale - Nickname e Fazione
export class StartScreen {
    constructor(game) {
        console.log('🏗️ StartScreen constructor - creating StartScreen');
        this.game = game;
        this.isVisible = true;
        this.selectedFaction = null;
        this.nickname = '';
        this.isTyping = true; // Inizia automaticamente in modalità typing
        this.cursorVisible = true;
        this.cursorBlinkTime = 0;
        
        // Posizioni e dimensioni
        this.width = 800;
        this.height = 600;
        this.x = (game.width - this.width) / 2;
        this.y = (game.height - this.height) / 2;
        
        // Input field per nickname
        this.nicknameInput = {
            x: this.x + 100,
            y: this.y + 200,
            width: 300,
            height: 40,
            placeholder: 'Inserisci il tuo nickname...'
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
        
        // Pulsante start
        this.startButton = {
            x: this.x + 300,
            y: this.y + 500,
            width: 200,
            height: 50,
            text: 'INIZIA GIOCO'
        };

        // Pulsante carica salvataggio
        this.loadButton = {
            x: this.x + 80,
            y: this.y + 500,
            width: 200,
            height: 50,
            text: 'CARICA SALVATAGGIO'
        };

        // Flag presenza salvataggio
        this.hasExistingSave = false;
    }
    
    // Aggiorna la schermata
    update(deltaTime) {
        console.log('🔄 StartScreen update - isVisible:', this.isVisible, 'isTyping:', this.isTyping, 'nickname:', this.nickname, 'selectedFaction:', this.selectedFaction);
        
        // Debug: se isTyping è false ma dovrebbe essere true, forzalo
        if (this.isVisible && !this.isTyping && this.nickname === '') {
            console.log('🔧 Forcing isTyping to true for new StartScreen');
            this.isTyping = true;
        }
        
        // Blink del cursore
        this.cursorBlinkTime += deltaTime;
        if (this.cursorBlinkTime >= 500) {
            this.cursorVisible = !this.cursorVisible;
            this.cursorBlinkTime = 0;
        }

        // Aggiorna stato salvataggio esistente
        try {
            this.hasExistingSave = !!this.game.saveSystem && this.game.saveSystem.hasSave('main');
        } catch (e) {
            this.hasExistingSave = false;
        }
    }
    
    // Disegna la schermata
    draw(ctx) {
        console.log('🎨 StartScreen draw - isVisible:', this.isVisible, 'canvas size:', ctx.canvas.width, 'x', ctx.canvas.height);
        if (!this.isVisible) return;
        
        // Sfondo semi-trasparente
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, this.game.width, this.game.height);
        
        // Pannello principale
        ctx.fillStyle = 'rgba(20, 20, 30, 0.95)';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Bordo del pannello
        ctx.strokeStyle = '#4a90e2';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        console.log('🎨 Drawing panel at:', this.x, this.y, 'size:', this.width, 'x', this.height);
        
        // Titolo
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SPACE MMORPG', this.x + this.width/2, this.y + 60);
        
        // Sottotitolo
        ctx.font = '18px Arial';
        ctx.fillStyle = '#cccccc';
        ctx.fillText('Scegli il tuo nickname e la tua fazione', this.x + this.width/2, this.y + 90);
        
        // Input nickname
        this.drawNicknameInput(ctx);
        
        // Selezione fazioni
        this.drawFactionSelection(ctx);
        
        // Pulsante start
        this.drawStartButton(ctx);

        // Pulsante carica
        this.drawLoadButton(ctx);
        
        ctx.textAlign = 'left';
    }
    
    // Disegna l'input per il nickname
    drawNicknameInput(ctx) {
        const input = this.nicknameInput;
        
        console.log('🎨 Drawing nickname input at:', input.x, input.y, 'size:', input.width, 'x', input.height);
        
        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Nickname:', input.x, input.y - 10);
        
        // Input field
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(input.x, input.y, input.width, input.height);
        
        // Bordo
        ctx.strokeStyle = this.isTyping ? '#4a90e2' : '#666666';
        ctx.lineWidth = this.isTyping ? 3 : 2;
        ctx.strokeRect(input.x, input.y, input.width, input.height);
        
        // Glow effect quando sta digitando
        if (this.isTyping) {
            ctx.shadowColor = '#4a90e2';
            ctx.shadowBlur = 10;
            ctx.strokeRect(input.x, input.y, input.width, input.height);
            ctx.shadowBlur = 0;
        }
        
        // Testo
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        let displayText = this.nickname || input.placeholder;
        if (this.nickname === '') {
            ctx.fillStyle = '#888888';
        }
        ctx.fillText(displayText, input.x + 10, input.y + 25);
        
        // Cursore
        if (this.isTyping && this.cursorVisible) {
            const textWidth = ctx.measureText(this.nickname).width;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(input.x + 10 + textWidth, input.y + 10, 2, 20);
        }
    }
    
    // Disegna la selezione delle fazioni
    drawFactionSelection(ctx) {
        console.log('🎨 Drawing faction selection at:', this.x + 100, this.y + 280);
        
        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Fazione:', this.x + 100, this.y + 280);
        
        // Fazioni
        this.factions.forEach((faction, index) => {
            const cardX = this.x + 100 + (index * 200);
            const cardY = this.y + 300;
            const cardWidth = 180;
            const cardHeight = 120;
            
            console.log('🎨 Drawing faction card', index, 'at:', cardX, cardY, 'size:', cardWidth, 'x', cardHeight);
            const isSelected = this.selectedFaction === faction.id;
            
            // Sfondo della card
            ctx.fillStyle = isSelected ? 'rgba(74, 144, 226, 0.3)' : 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(cardX, cardY, cardWidth, cardHeight);
            
            // Bordo
            ctx.strokeStyle = isSelected ? faction.color : '#666666';
            ctx.lineWidth = isSelected ? 3 : 1;
            ctx.strokeRect(cardX, cardY, cardWidth, cardHeight);
            
            // Icona
            ctx.fillStyle = faction.color;
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(faction.icon, cardX + cardWidth/2, cardY + 30);
            
            // Nome
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px Arial';
            ctx.fillText(faction.name, cardX + cardWidth/2, cardY + 55);
            
            // Nome completo
            ctx.font = '10px Arial';
            ctx.fillStyle = '#cccccc';
            ctx.fillText(faction.fullName, cardX + cardWidth/2, cardY + 75);
            
            // Descrizione
            ctx.font = '9px Arial';
            ctx.fillStyle = '#aaaaaa';
            const words = faction.description.split(' ');
            const lines = [];
            let currentLine = '';
            words.forEach(word => {
                if (currentLine.length + word.length > 25) {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    currentLine += (currentLine ? ' ' : '') + word;
                }
            });
            if (currentLine) lines.push(currentLine);
            
            lines.forEach((line, lineIndex) => {
                ctx.fillText(line, cardX + cardWidth/2, cardY + 90 + (lineIndex * 12));
            });
        });
        
        ctx.textAlign = 'left';
    }
    
    // Disegna il pulsante start
    drawStartButton(ctx) {
        const button = this.startButton;
        const canStart = this.nickname.trim() !== '' && this.selectedFaction !== null;
        
        console.log('🎨 Drawing start button at:', button.x, button.y, 'size:', button.width, 'x', button.height, 'canStart:', canStart);
        
        // Sfondo del pulsante
        ctx.fillStyle = canStart ? 'rgba(74, 144, 226, 0.8)' : 'rgba(100, 100, 100, 0.5)';
        ctx.fillRect(button.x, button.y, button.width, button.height);
        
        // Bordo
        ctx.strokeStyle = canStart ? '#4a90e2' : '#666666';
        ctx.lineWidth = 2;
        ctx.strokeRect(button.x, button.y, button.width, button.height);
        
        // Testo
        ctx.fillStyle = canStart ? '#ffffff' : '#888888';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(button.text, button.x + button.width/2, button.y + 30);
        
        ctx.textAlign = 'left';
    }

    // Disegna il pulsante di carica
    drawLoadButton(ctx) {
        const button = this.loadButton;
        const canLoad = this.hasExistingSave;
        
        ctx.fillStyle = canLoad ? 'rgba(74, 226, 144, 0.8)' : 'rgba(100, 100, 100, 0.5)';
        ctx.fillRect(button.x, button.y, button.width, button.height);
        
        ctx.strokeStyle = canLoad ? '#4ae290' : '#666666';
        ctx.lineWidth = 2;
        ctx.strokeRect(button.x, button.y, button.width, button.height);
        
        ctx.fillStyle = canLoad ? '#0b1e12' : '#888888';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(button.text, button.x + button.width/2, button.y + 30);
        ctx.textAlign = 'left';
    }
    
    // Gestisce i click
    handleClick(x, y) {
        if (!this.isVisible) return false;
        
        console.log('🎯 StartScreen click at:', x, y);
        
        // Click su input nickname
        const input = this.nicknameInput;
        if (x >= input.x && x <= input.x + input.width && 
            y >= input.y && y <= input.y + input.height) {
            console.log('✅ Click su input nickname');
            this.isTyping = true;
            return true;
        } else {
            // Click fuori dall'input - ferma la digitazione se era attiva
            if (this.isTyping) {
                console.log('🔄 Click fuori dall\'input - stop typing');
                this.isTyping = false;
            }
        }
        
        // Click su fazioni
        let factionClicked = false;
        this.factions.forEach((faction, index) => {
            const cardX = this.x + 100 + (index * 200);
            const cardY = this.y + 300;
            const cardWidth = 180;
            const cardHeight = 120;
            
            console.log('🎯 Checking faction', index, 'bounds:', cardX, cardY, cardWidth, cardHeight, 'click at:', x, y);
            
            if (x >= cardX && x <= cardX + cardWidth && 
                y >= cardY && y <= cardY + cardHeight) {
                console.log('✅ Click su fazione:', faction.name, 'ID:', faction.id);
                this.selectedFaction = faction.id;
                factionClicked = true;
            }
        });
        
        if (factionClicked) {
            return true;
        }
        
        // Click su pulsante start
        const button = this.startButton;
        if (x >= button.x && x <= button.x + button.width && 
            y >= button.y && y <= button.y + button.height) {
            console.log('✅ Click su pulsante start');
            if (this.nickname.trim() !== '' && this.selectedFaction !== null) {
                this.startGame();
                return true;
            }
        }

        // Click su pulsante carica salvataggio
        const loadBtn = this.loadButton;
        if (x >= loadBtn.x && x <= loadBtn.x + loadBtn.width &&
            y >= loadBtn.y && y <= loadBtn.y + loadBtn.height) {
            console.log('📁 Click su pulsante carica salvataggio');
            if (this.hasExistingSave) {
                this.loadGame();
                return true;
            }
        }
        
        return false;
    }
    
    // Gestisce l'input da tastiera
    handleKeyPress(key) {
        if (!this.isVisible || !this.isTyping) return false;
        
        console.log('🔑 StartScreen handleKeyPress - key:', key, 'nickname:', this.nickname);
        
        // Test key per debug
        if (key === 'KeyT') {
            this.nickname += 'TEST';
            console.log('🧪 Test key pressed - nickname now:', this.nickname);
            return true;
        }
        
        if (key === 'Enter') {
            // Se il nickname è valido, termina la digitazione
            if (this.nickname.trim() !== '') {
                this.isTyping = false;
            }
            return true;
        }
        
        if (key === 'Backspace') {
            this.nickname = this.nickname.slice(0, -1);
            return true;
        }
        
        // Gestisci i codici delle chiavi (lettere)
        if (key.startsWith('Key') && this.nickname.length < 20) {
            const char = key.charAt(3).toLowerCase();
            this.nickname += char;
            return true;
        }
        
        // Gestisci numeri
        if (key.startsWith('Digit') && this.nickname.length < 20) {
            const digit = key.charAt(5); // Digit0, Digit1, etc.
            this.nickname += digit;
            return true;
        }
        
        // Gestisci spazio
        if (key === 'Space' && this.nickname.length < 20) {
            this.nickname += ' ';
            return true;
        }
        
        return false;
    }
    
    // Inizia il gioco
    startGame() {
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
        
        // Nascondi la schermata
        this.isVisible = false;
        
        // Notifica di benvenuto
        const faction = this.factions.find(f => f.id === this.selectedFaction);
        this.game.notifications.add(`Benvenuto ${this.nickname} nella fazione ${faction.name}!`, 'success');
    }

    // Carica il gioco da salvataggio esistente
    loadGame() {
        if (!this.game.saveSystem) return;
        const ok = this.game.saveSystem.load('main');
        if (ok) {
            // Assicura di caricare istanza mappa
            if (this.game.mapManager) {
                this.game.mapManager.loadCurrentMapInstance();
            }
            this.isVisible = false;
            this.game.notifications.add('📁 Salvataggio caricato. Bentornato!', 2000, 'success');
        } else {
            this.game.notifications.add('❌ Nessun salvataggio valido trovato', 3000, 'error');
        }
    }
    
    // Mostra la schermata
    show() {
        this.isVisible = true;
        this.isTyping = true; // Abilita automaticamente la digitazione
        console.log('🎮 StartScreen shown - typing enabled');
    }
    
    // Nasconde la schermata
    hide() {
        this.isVisible = false;
    }
}
