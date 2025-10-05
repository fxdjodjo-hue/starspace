// Schermata di selezione fazione
export class FactionSelectionScreen {
    constructor(game) {
        console.log('🏗️ FactionSelectionScreen constructor');
        this.game = game;
        this.isVisible = false;
        
        // Inizializza posizioni
        this.updatePositions();
        
        // Animazioni
        this.animationTime = 0;
        this.stars = this.generateStars(80);
        
        // Fazioni
        this.factions = [
            {
                id: 'venus',
                name: 'VENUS',
                fullName: 'Venus Research Union',
                description: 'Scienziati all\'avanguardia',
                color: '#9b59b6',
                icon: '🔬',
                longDescription: [
                    'La Venus Research Union è all\'avanguardia nella ricerca scientifica e tecnologica.',
                    'Specializzati in tecnologie avanzate di propulsione e scudi energetici.',
                    'Bonus: +15% efficienza scudi, accesso a tecnologie sperimentali.',
                    'Ideali per giocatori che preferiscono un approccio tecnico e strategico.'
                ]
            },
            {
                id: 'mars',
                name: 'MARS',
                fullName: 'Mars Mining Organization',
                description: 'Minatori esperti',
                color: '#e74c3c',
                icon: '⛏️',
                longDescription: [
                    'La Mars Mining Organization domina l\'estrazione e la lavorazione delle risorse.',
                    'Esperti nell\'uso di laser pesanti e tecnologie minerarie avanzate.',
                    'Bonus: +20% danni laser, raccolta risorse potenziata.',
                    'Perfetti per giocatori aggressivi che amano il combattimento diretto.'
                ]
            },
            {
                id: 'eic',
                name: 'EIC',
                fullName: 'Earth Industries Corporation',
                description: 'Commercianti esperti',
                color: '#4a90e2',
                icon: '🏢',
                longDescription: [
                    'La Earth Industries Corporation controlla le rotte commerciali della Terra.',
                    'Maestri nel commercio e nella diplomazia interplanetaria.',
                    'Bonus: +25% guadagni commerciali, prezzi migliori nei negozi.',
                    'Ottimi per giocatori che puntano sull\'economia e il commercio.'
                ]
            }
        ];
        
        this.selectedFaction = null;
        this.errorMessage = '';
        this.successMessage = '';
        
        // Tracking dimensioni canvas
        this.lastCanvasWidth = this.game.canvas.width;
        this.lastCanvasHeight = this.game.canvas.height;
    }
    
