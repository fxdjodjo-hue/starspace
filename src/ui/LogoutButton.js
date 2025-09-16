// Pulsante di Logout con Countdown
export class LogoutButton {
    constructor(game) {
        this.game = game;
        this.isVisible = false;
        this.isCountingDown = false;
        this.countdownTime = 5; // 5 secondi
        this.currentCountdown = 0;
        this.countdownInterval = null;
        
        // Posizione in alto a destra
        this.x = game.width - 120;
        this.y = 20;
        this.width = 100;
        this.height = 40;
        
        // Stili
        this.backgroundColor = '#e74c3c';
        this.hoverBackgroundColor = '#c0392b';
        this.borderColor = '#ffffff';
        this.textColor = '#ffffff';
        this.countdownColor = '#ffeb3b';
    }
    
    // Mostra il pulsante
    show() {
        this.isVisible = true;
        console.log('🔓 LogoutButton mostrato');
    }
    
    // Nasconde il pulsante
    hide() {
        this.isVisible = false;
        this.stopCountdown();
        console.log('🔓 LogoutButton nascosto');
    }
    
    // Avvia il countdown
    startCountdown() {
        if (this.isCountingDown) return;
        
        this.isCountingDown = true;
        this.currentCountdown = this.countdownTime;
        
        console.log('⏰ Countdown logout iniziato:', this.currentCountdown);
        
        this.countdownInterval = setInterval(() => {
            this.currentCountdown--;
            console.log('⏰ Countdown logout:', this.currentCountdown);
            
            if (this.currentCountdown <= 0) {
                this.performLogout();
            }
        }, 1000);
    }
    
    // Ferma il countdown
    stopCountdown() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        this.isCountingDown = false;
        this.currentCountdown = 0;
        console.log('⏰ Countdown logout fermato');
    }
    
    // Esegue il logout
    performLogout() {
        this.stopCountdown();
        
        if (this.game.authSystem) {
            this.game.authSystem.logout();
            console.log('🚪 Logout eseguito');
            
            // Mostra StartScreen
            if (this.game.startScreen) {
                this.game.startScreen.show();
            }
            
            // Notifica
            if (this.game.notifications) {
                this.game.notifications.add('Logout effettuato', 'info');
            }
        }
    }
    
    // Aggiorna il pulsante
    update() {
        if (!this.isVisible) return;
        
        // Controlla se il mouse è sopra il pulsante
        const mousePos = this.game.input.getMousePosition();
        this.isHovered = this.isMouseOver(mousePos.x, mousePos.y);
    }
    
    // Disegna il pulsante
    draw(ctx) {
        if (!this.isVisible) return;
        
        // Colore di sfondo
        const bgColor = this.isHovered ? this.hoverBackgroundColor : this.backgroundColor;
        
        // Disegna sfondo
        ctx.fillStyle = bgColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Disegna bordo
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Testo del pulsante
        ctx.fillStyle = this.textColor;
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        
        let buttonText = 'LOGOUT';
        if (this.isCountingDown) {
            buttonText = `LOGOUT (${this.currentCountdown})`;
            ctx.fillStyle = this.countdownColor;
        }
        
        ctx.fillText(buttonText, this.x + this.width / 2, this.y + this.height / 2 + 5);
        
        // Barra di countdown
        if (this.isCountingDown) {
            const progress = this.currentCountdown / this.countdownTime;
            const barWidth = (this.width - 4) * progress;
            
            ctx.fillStyle = this.countdownColor;
            ctx.fillRect(this.x + 2, this.y + this.height - 4, barWidth, 2);
        }
    }
    
    // Gestisce il click
    handleClick(x, y) {
        if (!this.isVisible) return false;
        
        if (this.isMouseOver(x, y)) {
            if (this.isCountingDown) {
                // Se è in countdown, ferma il logout
                this.stopCountdown();
                console.log('⏰ Countdown logout annullato');
                return true;
            } else {
                // Avvia il countdown
                this.startCountdown();
                console.log('⏰ Countdown logout avviato');
                return true;
            }
        }
        
        return false;
    }
    
    // Controlla se il mouse è sopra il pulsante
    isMouseOver(x, y) {
        return x >= this.x && x <= this.x + this.width && 
               y >= this.y && y <= this.y + this.height;
    }
}
