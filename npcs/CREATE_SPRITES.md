# 🎨 Guida per Creare Sprite NPC

## 📋 Passi per Creare Sprite

### 1. Copia Sprite Base
```bash
# Copia lo sprite base per ogni tipo
cp alien/alien1/alien60.png npcs/streuner/vru/streuner_vru.png
cp alien/alien1/alien60.png npcs/streuner/mmo/streuner_mmo.png
cp alien/alien1/alien60.png npcs/streuner/eic/streuner_eic.png
```

### 2. Ridimensiona per Livelli
```bash
# Streuner (X1-X2) - 64x64px
# Lordakia (X2, X4) - 80x80px
# Saimon (X3) - 80x80px
# Mordon (X3) - 88x88px
# Devolarium (X3) - 96x96px
# Sibelon (X3) - 80x80px
# Sibelonit (X4) - 96x96px
# Lordakium (X4, X6) - 112x112px
# Kristalling (X5) - 112x112px
# Kristallon (X5, X6) - 128x128px
# Cubikon (X6) - 144x144px
```

### 3. Applica Colori Fazione

#### VRU (Viola)
- Primary: `#8e44ad`
- Secondary: `#7d3c98`
- Shield: `#a569bd`

#### MMO (Rosso)
- Primary: `#e74c3c`
- Secondary: `#c0392b`
- Shield: `#ec7063`

#### EIC (Blu)
- Primary: `#3498db`
- Secondary: `#2980b9`
- Shield: `#5dade2`

### 4. Crea File Atlas
```json
{
    "streuner_vru": {
        "image": "streuner_vru.png",
        "size": {"w": 64, "h": 64},
        "frames": [
            {"name": "idle", "x": 0, "y": 0, "w": 64, "h": 64},
            {"name": "move", "x": 64, "y": 0, "w": 64, "h": 64},
            {"name": "attack", "x": 128, "y": 0, "w": 64, "h": 64}
        ]
    }
}
```

## 🎯 Esempi di Naming

### File Sprite
- `streuner_vru.png` - Streuner VRU
- `lordakia_mmo.png` - Lordakia MMO
- `cubikon_eic.png` - Cubikon EIC

### File Atlas
- `streuner_vru.atlas` - Atlas Streuner VRU
- `lordakia_mmo.atlas` - Atlas Lordakia MMO
- `cubikon_eic.atlas` - Atlas Cubikon EIC

## 🚀 Script di Automazione

```bash
#!/bin/bash
# Script per creare tutti gli sprite NPC

# Tipi di NPC
types=("streuner" "lordakia" "saimon" "mordon" "devolarium" "sibelon" "sibelonit" "lordakium" "kristalling" "kristallon" "cubikon")

# Fazioni
factions=("vru" "mmo" "eic")

# Copia sprite base per ogni combinazione
for type in "${types[@]}"; do
    for faction in "${factions[@]}"; do
        cp alien/alien1/alien60.png "npcs/$type/$faction/${type}_${faction}.png"
        echo "Creato: npcs/$type/$faction/${type}_${faction}.png"
    done
done

echo "✅ Tutti gli sprite NPC creati!"
```

## 📝 Note Importanti

1. **Mantieni proporzioni** quando ridimensioni
2. **Usa colori coerenti** per ogni fazione
3. **Ottimizza dimensioni** per performance
4. **Testa in gioco** prima di finalizzare
5. **Backup** degli sprite originali

## 🎨 Strumenti Consigliati

- **GIMP** - Editor immagini gratuito
- **Photoshop** - Editor professionale
- **Aseprite** - Specializzato per pixel art
- **ImageMagick** - Automazione batch
