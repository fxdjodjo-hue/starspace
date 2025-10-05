// InventoryItem - Classe per gli oggetti dell'inventario
export class InventoryItem {
    constructor(id, name, type, quantity = 1, properties = {}) {
        this.id = id;
        this.name = name;
        this.type = type; // 'weapon', 'shield', 'ammo', 'consumable', etc.
        this.quantity = quantity;
        this.properties = properties;
        this.equipped = false;
    }
    
    // Metodi base
    use() {
        if (this.type === 'consumable' && this.quantity > 0) {
            this.quantity--;
            return true;
        }
        return false;
    }
    
    equip() {
        this.equipped = true;
    }
    
    unequip() {
        this.equipped = false;
    }
    
    // Serializzazione per salvataggio
    serialize() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            quantity: this.quantity,
            properties: this.properties,
            equipped: this.equipped
        };
    }
    
    // Deserializzazione da salvataggio
    static deserialize(data) {
        const item = new InventoryItem(data.id, data.name, data.type, data.quantity, data.properties);
        item.equipped = data.equipped || false;
        return item;
    }
}
