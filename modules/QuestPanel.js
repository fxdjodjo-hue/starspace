// Modulo Pannello Quest per MMORPG
export class QuestPanel {
    constructor(game) {
        this.game = game;
        this.isOpen = false;
        this.currentTab = 'active'; // 'active', 'completed', 'available'
        
        // Posizione e dimensioni
        this.x = 0;
        this.y = 0;
        this.width = 500;
        this.height = 600;
        
        // Sistema quest
        this.quests = {
            active: [
                {
                    id: 'tutorial_1',
                    title: 'Primi Passi',
                    description: 'Esplora lo spazio e raccogli 5 risorse',
                    progress: 0,
                    maxProgress: 5,
                    rewards: { experience: 100, credits: 50 },
                    type: 'collect'
                },
                {
                    id: 'combat_1',
                    title: 'Cacciatore di Nemici',
                    description: 'Sconfiggi 3 nemici per guadagnare esperienza',
                    progress: 1,
                    maxProgress: 3,
                    rewards: { experience: 200, credits: 100 },
                    type: 'kill'
                }
            ],
            completed: [
                {
                    id: 'tutorial_0',
                    title: 'Benvenuto nello Spazio',
                    description: 'Completata la prima missione di benvenuto',
                    progress: 1,
                    maxProgress: 1,
                    rewards: { experience: 50, credits: 25 },
                    type: 'tutorial',
                    completedAt: Date.now() - 86400000 // 1 giorno fa
                }
            ],
            available: [
                {
                    id: 'exploration_1',
                    title: 'Esploratore',
                    description: 'Visita 10 settori diversi dello spazio',
                    progress: 0,
                    maxProgress: 10,
                    rewards: { experience: 300, credits: 150 },
                    type: 'explore',
                    requirements: { level: 5 }
                },
                {
                    id: 'trading_1',
                    title: 'Commerciante',
                    description: 'Vendi 20 risorse alla stazione spaziale',
                    progress: 0,
                    maxProgress: 20,
                    rewards: { experience: 250, credits: 200 },
                    type: 'trade',
                    requirements: { level: 3 }
                }
            ]
        };
        
        // Carica quest salvate
        this.loadQuests();
    }
    
    // Carica quest dal localStorage
    loadQuests() {
        const saved = localStorage.getItem('gameQuests');
        if (saved) {
            const questData = JSON.parse(saved);
            this.quests = { ...this.quests, ...questData };
        }
    }
    
    // Salva quest nel localStorage
    saveQuests() {
        localStorage.setItem('gameQuests', JSON.stringify(this.quests));
    }
    
    // Apri il pannello
    open() {
        this.isOpen = true;
        this.centerPanel();
    }
    
    // Chiudi il pannello
    close() {
        this.isOpen = false;
    }
    
    // Centra il pannello
    centerPanel() {
        this.x = (this.game.width - this.width) / 2;
        this.y = (this.game.height - this.height) / 2;
    }
    
    // Aggiungi una nuova quest attiva
    addQuest(quest) {
        this.quests.active.push(quest);
        this.saveQuests();
    }
    
    // Completa una quest
    completeQuest(questId) {
        const questIndex = this.quests.active.findIndex(q => q.id === questId);
        if (questIndex !== -1) {
            const quest = this.quests.active[questIndex];
            quest.completedAt = Date.now();
            this.quests.completed.push(quest);
            this.quests.active.splice(questIndex, 1);
            
            // Applica ricompense
            this.applyRewards(quest.rewards);
            
            this.saveQuests();
            return quest;
        }
        return null;
    }
    
    // Applica ricompense
    applyRewards(rewards) {
        if (rewards.experience) {
            this.game.ship.addResource('experience', rewards.experience);
        }
        if (rewards.credits) {
            this.game.ship.addResource('credits', rewards.credits);
        }
    }
    
