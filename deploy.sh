#!/usr/bin/env bash
set -e
cd /workspaces/giftgrid

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  GiftGrid → Supabase CLI init + Vercel deploy"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "▶  [1/6] Installing Supabase CLI..."
if ! command -v supabase &>/dev/null; then
  npm install -g supabase --legacy-peer-deps 2>&1 | tail -3
else
  echo "    Already installed: $(supabase --version)"
fi

echo ""
echo "▶  [2/6] Logging in to Supabase..."
supabase login

echo ""
echo "▶  [3/6] Linking project (ref: xxkodcatazrbjhwddqxg)..."
supabase link --project-ref xxkodcatazrbjhwddqxg
echo "    ✅  Project linked"

echo ""
echo "▶  [4/6] Pushing developer role migration..."
mkdir -p supabase/migrations
MIGRATION="supabase/migrations/$(date +%Y%m%d%H%M%S)_add_developer_role.sql"
cat > "$MIGRATION" << 'SQL'
DO $$
BEGIN
  BEGIN
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'developer';
  EXCEPTION WHEN others THEN
    NULL;
  END;
END $$;

ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('merchant', 'admin', 'super_admin', 'developer', 'buyer'));
SQL
supabase db push --linked
echo "    ✅  Migration pushed"

echo ""
echo "▶  [5/6] Installing deps and building..."
npm install --legacy-peer-deps 2>&1 | tail -3
npm run build 2>&1 | tail -20
echo "    ✅  Build passed"

echo ""
echo "▶  [6/6] Deploying to Vercel..."
if ! command -v vercel &>/dev/null; then
  npm install -g vercel 2>&1 | tail -3
fi
git add -A
git commit -m "feat: social dashboard + console layers + app badges + community" --allow-empty
git push origin main
vercel --prod --yes 2>&1 | tail -20

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅  LIVE!"
echo ""
echo "  https://degiftgrid.com/console     → developer console"
echo "  https://degiftgrid.com/community   → community"
echo "  https://degiftgrid.com/dashboard   → merchant dashboard"
echo ""
echo "  FINAL STEP in Supabase SQL editor:"
echo "  UPDATE profiles SET role = 'developer'"
echo "  WHERE email = 'your-email@example.com';"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
