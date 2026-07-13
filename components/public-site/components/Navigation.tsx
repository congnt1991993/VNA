import React, { useState, useEffect } from 'react';
import { Menu, X, LogIn, Globe } from 'lucide-react';
import { Logo } from './Logo';
import { useTranslation } from 'react-i18next';

interface NavigationProps {
  onNavigate: (sectionId: string) => void;
  activeSection?: string;
  onLoginClick: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onNavigate, activeSection, onLoginClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
    isScrolled ? 'bg-white/90 backdrop-blur-lg shadow-lg py-3 border-vna-blue/10' : 'bg-transparent py-6 border-transparent'
  }`;

  const textClasses = isScrolled ? 'text-vna-blue' : 'text-white';
  
  const menuItems = [
    { label: t('nav.overview'), id: 'overview' },
    { label: t('nav.esg_strategy'), id: 'pillars' },
    { label: t('nav.news'), id: 'news' },
    { label: t('nav.reports'), id: 'reports' },
    { label: t('nav.about'), id: 'about' }
  ];

  const toggleLanguage = () => {
    const newLang = i18n.language === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(newLang);
  };

  return (
    <nav className={navClasses}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo Area */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate('home')}>
          <Logo className="h-10 w-auto transition-transform duration-300 group-hover:scale-105" color={isScrolled ? '#006885' : 'white'} />
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative text-sm font-medium transition-colors py-2 ${
                activeSection === item.id 
                  ? 'text-vna-gold font-bold' 
                  : `${textClasses} hover:text-vna-gold`
              }`}
            >
              {item.label}
              {activeSection === item.id && (
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-[2px] bg-vna-gold rounded-full"></span>
              )}
            </button>
          ))}
          
          <button
            onClick={toggleLanguage}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full font-medium transition-all text-sm border ${
              isScrolled
                ? 'border-vna-blue/20 text-vna-blue hover:bg-vna-blue/5'
                : 'border-white/30 text-white hover:bg-white/20'
            }`}
          >
            <Globe size={16} />
            {i18n.language === 'vi' ? 'EN' : 'VI'}
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              onLoginClick();
            }}
            className={`flex items-center gap-2 px-5 py-2 rounded-full font-medium transition-all ${
              isScrolled
                ? 'bg-vna-blue text-white hover:bg-[#004e63]'
                : 'bg-white/20 text-white backdrop-blur-md hover:bg-white/30'
            }`}
          >
            <LogIn size={16} />
            {t('nav.login')}
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={`md:hidden ${textClasses}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t">
          <div className="flex flex-col p-4 gap-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`text-left font-medium py-2 border-b border-gray-100 ${
                  activeSection === item.id ? 'text-vna-blue' : 'text-gray-800'
                }`}
              >
                {item.label}
              </button>
            ))}
            
            <button
              onClick={() => {
                toggleLanguage();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-left font-medium text-gray-800 py-2 border-b border-gray-100"
            >
              <Globe size={18} />
              {i18n.language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
            </button>

            <button
              className="flex items-center gap-2 text-left font-bold text-vna-blue py-2 border-b border-gray-100 w-full"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onLoginClick();
              }}
            >
              <LogIn size={18} />
              {t('nav.login')}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;