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
        
        // Il logout è ora gestito dalla HomePanel
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
    }
    
    // Aggiorna tutte le icone
    update() {
        this.icons.forEach(icon => icon.update());
    }
    
    // Gestisce i click su tutte le icone
    handleClick(x, y) {
        // Controlla le icone in ordine inverso (ultima in cima)
        for (let i = this.icons.length - 1; i >= 0; i--) {
            if (this.icons[i].handleClick(x, y)) {
                return true; // Click gestito
            }
        }
        return false; // Nessun click gestito
    }
    
    // Configurazione predefinita per icone comuni
    static getDefaultConfigs() {
        return {
            quest: {
                type: 'quest',
                icon: '⭐',
                tooltipText: 'Quest Tracker',
                showCount: false
            },
            profile: {
                type: 'profile',
                icon: '🚀',
                tooltipText: 'Ship',
                showCount: false
            },
            inventory: {
                type: 'inventory',
                icon: '📦',
                tooltipText: 'Inventory',
                showCount: false
            },
            settings: {
                type: 'settings',
                icon: '⚙️',
                tooltipText: 'Settings',
                showCount: false
            },
            home: {
                type: 'home',
                icon: '🏠',
                tooltipText: 'Home Dashboard',
                showCount: false
            }
        };
    }
}
