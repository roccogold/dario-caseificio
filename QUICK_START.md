# 🚀 Quick Start Guide

## Start Dev Server

**In your terminal, run these commands:**

```bash
# 1. Load nvm (Node Version Manager)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 2. Navigate to project
cd /Users/roccogoldschmidt/Desktop/projects/proj-dario

# 3. Start dev server
npm run dev
```

**You should see:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Then open:** http://localhost:5173 in your browser

## Make nvm Load Automatically (One-Time Setup)

Add this to your `~/.zshrc` file so you don't have to load nvm every time:

```bash
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.zshrc
echo '[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"' >> ~/.zshrc
```

Then reload:
```bash
source ~/.zshrc
```

## What to Test

Once the server is running at http://localhost:5173:

1. ✅ **Dashboard** - Check spacing and responsive grid
2. ✅ **Formaggi** - Test button responsiveness  
3. ✅ **Produzioni** - Check filter inputs on iPad size
4. ✅ **Statistiche** - Test stats grid layout
5. ✅ **Calendario** - Verify page loads correctly

Use Chrome DevTools (Cmd+Option+I) to test different screen sizes!
