# 🎨 Esempio di Organizzazione Sprite

## 📁 Struttura File per Ogni NPC

Ogni cartella dovrebbe contenere:

```
streuner/vru/
├── streuner_vru.png      # Sprite principale
├── streuner_vru.atlas    # File atlas per animazioni
└── streuner_vru.json     # Metadati sprite (opzionale)
```

## 🎯 Convenzioni di Naming

### File Sprite
- **Formato**: `{tipo}_{fazione}.png`
- **Esempi**:
  - `streuner_vru.png`
  - `lordakia_mmo.png`
  - `cubikon_eic.png`

### File Atlas
- **Formato**: `{tipo}_{fazione}.atlas`
- **Esempi**:
  - `streuner_vru.atlas`
  - `lordakia_mmo.atlas`
  - `cubikon_eic.atlas`

## 🎨 Palette Colori

### VRU (Viola)
- Primary: `#8e44ad`
- Secondary: `#7d3c98`
- Shield: `#a569bd`

### MMO (Rosso)
- Primary: `#e74c3c`
- Secondary: `#c0392b`
- Shield: `#ec7063`

### EIC (Blu)
- Primary: `#3498db`
- Secondary: `#2980b9`
- Shield: `#5dade2`

## 📏 Dimensioni

### Streuner (X1-X2)
- 64x64px base
- Radius: 16px
- Hitbox: 42px

### Lordakia (X2, X4)
- 80x80px base
- Radius: 20px
- Hitbox: 50px

### Cubikon (X6)
- 128x128px base
- Radius: 36px
- Hitbox: 90px

## 🚀 Prossimi Passi

1. **Copiare sprite base** da `alien/alien1/alien60.png`
2. **Ridimensionare** secondo il livello
3. **Applicare colori** della fazione
4. **Salvare** nella cartella appropriata
5. **Creare file atlas** per animazioni
