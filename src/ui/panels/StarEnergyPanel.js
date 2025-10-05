import { UIPanel } from '../UIPanel.js';
import { ThemeConfig, ThemeUtils } from '../../config/ThemeConfig.js';

export class StarEnergyPanel extends UIPanel {
    constructor(game) {
        super(game);
        
        this.conversionHistory = [];
        this.lastConversionResult = null;
        this.historyScrollOffset = 0;
        this.maxHistoryLength = 50;
    }

    draw(ctx) {
        if (!this.visible) return;

        const starEnergyInfo = this.game.ship.getStarEnergyInfo();
        
        // Pannello principale centrale - più largo e alto
        const centerX = this.x + this.width / 2 - 300;
        const centerY = this.y + 30;
        const panelWidth = 600;
        const panelHeight = 600;

        // Sfondo pannello principale
        ThemeUtils.drawPanel(ctx, centerX, centerY, panelWidth, panelHeight, {
            background: 'rgba(18,18,20,0.94)',
            border: 'rgba(255,255,255,0.12)',
            blur: false,
            shadow: false,
            radius: 8
        });

        // Titolo
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('STAR ENERGY', centerX + panelWidth/2, centerY + 40);

        // Energia disponibile con effetto glow
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#4a90e2';
        ctx.shadowBlur = 15;
        ctx.font = 'bold 72px Arial';
        ctx.fillText(`${Math.floor(starEnergyInfo.current)}`, centerX + panelWidth/2, centerY + 120);
        ctx.shadowBlur = 0;

        // Bottone di conversione
        const buttonX = centerX + panelWidth/2 - 150;
        const buttonY = centerY + 180;
        const buttonWidth = 300;
        const buttonHeight = 50;

        // Sfondo bottone con gradiente
        const buttonGradient = ctx.createLinearGradient(buttonX, buttonY, buttonX, buttonY + buttonHeight);
        buttonGradient.addColorStop(0, '#1a3f5c');
        buttonGradient.addColorStop(1, '#2a4f6c');
        ctx.fillStyle = buttonGradient;
        ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

        // Bordo bottone con glow
        ctx.strokeStyle = '#4a90e2';
        ctx.shadowColor = '#4a90e2';
        ctx.shadowBlur = 5;
        ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
        ctx.shadowBlur = 0;

        // Testo bottone
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('CONVERT (1 ENERGY)', centerX + panelWidth/2, buttonY + 32);

        // Info conversione
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '14px Arial';
        ctx.fillText('Convert to ammo (missiles or laser)', centerX + panelWidth/2, buttonY + 60);

        // Mostra risultato ultima conversione
        if (this.lastConversionResult) {
            ctx.fillStyle = '#00ff00';
            ctx.shadowColor = '#00ff00';
            ctx.shadowBlur = 10;
            ctx.font = 'bold 18px Arial';
            ctx.fillText(this.lastConversionResult, centerX + panelWidth/2, buttonY + 100);
            ctx.shadowBlur = 0;
        }

        // Sezione cronologia
        const historyY = buttonY + 140;
        ctx.fillStyle = '#4a90e2';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('CONVERSION HISTORY', centerX + panelWidth/2, historyY);

        // Area di clip per la cronologia
        ctx.save();
        ctx.beginPath();
        ctx.rect(centerX + 20, historyY + 20, panelWidth - 40, 280);
        ctx.clip();

        // Lista risultati precedenti
        ctx.font = '14px Arial';
        this.conversionHistory.forEach((entry, index) => {
            if (index === 0) return;
            const timeAgo = Math.floor((Date.now() - entry.timestamp) / 1000);
            const timeStr = timeAgo < 60 ? `${timeAgo}s ago` : `${Math.floor(timeAgo/60)}m ago`;
            
            const y = historyY + 30 + (index * 25) - this.historyScrollOffset;
            if (y > historyY + 20 && y < historyY + 300) {
                ctx.fillStyle = '#aaaaaa';
                ctx.fillText(timeStr, centerX + 20, y);
                
                ctx.fillStyle = '#00ff00';
                ctx.fillText(entry.result, centerX + 100, y);
            }
        });
        ctx.restore();
    }

    handleClick(x, y) {
        if (!this.visible) return false;

        // Coordinate del bottone
        const centerX = this.x + this.width / 2 - 300;
        const centerY = this.y + 30;
        const panelWidth = 600;
        const buttonX = centerX + panelWidth/2 - 150;
        const buttonY = centerY + 180;
        const buttonWidth = 300;
        const buttonHeight = 50;

        // Controlla se il click è sul bottone con un piccolo padding
        const padding = 2;
        if (x >= buttonX - padding && 
            x <= buttonX + buttonWidth + padding &&
            y >= buttonY - padding && 
            y <= buttonY + buttonHeight + padding) {
            this.useStarEnergy();
            return true;
        }

        return false;
    }

    useStarEnergy() {
        if (!this.game.ship) return;

        // Tenta di usare 1 Star Energy
        if (this.game.ship.useStarEnergy(1)) {
            // Genera un tipo casuale di munizioni
            const types = ['x1', 'x2', 'x3', 'r1', 'r2', 'r3'];
            const randomType = types[Math.floor(Math.random() * types.length)];
            
            // Quantità casuale tra 5 e 15
            const amount = Math.floor(Math.random() * 11) + 5;
            
            // Aggiungi le munizioni
            if (randomType.startsWith('x')) {
                this.game.ship.addAmmunition('laser', randomType, amount);
            } else {
                this.game.ship.addAmmunition('missile', randomType, amount);
            }
            
            // Aggiorna la cronologia
            const result = `+ ${amount} ${randomType} ammo`;
            this.lastConversionResult = result;
            this.conversionHistory.unshift({
                timestamp: Date.now(),
                result: result
            });
            
            // Limita la lunghezza della cronologia
            if (this.conversionHistory.length > this.maxHistoryLength) {
                this.conversionHistory.pop();
            }
            
            // Notifica
            if (this.game.notifications) {
                this.game.notifications.add(`🎯 Hai ottenuto ${amount} munizioni ${randomType.toUpperCase()}!`, "reward");
            }
        }
    }
}
