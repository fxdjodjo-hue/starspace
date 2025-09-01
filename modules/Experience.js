// Modulo Experience per gestire livelli ed esperienza
export class Experience {
    constructor() {
        this.currentExp = 0;
        this.currentLevel = 1;
        
        // Tabella livelli basata su DarkOrbit (solo XP, senza accessi mappe)
        this.levelRequirements = {
            1: 0,
            2: 10000,
            3: 20000,
            4: 40000,
            5: 80000,
            6: 160000,
            7: 320000,
            8: 640000,
            9: 1280000,
            10: 2560000,
            11: 5120000,
            12: 10240000,
            13: 20480000,
            14: 40960000,
            15: 81920000,
            16: 163840000,
            17: 327680000,
            18: 655360000,
            19: 1310720000,
            20: 2621440000,
            21: 5242880000,
            22: 10485760000,
            23: 20971520000,
            24: 41943040000,
            25: 83886080000,
            26: 167772160000,
            27: 335544320000,
            28: 671088640000,
            29: 1342177280000,
            30: 2684354560000,
            31: 5368709120000,
            32: 10737418240000,
            33: 21474836480000,
            34: 42949672960000,
            35: 85899345920000,
            36: 171798691840000,
            37: 343597383680000,
            38: 687194767360000,
            39: 1374389534720000,
            40: 2748779069440000,
            41: 5497558138880000,
            42: 10995116277760000,
            43: 21990232555520000,
            44: 43980465111040000
        };
        
        this.maxLevel = 44;
    }
    
    // Aggiunge esperienza e controlla se è salito di livello
    addExperience(expAmount) {
        this.currentExp += expAmount;
        
        // Controlla se è salito di livello
        const levelUp = this.checkLevelUp();
        
        return {
            newExp: this.currentExp,
            newLevel: this.currentLevel,
            levelUp: levelUp,
            expToNext: this.getExpToNextLevel()
        };
    }
    
    // Controlla se il giocatore è salito di livello
    checkLevelUp() {
        const nextLevel = this.currentLevel + 1;
        
        if (nextLevel <= this.maxLevel && this.currentExp >= this.levelRequirements[nextLevel]) {
            this.currentLevel = nextLevel;
            return {
                level: nextLevel,
                expRequired: this.levelRequirements[nextLevel],
                bonus: this.getLevelBonus(nextLevel)
            };
        }
        
        return null;
    }
    
    // Ottiene l'esperienza necessaria per il prossimo livello
    getExpToNextLevel() {
        const nextLevel = this.currentLevel + 1;
        
        if (nextLevel <= this.maxLevel) {
            return this.levelRequirements[nextLevel] - this.currentExp;
        }
        
        return 0; // Livello massimo raggiunto
    }
    
    // Ottiene la percentuale di progresso verso il prossimo livello
    getProgressPercentage() {
        const nextLevel = this.currentLevel + 1;
        
        if (nextLevel > this.maxLevel) return 100;
        
        const currentLevelExp = this.levelRequirements[this.currentLevel];
        const nextLevelExp = this.levelRequirements[nextLevel];
        const expInCurrentLevel = this.currentExp - currentLevelExp;
        const expNeededForLevel = nextLevelExp - currentLevelExp;
        
        return (expInCurrentLevel / expNeededForLevel) * 100;
    }
    
    // Ottiene il bonus per livello (per ora solo informativo)
    getLevelBonus(level) {
        const bonuses = {
            1: "Accesso base alle mappe",
            2: "Nuove mappe disponibili",
            5: "Accesso alle mappe nemiche",
            8: "Accesso alle mappe PvP",
            10: "Accesso alle mappe Pirate",
            17: "Accesso a tutte le mappe regolari",
            24: "Accesso alle mappe Blacklight nemiche"
        };
        
        return bonuses[level] || "Livello sbloccato";
    }
    
    // Formatta l'esperienza in formato leggibile
    formatExp(exp) {
        if (exp >= 1000000000000) {
            return (exp / 1000000000000).toFixed(1) + "T";
        } else if (exp >= 1000000000) {
            return (exp / 1000000000).toFixed(1) + "B";
        } else if (exp >= 1000000) {
            return (exp / 1000000).toFixed(1) + "M";
        } else if (exp >= 1000) {
            return (exp / 1000).toFixed(1) + "K";
        } else {
            return exp.toString();
        }
    }
    
    // Ottiene informazioni complete sul livello attuale
    getLevelInfo() {
        return {
            level: this.currentLevel,
            exp: this.currentExp,
            expFormatted: this.formatExp(this.currentExp),
            expToNext: this.getExpToNextLevel(),
            expToNextFormatted: this.formatExp(this.getExpToNextLevel()),
            progress: this.getProgressPercentage(),
            maxLevel: this.maxLevel,
            bonus: this.getLevelBonus(this.currentLevel)
        };
    }
}
