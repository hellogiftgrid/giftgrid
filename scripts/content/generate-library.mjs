import { mkdir, readFile, writeFile } from 'node:fs/promises';
const topics = [
['corporate-gifting-readiness-checklist','The Corporate Gifting Readiness Checklist for E-commerce Brands','Readiness','A practical evidence-based checklist before a first buyer conversation'],
['how-to-audit-your-online-store','How to Audit Your Online Store Before Approaching Corporate Buyers','Readiness','A repeatable walkthrough with screenshots and issue prioritization'],
['signs-your-store-is-not-ready','7 Signs Your Store Needs More Preparation for Corporate Gifting','Readiness','Seven specific warning signs and how to fix each'],
['create-gift-bundles','How to Create Gift Bundles That Work for Corporate Buyers','Products','Bundle composition, packaging fit, substitutions and a sample bundle example'],
['what-makes-a-store-buyer-ready','What Makes an E-commerce Store Buyer-Ready?','Readiness','Difference between a attractive storefront and operational readiness'],
['getting-started-with-giftgrid','Getting Started with GiftGrid: A Merchant Preparation Guide','GiftGrid','What to gather before applying: public URL, brand information, product and operations details'],
['turn-audit-findings-into-action','Turn Your GiftGrid Store Review into an Action Plan','GiftGrid','Triage recommendations, assign owners, collect evidence and request clarification'],
['prepare-for-giftgrid-call','How to Prepare for a Productive GiftGrid Call','GiftGrid','A structured agenda and focused questions without inventing call prices or duration'],
['merchant-profile-that-answers-buyer-questions','Build a Merchant Profile That Answers Buyer Questions','GiftGrid','How to describe capabilities truthfully and keep commercial details current'],
['understanding-commercial-opportunities','Understanding the Commercial Opportunities Around Your Brand','GiftGrid','Contrast gifting, wholesale, procurement, rewards and distribution without promising access'],
['corporate-gifting-brief','How to Write a Clear Corporate Gifting Brief','Buyers','Audience, purpose, quantity, timeline, delivery geography and constraints'],
['employee-onboarding-gifts','Planning Employee Onboarding Gifts with Independent Brands','Buyers','Recurring small cohorts, useful products, inclusive choices and handoffs'],
['client-appreciation-gifts','Client Appreciation Gifts That Start with the Recipient','Buyers','Relationship context, restrained branding and relevant personalization'],
['event-gifting-logistics','Plan Event Gifts Without Last-Minute Logistics Surprises','Operations','Venue receiving hours, buffers, attendee quantities and leftovers'],
['remote-team-gifting','A Practical Guide to Gifting for Remote Teams','Buyers','Opt-in addresses, recipient choices and multi-location coordination; no legal advice'],
['seasonal-gifting-calendar','Build a Seasonal Gifting Calendar Your Team Can Maintain','Operations','Work backward from arrival with supplier and approval checkpoints'],
['product-photography-for-bulk-buyers','Product Photography That Helps Bulk Buyers Decide','Products','Scale, included items, packaging, variants, photo shot list'],
['product-descriptions-for-gifting','Write Product Descriptions That Answer Gifting Questions','Products','Recipient experience, size, materials, inclusions and care, no unsupported claims'],
['sample-approval-process','Create a Clear Product Sample Approval Process','Operations','What to assess, record, approve and version before volume production'],
['minimum-order-quantities','Explain Minimum Order Quantities Without Losing Good Enquiries','Operations','Distinguish production, decoration and packing minima; illustrative examples only'],
['lead-times-for-corporate-orders','Make Your Corporate Order Lead Times Clear','Operations','Separate sampling, approval, production, packing and dispatch timelines'],
['stock-planning-for-bulk-orders','Prepare Your Stock Information for a Bulk Order Conversation','Operations','Available versus committed stock, reservations and alternative products'],
['packaging-that-protects-the-experience','Packaging That Protects the Gift and the Experience','Products','Physical fit, protection tests and practical unboxing design'],
['personalization-approval-checklist','A Personalization Approval Checklist for Gift Orders','Products','Logo files, placement, proof version, names and signoff responsibility'],
['brand-story-for-business-buyers','Tell a Brand Story Business Buyers Can Use','Brand building','Verifiable origin, maker process and short usable product stories'],
['mobile-store-review','Review Your Store on Mobile Through a Buyer’s Eyes','Readiness','Navigation, image reading, product details and enquiry flow'],
['bulk-enquiry-page','Build a Useful Bulk Enquiry Page for Your Store','Readiness','Field design, expectations and actionable follow-up'],
['wholesale-line-sheet','Prepare a Wholesale Line Sheet Buyers Can Understand','Products','SKU, variants, pack quantities, availability and sample references; no price advice'],
['organize-commercial-documents','Organize Your Commercial Documents Before Buyers Ask','Operations','Version control, filenames, ownership and access, avoid legal compliance claims'],
['buyer-follow-up','Follow Up with a Buyer Without Creating More Noise','Brand building','Specific next action, timing, useful evidence and respectful closure'],
['qualify-a-gifting-enquiry','How to Qualify a Corporate Gifting Enquiry','Operations','Feasibility questions and distinguishing interest from confirmed requirements'],
['gifting-project-handoffs','Keep Gifting Project Handoffs Clear Across Your Team','Operations','Single brief, decision log, ownership and escalation'],
['handling-product-substitutions','Handle Gift Product Substitutions Before They Become Surprises','Operations','Approval boundaries, alternatives, images and recipient expectations'],
['delivery-information-checklist','A Delivery Information Checklist for Corporate Gifts','Operations','Recipient details, access windows and exception ownership without regulatory advice'],
['post-delivery-review','Run a Useful Post-Delivery Review After a Gifting Project','Operations','Compare agreed scope to delivery, feedback themes and follow-up tasks'],
['repeat-gifting-orders','Make Repeat Gifting Orders Easier to Run','Buyers','Reusable brief templates and recheck stock, recipients and approvals'],
['gift-selection-for-mixed-audiences','Choose Gifts for a Mixed Audience with Care','Buyers','Useful choices, preferences and alternatives without medical or dietary advice'],
['branded-versus-unbranded-gifts','When Should a Corporate Gift Carry Your Branding?','Buyers','Recipient usefulness, subtlety, placement and approval constraints'],
['small-batch-brands','Help Buyers Understand Your Small-Batch Production','Brand building','Explain limits, process, variation and realistic capacity'],
['merchant-opportunity-fit','Assess Whether a Commercial Opportunity Fits Your Brand','GiftGrid','Capacity, audience, assortment and constraints, no guaranteed acceptance'],
['store-review-evidence','What Evidence Makes a Store Review More Useful?','Readiness','Screenshots, URLs, dated examples and before-after verification'],
['prioritize-store-improvements','Prioritize Store Improvements with a Small Team','Readiness','Impact on buyer questions, dependencies and achievable milestones'],
['catalogue-consistency','Keep Your Catalogue Consistent Across Buyer Touchpoints','Products','SKU naming, imagery, specifications and version checks'],
['launch-a-corporate-gifting-range','Prepare a Focused Corporate Gifting Range','Products','Narrow hero assortment, operational test and feedback before expansion'],
['corporate-gifting-faqs','The Questions Your Corporate Gifting FAQ Should Answer','Readiness','Quantity, customization, lead time, enquiry and fulfilment questions'],
['buyer-shortlist','Build a Buyer Shortlist Around Fit Rather Than Hype','Buyers','Consistent evaluation criteria and documented tradeoffs, not real vendor recommendations'],
['merchant-buyer-communication','Make Merchant and Buyer Communication Easier to Track','GiftGrid','Keep brief, versions, decisions and actions connected with platform conversations'],
['responsible-product-claims','Describe Your Products with Evidence Instead of Vague Claims','Brand building','Specific materials and processes, avoid unverified ethical or sustainability promises'],
['gifting-program-pilot','Run a Small Gifting Pilot Before a Larger Rollout','Buyers','Scope, sample feedback, process tests and clear decision criteria'],
['giftgrid-merchant-routine','A Weekly GiftGrid Routine for Growing Merchant Teams','GiftGrid','Review profile, recommendations, documents, opportunities and messages without invented features']
];
await mkdir('content/blog',{recursive:true});
await writeFile('content/blog/topics.json',JSON.stringify(topics,null,2)+'\n');
const key=process.env.GROQ_API_KEY;
if(!key||key.includes('SENSITIVE')) throw new Error('GROQ_API_KEY must be configured in the environment.');
const facts=`GiftGrid helps ecommerce merchants maintain a merchant profile, manage documents, messages, and applications, and prepare for corporate gifting and other commercial opportunities. Buyers can submit a sourcing request. Visitors can contact the team. Do not invent integrations, automated matching, client names, user counts, certification, response times, guarantees, fees, payment processing, shipping services, or partner contracts. A suggested workflow is advice, not a claim that GiftGrid has an automated feature. Never claim reviewing a public store proves backend stock, operational capacity, or legal compliance. This is a new platform, not a proven source of guaranteed sales.`;
const dbUrl=process.env.NEXT_PUBLIC_SUPABASE_URL;
const dbKey=process.env.SUPABASE_SERVICE_ROLE_KEY;
const checkpoint=Boolean(dbUrl&&dbKey&&!dbKey.includes('SENSITIVE'));
async function database(path,options={}){const response=await fetch(`${dbUrl}/rest/v1/${path}`,{...options,headers:{apikey:dbKey,Authorization:`Bearer ${dbKey}`,'Content-Type':'application/json',...options.headers},signal:AbortSignal.timeout(30000)});if(!response.ok)throw new Error(`Article checkpoint failed (${response.status})`);return response;}
const count=a=>[a.intro,...a.sections.flatMap(s=>s.paragraphs)].join(' ').match(/\b[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*\b/gu)?.length||0;
for (const [i,[slug,title,category,angle]] of topics.entries()) {
 const path=`content/blog/${slug}.json`;
 try { const old=JSON.parse(await readFile(path,'utf8')); if(count(old)>=700){console.log(`${i+1}/50 existing: ${slug}`);continue;} } catch {}
 if(checkpoint){const response=await database(`blog_articles?slug=eq.${encodeURIComponent(slug)}&select=article`);const rows=await response.json();const article=rows[0]?.article;if(article&&count(article)>=700){await writeFile(path,JSON.stringify(article,null,2)+'\n');console.log(`${i+1}/50 restored: ${slug}`);continue;}}
 let done=false;
 for(let attempt=0;attempt<12;attempt++) {
  try {
   const response=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.GROQ_MODEL||'openai/gpt-oss-20b',temperature:0.5,reasoning_effort:'low',max_completion_tokens:5000,response_format:{type:'json_object'},messages:[{role:'system',content:'Write original, specific, useful ecommerce education in clear English. Return JSON only. Avoid filler and repetitive sales pitches.'},{role:'user',content:`Write an entire original article for the GiftGrid Journal. Title: ${title}. Category: ${category}. Distinct focus: ${angle}. Verified product context: ${facts}\nWrite 950-1150 words of actual prose, NOT fewer than 850. Include 6-8 descriptive sections with 2 substantial paragraphs each, plus a short intro. Use one clearly hypothetical worked example specific to this topic, concrete next steps, and useful reasoning. No statistics, attributed quotes, external sources, current platform instructions, medical/legal/financial guidance or unsupported factual claims. Do not use markdown or HTML. Do not repeat a generic checklist across sections. Mention GiftGrid naturally only where relevant, not in every section. Return {"title":"${title}","excerpt":"one clear sentence under 180 characters","intro":"paragraph","sections":[{"heading":"descriptive heading","paragraphs":["paragraph","paragraph"]}]}.`}]}),signal:AbortSignal.timeout(180000)});
   if(response.status===401 || response.status===403) { console.error('Article provider credential rejected.'); process.exit(1); }
   if(!response.ok) {if(response.status===429){await new Promise(r=>setTimeout(r,Math.min(60000,Number(response.headers.get('retry-after')||30)*1000)));attempt--;continue;} const failure=await response.json().catch(()=>({})); throw new Error(`Provider HTTP ${response.status}: ${String(failure.error?.message||'').slice(0,200)}`);}
   const data=await response.json(); const a=JSON.parse(data.choices[0].message.content);
   if(!a.title||!a.excerpt||!a.intro||!Array.isArray(a.sections)||a.sections.some(s=>!s.heading||!Array.isArray(s.paragraphs)||s.paragraphs.some(p=>typeof p!=='string'))) throw new Error('Invalid article structure');
   const words=count(a);if(words<700) throw new Error(`Only ${words} words`);
   const image=['Buyers','Products'].includes(category)?'gifting':category==='Operations'?'collaboration':'merchant-studio';
   const article={...a,slug,category,image:`/images/heroes/${image}.webp`,imageAlt:image==='gifting'?'Curated gift box with ceramic mug and linen notebook':image==='collaboration'?'A team planning a gifting project':'Product and packaging samples in a merchant studio',wordCount:words,date:'2026-09-05'};
   await writeFile(path,JSON.stringify(article,null,2)+'\n');
   if(checkpoint)await database('blog_articles?on_conflict=slug',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates'},body:JSON.stringify({slug,article,status:'draft'})});
   console.log(`${i+1}/50 ready: ${slug} (${words} words)`);done=true;break;
  } catch(error) {console.log(`${slug} attempt ${attempt+1}: ${error.message}`);await new Promise(r=>setTimeout(r,3000));}
 }
 if(!done) {process.exitCode=1;console.log(`FAILED: ${slug}`);}
}
