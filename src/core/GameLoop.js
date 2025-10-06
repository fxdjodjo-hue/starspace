/**
 * Game Loop principale
 * Gestisce il ciclo di aggiornamento e rendering del gioco
 */
import { GAME_EVENTS } from '../utils/Constants.js';

export class GameLoop {
    constructor(gameCore, renderer, game) {
        this.gameCore = gameCore;
        this.renderer = renderer;
        this.game = game;
        this.isRunning = false;
        this.animationFrameId = null;
        this.lastTime = 0;
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;
        this.lastFrameTime = 0;
        
        // Binding per il loop
        this.loop = this.loop.bind(this);
    }

    /**
     * Avvia il game loop
     */
    start() {
        if (this.isRunning) {
            return;
        }

        this.isRunning = true;
        this.lastTime = performance.now();
        this.lastFrameTime = this.lastTime;
        
        // Avvia il core del gioco
        this.gameCore.start();
        
        // Avvia il loop
        this.animationFrameId = requestAnimationFrame(this.loop);
    }

    /**
     * Ferma il game loop
     */
    stop() {
        if (!this.isRunning) {
            return;
        }

        this.isRunning = false;
        
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        // Ferma il core del gioco
        this.gameCore.stop();
    }

    /**
     * Pausa il game loop
     */
    pause() {
        this.gameCore.pause();
    }

    /**
     * Riprendi il game loop
     */
    resume() {
        this.gameCore.resume();
    }

    /**
     * Loop principale del gioco
     * @param {number} currentTime - Tempo corrente
     */
    loop(currentTime) {
        if (!this.isRunning) {
            return;
        }

        // Calcola il tempo trascorso dall'ultimo frame
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Controlla se è il momento di aggiornare (per limitare FPS)
        if (currentTime - this.lastFrameTime >= this.frameInterval) {
            // Gestione hotkeys per frame PRIMA che l'Input resetti i flag
            if (this.game && this.game.handleHotkeys) {
                this.game.handleHotkeys();
            }

            // Aggiorna il core del gioco
            this.gameCore.update(currentTime);
            
            // Renderizza il frame
            this.render(this.game);
            
            this.lastFrameTime = currentTime;
        }

        // Continua il loop
        this.animationFrameId = requestAnimationFrame(this.loop);
    }

    /**
     * Esegue il rendering del frame
     */
    render(game) {
        try {
            if (this.renderer && this.renderer.render) {
                this.renderer.render(game);
            }
        } catch (error) {
            console.error('Error during rendering:', error);
        }
    }

    /**
     * Imposta il target FPS
     * @param {number} fps - FPS target
     */
    setTargetFPS(fps) {
        this.targetFPS = Math.max(1, Math.min(120, fps));
        this.frameInterval = 1000 / this.targetFPS;
    }

    /**
     * Ottiene il target FPS
     * @returns {number} FPS target
     */
    getTargetFPS() {
        return this.targetFPS;
    }

    /**
     * Verifica se il loop è in esecuzione
     * @returns {boolean} True se in esecuzione
     */
    isLoopRunning() {
        return this.isRunning;
    }

    /**
     * Ottiene le statistiche del loop
     * @returns {Object} Statistiche
     */
    getStats() {
        const coreStats = this.gameCore.getPerformanceStats();
        return {
            ...coreStats,
            targetFPS: this.targetFPS,
            frameInterval: this.frameInterval,
            isLoopRunning: this.isRunning
        };
    }

    /**
     * Pulisce le risorse del loop
     */
    cleanup() {
        this.stop();
        this.gameCore = null;
        this.renderer = null;
    }
}
