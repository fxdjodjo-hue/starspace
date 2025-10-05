export class IconSystemUI {
    constructor(x, y, type, options = {}) {
        this.x = x;
        this.y = y;
        this.type = type; // 'quest', 'stats', 'inventory', 'settings', etc.
        this.size = options.size || 40;
        this.cornerRadius = options.cornerRadius || 8;
        this.visible = options.visible !== false;
        this.text = options.text || '';
        this.subText = options.subText || '';
        this.color = options.color || '#ffffff';
        this.backgroundColor = options.backgroundColor || 'rgba(18,18,20,0.9)';
        this.borderColor = options.borderColor || 'rgba(255,255,255,0.12)';
        this.borderWidth = options.borderWidth || 2;
        this.fontSize = options.fontSize || 20;
        this.subFontSize = options.subFontSize || 12;
        this.showTooltip = false;
        this.tooltipText = '';
        
        // Configurazioni predefinite per tipo
        this.setupByType();
    }
    
    setupByType() {
        switch (this.type) {
            case 'quest':
                this.text = '!';
                this.color = '#ffffff';
                this.tooltipText = 'Quest Tracker';
                break;
            case 'stats':
                this.text = 'S';
                this.color = '#ffffff';
                this.tooltipText = 'Statistics';
                break;
            case 'inventory':
                this.text = 'I';
                this.color = '#ffffff';
                this.tooltipText = 'Inventory';
                break;
            case 'settings':
                this.text = '⚙';
                this.color = '#ffffff';
                this.tooltipText = 'Settings';
                break;
            case 'profile':
                this.text = 'P';
                this.color = '#ffffff';
                this.tooltipText = 'Profile';
                break;
            case 'level':
                this.text = 'L';
                this.subText = '1';
                this.color = '#ffffff';
                this.tooltipText = 'Level';
                break;
            case 'home':
                this.text = 'H';
                this.color = '#ffffff';
                this.tooltipText = 'Home Dashboard';
                break;
        }
    }
    
    draw(ctx) {
        if (!this.visible) return;
        
        // Sfondo dell'icona
        ctx.fillStyle = this.backgroundColor;
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.size, this.size, this.cornerRadius);
        ctx.fill();
        
        // Bordo dell'icona
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = this.borderWidth;
        ctx.stroke();
        
        // Testo principale
        if (this.text) {
            ctx.fillStyle = this.color;
            ctx.font = `bold ${this.fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.text, this.x + this.size/2, this.y + this.size/2);
        }
        
        // Sottotesto (se presente)
        if (this.subText) {
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${this.subFontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(this.subText, this.x + this.size/2, this.y + this.size/2 + 12);
        }
        
        // Tooltip (se mostrato)
        if (this.showTooltip && this.tooltipText) {
            this.drawTooltip(ctx);
        }
    }
    
    drawTooltip(ctx) {
        const padding = 8;
        const fontSize = 12;
        const lineHeight = 16;
        
        // Calcola le dimensioni del tooltip
        ctx.font = `${fontSize}px Arial`;
        const textWidth = ctx.measureText(this.tooltipText).width;
        const tooltipWidth = textWidth + padding * 2;
        const tooltipHeight = lineHeight + padding * 2;
        
        // Posizione del tooltip (sotto l'icona)
        const tooltipX = this.x + this.size / 2 - tooltipWidth / 2;
        const tooltipY = this.y + this.size + 5;
        
        // Sfondo del tooltip
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.beginPath();
        ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 4);
        ctx.fill();
        
        // Bordo del tooltip
        ctx.strokeStyle = 'rgba(255,255,255,0.18)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Testo del tooltip
        ctx.fillStyle = '#ffffff';
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.tooltipText, tooltipX + tooltipWidth / 2, tooltipY + tooltipHeight / 2);
    }
    
    isMouseOver(mouseX, mouseY) {
        return mouseX >= this.x && mouseX <= this.x + this.size &&
               mouseY >= this.y && mouseY <= this.y + this.size;
    }
    
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
    
    setVisible(visible) {
        this.visible = visible;
    }
    
    setText(text, subText = null) {
        this.text = text;
        if (subText !== null) {
            this.subText = subText;
        }
    }
    
    setColor(color) {
        this.color = color;
    }
    
    setBackgroundColor(backgroundColor) {
        this.backgroundColor = backgroundColor;
    }
    
    setBorderColor(borderColor) {
        this.borderColor = borderColor;
    }
    
    setTooltipVisible(visible) {
        this.showTooltip = visible;
    }
    
    setTooltipText(text) {
        this.tooltipText = text;
    }
}
