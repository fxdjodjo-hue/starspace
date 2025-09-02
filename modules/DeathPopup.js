export class DeathPopup {
    constructor() {
        this.isVisible = false;
        this.nearestStation = null;
        this.playerX = 0;
        this.playerY = 0;
    }

    show(playerX, playerY, nearestStation) {
        this.isVisible = true;
        this.playerX = playerX;
        this.playerY = playerY;
        this.nearestStation = nearestStation;
        
        // Riproduci suono di morte quando il popup appare
        if (window.gameInstance && window.gameInstance.audioManager) {
            window.gameInstance.audioManager.playDeathSound();
        }
    }

    hide() {
        this.isVisible = false;
        this.nearestStation = null;
    }

    handleClick(x, y, ship) {
        if (!this.isVisible) return false;

        // Controlla se il click è sul pulsante respawn
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const buttonX = centerX - 100;
        const buttonY = centerY + 50;
        const buttonWidth = 200;
        const buttonHeight = 40;

        if (x >= buttonX && x <= buttonX + buttonWidth && 
            y >= buttonY && y <= buttonY + buttonHeight) {
            
            // Esegui respawn
            this.performRespawn(ship);
            this.hide();
            return true;
        }

        return false;
    }

    performRespawn(ship) {
        if (this.nearestStation) {
            // Respawn nella stazione più vicina
            ship.x = this.nearestStation.x + 100;
            ship.y = this.nearestStation.y;
        } else {
            // Fallback: respawn al centro della mappa
            ship.x = 0;
            ship.y = 0;
        }

        // Ripristina HP e scudo
        ship.hp = ship.maxHP;
        ship.shield = ship.maxShield;
        ship.isDead = false; // La nave non è più morta

        // Ferma il movimento
        ship.vx = 0;
        ship.vy = 0;

        // Cancella target e combattimento
        if (ship.selectedTarget && ship.selectedTarget.deselect) {
            ship.selectedTarget.deselect();
        }
        ship.selectedTarget = null;
        ship.isInCombat = false;

        // Pulisci proiettili e missili
        ship.projectiles.forEach(projectile => projectile.deactivate());
        ship.projectiles = [];
        ship.missiles.forEach(missile => missile.destroy());
        ship.missiles = [];

        // Reset timer di riparazione
        ship.lastCombatTime = Date.now();

        // Notifica respawn
        if (window.gameInstance && window.gameInstance.notifications) {
            window.gameInstance.notifications.add('🚀 Respawn completato!', 'respawn');
        }
    }

    draw(ctx) {
        if (!this.isVisible) return;

        // Sfondo semi-trasparente
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

        // Popup centrale
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const popupWidth = 400;
        const popupHeight = 200;

        // Sfondo del popup
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(centerX - popupWidth/2, centerY - popupHeight/2, popupWidth, popupHeight);

        // Bordo del popup
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 3;
        ctx.strokeRect(centerX - popupWidth/2, centerY - popupHeight/2, popupWidth, popupHeight);

        // Testo principale
        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SEI MORTO!', centerX, centerY - 40);

        // Testo secondario
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.fillText('La tua nave è stata distrutta', centerX, centerY - 10);
        
        ctx.fillText('Respawn alla stazione spaziale più vicina', centerX, centerY + 15);

        // Pulsante respawn
        const buttonX = centerX - 100;
        const buttonY = centerY + 50;
        const buttonWidth = 200;
        const buttonHeight = 40;

        // Sfondo del pulsante
        ctx.fillStyle = '#000000';
        ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

        // Bordo del pulsante
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 2;
        ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

        // Testo del pulsante
        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 18px Arial';
        ctx.fillText('RESPAWN', centerX, buttonY + 25);

        // Reset allineamento testo
        ctx.textAlign = 'left';
    }
}
