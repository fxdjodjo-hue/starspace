# MMORPG Game - Railway Deploy

## 🚀 Deploy su Railway

### 1. Setup Railway
```bash
npm install -g @railway/cli
railway login
railway init
```

### 2. Configurazione Variabili
```bash
railway variables set NODE_ENV=production
railway variables set PORT=8080
```

### 3. Deploy
```bash
railway up
```

### 4. Dominio Personalizzato
- Vai su Railway Dashboard
- Settings → Domains
- Aggiungi `tradefy.biz`
- Configura DNS records

## 🌐 URL Finale
- **Game**: https://tradefy.biz
- **WebSocket**: wss://tradefy.biz/ws

## 📊 Monitoraggio
- Railway Dashboard per logs
- Metrics automatiche
- Auto-scaling
