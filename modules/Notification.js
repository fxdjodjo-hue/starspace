// Modulo Notification per feedback visivo
export class Notification {
    constructor() {
        this.notifications = [];
        this.defaultDuration = 600; // 10 secondi a 60 FPS
    }
    
    // Aggiungi una notifica
    add(message, duration = this.defaultDuration, type = 'info') {
        const notification = {
            id: Date.now(),
            message: message,
            duration: duration,
            remainingTime: duration,
            type: type, // 'info', 'success', 'warning', 'error'
            y: 50 + this.notifications.length * 30 // Posizione verticale
        };
        
        this.notifications.push(notification);
        console.log(`Notifica: ${message}`);
    }
    
    // Aggiorna le notifiche
    update() {
        this.notifications = this.notifications.filter(notification => {
            notification.remainingTime--;
            return notification.remainingTime > 0;
        });
    }
    
    // Disegna tutte le notifiche
    draw(ctx) {
        this.notifications.forEach((notification, index) => {
            // Posizione centrale orizzontale
            const centerX = ctx.canvas.width / 2;
            
            // Posizione verticale dall'alto (più vicino al centro)
            notification.y = 120 + index * 35;
            
            // Stile minimalista basato sul tipo
            let backgroundColor, textColor;
            switch (notification.type) {
                case 'success':
                    backgroundColor = 'rgba(0, 0, 0, 0.9)';
                    textColor = '#00ff00';
                    break;
                case 'warning':
                    backgroundColor = 'rgba(0, 0, 0, 0.9)';
                    textColor = '#ffff00';
                    break;
                case 'error':
                    backgroundColor = 'rgba(0, 0, 0, 0.9)';
                    textColor = '#ff6666';
                    break;
                default:
                    backgroundColor = 'rgba(0, 0, 0, 0.9)';
                    textColor = '#ffffff';
            }
            
            // Calcola dimensioni del testo
            ctx.font = '14px Arial';
            const textMetrics = ctx.measureText(notification.message);
            const padding = 15;
            const width = textMetrics.width + padding * 2;
            const height = 28;
            
            // Posizione centrata
            const x = centerX - width / 2;
            const y = notification.y;
            
            // Sfondo con bordi arrotondati
            ctx.fillStyle = backgroundColor;
            this.roundRect(ctx, x, y, width, height, 6);
            ctx.fill();
            
            // Bordo sottile colorato
            ctx.strokeStyle = textColor;
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Testo centrato
            ctx.fillStyle = textColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(notification.message, centerX, y + height / 2);
            
            // Barra di progresso sottile (tempo rimanente)
            const progressWidth = (notification.remainingTime / notification.duration) * width;
            ctx.fillStyle = textColor;
            ctx.fillRect(x, y + height - 2, progressWidth, 2);
        });
    }
    
    // Metodo helper per bordi arrotondati
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
    
    // Notifica rapida per targeting
    targetSelected(enemyType) {
        this.add(`🎯 Target selezionato: ${enemyType}`, 90, 'success');
    }
    
    // Notifica per combattimento
    combatStarted(enemyType) {
        this.add(`⚔️ Combattimento iniziato contro ${enemyType}`, 90, 'warning');
    }
    
    // Notifica per fine combattimento
    combatStopped() {
        this.add(`⏹️ Combattimento fermato`, 90, 'info');
    }
    
    // Notifica per nemico distrutto
    enemyDestroyed(enemyType) {
        this.add(`💥 ${enemyType} distrutto!`, 120, 'success');
    }
    
    // Notifica per esperienza guadagnata
    expGained(expAmount) {
        this.add(`✨ +${expAmount} XP guadagnati!`, 120, 'info');
    }
    
    // Notifica per salita di livello
    levelUp(level, bonus) {
        this.add(`🎉 LIVELLO ${level} RAGGIUNTO! ${bonus}`, 180, 'success');
    }
}
