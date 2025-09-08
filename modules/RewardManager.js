// Sistema Reward - Calcolatore Puro (Niente Stato)
export class RewardManager {
    constructor() {
        // Sistema di notifiche (riferimento esterno)
        this.notifications = null;
    }
    
    // Inizializza il RewardManager con dipendenze esterne
    init(notifications) {
        this.notifications = notifications;
    }
    
    // Calcola reward multipli (NON li aggiunge - solo calcolo)
    calculateRewards(rewards) {
        return {
            credits: rewards.credits || 0,
            uridium: rewards.uridium || 0,
            honor: rewards.honor || 0,
            experience: rewards.experience || 0,
            starEnergy: rewards.starEnergy || 0
        };
    }
    
    // Calcola reward per nemico specifico
    calculateEnemyRewards(enemyType, enemyConfig = null) {
        const config = enemyConfig || this.getEnemyConfig(enemyType);
        const baseRewards = this.getEnemyBaseRewards(enemyType);
        
        return {
            credits: baseRewards.credits,
            uridium: baseRewards.uridium,
            honor: baseRewards.honor,
            experience: baseRewards.experience
        };
    }
    
    // Processa reward per nemico (calcola e mostra notifiche)
    processEnemyKill(enemyType, enemyConfig = null) {
        const rewards = this.calculateEnemyRewards(enemyType, enemyConfig);
        
        // Mostra prima la notifica dell'azione
        if (this.notifications) {
            const enemyName = this.getEnemyConfig(enemyType).name;
            this.notifications.add(`${enemyName} distrutto!`, 600, 'success');
        }
        
        // Poi mostra le notifiche per i reward
        this.showRewardNotifications(rewards);
        
        return rewards;
    }
    
    // Mostra notifiche per i reward
    showRewardNotifications(rewards) {
        if (!this.notifications) return;
        
        if (rewards.credits > 0) {
            this.notifications.add(`+${rewards.credits} Credits`, 600, 'reward');
            window.gameInstance.ship.addResource('credits', rewards.credits);
        }
        
        if (rewards.uridium > 0) {
            this.notifications.add(`+${rewards.uridium} Uridium`, 600, 'reward');
            window.gameInstance.ship.addResource('uridium', rewards.uridium);
        }
        
        if (rewards.honor > 0) {
            this.notifications.add(`+${rewards.honor} Honor`, 600, 'reward');
            window.gameInstance.ship.addResource('honor', rewards.honor);
        }
        
        if (rewards.experience > 0) {
            this.notifications.add(`+${rewards.experience} XP`, 600, 'reward');
            window.gameInstance.ship.addResource('experience', rewards.experience);
        }

        if (rewards.starEnergy > 0) {
            this.notifications.add(`⚡ +${rewards.starEnergy} StarEnergy`, 600, 'reward');
            window.gameInstance.ship.addStarEnergy(rewards.starEnergy);
        }

        if (rewards.starEnergy > 0) {
            this.notifications.add(`⚡ +${rewards.starEnergy} StarEnergy`, 600, 'reward');
        }
    }
    
    // Configurazione nemici
    getEnemyConfig(enemyType) {
        const configs = {
            'streuner': {
                name: 'Streuner',
                description: 'Currently the weakest of aliens. Located in X-1, X-2.',
                sprite: 'alien',
                maxHP: 8000,
                maxShield: 4000,
                credits: 400,
                uridium: 1,
                honor: 2,
                experience: 400
            },
            'lordakia': {
                name: 'Lordakia',
                description: 'Stronger alien with better rewards.',
                sprite: 'alien',
                maxHP: 12000,
                maxShield: 6000,
                credits: 600,
                uridium: 2,
                honor: 3,
                experience: 600
            }
        };
        
        return configs[enemyType] || configs['streuner'];
    }
    
    // Reward base per tipo di nemico
    getEnemyBaseRewards(enemyType) {
        const rewards = {
            'barracuda': { credits: 10, uridium: 2, honor: 5, experience: 100 },
            'npc_x1': { credits: 400, uridium: 1, honor: 2, experience: 400 },
            'npc_x2': { credits: 500, uridium: 2, honor: 3, experience: 500 },
            'enemy': { credits: 400, uridium: 1, honor: 2, experience: 400 }, // Default per Streuner
            'streuner': { credits: 400, uridium: 1, honor: 2, experience: 400 },
            'lordakia': { credits: 600, uridium: 2, honor: 3, experience: 600 }
        };
        
        return rewards[enemyType] || rewards['enemy'];
    }
    
    // Calcola reward per mining
    calculateMiningRewards(credits, uridium, honor) {
        return {
            credits: credits || 0,
            uridium: uridium || 0,
            honor: honor || 0,
            experience: 0
        };
    }
    
    // Processa reward per mining (calcola e mostra notifiche)
    processMiningRewards(credits, uridium, honor) {
        const rewards = this.calculateMiningRewards(credits, uridium, honor);
        
        // Mostra le notifiche per i reward
        this.showRewardNotifications(rewards);
        
        return rewards;
    }
    
    // Processa reward per bonus box (calcola e mostra notifiche)
    processBonusBoxRewards(credits, uridium, starEnergy) {
        const rewards = {
            credits: credits || 0,
            uridium: uridium || 0,
            honor: 0,
            experience: 0,
            starEnergy: starEnergy || 0
        };
        
        // Mostra prima la notifica "Bonus box raccolta!"
        if (this.notifications) {
            this.notifications.add("Bonus box raccolta!", 600, 'success');
        }
        
        // Poi mostra le notifiche per i reward
        this.showRewardNotifications(rewards);
        
        return rewards;
    }
    
    // Metodi di compatibilità per il sistema esistente
    getCreditsForEnemyType(enemyType) {
        const rewards = this.calculateEnemyRewards(enemyType);
        return rewards.credits;
    }
    
    getUridiumForEnemyType(enemyType) {
        const rewards = this.calculateEnemyRewards(enemyType);
        return rewards.uridium;
    }
    
    getHonorForEnemyType(enemyType) {
        const rewards = this.calculateEnemyRewards(enemyType);
        return rewards.honor;
    }
    
    getExpForEnemyType(enemyType) {
        const rewards = this.calculateEnemyRewards(enemyType);
        return rewards.experience;
    }
}