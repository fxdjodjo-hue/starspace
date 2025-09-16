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
            wheelDelta: 0,
            startX: 0,
            startY: 0,
            movementDistance: 0
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
        
        // Flags per cambio nave
        this.key1Pressed = false;
        this.key1JustPressed = false;
        this.key2Pressed = false;
        this.key2JustPressed = false;
        
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
                
                // Salva la posizione iniziale del click PRIMA di aggiornare la posizione del mouse
                const rect = this.canvas.getBoundingClientRect();
                const canvasX = e.clientX - rect.left;
                const canvasY = e.clientY - rect.top;
                const scaleX = this.canvas.width / rect.width;
                const scaleY = this.canvas.height / rect.height;
                
                this.mouse.startX = canvasX * scaleX;
                this.mouse.startY = canvasY * scaleY;
                this.mouse.movementDistance = 0;
                
                // Aggiorna la posizione attuale del mouse
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
                // Mantieni la distanza del movimento per il controllo isEffectiveClick
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
            console.log('🔑 Input.js keydown event:', e.code, e.key);
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
            
            // Gestisci tasti speciali per StartScreen
            if (e.code === 'Enter') {
                this.keys['Enter'] = true;
                this.keysJustPressed.add('Enter');
            }
            if (e.code === 'Backspace') {
                this.keys['Backspace'] = true;
                this.keysJustPressed.add('Backspace');
            }
            if (e.code === 'Space') {
                this.keys['Space'] = true;
                this.keysJustPressed.add('Space');
            }

            // Gestisci tasto 1 per nave base
            if (e.code === 'Digit1') {
                this.key1Pressed = true;
                this.key1JustPressed = true;
            }

            // Gestisci tasto 2 per nave Urus
            if (e.code === 'Digit2') {
                this.key2Pressed = true;
                this.key2JustPressed = true;
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
            
            // Gestisci rilascio tasti speciali per StartScreen
            if (e.code === 'Enter') {
                this.keys['Enter'] = false;
            }
            if (e.code === 'Backspace') {
                this.keys['Backspace'] = false;
            }
            if (e.code === 'Space') {
                this.keys['Space'] = false;
            }

            // Gestisci rilascio tasto 1
            if (e.code === 'Digit1') {
                this.key1Pressed = false;
            }

            // Gestisci rilascio tasto 2
            if (e.code === 'Digit2') {
                this.key2Pressed = false;
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
        
        // Calcola la distanza del movimento se il mouse è premuto
        if (this.mouse.isDown) {
            const dx = this.mouse.x - this.mouse.startX;
            const dy = this.mouse.y - this.mouse.startY;
            this.mouse.movementDistance = Math.sqrt(dx * dx + dy * dy);
        }
        
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
        this.mouse.movementDistance = 0;
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

    // Metodi per il tasto 1
    isKey1JustPressed() {
        return this.key1JustPressed;
    }

    resetKey1JustPressed() {
        this.key1JustPressed = false;
    }

    // Metodi per il tasto 2
    isKey2JustPressed() {
        return this.key2JustPressed;
    }

    resetKey2JustPressed() {
        this.key2JustPressed = false;
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
    
    // Controlla se il click è effettivo (non un drag)
    isEffectiveClick() {
        // Se il mouse non si è mosso molto dal click iniziale, è un click effettivo
        // Questo aiuta a distinguere tra click e drag
        return !this.hasMouseMoved() || this.mouse.movementDistance < 5;
    }
    
    // Ottiene tutte le chiavi attualmente premute
    getPressedKeys() {
        const pressedKeys = Object.keys(this.keys).filter(key => this.keys[key]);
        if (pressedKeys.length > 0) {
            console.log('🔑 Input.js getPressedKeys:', pressedKeys);
        }
        return pressedKeys;
    }
    
    // Resetta una chiave specifica
    resetKey(key) {
        if (this.keys[key]) {
            this.keys[key] = false;
        }
    }
    
    // Controlla se un tasto specifico è stato appena premuto
    isKeyJustPressed(key) {
        return this.keysJustPressed.has(key);
    }
    
    // Resetta un tasto specifico
    resetKeyJustPressed(key) {
        this.keysJustPressed.delete(key);
    }
    
    // Aggiorna l'input (da chiamare ogni frame)
    update() {
        // Resetta i flag "just" per il mouse
        this.mouse.leftClickJustPressed = false;
        this.mouse.leftClickJustReleased = false;
        this.mouse.rightClickJustReleased = false;
        this.mouse.wheelDelta = 0;
        
        // Resetta i flag "just" per i tasti speciali
        this.ctrlJustPressed = false;
        this.rJustPressed = false;
        this.sJustPressed = false;
        this.dJustPressed = false;
        this.key1JustPressed = false;
        this.key2JustPressed = false;
        
        // Resetta il Set dei tasti appena premuti
        this.keysJustPressed.clear();
    }
}
