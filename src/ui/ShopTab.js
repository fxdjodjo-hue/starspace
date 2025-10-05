import { UIComponent } from './UIComponent.js';

// Componente tab del negozio
export class ShopTab extends UIComponent {
    constructor(id, name, bounds, color, isSelected = false) {
        super(id, bounds, { name, color, isSelected });
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Ascolta cambiamenti di selezione dal game state
        if (this.gameState) {
            this.gameState.subscribe('shop.selectedCategory', (category) => {
                this.config.isSelected = category === this.id;
            });
        }
    }
    
    draw(ctx) {
        if (!this.visible) return;
        
        const { x, y, width, height } = this.bounds;
        const { name, color, isSelected } = this.config;
        
        // Sfondo tab
        if (isSelected) {
            ctx.fillStyle = 'rgba(40,40,44,0.95)';
            ctx.fillRect(x, y, width, height);
            ctx.strokeStyle = 'rgba(255,255,255,0.18)';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, width, height);
        } else {
            ctx.fillStyle = 'rgba(28,28,32,0.95)';
            ctx.fillRect(x, y, width, height);
            ctx.strokeStyle = 'rgba(255,255,255,0.12)';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, width, height);
        }
        
        // Testo tab
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(name, x + width/2, y + height/2);
        ctx.textAlign = 'left';
    }
    
    onClick(x, y) {
        super.onClick(x, y);
        
        // Emetti evento per cambio tab
        this.emitLocal('shop:tab:click', { 
            tabId: this.id, 
            tabName: this.config.name 
        });
        
        // Emetti evento di rete per sincronizzazione
        this.emitNetwork('shop:tab:change', { 
            tabId: this.id 
        });
        
        // Aggiorna stato locale
        if (this.gameState) {
            this.gameState.updateState('shop.selectedCategory', this.id);
        }
    }
    
    // Aggiorna selezione
    setSelected(selected) {
        this.config.isSelected = selected;
    }
    
    // Aggiorna colore
    setColor(color) {
        this.config.color = color;
    }
}
