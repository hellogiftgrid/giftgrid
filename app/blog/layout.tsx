import Header from '@/components/shared/Header';
import SiteFooter from '@/components/shared/SiteFooter';
export default function BlogLayout({children}:{children:React.ReactNode}){return <div className="site-themed min-h-screen"><Header/>{children}<SiteFooter/></div>;}
