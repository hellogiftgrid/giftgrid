const fs = require('fs');
const path = require('path');
const { transform } = require('sucrase');
require('sucrase/register/ts');
const { defaultPages } = require('../../lib/content/site-pages.ts');
const out = path.resolve(__dirname, '../../public/platform-preview');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'content.js'), `window.GIFTGRID_CONTENT=${JSON.stringify(defaultPages()['/'])};`);
fs.writeFileSync(path.join(out, 'app.js'), transform(fs.readFileSync(path.resolve(__dirname, '../../components/preview/PlatformPreview.jsx'), 'utf8'), { transforms: ['jsx'], production: true }).code);
for (const [source, dest] of [['react/umd/react.production.min.js','react.js'],['react-dom/umd/react-dom.production.min.js','react-dom.js']]) fs.copyFileSync(path.resolve(__dirname, '../../node_modules', source), path.join(out,dest));
console.log('Built isolated platform preview. No production data or application routes changed.');

const articleDir = path.resolve(__dirname, '../../content/blog');
const articles = fs.readdirSync(articleDir).filter(f=>f.endsWith('.json')&&f!=='topics.json'&&f!=='topics-100.json').flatMap(f=>{try{const a=JSON.parse(fs.readFileSync(path.join(articleDir,f),'utf8'));return a.slug&&a.sections?[a]:[]}catch{return []}});
fs.writeFileSync(path.join(out,'journal.js'),`window.GIFTGRID_JOURNAL=${JSON.stringify(articles)};`);
for(const route of ['community','buyer/dashboard','merchant/dashboard','admin/review','website-editor']){const dir=path.resolve(out,'..',route);fs.mkdirSync(dir,{recursive:true});fs.copyFileSync(path.join(out,'index.html'),path.join(dir,'index.html'));}
