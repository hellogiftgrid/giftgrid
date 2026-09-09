const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
const code = ts.transpileModule(fs.readFileSync('lib/ai/chat.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
async function scenario(env, responses) {
  const calls = [];
  const context = { exports: {}, process: { env }, AbortSignal, fetch: async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body) });
    const next = responses.shift();
    if (next instanceof Error) throw next;
    return { ok: next.ok, json: async () => next.data };
  }};
  vm.runInNewContext(code, context);
  const result = context.exports.generateChatReply('Support rules', [{ role: 'user', content: 'Help me source gifts' }]);
  return { result, calls };
}
(async () => {
  let s = await scenario({ GROQ_API_KEY: 'test', GEMINI_API_KEY: 'test' }, [{ ok: true, data: { choices: [{ message: { content: 'Groq reply' } }] } }]);
  assert.equal(await s.result, 'Groq reply'); assert.equal(s.calls.length, 1);
  for (const failure of [{ ok: false }, new Error('timeout'), { ok: true, data: {} }]) {
    s = await scenario({ GROQ_API_KEY: 'test', GEMINI_API_KEY: 'test' }, [failure, { ok: true, data: { candidates: [{ content: { parts: [{ thought: true, text: 'hidden' }, { text: 'Gemini reply' }] } }] } }]);
    assert.equal(await s.result, 'Gemini reply'); assert.equal(s.calls.length, 2);
    assert.equal(s.calls[1].body.contents[0].role, 'user');
  }
  s = await scenario({ GEMINI_API_KEY: 'test' }, [{ ok: true, data: { candidates: [{ content: { parts: [{ text: 'Only Gemini' }] } }] } }]);
  assert.equal(await s.result, 'Only Gemini'); assert.equal(s.calls.length, 1);
  s = await scenario({ OPENROUTER_API_KEY: 'test' }, [{ ok: true, data: { choices: [{ message: { content: 'OpenRouter reply' } }] } }]);
  assert.equal(await s.result, 'OpenRouter reply'); assert.equal(s.calls[0].url, 'https://openrouter.ai/api/v1/chat/completions');
  s = await scenario({}, []); await assert.rejects(s.result, /No chat provider/); assert.equal(s.calls.length, 0);
  s = await scenario({ GROQ_API_KEY: 'test', GEMINI_API_KEY: 'test' }, [{ ok: false }, { ok: false }]);
  await assert.rejects(s.result, /No chat provider/);
  console.log('Passed: Groq success; Gemini fallback for failure, timeout and empty response; Gemini-only; missing keys; exhausted providers.');
})();
