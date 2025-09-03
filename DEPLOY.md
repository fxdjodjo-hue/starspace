# 🚀 Guida al Deploy su GitHub Pages

## Passi per pubblicare il gioco online

### 1. Preparazione Repository GitHub

```bash
# Inizializza git (se non già fatto)
git init

# Aggiungi tutti i file
git add .

# Commit iniziale
git commit -m "Initial commit: MMORPG Spaziale ready for deployment"

# Aggiungi remote origin (sostituisci con il tuo username)
git remote add origin https://github.com/TUOUSERNAME/MMORPG.git

# Push al repository
git push -u origin main
```

### 2. Attivazione GitHub Pages

1. Vai su **GitHub.com** → Il tuo repository
2. Clicca su **Settings** (in alto a destra)
3. Scorri fino a **Pages** (sidebar sinistra)
4. In **Source** seleziona:
   - **Deploy from a branch**
   - **Branch**: `main`
   - **Folder**: `/ (root)`
5. Clicca **Save**

### 3. Verifica Deploy

- GitHub impiegherà 2-10 minuti per il deploy
- Il gioco sarà disponibile su: `https://TUOUSERNAME.github.io/MMORPG`
- Puoi monitorare il progresso in **Actions** tab

### 4. Aggiornamenti Futuri

```bash
# Per aggiornare il gioco online
git add .
git commit -m "Update: descrizione delle modifiche"
git push origin main
```

## 🔧 Risoluzione Problemi

### Problema: 404 Error
- Verifica che il repository sia pubblico
- Controlla che GitHub Pages sia attivato
- Assicurati che `index.html` sia nella root

### Problema: Moduli ES6 non caricati
- Verifica che tutti i path siano relativi (`./modules/`)
- Controlla la console del browser per errori

### Problema: Risorse non caricate
- Verifica che tutti i file (immagini, audio) siano nel repository
- Controlla i path delle risorse nei moduli

## 📱 Test Cross-Platform

Dopo il deploy, testa su:
- ✅ Desktop (Chrome, Firefox, Safari, Edge)
- ✅ Mobile (iOS Safari, Android Chrome)
- ✅ Tablet (iPad, Android tablet)

## 🎯 URL Finale

Il tuo gioco sarà disponibile su:
**https://TUOUSERNAME.github.io/MMORPG**

Sostituisci `TUOUSERNAME` con il tuo username GitHub reale.

---

**Buon deploy! 🚀**
