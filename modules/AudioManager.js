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
        

    }
    
    // Carica un suono
    loadSound(name, src) {
        const audio = new Audio(src);
        audio.preload = 'auto';
        audio.volume = this.masterVolume;
        this.sounds[name] = audio;
        
        audio.oncanplaythrough = () => {
            console.log(`🔊 Audio caricato: ${name}`);
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
    
    // Riproduci suono missile
    playMissileSound() {
        this.playSound('missile', 1.0 * this.sfxVolume);
    }
    
    // Riproduci suono esplosione
    playExplosionSound() {
        this.playSound('explosion', 0.9 * this.sfxVolume);
    }
    
    // Imposta volume principale
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        // Aggiorna volume della musica di sottofondo
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.masterVolume * this.musicVolume;
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

        
        // Carica la musica di sottofondo
        this.loadBackgroundMusic();
        
        console.log('🔊 Audio Manager inizializzato con i tuoi file audio!');

    }
    
    // Carica la musica di sottofondo
    loadBackgroundMusic() {
        this.backgroundMusic = new Audio('sounds/background-music.mp3');
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
    }
    

    

    
    // Cleanup completo dell'audio
    cleanup() {
        this.stopBackgroundMusic();
        // Pulisci tutti i suoni
        Object.values(this.sounds).forEach(audio => {
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
        });
    }
    


}
