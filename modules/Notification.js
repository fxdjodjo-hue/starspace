import { ThemeConfig, ThemeUtils } from '../src/config/ThemeConfig.js';

// Modulo Notification per feedback visivo migliorato
export class Notification {
    constructor() {
        this.notifications = [];
        this.defaultDuration = 300; // 5 secondi a 60 FPS
        this.maxNotifications = 2; // Massimo 2 notifiche visibili
        this.animationSpeed = 0.5; // Velocità animazioni più veloce
    }
    
    // Aggiungi una notifica
    add(message, duration = this.defaultDuration, type = 'info') {
        // Gestisce tutte le notifiche in modo intelligente
        this.handleNotification(message, duration, type);
    }
    
    // Aggiungi una notifica di countdown (specializzata per logout)
    addCountdownNotification(message, type = 'warning') {
        const notification = {
            id: 'logout_countdown', // ID fisso per il countdown
            message: message,
            duration: 6000, // 6 secondi per dare tempo al countdown
            remainingTime: 6000,
            type: type,
            isCountdown: true, // Flag speciale per countdown
            // Animazioni
            alpha: 1,
            scale: 1,
            slideX: 0,
            // Posizione
            targetY: 180,
            currentY: 180,
            // Effetti
            glowIntensity: 0,
            pulsePhase: 0
        };
        
        // Rimuovi eventuali notifiche di countdown precedenti
        this.notifications = this.notifications.filter(n => n.id !== 'logout_countdown');
        
        this.notifications.push(notification);
        console.log('📝 Creata notifica countdown:', message);
        
        return 'logout_countdown';
    }
    
