// Sistema Reward Centralizzato e Modulare
export class RewardManager {
    constructor() {
        // Valute del giocatore
        this.credits = 1000; // Valore iniziale per test
        this.uridium = 0;
        this.honor = 0;
        this.experience = 0;
        
        // Sistema di notifiche (riferimento esterno)
        this.notifications = null;
        
        // Callbacks per eventi
        this.onRewardGained = null;
        this.onLevelUp = null;
        this.onHonorGained = null;
    }
    
    // Inizializza il RewardManager con dipendenze esterne
    init(notifications, experienceSystem, upgradeManager) {
        this.notifications = notifications;
        this.experienceSystem = experienceSystem;
        this.upgradeManager = upgradeManager;
    }
    
    // Aggiunge reward multipli in una volta
    addRewards(rewards) {
        const results = {
            credits: 0,
            uridium: 0,
            honor: 0,
            experience: 0,
            levelUp: null
        };
        
        // Aggiungi ogni tipo di reward
        if (rewards.credits) {
            results.credits = this.addCredits(rewards.credits);
        }
        
        if (rewards.uridium) {
            results.uridium = this.addUridium(rewards.uridium);
        }
        
        if (rewards.honor) {
            results.honor = this.addHonor(rewards.honor);
        }
        
        if (rewards.experience) {
            const expResult = this.addExperience(rewards.experience);
            results.experience = expResult.amount;
            results.levelUp = expResult.levelUp;
        }
        
        // Mostra notifiche per ogni reward guadagnato
        this.showRewardNotifications(results);
        
        // Trigger callback se definito
        if (this.onRewardGained) {
            this.onRewardGained(results);
        }
        
        return results;
    }
    
    // Aggiunge credits
    addCredits(amount) {
        if (amount <= 0) return 0;
        
        this.credits += amount;
        
        // Aggiorna anche l'UpgradeManager se disponibile
        if (this.upgradeManager) {
            this.upgradeManager.addCredits(amount);
        }
        
        return amount;
    }
    
    // Aggiunge uridium
    addUridium(amount) {
        if (amount <= 0) return 0;
        
        this.uridium += amount;
        
        // Aggiorna anche l'UpgradeManager se disponibile
        if (this.upgradeManager) {
            this.upgradeManager.addUridium(amount);
        }
        
        return amount;
    }
    
    // Aggiunge honor
    addHonor(amount) {
        if (amount <= 0) return 0;
        
        this.honor += amount;
        
        // Trigger callback se definito
        if (this.onHonorGained) {
            this.onHonorGained(amount);
        }
        
        return amount;
    }
    
    // Aggiunge esperienza
    addExperience(amount) {
        if (amount <= 0) return { amount: 0, levelUp: null };
        
        // Usa il sistema di esperienza se disponibile
        if (this.experienceSystem) {
            const result = this.experienceSystem.addExperience(amount);
            
            // Trigger callback per level up se definito
            if (result.levelUp && this.onLevelUp) {
                this.onLevelUp(result.levelUp);
            }
            
            return {
                amount: amount,
                levelUp: result.levelUp
            };
        }
        
        // Fallback se non c'è sistema di esperienza
        this.experience += amount;
        return { amount: amount, levelUp: null };
    }
    
    // Mostra notifiche per i reward guadagnati
    showRewardNotifications(results) {
        if (!this.notifications) return;
        
        // Mostra notifica per ogni tipo di reward guadagnato con durata sincronizzata
        if (results.credits > 0) {
            this.notifications.add(`+${results.credits} Credits`, 600, 'reward');
        }
        
        if (results.uridium > 0) {
            this.notifications.add(`+${results.uridium} Uridium`, 600, 'reward');
        }
        
        if (results.honor > 0) {
            this.notifications.add(`+${results.honor} Honor`, 600, 'reward');
        }
        
        if (results.experience > 0) {
            this.notifications.add(`+${results.experience} XP`, 600, 'reward');
        }
        
        if (results.levelUp) {
            this.notifications.levelUp(results.levelUp.level, results.levelUp.bonus);
        }
    }
    
    // Calcola reward per tipo di nemico
    calculateEnemyRewards(enemyType, enemyConfig = null) {
        // Se abbiamo la configurazione del nemico, usala
        if (enemyConfig) {
            return {
                credits: enemyConfig.credits || 0,
                uridium: enemyConfig.uridium || 0,
                honor: enemyConfig.honor || 0,
                experience: enemyConfig.experience || 0
            };
        }
        
        // Fallback per compatibilità
        const fallbackRewards = {
            'barracuda': { credits: 10, uridium: 2, honor: 5, experience: 100 },
            'npc_x1': { credits: 400, uridium: 1, honor: 2, experience: 400 },
            'npc_x2': { credits: 500, uridium: 2, honor: 3, experience: 500 },
            'enemy': { credits: 100, uridium: 1, honor: 2, experience: 100 }
        };
        
        return fallbackRewards[enemyType] || fallbackRewards['enemy'];
    }
    
    // Processa reward per nemico distrutto
    processEnemyKill(enemyType, enemyConfig = null) {
        const rewards = this.calculateEnemyRewards(enemyType, enemyConfig);
        const result = this.addRewards(rewards);
        return result;
    }
    
    // Processa reward per mining asteroide
    processMiningRewards(credits, uridium, honor) {
        return this.addRewards({
            credits: credits,
            uridium: uridium,
            honor: honor
        });
    }
    
    // Processa reward per bonus box
    processBonusBoxRewards(credits, uridium) {
        return this.addRewards({
            credits: credits,
            uridium: uridium
        });
    }
    
    // Processa reward per quest
    processQuestRewards(rewards) {
        return this.addRewards(rewards);
    }
    
    // Ottiene stato attuale di tutti i reward
    getRewardStatus() {
        return {
            credits: this.credits,
            uridium: this.uridium,
            honor: this.honor,
            experience: this.experience
        };
    }
    
    // Ottiene reward per tipo specifico
    getCredits() { return this.credits; }
    getUridium() { return this.uridium; }
    getHonor() { return this.honor; }
    getExperience() { return this.experience; }
    
    // Imposta callback per eventi
    setOnRewardGained(callback) { this.onRewardGained = callback; }
    setOnLevelUp(callback) { this.onLevelUp = callback; }
    setOnHonorGained(callback) { this.onHonorGained = callback; }
    
    // Salva stato (per persistenza)
    save() {
        return {
            credits: this.credits,
            uridium: this.uridium,
            honor: this.honor,
            experience: this.experience
        };
    }
    
    // Carica stato (per persistenza)
    load(data) {
        if (data.credits !== undefined) this.credits = data.credits;
        if (data.uridium !== undefined) this.uridium = data.uridium;
        if (data.honor !== undefined) this.honor = data.honor;
        if (data.experience !== undefined) this.experience = data.experience;
    }
}
