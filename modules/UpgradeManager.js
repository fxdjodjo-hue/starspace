// Modulo UpgradeManager per gestire i potenziamenti della nave
export class UpgradeManager {
    constructor() {
        // Valute attuali
        this.credits = 1000; // Crediti di test per verificare il sistema
        this.uridium = 0;
        
        // Livelli attuali delle statistiche
        this.damageLevel = 1;
        this.speedLevel = 1;
        this.hpLevel = 1;
        this.shieldLevel = 1;
        
        // Configurazione degli upgrade
        this.upgrades = {
            damage: {
                name: 'Danno',
                baseValue: 20,
                levels: [
                    { level: 1, value: 20, cost: 0, description: 'Base' },
                    { level: 2, value: 35, cost: 50, description: '+15 danno' },
                    { level: 3, value: 50, cost: 100, description: '+30 danno' },
                    { level: 4, value: 70, cost: 200, description: '+50 danno' },
                    { level: 5, value: 70, cost: 400, description: '+50 danno' },
                    { level: 6, value: 85, cost: 800, description: '+65 danno' },
                    { level: 7, value: 100, cost: 1600, description: '+80 danno' },
                    { level: 8, value: 115, cost: 3200, description: '+95 danno' },
                    { level: 9, value: 130, cost: 6400, description: '+110 danno' },
                    { level: 10, value: 145, cost: 12800, description: '+125 danno' }
                ]
            },
            speed: {
                name: 'Velocità Nave',
                baseValue: 2,
                levels: [
                    { level: 1, value: 2, cost: 0, description: 'Base' },
                    { level: 2, value: 3, cost: 75, description: '+1 velocità' },
                    { level: 3, value: 4, cost: 150, description: '+2 velocità' },
                    { level: 4, value: 5, cost: 300, description: '+3 velocità' },
                    { level: 5, value: 5, cost: 600, description: '+3 velocità' },
                    { level: 6, value: 6, cost: 1200, description: '+4 velocità' },
                    { level: 7, value: 7, cost: 2400, description: '+5 velocità' },
                    { level: 8, value: 8, cost: 4800, description: '+6 velocità' },
                    { level: 9, value: 9, cost: 9600, description: '+7 velocità' },
                    { level: 10, value: 10, cost: 19200, description: '+8 velocità' }
                ]
            },
            hp: {
                name: 'HP',
                baseValue: 50,
                levels: [
                    { level: 1, value: 50, cost: 0, description: 'Base' },
                    { level: 2, value: 75, cost: 60, description: '+25 HP' },
                    { level: 3, value: 100, cost: 120, description: '+50 HP' },
                    { level: 4, value: 125, cost: 240, description: '+75 HP' },
                    { level: 5, value: 120, cost: 480, description: '+70 HP' },
                    { level: 6, value: 140, cost: 960, description: '+90 HP' },
                    { level: 7, value: 160, cost: 1920, description: '+110 HP' },
                    { level: 8, value: 180, cost: 3840, description: '+130 HP' },
                    { level: 9, value: 200, cost: 7680, description: '+150 HP' },
                    { level: 10, value: 220, cost: 15360, description: '+170 HP' }
                ]
            },
            shield: {
                name: 'Scudo',
                baseValue: 30,
                levels: [
                    { level: 1, value: 30, cost: 0, description: 'Base' },
                    { level: 2, value: 45, cost: 80, description: '+15 Scudo' },
                    { level: 3, value: 60, cost: 160, description: '+30 Scudo' },
                    { level: 4, value: 75, cost: 320, description: '+45 Scudo' },
                    { level: 5, value: 90, cost: 640, description: '+60 Scudo' },
                    { level: 6, value: 105, cost: 1280, description: '+75 Scudo' },
                    { level: 7, value: 120, cost: 2560, description: '+90 Scudo' },
                    { level: 8, value: 135, cost: 5120, description: '+105 Scudo' },
                    { level: 9, value: 150, cost: 10240, description: '+120 Scudo' },
                    { level: 10, value: 165, cost: 20480, description: '+135 Scudo' }
                ]
            }
        };
    }
    
    // Aggiungi crediti
    addCredits(amount) {
        this.credits += amount;
    }
    
    // Ottieni crediti attuali
    getCredits() {
        return this.credits;
    }
    
    // Aggiungi uridium
    addUridium(amount) {
        this.uridium += amount;
    }
    
    // Ottieni uridium attuale
    getUridium() {
        return this.uridium;
    }
    
    // Ottieni livello attuale di una statistica
    getLevel(statType) {
        switch(statType) {
            case 'damage': return this.damageLevel;
            case 'speed': return this.speedLevel;
            case 'hp': return this.hpLevel;
            case 'shield': return this.shieldLevel;
            default: return 1;
        }
    }
    
    // Ottieni valore attuale di una statistica
    getValue(statType) {
        const upgrade = this.upgrades[statType];
        if (!upgrade) return 0;
        
        const currentLevel = this.getLevel(statType);
        const levelData = upgrade.levels.find(l => l.level === currentLevel);
        return levelData ? levelData.value : upgrade.baseValue;
    }
    
    // Ottieni informazioni per l'upgrade di una statistica
    getUpgradeInfo(statType) {
        const upgrade = this.upgrades[statType];
        if (!upgrade) return null;
        
        const currentLevel = this.getLevel(statType);
        const nextLevel = upgrade.levels.find(l => l.level === currentLevel + 1);
        
        if (!nextLevel) return null; // Livello massimo raggiunto
        
        return {
            currentLevel: currentLevel,
            currentValue: this.getValue(statType),
            nextLevel: nextLevel.level,
            nextValue: nextLevel.value,
            cost: nextLevel.cost,
            description: nextLevel.description,
            canAfford: this.credits >= nextLevel.cost
        };
    }
    
    // Prova a fare un upgrade
    tryUpgrade(statType) {
        const upgradeInfo = this.getUpgradeInfo(statType);
        if (!upgradeInfo || !upgradeInfo.canAfford) return false;
        
        // Deduci i crediti
        this.credits -= upgradeInfo.cost;
        
        // Aumenta il livello
        switch(statType) {
            case 'damage':
                this.damageLevel = upgradeInfo.nextLevel;
                break;
            case 'speed':
                this.speedLevel = upgradeInfo.nextLevel;
                break;
            case 'hp':
                this.hpLevel = upgradeInfo.nextLevel;
                break;
            case 'shield':
                this.shieldLevel = upgradeInfo.nextLevel;
                break;
        }
        
        return true;
    }
    
    // Ottieni tutte le informazioni per l'UI
    getUIInfo() {
        return {
            credits: this.credits,
            uridium: this.uridium,
            damage: {
                name: this.upgrades.damage.name,
                level: this.damageLevel,
                value: this.getValue('damage'),
                upgradeInfo: this.getUpgradeInfo('damage')
            },
            speed: {
                name: this.upgrades.speed.name,
                level: this.speedLevel,
                value: this.getValue('speed'),
                upgradeInfo: this.getUpgradeInfo('speed')
            },
            hp: {
                name: this.upgrades.hp.name,
                level: this.hpLevel,
                value: this.getValue('hp'),
                upgradeInfo: this.getUpgradeInfo('hp')
            }
        };
    }
}
