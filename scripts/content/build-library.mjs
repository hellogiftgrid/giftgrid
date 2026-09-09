import {readFile,writeFile,readdir} from 'node:fs/promises';
const files=(await readdir('content/blog')).filter(f=>f.endsWith('.json')&&f!=='topics.json');
const articles=await Promise.all(files.map(async f=>JSON.parse(await readFile(`content/blog/${f}`,'utf8'))));
const slugs=new Set();const titles=new Set();
for(const a of articles){const words=[a.intro,...a.sections.flatMap(s=>s.paragraphs)].join(' ').match(/\b[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*\b/gu)?.length||0;if(words<700)throw new Error(`${a.slug}: ${words} words`);if(slugs.has(a.slug)||titles.has(a.title))throw new Error('Duplicate article');slugs.add(a.slug);titles.add(a.title);a.wordCount=words;}
if(articles.length!==50)throw new Error(`Expected 50 completed articles; found ${articles.length}.`);
await writeFile('lib/blog/library.json',JSON.stringify(articles,null,2)+'\n');
console.log(JSON.stringify({articles:articles.length,minWords:Math.min(...articles.map(a=>a.wordCount)),totalWords:articles.reduce((n,a)=>n+a.wordCount,0)}));
