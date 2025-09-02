// Modulo per la stazione spaziale
export class SpaceStation {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 800; // Raggio di collisione
        this.size = 1600; // Dimensione visuale
        this.active = true;
        this.messageShown = false; // Flag per evitare spam del messaggio
        this.currentMessage = null; // Tipo di messaggio attualmente mostrato
        
        // Sistema di interazione
        this.interactionDistance = 500; // Distanza per interagire
        
        // Movimento di fluttuazione
        this.originalX = x;
        this.originalY = y;
        this.floatOffset = 0;
        this.floatSpeed = 0.01;
        this.floatAmplitude = 8; // Ampiezza del movimento
        
        // Sprite della stazione
        this.image = null;
        this.isLoaded = false;
        
        // Carica l'immagine
        this.load();
    }
    
    load() {
        this.image = new Image();
        this.image.src = 'spacestation.png';
        
        this.image.onload = () => {
            this.isLoaded = true;
            console.log('🚀 Stazione spaziale caricata con successo!');
        };
        
        this.image.onerror = () => {
            console.log('🔇 Errore caricamento stazione spaziale');
        };
    }
    
    update() {
        // Aggiorna movimento di fluttuazione verticale
        this.floatOffset += this.floatSpeed;
        this.x = this.originalX; // X fissa
        this.y = this.originalY + Math.sin(this.floatOffset) * this.floatAmplitude;
    }
    
    draw(ctx, camera) {
        if (!this.active) return;
        
        const screenPos = camera.worldToScreen(this.x, this.y);
        const screenX = screenPos.x;
        const screenY = screenPos.y;
        
        ctx.save();
        ctx.translate(screenX, screenY);
        
        // Disegna la stazione se caricata, altrimenti fallback geometrico
        if (this.isLoaded) {
            ctx.drawImage(
                this.image,
                -this.size/2, -this.size/2, this.size, this.size
            );
        } else {
            // Fallback geometrico
            ctx.fillStyle = '#4a90e2';
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Testo "STATION"
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('STATION', 0, 0);
        }
        
        ctx.restore();
    }
    
    // Disegna l'indicatore "Premi E" quando sei vicino
    drawInteractionIndicator(ctx, camera, ship) {
        if (!this.active || !this.canInteract(ship)) return;
        
        const screenPos = camera.worldToScreen(this.x, this.y);
        const screenX = screenPos.x;
        const screenY = screenPos.y;
        
        // Posizione dell'indicatore (sopra la stazione)
        const indicatorY = screenY - this.size/2 - 40;
        
        // Sfondo semi-trasparente
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(screenX - 60, indicatorY - 15, 120, 30);
        
        // Bordo
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX - 60, indicatorY - 15, 120, 30);
        
        // Testo "Premi E"
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Premi E', screenX, indicatorY);
        
        // Icona tasto E
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('E', screenX, indicatorY - 25);
    }
    
    // Disegna il segnalino nella minimappa
    drawMinimap(ctx, minimapX, minimapY, minimapSize, worldSize) {
        if (!this.active) return;
        
        // Calcola la posizione nella minimappa
        const minimapPosX = minimapX + (this.x / worldSize) * minimapSize;
        const minimapPosY = minimapY + (this.y / worldSize) * minimapSize;
        
        // Disegna il segnalino giallo
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(minimapPosX, minimapPosY, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Bordo nero per contrasto
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    // Controlla se la nave è abbastanza vicina per interagire
    checkProximity(ship, interactionDistance = 150) {
        const distance = Math.sqrt(
            Math.pow(this.x - ship.x, 2) + Math.pow(this.y - ship.y, 2)
        );
        return distance < interactionDistance;
    }
    
    // Controlla se la nave può interagire con la stazione
    canInteract(ship) {
        const distance = Math.sqrt(
            Math.pow(this.x - ship.x, 2) + Math.pow(this.y - ship.y, 2)
        );
        return distance < this.interactionDistance;
    }
    
    // Controlla se la nave è nella zona della stazione e mostra il messaggio
    checkAndShowMessage(ship, gameInstance) {
        if (!this.active) return;
        
        const distance = Math.sqrt(
            Math.pow(this.x - ship.x, 2) + Math.pow(this.y - ship.y, 2)
        );
        
        // Se la nave è entro 1000 pixel dalla stazione, mostra il messaggio
        if (distance < 1000) {
            if (gameInstance && gameInstance.zoneNotifications) {
                // Se sei abbastanza vicino per interagire, mostra "Premi E"
                if (distance < this.interactionDistance) {
                    if (!this.messageShown || this.currentMessage !== 'interact') {
                        // Se c'è già una notifica, aggiorna il messaggio invece di crearne una nuova
                        if (this.zoneNotificationId && this.currentMessage === 'zone') {
                            // Aggiorna il messaggio esistente
                            const notification = gameInstance.zoneNotifications.activeNotifications.get(this.zoneNotificationId);
                            if (notification) {
                                notification.message = '🚀 SpaceStation\nSAFE ZONE\n[PREMI E]';
                                // Non riavviare il fade, mantieni l'alpha corrente
                            }
                        } else {
                            // Crea nuova notifica
                            if (this.zoneNotificationId) {
                                gameInstance.zoneNotifications.removeZoneNotification(this.zoneNotificationId);
                            }
                            
                            this.zoneNotificationId = gameInstance.zoneNotifications.addZoneNotification(
                                'SpaceStation', 
                                '🚀 SpaceStation\nSAFE ZONE\n[PREMI E]', 
                                'info'
                            );
                        }
                        this.messageShown = true;
                        this.currentMessage = 'interact';
                    }
                } else {
                    // Se sei nella zona ma non abbastanza vicino per interagire
                    if (!this.messageShown || this.currentMessage !== 'zone') {
                        // Se c'è già una notifica, aggiorna il messaggio invece di crearne una nuova
                        if (this.zoneNotificationId && this.currentMessage === 'interact') {
                            // Aggiorna il messaggio esistente
                            const notification = gameInstance.zoneNotifications.activeNotifications.get(this.zoneNotificationId);
                            if (notification) {
                                notification.message = '🚀 SpaceStation\nSAFE ZONE';
                                // Non riavviare il fade, mantieni l'alpha corrente
                            }
                        } else {
                            // Crea nuova notifica
                            if (this.zoneNotificationId) {
                                gameInstance.zoneNotifications.removeZoneNotification(this.zoneNotificationId);
                            }
                            
                            this.zoneNotificationId = gameInstance.zoneNotifications.addZoneNotification(
                                'SpaceStation', 
                                '🚀 SpaceStation\nSAFE ZONE', 
                                'info'
                            );
                        }
                        this.messageShown = true;
                        this.currentMessage = 'zone';
                    }
                }
            }
        } else {
            // Rimuovi la notifica quando esci dalla zona
            if (this.messageShown && this.zoneNotificationId && gameInstance && gameInstance.zoneNotifications) {
                gameInstance.zoneNotifications.removeZoneNotification(this.zoneNotificationId);
                this.messageShown = false;
                this.zoneNotificationId = null;
                this.currentMessage = null;
            }
        }
    }
}
