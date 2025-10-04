# 🚀 MMORPG Spaziale - Multiplayer Online

## 🎮 Come Giocare Online

### **Avvio del Server**
```bash
# Installa le dipendenze
npm install

# Avvia il server multiplayer
node server.js
```

Il server sarà disponibile su:
- **HTTP**: http://localhost:3000
- **WebSocket**: ws://localhost:8080/ws

### **Connessione Multiplayer**

1. **Apri il gioco**: Vai su http://localhost:3000
2. **Completa la StartScreen**: Inserisci nickname e seleziona fazione
3. **Connessione automatica**: Il gioco si connette automaticamente al multiplayer dopo 1 secondo
4. **Gioca insieme**: Vedi altri giocatori come navi verdi con nickname

### **Controlli Multiplayer**

| Tasto | Funzione |
|-------|----------|
| **M** | Connettiti/Disconnettiti manualmente dal server multiplayer (opzionale) |
| **N** | Cambia nickname |
| **Click Sinistro** | Muovi la nave (sincronizzato con altri giocatori) |
| **Click Destro** | Seleziona nemici |
| **CTRL** | Attacco automatico |

### **Funzionalità Multiplayer**

✅ **Già Implementate:**
- Connessione automatica al multiplayer dopo StartScreen
- Sincronizzazione movimento in tempo reale
- Visualizzazione altri giocatori (navi verdi)
- Sistema nickname
- Notifiche di connessione/disconnessione
- Heartbeat per mantenere connessioni vive
- Fallback offline automatico

🔄 **In Sviluppo:**
- Combattimento PvP
- Chat multiplayer
- Sistema clan/gilde
- Eventi speciali multiplayer

### **Architettura Tecnica**

**Client (Browser):**
- WebSocket per comunicazione real-time
- Fallback offline automatico
- Sincronizzazione stato ogni 5 frame

**Server (Node.js):**
- WebSocket server su porta 8080
- HTTP server su porta 3000
- Gestione connessioni multiple
- Cleanup automatico giocatori inattivi

### **Test della Connessione**

**Test automatico:**
1. Apri il gioco: http://localhost:3000
2. Completa la StartScreen (nickname + fazione)
3. Il gioco si connette automaticamente al multiplayer
4. Apri altre finestre per testare con più giocatori

**Test manuale WebSocket:**
```bash
# Apri il file di test
start test-websocket.html
```

### **Deploy Online**

Per mettere il server online:

1. **Deploy su Vercel/Railway/Heroku:**
```bash
# Crea file vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/ws",
      "dest": "server.js"
    }
  ]
}
```

2. **Aggiorna URL nel client:**
```javascript
// In game.js, cambia:
this.connectToServer('ws://localhost:8080/ws');
// Con:
this.connectToServer('wss://tuo-server.vercel.app/ws');
```

### **Risoluzione Problemi**

**❌ Errore di connessione:**
- Verifica che il server sia avviato (`node server.js`)
- Controlla che la porta 8080 sia libera
- Verifica firewall/antivirus

**❌ Giocatori non visibili:**
- Premi M per riconnettersi
- Controlla console browser per errori
- Verifica che altri giocatori siano connessi

**❌ Server non risponde:**
- Riavvia il server (`Ctrl+C` poi `node server.js`)
- Controlla log del server per errori
- Verifica dipendenze (`npm install`)

### **Prossimi Sviluppi**

1. **Database persistente** (MongoDB/PostgreSQL)
2. **Autenticazione utenti** (login/registrazione)
3. **Sistema di istanze** (mappe separate)
4. **Combattimento PvP** avanzato
5. **Sistema di clan** e alleanze
6. **Eventi speciali** multiplayer

---

**Buon gioco multiplayer! 🚀👥**
