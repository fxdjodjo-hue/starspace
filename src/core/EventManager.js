/**
 * Sistema di gestione eventi centralizzato
 * Gestisce la comunicazione tra i vari sistemi del gioco
 */
import { GAME_EVENTS } from '../utils/Constants.js';

export class EventManager {
    constructor() {
        this.listeners = new Map();
        this.onceListeners = new Map();
        this.eventHistory = [];
        this.maxHistorySize = 100;
    }

    /**
     * Aggiunge un listener per un evento
     * @param {string} eventName - Nome dell'evento
     * @param {Function} listener - Funzione listener
     * @param {Object} context - Contesto per il binding
     * @returns {Function} Funzione per rimuovere il listener
     */
    on(eventName, listener, context = null) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
        }

        const listenerData = {
            callback: listener,
            context: context,
            id: this.generateListenerId()
        };

        this.listeners.get(eventName).push(listenerData);

        // Restituisce una funzione per rimuovere il listener
        return () => this.off(eventName, listenerData.id);
    }

    /**
     * Aggiunge un listener che si esegue una sola volta
     * @param {string} eventName - Nome dell'evento
     * @param {Function} listener - Funzione listener
     * @param {Object} context - Contesto per il binding
     * @returns {Function} Funzione per rimuovere il listener
     */
    once(eventName, listener, context = null) {
        if (!this.onceListeners.has(eventName)) {
            this.onceListeners.set(eventName, []);
        }

        const listenerData = {
            callback: listener,
            context: context,
            id: this.generateListenerId()
        };

        this.onceListeners.get(eventName).push(listenerData);

        // Restituisce una funzione per rimuovere il listener
        return () => this.offOnce(eventName, listenerData.id);
    }

    /**
     * Rimuove un listener
     * @param {string} eventName - Nome dell'evento
     * @param {string|Function} listener - ID del listener o funzione
     */
    off(eventName, listener) {
        const listeners = this.listeners.get(eventName);
        if (!listeners) return;

        if (typeof listener === 'string') {
            // Rimuovi per ID
            const index = listeners.findIndex(l => l.id === listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        } else {
            // Rimuovi per funzione
            const index = listeners.findIndex(l => l.callback === listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }

        // Rimuovi la chiave se non ci sono più listener
        if (listeners.length === 0) {
            this.listeners.delete(eventName);
        }
    }

    /**
     * Rimuove un listener once
     * @param {string} eventName - Nome dell'evento
     * @param {string|Function} listener - ID del listener o funzione
     */
    offOnce(eventName, listener) {
        const listeners = this.onceListeners.get(eventName);
        if (!listeners) return;

        if (typeof listener === 'string') {
            // Rimuovi per ID
            const index = listeners.findIndex(l => l.id === listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        } else {
            // Rimuovi per funzione
            const index = listeners.findIndex(l => l.callback === listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }

        // Rimuovi la chiave se non ci sono più listener
        if (listeners.length === 0) {
            this.onceListeners.delete(eventName);
        }
    }

    /**
     * Emette un evento
     * @param {string} eventName - Nome dell'evento
     * @param {*} data - Dati dell'evento
     * @param {boolean} async - Se eseguire i listener in modo asincrono
     */
    emit(eventName, data = null, async = false) {
        // Aggiungi alla cronologia
        this.addToHistory(eventName, data);

        // Esegui listener normali
        const listeners = this.listeners.get(eventName) || [];
        this.executeListeners(listeners, data, async);

        // Esegui listener once
        const onceListeners = this.onceListeners.get(eventName) || [];
        if (onceListeners.length > 0) {
            this.executeListeners(onceListeners, data, async);
            // Rimuovi tutti i listener once per questo evento
            this.onceListeners.delete(eventName);
        }
    }

    /**
     * Esegue i listener
     * @param {Array} listeners - Array di listener
     * @param {*} data - Dati dell'evento
     * @param {boolean} async - Se eseguire in modo asincrono
     */
    executeListeners(listeners, data, async) {
        listeners.forEach(listenerData => {
            try {
                if (async) {
                    // Esegui in modo asincrono
                    setTimeout(() => {
                        if (listenerData.context) {
                            listenerData.callback.call(listenerData.context, data);
                        } else {
                            listenerData.callback(data);
                        }
                    }, 0);
                } else {
                    // Esegui in modo sincrono
                    if (listenerData.context) {
                        listenerData.callback.call(listenerData.context, data);
                    } else {
                        listenerData.callback(data);
                    }
                }
            } catch (error) {
                console.error(`Error in event listener for ${eventName}:`, error);
            }
        });
    }

    /**
     * Aggiunge un evento alla cronologia
     * @param {string} eventName - Nome dell'evento
     * @param {*} data - Dati dell'evento
     */
    addToHistory(eventName, data) {
        this.eventHistory.push({
            eventName,
            data,
            timestamp: Date.now()
        });

        // Mantieni solo gli ultimi eventi
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory.shift();
        }
    }

    /**
     * Genera un ID univoco per i listener
     * @returns {string} ID univoco
     */
    generateListenerId() {
        return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Rimuove tutti i listener per un evento
     * @param {string} eventName - Nome dell'evento
     */
    removeAllListeners(eventName) {
        this.listeners.delete(eventName);
        this.onceListeners.delete(eventName);
    }

    /**
     * Rimuove tutti i listener
     */
    removeAllListeners() {
        this.listeners.clear();
        this.onceListeners.clear();
    }

    /**
     * Ottiene il numero di listener per un evento
     * @param {string} eventName - Nome dell'evento
     * @returns {number} Numero di listener
     */
    getListenerCount(eventName) {
        const normalCount = this.listeners.get(eventName)?.length || 0;
        const onceCount = this.onceListeners.get(eventName)?.length || 0;
        return normalCount + onceCount;
    }

    /**
     * Ottiene la cronologia degli eventi
     * @param {number} limit - Limite di eventi da restituire
     * @returns {Array} Cronologia degli eventi
     */
    getEventHistory(limit = null) {
        if (limit) {
            return this.eventHistory.slice(-limit);
        }
        return [...this.eventHistory];
    }

    /**
     * Pulisce la cronologia degli eventi
     */
    clearHistory() {
        this.eventHistory = [];
    }

    /**
     * Ottiene le statistiche degli eventi
     * @returns {Object} Statistiche
     */
    getStats() {
        const totalListeners = Array.from(this.listeners.values())
            .reduce((sum, listeners) => sum + listeners.length, 0);
        const totalOnceListeners = Array.from(this.onceListeners.values())
            .reduce((sum, listeners) => sum + listeners.length, 0);

        return {
            totalListeners,
            totalOnceListeners,
            totalEvents: this.listeners.size + this.onceListeners.size,
            historySize: this.eventHistory.length,
            maxHistorySize: this.maxHistorySize
        };
    }

    /**
     * Pulisce tutte le risorse
     */
    cleanup() {
        this.removeAllListeners();
        this.clearHistory();
    }
}

// Istanza singleton
export const eventManager = new EventManager();
