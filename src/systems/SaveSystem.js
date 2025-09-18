// Sistema di Salvataggio Persistente
export class SaveSystem {
    constructor(game) {
        this.game = game;
        this.saveKey = 'mmorpg_save_data';
        this.autoSaveInterval = 30000; // Salvataggio automatico ogni 30 secondi
        this.lastSaveTime = 0;
        this.isAutoSaveEnabled = true;
        this.maxBackups = 5; // Massimo 5 backup
        this.saveVersion = '1.0.0';
        
        // Avvia il salvataggio automatico
        this.startAutoSave();
        
        // Salva prima che la pagina venga chiusa
        this.setupBeforeUnload();
    }
    
    /**
     * Determina la chiave di salvataggio attuale in base all'utente loggato
     */
    resolveSlotKey(explicitSlotKey) {
        if (explicitSlotKey) return explicitSlotKey;
        const auth = this.game?.authSystem;
        if (auth && auth.isLoggedIn && typeof auth.getUserSaveKey === 'function') {
            return auth.getUserSaveKey();
        }
        return 'main';
    }
    
    /**
     * Salva tutti i dati del gioco
     */
    save(slotKey = 'main') {
        try {
            const resolvedKey = this.resolveSlotKey(slotKey);
            const saveData = this.collectSaveData();
            const saveDataString = JSON.stringify(saveData);
            
            // Salva i dati principali
            localStorage.setItem(`mmorpg_save_${resolvedKey}`, saveDataString);
            
            // Crea backup
            this.createBackup(saveData, resolvedKey);
            
            this.lastSaveTime = Date.now();
            console.log('💾 Gioco salvato con successo');
            
            // Notifica il giocatore
            if (this.game.notifications) {
                this.game.notifications.add('💾 Gioco salvato', 2000, 'success');
            }
            
            return true;
        } catch (error) {
            console.error('❌ Errore durante il salvataggio:', error);
            if (this.game.notifications) {
                this.game.notifications.add('❌ Errore salvataggio', 3000, 'error');
            }
            return false;
        }
    }
    
    /**
     * Carica i dati salvati
     */
    load(slotKey = 'main') {
        try {
            const resolvedKey = this.resolveSlotKey(slotKey);
            const saveDataString = localStorage.getItem(`mmorpg_save_${resolvedKey}`);
            if (!saveDataString) {
                console.log('📁 Nessun salvataggio trovato');
                return false;
            }
            
            const saveData = JSON.parse(saveDataString);
            
            // Verifica la versione del salvataggio
            if (saveData.version !== this.saveVersion) {
                console.warn('⚠️ Versione salvataggio diversa, potrebbe causare problemi');
            }
            
            // Applica i dati caricati
            this.applySaveData(saveData);
            
            console.log('📁 Gioco caricato con successo');
            
            // Notifica il giocatore
            if (this.game.notifications) {
                this.game.notifications.add('📁 Gioco caricato', 2000, 'success');
            }
            
            return true;
        } catch (error) {
            console.error('❌ Errore durante il caricamento:', error);
            if (this.game.notifications) {
                this.game.notifications.add('❌ Errore caricamento', 3000, 'error');
            }
            return false;
        }
    }
    
    /**
     * Controlla se esiste un salvataggio con chiave specifica
     */
    hasSave(slotKey = 'main') {
        try {
            const resolvedKey = this.resolveSlotKey(slotKey);
            const saveData = localStorage.getItem(`mmorpg_save_${resolvedKey}`);
            return saveData !== null;
        } catch (error) {
            console.error('❌ Errore controllo salvataggio:', error);
            return false;
        }
    }

    /**
     * Ottiene i dati di un salvataggio specifico
     */
    getSaveData(slotKey = 'main') {
        try {
            const resolvedKey = this.resolveSlotKey(slotKey);
            const saveData = localStorage.getItem(`mmorpg_save_${resolvedKey}`);
            if (saveData) {
                return JSON.parse(saveData);
            }
            return null;
        } catch (error) {
            console.error('❌ Errore lettura dati salvataggio:', error);
            return null;
        }
    }

    /**
     * Elimina un salvataggio specifico
     */
    deleteSave(slotKey = 'main') {
        try {
            const resolvedKey = this.resolveSlotKey(slotKey);
            localStorage.removeItem(`mmorpg_save_${resolvedKey}`);
            console.log(`🗑️ Salvataggio ${resolvedKey} eliminato`);
            return true;
        } catch (error) {
            console.error('❌ Errore eliminazione salvataggio:', error);
            return false;
        }
    }

