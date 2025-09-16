// Sistema Fazioni - Ispirato a DarkOrbit
export class FactionSystem {
    constructor() {
        this.factions = this.initializeFactions();
        this.currentFaction = null;
        this.factionReputation = {}; // Reputazione con ogni fazione
        this.factionHistory = []; // Storia delle fazioni
        this.maxHistoryLength = 100;
    }
    
    /**
     * Inizializza le fazioni disponibili
     */
    initializeFactions() {
        return {
            'eic': {
                id: 'eic',
                name: 'EIC',
                fullName: 'Earth Industries Corporation',
                description: 'La più grande corporazione terrestre, specializzata in tecnologia e commercio.',
                color: '#4A90E2', // Blu
                secondaryColor: '#2E5BBA',
                icon: '🌍',
                headquarters: { x: 2000, y: 2000 },
                
                // Bonus specifici della fazione (rimossi per equilibrio iniziale)
                bonuses: {
                    credits: 1.0, // Nessun bonus
                    experience: 1.0, // Nessun bonus
                    shield: 1.0, // Nessun bonus
                    speed: 1.0, // Nessun bonus
                    damage: 1.0 // Nessun bonus
                },
                
                // Tecnologie esclusive
                exclusiveTech: [
                    'Advanced Shields',
                    'Trade Routes',
                    'Corporate Discounts'
                ],
                
                // Requisiti per entrare
                requirements: {
                    level: 1,
                    credits: 0
                },
                
                // Nemici naturali
                enemies: ['mars', 'venus'],
                
                // Alleati
                allies: [],
                
                // Stile di gioco
                playstyle: 'Balanced',
                description: 'La più grande corporazione terrestre, specializzata in tecnologia e commercio. Perfetta per giocatori che vogliono un equilibrio tra combattimento e commercio.'
            },
            
            'mars': {
                id: 'mars',
                name: 'MARS',
                fullName: 'Mars Mining Operations',
                description: 'Specializzata nell\'estrazione mineraria e nella produzione di risorse.',
                color: '#E74C3C', // Rosso
                secondaryColor: '#C0392B',
                icon: '🔴',
                headquarters: { x: 14000, y: 2000 },
                
                // Bonus specifici della fazione (rimossi per equilibrio iniziale)
                bonuses: {
                    credits: 1.0, // Nessun bonus
                    experience: 1.0, // Nessun bonus
                    shield: 1.0, // Nessun bonus
                    speed: 1.0, // Nessun bonus
                    damage: 1.0 // Nessun bonus
                },
                
                // Tecnologie esclusive
                exclusiveTech: [
                    'Mining Lasers',
                    'Resource Processing',
                    'Heavy Armor'
                ],
                
                // Requisiti per entrare
                requirements: {
                    level: 1,
                    credits: 0
                },
                
                // Nemici naturali
                enemies: ['eic', 'venus'],
                
                // Alleati
                allies: [],
                
                // Stile di gioco
                playstyle: 'Aggressive',
                description: 'Specializzata nell\'estrazione mineraria e nella produzione di risorse. Ideale per giocatori che preferiscono il combattimento diretto e l\'accumulo di risorse.'
            },
            
            'venus': {
                id: 'venus',
                name: 'VENUS',
                fullName: 'Venus Research Division',
                description: 'Avanzata divisione di ricerca scientifica con tecnologie all\'avanguardia.',
                color: '#9B59B6', // Viola
                secondaryColor: '#8E44AD',
                icon: '🟣',
                headquarters: { x: 2000, y: 8000 },
                
                // Bonus specifici della fazione (rimossi per equilibrio iniziale)
                bonuses: {
                    credits: 1.0, // Nessun bonus
                    experience: 1.0, // Nessun bonus
                    shield: 1.0, // Nessun bonus
                    speed: 1.0, // Nessun bonus
                    damage: 1.0 // Nessun bonus
                },
                
                // Tecnologie esclusive
                exclusiveTech: [
                    'Quantum Weapons',
                    'Research Labs',
                    'Advanced Navigation'
                ],
                
                // Requisiti per entrare
                requirements: {
                    level: 1,
                    credits: 0
                },
                
                // Nemici naturali
                enemies: ['eic', 'mars'],
                
                // Alleati
                allies: [],
                
                // Stile di gioco
                playstyle: 'Tactical',
                description: 'Avanzata divisione di ricerca scientifica con tecnologie all\'avanguardia. Perfetta per giocatori strategici che amano la tecnologia e la precisione.'
            }
        };
    }
    
