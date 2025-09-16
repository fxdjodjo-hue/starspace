# 🎯 Sistema Fazioni - Ispirato a DarkOrbit

## 📋 Panoramica

Il sistema fazioni è stato implementato per aggiungere profondità strategica e identità al gioco, ispirandosi al sistema consolidato di DarkOrbit. Ogni fazione offre bonus unici, tecnologie esclusive e meccaniche di gioco diverse.

## 🏛️ Fazioni Disponibili

### **1. EIC (Earth Industries Corporation)**
- **Icona**: 🌍
- **Colore**: Blu (#4A90E2)
- **Sede**: Settore Terra (2000, 2000)
- **Stile**: Bilanciato
- **Descrizione**: La più grande corporazione terrestre, specializzata in tecnologia e commercio

**Bonus:**
- Nessun bonus (equilibrio iniziale)
- I bonus verranno aggiunti solo se necessario per bilanciare il numero di giocatori

**Tecnologie Esclusive:**
- Advanced Shields
- Trade Routes
- Corporate Discounts

### **2. MARS (Mars Mining Operations)**
- **Icona**: 🔴
- **Colore**: Rosso (#E74C3C)
- **Sede**: Settore Marte (14000, 2000)
- **Stile**: Aggressivo
- **Descrizione**: Specializzata nell'estrazione mineraria e nella produzione di risorse

**Bonus:**
- Nessun bonus (equilibrio iniziale)
- I bonus verranno aggiunti solo se necessario per bilanciare il numero di giocatori

**Tecnologie Esclusive:**
- Mining Lasers
- Resource Processing
- Heavy Armor

### **3. VENUS (Venus Research Division)**
- **Icona**: 🟣
- **Colore**: Viola (#9B59B6)
- **Sede**: Settore Venere (2000, 8000)
- **Stile**: Tattico
- **Descrizione**: Avanzata divisione di ricerca scientifica con tecnologie all'avanguardia

**Bonus:**
- Nessun bonus (equilibrio iniziale)
- I bonus verranno aggiunti solo se necessario per bilanciare il numero di giocatori

**Tecnologie Esclusive:**
- Quantum Weapons
- Research Labs
- Advanced Navigation

## 🎮 Meccaniche di Gioco

### **Selezione Fazione**
- **Tasto F8** - Apri pannello fazioni
- **Click su carta fazione** - Seleziona fazione
- **Pulsante "Seleziona Fazione"** - Conferma selezione
- **Pulsante "Abbandona Fazione"** - Lascia fazione corrente

### **Sistema Reputazione**
- **Reputazione iniziale**: 0 per tutte le fazioni
- **Cambio fazione**: -10 reputazione con fazione precedente, +5 con nuova fazione
- **Range**: -100 (nemico) a +100 (alleato)
- **Effetti**: Influisce su bonus e penalità PvP

### **Sistema Bonus (Futuro)**
Attualmente le fazioni non hanno bonus per mantenere l'equilibrio iniziale. I bonus verranno aggiunti solo se necessario per bilanciare il numero di giocatori tra le fazioni:
- **Sistema dinamico**: I bonus vengono aggiustati in base alla popolazione
- **Equilibrio automatico**: Fazioni con meno giocatori ricevono bonus temporanei
- **Trasparenza**: I giocatori vengono informati dei bonus attivi

### **Sistema PvP**
- **Danno contro nemici naturali**: +20% danno
- **Danno contro alleati**: -20% danno
- **Danno normale**: Nessun bonus/penalità

## 🔧 Implementazione Tecnica

### **File Principali**
- `src/systems/FactionSystem.js` - Logica di gestione fazioni
- `src/ui/FactionPanel.js` - Interfaccia utente
- `game.js` - Integrazione nel gioco principale

### **Integrazione Salvataggio**
- I dati delle fazioni vengono salvati automaticamente
- Include: fazione corrente, reputazione, storia
- Caricamento automatico all'avvio del gioco

### **API Principali**
```javascript
// Seleziona fazione
game.factionSystem.selectFaction('eic', player);

// Ottieni fazione corrente
const currentFaction = game.factionSystem.getCurrentFaction();

// Ottieni tutte le fazioni
const allFactions = game.factionSystem.getAllFactions();

// Controlla se due fazioni sono nemiche
const areEnemies = game.factionSystem.areEnemies('eic', 'mars');

// Ottieni reputazione
const reputation = game.factionSystem.getReputation('eic');
```

## 🎯 Strategie di Gioco

### **EIC - Giocatore Bilanciato**
- **Ideale per**: Principianti e giocatori casual
- **Vantaggi**: Tecnologie avanzate, focus commerciale
- **Strategia**: Focus su commercio e difesa

### **MARS - Giocatore Aggressivo**
- **Ideale per**: Giocatori che amano il combattimento
- **Vantaggi**: Tecnologie minerarie, focus combattimento
- **Strategia**: Focus su combattimento e mining

### **VENUS - Giocatore Tattico**
- **Ideale per**: Giocatori strategici e avanzati
- **Vantaggi**: Tecnologie quantistiche, focus ricerca
- **Strategia**: Focus su tecnologia e precisione

## 🔮 Future Estensioni

### **Prossime Funzionalità**
- **Fazioni aggiuntive**: Più fazioni con specializzazioni uniche
- **Sistema alleanze**: Fazioni possono allearsi temporaneamente
- **Eventi fazione**: Eventi speciali per fazioni specifiche
- **Tecnologie avanzate**: Più tecnologie esclusive per fazione

### **Miglioramenti Tecnici**
- **Sistema PvP avanzato**: Battaglie tra fazioni
- **Sistema clan per fazione**: Clan all'interno delle fazioni
- **Sistema territori**: Controllo di zone per fazione
- **Sistema diplomazia**: Relazioni complesse tra fazioni

## 🎮 Come Iniziare

1. **Apri il pannello fazioni** - Premi F8
2. **Scegli una fazione** - Clicca su una carta fazione
3. **Conferma selezione** - Clicca "Seleziona Fazione"
4. **Gioca con i bonus** - I bonus vengono applicati automaticamente
5. **Cambia fazione** - Puoi cambiare fazione in qualsiasi momento

## ⚠️ Note Importanti

- **Cambio fazione**: Riduce la reputazione con la fazione precedente
- **Bonus permanenti**: I bonus si applicano solo alla fazione attiva
- **Salvataggio**: La fazione viene salvata automaticamente
- **Requisiti**: Attualmente non ci sono requisiti per entrare in una fazione

---

**Il sistema fazioni è ora completamente funzionale e pronto per l'uso!** 🎉

