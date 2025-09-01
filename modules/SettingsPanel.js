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
    
    // Gestisce i click
    handleClick(x, y) {
        if (!this.isOpen) return false;
        
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
        
        // Sfondo scuro semi-trasparente
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.game.width, this.game.height);
        
        // Pannello principale
        ctx.fillStyle = '#1a1a2e';
        ctx.strokeStyle = '#16213e';
        ctx.lineWidth = 2;
        this.roundRect(ctx, this.x, this.y, this.width, this.height, 10);
        ctx.fill();
        ctx.stroke();
        
        // Titolo
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Impostazioni', this.x + this.width/2, this.y + 35);
        
        // Tabs
        this.drawTabs(ctx);
        
        // Contenuto tab
        if (this.currentTab === 'audio') {
            this.drawAudioTab(ctx);
        }
        
        // Pulsante chiudi
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(this.x + this.width - 35, this.y + 10, 25, 25);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('×', this.x + this.width - 22, this.y + 27);
    }
    
    // Disegna le tab
    drawTabs(ctx) {
        const tabWidth = 100;
        const tabHeight = 30;
        const tabY = this.y + 50;
        
        // Tab Audio
        ctx.fillStyle = this.currentTab === 'audio' ? '#0f3460' : '#16213e';
        ctx.fillRect(this.x + 20, tabY, tabWidth, tabHeight);
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Audio', this.x + 20 + tabWidth/2, tabY + 20);
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
        
        // Sfondo del toggle
        ctx.fillStyle = this.audioEnabled ? '#44ff44' : '#ff4444';
        this.roundRect(ctx, toggleX, toggleY, toggleWidth, toggleHeight, 12);
        ctx.fill();
        
        // Testo del toggle
        ctx.fillStyle = '#ffffff';
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
        
        // Track (sfondo)
        ctx.fillStyle = '#333333';
        this.roundRect(ctx, x, y, width, height, 6);
        ctx.fill();
        
        // Fill (parte colorata)
        ctx.fillStyle = '#0f3460';
        this.roundRect(ctx, x, y, width * value, height, 6);
        ctx.fill();
        
        // Handle (maniglia)
        const handleX = x + (width * value) - (handleSize / 2);
        const handleY = y - 2;
        
        // Ombra del handle
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.roundRect(ctx, handleX + 1, handleY + 1, handleSize, handleSize, 8);
        ctx.fill();
        
        // Handle principale
        ctx.fillStyle = '#ffffff';
        this.roundRect(ctx, handleX, handleY, handleSize, handleSize, 8);
        ctx.fill();
        
        // Bordo del handle
        ctx.strokeStyle = '#0f3460';
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
