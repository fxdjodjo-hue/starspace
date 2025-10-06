// Sistema di notifiche di zona persistente
export class ZoneNotification {
    constructor() {
        this.activeNotifications = new Map(); // Map per gestire più notifiche simultanee
        this.notificationId = 0;
    }
    
    // Aggiungi una notifica di zona persistente
    addZoneNotification(zoneName, message, type = 'info') {
        const id = `zone_${this.notificationId++}`;
        this.activeNotifications.set(id, {
            zoneName: zoneName,
            message: message,
            type: type,
            id: id,
            alpha: 0, // Inizia trasparente per il fade in
            fadeIn: true,
            fadeOut: false
        });
        return id;
    }
    
    // Rimuovi una notifica di zona
    removeZoneNotification(id) {
        if (this.activeNotifications.has(id)) {
            const notification = this.activeNotifications.get(id);
            // Inizia il fade out invece di rimuovere immediatamente
            notification.fadeOut = true;
            notification.fadeIn = false;
        }
    }
    
    // Rimuovi tutte le notifiche di una zona specifica
    removeZoneNotifications(zoneName) {
        for (const [id, notification] of this.activeNotifications.entries()) {
            if (notification.zoneName === zoneName) {
                this.removeZoneNotification(id);
            }
        }
    }
    
    // Controlla se una zona è attiva
    isZoneActive(zoneName) {
        for (const notification of this.activeNotifications.values()) {
            if (notification.zoneName === zoneName) {
                return true;
            }
        }
        return false;
    }
    
    // Ottieni tutte le notifiche attive
    getActiveNotifications() {
        return Array.from(this.activeNotifications.values());
    }
    
    // Pulisci tutte le notifiche
    clearAll() {
        this.activeNotifications.clear();
    }
    
    // Aggiorna il sistema (per future estensioni)
    update() {
        // Gestisce il fade in/out delle notifiche
        for (const [id, notification] of this.activeNotifications.entries()) {
            if (notification.fadeIn) {
                notification.alpha += 0.05; // Velocità fade in
                if (notification.alpha >= 1) {
                    notification.alpha = 1;
                    notification.fadeIn = false;
                }
            } else if (notification.fadeOut) {
                notification.alpha -= 0.05; // Velocità fade out
                if (notification.alpha <= 0) {
                    // Rimuovi completamente quando il fade out è completato
                    this.activeNotifications.delete(id);
                }
            }
        }
    }
}
