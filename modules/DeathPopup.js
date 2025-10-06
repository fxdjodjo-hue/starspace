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

    handleClick(x, y, ship, canvasWidth, canvasHeight) {
        if (!this.isVisible) return false;

        // Controlla se il click è sul pulsante respawn
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
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
        const game = window.gameInstance;
        const factionId = (game?.factionSystem?.currentFaction) || ship.faction || 'venus';
        const startByFaction = { venus: 'v1', mars: 'm1', eic: 'e1' };
        const homeMap = startByFaction[factionId] || 'v1';

        // Cambia sempre mappa alla x1 di fazione (space station)
        if (game && game.mapManager) {
            const mm = game.mapManager;
            if (mm.currentMap !== homeMap) {
                mm.changeMap(homeMap, ship);
                // Se per qualche motivo non è cambiata, forza il cambio
                if (mm.currentMap !== homeMap) {
                    mm.currentMap = homeMap;
                    mm.createPortalsForCurrentMap();
                    mm.loadCurrentMapInstance();
                }
            }
        }

        // Posiziona presso la stazione spaziale (se presente), altrimenti centro mappa
        if (game && game.spaceStation) {
            ship.x = game.spaceStation.x + 120;
            ship.y = game.spaceStation.y;
        }

        // Ripristina HP e scudo: respawn al minimo (per poi riparare)
        const minimalHp = Math.max(1, Math.floor(ship.maxHP * 0.05));
        ship.hp = minimalHp;
        ship.shield = 0;
        ship.isDead = false; // La nave non è più morta

        // Ferma il movimento
        ship.vx = 0;
        ship.vy = 0;
        ship.isMoving = false;
        ship.targetX = ship.x;
        ship.targetY = ship.y;

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
        if (game && game.notifications) {
            game.notifications.add('🚀 Respawn alla stazione di fazione', 'respawn');
        }

        // Salva immediatamente la nuova mappa/posizione per coerenza con i login successivi
        if (game && game.saveSystem && typeof game.saveSystem.save === 'function') {
            try {
                const slotKey = game.currentAccountId || 'main';
                game.saveSystem.save(slotKey);
            } catch (_) {}
        }
    }

    draw(ctx, canvasWidth, canvasHeight) {
        if (!this.isVisible) return;

        // Sfondo semi-trasparente
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Popup centrale
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
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
