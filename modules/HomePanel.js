// Pannello Home - Interfaccia principale del giocatore
export class HomePanel {
    constructor(game) {
        this.game = game;
        this.visible = false;
        this.selectedCategory = 'info';
        this.lastSelectedCategory = 'info';
        
        // Dati del giocatore (verranno aggiornati dinamicamente)
        this.playerData = {
            id: '883098',
            level: 1,
            rank: 'Privato Solar',
            credits: 0,
            uridium: 0,
            experience: 0,
            honor: 0,
            server: 'Europe 1'
        };
        
        // Categorie del menu
        this.categories = [
            { id: 'info', name: 'Info', icon: '📊', available: true },
            { id: 'equipment', name: 'Equipaggiamento', icon: '⚔️', available: true },
            { id: 'shop', name: 'Negozio', icon: '🛒', available: true },
            { id: 'quest', name: 'Quest', icon: '📋', available: true },
            { id: 'stats', name: 'Statistiche', icon: '📈', available: true },
            { id: 'map', name: 'Mappa spaziale', icon: '🗺️', available: true },
            { id: 'settings', name: 'Impostazioni', icon: '⚙️', available: true },
            { id: 'exit', name: 'Esci', icon: '🚪', available: true }
        ];
        
        // Giocatori online (dati di esempio)
        this.onlinePlayers = [
            { name: 'Players online', count: 262, status: 'online' },
            { name: 'Player_5609402', status: 'squad' },
            { name: 'MiguelDuhalt', status: 'online' },
            { name: 'xxXxXxXBaNdIDoXxXxXXX', status: 'squad' },
            { name: 'WOAHHH', status: 'squad' },
            { name: 'xXxSantyxXx', status: 'offline' },
            { name: 'CORIxSPAKKAXEROE', status: 'online' },
            { name: 'IIOBSIDI4NII', status: 'squad' }
        ];
        
        // Cronologia e eventi
        this.history = [
            'Sei sul server "Europe 1"',
            'Il bonus è attivo - +8% x Esperienza',
            'Il bonus è attivo - +32% x Platini'
        ];
        
        this.activeEvents = [
            // Per ora vuoto come nell'immagine
        ];
        
        // Dimensioni e posizioni
        this.panelWidth = 800;
        this.panelHeight = 600;
        this.navWidth = 200;
        this.contentWidth = this.panelWidth - this.navWidth;
        
        this.x = (this.game.canvas.width - this.panelWidth) / 2;
        this.y = (this.game.canvas.height - this.panelHeight) / 2;
    }
    
    toggle() {
        this.visible = !this.visible;
        if (this.visible) {
            this.game.audioManager.playSound('stationpanel_open');
        }
    }
    
    show() {
        this.visible = true;
    }
    
    hide() {
        this.visible = false;
    }
    
    stopDragging() {
        // Metodo per compatibilità con il sistema di drag
        // Il pannello Home non supporta il drag, quindi è vuoto
    }
    
    updatePlayerData() {
        // Aggiorna i dati del giocatore con quelli reali
        if (this.game.ship) {
            // Leggi le risorse direttamente dalla nave (Single Source of Truth)
            this.playerData.credits = this.game.ship.getResource('credits');
            this.playerData.uridium = this.game.ship.getResource('uridium');
            this.playerData.honor = this.game.ship.getResource('honor');
            this.playerData.experience = this.game.ship.getResource('experience');
            
            // Leggi il livello dal sistema integrato
            this.playerData.level = this.game.ship.currentLevel;
            
            // Sincronizza con upgradeManager per compatibilità
            this.game.ship.upgradeManager.credits = this.playerData.credits;
            this.game.ship.upgradeManager.uridium = this.playerData.uridium;
            this.game.ship.upgradeManager.honor = this.playerData.honor;
            
            // Aggiorna il rango basato sul livello
            this.playerData.rank = this.getRankFromLevel(this.playerData.level);
        }
    }
    
    getRankFromLevel(level) {
        // Sistema di ranghi basato sul livello
        if (level >= 50) return 'Generale Spaziale';
        if (level >= 40) return 'Colonnello Spaziale';
        if (level >= 30) return 'Maggiore Spaziale';
        if (level >= 20) return 'Capitano Spaziale';
        if (level >= 15) return 'Tenente Spaziale';
        if (level >= 10) return 'Sergente Spaziale';
        if (level >= 5) return 'Caporale Spaziale';
        if (level >= 3) return 'Soldato Spaziale';
        return 'Privato Solar';
    }
    
    handleClick(x, y) {
        if (!this.visible) return false;
        
        // Controlla se clicca su chiudi
        if (this.isCloseButtonClicked(x, y)) {
            this.hide();
            return true;
        }
        
        // Controlla se clicca su una categoria
        const clickedCategory = this.getClickedCategory(x, y);
        if (clickedCategory) {
            this.selectCategory(clickedCategory);
            return true;
        }
        
        return false;
    }
    
