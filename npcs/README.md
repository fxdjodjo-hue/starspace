# 🎨 NPC Sprites Directory

Questa cartella contiene tutti gli sprite per i diversi tipi di NPC nel gioco.

## 📁 Struttura delle Cartelle

```
npcs/
├── streuner/          # NPC base (X1-X2)
│   ├── vru/          # Variante Venus Research Union
│   ├── mmo/          # Variante Mars Military Organization  
│   └── eic/          # Variante Earth Industries Corporation
├── lordakia/         # NPC aggressivo (X2, X4)
│   ├── vru/
│   ├── mmo/
│   └── eic/
├── saimon/           # NPC X3
│   ├── vru/
│   ├── mmo/
│   └── eic/
├── mordon/           # NPC X3
│   ├── vru/
│   ├── mmo/
│   └── eic/
├── devolarium/       # NPC X3
│   ├── vru/
│   ├── mmo/
│   └── eic/
├── sibelon/          # NPC X3
│   ├── vru/
│   ├── mmo/
│   └── eic/
├── sibelonit/        # NPC X4
│   ├── vru/
│   ├── mmo/
│   └── eic/
├── lordakium/        # NPC X4, X6
│   ├── vru/
│   ├── mmo/
│   └── eic/
├── kristalling/      # NPC X5
│   ├── vru/
│   ├── mmo/
│   └── eic/
├── kristallon/       # NPC X5, X6
│   ├── vru/
│   ├── mmo/
│   └── eic/
└── cubikon/          # NPC X6
    ├── vru/
    ├── mmo/
    └── eic/
```

## 🎯 Convenzioni di Naming

### File Sprite
- `{type}_{faction}.png` - Sprite principale
- `{type}_{faction}.atlas` - File atlas per animazioni

### Esempi
- `streuner_vru.png` - Streuner della fazione VRU
- `lordakia_mmo.png` - Lordakia della fazione MMO
- `cubikon_eic.png` - Cubikon della fazione EIC

## 🎨 Palette Colori per Fazioni

### VRU (Venus Research Union)
- **Primary**: `#8e44ad` (Viola)
- **Secondary**: `#7d3c98` (Viola scuro)
- **Shield**: `#a569bd` (Viola chiaro)

### MMO (Mars Military Organization)
- **Primary**: `#e74c3c` (Rosso)
- **Secondary**: `#c0392b` (Rosso scuro)
- **Shield**: `#ec7063` (Rosso chiaro)

### EIC (Earth Industries Corporation)
- **Primary**: `#3498db` (Blu)
- **Secondary**: `#2980b9` (Blu scuro)
- **Shield**: `#5dade2` (Blu chiaro)

## 📏 Dimensioni Progressive

### Livello X1-X2 (Streuner)
- **Radius**: 16px
- **Hitbox**: 42px

### Livello X3 (Saimon, Mordon, Devolarium, Sibelon)
- **Radius**: 20-24px
- **Hitbox**: 50-60px

### Livello X4 (Sibelonit, Lordakium)
- **Radius**: 24-28px
- **Hitbox**: 60-70px

### Livello X5 (Kristalling, Kristallon)
- **Radius**: 28-32px
- **Hitbox**: 70-80px

### Livello X6 (Cubikon, Kristallon, Lordakium)
- **Radius**: 32-36px
- **Hitbox**: 80-90px

## 🚀 Prossimi Passi

1. **Creare sprite base** per ogni tipo di NPC
2. **Applicare palette colori** per ogni fazione
3. **Ridimensionare** secondo i livelli
4. **Creare file atlas** per animazioni
5. **Aggiornare NPCTypes.js** con i nuovi percorsi sprite

## 📝 Note

- Ogni sprite dovrebbe essere **riconoscibile** a colpo d'occhio
- Le **dimensioni** dovrebbero riflettere la **potenza** dell'NPC
- I **colori** dovrebbero essere **coerenti** con la fazione
- Gli sprite dovrebbero essere **ottimizzati** per le performance
