/**
 * Sistema di gestione dei droni UAV
 * Gestisce la creazione, aggiornamento e controllo dei droni
 */
import { Drone } from '../entities/Drone.js';

export class DroneManager {
    constructor(game) {
        console.log('🚁 DroneManager constructor chiamato con game:', game);
        this.game = game;
        this.drones = [];
        this.maxDrones = 8;
        
        // Formazioni predefinite
        this.formations = {
            follow: this.createFollowFormation(),
            attack: this.createAttackFormation(),
            defend: this.createDefendFormation(),
            patrol: this.createPatrolFormation()
        };
        
        this.currentFormation = 'follow';
        
        // Carica droni esistenti dall'inventario
        this.loadDronesFromInventory();
        console.log('🚁 DroneManager inizializzato con successo!');
    }
    
    // Crea formazione di follow
    createFollowFormation() {
        // Formazione a cerchio con 8 posizioni ben distinte e precise
        const radius = 150; // Raggio del cerchio aumentato per maggiore separazione
        const positions = [];
        
        for (let i = 0; i < 8; i++) {
            // Calcolo preciso dell'angolo (45 gradi esatti per drone)
            const angle = (i * 45) * (Math.PI / 180);
            const x = Math.round(Math.cos(angle) * radius * 100) / 100; // Arrotondamento per precisione
            const y = Math.round(Math.sin(angle) * radius * 100) / 100;
            const droneAngle = (angle * 180 / Math.PI) + 90; // Angolo del drone
            
            positions.push({
                x: x,
                y: y,
                angle: droneAngle
            });
        }
        
        return positions;
    }
    
    // Crea formazione di attacco
    createAttackFormation() {
        // Formazione a cerchio più compatta per l'attacco
        const radius = 80; // Raggio più piccolo per attacco
        const positions = [];
        
        for (let i = 0; i < 8; i++) {
            const angle = (i * 360 / 8) * (Math.PI / 180);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const droneAngle = (angle * 180 / Math.PI) + 90;
            
            positions.push({
                x: x,
                y: y,
                angle: droneAngle
            });
        }
        
        return positions;
    }
    
    // Crea formazione di difesa
    createDefendFormation() {
        // Formazione a cerchio più ampia per la difesa
        const radius = 150; // Raggio più grande per difesa
        const positions = [];
        
        for (let i = 0; i < 8; i++) {
            const angle = (i * 360 / 8) * (Math.PI / 180);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const droneAngle = (angle * 180 / Math.PI) + 90;
            
            positions.push({
                x: x,
                y: y,
                angle: droneAngle
            });
        }
        
        return positions;
    }
    
    // Crea formazione di pattugliamento
    createPatrolFormation() {
        // Formazione a cerchio molto ampia per pattugliamento
        const radius = 200; // Raggio molto grande per pattugliamento
        const positions = [];
        
        for (let i = 0; i < 8; i++) {
            const angle = (i * 360 / 8) * (Math.PI / 180);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const droneAngle = (angle * 180 / Math.PI) + 90;
            
            positions.push({
                x: x,
                y: y,
                angle: droneAngle
            });
        }
        
        return positions;
    }
    
    // Aggiungi drone
    addDrone(droneData) {
        console.log('🚁 DroneManager.addDrone chiamato con:', droneData);
        
        if (this.drones.length >= this.maxDrones) {
            console.log('🚁 Limite massimo droni raggiunto!');
            return false;
        }
        
        if (!this.game || !this.game.ship) {
            console.error('🚁 Errore: game o ship non disponibili!');
            return false;
        }
        
        // Controlla se esiste già un drone con lo stesso ID
        const existingDrone = this.drones.find(d => d.id === droneData.id);
        if (existingDrone) {
            console.log('🚁 Drone già esistente, non aggiungo duplicato:', droneData.id);
            return false;
        }
        
        // Controlla anche per tipo e posizione per evitare duplicati visivi
        const similarDrone = this.drones.find(d => 
            d.droneType === droneData.droneType && 
            Math.abs(d.x - this.game.ship.x) < 50 && 
            Math.abs(d.y - this.game.ship.y) < 50
        );
        if (similarDrone) {
            console.log('🚁 Drone simile già presente in posizione vicina:', droneData.droneType);
            return false;
        }
        
        const drone = new Drone(
            this.game.ship.x,
            this.game.ship.y,
            droneData.droneType,
            this.game.ship
        );
        
        // Assegna un ID univoco
        drone.id = droneData.id || `drone_${Date.now()}_${Math.random()}`;
        
        // Imposta equipaggiamento
        if (droneData.equippedItems) {
            drone.equippedItems = [...droneData.equippedItems];
        }
        
        // Imposta posizione di formazione
        const formationIndex = this.drones.length;
        if (formationIndex < this.formations[this.currentFormation].length) {
            const formation = this.formations[this.currentFormation][formationIndex];
            drone.setFormationPosition(formation.x, formation.y, formation.angle);
        }
        
        this.drones.push(drone);
        console.log(`🚁 Drone ${droneData.droneType} aggiunto! Totale: ${this.drones.length}/${this.maxDrones}`);
        console.log('🚁 Drones attivi:', this.drones.map(d => `${d.droneType} (${d.id}) at (${d.x}, ${d.y})`));
        return true;
    }
    
