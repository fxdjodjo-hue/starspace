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
        
        // Sistema di animazione avanzato
        this.hoverScale = 1.0;
        this.targetScale = 1.0;
        this.currentScale = 1.0;
        this.currentY = this.y;
        this.targetY = this.y;
        this.hoverGlow = 0;
        this.targetGlow = 0;
        this.lastFrameTime = performance.now();
        
        // Configurazione animazioni
        this.hoverConfig = {
            scale: 1.1,      // Scala massima in hover
            lift: -3,        // Movimento verso l'alto in hover (pixel)
            glow: 0.15,      // Intensità massima del glow
            speed: 8         // Velocità dell'animazione (più alto = più veloce)
        };
        
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

    // Aggiorna animazioni
    updateAnimations(now) {
        const dt = (now - this.lastFrameTime) / 1000;
        this.lastFrameTime = now;
        
        // Determina lo stato di hover
        const isHovered = this.isMouseOver(this.game.input.mouse.x, this.game.input.mouse.y);
        
        // Aggiorna i target in base all'hover
        this.targetScale = isHovered ? this.hoverConfig.scale : 1.0;
        this.targetY = this.y + (isHovered ? this.hoverConfig.lift : 0);
        this.targetGlow = isHovered ? this.hoverConfig.glow : 0;
        
        // Applica easing per animazioni fluide
        const speed = this.hoverConfig.speed;
        this.currentScale += (this.targetScale - this.currentScale) * Math.min(1, dt * speed);
        this.currentY += (this.targetY - this.currentY) * Math.min(1, dt * speed);
        this.hoverGlow += (this.targetGlow - this.hoverGlow) * Math.min(1, dt * speed);
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
        
        // Aggiorna animazioni
        this.updateAnimations(performance.now());
        
        // Applica scala
        ctx.save();
        const centerX = this.x + this.width/2;
        const centerY = this.y + this.height/2;
        ctx.translate(centerX, centerY);
        ctx.scale(this.currentScale, this.currentScale);
        ctx.translate(-centerX, -centerY);
        
        // Effetto glow in hover
        if (this.hoverGlow > 0) {
            ctx.shadowColor = 'rgba(255,255,255,0.5)';
            ctx.shadowBlur = 10 * this.hoverGlow;
        }
        
        // Solo bordo neutro (senza sfondo)
        ctx.strokeStyle = this.isActive ? 'rgba(255,255,255,0.18)' : `rgba(255,255,255,${0.12 + this.hoverGlow})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.currentY, this.width, this.height);
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        
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

        ctx.restore();
    }
    
    // Disegna l'icona principale
    drawIcon(ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, this.x + this.width/2, this.y + this.height/2);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    }
    
    // Disegna il contatore
    drawCount(ctx) {
        const countText = this.count.toString();
        const countColor = this.count > 0 ? '#ffffff' : '#888888';
        
        ThemeUtils.drawText(ctx, countText, this.x + this.width - 8, this.y + 12, {
            size: 10,
            weight: 'bold',
            color: countColor,
            glow: false,
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
        
        // Pannello tooltip neutro
        ThemeUtils.drawPanel(ctx, tooltipX, tooltipY, tooltipWidth, tooltipHeight, {
            background: 'rgba(28,28,32,0.95)',
            border: 'rgba(255,255,255,0.12)',
            blur: false,
            shadow: false
        });
        
        // Testo tooltip con tema moderno
        ThemeUtils.drawText(ctx, this.tooltipText, tooltipX + tooltipWidth / 2, tooltipY + tooltipHeight / 2, {
            size: fontSize,
            weight: 'normal',
            color: '#ffffff',
            glow: false,
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