    // Genera stelle per lo sfondo
    generateStars(count) {
        const stars = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * this.game.canvas.width,
                y: Math.random() * this.game.canvas.height,
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.8 + 0.2,
                twinkleSpeed: Math.random() * 0.02 + 0.01
            });
        }
        return stars;
    }
    
    // Aggiorna le posizioni degli elementi
    updatePositions() {
        // Dimensioni responsive
        this.width = Math.min(800, this.game.canvas.width * 0.7);
        this.height = Math.min(600, this.game.canvas.height * 0.7);
        this.x = Math.round((this.game.canvas.width - this.width) / 2);
        this.y = Math.round((this.game.canvas.height - this.height) / 2);
        
        // Pulsante conferma
        this.confirmButton = {
            width: 200,
            height: 50,
            text: 'CONFERMA SCELTA'
        };
        // Posiziona il pulsante conferma sotto le carte
        this.confirmButton.x = Math.round(this.x + (this.width - this.confirmButton.width) / 2);
        this.confirmButton.y = Math.round(this.y + 180 + 120 + 40); // startY + cardHeight + spacing
        
        // Rigenera stelle
        this.stars = this.generateStars(80);
    }
    
    // Mostra la schermata
    show() {
        console.log('🎯 FactionSelectionScreen - showing');
        this.isVisible = true;
        this.updatePositions();
    }
    
    // Nasconde la schermata
    hide() {
        console.log('🎯 FactionSelectionScreen - hiding');
        this.isVisible = false;
    }
    
    // Aggiorna la schermata
    update(deltaTime) {
        if (!this.isVisible) return;
        
        this.animationTime += deltaTime;
        
        // Aggiorna stelle
        this.stars.forEach(star => {
            star.opacity += Math.sin(this.animationTime * star.twinkleSpeed) * 0.1;
            star.opacity = Math.max(0.2, Math.min(1.0, star.opacity));
        });
        
        // Controlla ridimensionamento canvas
        if (this.game.canvas.width !== this.lastCanvasWidth || 
            this.game.canvas.height !== this.lastCanvasHeight) {
            this.updatePositions();
            this.lastCanvasWidth = this.game.canvas.width;
            this.lastCanvasHeight = this.game.canvas.height;
        }
    }
    
    // Gestisce input da tastiera
    handleKeyPress(key) {
        if (!this.isVisible) return false;
        
        // ESC per tornare indietro
        if (key === 'Escape') {
            this.hide();
            this.game.startScreen.show();
            return true;
        }
        
        return false;
    }
    
    // Gestisce click del mouse
    handleClick(x, y) {
        if (!this.isVisible) return false;
        
        // Click su fazioni (solo selezione, niente conferma automatica)
        const cardWidth = 180;
        const cardHeight = 100;
        const cardSpacing = 20;
        const totalWidth = (cardWidth * this.factions.length) + (cardSpacing * (this.factions.length - 1));
        const startX = Math.round(this.x + (this.width - totalWidth) / 2);
        const startY = Math.round(this.y + 180);

        for (let index = 0; index < this.factions.length; index++) {
            const faction = this.factions[index];
            const cardX = startX + index * (cardWidth + cardSpacing);
            const cardY = startY;
            if (x >= cardX && x <= cardX + cardWidth && y >= cardY && y <= cardY + cardHeight) {
                this.selectedFaction = faction.id;
                this.errorMessage = '';
                return true; // esci subito: niente altro click processing
            }
        }
        
        // Click su pulsante conferma
        if (this.isMouseOverButton(this.confirmButton, x, y)) {
            this.handleConfirmSelection();
            return true;
        }
        
        return false;
    }
    
    // Gestisce conferma selezione
    handleConfirmSelection() {
        if (!this.selectedFaction) {
            this.showError('Seleziona una fazione');
            return;
        }
        
        // Ottieni l'accountId corrente
        const accountId = this.game.currentAccountId || this.game.startScreen.currentAccountId;
        if (!accountId) {
            this.showError('Errore: Account non trovato');
            return;
        }
        
        // Imposta fazione nel gioco
        this.game.factionSystem.joinFaction(this.selectedFaction);
        
        // Imposta mappa iniziale
        const startingMaps = {
            'venus': 'v1',
            'mars': 'm1',
            'eic': 'e1'
        };
        
        this.game.mapManager.currentMap = startingMaps[this.selectedFaction] || 'v1';
        this.game.mapManager.loadCurrentMapInstance();
        
        // Reset inventario e stato iniziale per nuovo account
        if (this.game.inventory) {
            this.game.inventory.items = [];
            this.game.inventory.equipment = {
                laser: new Array(3).fill(null),
                shieldGen: new Array(6).fill(null),
                extra: new Array(3).fill(null)
            };
        }

        // Reset risorse base della nave per nuovo profilo
        if (this.game.ship) {
            this.game.ship.resources.credits = 100000;
            this.game.ship.resources.uridium = 5000;
            this.game.ship.resources.honor = 0;
            this.game.ship.resources.starEnergy = 100;
            this.game.ship.ammunition = { laser: { x1: 1000, x2: 500, x3: 200, sab: 100 }, missile: { r1: 50, r2: 25, r3: 10 } };
            this.game.ship.equippedLasers = { lf1: 0, lf2: 0, lf3: 0, lf4: 0 };
        }

        // Salva tutto nell'account per-id
        this.saveAccountData(accountId);
        
        // Nasconde la schermata
        this.hide();
        
        // Avvia il gioco
        this.game.startGameAudio();
        
        const faction = this.factions.find(f => f.id === this.selectedFaction);
        this.game.notifications.add(`Benvenuto nella fazione ${faction.fullName}!`, 'success');
    }
    
    // Salva tutti i dati per l'account specifico
    saveAccountData(accountId) {
        const accountKey = `mmorpg_account_${accountId}`;
        
        const accountData = {
            accountId: accountId,
            nickname: this.game.playerProfile?.getNickname?.() || '',
            faction: this.selectedFaction,
            currentMap: this.game.mapManager.currentMap,
            ship: {
                x: this.game.ship.x,
                y: this.game.ship.y,
                hp: this.game.ship.hp,
                maxHP: this.game.ship.maxHP,
                shield: this.game.ship.shield,
                maxShield: this.game.ship.maxShield,
                level: this.game.ship.currentLevel,
                experience: this.game.ship.resources.experience,
                equippedLasers: this.game.ship.equippedLasers,
                ammunition: this.game.ship.ammunition,
                selectedLaser: this.game.ship.selectedLaser,
                selectedMissile: this.game.ship.selectedMissile
            },
            resources: {
                credits: this.game.ship.resources.credits,
                uridium: this.game.ship.resources.uridium,
                honor: this.game.ship.resources.honor,
                starEnergy: this.game.ship.resources.starEnergy
            },
            inventory: {
                items: this.game.inventory.items,
                equipment: this.game.inventory.equipment
            },
            timestamp: Date.now()
        };
        
        localStorage.setItem(accountKey, JSON.stringify(accountData));
        console.log(`✅ Account ${accountId} salvato con successo`);
    }
    
    // Controlla se il mouse è sopra un pulsante
    isMouseOverButton(button, x, y) {
        return x >= button.x && x <= button.x + button.width &&
               y >= button.y && y <= button.y + button.height;
    }
    
    // Mostra errore
    showError(message) {
        this.errorMessage = message;
        this.successMessage = '';
        setTimeout(() => {
            this.errorMessage = '';
        }, 3000);
    }
    
    // Converte hex a RGB
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? 
            `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
            '0, 0, 0';
    }
    
    // Disegna la schermata
    draw(ctx) {
        if (!this.isVisible) return;
        
        // Sfondo scuro semi-trasparente
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);
        
        // Disegna stelle
        this.drawStars(ctx);
        
        // Pannello principale
        this.drawMainPanel(ctx);
        
        // Titolo
        this.drawTitle(ctx);
        
        // Selezione fazione
        this.drawFactionSelection(ctx);
        
        // Descrizione fazione selezionata
        if (this.selectedFaction) {
            this.drawSelectedFactionDescription(ctx);
        }
        
        // Pulsante conferma
        this.drawConfirmButton(ctx);
        
        // Messaggi
        this.drawMessages(ctx);
    }
    
    // Disegna descrizione dettagliata della fazione selezionata
    drawSelectedFactionDescription(ctx) {
        const faction = this.factions.find(f => f.id === this.selectedFaction);
        if (!faction) return;
        
        // Posiziona la descrizione tra le carte e il pulsante conferma
        const descY = this.confirmButton.y - 100;
        const lineHeight = 22;
        
        // Sfondo semi-trasparente per la descrizione
        const padding = 15;
        const totalHeight = (faction.longDescription.length * lineHeight) + (padding * 2);
        const descriptionBg = {
            x: Math.round(this.x + 60),
            y: Math.round(descY - padding),
            width: Math.round(this.width - 120),
            height: totalHeight
        };
        
        ctx.fillStyle = `rgba(${this.hexToRgb(faction.color)}, 0.1)`;
        this.roundRectPath(ctx, descriptionBg.x, descriptionBg.y, descriptionBg.width, descriptionBg.height, 8);
        ctx.fill();
        
        // Bordo sottile
        ctx.strokeStyle = `rgba(${this.hexToRgb(faction.color)}, 0.3)`;
        ctx.lineWidth = 1;
        this.roundRectPath(ctx, descriptionBg.x, descriptionBg.y, descriptionBg.width, descriptionBg.height, 8);
        ctx.stroke();
        
        // Testo descrizione
        ctx.textAlign = 'left';
        faction.longDescription.forEach((line, index) => {
            const y = descY + (index * lineHeight);
            
            // Ombra testo
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.font = '14px Arial';
            ctx.fillText(line, descriptionBg.x + padding + 1, y + 1);
            
            // Testo principale
            ctx.fillStyle = '#ffffff';
            ctx.font = '14px Arial';
            ctx.fillText(line, descriptionBg.x + padding, y);
        });
    }
    
    // Disegna stelle
    drawStars(ctx) {
        ctx.save();
        this.stars.forEach(star => {
            ctx.globalAlpha = star.opacity;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }
    
    // Disegna pannello principale
    drawMainPanel(ctx) {
        // Sfondo pannello
        ctx.fillStyle = 'rgba(20, 20, 20, 0.95)';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Bordo
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
    
    // Disegna titolo
    drawTitle(ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Scegli la tua fazione', this.x + this.width / 2, this.y + 60);
        
        ctx.fillStyle = '#cccccc';
        ctx.font = '16px Arial';
        ctx.fillText('Questa è una scelta permanente che determinerà il tuo percorso', 
                    this.x + this.width / 2, this.y + 90);
    }
    
    // Disegna selezione fazione
    drawFactionSelection(ctx) {
        const cardWidth = 180;
        const cardHeight = 120;
        const cardSpacing = 20;
        const totalWidth = (cardWidth * this.factions.length) + (cardSpacing * (this.factions.length - 1));
        const startX = Math.round(this.x + (this.width - totalWidth) / 2);
        const startY = Math.round(this.y + 180);
        
        this.factions.forEach((faction, index) => {
            const cardX = startX + index * (cardWidth + cardSpacing);
            const cardY = startY;
            const isSelected = this.selectedFaction === faction.id;
            
            // Sfondo carta
            ctx.fillStyle = isSelected ? `rgba(${this.hexToRgb(faction.color)}, 0.3)` : 'rgba(42, 42, 42, 0.8)';
            ctx.fillRect(cardX, cardY, cardWidth, cardHeight);
            
            // Bordo
            ctx.strokeStyle = isSelected ? faction.color : '#666666';
            ctx.lineWidth = isSelected ? 3 : 2;
            ctx.strokeRect(cardX, cardY, cardWidth, cardHeight);
            
            // Icona
            ctx.fillStyle = faction.color;
            ctx.font = '32px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(faction.icon, cardX + cardWidth / 2, cardY + 45);
            
            // Nome fazione
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px Arial';
            ctx.fillText(faction.name, cardX + cardWidth / 2, cardY + 70);
            
            // Nome completo
            ctx.fillStyle = '#cccccc';
            ctx.font = '12px Arial';
            ctx.fillText(faction.fullName, cardX + cardWidth / 2, cardY + 90);
            
            // Descrizione
            ctx.fillStyle = '#aaaaaa';
            ctx.font = '10px Arial';
            ctx.fillText(faction.description, cardX + cardWidth / 2, cardY + 105);
        });
    }
    
    // Disegna pulsante conferma
    drawConfirmButton(ctx) {
        const isHovered = this.isMouseOverButton(this.confirmButton, this.game.input.mouse.x, this.game.input.mouse.y);
        
        // Sfondo pulsante
        ctx.fillStyle = isHovered ? '#27ae60' : '#2ecc71';
        ctx.fillRect(this.confirmButton.x, this.confirmButton.y, this.confirmButton.width, this.confirmButton.height);
        
        // Bordo
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.confirmButton.x, this.confirmButton.y, this.confirmButton.width, this.confirmButton.height);
        
        // Testo
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.confirmButton.text, 
                    this.confirmButton.x + this.confirmButton.width / 2, 
                    this.confirmButton.y + this.confirmButton.height / 2 + 6);
    }
    
    // Disegna messaggi
    drawMessages(ctx) {
        // Posiziona i messaggi sotto il pulsante conferma
        const messageY = this.confirmButton.y + this.confirmButton.height + 25;
        
        if (this.errorMessage) {
            ctx.fillStyle = '#e74c3c';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.errorMessage, this.x + this.width / 2, messageY);
        }
        
        if (this.successMessage) {
            ctx.fillStyle = '#27ae60';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.successMessage, this.x + this.width / 2, messageY);
        }
    }
}
