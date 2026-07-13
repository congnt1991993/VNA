import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';
import Navigation from './components/Navigation';
import Pillars from './components/Pillars';
import PillarDetail from './components/PillarDetail';
import ReportArchive from './components/ReportArchive';
import ESGReports from './components/ESGReports';
import IntroductionPage from './components/IntroductionPage';
import NewsSection from './components/NewsSection';
import { EmissionsChart, SocialImpactChart } from './components/Charts';
import { HERO_DATA } from './constants';
import { Logo } from './components/Logo';
import { ArrowDown, Facebook, Twitter, Linkedin, Youtube, Mail, Phone, MapPin } from 'lucide-react';

interface PublicSiteProps {
  onLoginClick: () => void;
}

const PublicSite: React.FC<PublicSiteProps> = ({ onLoginClick }) => {
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState<string>('home');
  
  const heroRef = useRef<HTMLDivElement>(null);
  const overviewRef = useRef<HTMLDivElement>(null);
  const pillarsRef = useRef<HTMLDivElement>(null);
  const newsRef = useRef<HTMLDivElement>(null);
  const reportsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Remove overflow-hidden from body when on public landing page to allow mouse scroll
    document.body.classList.remove('overflow-hidden');
    
    // Add scroll snap classes to HTML element to enable auto-snap to sections
    document.documentElement.classList.add('snap-y', 'snap-mandatory', 'scroll-smooth');
    
    return () => {
      // Restore overflow-hidden when unmounting (leaving public site)
      document.body.classList.add('overflow-hidden');
      
      // Remove scroll snap classes from HTML element
      document.documentElement.classList.remove('snap-y', 'snap-mandatory', 'scroll-smooth');
    };
  }, []);

  const scrollToSection = (id: string) => {
    if (id === 'esg-reports') {
      setCurrentView(id);
      window.scrollTo(0, 0);
      return;
    }

    if (id === 'about') {
      setCurrentView(id);
      window.scrollTo(0, 0);
      return;
    }

    // If not on home, go home first, then scroll (simple implementation)
    if (currentView !== 'home' && currentView !== 'environment' && currentView !== 'social' && currentView !== 'governance') {
        setCurrentView('home');
        setTimeout(() => {
            const element = document.getElementById(id);
             if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
             }
        }, 100);
        return;
    }

    if (currentView !== 'home') {
        setCurrentView('home');
        setTimeout(() => {
            const element = document.getElementById(id);
             if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
             }
        }, 100);
        return;
    }

    const refs: { [key: string]: React.RefObject<HTMLDivElement> } = {
      'hero': heroRef,
      'overview': overviewRef,
      'pillars': pillarsRef,
      'news': newsRef,
      'reports': reportsRef
    };
    
    const element = refs[id]?.current;
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80, // Offset for sticky header
        behavior: 'smooth'
      });
    }
  };

  const handlePillarDetailClick = (id: string) => {
    setCurrentView(id);
    window.scrollTo(0, 0);
  };

  // RENDER ESG REPORTS VIEW
  if (currentView === 'esg-reports') {
    return (
      <>
        <Navigation 
          onNavigate={(id) => scrollToSection(id)} 
          activeSection="esg-reports"
          onLoginClick={onLoginClick}
        />
        <ESGReports onBack={() => setCurrentView('home')} />
        <Footer />
      </>
    );
  }

  // RENDER INTRODUCTION PAGE VIEW
  if (currentView === 'about') {
    return (
      <>
        <Navigation 
          onNavigate={(id) => scrollToSection(id)} 
          activeSection="about"
          onLoginClick={onLoginClick}
        />
        <IntroductionPage onBack={() => setCurrentView('home')} />
        <Footer />
      </>
    );
  }

  // RENDER DETAIL VIEW
  if (currentView !== 'home') {
    return (
        <>
            <Navigation 
              onNavigate={(id) => scrollToSection(id)} 
              activeSection="pillars"
              onLoginClick={onLoginClick}
            />
            {/* Removed pt-20 to allow transparent nav to sit OVER the hero image */}
            <div> 
                <PillarDetail 
                    pillarId={currentView} 
                    onBack={() => setCurrentView('home')} 
                />
            </div>
            <Footer />
        </>
    );
  }

  // RENDER HOME VIEW
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navigation onNavigate={scrollToSection} onLoginClick={onLoginClick} />

      {/* HERO SECTION */}
      <header 
        ref={heroRef}
        id="hero"
        className="relative h-screen flex items-center justify-center overflow-hidden bg-sky-50 snap-start"
      >
        <div className="absolute inset-0">
          <img 
            src={HERO_DATA.imageUrl} 
            alt="Vietnam Airlines" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#005F6E]/60 via-[#005F6E]/20 to-transparent mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent"></div>
          
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-white rounded-full opacity-50 animate-ping"></div>
          <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-vna-gold rounded-full opacity-40 animate-pulse"></div>
          <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-yellow-200 rounded-full opacity-60 animate-bounce"></div>
          <div className="absolute top-1/2 right-1/3 w-3 h-3 bg-white rounded-full opacity-30 animate-ping"></div>
        </div>

        <div className="relative container mx-auto px-6 text-center z-10 pt-20">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-lg px-6 py-2 rounded-full border border-white/30 mb-8 animate-bounce shadow-xl">
            <span className="text-white font-bold tracking-widest text-sm uppercase drop-shadow-md">{i18n.language === 'en' ? 'Net Zero 2050 Commitment' : 'Cam kết Net Zero 2050'}</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight animate-fade-in-up drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] leading-tight text-white">
            {i18n.language === 'en' ? "Reaching Sustainable Heights" : HERO_DATA.headline}
          </h1>
          <p className="text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto mb-10 font-medium leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            {i18n.language === 'en' ? "Vietnam Airlines' commitment to a green future, a prosperous society, and transparent governance." : HERO_DATA.subheadline}
          </p>
          <button 
            onClick={() => scrollToSection('overview')}
            className="bg-vna-gold/90 backdrop-blur-sm border border-vna-gold text-vna-blue px-8 py-4 rounded-full font-bold text-lg hover:bg-vna-gold transition-all shadow-[0_0_20px_rgba(230,180,65,0.4)] transform hover:-translate-y-1"
          >
            {i18n.language === 'en' ? 'Explore the Green Journey' : 'Khám phá Hành trình Xanh'}
          </button>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer" onClick={() => scrollToSection('overview')}>
          <ArrowDown size={32} className="text-white/70 hover:text-white transition-colors drop-shadow-md" />
        </div>
      </header>

      {/* OVERVIEW SECTION */}
      <section ref={overviewRef} id="overview" className="min-h-[calc(100vh-80px)] py-12 md:py-16 bg-gradient-to-b from-slate-50 to-vna-blue/5 snap-start scroll-mt-20 flex flex-col justify-center">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-vna-gold font-bold tracking-[0.2em] uppercase text-xs mb-4 block flex items-center gap-3">
                <span className="w-12 h-[2px] bg-vna-gold rounded-full"></span> 
                {t('app.ceo_message')}
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight tracking-tight">
                {i18n.language === 'en' ? (
                  <>More than just an Airline,<br/>we are the bridge to <span className="text-vna-blue">sustainable development</span>.</>
                ) : (
                  <>Không chỉ là Hãng hàng không,<br/>chúng tôi là cầu nối của sự <span className="text-vna-blue">phát triển bền vững</span>.</>
                )}
              </h2>
              <p className="text-gray-600 text-base leading-relaxed mb-6 border-l-4 border-vna-gold pl-4 text-justify">
                "{t('app.ceo_quote')}"
              </p>
              <div className="flex items-center gap-6 mt-6">
                 <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 border-vna-gold shadow-lg flex-shrink-0">
                   {/* Professional portrait */}
                   <img src="/vna-images/ceo.png" className="w-full h-full object-cover" alt="CEO" />
                 </div>
                 <div>
                   <div className="font-bold text-slate-900 text-lg">
                     {i18n.language === 'en' ? 'Mr. Le Hong Ha' : 'Ông Lê Hồng Hà'}
                   </div>
                   <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">
                     {i18n.language === 'en' ? 'CEO of Vietnam Airlines' : 'Tổng Giám đốc Vietnam Airlines'}
                   </div>
                 </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[16/10] md:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                 {/* Bright Aerial Landscape */}
                 <img src="/vna-images/a321.jpg" className="w-full h-full object-cover" alt="Vietnam Airlines Sustainable" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-vna-blue text-white p-5 rounded-xl shadow-lg max-w-[240px] hidden md:block border-t-4 border-vna-gold">
                <div className="text-3xl font-bold mb-1 text-vna-gold">30 {i18n.language === 'en' ? 'Years' : 'Năm'}</div>
                <div className="text-xs text-white uppercase tracking-widest font-semibold mb-1">
                  {i18n.language === 'en' ? 'Companion' : 'Đồng hành'}
                </div>
                <div className="text-xs opacity-90 leading-relaxed">
                  {i18n.language === 'en' 
                    ? 'For the prosperous and sustainable development of our planet' 
                    : 'Cùng sự phát triển thịnh vượng và bền vững của hành tinh'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PILLARS SECTION */}
      <div ref={pillarsRef} className="snap-start scroll-mt-20">
        <Pillars onDetailClick={handlePillarDetailClick} />
      </div>

      {/* NEWS SECTION */}
      <div ref={newsRef} className="snap-start scroll-mt-20">
        <NewsSection />
      </div>

      {/* REPORTS SECTION */}
      <div ref={reportsRef} className="snap-start scroll-mt-20">
        <ReportArchive />
      </div>

      <div className="snap-start">
        <Footer />
      </div>
    </div>
  );
};

