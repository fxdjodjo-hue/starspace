import { UIComponent } from './UIComponent.js';

// Componente pulsante del negozio
export class ShopButton extends UIComponent {
    constructor(id, text, bounds, config = {}) {
        super(id, bounds, {
            text,
            enabled: true,
            color: '#4CAF50',
            disabledColor: '#666666',
            textColor: '#ffffff',
            ...config
        });
    }
    
    draw(ctx) {
        if (!this.visible) return;
        
        const { x, y, width, height } = this.bounds;
        const { text, enabled } = this.config;
        
        // Sfondo pulsante (neutro)
        ctx.fillStyle = enabled ? 'rgba(40,40,44,0.95)' : 'rgba(28,28,32,0.7)';
        ctx.fillRect(x, y, width, height);
        
        // Bordo neutro
        ctx.strokeStyle = enabled ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
        
        // Testo
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x + width/2, y + height/2);
        ctx.textAlign = 'left';
    }
    
    onClick(x, y) {
        if (!super.onClick(x, y) || !this.config.enabled) {
            return false;
        }
        
        // Emetti evento per click del pulsante
        this.emitLocal('shop:button:click', { 
            buttonId: this.id, 
            buttonText: this.config.text 
        });
        
        // Emetti evento di rete per sincronizzazione
        this.emitNetwork('shop:button:action', { 
            buttonId: this.id 
        });
        
        return true;
    }
    
    // Abilita/disabilita pulsante
    setEnabled(enabled) {
        this.config.enabled = enabled;
        super.setEnabled(enabled);
    }
    
    // Aggiorna testo
    setText(text) {
        this.config.text = text;
    }
    
    // Aggiorna colori
    setColors(color, disabledColor) {
        this.config.color = color;
        this.config.disabledColor = disabledColor;
    }
}
