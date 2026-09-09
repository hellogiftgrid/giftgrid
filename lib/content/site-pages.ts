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
export const pageLabels: Record<string,string> = {'/':'Home','/about':'About','/how-it-works':'How it works','/store-review':'Store review','/faq':'FAQs','/contact':'Contact','/blog':'Journal','/book':'Book a call','/buyers/apply':'Buyer application','/giftgrid':'About the platform'};
const hero=(title:string,eyebrow:string,body:string,image='merchant-studio'):PageBlock=>({id:'hero',type:'hero',visible:true,title,eyebrow,body,image:`/images/heroes/${image}.webp`,imageAlt:image==='gifting'?'Curated gift box with ceramic mug and linen notebook':image==='collaboration'?'People planning a gifting project around a studio table':'Product and packaging samples in a merchant studio',padding:96,overlay:30,align:'left'});
export function defaultPages(design:SiteDesign=defaultSiteDesign):SitePages {const pages:SitePages = {
 '/':[
 {...hero(design.heroTitle,design.heroEyebrow,design.heroDescription,'gifting'),buttonLabel:design.merchantButton,buttonUrl:'/auth/sign-up',secondaryLabel:design.bookingButton,secondaryUrl:'/book',overlay:design.heroOverlay},
 {id:'platforms',type:'platforms',visible:true,title:'Works with leading commerce platforms',speed:34,padding:32},
 {id:'featured-picks',type:'cards',visible:true,eyebrow:'Featured picks',title:'A few places to start.',body:'Practical next steps for merchants and gifting teams exploring GiftGrid.',padding:72,cards:[{title:'A clearer storefront',body:'See what your public store communicates to a potential business buyer.',href:'/store-review',image:'/images/heroes/merchant-studio.webp'},{title:'A thoughtful gifting brief',body:'Share the audience, timing and priorities behind your next gifting project.',href:'/buyers/apply',image:'/images/heroes/gifting.webp'},{title:'A useful conversation',body:'Talk through your store, gifting plan or next commercial step with GiftGrid.',href:'/book',image:'/images/heroes/collaboration.webp'}]},
 {id:'paths',type:'cards',visible:true,eyebrow:'One connected platform',title:'Better gifting starts with the right people.',body:'A clear workspace for merchants preparing their brands and teams planning their next gifting project.',padding:80,cards:[{title:'For merchants',body:'Review your store, strengthen your profile and keep your commercial opportunities organized.',href:'/auth/sign-up'},{title:'For gifting teams',body:'Share your requirements and start a conversation about brands that fit your audience and timeline.',href:'/buyers/apply'},{title:'For growing teams',body:'Keep recommendations, documents, messages and next actions connected.',href:'/how-it-works'}]},
 {id:'steps',type:'cards',visible:true,eyebrow:'Your next chapter',title:'Prepare, position, and pursue.',padding:80,background:'#f1f5f9',cards:[{title:'01 · Review your store',body:'Understand what your public storefront communicates to a potential business buyer.',href:'/store-review'},{title:'02 · Strengthen your position',body:'Turn readiness recommendations into clear improvements and a stronger merchant profile.'},{title:'03 · Explore the right fit',body:'Prepare for relevant gifting, wholesale and other commercial conversations.'}]},
 {id:'workflow',type:'image_text',visible:true,title:'Work together without losing the thread.',eyebrow:'A clearer workflow',body:'Bring the brief, product information, documents and next steps into one shared conversation. Give your team a clear view of what needs attention.',image:'/images/heroes/collaboration.webp',imageAlt:'A team discussing product samples and a gifting plan',buttonLabel:'Explore how GiftGrid works',buttonUrl:'/how-it-works',padding:80},
 {id:'trust',type:'cards',visible:true,title:'Real reviews. Clear next actions.',eyebrow:'Why GiftGrid',padding:80,cards:[{title:'Human context',body:'Store reviews help you identify practical next steps, with room for questions and clarification.'},{title:'Organized information',body:'Keep your brand profile, commercial documents and opportunity conversations together.'},{title:'A considered fit',body:'Focus on opportunities that match what your business can realistically deliver.'}]},
 {id:'cta',type:'cta',visible:true,title:'Make room for your next opportunity.',body:'Start your merchant application or tell us about the gifts you are planning.',buttonLabel:'Apply as a merchant',buttonUrl:'/auth/sign-up',secondaryLabel:'Start a gifting request',secondaryUrl:'/buyers/apply',padding:80}
 ],
 '/about':[hero('Good products deserve a clearer path forward.','About GiftGrid','We help independent brands prepare for commercial opportunities and make it easier for gifting teams to start useful conversations.','collaboration')],
 '/how-it-works':[hero('From store review to your next step.','How GiftGrid works','Review your storefront, understand the recommendations and prepare for commercial conversations with a clearer plan.')],
 '/store-review':[hero('See your store through a buyer’s eyes.','Store readiness','A practical look at your public storefront, product presentation and the information buyers need to feel confident.')],
 '/faq':[hero('A little clarity goes a long way.','Your questions, answered','Understand the review process, merchant applications and what to expect when working with GiftGrid.','collaboration')],
 '/contact':[hero('Let’s talk about what comes next.','Contact GiftGrid','Tell us about your brand, your gifting plans or the question you need help answering.','collaboration')],
 '/blog':[hero('Ideas for your next chapter.','The GiftGrid Journal','Practical guides to stronger stores, thoughtful gifts and clearer commercial conversations.')],
 '/book':[hero('A useful conversation starts here.','Meet GiftGrid','Choose a time to discuss your store, your next steps or a gifting project.','collaboration')],
 '/buyers/apply':[hero('One thoughtful brief. Better conversations.','For gifting teams','Tell us who you are gifting, what matters to them and when you need everything ready.','gifting')],
 '/giftgrid':[hero('Meet the platform behind better gifting.','GiftGrid','A place for merchants to prepare, teams to collaborate and gifting conversations to move forward.','gifting')]
}; return Object.fromEntries(Object.entries(pages).map(([path,blocks])=>[path,[...blocks,...(pageBodyBlocks[path]||[])]])); }
const types=['hero','platforms','cards','image_text','text','cta','spacer','faq'];
const cleanText=(v:unknown,max=8000)=>typeof v==='string'?v.slice(0,max):'';
export const safeLink=(v:unknown)=>typeof v==='string'&&(/^(\/(?!\/)|https:\/\/|mailto:)/.test(v))?v.slice(0,2000):'';
export const safeImage=(v:unknown)=>typeof v==='string'&&(/^(\/(?!\/)|https:\/\/)/.test(v))?v.slice(0,2000):'';
const color=(v:unknown,fallback:string)=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v)?v:fallback;
const number=(v:unknown,fallback:number,min:number,max:number)=>typeof v==='number'&&Number.isFinite(v)?Math.min(max,Math.max(min,v)):fallback;
export function normalizePages(input:unknown,design?:SiteDesign,legacySections?:unknown):SitePages {
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
    {
      "id": "principles",
      "type": "cards",
      "visible": true,
      "eyebrow": "What we believe",
      "title": "How we work",
      "padding": 80,
      "cards": [
        {
          "title": "Merchant-first review",
          "body": "Before GiftGrid submits a store anywhere, it's actually reviewed — technically, structurally, and on product presentation. We don't forward stores that aren't ready."
        },
        {
          "title": "One application, many paths",
          "body": "Instead of applying separately to every gifting platform, wholesaler, or corporate buyer, merchants go through one process. GiftGrid handles the routing."
        },
        {
          "title": "A trusted developer network",
          "body": "When a store needs work before it's ready, GiftGrid can introduce merchants to individual developers we know and trust — not a faceless marketplace."
        }
      ]
    },
    {
      "id": "about-next",
      "type": "cta",
      "visible": true,
      "title": "Start with a conversation.",
      "body": "Tell us what your brand is working toward, or what you need for your next gifting project.",
      "buttonLabel": "Talk to GiftGrid",
      "buttonUrl": "/contact",
      "padding": 80
    }
  ],
  "/how-it-works": [
    {
      "id": "process",
      "type": "cards",
      "visible": true,
      "title": "A practical path forward",
      "padding": 80,
      "cards": [
        {
          "title": "01 · Apply or start your store review",
          "body": "Create your merchant account or start with a store review. GiftGrid gathers the information needed to understand your ecommerce business."
        },
        {
          "title": "02 · GiftGrid audits your store",
          "body": "GiftGrid evaluates important areas of your store, including buyer readiness, presentation, trust, commercial readiness and other factors visible from your public storefront."
        },
        {
          "title": "03 · Get recommendations",
          "body": "Your dashboard turns the findings into practical recommendations so you know what to improve and what to prioritize."
        },
        {
          "title": "04 · Prepare for commercial opportunities",
          "body": "GiftGrid helps merchants become more prepared for corporate gifting, wholesale enquiries and other commercial opportunities."
        },
        {
          "title": "05 · Speak with a GiftGrid expert",
          "body": "Need help implementing the recommendations? Book a call and GiftGrid connects you with an available team member."
        }
      ]
    },
    {
      "id": "how-next",
      "type": "cta",
      "visible": true,
      "title": "Take your next step with a clearer plan.",
      "buttonLabel": "Apply as a merchant",
      "buttonUrl": "/auth/sign-up",
      "secondaryLabel": "Book a call",
      "secondaryUrl": "/book",
      "padding": 80
    }
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
