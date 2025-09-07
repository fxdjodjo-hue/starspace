// Modulo Audio Manager per effetti sonori
export class AudioManager {
    constructor() {
        this.sounds = {};
        this.masterVolume = 0.7; // Volume principale
        this.musicVolume = 0.3; // Volume musica di sottofondo
        this.sfxVolume = 0.8; // Volume effetti sonori
        this.enabled = true;
        this.backgroundMusic = null;
        this.musicPlaying = false;
        this.engineAudio = null;
        this.enginePlaying = false;
        this.spaceStationAmbientAudio = null;
        this.fadeInterval = null;
        
        // Suono collecting dedicato per massima reattività
        this.collectingAudio = null;
        
        // Suoni portale dedicati per massima reattività
        this.portalJumpAudio = null;
        this.portalDoneAudio = null;
        

    }
    
    // Carica un suono
    loadSound(name, src) {
        const audio = new Audio(src);
        audio.preload = 'auto';
        audio.volume = this.masterVolume;
        this.sounds[name] = audio;
        
        audio.oncanplaythrough = () => {
            // Audio caricato
        };
        
        audio.onerror = (e) => {
            console.log(`🔇 Errore caricamento audio ${name}:`, e);
        };
    }
    
    // Riproduci un suono
    playSound(name, volume = 1.0) {
        if (!this.enabled || !this.sounds[name]) {
            console.log(`🔇 Suono ${name} non riprodotto - enabled:`, this.enabled, 'exists:', !!this.sounds[name]);
            return;
        }
        
        try {
            // Clona l'audio per permettere sovrapposizioni
            const audio = this.sounds[name].cloneNode();
            // Applica volume master e volume specifico per effetti sonori
            audio.volume = this.masterVolume * volume;
            audio.play().catch(e => {
                console.log(`🔇 Errore riproduzione audio ${name}:`, e);
            });
        } catch (error) {
            console.log(`🔇 Errore audio ${name}:`, error);
        }
    }
    
    // Riproduci suono laser
    playLaserSound() {
        this.playSound('laser', 0.8 * this.sfxVolume);
    }
    
    // Riproduci suono click UI
    playClickSound() {
        this.playSound('click', 0.6 * this.sfxVolume);
    }
    
    // Riproduci suono missile
    playMissileSound() {
        this.playSound('missile', 1.0 * this.sfxVolume);
    }
    
    // Riproduci suono esplosione
    playExplosionSound() {
        this.playSound('explosion', 0.9 * this.sfxVolume);
    }
    
    // Riproduci suono di morte del player
    playDeathSound() {
        this.playSound('death', 1.0 * this.sfxVolume);
    }
    
    // Riproduci suono smartbomb
    playSmartbombSound() {
        this.playSound('smartbomb', 1.2 * this.sfxVolume);
    }

    playFastRepairSound() {
        this.playSound('fastrepair', 1.0 * this.sfxVolume);
    }
    
    // Riproduci suono EMP
    playEMPSound() {
        this.playSound('emp', 1.0 * this.sfxVolume);
    }
    
    // Riproduci suono teletrasporto
    playTeleportSound() {
        this.playSound('teleport', 1.0 * this.sfxVolume);
    }
    
    // Riproduci suono salto portale
    playPortalJumpSound() {
        if (!this.enabled) return;
        
        // Usa suono dedicato per massima reattività
        if (!this.portalJumpAudio && this.sounds.portalJump) {
            this.portalJumpAudio = this.sounds.portalJump.cloneNode();
            this.portalJumpAudio.preload = 'auto';
            this.portalJumpAudio.load();
        }
        
        if (this.portalJumpAudio) {
            this.portalJumpAudio.currentTime = 0; // Reset al inizio
            this.portalJumpAudio.volume = this.masterVolume * this.sfxVolume;
            this.portalJumpAudio.play().catch(e => console.log('Errore riproduzione portalJump:', e));
        }
    }
    
