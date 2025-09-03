# 🚀 MMORPG Spaziale - Gioco Browser

Un gioco spaziale MMORPG stile DarkOrbit sviluppato in JavaScript vanilla con Canvas HTML5.

## 🎮 Caratteristiche

### ✨ **Sistema di Gioco**
- **Nave Spaziale**: Controllo fluido con mouse
- **Combattimento**: Sistema di combattimento automatico contro nemici
- **Esplorazione**: Mondo spaziale infinito (16000x10000)
- **Progressione**: Sistema di livelli, esperienza e onore
- **Economia**: Crediti, Uridium e sistema di upgrade

### 🎯 **Meccaniche di Gioco**
- **Movimento**: Click sinistro per muovere la nave
- **Combattimento**: Click destro per selezionare nemici, CTRL per attacco automatico
- **Skills**: 4 abilità speciali (Smartbomb, FastRepair, EMP, Leech)
- **Stazione Spaziale**: Upgrade e potenziamenti (tasto E)
- **Minimappa**: Navigazione rapida e selezione target

### 🎨 **Sistema Visivo**
- **Grafica**: Sprites 2D con effetti di particelle
- **UI**: Interfaccia moderna con tema scuro
- **Effetti**: Esplosioni, scie, effetti ambientali
- **Audio**: Musica di sottofondo e effetti sonori

## 🕹️ Controlli

| Tasto/Azione | Funzione |
|--------------|----------|
| **Click Sinistro** | Muovi la nave spaziale |
| **Click Destro** | Seleziona nemici per combattimento |
| **CTRL** | Avvia/ferma attacco automatico |
| **E** | Interagisci con la stazione spaziale |
| **1-4** | Attiva abilità speciali |
| **C** | Aggiungi crediti (test) |
| **U** | Aggiungi uridium (test) |
| **O** | Aggiungi onore (test) |
| **D** | Test morte e respawn |
| **N** | Cambia nickname |
| **⛶** | Schermo intero |

## 🚀 Demo Online

**Gioca subito**: [GitHub Pages Demo](https://tuousername.github.io/MMORPG)

## 🛠️ Installazione Locale

### Prerequisiti
- Browser moderno con supporto ES6 modules
- Server locale (per i moduli ES6)

### Setup
```bash
# Clona il repository
git clone https://github.com/tuousername/MMORPG.git
cd MMORPG

# Avvia un server locale (esempio con Python)
python -m http.server 8000

# Oppure con Node.js
npx serve .

# Apri il browser su http://localhost:8000
```

## 📁 Struttura del Progetto

```
MMORPG/
├── index.html              # File principale HTML
├── game.js                 # Logica principale del gioco
├── modules/                # Moduli del gioco
│   ├── Ship.js            # Sistema nave spaziale
│   ├── Camera.js          # Sistema camera
│   ├── Input.js           # Gestione input
│   ├── World.js           # Mondo di gioco
│   ├── Renderer.js        # Sistema di rendering
│   ├── Minimap.js         # Minimappa
│   ├── Enemy.js           # Sistema nemici
│   ├── SpaceStation.js    # Stazione spaziale
│   ├── AudioManager.js    # Gestione audio
│   └── ...                # Altri moduli
├── sounds/                 # File audio
├── resources/              # Risorse grafiche
├── skills/                 # Abilità speciali
└── README.md              # Questo file
```

## 🎯 Roadmap

### ✅ Completato
- [x] Sistema di movimento e camera
- [x] Combattimento base
- [x] Sistema di upgrade
- [x] Stazione spaziale
- [x] Minimappa
- [x] Sistema di notifiche
- [x] Audio e effetti sonori

### 🔄 In Sviluppo
- [ ] Sistema di inventario
- [ ] Più tipi di nemici
- [ ] Sistema di quest
- [ ] Boss battles

### 📋 Pianificato
- [ ] Multiplayer online
- [ ] Sistema di clan
- [ ] Eventi speciali
- [ ] Mobile support

## 🎨 Tecnologie Utilizzate

- **HTML5 Canvas** - Rendering grafico
- **JavaScript ES6+** - Logica di gioco
- **CSS3** - Styling e layout
- **Web Audio API** - Gestione audio
- **LocalStorage** - Salvataggio progressi

## 🤝 Contributi

I contributi sono benvenuti! Per contribuire:

1. Fork del repository
2. Crea un branch per la tua feature (`git checkout -b feature/AmazingFeature`)
3. Commit delle modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📝 Licenza

Questo progetto è distribuito sotto licenza MIT. Vedi `LICENSE` per maggiori informazioni.

## 👨‍💻 Sviluppatore

Sviluppato con ❤️ per la community gaming.

## 🐛 Bug Reports

Se trovi bug o hai suggerimenti, apri una [Issue](https://github.com/tuousername/MMORPG/issues).

---

**Buon gioco! 🚀**