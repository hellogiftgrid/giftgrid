import { defaultSiteDesign, type SiteDesign } from './site-design';

export type PageBlock = {
  id: string;
  type: 'hero' | 'platforms' | 'cards' | 'image_text' | 'text' | 'cta' | 'spacer' | 'faq';
  visible: boolean;
  title: string;
  eyebrow?: string;
  body?: string;
  image?: string;
  imageAlt?: string;
  buttonLabel?: string;
  buttonUrl?: string;
  secondaryLabel?: string;
  secondaryUrl?: string;
  background?: string;
  color?: string;
  align?: 'left' | 'center';
  padding?: number;
  height?: number;
  overlay?: number;
  speed?: number;
  cards?: { title: string; body: string; href?: string; image?: string }[];
};
export type SitePages = Record<string, PageBlock[]>;
export const pageLabels: Record<string,string> = {'/':'Home','/about':'About','/how-it-works':'How it works','/store-review':'Store review','/faq':'FAQs','/contact':'Contact','/blog':'Journal','/buyers/apply':'Buyer application','/giftgrid':'About the platform'};
const hero=(title:string,eyebrow:string,body:string,image='merchant-studio'):PageBlock=>({id:'hero',type:'hero',visible:true,title,eyebrow,body,image:`/images/heroes/${image}.webp`,imageAlt:image==='gifting'?'Curated gift box with ceramic mug and linen notebook':image==='collaboration'?'People planning a gifting project around a studio table':'Product and packaging samples in a merchant studio',padding:96,overlay:30,align:'left'});
export function defaultPages(design:SiteDesign=defaultSiteDesign):SitePages {const pages:SitePages = {
 '/':[
 {...hero(design.heroTitle,design.heroEyebrow,design.heroDescription,'collaboration'),buttonLabel:'Explore the community',buttonUrl:'/community',secondaryLabel:'For gifting buyers',secondaryUrl:'/buyers/apply',overlay:design.heroOverlay},
 {id:'community-activities',type:'cards',visible:true,eyebrow:'What happens here',title:'One community. Better gifting conversations.',body:'GiftGrid brings the people behind gifting together to discover products, share real needs, and find a practical next step.',padding:76,cards:[{title:'Buyers share the brief',body:'Gifting teams explain who they are buying for, what they need, and when they need it.',href:'/buyers/apply',image:'/images/heroes/gifting.webp'},{title:'Brands share what they make',body:'Independent brands present their products, capabilities, and ideas to the people looking for them.',href:'/market',image:'/images/heroes/merchant-studio.webp'},{title:'Members move ideas forward',body:'Explore conversations, meet people across the gifting ecosystem, and turn a good idea into a useful connection.',href:'/community',image:'/images/heroes/collaboration.webp'}]},
 {id:'what-giftgrid-does',type:'image_text',visible:true,eyebrow:'What we do',title:'We make it easier to find the right people and products.',body:'GiftGrid is a working community for corporate gifting buyers, independent brands, and the partners who help them deliver. Members share sourcing needs, discover products, introduce their work, and continue the conversation in one place.',image:'/images/heroes/collaboration.webp',imageAlt:'Gifting buyers and independent brands sharing product ideas',buttonLabel:'See the community',buttonUrl:'/community',padding:80},
 {id:'member-paths',type:'cards',visible:true,eyebrow:'A place for every side of gifting',title:'Bring what you know. Find what you need.',body:'The community works best when buyers, brands, and partners take part together.',padding:76,background:'#f1f5f9',cards:[{title:'Gifting buyers',body:'Share a brief, browse products, and hear from eligible brands that can meet your requirements.',href:'/buyers/apply'},{title:'Independent brands',body:'Show your products, tell your story, and respond to buyer needs with clear offers.',href:'/auth/join'},{title:'Partners and operators',body:'Exchange practical knowledge and build relationships across the gifting ecosystem.',href:'/community'}]},
 {id:'community-in-action',type:'text',visible:true,eyebrow:'How GiftGrid works',title:'A useful conversation starts with context.',body:'Buyers share what they are trying to accomplish. Brands bring products and delivery details. GiftGrid gives both sides a shared place to discover one another, ask questions, and move toward a considered decision.',padding:80},
 {id:'community-cta',type:'cta',visible:true,title:'Come see what the community is building.',body:'Meet gifting buyers, independent brands, and partners who are sharing ideas and making better connections.',buttonLabel:'Join GiftGrid',buttonUrl:'/auth/join',secondaryLabel:'Browse the community',secondaryUrl:'/community',padding:80}
 ],
 '/about':[hero('A community for the people behind better gifting.','What we do','GiftGrid brings gifting buyers, independent brands, and partners together to share products, sourcing needs, practical knowledge, and opportunities.','collaboration')],
 '/how-it-works':[hero('Meet, share, discover, and move forward.','How the community works','Buyers share what they need. Brands present products and capabilities. Members connect around real gifting projects and keep the next steps clear.','collaboration')],
 '/store-review':[hero('See your store through a buyer’s eyes.','Store readiness','A practical look at your public storefront, product presentation and the information buyers need to feel confident.')],
 '/faq':[hero('A little clarity goes a long way.','Your questions, answered','Understand the review process, merchant applications and what to expect when working with GiftGrid.','collaboration')],
 '/contact':[hero('Let’s talk about what comes next.','Contact GiftGrid','Tell us about your brand, your gifting plans or the question you need help answering.','collaboration')],
 '/blog':[hero('Ideas for your next chapter.','The GiftGrid Journal','Practical guides to stronger stores, thoughtful gifts and clearer commercial conversations.')],
 '/buyers/apply':[hero('One thoughtful brief. Better conversations.','For gifting teams','Tell us who you are gifting, what matters to them and when you need everything ready.','gifting')],
 '/giftgrid':[hero('Meet the community behind better gifting.','GiftGrid','A shared space where buyers, independent brands, and partners exchange products, ideas, and sourcing needs.','collaboration')]
}; return Object.fromEntries(Object.entries(pages).map(([path,blocks])=>[path,[...blocks,...(pageBodyBlocks[path]||[])]])); }
const types=['hero','platforms','cards','image_text','text','cta','spacer','faq'];
const cleanText=(v:unknown,max=8000)=>typeof v==='string'?v.slice(0,max):'';
export const safeLink=(v:unknown)=>typeof v==='string'&&(/^(\/(?!\/)|https:\/\/|mailto:)/.test(v))?v.slice(0,2000):'';
export const safeImage=(v:unknown)=>typeof v==='string'&&(/^(\/(?!\/)|https:\/\/)/.test(v))?v.slice(0,2000):'';
const color=(v:unknown,fallback:string)=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v)?v:fallback;
const number=(v:unknown,fallback:number,min:number,max:number)=>typeof v==='number'&&Number.isFinite(v)?Math.min(max,Math.max(min,v)):fallback;
export function normalizePages(input:unknown,design?:SiteDesign,legacySections?:unknown):SitePages {
 if (input && typeof input === 'object') input = JSON.parse(JSON.stringify(input, (_key, value) => typeof value === 'string' ? value.replace(/book a call/gi, 'Contact GiftGrid').replace(/^(https:\/\/(www\.)?degiftgrid\.com)?\/book(?:\/.*)?$/, '/contact') : value));
 const defaults=defaultPages(design);
 if((!input||typeof input!=='object')&&Array.isArray(legacySections)){
  const migrated=legacySections.filter(s=>s&&typeof s==='object'&&['text','image_text','gallery','spacer'].includes(s.type)).map(s=>({id:`legacy-${s.id}`,type:s.type==='gallery'?'cards':s.type,visible:s.visible!==false,title:s.title||'',eyebrow:s.eyebrow,body:s.body,image:s.imageUrl,buttonLabel:s.buttonLabel,buttonUrl:s.buttonUrl,padding:s.padding,height:s.height,align:s.align,background:s.background,color:s.color,cards:s.type==='gallery'?(s.items||[]).map((image:string)=>({title:'',body:'',image})):undefined}));
  if(migrated.length)return normalizePages({...defaults,'/':[...defaults['/'].slice(0,2),...migrated,...defaults['/'].slice(2)]},design);
 }
 if(!input||typeof input!=='object'||Array.isArray(input))return defaults;
 for(const path of Object.keys(defaults)) {const raw=(input as SitePages)[path];if(!Array.isArray(raw))continue;
 const ids=new Set<string>();
 defaults[path]=raw.slice(0,30).filter(b=>b&&typeof b==='object'&&types.includes(b.type)&&typeof b.id==='string'&&!ids.has(b.id)&&!!ids.add(b.id)).map(b=>({id:b.id.slice(0,100),type:b.type,visible:b.visible!==false,title:cleanText(b.title,300),eyebrow:cleanText(b.eyebrow,120),body:cleanText(b.body),image:safeImage(b.image),imageAlt:cleanText(b.imageAlt,300),buttonLabel:cleanText(b.buttonLabel,100),buttonUrl:safeLink(b.buttonUrl),secondaryLabel:cleanText(b.secondaryLabel,100),secondaryUrl:safeLink(b.secondaryUrl),background:color(b.background,'#ffffff'),color:color(b.color,'#0f172a'),align:b.align==='center'?'center':'left',padding:number(b.padding,80,0,180),height:number(b.height,64,8,400),overlay:number(b.overlay,30,0,80),speed:number(b.speed,34,12,90),cards:Array.isArray(b.cards)?b.cards.filter(c=>c&&typeof c==='object').slice(0,12).map(c=>({title:cleanText(c.title,200),body:cleanText(c.body,2000),href:safeLink(c.href),image:safeImage(c.image)})):[]}));
 }
 return defaults;
}