    // Rimuovi drone
    removeDrone(index) {
        if (index >= 0 && index < this.drones.length) {
            this.drones.splice(index, 1);
            this.updateFormations();
            return true;
        }
        return false;
    }
    
    // Aggiorna tutti i droni
    update(deltaTime) {
        // Aggiorna ogni drone
        this.drones.forEach((drone, index) => {
            drone.update(deltaTime);
        });
        
        // Aggiorna formazioni se necessario
        this.updateFormations();
        
        // Sistema di comunicazione tra droni disabilitato per posizioni statiche
        // this.updateDroneCommunication();
    }
    
    // Aggiorna posizioni di formazione
    updateFormations() {
        const formation = this.formations[this.currentFormation];
        
        this.drones.forEach((drone, index) => {
            if (index < formation.length) {
                const pos = formation[index];
                drone.setFormationPosition(pos.x, pos.y, pos.angle);
            }
        });
    }
    
    // Cambia formazione
    setFormation(formationName) {
        if (this.formations[formationName]) {
            this.currentFormation = formationName;
            this.updateFormations();
            console.log(`🚁 Formazione cambiata a: ${formationName}`);
        }
    }
    
    // Imposta comportamento per tutti i droni
    setBehavior(behavior) {
        this.drones.forEach(drone => {
            drone.setBehavior(behavior);
        });
    }
    
    // Imposta target per tutti i droni
    setTarget(target) {
        this.drones.forEach(drone => {
            drone.setTarget(target);
        });
    }
    
    // Attacca target
    attackTarget(target) {
        this.setBehavior('attack');
        this.setTarget(target);
    }
    
    // Segui la nave
    followShip() {
        this.setBehavior('follow');
        this.setTarget(null);
    }
    
    // Difendi la nave
    defendShip() {
        this.setBehavior('defend');
        this.setTarget(null);
    }
    
    // Pattuglia area
    patrolArea() {
        this.setBehavior('patrol');
        this.setTarget(null);
    }
    
    // Disegna tutti i droni
    draw(ctx, camera) {
        this.drones.forEach((drone, index) => {
            drone.draw(ctx, camera);
        });
    }
    
    // Ottieni droni attivi
    getActiveDrones() {
        return this.drones.filter(drone => drone.isActive);
    }
    
    // Ottieni droni per tipo
    getDronesByType(type) {
        return this.drones.filter(drone => drone.droneType === type);
    }
    
    // Ripara tutti i droni
    repairAllDrones(amount = 100) {
        this.drones.forEach(drone => {
            drone.repair(amount);
        });
    }
    
    // Ottieni statistiche
    getStats() {
        const active = this.getActiveDrones().length;
        const flax = this.getDronesByType('flax').length;
        const iris = this.getDronesByType('iris').length;
        
        return {
            total: this.drones.length,
            active: active,
            inactive: this.drones.length - active,
            flax: flax,
            iris: iris,
            formation: this.currentFormation
        };
    }
    
    // Pulisci droni distrutti
    cleanup() {
        this.drones = this.drones.filter(drone => drone.isActive);
    }
    