    isCloseButtonClicked(x, y) {
        const closeX = this.x + this.panelWidth - 40;
        const closeY = this.y + 20;
        return x >= closeX && x <= closeX + 20 && y >= closeY && y <= closeY + 20;
    }
    
    getClickedCategory(x, y) {
        const navX = this.x;
        const navY = this.y + 60; // Inizia dopo il titolo
        const itemHeight = 40;
        
        for (let i = 0; i < this.categories.length; i++) {
            const itemY = navY + i * itemHeight;
            if (x >= navX && x <= navX + this.navWidth && 
                y >= itemY && y <= itemY + itemHeight) {
                return this.categories[i];
            }
        }
        return null;
    }
    
    selectCategory(category) {
        this.selectedCategory = category.id;
        // Suono solo se cambia categoria
        if (this.lastSelectedCategory !== category.id) {
            this.game.audioManager.playSound('laser');
            this.lastSelectedCategory = category.id;
        }
    }
    
    draw(ctx) {
        if (!this.visible) return;
        
        // Aggiorna i dati del giocatore
        this.updatePlayerData();
        
        // Calcola posizione centrata ogni volta
        this.x = (this.game.canvas.width - this.panelWidth) / 2;
        this.y = (this.game.canvas.height - this.panelHeight) / 2;
        
        // Overlay scuro
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);
        
        // Pannello principale
        this.drawMainPanel(ctx);
        
        // Pannello di navigazione
        this.drawNavigationPanel(ctx);
        