const pageBodyBlocks:Record<string,PageBlock[]> = {
  "/about": [
    {id:"about-community",type:"cards",visible:true,eyebrow:"What we do",title:"We bring the gifting ecosystem into one conversation.",body:"GiftGrid helps buyers and brands discover one another, share useful context, and take practical next steps.",padding:80,cards:[{title:"Make needs visible",body:"Buyers can describe the products, quantities, budgets, and timelines behind a gifting project."},{title:"Help brands be discovered",body:"Independent brands can show what they make and how they can fulfill a project."},{title:"Keep the conversation useful",body:"Members can connect around real requirements, compare options, and follow up with clarity."}]},
    {id:"about-next",type:"cta",visible:true,title:"A better gifting project starts with the right people.",body:"Explore the community and see what buyers, brands, and partners are sharing.",buttonLabel:"Explore the community",buttonUrl:"/community",padding:80}
  ],
  "/how-it-works": [
    {id:"community-steps",type:"cards",visible:true,eyebrow:"How GiftGrid works",title:"A shared path from first idea to next step.",body:"GiftGrid gives buyers, brands, and partners a practical place to find one another and work through real gifting needs.",padding:80,cards:[{title:"01 | Find your place",body:"Join as a buyer, independent brand, or partner and get to know the people in the community."},{title:"02 | Share what matters",body:"Buyers explain their project. Brands present the products and capabilities that fit."},{title:"03 | Discover options",body:"Browse products and community conversations to find ideas that match your audience and plans."},{title:"04 | Respond with clarity",body:"Eligible merchants can respond to buyer briefs with a product, price, minimum order, and lead time."},{title:"05 | Keep moving together",body:"Compare options, ask questions, discuss samples, and agree on the next step directly in GiftGrid."}]},
    {id:"how-next",type:"cta",visible:true,title:"The next useful connection starts here.",buttonLabel:"Explore the community",buttonUrl:"/community",secondaryLabel:"For gifting buyers",secondaryUrl:"/buyers/apply",padding:80}
  ],
  "/store-review": [
    {
      "id": "review-areas",
      "type": "cards",
      "visible": true,
      "title": "What your review looks at",
      "body": "Public storefront signals help identify areas for improvement. Some findings need manual review or further information from your team.",
      "padding": 80,
      "cards": [
        {
          "title": "Technical",
          "body": "HTTPS\nPage availability\nResponse status\nPage title & meta description\nCanonical & viewport\nHTML structure"
        },
        {
          "title": "Mobile & UX",
          "body": "Viewport configuration\nResponsive signals\nHorizontal overflow\nMobile layout signals"
        },
        {
          "title": "SEO",
          "body": "Title & description\nHeadings structure\nImage alt text\nCanonical tags\nIndexability signals"
        },
        {
          "title": "Accessibility",
          "body": "Alt text coverage\nForm labels\nHeading order\nBasic contrast signals\nStructural accessibility"
        },
        {
          "title": "Navigation",
          "body": "Internal links\nBroken links (where safely testable)\nPage availability"
        },
        {
          "title": "Product",
          "body": "Title & imagery\nDescription quality\nPricing clarity\nCTA presence\nReview/trust signals"
        }
      ]
    },
    {
      "id": "review-results",
      "type": "cards",
      "visible": true,
      "title": "Understand each finding",
      "body": "Use the finding, available evidence and recommendation to plan a practical next step.",
      "padding": 80,
      "background": "#f1f5f9",
      "cards": [
        {
          "title": "Passed",
          "body": "The check met the expected standard."
        },
        {
          "title": "Needs Attention",
          "body": "Works, but below the bar we'd recommend to buyers."
        },
        {
          "title": "Failed",
          "body": "Does not meet the standard and should be fixed."
        },
        {
          "title": "Not Tested",
          "body": "Couldn't be checked automatically."
        },
        {
          "title": "Manual Review",
          "body": "Requires a human judgment call from our team."
        }
      ]
    },
    {
      "id": "review-next",
      "type": "cta",
      "visible": true,
      "title": "Ready for a fresh perspective?",
      "buttonLabel": "Apply as a merchant",
      "buttonUrl": "/auth/sign-up",
      "padding": 80
    }
  ],
  "/faq": [
    {
      "id": "answers",
      "type": "faq",
      "visible": true,
      "title": "Your questions, answered",
      "padding": 80,
      "cards": [
        {
          "title": "What is GiftGrid?",
          "body": "GiftGrid is a platform that helps e-commerce brands prepare their stores, get a genuine readiness review, and get connected to relevant commercial opportunities — corporate gifting, wholesale, bulk buyers, procurement, distribution, and more — without applying to each one individually."
        },
        {
          "title": "Who can apply?",
          "body": "Any e-commerce brand with a live, publicly accessible store — Shopify or otherwise. There's no size requirement, but your store needs to be functional enough for us to review."
        },
        {
          "title": "What exactly does the store review check?",
          "body": "Six areas: technical health, mobile/UX, SEO, accessibility, navigation, and product presentation. Every check is either automated and human-verified, or flagged for manual review — see the Store Review page for the full breakdown."
        },
        {
          "title": "Do I need a perfect store to qualify?",
          "body": "No. Most stores have things to improve. GiftGrid's job is to tell you what those things are and, where useful, connect you with a trusted developer to fix them — not to reject stores for imperfections."
        },
        {
          "title": "Do I submit to opportunity platforms myself?",
          "body": "No. Once your store is ready, GiftGrid's team identifies the relevant opportunities and manages the submission on your behalf, tracking status and responses in your merchant portal."
        },
        {
          "title": "Is my store data shared with anyone?",
          "body": "Only where necessary and authorized — for example, submitting your store to an opportunity you've qualified for. GiftGrid doesn't share merchant data with unrelated third parties."
        },
        {
          "title": "How long does the review take?",
          "body": "It depends on our current review queue and how much manual verification your store needs. We'd rather give you an accurate answer when you apply than a number here that isn't reliable."
        },
        {
          "title": "What if I need development help before I qualify?",
          "body": "If the review turns up something worth fixing, we can introduce you to a trusted individual developer with a realistic expected timeframe for the specific work involved."
        },
        {
          "title": "Is there an upfront fee to be reviewed?",
          "body": "No. GiftGrid does not charge merchants upfront to be reviewed or listed unless a fee or commission arrangement has been clearly disclosed before it applies."
        },
        {
          "title": "Does a review guarantee a commercial opportunity?",
          "body": "No. A review helps your store become more prepared and helps GiftGrid identify relevant opportunities, but acceptance and final decisions belong to each opportunity partner."
        }
      ]
    },
    {
      "id": "faq-contact",
      "type": "cta",
      "visible": true,
      "title": "Something else on your mind?",
      "buttonLabel": "Contact GiftGrid",
      "buttonUrl": "/contact",
      "padding": 72
    }
  ]
};
