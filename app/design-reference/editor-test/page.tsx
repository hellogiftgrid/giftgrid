import { notFound } from 'next/navigation';
import WebsiteDesignEditor from '@/components/admin/WebsiteDesignEditor';
import { defaultSiteDesign } from '@/lib/content/site-design';
import { defaultPages } from '@/lib/content/site-pages';
export default function EditorTest(){if(process.env.NODE_ENV!=='development')notFound();return <WebsiteDesignEditor initial={defaultSiteDesign} initialPages={defaultPages()}/>;}
