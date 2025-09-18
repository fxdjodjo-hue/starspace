import { ThemeConfig, ThemeUtils } from '../config/ThemeConfig.js';

// UIIcon - Sistema unificato per icone UI basato sul QuestTracker
export class UIIcon {
    constructor(game, config) {
        this.game = game;
        this.config = config;
        
        // Configurazione base
        this.type = config.type;
        this.panel = config.panel;
        this.icon = config.icon || '?';
        this.showCount = config.showCount || false;
        this.count = config.count || 0;
        this.position = config.position || { x: 20, y: 20 };
        this.size = config.size || 50;
        
        // Stato
        this.visible = true;
        this.isActive = false; // Se il pannello associato è aperto
        this.showTooltip = false;
        this.tooltipText = config.tooltipText || this.type;
        
        // Stile (basato sul QuestTracker)
        this.backgroundColor = '#1a1a2e';
        this.borderColor = '#4a90e2';
        this.activeBorderColor = '#00ff00';
        this.textColor = '#ffffff';
        this.countColor = '#00ff00';
        this.inactiveCountColor = '#888888';
        
        // Posizione
        this.x = this.position.x;
        this.y = this.position.y;
        this.width = this.size;
        this.height = this.size;
    }
    
    // Aggiorna lo stato dell'icona
    update() {
        // Controlla se il pannello associato è aperto
        this.isActive = this.isPanelOpen();
        
        // Aggiorna il conteggio se necessario
        if (this.showCount && this.config.updateCount) {
            // Chiama la funzione con il contesto corretto
            this.count = this.config.updateCount.call(this);
        }
    }
    
    // Controlla se il pannello associato è aperto
    isPanelOpen() {
        if (!this.panel) return false;
        
        // Controlla diverse proprietà comuni per i pannelli
        if (this.panel.isOpen !== undefined) return this.panel.isOpen;
        if (this.panel.visible !== undefined) return this.panel.visible;
        if (this.panel.minimized !== undefined) return !this.panel.minimized;
        
        return false;
    }
    
    // Gestisce il click sull'icona
    handleClick(x, y) {
        if (!this.visible || !this.isMouseOver(x, y)) {
            return false;
        }
        
        console.log(`🖱️ Click su icona ${this.type}`);
        
        // Toggle del pannello associato
        if (this.panel) {
            if (this.panel.toggle) {
                // Usa sempre toggle se disponibile
                this.panel.toggle();
            } else if (this.panel.open) {
                if (this.isPanelOpen()) {
                    this.panel.close();
                } else {
                    this.panel.open();
                }
            }
        }
        
        return true;
    }
    
    // Controlla se il mouse è sopra l'icona
    isMouseOver(x, y) {
        return x >= this.x && x <= this.x + this.width && 
               y >= this.y && y <= this.y + this.height;
    }
    
    // Gestisce il mouse move per i tooltip
    handleMouseMove(x, y) {
        this.showTooltip = this.isMouseOver(x, y);
    }
    
    // Disegna l'icona
    draw(ctx) {
        if (!this.visible) return;
        
        // Pannello icona con tema moderno
        ThemeUtils.drawPanel(ctx, this.x, this.y, this.width, this.height, {
            background: ThemeConfig.colors.background.secondary,
            border: this.isActive ? ThemeConfig.colors.accent.success : ThemeConfig.colors.border.primary,
            blur: false,
            shadow: true
        });
        
        // Icona principale
        this.drawIcon(ctx);
        
        // Contatore se necessario
        if (this.showCount) {
            this.drawCount(ctx);
        }
        
        // Tooltip se necessario
        if (this.showTooltip) {
            this.drawTooltip(ctx);
        }
    }
    
    // Disegna l'icona principale
    drawIcon(ctx) {
        ThemeUtils.drawText(ctx, this.icon, this.x + this.width/2, this.y + this.height/2, {
            size: 20,
            weight: 'bold',
            color: ThemeConfig.colors.text.primary,
            glow: this.isActive,
            align: 'center'
        });
    }
    
    // Disegna il contatore
    drawCount(ctx) {
        const countText = this.count.toString();
        const countColor = this.count > 0 ? ThemeConfig.colors.accent.success : ThemeConfig.colors.text.disabled;
        
        ThemeUtils.drawText(ctx, countText, this.x + this.width - 8, this.y + 12, {
            size: 10,
            weight: 'bold',
            color: countColor,
            glow: this.count > 0,
            align: 'center'
        });
    }
    
    // Disegna il tooltip
    drawTooltip(ctx) {
        const padding = 8;
        const fontSize = 12;
        const lineHeight = 16;
        
        ctx.font = `${fontSize}px Arial`;
        const textWidth = ctx.measureText(this.tooltipText).width;
        const tooltipWidth = textWidth + padding * 2;
        const tooltipHeight = lineHeight + padding * 2;
        
        // Posizione tooltip (sotto l'icona)
        const tooltipX = this.x + (this.width - tooltipWidth) / 2;
        const tooltipY = this.y + this.height + 5;
        
        // Pannello tooltip con tema moderno
        ThemeUtils.drawPanel(ctx, tooltipX, tooltipY, tooltipWidth, tooltipHeight, {
            background: ThemeConfig.colors.background.panel,
            border: ThemeConfig.colors.border.primary,
            blur: true,
            shadow: true
        });
        
        // Testo tooltip con tema moderno
        ThemeUtils.drawText(ctx, this.tooltipText, tooltipX + tooltipWidth / 2, tooltipY + tooltipHeight / 2, {
            size: fontSize,
            weight: 'normal',
            color: ThemeConfig.colors.text.primary,
            glow: true,
            align: 'center'
        });
    }
    
    // Imposta la posizione
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.position.x = x;
        this.position.y = y;
    }
    
    // Imposta il conteggio
    setCount(count) {
        this.count = count;
    }
    
    // Imposta la visibilità
    setVisible(visible) {
        this.visible = visible;
    }
}