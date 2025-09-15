/**
 * Core del gioco - Logica principale senza rendering
 * Gestisce lo stato del gioco, aggiornamenti e coordinamento dei sistemi
 */
import { GameConfig } from '../config/GameConfig.js';
import { GAME_EVENTS, GAME_STATES } from '../utils/Constants.js';

export class GameCore {
    constructor() {
        // Stato del gioco
        this.state = GAME_STATES.LOADING;
        this.isRunning = false;
        this.lastUpdateTime = 0;
        this.deltaTime = 0;
        
        // Configurazione
        this.config = GameConfig;
        
        // Sistemi del gioco (saranno inizializzati dal Game)
        this.systems = new Map();
        
        // Eventi
        this.eventListeners = new Map();
        
        // Performance
        this.frameCount = 0;
        this.fps = 0;
        this.lastFpsUpdate = 0;
    }

    /**
     * Registra un sistema nel core
     * @param {string} name - Nome del sistema
     * @param {Object} system - Istanza del sistema
     */
    registerSystem(name, system) {
        this.systems.set(name, system);
        
        // Collega il sistema al core se ha i metodi necessari
        if (system.setGameCore) {
            system.setGameCore(this);
        }
    }

    /**
     * Ottiene un sistema registrato
     * @param {string} name - Nome del sistema
     * @returns {Object|null} Sistema o null se non trovato
     */
    getSystem(name) {
        return this.systems.get(name) || null;
    }

    /**
     * Aggiorna il core del gioco
     * @param {number} currentTime - Tempo corrente
     */
    update(currentTime) {
        if (!this.isRunning || this.state === GAME_STATES.PAUSED) {
            return;
        }

        // Calcola delta time
        if (this.lastUpdateTime === 0) {
            this.lastUpdateTime = currentTime;
        }
        this.deltaTime = currentTime - this.lastUpdateTime;
        this.lastUpdateTime = currentTime;

        // Aggiorna FPS
        this.updateFPS(currentTime);

        // Aggiorna tutti i sistemi registrati
        this.updateSystems();

        // Incrementa frame count
        this.frameCount++;
    }

    /**
     * Aggiorna tutti i sistemi registrati
     */
    updateSystems() {
        for (const [name, system] of this.systems) {
            try {
                if (system.update && typeof system.update === 'function') {
                    system.update(this.deltaTime);
                }
            } catch (error) {
                console.error(`Error updating system ${name}:`, error);
            }
        }
    }

    /**
     * Aggiorna le statistiche FPS
     * @param {number} currentTime - Tempo corrente
     */
    updateFPS(currentTime) {
        if (currentTime - this.lastFpsUpdate >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = currentTime;
        }
    }

    /**
     * Avvia il gioco
     */
    start() {
        this.isRunning = true;
        this.state = GAME_STATES.PLAYING;
        this.emitEvent(GAME_EVENTS.GAME_START);
    }

    /**
     * Pausa il gioco
     */
    pause() {
        this.state = GAME_STATES.PAUSED;
        this.emitEvent(GAME_EVENTS.GAME_PAUSE);
    }

    /**
     * Riprendi il gioco
     */
    resume() {
        this.state = GAME_STATES.PLAYING;
        this.emitEvent(GAME_EVENTS.GAME_RESUME);
    }

    /**
     * Ferma il gioco
     */
    stop() {
        this.isRunning = false;
        this.state = GAME_STATES.MENU;
        this.emitEvent(GAME_EVENTS.GAME_END);
    }

    /**
     * Imposta lo stato del gioco
     * @param {string} newState - Nuovo stato
     */
    setState(newState) {
        const oldState = this.state;
        this.state = newState;
        this.emitEvent('game:state:change', { oldState, newState });
    }

    /**
     * Ottiene lo stato attuale
     * @returns {string} Stato attuale
     */
    getState() {
        return this.state;
    }

    /**
     * Verifica se il gioco è in esecuzione
     * @returns {boolean} True se in esecuzione
     */
    isGameRunning() {
        return this.isRunning && this.state === GAME_STATES.PLAYING;
    }

    /**
     * Emette un evento
     * @param {string} eventName - Nome dell'evento
     * @param {*} data - Dati dell'evento
     */
    emitEvent(eventName, data = null) {
        const listeners = this.eventListeners.get(eventName) || [];
        listeners.forEach(listener => {
            try {
                listener(data);
            } catch (error) {
                console.error(`Error in event listener for ${eventName}:`, error);
            }
        });
    }

    /**
     * Aggiunge un listener per un evento
     * @param {string} eventName - Nome dell'evento
     * @param {Function} listener - Funzione listener
     */
    on(eventName, listener) {
        if (!this.eventListeners.has(eventName)) {
            this.eventListeners.set(eventName, []);
        }
        this.eventListeners.get(eventName).push(listener);
    }

    /**
     * Rimuove un listener per un evento
     * @param {string} eventName - Nome dell'evento
     * @param {Function} listener - Funzione listener da rimuovere
     */
    off(eventName, listener) {
        const listeners = this.eventListeners.get(eventName);
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * Ottiene le statistiche di performance
     * @returns {Object} Statistiche
     */
    getPerformanceStats() {
        return {
            fps: this.fps,
            frameCount: this.frameCount,
            deltaTime: this.deltaTime,
            state: this.state,
            isRunning: this.isRunning
        };
    }

    /**
     * Pulisce le risorse del core
     */
    cleanup() {
        this.systems.clear();
        this.eventListeners.clear();
        this.isRunning = false;
        this.state = GAME_STATES.MENU;
    }
}
