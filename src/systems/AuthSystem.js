// Sistema di Autenticazione per MMORPG
export class AuthSystem {
    constructor(game) {
        this.game = game;
        this.currentUser = null;
        this.isLoggedIn = false;
        this.usersKey = 'mmorpg_users';
        this.sessionsKey = 'mmorpg_sessions';
        
        // Carica utente dalla sessione se esiste
        this.loadSession();
    }
    
    /**
     * Registra un nuovo utente
     */
    register(nickname, password, faction) {
        try {
            // Validazione input
            if (!nickname || !password || !faction) {
                throw new Error('Nickname, password e fazione sono obbligatori');
            }
            
            if (nickname.length < 3) {
                throw new Error('Nickname deve essere di almeno 3 caratteri');
            }
            
            if (password.length < 4) {
                throw new Error('Password deve essere di almeno 4 caratteri');
            }
            
            // Controlla se l'utente esiste già
            if (this.userExists(nickname)) {
                throw new Error('Nickname già esistente');
            }
            
            // Crea nuovo utente
            const userId = this.generateUserId();
            const hashedPassword = this.hashPassword(password);
            
            const newUser = {
                id: userId,
                nickname: nickname,
                password: hashedPassword,
                faction: faction,
                createdAt: Date.now(),
                lastLogin: null,
                level: 1,
                experience: 0
            };
            
            // Salva utente
            this.saveUser(newUser);
            
            // Login automatico dopo registrazione
            this.login(nickname, password);
            
            console.log('✅ Utente registrato:', nickname);
            return { success: true, user: newUser };
            
        } catch (error) {
            console.error('❌ Errore registrazione:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Login utente esistente
     */
    login(nickname, password) {
        try {
            const user = this.getUserByNickname(nickname);
            
            if (!user) {
                throw new Error('Utente non trovato');
            }
            
            if (!this.verifyPassword(password, user.password)) {
                throw new Error('Password errata');
            }
            
            // Aggiorna ultimo login
            user.lastLogin = Date.now();
            this.saveUser(user);
            
            // Imposta sessione
            this.currentUser = user;
            this.isLoggedIn = true;
            this.saveSession();
            
            console.log('✅ Login effettuato:', nickname);
            return { success: true, user: user };
            
        } catch (error) {
            console.error('❌ Errore login:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Logout utente
     */
    logout() {
        this.currentUser = null;
        this.isLoggedIn = false;
        this.clearSession();
        console.log('✅ Logout effettuato');
    }
    
    /**
     * Controlla se un utente esiste
     */
    userExists(nickname) {
        const users = this.getAllUsers();
        return users.some(user => user.nickname.toLowerCase() === nickname.toLowerCase());
    }
    
    /**
     * Ottiene tutti gli utenti
     */
    getAllUsers() {
        try {
            const usersData = localStorage.getItem(this.usersKey);
            return usersData ? JSON.parse(usersData) : [];
        } catch (error) {
            console.error('❌ Errore caricamento utenti:', error);
            return [];
        }
    }
    
    /**
     * Ottiene utente per nickname
     */
    getUserByNickname(nickname) {
        const users = this.getAllUsers();
        return users.find(user => user.nickname.toLowerCase() === nickname.toLowerCase());
    }
    
    /**
     * Salva utente
     */
    saveUser(user) {
        try {
            const users = this.getAllUsers();
            const existingIndex = users.findIndex(u => u.id === user.id);
            
            if (existingIndex >= 0) {
                users[existingIndex] = user;
            } else {
                users.push(user);
            }
            
            localStorage.setItem(this.usersKey, JSON.stringify(users));
            return true;
        } catch (error) {
            console.error('❌ Errore salvataggio utente:', error);
            return false;
        }
    }
    
    /**
     * Genera ID univoco per utente
     */
    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Hash della password (semplice, per demo)
     */
    hashPassword(password) {
        // In un'applicazione reale, usare bcrypt o simile
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString();
    }
    
    /**
     * Verifica password
     */
    verifyPassword(password, hashedPassword) {
        return this.hashPassword(password) === hashedPassword;
    }
    
    /**
     * Salva sessione corrente
     */
    saveSession() {
        if (this.currentUser) {
            const sessionData = {
                userId: this.currentUser.id,
                nickname: this.currentUser.nickname,
                loginTime: Date.now()
            };
            localStorage.setItem(this.sessionsKey, JSON.stringify(sessionData));
        }
    }
    
    /**
     * Carica sessione salvata
     */
    loadSession() {
        try {
            const sessionData = localStorage.getItem(this.sessionsKey);
            if (sessionData) {
                const session = JSON.parse(sessionData);
                const user = this.getUserByNickname(session.nickname);
                
                if (user) {
                    this.currentUser = user;
                    this.isLoggedIn = true;
                    console.log('✅ Sessione caricata:', user.nickname);
                    return true;
                }
            }
        } catch (error) {
            console.error('❌ Errore caricamento sessione:', error);
        }
        return false;
    }
    
    /**
     * Cancella sessione
     */
    clearSession() {
        localStorage.removeItem(this.sessionsKey);
    }
    
    /**
     * Ottiene chiave salvataggio per utente corrente
     */
    getUserSaveKey() {
        if (!this.isLoggedIn || !this.currentUser) {
            return 'main';
        }
        return `user_${this.currentUser.id}`;
    }
    
    /**
     * Controlla se l'utente ha un salvataggio
     */
    hasUserSave() {
        if (!this.isLoggedIn) return false;
        const saveKey = this.getUserSaveKey();
        return this.game.saveSystem?.hasSave(saveKey) || false;
    }
    
    /**
     * Salva gioco per utente corrente
     */
    saveUserGame() {
        if (!this.isLoggedIn) return false;
        const saveKey = this.getUserSaveKey();
        return this.game.saveSystem?.save(saveKey) || false;
    }
    
    /**
     * Carica gioco per utente corrente
     */
    loadUserGame() {
        if (!this.isLoggedIn) return false;
        const saveKey = this.getUserSaveKey();
        return this.game.saveSystem?.load(saveKey) || false;
    }
}
