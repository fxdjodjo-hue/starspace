// Sistema di profilo giocatore con nickname
export class PlayerProfile {
    constructor() {
        this.nickname = 'TestPlayer';
        this.isEditing = false;
        this.tempNickname = '';
    }
    
    // Ottiene il nickname corrente
    getNickname() {
        return this.nickname;
    }
    
    // Imposta un nuovo nickname
    setNickname(newNickname) {
        if (newNickname && newNickname.trim().length > 0) {
            this.nickname = newNickname.trim();
            return true;
        }
        return false;
    }
    
    // Inizia l'editing del nickname
    startEditing() {
        this.isEditing = true;
        this.tempNickname = this.nickname;
    }
    
    // Conferma l'editing del nickname
    confirmEditing() {
        if (this.setNickname(this.tempNickname)) {
            this.isEditing = false;
            return true;
        }
        return false;
    }
    
    // Annulla l'editing del nickname
    cancelEditing() {
        this.isEditing = false;
        this.tempNickname = '';
    }
    
    // Aggiorna il nickname temporaneo
    updateTempNickname(newNickname) {
        this.tempNickname = newNickname;
    }
    
    // Controlla se è in modalità editing
    isEditingMode() {
        return this.isEditing;
    }
    
    // Ottiene il nickname temporaneo
    getTempNickname() {
        return this.tempNickname;
    }
}










