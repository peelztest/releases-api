git clone https://github.com/nvm-sh/nvm.git ~/.nvm
git -C ~/.nvm -c advice.detachedHead=false checkout v0.39.3
echo 'export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"' >> ~/.zshenv
source ~/.zshenv

nvm install --default
nvm use
corepack enable
corepack prepare yarn@stable --activate
yarn config set --home enableTelemetry 0
yarn install
