import {spawnSync} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import {existsSync,readFileSync,writeFileSync} from 'node:fs';
const scope='hellogiftgrids-projects';
const client=process.env.GOOGLE_CLIENT_ID;const secret=process.env.GOOGLE_CLIENT_SECRET;
if(!client?.endsWith('.apps.googleusercontent.com')||!secret?.startsWith('GOCSPX-'))throw new Error('A valid Google OAuth client must be configured locally.');
function savedSecret(path){if(!existsSync(path))writeFileSync(path,randomBytes(32).toString('hex'),{mode:0o600});return readFileSync(path,'utf8').trim();}
const values={BLOGGER_CLIENT_ID:client,BLOGGER_CLIENT_SECRET:secret,BLOGGER_REDIRECT_URI:'https://www.degiftgrid.com/api/admin/blog/callback',CRON_SECRET:savedSecret('/tmp/giftgrid-blog-cron-secret'),BLOGGER_TOKEN_ENCRYPTION_KEY:savedSecret('/tmp/giftgrid-blog-encryption-secret')};
for(const [name,value] of Object.entries(values)){const result=spawnSync('npx',['--yes','vercel@latest','env','add',name,'production','--force','--sensitive','--scope',scope],{input:value,encoding:'utf8',env:process.env});if(result.status!==0)throw new Error(`Could not configure ${name}; Vercel exit ${result.status}.`);console.log(`${name}: configured`);}
