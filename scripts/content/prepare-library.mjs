import { access, readFile } from 'node:fs/promises';

// Deployments must remain deterministic and fast. Article generation is an
// asynchronous editorial job (see /api/cron/blog), not a build prerequisite.
// Published articles are read from Supabase at runtime; the local snapshot is
// optional and is used only when it exists.
try {
  await access('lib/blog/library.json');
  JSON.parse(await readFile('lib/blog/library.json', 'utf8'));
} catch {
  throw new Error('The blog library snapshot is missing or invalid. Run the content library build before committing this change.');
}
console.log('Skipping AI article generation during deployment; scheduled editorial jobs handle updates.');
