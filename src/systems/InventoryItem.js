// Classe per gli oggetti dell'inventario
export class InventoryItem {
    constructor(name, type, stats = {}) {
        this.name = name;
        this.type = type; // 'laser', 'shield', 'generator', 'extra'
        this.stats = stats;
        this.id = this.generateId();
    }
    
    generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }
    
    // Crea oggetti di esempio
    static createExampleItems() {
        return [
            // Laser
            new InventoryItem('LF1', 'laser', { damage: 65, fireRate: 1.0 }),
            new InventoryItem('LF2', 'laser', { damage: 200, fireRate: 1.0 }),
            new InventoryItem('LF3', 'laser', { damage: 300, fireRate: 1.0 }),
            
            // Scudi
            new InventoryItem('SH1', 'shield', { protection: 1000, regeneration: 1.0 }),
            new InventoryItem('SH2', 'shield', { protection: 2000, regeneration: 1.0 }),
            new InventoryItem('SH3', 'shield', { protection: 3000, regeneration: 1.0 }),
            
            // Generatori
            new InventoryItem('GEN1', 'generator', { speed: 100, energy: 100 }),
            new InventoryItem('GEN2', 'generator', { speed: 150, energy: 150 }),
            new InventoryItem('GEN3', 'generator', { speed: 200, energy: 200 }),
            
            // Extra
            new InventoryItem('E1', 'extra', { ability: 'Smart Bomb', cooldown: 30 }),
            new InventoryItem('E2', 'extra', { ability: 'EMP', cooldown: 45 }),
            new InventoryItem('E3', 'extra', { ability: 'Repair', cooldown: 20 })
        ];
    }
}
