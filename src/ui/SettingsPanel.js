// Modulo Pannello Impostazioni
export class SettingsPanel {
    constructor(game) {
        this.game = game;
        this.isOpen = false;
        this.currentTab = 'audio'; // 'audio', 'graphics', 'controls'
        
        // Posizione e dimensioni
        this.x = 0;
        this.y = 0;
        this.width = 400;
        this.height = 350;
        
        // Controlli audio
        this.audioEnabled = true;
        this.masterVolume = 0.7;
        this.musicVolume = 0.3;
        this.sfxVolume = 0.8;

        
        // Drag degli slider
        this.draggingSlider = null; // 'master', 'music', 'sfx'
        this.dragStartX = 0;
        
        // Carica impostazioni salvate
        this.loadSettings();
    }
    
    // Carica impostazioni dal localStorage
    loadSettings() {
        const saved = localStorage.getItem('gameSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            this.audioEnabled = settings.audioEnabled !== undefined ? settings.audioEnabled : true;
            this.masterVolume = settings.masterVolume !== undefined ? settings.masterVolume : 0.7;
            this.musicVolume = settings.musicVolume !== undefined ? settings.musicVolume : 0.3;
            this.sfxVolume = settings.sfxVolume !== undefined ? settings.sfxVolume : 0.8;

        }
    }
    
    // Salva impostazioni nel localStorage
    saveSettings() {
        const settings = {
            audioEnabled: this.audioEnabled,
            masterVolume: this.masterVolume,
            musicVolume: this.musicVolume,
            sfxVolume: this.sfxVolume,

        };
        localStorage.setItem('gameSettings', JSON.stringify(settings));
    }
    
