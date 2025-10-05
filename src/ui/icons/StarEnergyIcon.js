import { UIIcon } from '../UIIcon.js';

export class StarEnergyIcon extends UIIcon {
    constructor(game) {
        super(game, {
            id: 'starenergy',
            icon: '⚡',
            tooltip: 'Star Energy',
            position: { x: 10, y: 200 } // Posizione provvisoria, da sistemare
        });
    }

    // Override del metodo click per aprire il pannello StarEnergy
    onClick() {
        if (this.game.starEnergyPanel) {
            this.game.starEnergyPanel.toggle();
        }
    }

    // Aggiorna il contatore di Star Energy nell'icona
    update() {
        super.update();
        
        if (this.game.ship) {
            const starEnergyInfo = this.game.ship.getStarEnergyInfo();
            this.setBadge(Math.floor(starEnergyInfo.current));
        }
    }
}
