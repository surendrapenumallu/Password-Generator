# NodeProject — VS Code Node.js setup

Quick guide to run and debug this small Node project in VS Code.

Prerequisites:
- Install Node.js (use nvm if preferred). The project pins Node 18 in `.nvmrc`.
- (Optional) Install `nodemon` globally for `npm run dev` or run `npm install --save-dev nodemon`.

Install dependencies (if any):
```bash
npm install
```

Run the app:
```bash
npm start
```

Run in development mode (requires `nodemon`):
```bash
npm run dev
```

Debug in VS Code:
- Open the Run and Debug view and start `Launch Program`.
- Or set breakpoints and press F5.

If Node is not installed, install via Homebrew or nvm:
```bash
# Homebrew
brew install node

# nvm (example)
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
nvm install 18
nvm use 18
```
