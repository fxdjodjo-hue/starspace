/**
 * Sistema di caricamento centralizzato per tutti gli asset
 * Gestisce immagini, audio, dati JSON e atlas
 */
export class AssetLoader {
    constructor() {
        this.assets = new Map();
        this.loadingPromises = new Map();
        this.loadedCount = 0;
        this.totalCount = 0;
        this.onProgress = null;
    }

    /**
     * Carica un'immagine
     * @param {string} key - Chiave identificativa
     * @param {string} src - Percorso dell'immagine
     * @returns {Promise<HTMLImageElement>}
     */
    async loadImage(key, src) {
        if (this.assets.has(key)) {
            return this.assets.get(key);
        }

        if (this.loadingPromises.has(key)) {
            return this.loadingPromises.get(key);
        }

        const promise = new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.assets.set(key, img);
                this.loadedCount++;
                this.updateProgress();
                resolve(img);
            };
            img.onerror = () => {
                console.error(`Failed to load image: ${src}`);
                reject(new Error(`Failed to load image: ${src}`));
            };
            img.src = src;
        });

        this.loadingPromises.set(key, promise);
        this.totalCount++;
        return promise;
    }

    /**
     * Carica un file audio
     * @param {string} key - Chiave identificativa
     * @param {string} src - Percorso del file audio
     * @returns {Promise<HTMLAudioElement>}
     */
    async loadAudio(key, src) {
        if (this.assets.has(key)) {
            return this.assets.get(key);
        }

        if (this.loadingPromises.has(key)) {
            return this.loadingPromises.get(key);
        }

        const promise = new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.oncanplaythrough = () => {
                this.assets.set(key, audio);
                this.loadedCount++;
                this.updateProgress();
                resolve(audio);
            };
            audio.onerror = () => {
                console.error(`Failed to load audio: ${src}`);
                reject(new Error(`Failed to load audio: ${src}`));
            };
            audio.src = src;
        });

        this.loadingPromises.set(key, promise);
        this.totalCount++;
        return promise;
    }

    /**
     * Carica un file JSON
     * @param {string} key - Chiave identificativa
     * @param {string} src - Percorso del file JSON
     * @returns {Promise<Object>}
     */
    async loadJSON(key, src) {
        if (this.assets.has(key)) {
            return this.assets.get(key);
        }

        if (this.loadingPromises.has(key)) {
            return this.loadingPromises.get(key);
        }

        const promise = fetch(src)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                this.assets.set(key, data);
                this.loadedCount++;
                this.updateProgress();
                return data;
            })
            .catch(error => {
                console.error(`Failed to load JSON: ${src}`, error);
                throw error;
            });

        this.loadingPromises.set(key, promise);
        this.totalCount++;
        return promise;
    }

    /**
     * Carica un atlas (immagine + JSON)
     * @param {string} key - Chiave identificativa
     * @param {string} imageSrc - Percorso dell'immagine
     * @param {string} jsonSrc - Percorso del file JSON
     * @returns {Promise<{image: HTMLImageElement, data: Object}>}
     */
    async loadAtlas(key, imageSrc, jsonSrc) {
        const imageKey = `${key}_image`;
        const jsonKey = `${key}_json`;

        const [image, data] = await Promise.all([
            this.loadImage(imageKey, imageSrc),
            this.loadJSON(jsonKey, jsonSrc)
        ]);

        const atlas = { image, data };
        this.assets.set(key, atlas);
        return atlas;
    }

    /**
     * Carica multiple immagini
     * @param {Object} images - Oggetto con chiavi e percorsi
     * @returns {Promise<Object>}
     */
    async loadImages(images) {
        const promises = Object.entries(images).map(([key, src]) => 
            this.loadImage(key, src)
        );
        await Promise.all(promises);
        return Object.fromEntries(
            Object.keys(images).map(key => [key, this.assets.get(key)])
        );
    }

    /**
     * Carica multiple audio
     * @param {Object} audioFiles - Oggetto con chiavi e percorsi
     * @returns {Promise<Object>}
     */
    async loadAudioFiles(audioFiles) {
        const promises = Object.entries(audioFiles).map(([key, src]) => 
            this.loadAudio(key, src)
        );
        await Promise.all(promises);
        return Object.fromEntries(
            Object.keys(audioFiles).map(key => [key, this.assets.get(key)])
        );
    }

    /**
     * Ottiene un asset caricato
     * @param {string} key - Chiave identificativa
     * @returns {*} L'asset richiesto
     */
    get(key) {
        return this.assets.get(key);
    }

    /**
     * Verifica se un asset è stato caricato
     * @param {string} key - Chiave identificativa
     * @returns {boolean}
     */
    has(key) {
        return this.assets.has(key);
    }

    /**
     * Pulisce tutti gli asset dalla memoria
     */
    clear() {
        this.assets.clear();
        this.loadingPromises.clear();
        this.loadedCount = 0;
        this.totalCount = 0;
    }

    /**
     * Imposta callback per il progresso di caricamento
     * @param {Function} callback - Funzione callback
     */
    setProgressCallback(callback) {
        this.onProgress = callback;
    }

    /**
     * Aggiorna il progresso di caricamento
     */
    updateProgress() {
        if (this.onProgress) {
            const progress = this.totalCount > 0 ? this.loadedCount / this.totalCount : 0;
            this.onProgress(progress, this.loadedCount, this.totalCount);
        }
    }

    /**
     * Ottiene il progresso di caricamento
     * @returns {Object} Oggetto con progresso, caricati e totali
     */
    getProgress() {
        return {
            progress: this.totalCount > 0 ? this.loadedCount / this.totalCount : 0,
            loaded: this.loadedCount,
            total: this.totalCount
        };
    }
}

// Istanza singleton
export const assetLoader = new AssetLoader();