    /**
     * Raccoglie tutti i dati da salvare
     */
    collectSaveData() {
        const ship = this.game.ship;
        const world = this.game.world;
        const mapManager = this.game.mapManager;
        const auth = this.game?.authSystem;
        const currentUser = auth && auth.isLoggedIn ? auth.currentUser : null;
        
        return {
            version: this.saveVersion,
            timestamp: Date.now(),
            player: {
                // Identità
                userId: currentUser?.id || null,
                nickname: currentUser?.nickname || ship.playerName || null,
                // Dati nave
                x: ship.x,
                y: ship.y,
                hp: ship.hp,
                maxHP: ship.maxHP,
                shield: ship.shield,
                maxShield: ship.maxShield,
                level: ship.currentLevel,
                experience: ship.resources.experience,
                credits: ship.resources.credits,
                uridium: ship.resources.uridium,
                honor: ship.resources.honor,
                starEnergy: ship.resources.starEnergy,
                
                // Progressione
                streunerKilled: ship.streunerKilled,
                bonusBoxesCollected: ship.bonusBoxesCollected,
                
                // Equipaggiamento
                equippedLasers: { ...ship.equippedLasers },
                ammunition: { ...ship.ammunition },
                selectedLaser: ship.selectedLaser,
                selectedMissile: ship.selectedMissile,
                
                // Clan
                clan: { ...ship.clan },
                
                // Nome giocatore
                playerName: ship.playerName
            },
            world: {
                currentMap: mapManager ? mapManager.currentMap : 'x1',
                sector: world ? world.currentSector : null
            },
            settings: {
                audioEnabled: this.game.audioManager ? this.game.audioManager.enabled : true,
                masterVolume: this.game.audioManager ? this.game.audioManager.masterVolume : 0.7,
                musicVolume: this.game.audioManager ? this.game.audioManager.musicVolume : 0.3,
                sfxVolume: this.game.audioManager ? this.game.audioManager.sfxVolume : 0.8
            },
            quests: {
                activeQuests: this.game.questTracker ? this.game.questTracker.activeQuests : [],
                completedQuests: this.game.questTracker ? this.game.questTracker.completedQuests : []
            },
            inventory: {
                items: this.game.inventory ? this.game.inventory.items : [],
                equipment: this.game.inventory ? this.game.inventory.equipment : null
            },
            faction: this.game.factionSystem ? this.game.factionSystem.exportData() : null
        };
    }
    
    /**
     * Applica i dati caricati al gioco
     */
    applySaveData(saveData) {
        const ship = this.game.ship;
        const world = this.game.world;
        const mapManager = this.game.mapManager;
        
        // Ripristina dati giocatore
        if (saveData.player) {
            const player = saveData.player;
            
            // Se presente, sincronizza nickname con sistemi correlati
            if (player.nickname) {
                if (this.game.playerProfile && typeof this.game.playerProfile.setNickname === 'function') {
                    this.game.playerProfile.setNickname(player.nickname);
                }
                if (this.game.ship && typeof this.game.ship.setPlayerName === 'function') {
                    this.game.ship.setPlayerName(player.nickname);
                } else if (this.game.ship) {
                    this.game.ship.playerName = player.nickname;
                }
            }

            // Posizione
            ship.x = player.x || ship.x;
            ship.y = player.y || ship.y;
            
            // Salute
            ship.hp = player.hp || ship.hp;
            ship.maxHP = player.maxHP || ship.maxHP;
            ship.shield = player.shield || ship.shield;
            ship.maxShield = player.maxShield || ship.maxShield;
            
            // Livello ed esperienza
            ship.currentLevel = player.level || ship.currentLevel;
            ship.resources.experience = player.experience || ship.resources.experience;
            ship.resources.credits = player.credits || ship.resources.credits;
            ship.resources.uridium = player.uridium || ship.resources.uridium;
            ship.resources.honor = player.honor || ship.resources.honor;
            ship.resources.starEnergy = player.starEnergy || ship.resources.starEnergy;
            
            // Progressione
            ship.streunerKilled = player.streunerKilled || 0;
            ship.bonusBoxesCollected = player.bonusBoxesCollected || 0;
            
            // Equipaggiamento
            if (player.equippedLasers) {
                ship.equippedLasers = { ...player.equippedLasers };
            }
            if (player.ammunition) {
                ship.ammunition = { ...player.ammunition };
            }
            ship.selectedLaser = player.selectedLaser || ship.selectedLaser;
            ship.selectedMissile = player.selectedMissile || ship.selectedMissile;
            
            // Clan
            if (player.clan) {
                ship.clan = { ...player.clan };
            }
            
            // Nome giocatore
            ship.playerName = player.playerName || ship.playerName;
        }
        
        // Ripristina mondo
        if (saveData.world && mapManager) {
            mapManager.currentMap = saveData.world.currentMap || 'x1';
        }
        
        // Ripristina impostazioni
        if (saveData.settings && this.game.audioManager) {
            this.game.audioManager.enabled = saveData.settings.audioEnabled !== undefined ? saveData.settings.audioEnabled : true;
            this.game.audioManager.masterVolume = saveData.settings.masterVolume || 0.7;
            this.game.audioManager.musicVolume = saveData.settings.musicVolume || 0.3;
            this.game.audioManager.sfxVolume = saveData.settings.sfxVolume || 0.8;
        }
        
        // Ripristina quest
        if (saveData.quests && this.game.questTracker) {
            this.game.questTracker.activeQuests = saveData.quests.activeQuests || [];
            this.game.questTracker.completedQuests = saveData.quests.completedQuests || [];
        }
        
        // Ripristina inventario
        if (saveData.inventory && this.game.inventory) {
            this.game.inventory.items = saveData.inventory.items || [];
            if (saveData.inventory.equipment) {
                this.game.inventory.equipment = saveData.inventory.equipment;
            }
            // Assicurati che l'array UAV esista
            if (!this.game.inventory.equipment.uav) {
                this.game.inventory.equipment.uav = [];
            }
            // Sincronizza i droni runtime con l'inventario ripristinato
            if (this.game.droneManager && typeof this.game.droneManager.reloadDronesFromInventory === 'function') {
                this.game.droneManager.reloadDronesFromInventory();
                if (this.game.droneManager.repositionDrones) {
                    this.game.droneManager.repositionDrones();
                }
            }
        }
        
        // Ripristina fazione
        if (saveData.faction && this.game.factionSystem) {
            this.game.factionSystem.importData(saveData.faction);
        }
    }
    