    /**
     * Seleziona una fazione
     */
    selectFaction(factionId, player) {
        if (!this.factions[factionId]) {
            console.error(`Fazione ${factionId} non trovata`);
            return false;
        }
        
        const faction = this.factions[factionId];
        
        // Controlla requisiti
        if (!this.checkRequirements(faction, player)) {
            return false;
        }
        
        // Cambia fazione
        const oldFaction = this.currentFaction;
        this.currentFaction = factionId;
        
        // Aggiorna reputazione
        this.updateReputation(oldFaction, factionId);
        
        // Aggiungi alla storia
        this.addToHistory({
            action: 'faction_change',
            from: oldFaction,
            to: factionId,
            timestamp: Date.now(),
            player: player.playerName || 'Unknown'
        });
        
        // Applica bonus della fazione
        this.applyFactionBonuses(player);
        
        console.log(`🎯 Fazione cambiata: ${oldFaction || 'Nessuna'} → ${factionId}`);
        return true;
    }
    
    /**
     * Controlla se il giocatore soddisfa i requisiti
     */
    checkRequirements(faction, player) {
        const req = faction.requirements;
        
        if (player.currentLevel < req.level) {
            console.warn(`Livello insufficiente per ${faction.name}: ${player.currentLevel}/${req.level}`);
            return false;
        }
        
        if (player.resources.credits < req.credits) {
            console.warn(`Crediti insufficienti per ${faction.name}: ${player.resources.credits}/${req.credits}`);
            return false;
        }
        
        return true;
    }
    
    /**
     * Applica i bonus della fazione al giocatore
     */
    applyFactionBonuses(player) {
        if (!this.currentFaction || !this.factions[this.currentFaction]) {
            return;
        }
        
        const faction = this.factions[this.currentFaction];
        const bonuses = faction.bonuses;
        
        // Salva i bonus applicati per poterli rimuovere se necessario
        player.factionBonuses = bonuses;
        
        console.log(`🎯 Bonus fazione ${faction.name} applicati:`, bonuses);
    }
    
    /**
     * Rimuove i bonus della fazione
     */
    removeFactionBonuses(player) {
        if (player.factionBonuses) {
            delete player.factionBonuses;
            console.log(`🎯 Bonus fazione rimossi`);
        }
    }
    
    /**
     * Aggiorna la reputazione tra fazioni
     */
    updateReputation(oldFaction, newFaction) {
        if (oldFaction && oldFaction !== newFaction) {
            // Diminuisci reputazione con la fazione precedente
            if (!this.factionReputation[oldFaction]) {
                this.factionReputation[oldFaction] = 0;
            }
            this.factionReputation[oldFaction] = Math.max(-100, this.factionReputation[oldFaction] - 10);
            
            // Aumenta reputazione con la nuova fazione
            if (!this.factionReputation[newFaction]) {
                this.factionReputation[newFaction] = 0;
            }
            this.factionReputation[newFaction] = Math.min(100, this.factionReputation[newFaction] + 5);
        }
    }
    
    /**
     * Aggiunge un evento alla storia delle fazioni
     */
    addToHistory(event) {
        this.factionHistory.unshift(event);
        
        // Mantieni solo gli ultimi N eventi
        if (this.factionHistory.length > this.maxHistoryLength) {
            this.factionHistory = this.factionHistory.slice(0, this.maxHistoryLength);
        }
    }
    
    /**
     * Ottiene la fazione corrente
     */
    getCurrentFaction() {
        if (!this.currentFaction) {
            return null;
        }
        
        // Se currentFaction è un oggetto, estrai l'ID
        let factionId = this.currentFaction;
        if (typeof this.currentFaction === 'object' && this.currentFaction.id) {
            factionId = this.currentFaction.id;
        }
        
        const faction = this.factions[factionId];
        return faction;
    }
    
    /**
     * Ottiene tutte le fazioni
     */
    getAllFactions() {
        // Ordine fisso: EIC, MARS, VENUS
        return [
            this.factions['eic'],
            this.factions['mars'],
            this.factions['venus']
        ];
    }
    
    /**
     * Ottiene le fazioni disponibili per il giocatore
     */
    getAvailableFactions(player) {
        return this.getAllFactions().filter(faction => 
            this.checkRequirements(faction, player)
        );
    }
    