    // Riproduci suono arrivo portale
    playPortalDoneSound() {
        if (!this.enabled) return;
        
        // Usa suono dedicato per massima reattività
        if (!this.portalDoneAudio && this.sounds.portalDone) {
            this.portalDoneAudio = this.sounds.portalDone.cloneNode();
            this.portalDoneAudio.preload = 'auto';
            this.portalDoneAudio.load();
        }
        
        if (this.portalDoneAudio) {
            this.portalDoneAudio.currentTime = 0; // Reset al inizio
            this.portalDoneAudio.volume = this.masterVolume * this.sfxVolume;
            this.portalDoneAudio.play().catch(e => console.log('Errore riproduzione portalDone:', e));
        }
    }
    
    // Avvia il suono del motore
    startEngineSound() {
        if (!this.enabled || !this.sounds['engine']) return;
        
        // Se il motore non sta già suonando, avvialo
        if (!this.enginePlaying) {
            // Crea l'audio del motore solo una volta
            if (!this.engineAudio) {
                this.engineAudio = this.sounds['engine'].cloneNode();
                this.engineAudio.loop = true; // Loop continuo
            }
            
            this.engineAudio.volume = this.masterVolume * this.sfxVolume * 0.3; // Volume diretto
            this.engineAudio.currentTime = 0; // Reset al inizio
            this.engineAudio.play().catch(e => {
                console.log('🔇 Errore avvio motore:', e);
            });
            this.enginePlaying = true;
        }
    }
    
    // Ferma il suono del motore
    stopEngineSound() {
        if (this.engineAudio && this.enginePlaying) {
            // Ferma immediatamente il motore
            this.engineAudio.pause();
            this.enginePlaying = false;
        }
    }
    
    
    // Riproduci suono apertura pannello stazione
    playStationPanelOpenSound() {
        this.playSound('stationpanel_open', 0.8 * this.sfxVolume);
    }
    
    // Avvia suono ambientale stazione spaziale
    startSpaceStationAmbientSound() {
        if (!this.enabled || !this.sounds['spacestation_ambient'] || this.spaceStationAmbientAudio) return;
        
        // Ferma eventuali fade in corso
        if (this.fadeInterval) {
            clearInterval(this.fadeInterval);
        }
        
        // Avvia il suono della stazione a volume 0
        this.spaceStationAmbientAudio = this.sounds['spacestation_ambient'].cloneNode();
        this.spaceStationAmbientAudio.loop = true;
        this.spaceStationAmbientAudio.volume = 0;
        this.spaceStationAmbientAudio.play().catch(e => {
            console.log('🔇 Errore riproduzione suono ambientale stazione:', e);
        });
        
        // Fade in del suono della stazione
        this.fadeInSpaceStationSound();
        
        console.log('🏭 Suono ambientale stazione avviato (con fade in)');
    }
    
    // Ferma suono ambientale stazione spaziale
    stopSpaceStationAmbientSound() {
        if (this.spaceStationAmbientAudio) {
            // Ferma eventuali fade in corso
            if (this.fadeInterval) {
                clearInterval(this.fadeInterval);
                this.fadeInterval = null;
            }
            
            // Ferma immediatamente il suono della stazione
            this.spaceStationAmbientAudio.pause();
            this.spaceStationAmbientAudio.currentTime = 0;
            this.spaceStationAmbientAudio = null;
            
            console.log('🔇 Suono ambientale stazione fermato immediatamente');
        }
    }
    
    // Fade in del suono della stazione
    fadeInSpaceStationSound() {
        const targetVolume = this.masterVolume * this.sfxVolume * 0.3;
        const fadeSteps = 60; // 60 step per 3 secondi
        const stepTime = 50; // 50ms per step
        let currentStep = 0;
        
        this.fadeInterval = setInterval(() => {
            currentStep++;
            const progress = currentStep / fadeSteps;
            
            // Fade in graduale
            if (this.spaceStationAmbientAudio) {
                this.spaceStationAmbientAudio.volume = targetVolume * progress;
            }
            
            if (currentStep >= fadeSteps) {
                clearInterval(this.fadeInterval);
                console.log('🎵 Fade in stazione completato');
            }
        }, stepTime);
    }
    

    
    // Riproduci suono di avvio sistema
    playSystemReadySound() {
        this.playSound('system_ready', 1.0 * this.sfxVolume);
    }
    