        // Contenuto principale
        this.drawMainContent(ctx);
    }
    
    drawMainPanel(ctx) {
        // Sfondo del pannello
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(this.x, this.y, this.panelWidth, this.panelHeight);
        
        // Bordo
        ctx.strokeStyle = '#16213e';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.panelWidth, this.panelHeight);
        
        // Titolo
        ctx.fillStyle = '#e94560';
        ctx.font = 'bold 18px Arial';
        ctx.fillText('Pannello di controllo', this.x + 20, this.y + 30);
        
        // Pulsante chiudi
        ctx.fillStyle = '#e94560';
        ctx.fillRect(this.x + this.panelWidth - 40, this.y + 10, 30, 30);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('X', this.x + this.panelWidth - 25, this.y + 30);
    }
    
    drawNavigationPanel(ctx) {
        const navX = this.x;
        const navY = this.y + 60;
        
        // Sfondo navigazione
        ctx.fillStyle = '#0f3460';
        ctx.fillRect(navX, navY, this.navWidth, this.panelHeight - 60);
        
        // Pattern esagonale (semplificato)
        ctx.strokeStyle = '#16213e';
        ctx.lineWidth = 1;
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 5; j++) {
                const hexX = navX + 20 + i * 15;
                const hexY = navY + 20 + j * 20;
                this.drawHexagon(ctx, hexX, hexY, 5);
            }
        }
        
        // Categorie
        this.categories.forEach((category, index) => {
            const itemY = navY + 20 + index * 40;
            const isSelected = this.selectedCategory === category.id;
            
            // Sfondo selezionato
            if (isSelected) {
                ctx.fillStyle = '#e94560';
                ctx.fillRect(navX + 10, itemY - 5, this.navWidth - 20, 35);
            }
            
            // Icona
            ctx.fillStyle = isSelected ? '#ffffff' : '#e94560';
            ctx.font = '16px Arial';
            ctx.fillText(category.icon, navX + 15, itemY + 15);
            
            // Nome
            ctx.fillStyle = isSelected ? '#ffffff' : '#ffffff';
            ctx.font = '14px Arial';
            ctx.fillText(category.name, navX + 40, itemY + 15);
            
            // Freccia selezionata
            if (isSelected) {
                ctx.fillStyle = '#ffffff';
                ctx.font = '16px Arial';
                ctx.fillText('→', navX + this.navWidth - 25, itemY + 15);
            }
        });
    }
    
    drawMainContent(ctx) {
        const contentX = this.x + this.navWidth;
        const contentY = this.y + 60;
        
        // Sfondo contenuto
        ctx.fillStyle = '#16213e';
        ctx.fillRect(contentX, contentY, this.contentWidth, this.panelHeight - 60);
        
        switch (this.selectedCategory) {
            case 'info':
                this.drawInfoContent(ctx, contentX, contentY);
                break;
            case 'equipment':
                this.drawComingSoon(ctx, contentX, contentY, 'Equipaggiamento');
                break;
            case 'shop':
                this.drawComingSoon(ctx, contentX, contentY, 'Negozio');
                break;
            case 'quest':
                this.drawComingSoon(ctx, contentX, contentY, 'Quest');
                break;
            case 'stats':
                this.drawComingSoon(ctx, contentX, contentY, 'Statistiche');
                break;
            case 'map':
                this.drawComingSoon(ctx, contentX, contentY, 'Mappa spaziale');
                break;
            case 'settings':
                this.drawComingSoon(ctx, contentX, contentY, 'Impostazioni');
                break;
            case 'exit':
                this.drawComingSoon(ctx, contentX, contentY, 'Esci');
                break;
        }
    }
    
    drawInfoContent(ctx, x, y) {
        // Nave spaziale e ID
        const centerX = x + this.contentWidth / 2;
        const shipY = y + 80;
        
        // Cerchio nave
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, shipY, 60, 0, Math.PI * 2);
        ctx.stroke();
        
        // Disegna nave spaziale (semplificata)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(centerX - 20, shipY - 10, 40, 20);
        ctx.fillRect(centerX - 10, shipY - 20, 20, 10);
        
        // ID
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`ID ${this.playerData.id}`, centerX, shipY + 40);
        ctx.textAlign = 'left';
        
        // Livello e rango
        ctx.fillStyle = '#e94560';
        ctx.font = '16px Arial';
        ctx.fillText(`${this.playerData.level} LIVELLO`, x + 20, shipY - 20);
        ctx.fillText(this.playerData.rank, x + 20, shipY);
        
        // Risorse
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.fillText(`${this.playerData.credits.toLocaleString()} CREDITS`, x + this.contentWidth - 200, shipY - 40);
        ctx.fillText(`${this.playerData.uridium.toLocaleString()} URIDIUM`, x + this.contentWidth - 200, shipY - 20);
        ctx.fillText(`${this.playerData.experience.toLocaleString()} ESPERIENZA`, x + this.contentWidth - 200, shipY);
        ctx.fillText(`${this.playerData.honor.toLocaleString()} ONORE`, x + this.contentWidth - 200, shipY + 20);
        
        // Divider
        ctx.strokeStyle = '#e94560';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 20, shipY + 80);
        ctx.lineTo(x + this.contentWidth - 20, shipY + 80);
        ctx.stroke();
        
        // Tre colonne
        const colWidth = (this.contentWidth - 60) / 3;
        
        // Colonna 1: Giocatori online
        this.drawOnlinePlayers(ctx, x + 20, shipY + 100, colWidth);
        
        // Colonna 2: Cronologia
        this.drawHistory(ctx, x + 20 + colWidth + 20, shipY + 100, colWidth);
        
        // Colonna 3: Eventi attivi
        this.drawActiveEvents(ctx, x + 20 + (colWidth + 20) * 2, shipY + 100, colWidth);
    }
    
    drawOnlinePlayers(ctx, x, y, width) {
        ctx.fillStyle = '#e94560';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('Giocatori online', x, y);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.fillText(`server: ${this.playerData.server}`, x, y + 20);
        
        this.onlinePlayers.forEach((player, index) => {
            const playerY = y + 40 + index * 20;
            
            // Icona stato
            ctx.fillStyle = this.getStatusColor(player.status);
            ctx.font = '12px Arial';
            ctx.fillText(this.getStatusIcon(player.status), x, playerY);
            
            // Nome giocatore
            ctx.fillStyle = '#ffffff';
            ctx.fillText(player.name, x + 20, playerY);
            
            // Contatore per "Players online"
            if (player.count) {
                ctx.fillText(`- ${player.count} -`, x + width - 50, playerY);
            }
        });
    }
    
    drawHistory(ctx, x, y, width) {
        ctx.fillStyle = '#e94560';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('Cronologia', x, y);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        this.history.forEach((item, index) => {
            ctx.fillText(item, x, y + 20 + index * 20);
        });
    }
    
    drawActiveEvents(ctx, x, y, width) {
        ctx.fillStyle = '#e94560';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('Eventi attivi', x, y);
        
        ctx.fillStyle = '#888888';
        ctx.font = '12px Arial';
        ctx.fillText('Nessun evento attivo', x, y + 20);
    }
    
    drawComingSoon(ctx, x, y, title) {
        ctx.fillStyle = '#e94560';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(title, x + this.contentWidth / 2, y + this.panelHeight / 2 - 50);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px Arial';
        ctx.fillText('Coming Soon...', x + this.contentWidth / 2, y + this.panelHeight / 2);
        
        ctx.textAlign = 'left';
    }
    
    drawHexagon(ctx, x, y, size) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const hexX = x + Math.cos(angle) * size;
            const hexY = y + Math.sin(angle) * size;
            if (i === 0) {
                ctx.moveTo(hexX, hexY);
            } else {
                ctx.lineTo(hexX, hexY);
            }
        }
        ctx.closePath();
        ctx.stroke();
    }
    
    getStatusColor(status) {
        switch (status) {
            case 'online': return '#e94560';
            case 'squad': return '#ffa500';
            case 'offline': return '#888888';
            default: return '#ffffff';
        }
    }
    
    getStatusIcon(status) {
        switch (status) {
            case 'online': return '✓';
            case 'squad': return 'S';
            case 'offline': return '○';
            default: return '?';
        }
    }
}