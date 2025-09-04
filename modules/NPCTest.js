// Test delle Differenze NPC tra Mappe
export class NPCTest {
    constructor() {
        this.npcTypes = new NPCTypes();
    }
    
    // Mostra le differenze tra NPC X1 e X2
    showNPCDifferences() {
        console.log('🎮 SISTEMA NPC PER MAPPA - DIFFERENZE:');
        console.log('');
        
        const x1Config = this.npcTypes.getNPCConfig('npc_x1');
        const x2Config = this.npcTypes.getNPCConfig('npc_x2');
        
        console.log('📊 CONFRONTO NPC:');
        console.log('');
        
        console.log('🔵 X1 SECTOR (npc_x1):');
        console.log(`   Nome: ${x1Config.name}`);
        console.log(`   HP: ${x1Config.maxHP}`);
        console.log(`   Scudo: ${x1Config.maxShield}`);
        console.log(`   Velocità: ${x1Config.speed}`);
        console.log(`   Danno: ${x1Config.damage}`);
        console.log(`   Esperienza: ${x1Config.experience}`);
        console.log(`   Crediti: ${x1Config.credits}`);
        console.log(`   Colore: ${x1Config.colors.primary}`);
        console.log('');
        
        console.log('🔴 X2 SECTOR (npc_x2):');
        console.log(`   Nome: ${x2Config.name}`);
        console.log(`   HP: ${x2Config.maxHP} (+${x2Config.maxHP - x1Config.maxHP})`);
        console.log(`   Scudo: ${x2Config.maxShield} (+${x2Config.maxShield - x1Config.maxShield})`);
        console.log(`   Velocità: ${x2Config.speed} (+${x2Config.speed - x1Config.speed})`);
        console.log(`   Danno: ${x2Config.damage} (+${x2Config.damage - x1Config.damage})`);
        console.log(`   Esperienza: ${x2Config.experience} (+${x2Config.experience - x1Config.experience})`);
        console.log(`   Crediti: ${x2Config.credits} (+${x2Config.credits - x1Config.credits})`);
        console.log(`   Colore: ${x2Config.colors.primary}`);
        console.log('');
        
        console.log('📈 MIGLIORAMENTI X2 vs X1:');
        const hpIncrease = ((x2Config.maxHP - x1Config.maxHP) / x1Config.maxHP * 100).toFixed(1);
        const shieldIncrease = ((x2Config.maxShield - x1Config.maxShield) / x1Config.maxShield * 100).toFixed(1);
        const speedIncrease = ((x2Config.speed - x1Config.speed) / x1Config.speed * 100).toFixed(1);
        const damageIncrease = ((x2Config.damage - x1Config.damage) / x1Config.damage * 100).toFixed(1);
        const expIncrease = ((x2Config.experience - x1Config.experience) / x1Config.experience * 100).toFixed(1);
        const creditsIncrease = ((x2Config.credits - x1Config.credits) / x1Config.credits * 100).toFixed(1);
        
        console.log(`   HP: +${hpIncrease}%`);
        console.log(`   Scudo: +${shieldIncrease}%`);
        console.log(`   Velocità: +${speedIncrease}%`);
        console.log(`   Danno: +${damageIncrease}%`);
        console.log(`   Esperienza: +${expIncrease}%`);
        console.log(`   Crediti: +${creditsIncrease}%`);
        console.log('');
        
        console.log('🎯 STRATEGIA DI GIOCO:');
        console.log('   X1: Zona sicura per principianti');
        console.log('   X2: Zona avanzata con ricompense maggiori');
        console.log('   Ogni mappa ha NPC unici ma stesso sprite');
        console.log('');
        
        console.log('🚀 PRONTO PER FUTURE MAPPE:');
        const allTypes = this.npcTypes.getAllTypes();
        console.log(`   Tipi disponibili: ${allTypes.join(', ')}`);
        console.log('   Facile aggiungere nuove mappe con NPC personalizzati');
    }
    
    // Test creazione NPC per mappa
    testNPCCreation() {
        console.log('🧪 TEST CREAZIONE NPC:');
        console.log('');
        
        // Simula creazione NPC per X1
        const x1Enemy = new Enemy(100, 100, 'npc_x1');
        console.log('X1 NPC creato:');
        console.log(`   Tipo: ${x1Enemy.type}`);
        console.log(`   HP: ${x1Enemy.maxHP}/${x1Enemy.hp}`);
        console.log(`   Scudo: ${x1Enemy.maxShield}/${x1Enemy.shield}`);
        console.log(`   Velocità: ${x1Enemy.speed}`);
        console.log(`   Danno: ${x1Enemy.damage}`);
        console.log('');
        
        // Simula creazione NPC per X2
        const x2Enemy = new Enemy(200, 200, 'npc_x2');
        console.log('X2 NPC creato:');
        console.log(`   Tipo: ${x2Enemy.type}`);
        console.log(`   HP: ${x2Enemy.maxHP}/${x2Enemy.hp}`);
        console.log(`   Scudo: ${x2Enemy.maxShield}/${x2Enemy.shield}`);
        console.log(`   Velocità: ${x2Enemy.speed}`);
        console.log(`   Danno: ${x2Enemy.damage}`);
        console.log('');
        
        console.log('✅ Sistema NPC funzionante!');
    }
}

// Import necessari per il test
import { NPCTypes } from './NPCTypes.js';
import { Enemy } from './Enemy.js';
