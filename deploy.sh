#!/bin/bash

# Script di Deploy per DARIO su Vercel
# Questo script prepara il progetto per il deploy in produzione

set -e  # Exit on error

echo "🚀 DARIO - Deploy in Produzione"
echo "================================"
echo ""

# Colori per output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verifica che siamo nella directory corretta
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Errore: package.json non trovato. Esegui questo script dalla root del progetto.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Directory corretta${NC}"
echo ""

# Verifica che node_modules esista
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules non trovato. Installo le dipendenze...${NC}"
    npm install
    echo -e "${GREEN}✅ Dipendenze installate${NC}"
else
    echo -e "${GREEN}✅ Dipendenze già installate${NC}"
fi
echo ""

# Test build
echo -e "${YELLOW}🔨 Test build in corso...${NC}"
if npm run build; then
    echo -e "${GREEN}✅ Build completata con successo${NC}"
else
    echo -e "${RED}❌ Errore durante la build. Controlla gli errori sopra.${NC}"
    exit 1
fi
echo ""

# Verifica vercel.json
if [ -f "vercel.json" ]; then
    echo -e "${GREEN}✅ vercel.json trovato${NC}"
else
    echo -e "${YELLOW}⚠️  vercel.json non trovato. Creo uno di default...${NC}"
    cat > vercel.json << EOF
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
EOF
    echo -e "${GREEN}✅ vercel.json creato${NC}"
fi
echo ""

# Checklist pre-deploy
echo -e "${YELLOW}📋 CHECKLIST PRE-DEPLOY:${NC}"
echo ""
echo "Prima di procedere, assicurati di aver completato:"
echo ""
echo "1. ✅ Supabase:"
echo "   - RLS Policies applicate (FASE2_RLS_POLICIES.sql)"
echo "   - Real-time abilitato (FASE1_ENABLE_REALTIME_V2.sql)"
echo "   - Utente di produzione creato in Supabase Auth"
echo ""
echo "2. ✅ Vercel:"
echo "   - Account Vercel creato e loggato"
echo "   - Variabili d'ambiente configurate:"
echo "     - VITE_SUPABASE_URL"
echo "     - VITE_SUPABASE_ANON_KEY"
echo ""
echo -e "${YELLOW}Hai completato tutti questi step? (y/n)${NC}"
read -r response
if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Completa la checklist prima di procedere.${NC}"
    echo ""
    echo "Vedi DEPLOY_STEP_BY_STEP.md per istruzioni dettagliate."
    exit 1
fi
echo ""

# Verifica Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI non trovato. Installo...${NC}"
    npm install -g vercel
    echo -e "${GREEN}✅ Vercel CLI installato${NC}"
else
    echo -e "${GREEN}✅ Vercel CLI trovato${NC}"
fi
echo ""

# Deploy
echo -e "${YELLOW}🚀 Avvio deploy su Vercel...${NC}"
echo ""
echo -e "${YELLOW}Nota: Se è la prima volta, ti verrà chiesto di:${NC}"
echo "  1. Fare login su Vercel"
echo "  2. Selezionare il progetto (o crearne uno nuovo)"
echo "  3. Confermare le impostazioni"
echo ""

if vercel --prod; then
    echo ""
    echo -e "${GREEN}✅ Deploy completato con successo!${NC}"
    echo ""
    echo "🌐 Il tuo sito dovrebbe essere disponibile su:"
    echo "   https://dario-caseificio.vercel.app/"
    echo ""
    echo "📝 Prossimi step:"
    echo "  1. Verifica che le variabili d'ambiente siano configurate in Vercel Dashboard"
    echo "  2. Testa il login con le credenziali Supabase"
    echo "  3. Verifica che i dati vengano salvati su Supabase"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Errore durante il deploy.${NC}"
    echo ""
    echo "Possibili cause:"
    echo "  - Non sei loggato su Vercel (esegui: vercel login)"
    echo "  - Variabili d'ambiente non configurate"
    echo "  - Errori nella build"
    echo ""
    exit 1
fi