    /**
     * Crea un backup del salvataggio
     */
    createBackup(saveData, slotKey = 'main') {
        try {
            const resolvedKey = this.resolveSlotKey(slotKey);
            const backupKey = `${this.saveKey}_${resolvedKey}_backup_${Date.now()}`;
            localStorage.setItem(backupKey, JSON.stringify(saveData));
            
            // Pulisci i backup vecchi
            this.cleanOldBackups(resolvedKey);
        } catch (error) {
            console.warn('⚠️ Impossibile creare backup:', error);
        }
    }
    
    /**
     * Pulisce i backup vecchi mantenendo solo gli ultimi N
     */
    cleanOldBackups(slotKey = 'main') {
        const resolvedKey = this.resolveSlotKey(slotKey);
        const backupKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`${this.saveKey}_${resolvedKey}_backup_`)) {
                backupKeys.push(key);
            }
        }
        
        // Ordina per timestamp (più recenti prima)
        backupKeys.sort((a, b) => {
            const timestampA = parseInt(a.split('_').pop());
            const timestampB = parseInt(b.split('_').pop());
            return timestampB - timestampA;
        });
        
        // Rimuovi i backup in eccesso
        for (let i = this.maxBackups; i < backupKeys.length; i++) {
            localStorage.removeItem(backupKeys[i]);
        }
    }
    
    /**
     * Avvia il salvataggio automatico
     */
    startAutoSave() {
        if (this.isAutoSaveEnabled) {
            setInterval(() => {
                this.save(this.resolveSlotKey());
            }, this.autoSaveInterval);
        }
    }
    
    /**
     * Configura il salvataggio prima della chiusura della pagina
     */
    setupBeforeUnload() {
        window.addEventListener('beforeunload', () => {
            this.save(this.resolveSlotKey());
        });
    }
    
    /**
     * Abilita/disabilita il salvataggio automatico
     */
    setAutoSave(enabled) {
        this.isAutoSaveEnabled = enabled;
    }
    
    
    
    /**
     * Elimina il salvataggio corrente
     */
    deleteSaveCurrent() {
        const resolvedKey = this.resolveSlotKey();
        this.deleteSave(resolvedKey);
        
        // Elimina anche i backup per questo slot
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`${this.saveKey}_${resolvedKey}_backup_`)) {
                localStorage.removeItem(key);
            }
        }
        
        console.log(`🗑️ Salvataggio ${resolvedKey} eliminato`);
        return true;
    }
    
    /**
     * Ottiene informazioni sui salvataggi disponibili
     */
    getSaveInfo(slotKey = 'main') {
        const resolvedKey = this.resolveSlotKey(slotKey);
        const saveDataString = localStorage.getItem(`mmorpg_save_${resolvedKey}`);
        if (!saveDataString) return null;
        
        try {
            const saveData = JSON.parse(saveDataString);
            return {
                version: saveData.version,
                timestamp: saveData.timestamp,
                playerLevel: saveData.player?.level || 1,
                playerName: saveData.player?.nickname || saveData.player?.playerName || 'Unknown',
                credits: saveData.player?.credits || 0,
                map: saveData.world?.currentMap || 'x1'
            };
        } catch (error) {
            return null;
        }
    }
}