    // Aggiorna una notifica di countdown
    updateCountdownNotification(id, newMessage) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.message = newMessage;
            notification.remainingTime = 6000; // Reset del tempo
            console.log('📝 Aggiornata notifica countdown:', newMessage);
        }
    }
    
    // Gestisce le notifiche in modo intelligente
    handleNotification(message, duration, type) {
        // Se è una notifica di azione, pulisci e crea nuova
        if (message.includes('raccolta') || message.includes('distrutto')) {
            this.clearAll();
            this.createNotification(message, duration, 'success');
            return;
        }
        
        // Per le ricompense, aggiungi alla notifica esistente se c'è
        if (type === 'reward' && message.includes('+')) {
            const lastNotification = this.notifications[this.notifications.length - 1];
            if (lastNotification && lastNotification.type === 'success') {
                // Aggiungi la ricompensa alla notifica esistente
                lastNotification.message += `\n${message}`;
                lastNotification.remainingTime = Math.max(lastNotification.remainingTime, duration);
            } else {
                // Crea una nuova notifica per la ricompensa
                this.createNotification(message, duration, 'reward');
            }
            return;
        }
        
        // Per altre notifiche, crea una nuova
        this.createNotification(message, duration, type);
    }
    
    // Pulisce tutte le notifiche
    clearAll() {
        this.notifications = [];
    }
    
    // Aggiorna le notifiche
    update() {
        // Calcola posizioni target per tutte le notifiche con separazione fluida
        this.notifications.forEach((notification, index) => {
            // Calcola separazione basata sul tempo di creazione
            const timeDiff = this.getTimeDifferenceFromPrevious(notification, index);
            const baseY = 180; // Posizionato sotto le zone (zone startY = 100 + altezza zona)
            const baseSpacing = 30; // Spazio maggiore per evitare sovrapposizioni
            const extraSpacing = timeDiff > 60 ? 20 : 0; // Spazio extra se > 1 secondo di differenza
            
            // Calcola posizione target con separazione fluida
            let targetY = baseY;
            for (let i = 0; i < index; i++) {
                const prevTimeDiff = this.getTimeDifferenceFromPrevious(this.notifications[i], i);
                const prevExtraSpacing = prevTimeDiff > 60 ? 20 : 0;
                targetY += baseSpacing + prevExtraSpacing;
            }
            
            notification.targetY = targetY + extraSpacing;
        });
        
        this.notifications = this.notifications.filter(notification => {
            // Aggiorna animazioni
            this.updateNotificationAnimation(notification);
            
            // Decrementa tempo rimanente
            notification.remainingTime--;
            return notification.remainingTime > 0;
        });
    }
    
    // Aggiorna animazioni di una singola notifica - solo fade out graduale
    updateNotificationAnimation(notification) {
        const progress = 1 - (notification.remainingTime / notification.duration);
        
        // Solo effetto di scomparsa graduale negli ultimi 20 frame
        if (progress > 0.8) {
            const fadeProgress = (progress - 0.8) / 0.2;
            notification.alpha = 1 - fadeProgress;
        } else {
            notification.alpha = 1;
        }
        
        // Nessun'altra animazione - solo posizionamento e fade out
        notification.scale = 1;
        notification.slideX = 0;
        
        // Solo animazione di posizione verticale smooth
        notification.currentY += (notification.targetY - notification.currentY) * this.animationSpeed;
    }
    
    
    // Crea una notifica (metodo helper)
    createNotification(message, duration, type, isGrouped = false) {
        // Rimuovi notifiche vecchie se superiamo il limite
        if (this.notifications.length >= this.maxNotifications) {
            this.notifications.shift(); // Rimuovi la più vecchia
        }
        
        const notification = {
            id: Date.now() + Math.random(), // ID unico
            message: message,
            duration: duration,
            remainingTime: duration,
            type: type,
            isGrouped: isGrouped,
            groupedMessages: isGrouped ? [message] : null,
            // Animazioni
            alpha: 1, // Inizia visibile
            scale: 1, // Scala normale
            slideX: 0, // No slide
            // Posizione
            targetY: 180, // Posizione iniziale sotto le zone
            currentY: 180,
            // Effetti
            glowIntensity: 0,
            pulsePhase: 0
        };
        
        console.log('📝 Creata notifica:', notification);
        
        this.notifications.push(notification);
        console.log(`Notifica: ${message}`);
    }
    
    // Calcola la differenza di tempo dalla notifica precedente
    getTimeDifferenceFromPrevious(notification, index) {
        if (index === 0) return 0;
        
        const currentTime = notification.id;
        const previousNotification = this.notifications[index - 1];
        const previousTime = previousNotification.id;
        
        return currentTime - previousTime;
    }
    
    // Funzioni di easing per animazioni fluide
    easeOut(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    easeIn(t) {
        return t * t * t;
    }
    
    // Disegna tutte le notifiche
    draw(ctx) {
        this.notifications.forEach((notification, index) => {
            // Disegna separatore se necessario
            this.drawSeparatorIfNeeded(ctx, notification, index);
            
            // Disegna la notifica
            this.drawSingleNotification(ctx, notification, index);
        });
    }
    
    // Disegna separatore tra gruppi di notifiche
    drawSeparatorIfNeeded(ctx, notification, index) {
        if (index === 0) return;
        
        const timeDiff = this.getTimeDifferenceFromPrevious(notification, index);
        
        // Se c'è una differenza significativa di tempo, disegna un separatore
        if (timeDiff > 60) { // > 1 secondo
            const centerX = ctx.canvas.width / 2;
            const y = notification.currentY - 12; // Posizione del separatore
            
            // Linea separatrice sottile
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(centerX - 30, y);
            ctx.lineTo(centerX + 30, y);
            ctx.stroke();
        }
    }
    
    // Disegna una singola notifica con stile minimalista
    drawSingleNotification(ctx, notification, index) {
        // Salva stato del canvas
        ctx.save();
        
        // Posizione centrale orizzontale
        const centerX = ctx.canvas.width / 2;
        
        // Applica trasformazioni per animazioni
        ctx.translate(centerX + notification.slideX, notification.currentY);
        ctx.scale(notification.scale, notification.scale);
        ctx.globalAlpha = notification.alpha;
        
        // Formatta il messaggio in stile semplice
        const formattedMessage = this.formatSimpleMessage(notification.message, notification.type);
        
        // Testo con tema moderno
        ThemeUtils.drawText(ctx, formattedMessage, 0, 0, {
            size: 16,
            weight: 'bold',
            color: ThemeConfig.colors.text.primary,
            glow: true,
            align: 'center'
        });
        
        // Ripristina stato del canvas
        ctx.restore();
    }
    
    // Ottiene lo stile semplice per un tipo di notifica - tutto bianco
    getSimpleNotificationStyle(type) {
        return { textColor: '#ffffff' }; // Tutto bianco come richiesto
    }
    
    // Formatta il messaggio mostrando chiaramente cosa si ottiene
    formatSimpleMessage(message, type) {
        // Rimuovi tutte le emoji e mantieni solo il testo
        let cleanMessage = message.replace(/[💰💎🏆✨🎯⚔️💥🎉⏹️]/g, '').trim();
        
        // Per i reward, mostra chiaramente cosa si ottiene
        if (type === 'reward') {
            if (cleanMessage.includes('Credits')) {
                const match = cleanMessage.match(/\+(\d+)\s+Credits/);
                if (match) return `Credits: ${match[1]}`;
            }
            if (cleanMessage.includes('Uridium')) {
                const match = cleanMessage.match(/\+(\d+)\s+Uridium/);
                if (match) return `Uridium: ${match[1]}`;
            }
            if (cleanMessage.includes('Honor')) {
                const match = cleanMessage.match(/\+(\d+)\s+Honor/);
                if (match) return `Honor: ${match[1]}`;
            }
            if (cleanMessage.includes('XP')) {
                const match = cleanMessage.match(/\+(\d+)\s+XP/);
                if (match) return `XP: ${match[1]}`;
            }
        }
        
        // Per altri messaggi, mantieni il formato originale ma pulito
        return cleanMessage;
    }
    
    // Ottiene lo stile per un tipo di notifica (vecchio metodo mantenuto per compatibilità)
    getNotificationStyle(type) {
        const styles = {
            'success': {
                backgroundColor: 'rgba(0, 50, 0, 0.95)',
                borderColor: '#00ff00',
                textColor: '#00ff88',
                shadowColor: 'rgba(0, 255, 0, 0.3)',
                glowColor: 'rgba(0, 255, 0, 0.2)',
                progressColor: '#00ff00',
                iconColor: '#00ff00'
            },
            'reward': {
                backgroundColor: 'rgba(20, 0, 40, 0.95)',
                borderColor: '#ff6b35',
                textColor: '#ffaa66',
                shadowColor: 'rgba(255, 107, 53, 0.3)',
                glowColor: 'rgba(255, 107, 53, 0.2)',
                progressColor: '#ff6b35',
                iconColor: '#ff6b35'
            },
            'warning': {
                backgroundColor: 'rgba(50, 30, 0, 0.95)',
                borderColor: '#ffaa00',
                textColor: '#ffcc44',
                shadowColor: 'rgba(255, 170, 0, 0.3)',
                glowColor: 'rgba(255, 170, 0, 0.2)',
                progressColor: '#ffaa00',
                iconColor: '#ffaa00'
            },
            'error': {
                backgroundColor: 'rgba(50, 0, 0, 0.95)',
                borderColor: '#ff4444',
                textColor: '#ff6666',
                shadowColor: 'rgba(255, 68, 68, 0.3)',
                glowColor: 'rgba(255, 68, 68, 0.2)',
                progressColor: '#ff4444',
                iconColor: '#ff4444'
            },
            'welcome': {
                backgroundColor: 'rgba(0, 20, 40, 0.95)',
                borderColor: '#00aaff',
                textColor: '#66ccff',
                shadowColor: 'rgba(0, 170, 255, 0.3)',
                glowColor: 'rgba(0, 170, 255, 0.2)',
                progressColor: '#00aaff',
                iconColor: '#00aaff'
            },
            'info': {
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                borderColor: '#ffffff',
                textColor: '#ffffff',
                shadowColor: 'rgba(255, 255, 255, 0.3)',
                glowColor: 'rgba(255, 255, 255, 0.1)',
                progressColor: '#ffffff',
                iconColor: '#ffffff'
            }
        };
        
        return styles[type] || styles['info'];
    }
    
    // Disegna effetto glow
    drawGlowEffect(ctx, x, y, width, height, color, intensity) {
        const gradient = ctx.createRadialGradient(
            x + width/2, y + height/2, 0,
            x + width/2, y + height/2, width/2 + 20
        );
        gradient.addColorStop(0, color.replace('0.2', (0.2 * intensity).toFixed(2)));
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x - 20, y - 20, width + 40, height + 40);
    }
    
    // Disegna sfondo con gradiente
    drawGradientBackground(ctx, x, y, width, height, bgColor, borderColor) {
        // Sfondo principale
        ctx.fillStyle = bgColor;
        this.roundRect(ctx, x, y, width, height, 8);
        ctx.fill();
        
        // Gradiente interno
        const gradient = ctx.createLinearGradient(x, y, x, y + height);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
        
        ctx.fillStyle = gradient;
        this.roundRect(ctx, x, y, width, height, 8);
        ctx.fill();
    }
    
    // Disegna bordo con effetto
    drawBorder(ctx, x, y, width, height, color, intensity) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        // Glow disattivato per HUD
        // ctx.shadowColor = color;
        // ctx.shadowBlur = 5 * intensity;
        this.roundRect(ctx, x, y, width, height, 8);
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
    
    // Disegna testo con ombra
    drawTextWithShadow(ctx, text, x, y, textColor, shadowColor) {
        // Ombra
        // Ombra testo attenuata
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x + 2, y + 2);
        
        // Testo principale
        ctx.fillStyle = textColor;
        ctx.fillText(text, x, y);
    }
    
    // Disegna barra di progresso elegante
    drawProgressBar(ctx, x, y, width, height, remaining, total, color) {
        const progress = remaining / total;
        const progressWidth = width * progress;
        
        // Sfondo barra
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(x, y, width, height);
        
        // Barra di progresso
        if (progressWidth > 0) {
            const gradient = ctx.createLinearGradient(x, y, x + progressWidth, y);
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, color + '80');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, progressWidth, height);
        }
    }
    
    // Disegna icona per tipo di notifica
    drawNotificationIcon(ctx, x, y, type, color) {
        ctx.fillStyle = color;
        ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
        
        const icons = {
            'success': '✓',
            'reward': '💰',
            'warning': '⚠',
            'error': '✗',
            'welcome': '👋',
            'info': 'ℹ'
        };
        
        const icon = icons[type] || 'ℹ';
        ctx.fillText(icon, x, y);
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
        this.add(`Target selezionato: ${enemyType}`, 90, 'success');
    }
    
    // Notifica per combattimento
    combatStarted(enemyType) {
        this.add(`Combattimento iniziato contro ${enemyType}`, 90, 'warning');
    }
    
    // Notifica per fine combattimento
    combatStopped() {
        this.add(`Combattimento fermato`, 90, 'info');
    }
    
    // Notifica per nemico distrutto
    enemyDestroyed(enemyType) {
        this.add(`${enemyType} distrutto!`, 600, 'success'); // Stessa durata delle ricompense
    }
    
    // Notifica per quest completata
    questCompleted(questName, rewards = []) {
        let message = `🎉 Quest "${questName}" completata!`;
        
        if (rewards && rewards.length > 0) {
            message += `\nRicompense:`;
            rewards.forEach(reward => {
                const icon = this.getRewardIcon(reward.type);
                message += `\n${icon} ${reward.quantity} ${reward.description}`;
            });
        }
        
        this.add(message, 600, 'success');
    }
    
    // Ottiene l'icona per il tipo di ricompensa
    getRewardIcon(rewardType) {
        const icons = {
            'credits': '💰',
            'uridium': '💎',
            'honor': '🏆',
            'experience': '⭐'
        };
        return icons[rewardType] || '🎁';
    }
    
    // Notifica per esperienza guadagnata
    expGained(expAmount) {
        this.add(`+${expAmount} XP guadagnati!`, 120, 'info');
    }
    
    // Notifica per salita di livello
    levelUp(level, bonus) {
        this.add(`LIVELLO ${level} RAGGIUNTO! ${bonus}`, 180, 'success');
    }
}
