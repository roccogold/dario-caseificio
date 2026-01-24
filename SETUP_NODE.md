# 🚀 Setting Up Node.js for Local Development

## Quick Fix: Load nvm in Your Terminal

You have **nvm** (Node Version Manager) installed, but it's not loaded in your current terminal session.

### Option 1: Load nvm in Current Terminal (Temporary)

Run this in your terminal:

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

Then check if Node is installed:
```bash
node --version
npm --version
```

### Option 2: Install Node.js via nvm (If Not Installed)

If Node.js isn't installed yet, run:

```bash
# Load nvm first
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install latest LTS version of Node.js
nvm install --lts

# Use it
nvm use --lts

# Set as default
nvm alias default node
```

### Option 3: Make nvm Load Automatically (Permanent Fix)

Add this to your `~/.zshrc` file:

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
```

Then reload your shell:
```bash
source ~/.zshrc
```

## After Node.js is Working

Once `node --version` and `npm --version` work, you can start the dev server:

```bash
cd /Users/roccogoldschmidt/Desktop/projects/proj-dario
npm run dev
```

## Alternative: Install Node.js via Homebrew

If you prefer not to use nvm:

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node
```

## Check What You Have

Run these commands to see what's available:

```bash
# Check if nvm is installed
ls -la ~/.nvm

# Check if Node is installed via nvm
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && nvm list

# Check if Node is in PATH
which node
which npm
```