    // Apri/chiudi pannello
    toggle() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.centerPanel();
        }
    }
    
    // Centra il pannello
    centerPanel() {
        this.x = (this.game.width - this.width) / 2;
        this.y = (this.game.height - this.height) / 2;
    }
    
    // Disegna il tab grafica
    drawGraphicsTab(ctx) {
        const startY = this.y + 100;
        const labelX = this.x + 20;
        const buttonX = this.x + 200;
        
        // Toggle Schermo Intero
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Schermo Intero:', labelX, startY + 20);
        
        // Pulsante toggle (tema bianco e nero)
        const isFullscreen = document.fullscreenElement || 
                           document.webkitFullscreenElement || 
                           document.msFullscreenElement;
        
        ctx.fillStyle = isFullscreen ? '#ffffff' : '#333333';
        ctx.fillRect(buttonX, startY + 5, 80, 30);
        
        // Bordo pulsante
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(buttonX, startY + 5, 80, 30);
        
        ctx.fillStyle = isFullscreen ? '#000000' : '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(isFullscreen ? 'ON' : 'OFF', buttonX + 40, startY + 25);
    }
    
    // Gestisce i click
    handleClick(x, y) {
        if (!this.isOpen) return false;
        
        // Riproduci suono click solo per interfaccia
        if (this.game.audioManager) {
            this.game.audioManager.playClickSound();
        }
        
        // Controlla click su pulsante chiudi (X)
        const closeButtonX = this.x + this.width - 35;
        const closeButtonY = this.y + 10;
        if (x >= closeButtonX && x <= closeButtonX + 25 && 
            y >= closeButtonY && y <= closeButtonY + 25) {
            this.isOpen = false;
            return true;
        }
        
        // Controlla se il click è dentro il pannello
        if (x >= this.x && x <= this.x + this.width && 
            y >= this.y && y <= this.y + this.height) {
            
            // Gestisci click sui controlli
            this.handleControlClick(x, y);
            return true; // Click gestito
        }
        
        // Se click fuori dal pannello, chiudilo
        this.isOpen = false;
        return false;
    }
    
    // Gestisce click sui controlli
    handleControlClick(x, y) {
        const startY = this.y + 100;
        const sliderWidth = 200;
        const sliderX = this.x + 150;
        const tabY = this.y + 50;
        
        // Controlla click sui tab
        if (y >= tabY && y <= tabY + 30) {
            // Tab Audio
            if (x >= this.x + 20 && x <= this.x + 120) {
                this.currentTab = 'audio';
                return;
            }
            // Tab Grafica
            if (x >= this.x + 130 && x <= this.x + 230) {
                this.currentTab = 'graphics';
                return;
            }
        }
        
        // Tab Audio
        if (this.currentTab === 'audio') {
            // Toggle Audio (area del pulsante)
            if (x >= this.x + 20 && x <= this.x + 80 && 
                y >= startY + 25 && y <= startY + 50) {
                this.audioEnabled = !this.audioEnabled;
                this.applyAudioSettings();
                this.saveSettings();
                console.log('🔊 Audio toggled:', this.audioEnabled);
                return;
            }
            
            // Master Volume Slider
            if (x >= sliderX && x <= sliderX + sliderWidth && 
                y >= startY + 55 && y <= startY + 75) {
                this.draggingSlider = 'master';
                this.dragStartX = x;
                const newVolume = (x - sliderX) / sliderWidth;
                this.masterVolume = Math.max(0, Math.min(1, newVolume));
                this.applyAudioSettings();
                this.saveSettings();

                return;
            }
            
            // Music Volume Slider
            if (x >= sliderX && x <= sliderX + sliderWidth && 
                y >= startY + 105 && y <= startY + 125) {
                this.draggingSlider = 'music';
                this.dragStartX = x;
                const newVolume = (x - sliderX) / sliderWidth;
                this.musicVolume = Math.max(0, Math.min(1, newVolume));
                this.applyAudioSettings();
                this.saveSettings();

                return;
            }
            
            // SFX Volume Slider
            if (x >= sliderX && x <= sliderX + sliderWidth && 
                y >= startY + 155 && y <= startY + 175) {
                this.draggingSlider = 'sfx';
                this.dragStartX = x;
                const newVolume = (x - sliderX) / sliderWidth;
                this.sfxVolume = Math.max(0, Math.min(1, newVolume));
                this.applyAudioSettings();
                this.saveSettings();

                return;
            }
        }
        
        // Tab Grafica
        if (this.currentTab === 'graphics') {
            // Toggle Schermo Intero
            const buttonX = this.x + 200;
            if (x >= buttonX && x <= buttonX + 80 && 
                y >= startY + 5 && y <= startY + 35) {
                // Chiama la funzione toggle fullscreen
                if (window.toggleFullscreen) {
                    window.toggleFullscreen();
                }
                return;
            }
        }
    }
    
    // Gestisce il drag degli slider
    handleMouseMove(x, y) {
        if (!this.draggingSlider) return;
        
        const startY = this.y + 100;
        const sliderWidth = 200;
        const sliderX = this.x + 150;
        
        let newVolume = 0;
        let sliderY = 0;
        
        switch (this.draggingSlider) {
            case 'master':
                sliderY = startY + 65;
                newVolume = (x - sliderX) / sliderWidth;
                this.masterVolume = Math.max(0, Math.min(1, newVolume));
                break;
            case 'music':
                sliderY = startY + 115;
                newVolume = (x - sliderX) / sliderWidth;
                this.musicVolume = Math.max(0, Math.min(1, newVolume));
                break;
            case 'sfx':
                sliderY = startY + 165;
                newVolume = (x - sliderX) / sliderWidth;
                this.sfxVolume = Math.max(0, Math.min(1, newVolume));
                break;

        }
        
        this.applyAudioSettings();
        this.saveSettings();
    }
    
    // Ferma il drag
    stopDragging() {
        this.draggingSlider = null;
        this.dragStartX = 0;
    }
    
    // Applica le impostazioni audio
    applyAudioSettings() {
        if (this.game.audioManager) {
            this.game.audioManager.setEnabled(this.audioEnabled);
            this.game.audioManager.setMasterVolume(this.masterVolume);
            this.game.audioManager.setMusicVolume(this.musicVolume);
            this.game.audioManager.setSfxVolume(this.sfxVolume);

            
            // Gestisci la musica di sottofondo
            if (!this.audioEnabled) {
                // Se l'audio è disabilitato, ferma la musica
                this.game.audioManager.stopBackgroundMusic();

            } else {
                // Se l'audio è abilitato, riavvia la musica se non sta suonando
                if (!this.game.audioManager.musicPlaying) {
                    this.game.audioManager.startBackgroundMusic();

                }
            }
        }
    }
    
    // Disegna il pannello
    draw(ctx) {
        if (!this.isOpen) return;
        
        // Sfondo scuro semi-trasparente (ridotto per essere meno invasivo)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, this.game.width, this.game.height);
        
        // Pannello principale (tema bianco e nero)
        ctx.fillStyle = '#000000';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        this.roundRect(ctx, this.x, this.y, this.width, this.height, 10);
        ctx.fill();
        ctx.stroke();
        
        // Titolo (bianco su nero)
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Impostazioni', this.x + this.width/2, this.y + 35);
        
        // Tabs
        this.drawTabs(ctx);
        
        // Contenuto tab
        if (this.currentTab === 'audio') {
            this.drawAudioTab(ctx);
        } else if (this.currentTab === 'graphics') {
            this.drawGraphicsTab(ctx);
        }
        
        // Pulsante chiudi (tema bianco e nero)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + this.width - 35, this.y + 10, 25, 25);
        
        // Bordo pulsante
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x + this.width - 35, this.y + 10, 25, 25);
        
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('×', this.x + this.width - 22, this.y + 27);
    }
    
    // Disegna le tab
    drawTabs(ctx) {
        const tabWidth = 100;
        const tabHeight = 30;
        const tabY = this.y + 50;
        
        // Tab Audio (tema bianco e nero)
        ctx.fillStyle = this.currentTab === 'audio' ? '#ffffff' : '#333333';
        ctx.fillRect(this.x + 20, tabY, tabWidth, tabHeight);
        ctx.fillStyle = this.currentTab === 'audio' ? '#000000' : '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Audio', this.x + 20 + tabWidth/2, tabY + 20);
        
        // Tab Grafica (tema bianco e nero)
        ctx.fillStyle = this.currentTab === 'graphics' ? '#ffffff' : '#333333';
        ctx.fillRect(this.x + 130, tabY, tabWidth, tabHeight);
        ctx.fillStyle = this.currentTab === 'graphics' ? '#000000' : '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Grafica', this.x + 130 + tabWidth/2, tabY + 20);
    }
    
    // Disegna il tab audio
    drawAudioTab(ctx) {
        const startY = this.y + 100;
        const sliderWidth = 200;
        const sliderX = this.x + 150;
        const labelX = this.x + 20;
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        
        // Toggle Audio
        ctx.fillText('Audio Abilitato:', labelX, startY + 20);
        
        // Disegna il toggle come un pulsante più grande
        const toggleX = labelX;
        const toggleY = startY + 25;
        const toggleWidth = 60;
        const toggleHeight = 25;
        
        // Sfondo del toggle (tema bianco e nero)
        ctx.fillStyle = this.audioEnabled ? '#ffffff' : '#333333';
        this.roundRect(ctx, toggleX, toggleY, toggleWidth, toggleHeight, 12);
        ctx.fill();
        
        // Bordo del toggle
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        this.roundRect(ctx, toggleX, toggleY, toggleWidth, toggleHeight, 12);
        ctx.stroke();
        
        // Testo del toggle
        ctx.fillStyle = this.audioEnabled ? '#000000' : '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.audioEnabled ? 'ON' : 'OFF', toggleX + toggleWidth/2, toggleY + toggleHeight/2 + 4);
        
        // Ripristina allineamento
        ctx.textAlign = 'left';
        
        // Master Volume
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.fillText('Volume Principale:', labelX, startY + 80);
        this.drawSlider(ctx, sliderX, startY + 65, sliderWidth, this.masterVolume);
        ctx.fillText(Math.round(this.masterVolume * 100) + '%', sliderX + sliderWidth + 10, startY + 80);
        
        // Music Volume
        ctx.fillText('Volume Musica:', labelX, startY + 130);
        this.drawSlider(ctx, sliderX, startY + 115, sliderWidth, this.musicVolume);
        ctx.fillText(Math.round(this.musicVolume * 100) + '%', sliderX + sliderWidth + 10, startY + 130);
        
        // SFX Volume
        ctx.fillText('Volume Effetti:', labelX, startY + 180);
        this.drawSlider(ctx, sliderX, startY + 165, sliderWidth, this.sfxVolume);
        ctx.fillText(Math.round(this.sfxVolume * 100) + '%', sliderX + sliderWidth + 10, startY + 180);
        

    }
    
    // Disegna uno slider
    drawSlider(ctx, x, y, width, value) {
        const height = 12;
        const handleSize = 16;
        
        // Track (sfondo) - nero
        ctx.fillStyle = '#000000';
        this.roundRect(ctx, x, y, width, height, 6);
        ctx.fill();
        
        // Bordo track
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        this.roundRect(ctx, x, y, width, height, 6);
        ctx.stroke();
        
        // Fill (parte colorata) - bianco
        ctx.fillStyle = '#ffffff';
        this.roundRect(ctx, x, y, width * value, height, 6);
        ctx.fill();
        
        // Handle (maniglia)
        const handleX = x + (width * value) - (handleSize / 2);
        const handleY = y - 2;
        
        // Ombra del handle
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.roundRect(ctx, handleX + 1, handleY + 1, handleSize, handleSize, 8);
        ctx.fill();
        
        // Handle principale - bianco
        ctx.fillStyle = '#ffffff';
        this.roundRect(ctx, handleX, handleY, handleSize, handleSize, 8);
        ctx.fill();
        
        // Bordo del handle - nero
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        this.roundRect(ctx, handleX, handleY, handleSize, handleSize, 8);
        ctx.stroke();
    }
    
    // Utility per rettangoli arrotondati
    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
}