    // Sistema di comunicazione tra droni
    updateDroneCommunication() {
        // I droni si influenzano a vicenda per mantenere la formazione
        this.drones.forEach((drone, index) => {
            if (!drone.isActive) return;
            
            // Trova droni vicini
            const nearbyDrones = this.drones.filter((otherDrone, otherIndex) => {
                if (otherIndex === index || !otherDrone.isActive) return false;
                
                const distance = Math.sqrt(
                    Math.pow(drone.x - otherDrone.x, 2) + 
                    Math.pow(drone.y - otherDrone.y, 2)
                );
                
                return distance < 150; // Raggio di influenza aumentato
            });
            
            // Applica repulsione se troppo vicini
            nearbyDrones.forEach(nearbyDrone => {
                const dx = drone.x - nearbyDrone.x;
                const dy = drone.y - nearbyDrone.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) { // Distanza minima aumentata da 60 a 100
                    const repulsionForce = 0.5; // Forza di repulsione aumentata
                    const repulsionX = (dx / distance) * repulsionForce;
                    const repulsionY = (dy / distance) * repulsionForce;
                    
                    drone.targetX += repulsionX;
                    drone.targetY += repulsionY;
                } else if (distance > 200) { // Se troppo lontani, attira verso la formazione
                    const attractionForce = 0.1;
                    const attractionX = -(dx / distance) * attractionForce;
                    const attractionY = -(dy / distance) * attractionForce;
                    
                    drone.targetX += attractionX;
                    drone.targetY += attractionY;
                }
            });
            
            // Reattività ai nemici
            this.updateEnemyReactivity(drone);
        });
    }
    
    // Reattività ai nemici
    updateEnemyReactivity(drone) {
        if (!this.game || !this.game.enemies) return;
        
        // Trova nemici vicini
        const nearbyEnemies = this.game.enemies.filter(enemy => {
            if (!enemy || !enemy.active) return false;
            
            const distance = Math.sqrt(
                Math.pow(drone.x - enemy.x, 2) + 
                Math.pow(drone.y - enemy.y, 2)
            );
            
            return distance < 200; // Raggio di rilevamento nemici
        });
        
        if (nearbyEnemies.length > 0) {
            // Cambia comportamento in modalità difensiva
            drone.setBehavior('defend');
            
            // Aggiungi movimento evasivo
            const time = Date.now() * 0.003;
            const evasiveX = Math.sin(time + drone.formationOffset.x) * 10;
            const evasiveY = Math.cos(time + drone.formationOffset.y) * 10;
            
            drone.targetX += evasiveX;
            drone.targetY += evasiveY;
        } else {
            // Torna al comportamento normale
            drone.setBehavior('follow');
        }
    }
    
    // Carica droni esistenti dall'inventario
    loadDronesFromInventory() {
        if (!this.game || !this.game.inventory || !this.game.inventory.equipment.uav) {
            console.log('🚁 DroneManager: inventario UAV non disponibile');
            return;
        }
        
        const uavItems = this.game.inventory.equipment.uav;
        console.log('🚁 DroneManager: caricando droni dall\'inventario:', uavItems.length);
        console.log('🚁 Inventario UAV completo:', uavItems);
        
        uavItems.forEach((droneData, index) => {
            if (droneData && droneData.droneType) {
                console.log(`🚁 Caricando drone ${index}:`, droneData);
                this.addDrone(droneData);
            } else {
                console.log(`🚁 Drone ${index} non valido:`, droneData);
            }
        });
        
        console.log(`🚁 Totale droni caricati: ${this.drones.length}`);
    }
    
    // Forza il ricaricamento dei droni dall'inventario
    reloadDronesFromInventory() {
        console.log('🚁 Forzando ricaricamento droni dall\'inventario...');
        this.drones = []; // Pulisci droni esistenti
        this.loadDronesFromInventory();
    }
    
    // Sincronizza droni con l'inventario (aggiunge solo i nuovi)
    syncWithInventory() {
        if (!this.game || !this.game.inventory || !this.game.inventory.equipment.uav) {
            console.log('🚁 DroneManager: inventario UAV non disponibile per sincronizzazione');
            return;
        }
        
        const uavItems = this.game.inventory.equipment.uav;
        console.log('🚁 Sincronizzazione: inventario ha', uavItems.length, 'droni, DroneManager ha', this.drones.length);
        
        // Trova droni nell'inventario che non sono nel DroneManager
        uavItems.forEach((droneData, index) => {
            if (droneData && droneData.droneType) {
                const existingDrone = this.drones.find(d => d.id === droneData.id);
                if (!existingDrone) {
                    console.log(`🚁 Aggiungendo drone mancante:`, droneData);
                    this.addDrone(droneData);
                }
            }
        });
        
        console.log(`🚁 Sincronizzazione completata. Totale droni: ${this.drones.length}`);
    }
    
    // Debug: mostra stato dei droni
    debugDrones() {
        console.log('🚁 DEBUG DRONI:');
        console.log(`- Totale droni nel DroneManager: ${this.drones.length}`);
        console.log(`- Droni attivi: ${this.getActiveDrones().length}`);
        console.log(`- Droni nell'inventario: ${this.game.inventory.equipment.uav.length}`);
        
        this.drones.forEach((drone, index) => {
            console.log(`- Drone ${index}: ${drone.droneType} attivo: ${drone.isActive} pos: (${drone.x}, ${drone.y})`);
        });
    }
    
    // Pulisci duplicati
    removeDuplicates() {
        console.log('🚁 Rimuovendo duplicati...');
        const uniqueDrones = [];
        const seenIds = new Set();
        
        this.drones.forEach(drone => {
            if (!seenIds.has(drone.id)) {
                seenIds.add(drone.id);
                uniqueDrones.push(drone);
            } else {
                console.log('🚁 Rimosso duplicato:', drone.id);
            }
        });
        
        this.drones = uniqueDrones;
        console.log(`🚁 Droni dopo pulizia: ${this.drones.length}`);
    }
    
    // Forza riposizionamento corretto di tutti i droni
    repositionDrones() {
        console.log('🚁 Riposizionando tutti i droni...');
        const formation = this.formations[this.currentFormation];
        
        this.drones.forEach((drone, index) => {
            if (index < formation.length) {
                const pos = formation[index];
                drone.setFormationPosition(pos.x, pos.y, pos.angle);
                
                // Forza posizionamento immediato
                if (this.game && this.game.ship) {
                    const angle = pos.angle + this.game.ship.rotation;
                    drone.targetX = this.game.ship.x + Math.round(Math.cos(angle * Math.PI / 180) * 150 * 100) / 100;
                    drone.targetY = this.game.ship.y + Math.round(Math.sin(angle * Math.PI / 180) * 150 * 100) / 100;
                    drone.x = drone.targetX;
                    drone.y = drone.targetY;
                }
            }
        });
        
        console.log('🚁 Riposizionamento completato');
    }
}
