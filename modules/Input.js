// Modulo Input
export class Input {
    constructor(canvas) {
        this.canvas = canvas;
        this.mouse = {
            x: 0,
            y: 0,
            isDown: false,
            leftClickJustPressed: false,
            leftClickJustReleased: false,
            rightClick: false,
            rightClickJustReleased: false,
            wheelDelta: 0
        };
        this.keys = {};
        this.ctrlPressed = false;
        this.ctrlJustPressed = false; // Flag per toggle del combattimento
        this.rPressed = false;
        this.rJustPressed = false; // Flag per toggle della riparazione
        this.sPressed = false;
        this.sJustPressed = false; // Flag per toggle della riparazione scudo
        this.dPressed = false;
        this.dJustPressed = false; // Flag per test morte player
        
        // Inizializza Set per i tasti appena premuti
        this.keysJustPressed = new Set();
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Click sinistro per muovere la nave
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Tasto sinistro
                this.mouse.isDown = true;
                this.mouse.leftClickJustPressed = true;
                this.updateMousePosition(e);
            }
        });
        
        // Click destro per la minimappa
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 2) { // Tasto destro
                this.mouse.rightClick = true;
                this.updateMousePosition(e);
            }
        });
        
        // Rilascio del click sinistro
        this.canvas.addEventListener('mouseup', (e) => {
            if (e.button === 0) {
                this.mouse.isDown = false;
                this.mouse.leftClickJustReleased = true;
            }
        });
        
        // Rilascio del click destro
        this.canvas.addEventListener('mouseup', (e) => {
            if (e.button === 2) {
                this.mouse.rightClick = false;
                this.mouse.rightClickJustReleased = true;
            }
        });
        
        // Movimento del mouse
        this.canvas.addEventListener('mousemove', (e) => {
            // Aggiorna la posizione solo se non è sopra la minimappa
            this.updateMousePosition(e);
        });
        
        // Rotella del mouse per zoom
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault(); // Previeni lo scroll della pagina
            this.mouse.wheelDelta = e.deltaY > 0 ? -1 : 1; // Inverti per zoom naturale
        });
        
        // Tastiera
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            this.keysJustPressed.add(e.code);
            
            // Gestisci CTRL per avviare combattimento
            if (e.code === 'ControlLeft' || e.code === 'ControlRight') {
                this.ctrlPressed = true;
                this.ctrlJustPressed = true; // Flag per toggle
            }
            
            // Gestisci R per riparazione
            if (e.code === 'KeyR') {
                this.rPressed = true;
                this.rJustPressed = true; // Flag per toggle
            }
            
            // Gestisci S per riparazione scudo
            if (e.code === 'KeyS') {
                this.sPressed = true;
                this.sJustPressed = true; // Flag per toggle
            }
            
            // Gestisci D per test morte player
            if (e.code === 'KeyD') {
                this.dPressed = true;
                this.dJustPressed = true; // Flag per toggle
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            
            // Gestisci rilascio R
            if (e.code === 'KeyR') {
                this.rPressed = false;
            }
            
            // Gestisci rilascio S
            if (e.code === 'KeyS') {
                this.sPressed = false;
            }
            
            // Gestisci rilascio D
            if (e.code === 'KeyD') {
                this.dPressed = false;
            }
        });
        
        // Previeni il menu contestuale del tasto destro
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    updateMousePosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        
        // Calcola le coordinate relative al canvas
        const canvasX = e.clientX - rect.left;
        const canvasY = e.clientY - rect.top;
        
        // Mouse libero di muoversi ovunque
        
        // Converti le coordinate del canvas in coordinate del mondo di gioco
        // Considerando il ridimensionamento e la posizione della camera
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        this.mouse.x = canvasX * scaleX;
        this.mouse.y = canvasY * scaleY;
        
        // Coordinate mouse scalate per il mondo di gioco
    }
    
    // Controlla se un tasto è premuto
    isKeyPressed(keyCode) {
        return this.keys[keyCode] || false;
    }
    
    // Controlla se il mouse è premuto
    isMouseDown() {
        return this.mouse.isDown;
    }
    
    // Ottieni posizione del mouse
    getMousePosition() {
        return { x: this.mouse.x, y: this.mouse.y };
    }
    
    // Controlla se il mouse si è mosso
    hasMouseMoved() {
        return this.mouse.isDown;
    }
    
    // Controlla se c'è stato un click recente (per gestire priorità)
    hasRecentClick() {
        return this.mouse.isDown;
    }
    
    // Controlla se è stato un click destro
    isRightClick() {
        return this.mouse.rightClick;
    }
    
    // Controlla se il click destro è appena stato rilasciato
    isRightClickJustReleased() {
        return this.mouse.rightClickJustReleased;
    }
    
    // Resetta il flag del click destro rilasciato
    resetRightClickReleased() {
        this.mouse.rightClickJustReleased = false;
    }
    
    // Controlla se il click sinistro è appena stato premuto
    isMouseJustPressed() {
        return this.mouse.leftClickJustPressed;
    }
    
    // Resetta il flag del click sinistro appena premuto
    resetMouseJustPressed() {
        this.mouse.leftClickJustPressed = false;
    }
    
    // Controlla se il click sinistro è appena stato rilasciato
    isLeftClickJustReleased() {
        return this.mouse.leftClickJustReleased;
    }
    
    // Resetta il flag del click sinistro rilasciato
    resetLeftClickReleased() {
        this.mouse.leftClickJustReleased = false;
    }
    
    // Controlla se CTRL è premuto
    isCtrlPressed() {
        return this.ctrlPressed;
    }
    
    isCtrlJustPressed() {
        return this.ctrlJustPressed;
    }
    
    resetCtrlJustPressed() {
        this.ctrlJustPressed = false;
    }
    
    // Controlla se R è premuto
    isRPressed() {
        return this.rPressed;
    }
    
    isRJustPressed() {
        return this.rJustPressed;
    }
    
    resetRJustPressed() {
        this.rJustPressed = false;
    }
    
    // Controlla se S è premuto
    isSPressed() {
        return this.sPressed;
    }
    
    isSJustPressed() {
        return this.sJustPressed;
    }
    
    resetSJustPressed() {
        this.sJustPressed = false;
    }
    
    // Controlla se D è premuto
    isDPressed() {
        return this.dPressed;
    }
    
    isDJustPressed() {
        return this.dJustPressed;
    }
    
    resetDJustPressed() {
        this.dJustPressed = false;
    }
    
    // Controlla se un tasto è stato appena premuto
    isKeyJustPressed(key) {
        return this.keysJustPressed.has(key);
    }
    
    // Reset di tutti i flag dei tasti appena premuti
    resetKeysJustPressed() {
        this.keysJustPressed.clear();
    }
    
    // Resetta il delta della rotella del mouse
    resetWheelDelta() {
        this.mouse.wheelDelta = 0;
    }
    
    // Controlla se c'è stato movimento della rotella
    hasWheelMovement() {
        return this.mouse.wheelDelta !== 0;
    }
    
    // Ottieni il delta della rotella
    getWheelDelta() {
        return this.mouse.wheelDelta;
    }
}
