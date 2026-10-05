const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

class ApiError extends Error { constructor(status, message) { super(message); this.status = status; } }
function setup({ allowed = 'publisher', role = 'developer', denied = false, aiText, aiOk = true } = {}) {
  const posts = new Map();
  const env = { GIFTGRID_PUBLISHER_IDS: allowed, GROQ_API_KEY: 'test-only' };
  let calls = 0;
  const actor = { ownerId: 'publisher', authorName: 'GiftGrid Editorial', admin: { from(table) {
    const filters = {};
    let inserted;
    const query = {
      select() { return this; }, eq(key, value) { filters[key] = value; return this; },
      like(key, value) { filters[key] = value; return this; }, gte(key, value) { filters[key] = value; return this; }, order() { return this; },
      insert(value) { inserted = value; return this; },
      limit(value) { const data = [...posts.values()].filter(post => post.author_id === filters.author_id && post.system_key.startsWith(filters.system_key.replace(/%$/, '')) && Date.parse(post.created_at) >= Date.parse(filters.created_at)).sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, value).map(post => ({ created_at: post.created_at })); return Promise.resolve({ data, error: null }); },
      async maybeSingle() { const data = posts.get(filters.system_key); return { data: data?.author_id === filters.author_id ? data : null, error: null }; },
      async single() {
        if (table === 'profiles') return { data: { role, full_name: 'GiftGrid Editorial' }, error: null };
        if (inserted) {
          if (posts.has(inserted.system_key)) return { data: null, error: { code: '23505' } };
          const data = { ...inserted, created_at: new Date().toISOString(), id: 'post-' + posts.size };
          posts.set(inserted.system_key, data);
          return { data, error: null };
        }
        const data = posts.get(filters.system_key);
        return { data: data?.author_id === filters.author_id ? data : null, error: null };
      },
    };
    return query;
  } } };
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync('lib/community/publishing.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(source, {
    exports, process: { env }, AbortSignal,
    fetch: async () => { calls++; return { ok: aiOk, json: async () => ({ choices: [{ message: { content: aiText } }] }) }; },
    require(name) {
      if (name === 'server-only') return {};
      if (name === 'node:crypto') return require(name);
      if (name === '@/lib/developer/api') return { ApiError, developerActor: async () => { if (denied) throw new ApiError(401, 'Denied'); return actor; } };
      throw new Error(name);
    },
  });
  return { api: exports, actor, posts, env, calls: () => calls };
}

test('automation fails closed without configured accounts', async () => {
  const { api } = setup({ allowed: '' });
  await assert.rejects(api.publishingActor({}, 'community:publish'), { status: 503 });
});
test('ordinary members and unlisted accounts cannot automate publishing', async () => {
  for (const options of [{ role: 'merchant' }, { allowed: 'someone-else' }]) {
    await assert.rejects(setup(options).api.publishingActor({}, 'community:publish'), { status: 403 });
  }
});
test('authentication errors propagate before automation access', async () => {
  await assert.rejects(setup({ denied: true }).api.publishingActor({}, 'community:publish'), { status: 401 });
});
test('allowed developer account can publish', async () => {
  const { api } = setup();
  assert.equal((await api.publishingActor({}, 'community:publish')).ownerId, 'publisher');
});
test('concurrent retries create exactly one post; changed payload conflicts', async () => {
  const { api, actor, posts } = setup();
  const input = { body: 'A useful sourcing tip.', topic: 'Sourcing' };
  const results = await Promise.all([api.publishPost(actor, input, 'release-0001'), api.publishPost(actor, input, 'release-0001')]);
  assert.equal(posts.size, 1);
  assert.equal(results.filter(result => result.replayed).length, 1);
  await assert.rejects(api.publishPost(actor, { ...input, body: 'Changed content' }, 'release-0001'), { status: 409 });
});
test('automation enforces the minimum four-hour spacing between posts', async () => {
  const { api, actor, posts } = setup();
  await api.publishPost(actor, { body: 'One useful sourcing update.' }, 'daily-post-0001');
  await assert.rejects(api.publishPost(actor, { body: 'A second useful sourcing update.' }, 'daily-post-0002'), { status: 429 });
  assert.equal(posts.size, 1);
});
test('identity spoofing, invalid content and absent retry keys cannot write', async () => {
  const { api, actor, posts } = setup();
  for (const input of [{ body: '' }, { body: 'x'.repeat(2001) }, { body: 'Hello', author_id: 'victim' }, { body: 'Hello', topic: 1 }]) {
    await assert.rejects(api.publishPost(actor, input, 'release-0001'), { status: 400 });
  }
  await assert.rejects(api.publishPost(actor, { body: 'Hello' }, null), { status: 400 });
  assert.equal(posts.size, 0);
});
test('AI drafting returns valid content without publishing it', async () => {
  const { api, posts, calls } = setup({ aiText: JSON.stringify({ body: 'Ask suppliers about lead times.', topic: 'Sourcing' }) });
  const draft = await api.draftPost({ brief: 'Write a sourcing checklist tip.' });
  assert.equal(draft.topic, 'Sourcing');
  assert.equal(calls(), 1);
  assert.equal(posts.size, 0);
});
test('AI failures and invalid outputs are controlled errors', async () => {
  await assert.rejects(setup({ aiOk: false }).api.draftPost({ brief: 'A tip' }), { status: 503 });
  await assert.rejects(setup({ aiText: 'not json' }).api.draftPost({ brief: 'A tip' }), { status: 502 });
  const { api, env, calls } = setup();
  delete env.GROQ_API_KEY;
  await assert.rejects(api.draftPost({ brief: 'A tip' }), { status: 503 });
  assert.equal(calls(), 0);
});
