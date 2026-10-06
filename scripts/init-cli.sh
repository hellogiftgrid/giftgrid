#!/usr/bin/env bash
set -e
dir="${1:-giftgrid-cli}"
git init "$dir"
cd "$dir"
git remote add origin https://github.com/hellogiftgrid/giftgrid.git
git sparse-checkout init --cone
git sparse-checkout set scripts docs giftgrid.cmd
git pull origin main
cat > quickstart.sh <<'EOS'
export GIFTGRID_API_URL="https://community.degiftgrid.com/api"
export GIFTGRID_API_KEY="paste-your-key-here"
node scripts/giftgrid-cli.mjs --help
EOS
chmod +x quickstart.sh
echo "Done. Edit quickstart.sh with your API key, then run it."
