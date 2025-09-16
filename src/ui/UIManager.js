// UIManager - Gestisce tutte le icone UI in modo unificato
import { UIIcon } from './UIIcon.js';

export class UIManager {
    constructor(game) {
        this.game = game;
        this.icons = [];
        this.iconSpacing = 10;
        this.startX = 20;
        this.startY = 20;
        this.iconSize = 50;
        
        // Pulsante di logout (sempre visibile quando loggato)
        this.logoutButton = null;
    }
    
    // Registra una nuova icona
    registerIcon(config) {
        // Calcola posizione automatica se non specificata
        if (!config.position) {
            const index = this.icons.length;
            config.position = {
                x: this.startX + (this.iconSize + this.iconSpacing) * index,
                y: this.startY
            };
        }
        
        // Crea l'icona
        const icon = new UIIcon(this.game, config);
        this.icons.push(icon);
        
        console.log(`✅ Icona registrata: ${config.type}`, config);
        return icon;
    }
    
    // Rimuove un'icona
    removeIcon(type) {
        this.icons = this.icons.filter(icon => icon.type !== type);
    }
    
    // Ottiene un'icona per tipo
    getIcon(type) {
        return this.icons.find(icon => icon.type === type);
    }
    
    // Aggiorna tutte le icone
    update() {
        this.icons.forEach(icon => icon.update());
    }
    
    // Gestisce il mouse move per i tooltip
    handleMouseMove(x, y) {
        this.icons.forEach(icon => icon.handleMouseMove(x, y));
    }
    
    
    // Controlla se il mouse è sopra una qualsiasi icona
    isMouseOverAnyIcon(x, y) {
        return this.icons.some(icon => icon.isMouseOver(x, y));
    }
    
    // Disegna tutte le icone
    draw(ctx) {
        this.icons.forEach(icon => icon.draw(ctx));
        
        // Disegna il pulsante di logout se l'utente è loggato
        if (this.logoutButton && this.game.authSystem && this.game.authSystem.isLoggedIn) {
            this.logoutButton.draw(ctx);
        }
    }
    
    // Aggiorna il pulsante di logout
    update() {
        this.icons.forEach(icon => icon.update());
        
        if (this.logoutButton && this.game.authSystem && this.game.authSystem.isLoggedIn) {
            this.logoutButton.update();
        }
    }
    
    // Gestisce i click su tutte le icone e il pulsante di logout
    handleClick(x, y) {
        // Prima controlla il pulsante di logout (priorità massima)
        if (this.logoutButton && this.game.authSystem && this.game.authSystem.isLoggedIn) {
            if (this.logoutButton.handleClick(x, y)) {
                return true;
            }
        }
        
        // Poi controlla le icone in ordine inverso (ultima in cima)
        for (let i = this.icons.length - 1; i >= 0; i--) {
            if (this.icons[i].handleClick(x, y)) {
                return true; // Click gestito
            }
        }
        return false; // Nessun click gestito
    }
    
    // Imposta il pulsante di logout
    setLogoutButton(logoutButton) {
        this.logoutButton = logoutButton;
        console.log('🔓 UIManager - LogoutButton registrato');
    }
    
    // Configurazione predefinita per icone comuni
    static getDefaultConfigs() {
        return {
            quest: {
                type: 'quest',
                icon: '📋',
                tooltipText: 'Quest Tracker',
                showCount: true,
                updateCount: function() {
                    // Quest attive dal QuestTracker
                    if (this.game && this.game.questTracker && this.game.questTracker.activeQuests) {
                        return this.game.questTracker.activeQuests.length;
                    }
                    return 0;
                }
            },
            profile: {
                type: 'profile',
                icon: 'S',
                tooltipText: 'Ship',
                showCount: false
            },
            inventory: {
                type: 'inventory',
                icon: 'I',
                tooltipText: 'Inventory',
                showCount: true,
                updateCount: function() {
                    // Items nell'inventario
                    if (this.game && this.game.inventory && this.game.inventory.items) {
                        return this.game.inventory.items.length;
                    }
                    return 0;
                }
            },
            settings: {
                type: 'settings',
                icon: '⚙',
                tooltipText: 'Settings',
                showCount: false
            },
            home: {
                type: 'home',
                icon: 'H',
                tooltipText: 'Home Dashboard',
                showCount: false
            }
        };
    }
}