    // Aggiorna progresso quest
    updateQuestProgress(questId, progress) {
        const quest = this.quests.active.find(q => q.id === questId);
        if (quest) {
            quest.progress = Math.min(quest.progress + progress, quest.maxProgress);
            
            // Controlla se la quest è completata
            if (quest.progress >= quest.maxProgress) {
                this.completeQuest(questId);
                return true; // Quest completata
            }
            
            this.saveQuests();
        }
        return false;
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
        ctx.fillText('Quest', this.x + this.width/2, this.y + 35);
        
        // Tabs
        this.drawTabs(ctx);
        
        // Contenuto tab
        if (this.currentTab === 'active') {
            this.drawActiveQuests(ctx);
        } else if (this.currentTab === 'completed') {
            this.drawCompletedQuests(ctx);
        } else if (this.currentTab === 'available') {
            this.drawAvailableQuests(ctx);
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
        const tabWidth = 120;
        const tabHeight = 30;
        const tabY = this.y + 50;
        
        // Tab Attive
        ctx.fillStyle = this.currentTab === 'active' ? '#0f3460' : '#16213e';
        ctx.fillRect(this.x + 20, tabY, tabWidth, tabHeight);
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Attive', this.x + 20 + tabWidth/2, tabY + 20);
        
        // Tab Completate
        ctx.fillStyle = this.currentTab === 'completed' ? '#0f3460' : '#16213e';
        ctx.fillRect(this.x + 150, tabY, tabWidth, tabHeight);
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Completate', this.x + 150 + tabWidth/2, tabY + 20);
        
        // Tab Disponibili
        ctx.fillStyle = this.currentTab === 'available' ? '#0f3460' : '#16213e';
        ctx.fillRect(this.x + 280, tabY, tabWidth, tabHeight);
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Disponibili', this.x + 280 + tabWidth/2, tabY + 20);
    }
    
    // Disegna quest attive
    drawActiveQuests(ctx) {
        const startY = this.y + 100;
        const questHeight = 80;
        const scrollY = 0; // TODO: Implementare scroll
        
        this.quests.active.forEach((quest, index) => {
            const questY = startY + (index * questHeight) - scrollY;
            
            // Controlla se la quest è visibile
            if (questY < this.y + 100 || questY > this.y + this.height - 50) return;
            
            // Sfondo quest
            ctx.fillStyle = '#2a2a3e';
            ctx.strokeStyle = '#4a4a5e';
            ctx.lineWidth = 1;
            this.roundRect(ctx, this.x + 20, questY, this.width - 40, questHeight - 10, 5);
            ctx.fill();
            ctx.stroke();
            
            // Titolo quest
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(quest.title, this.x + 30, questY + 25);
            
            // Descrizione
            ctx.fillStyle = '#cccccc';
            ctx.font = '12px Arial';
            ctx.fillText(quest.description, this.x + 30, questY + 45);
            
            // Progresso
            const progressPercent = quest.progress / quest.maxProgress;
            const progressWidth = (this.width - 80) * progressPercent;
            
            // Barra progresso sfondo
            ctx.fillStyle = '#444444';
            ctx.fillRect(this.x + 30, questY + 55, this.width - 80, 8);
            
            // Barra progresso
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(this.x + 30, questY + 55, progressWidth, 8);
            
            // Testo progresso
            ctx.fillStyle = '#ffffff';
            ctx.font = '10px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(`${quest.progress}/${quest.maxProgress}`, this.x + this.width - 50, questY + 62);
        });
    }
    
    // Disegna quest completate
    drawCompletedQuests(ctx) {
        const startY = this.y + 100;
        const questHeight = 60;
        
        this.quests.completed.forEach((quest, index) => {
            const questY = startY + (index * questHeight);
            
            // Controlla se la quest è visibile
            if (questY < this.y + 100 || questY > this.y + this.height - 50) return;
            
            // Sfondo quest completata
            ctx.fillStyle = '#1a3a1a';
            ctx.strokeStyle = '#2a5a2a';
            ctx.lineWidth = 1;
            this.roundRect(ctx, this.x + 20, questY, this.width - 40, questHeight - 10, 5);
            ctx.fill();
            ctx.stroke();
            
            // Titolo quest
            ctx.fillStyle = '#90EE90';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(quest.title, this.x + 30, questY + 20);
            
            // Descrizione
            ctx.fillStyle = '#cccccc';
            ctx.font = '11px Arial';
            ctx.fillText(quest.description, this.x + 30, questY + 35);
            
            // Data completamento
            const completedDate = new Date(quest.completedAt);
            ctx.fillStyle = '#888888';
            ctx.font = '10px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(completedDate.toLocaleDateString(), this.x + this.width - 30, questY + 20);
        });
    }
    
    // Disegna quest disponibili
    drawAvailableQuests(ctx) {
        const startY = this.y + 100;
        const questHeight = 80;
        
        this.quests.available.forEach((quest, index) => {
            const questY = startY + (index * questHeight);
            
            // Controlla se la quest è visibile
            if (questY < this.y + 100 || questY > this.y + this.height - 50) return;
            
            // Controlla requisiti
            const canAccept = this.canAcceptQuest(quest);
            
            // Sfondo quest
            ctx.fillStyle = canAccept ? '#2a2a3e' : '#1a1a1a';
            ctx.strokeStyle = canAccept ? '#4a4a5e' : '#333333';
            ctx.lineWidth = 1;
            this.roundRect(ctx, this.x + 20, questY, this.width - 40, questHeight - 10, 5);
            ctx.fill();
            ctx.stroke();
            
            // Titolo quest
            ctx.fillStyle = canAccept ? '#ffffff' : '#666666';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(quest.title, this.x + 30, questY + 25);
            
            // Descrizione
            ctx.fillStyle = canAccept ? '#cccccc' : '#666666';
            ctx.font = '12px Arial';
            ctx.fillText(quest.description, this.x + 30, questY + 45);
            
            // Ricompense
            ctx.fillStyle = '#FFD700';
            ctx.font = '10px Arial';
            ctx.fillText(`Ricompense: ${quest.rewards.experience} XP, ${quest.rewards.credits} Credits`, this.x + 30, questY + 60);
            
            // Pulsante accetta (solo se può accettare)
            if (canAccept) {
                ctx.fillStyle = '#4CAF50';
                ctx.fillRect(this.x + this.width - 80, questY + 15, 60, 25);
                ctx.fillStyle = '#ffffff';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Accetta', this.x + this.width - 50, questY + 30);
            }
        });
    }
    
    // Controlla se può accettare una quest
    canAcceptQuest(quest) {
        if (quest.requirements) {
            if (quest.requirements.level && this.game.ship.level < quest.requirements.level) {
                return false;
            }
        }
        return true;
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
        const tabY = this.y + 50;
        
        // Controlla click sui tab
        if (y >= tabY && y <= tabY + 30) {
            // Tab Attive
            if (x >= this.x + 20 && x <= this.x + 140) {
                this.currentTab = 'active';
                return;
            }
            // Tab Completate
            if (x >= this.x + 150 && x <= this.x + 270) {
                this.currentTab = 'completed';
                return;
            }
            // Tab Disponibili
            if (x >= this.x + 280 && x <= this.x + 400) {
                this.currentTab = 'available';
                return;
            }
        }
        
        // Gestisci click su quest disponibili (pulsante accetta)
        if (this.currentTab === 'available') {
            const startY = this.y + 100;
            const questHeight = 80;
            
            this.quests.available.forEach((quest, index) => {
                const questY = startY + (index * questHeight);
                
                // Pulsante accetta
                if (x >= this.x + this.width - 80 && x <= this.x + this.width - 20 &&
                    y >= questY + 15 && y <= questY + 40) {
                    
                    if (this.canAcceptQuest(quest)) {
                        this.acceptQuest(quest);
                    }
                }
            });
        }
    }
    
    // Accetta una quest
    acceptQuest(quest) {
        // Rimuovi dalla lista disponibili
        const questIndex = this.quests.available.findIndex(q => q.id === quest.id);
        if (questIndex !== -1) {
            const acceptedQuest = this.quests.available.splice(questIndex, 1)[0];
            this.quests.active.push(acceptedQuest);
            this.saveQuests();
            
            // Notifica
            if (this.game.notifications) {
                this.game.notifications.add(`Quest "${acceptedQuest.title}" accettata!`, 3000, 'success');
            }
        }
    }
    
    // Utility per disegnare rettangoli arrotondati
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
