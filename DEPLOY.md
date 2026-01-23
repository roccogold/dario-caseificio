# Come Deployare la Piattaforma per il Cliente

## 🚀 Opzione 1: Deploy su Vercel (CONSIGLIATO - Gratuito e Facile)

### Passi:
1. Vai su [vercel.com](https://vercel.com) e crea un account gratuito
2. Installa Vercel CLI:
   ```bash
   npm install -g vercel
   ```
3. Nel terminale, dalla cartella del progetto:
   ```bash
   vercel
   ```
4. Segui le istruzioni (premi Invio per le opzioni di default)
5. Vercel ti darà un URL tipo: `https://tuo-progetto.vercel.app`
6. **Invia questo URL al cliente** - può accedere subito dal browser!

### Vantaggi:
- ✅ Gratuito
- ✅ URL permanente
- ✅ Aggiornamenti automatici quando fai push su Git
- ✅ HTTPS incluso
- ✅ Il cliente accede solo aprendo il link nel browser

---

## 🔗 Opzione 2: Ngrok (Per Demo Rapida)

### Passi:
1. Installa Ngrok: [ngrok.com/download](https://ngrok.com/download)
2. Avvia il server locale:
   ```bash
   npm run dev
   ```
3. In un altro terminale, avvia Ngrok:
   ```bash
   ngrok http 5173
   ```
4. Ngrok ti darà un URL tipo: `https://abc123.ngrok.io`
5. **Invia questo URL al cliente**

### Vantaggi:
- ✅ Veloce (2 minuti)
- ✅ Funziona subito
- ❌ URL cambia ogni volta (versione gratuita)
- ❌ Devi tenere il PC acceso

---

## 📦 Opzione 3: Build e Invia File

1. Crea la build:
   ```bash
   npm run build
   ```
2. La cartella `dist` contiene i file pronti
3. Carica la cartella `dist` su un hosting (es. Netlify Drop, GitHub Pages, etc.)

---

## 🎯 Raccomandazione

**Usa Vercel** - è la soluzione più professionale e il cliente può accedere subito senza installare nulla!