    /**
     * Controlla se due fazioni sono nemiche
     */
    areEnemies(faction1, faction2) {
        if (!faction1 || !faction2) return false;
        
        const f1 = typeof faction1 === 'string' ? this.factions[faction1] : faction1;
        const f2 = typeof faction2 === 'string' ? this.factions[faction2] : faction2;
        
        if (!f1 || !f2) return false;
        
        return f1.enemies.includes(f2.id) || f2.enemies.includes(f1.id);
    }
    
    /**
     * Ottiene la reputazione con una fazione
     */
    getReputation(factionId) {
        return this.factionReputation[factionId] || 0;
    }
    
    /**
     * Unisce il giocatore a una fazione
     */
    joinFaction(factionId) {
        const faction = this.factions[factionId];
        if (!faction) {
            return {
                success: false,
                message: 'Fazione non trovata!'
            };
        }
        
        // Se già in una fazione, deve prima abbandonarla
        if (this.currentFaction) {
            const currentFactionName = this.factions[this.currentFaction]?.name || this.currentFaction;
            return {
                success: false,
                message: `Sei già nella fazione ${currentFactionName}. Abbandona prima di unirti a un'altra!`
            };
        }
        
        // Unisce alla fazione (memorizza sempre l'ID, non l'oggetto)
        this.currentFaction = factionId;
        this.factionReputation[factionId] = 0;
        
        return {
            success: true,
            message: `Benvenuto nella fazione ${faction.name}!`
        };
    }
    
    /**
     * Abbandona la fazione corrente
     */
    leaveFaction() {
        if (!this.currentFaction) {
            return {
                success: false,
                message: 'Non sei in nessuna fazione!'
            };
        }
        
        const factionName = this.factions[this.currentFaction]?.name || this.currentFaction;
        this.currentFaction = null;
        
        return {
            success: true,
            message: `Hai abbandonato la fazione ${factionName}!`
        };
    }
    
    /**
     * Aggiunge un evento alla storia delle fazioni
     */
    addToHistory(event) {
        this.factionHistory.unshift(event);
        
        // Mantiene solo gli ultimi eventi
        if (this.factionHistory.length > this.maxHistoryLength) {
            this.factionHistory = this.factionHistory.slice(0, this.maxHistoryLength);
        }
    }
    
    /**
     * Ottiene la storia delle fazioni
     */
    getHistory(limit = 10) {
        return this.factionHistory.slice(0, limit);
    }
    
    /**
     * Calcola il danno PvP basato sulla fazione
     */
    calculatePvPDamage(attacker, defender) {
        const attackerFaction = this.getCurrentFaction();
        const defenderFaction = defender.faction || null;
        
        if (!attackerFaction || !defenderFaction) {
            return 1.0; // Nessun bonus/penalità
        }
        
        // Bonus danno contro nemici naturali
        if (this.areEnemies(attackerFaction.id, defenderFaction.id)) {
            return 1.2; // +20% danno contro nemici
        }
        
        // Penalità danno contro alleati
        if (attackerFaction.allies.includes(defenderFaction.id)) {
            return 0.8; // -20% danno contro alleati
        }
        
        return 1.0; // Danno normale
    }
    
    /**
     * Ottiene le statistiche della fazione
     */
    getFactionStats() {
        const stats = {};
        
        Object.keys(this.factions).forEach(factionId => {
            stats[factionId] = {
                members: 0, // Da implementare con sistema online
                reputation: this.getReputation(factionId),
                activity: 0, // Da implementare con sistema online
                lastActivity: Date.now()
            };
        });
        
        return stats;
    }
    
    /**
     * Resetta il sistema fazioni
     */
    reset() {
        this.currentFaction = null;
        this.factionReputation = {};
        this.factionHistory = [];
    }
    
    /**
     * Esporta i dati delle fazioni per il salvataggio
     */
    exportData() {
        return {
            currentFaction: this.currentFaction,
            factionReputation: { ...this.factionReputation },
            factionHistory: [...this.factionHistory]
        };
    }
    
    /**
     * Importa i dati delle fazioni dal salvataggio
     */
    importData(data) {
        this.currentFaction = data.currentFaction || null;
        this.factionReputation = data.factionReputation || {};
        this.factionHistory = data.factionHistory || [];
    }
}