const Footer: React.FC = () => {
  const { t, i18n } = useTranslation();
  return (
    <footer className="bg-vna-blue text-white py-20 border-t-[12px] border-vna-gold">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <div className="flex items-center gap-3 mb-8">
                 <Logo className="h-10 w-auto opacity-90" color="white" />
                 <div className="h-8 w-[1px] bg-white/20 mx-2"></div>
                 <span className="text-lg font-light tracking-wide text-white">ESG REPORT 2024</span>
              </div>
              <p className="text-white/80 text-base leading-relaxed mb-8 max-w-md font-light">
                {i18n.language === 'en' 
                  ? "Vietnam Airlines is committed to fulfilling the role of the National Flag Carrier, pioneering sustainable development, and bringing long-term value to the community and the environment."
                  : "Vietnam Airlines cam kết thực hiện vai trò Hãng hàng không Quốc gia, tiên phong trong phát triển bền vững và mang lại giá trị dài hạn cho cộng đồng và môi trường."}
              </p>
              <div className="flex gap-4">
                <a href="https://www.facebook.com/VietnamAirlines" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-vna-gold hover:border-vna-gold hover:text-vna-blue transition-all"><Facebook size={18}/></a>
                <a href="https://twitter.com/VietnamAirlines" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-vna-gold hover:border-vna-gold hover:text-vna-blue transition-all"><Twitter size={18}/></a>
                <a href="https://www.linkedin.com/company/vietnam-airlines" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-vna-gold hover:border-vna-gold hover:text-vna-blue transition-all"><Linkedin size={18}/></a>
                <a href="https://www.youtube.com/user/VietnamAirlinesCorp" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-vna-gold hover:border-vna-gold hover:text-vna-blue transition-all"><Youtube size={18}/></a>
              </div>
            </div>

            <div className="md:text-right md:flex md:flex-col md:items-end">
              <h4 className="font-bold text-xl mb-6 text-vna-gold">{i18n.language === 'en' ? 'Contact & Support' : 'Liên hệ & Hỗ trợ'}</h4>
              <ul className="space-y-5 text-white/90 text-base font-light">
                <li className="flex items-start gap-4 md:justify-end">
                  <MapPin size={20} className="mt-1 flex-shrink-0 text-vna-gold" />
                  <span>
                    {i18n.language === 'en' 
                      ? '200 Nguyen Son, Long Bien District, Hanoi, Vietnam' 
                      : '200 Nguyễn Sơn, Long Biên, Hà Nội, Việt Nam'}
                  </span>
                </li>
                <li className="flex items-center gap-4 md:justify-end">
                  <Phone size={20} className="flex-shrink-0 text-vna-gold" />
                  <span>(+84-24) 38732 732</span>
                </li>
                <li className="flex items-center gap-4 md:justify-end">
                  <Mail size={20} className="flex-shrink-0 text-vna-gold" />
                  <span>esg@vietnamairlines.com</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-white/70 font-light">
            <p>{t('footer.copyright')}</p>
            <div className="flex gap-8 mt-6 md:mt-0">
              <a href="https://www.vietnamairlines.com/vn/vi/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                {i18n.language === 'en' ? 'Terms & Conditions' : 'Điều khoản'}
              </a>
              <a href="https://www.vietnamairlines.com/vn/vi/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                {i18n.language === 'en' ? 'Privacy Policy' : 'Bảo mật'}
              </a>
            </div>
          </div>
        </div>
    </footer>
  );
};

export default PublicSite;