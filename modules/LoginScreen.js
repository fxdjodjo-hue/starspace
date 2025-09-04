// Schermata di Login Mock
export class LoginScreen {
    constructor(game) {
        this.game = game;
        this.isVisible = true;
        this.playerName = '';
        this.isTyping = false;
        this.cursorBlink = 0;
        this.animationTime = 0;
        
        // Elementi UI
        this.inputField = {
            x: 0,
            y: 0,
            width: 300,
            height: 50,
            active: false
        };
        
        this.loginButton = {
            x: 0,
            y: 0,
            width: 150,
            height: 40,
            hover: false
        };
        
        // Stelle animate
        this.stars = [];
        this.generateStars();
    }
    
    // Genera stelle per lo sfondo
    generateStars() {
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * this.game.width,
                y: Math.random() * this.game.height,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 0.5 + 0.1,
                alpha: Math.random() * 0.8 + 0.2
            });
        }
    }
    
    // Aggiorna la schermata di login
    update() {
        if (!this.isVisible) return;
        
        this.animationTime += 0.016; // ~60fps
        this.cursorBlink += 0.1;
        
        // Aggiorna stelle
        this.stars.forEach(star => {
            star.y += star.speed;
            if (star.y > this.game.height) {
                star.y = -star.size;
                star.x = Math.random() * this.game.width;
            }
        });
        
        // Calcola posizioni UI
        this.inputField.x = this.game.width / 2 - this.inputField.width / 2;
        this.inputField.y = this.game.height / 2 - 50;
        
        this.loginButton.x = this.game.width / 2 - this.loginButton.width / 2;
        this.loginButton.y = this.game.height / 2 + 20;
    }
    
    // Gestisce input da tastiera
    handleKeyPress(key) {
        if (!this.isVisible) return;
        
        console.log('🔤 Tasto premuto:', key, 'Input attivo:', this.inputField.active);
        
        if (key === 'Backspace') {
            this.playerName = this.playerName.slice(0, -1);
        } else if (key === 'Enter') {
            this.login();
        } else if (key.length === 1 && this.playerName.length < 20) {
            // Filtra solo caratteri alfanumerici e spazi
            if (/[a-zA-Z0-9\s]/.test(key)) {
                this.playerName += key;
            }
        }
    }
    
    // Gestisce click del mouse
    handleClick(x, y) {
        if (!this.isVisible) return;
        
        console.log('🖱️ Click ricevuto:', x, y);
        console.log('📦 Input field:', this.inputField.x, this.inputField.y, this.inputField.width, this.inputField.height);
        
        // Click su input field
        if (x >= this.inputField.x && x <= this.inputField.x + this.inputField.width &&
            y >= this.inputField.y && y <= this.inputField.y + this.inputField.height) {
            console.log('✅ Click su input field!');
            this.inputField.active = true;
            this.isTyping = true;
        } else {
            console.log('❌ Click fuori input field');
            this.inputField.active = false;
            this.isTyping = false;
        }
        
        // Click su login button
        if (x >= this.loginButton.x && x <= this.loginButton.x + this.loginButton.width &&
            y >= this.loginButton.y && y <= this.loginButton.y + this.loginButton.height) {
            this.login();
        }
    }
    
    // Gestisce hover del mouse
    handleMouseMove(x, y) {
        if (!this.isVisible) return;
        
        // Hover su login button
        this.loginButton.hover = (x >= this.loginButton.x && x <= this.loginButton.x + this.loginButton.width &&
                                 y >= this.loginButton.y && y <= this.loginButton.y + this.loginButton.height);
    }
    
    // Esegue il login
    login() {
        if (this.playerName.trim().length < 2) return;
        
        // Imposta il nome del giocatore
        this.game.ship.playerName = this.playerName.trim();
        
        // Nasconde la schermata di login
        this.isVisible = false;
        
        // Avvia il gioco
        console.log('🎮 Login effettuato:', this.playerName);
    }
    
    // Disegna la schermata di login
    draw(ctx) {
        if (!this.isVisible) return;
        
        // Sfondo scuro con stelle
        this.drawBackground(ctx);
        
        // Overlay scuro
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.game.width, this.game.height);
        
        // Titolo del gioco
        this.drawTitle(ctx);
        
        // Input field
        this.drawInputField(ctx);
        
        // Login button
        this.drawLoginButton(ctx);
        
        // Istruzioni
        this.drawInstructions(ctx);
    }
    
    // Disegna lo sfondo con stelle
    drawBackground(ctx) {
        ctx.fillStyle = '#000011';
        ctx.fillRect(0, 0, this.game.width, this.game.height);
        
        // Stelle animate
        this.stars.forEach(star => {
            ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    // Disegna il titolo
    drawTitle(ctx) {
        ctx.save();
        
        // Titolo principale
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#0088ff';
        ctx.shadowBlur = 10;
        ctx.fillText('STARSPACE', this.game.width / 2, this.game.height / 2 - 150);
        
        // Sottotitolo
        ctx.fillStyle = '#88aaff';
        ctx.font = '20px Arial';
        ctx.shadowBlur = 5;
        ctx.fillText('MMORPG Spaziale', this.game.width / 2, this.game.height / 2 - 110);
        
        ctx.restore();
    }
    
    // Disegna il campo di input
    drawInputField(ctx) {
        ctx.save();
        
        // Bordo del campo
        ctx.strokeStyle = this.inputField.active ? '#00ffff' : '#4488ff';
        ctx.lineWidth = this.inputField.active ? 3 : 2;
        ctx.strokeRect(this.inputField.x, this.inputField.y, this.inputField.width, this.inputField.height);
        
        // Indicatore di attivazione
        if (this.inputField.active) {
            ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
            ctx.fillRect(this.inputField.x, this.inputField.y, this.inputField.width, this.inputField.height);
        }
        
        // Sfondo del campo
        ctx.fillStyle = 'rgba(0, 20, 40, 0.8)';
        ctx.fillRect(this.inputField.x + 2, this.inputField.y + 2, this.inputField.width - 4, this.inputField.height - 4);
        
        // Testo del placeholder o input
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px Arial';
        ctx.textAlign = 'left';
        
        const text = this.playerName || 'Inserisci il tuo nome...';
        const textColor = this.playerName ? '#ffffff' : '#666666';
        ctx.fillStyle = textColor;
        
        ctx.fillText(text, this.inputField.x + 10, this.inputField.y + 30);
        
        // Cursore lampeggiante
        if (this.inputField.active && Math.floor(this.cursorBlink) % 2 === 0) {
            const textWidth = ctx.measureText(this.playerName).width;
            ctx.fillStyle = '#00ffff';
            ctx.fillRect(this.inputField.x + 10 + textWidth, this.inputField.y + 15, 2, 20);
        }
        
        ctx.restore();
    }
    
    // Disegna il pulsante di login
    drawLoginButton(ctx) {
        ctx.save();
        
        // Colore del pulsante
        const buttonColor = this.loginButton.hover ? '#00aaff' : '#0088ff';
        const textColor = this.loginButton.hover ? '#ffffff' : '#cccccc';
        
        // Sfondo del pulsante
        ctx.fillStyle = buttonColor;
        ctx.fillRect(this.loginButton.x, this.loginButton.y, this.loginButton.width, this.loginButton.height);
        
        // Bordo del pulsante
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.loginButton.x, this.loginButton.y, this.loginButton.width, this.loginButton.height);
        
        // Testo del pulsante
        ctx.fillStyle = textColor;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('ENTRA NEL GIOCO', this.loginButton.x + this.loginButton.width / 2, this.loginButton.y + 25);
        
        ctx.restore();
    }
    
    // Disegna le istruzioni
    drawInstructions(ctx) {
        ctx.save();
        
        ctx.fillStyle = '#88aaff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        
        const instructions = [
            'Clicca sul campo per inserire il tuo nome',
            'Premi ENTER o clicca "ENTRA NEL GIOCO" per iniziare'
        ];
        
        instructions.forEach((instruction, index) => {
            ctx.fillText(instruction, this.game.width / 2, this.game.height / 2 + 120 + index * 20);
        });
        
        ctx.restore();
    }
}
