// Sistema di rank basato sull'onore
export class RankSystem {
    constructor() {
        this.ranks = [
            { name: 'Recluta', symbol: '✧', minHonor: 0, maxHonor: 999 },
            { name: 'Cadetto', symbol: '✦', minHonor: 1000, maxHonor: 2499 },
            { name: 'Pilota', symbol: '✩', minHonor: 2500, maxHonor: 4999 },
            { name: 'Specialista', symbol: '✪', minHonor: 5000, maxHonor: 9999 },
            { name: 'Veterano', symbol: '★', minHonor: 10000, maxHonor: 19999 },
            { name: 'Ufficiale', symbol: '☆', minHonor: 20000, maxHonor: 34999 },
            { name: 'Tenente', symbol: '✫', minHonor: 35000, maxHonor: 54999 },
            { name: 'Capitano', symbol: '✯', minHonor: 55000, maxHonor: 79999 },
            { name: 'Comandante', symbol: '✬', minHonor: 80000, maxHonor: 109999 },
            { name: 'Maggiore', symbol: '✭', minHonor: 110000, maxHonor: 149999 },
            { name: 'Colonnello', symbol: '✮', minHonor: 150000, maxHonor: 199999 },
            { name: 'Generale', symbol: '✰', minHonor: 200000, maxHonor: 299999 },
            { name: 'Ammiraglio', symbol: '✷', minHonor: 300000, maxHonor: 499999 },
            { name: 'Elite', symbol: '✵', minHonor: 500000, maxHonor: 999999 },
            { name: 'Leggenda', symbol: '✶', minHonor: 1000000, maxHonor: Infinity }
        ];
    }
    
    // Ottiene il rank corrente basato sull'onore
    getCurrentRank(honor) {
        for (let i = this.ranks.length - 1; i >= 0; i--) {
            if (honor >= this.ranks[i].minHonor) {
                return this.ranks[i];
            }
        }
        return this.ranks[0]; // Fallback a Recluta
    }
    
    // Ottiene il prossimo rank
    getNextRank(honor) {
        const currentRank = this.getCurrentRank(honor);
        const currentIndex = this.ranks.findIndex(rank => rank.name === currentRank.name);
        
        if (currentIndex < this.ranks.length - 1) {
            return this.ranks[currentIndex + 1];
        }
        return null; // Già al massimo rank
    }
    
    // Calcola il progresso verso il prossimo rank
    getRankProgress(honor) {
        const currentRank = this.getCurrentRank(honor);
        const nextRank = this.getNextRank(honor);
        
        if (!nextRank) {
            return { progress: 1.0, current: currentRank.minHonor, needed: 0, total: 0 };
        }
        
        const current = honor - currentRank.minHonor;
        const total = nextRank.minHonor - currentRank.minHonor;
        const progress = current / total;
        
        return {
            progress: Math.min(progress, 1.0),
            current: current,
            needed: nextRank.minHonor - honor,
            total: total
        };
    }
    
    // Ottiene tutti i rank
    getAllRanks() {
        return this.ranks;
    }
    
    // Ottiene il rank per nome
    getRankByName(name) {
        return this.ranks.find(rank => rank.name === name);
    }
    
    // Ottiene il rank per simbolo
    getRankBySymbol(symbol) {
        return this.ranks.find(rank => rank.symbol === symbol);
    }
    
    // Calcola l'onore necessario per raggiungere un rank specifico
    getHonorForRank(rankName) {
        const rank = this.getRankByName(rankName);
        return rank ? rank.minHonor : 0;
    }
    
    // Verifica se l'onore è sufficiente per un rank
    hasRank(honor, rankName) {
        const rank = this.getRankByName(rankName);
        return rank ? honor >= rank.minHonor : false;
    }
}