    // Riproduci suono raccolta bonus box
    playCollectingSound() {
        if (!this.enabled) return;
        
        // Usa suono dedicato per massima reattività
        if (!this.collectingAudio && this.sounds.collecting) {
            this.collectingAudio = this.sounds.collecting.cloneNode();
            this.collectingAudio.preload = 'auto';
            this.collectingAudio.load();
        }
        
        if (this.collectingAudio) {
            this.collectingAudio.currentTime = 0; // Reset al inizio
            this.collectingAudio.volume = 1.0 * this.sfxVolume;
            this.collectingAudio.play().catch(e => console.log('Errore riproduzione collecting:', e));
        }
    }
    
    // Imposta volume principale
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        // Aggiorna volume della musica di sottofondo
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.masterVolume * this.musicVolume;
        }
        
        // Aggiorna volume del motore
        if (this.engineAudio) {
            this.engineAudio.volume = this.masterVolume * this.sfxVolume * 0.3;
        }
        
        // Aggiorna volume del suono collecting se attivo
        if (this.collectingAudio) {
            this.collectingAudio.volume = this.masterVolume * this.sfxVolume;
        }
        
        // Aggiorna volume dei suoni portale se attivi
        if (this.portalJumpAudio) {
            this.portalJumpAudio.volume = this.masterVolume * this.sfxVolume;
        }
        if (this.portalDoneAudio) {
            this.portalDoneAudio.volume = this.masterVolume * this.sfxVolume;
        }
        
        // Aggiorna volume del suono ambientale della stazione
        if (this.spaceStationAmbientAudio) {
            this.spaceStationAmbientAudio.volume = this.masterVolume * this.sfxVolume * 0.3;
        }

    }
    
    // Abilita/disabilita audio
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.forceStopAllEngineSounds();
            this.stopBackgroundMusic();
        } else {
            // Se l'audio viene riabilitato, riavvia la musica se non sta suonando
            if (!this.musicPlaying) {
                this.startBackgroundMusic();
            }
        }
    }
    
    // Carica tutti i suoni
    loadAllSounds() {
        // Carica i suoni con i file forniti dall'utente
        this.loadSound('laser', 'sounds/laser_1.wav');
        this.loadSound('missile', 'sounds/rocket_1.wav');
        this.loadSound('explosion', 'sounds/explosion.mp3'); // File fornito dall'utente
        this.loadSound('death', 'sounds/death.mp3'); // Suono di morte del player
        this.loadSound('engine', 'sounds/engine.mp3'); // Suono del motore
        this.loadSound('stationpanel_open', 'sounds/stationpanel_open.mp3'); // Suono apertura pannello stazione
        this.loadSound('spacestation_ambient', 'sounds/spacestationsounds.mp3'); // Suono ambientale stazione spaziale
        this.loadSound('system_ready', 'sounds/system_ready.mp3'); // Suono di avvio sistema
        this.loadSound('collecting', 'sounds/collecting.mp3'); // Suono raccolta bonus box
        this.loadSound('click', 'click.mp3'); // Suono click UI
        this.loadSound('smartbomb', 'skills/smartbomb/weird-space-sound-03-344943.mp3');
        this.loadSound('fastrepair', 'skills/fastrepair/fastrepair.mp3'); // Suono FastRepair
        this.loadSound('emp', 'skills/emp/emp.mp3'); // Suono EMP
        this.loadSound('teleport', 'ZetaGate/tpsounds/portalSounds.mp3'); // Suono teletrasporto
        this.loadSound('portalJump', 'ZetaGate/tpsounds/2_portalJump0.mp3'); // Suono salto portale
        this.loadSound('portalDone', 'ZetaGate/tpsounds/1_portalDone.mp3'); // Suono arrivo portale
        
        // Pre-carica aggressivamente i suoni critici per evitare ritardi
        if (this.sounds.collecting) {
            this.sounds.collecting.preload = 'auto';
            this.sounds.collecting.load();
        }
        
        // Pre-carica i suoni del portale per massima reattività
        if (this.sounds.portalJump) {
            this.sounds.portalJump.preload = 'auto';
            this.sounds.portalJump.load();
        }
        if (this.sounds.portalDone) {
            this.sounds.portalDone.preload = 'auto';
            this.sounds.portalDone.load();
        }

        
        // Carica la musica di sottofondo
        this.loadBackgroundMusic();
        


    }
    
    // Carica la musica di sottofondo
    loadBackgroundMusic() {
        this.backgroundMusic = new Audio(`sounds/background-music.mp3?v=${Date.now()}`);
        this.backgroundMusic.preload = 'auto';
        this.backgroundMusic.volume = this.masterVolume * this.musicVolume;
        this.backgroundMusic.loop = true; // Riproduci in loop
        
        this.backgroundMusic.oncanplaythrough = () => {
            console.log('🎵 Musica di sottofondo caricata!');
        };
        
        this.backgroundMusic.onerror = (e) => {
            console.log('🔇 Errore caricamento musica:', e);
        };
    }
    
    // Avvia la musica di sottofondo
    startBackgroundMusic() {
        if (!this.enabled || !this.backgroundMusic || this.musicPlaying) {
            console.log('🔇 Musica non avviata - enabled:', this.enabled, 'music:', !!this.backgroundMusic, 'playing:', this.musicPlaying);
            return;
        }
        
        try {
            this.backgroundMusic.currentTime = 0; // Ricomincia dall'inizio
            this.backgroundMusic.play().then(() => {
                this.musicPlaying = true;
                console.log('🎵 Musica di sottofondo avviata!');
            }).catch(e => {
                console.log('🔇 Errore avvio musica:', e);
            });
        } catch (error) {
            console.log('🔇 Errore musica:', error);
        }
    }
    
    // Ferma la musica di sottofondo
    stopBackgroundMusic() {
        if (this.backgroundMusic && this.musicPlaying) {
            this.backgroundMusic.pause();
            this.musicPlaying = false;
            console.log('🔇 Musica di sottofondo fermata!');
        }
    }
    
    // Imposta volume musica
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.musicVolume;
        }
    }
    
    // Imposta volume effetti sonori
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        
        // Aggiorna volume del motore
        if (this.engineAudio) {
            this.engineAudio.volume = this.masterVolume * this.sfxVolume * 0.3;
        }
        
        // Aggiorna volume del suono collecting se attivo
        if (this.collectingAudio) {
            this.collectingAudio.volume = this.masterVolume * this.sfxVolume;
        }
        
        // Aggiorna volume dei suoni portale se attivi
        if (this.portalJumpAudio) {
            this.portalJumpAudio.volume = this.masterVolume * this.sfxVolume;
        }
        if (this.portalDoneAudio) {
            this.portalDoneAudio.volume = this.masterVolume * this.sfxVolume;
        }
        
        // Aggiorna volume del suono ambientale della stazione
        if (this.spaceStationAmbientAudio) {
            this.spaceStationAmbientAudio.volume = this.masterVolume * this.sfxVolume * 0.3;
        }
    }
    

    

    
    // Cleanup completo dell'audio
    cleanup() {
        this.stopBackgroundMusic();
        this.stopSpaceStationAmbientSound();
        
        // Ferma il motore
        if (this.engineAudio) {
            this.engineAudio.pause();
            this.engineAudio.currentTime = 0;
            this.engineAudio = null;
        }
        this.enginePlaying = false;
        
        // Ferma eventuali fade in corso
        if (this.fadeInterval) {
            clearInterval(this.fadeInterval);
            this.fadeInterval = null;
        }
        
        // Pulisci tutti i suoni
        Object.values(this.sounds).forEach(audio => {
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
        });
    }
    


}
