# 🚀 Deploy Manuale - Soluzione Rapida

## Problema
Vercel sta mostrando il vecchio sito perché il codice aggiornato non è su GitHub.

## Soluzione: Deploy Manuale da Vercel Dashboard

### Opzione 1: Upload Manuale (Più Semplice)

1. **Vai su [Vercel Dashboard](https://vercel.com/dashboard)**
2. Seleziona il progetto `dario-caseificio`
3. Vai su **Deployments**
4. Clicca **Add New** → **Deploy**
5. Seleziona **Upload** (invece di Git)
6. Crea un file ZIP del progetto:
   ```bash
   cd /Users/roccogoldschmidt/Desktop/projects/proj-dario
   zip -r dario-deploy.zip . -x "node_modules/*" ".git/*" ".DS_Store" "*.log"
   ```
7. Carica il file ZIP su Vercel
8. Vercel farà il build e il deploy

### Opzione 2: Deploy via CLI (Se hai Vercel CLI)

```bash
cd /Users/roccogoldschmidt/Desktop/projects/proj-dario

# Se non sei loggato
vercel login

# Deploy in produzione (usa il codice locale)
vercel --prod
```

### Opzione 3: Risolvi Conflitti Git e Push

Se preferisci usare Git:

1. Risolvi i conflitti manualmente
2. Fai push su GitHub
3. Vercel farà automaticamente un nuovo deploy

---

## ⚡ Soluzione Rapida: Forza Push (Se sei sicuro)

Se sei sicuro che il codice locale è quello corretto e vuoi sovrascrivere GitHub:

```bash
cd /Users/roccogoldschmidt/Desktop/projects/proj-dario
git push --force origin main
```

**⚠️ ATTENZIONE**: Questo sovrascriverà il codice su GitHub. Usa solo se sei sicuro!

---

## 🎯 Raccomandazione

**Usa l'Opzione 1 (Upload Manuale)** - è la più semplice e sicura!
