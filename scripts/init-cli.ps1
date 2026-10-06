# GiftGrid CLI installer (Windows PowerShell) — sparse checkout of just the CLI + docs.
$ErrorActionPreference = "Stop"
$dir = if ($args[0]) { $args[0] } else { "giftgrid-cli" }
git init $dir
Set-Location $dir
git remote add origin https://github.com/hellogiftgrid/giftgrid.git
git sparse-checkout init --cone
git sparse-checkout set scripts docs giftgrid.cmd
git pull origin main
@"
`$env:GIFTGRID_API_URL = "https://community.degiftgrid.com/api"
`$env:GIFTGRID_API_KEY = "paste-your-key-here"
node scripts/giftgrid-cli.mjs --help
"@ | Out-File -Encoding utf8 QUICKSTART.ps1
Write-Host "Done. Edit QUICKSTART.ps1 with your API key, then run it."
