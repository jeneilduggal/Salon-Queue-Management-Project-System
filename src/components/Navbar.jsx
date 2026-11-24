import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { 
  Scissors, 
  Globe, 
  RotateCcw, 
  Tv, 
  UserCheck, 
  LayoutDashboard, 
  Smartphone, 
  Sliders, 
  Menu, 
  X,
  Clock,
  Sparkles
} from 'lucide-react';

export function Navbar({ currentRoute, onNavigate }) {
  const { t, language, setLanguage, queueOpen, resetDemoData, myTicketId } = useQueue();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'gu' : 'en');
  };

  const navItems = [
    { id: 'home', label: t.navHome, icon: Sparkles },
    { id: 'join', label: t.navJoin, icon: Smartphone },
    { id: 'status', label: t.navMyStatus, icon: UserCheck, badge: myTicketId ? 'Active' : null },
    { id: 'reception', label: t.navReception, icon: LayoutDashboard },
    { id: 'barber', label: t.navBarber, icon: Scissors },
    { id: 'display', label: t.navTV, icon: Tv },
    { id: 'admin', label: t.navAdmin, icon: Sliders },
  ];

  const handleNav = (id) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-charcoal-900/95 backdrop-blur-md border-b border-charcoal-700 sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Salon Branding */}
          <div 
            onClick={() => handleNav('home')} 
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-charcoal-900 shadow-lg shadow-gold-500/20 group-hover:scale-105 transition-transform">
              <Scissors className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base sm:text-xl font-bold tracking-tight text-white font-display">
                  ROYAL CUTS
                </span>
                <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/30">
                  Salon & Spa
                </span>
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-gray-400">
                <span className={`w-2 h-2 rounded-full ${queueOpen ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                <span className="text-[11px] sm:text-xs">
                  {queueOpen ? t.openStatus : t.closedStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.id || (item.id === 'barber' && currentRoute.startsWith('barber'));
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`relative flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive 
                      ? 'bg-gold-500 text-charcoal-900 font-semibold shadow-md shadow-gold-500/20' 
                      : 'text-gray-300 hover:text-white hover:bg-charcoal-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-charcoal-900 text-gold-400 font-bold border border-gold-500/40">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Controls: Language & Reset & Mobile Toggle */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Language Toggle Button */}
            <button
              onClick={toggleLanguage}
              title="Switch language between English and Gujarati"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-charcoal-800 text-gold-400 border border-gold-500/30 hover:bg-charcoal-700 hover:border-gold-500 transition-all shadow-sm"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{t.langToggle}</span>
            </button>

            {/* Reset Demo Data Button */}
            <button
              onClick={() => {
                if (window.confirm("Reset queue to fresh demo state?")) {
                  resetDemoData();
                }
              }}
              title={t.demoReset}
              className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs text-gray-400 hover:text-white bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t.demoReset}</span>
            </button>

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-300 hover:text-white hover:bg-charcoal-800 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-charcoal-800 bg-charcoal-900 px-4 pt-3 pb-5 space-y-1">
          <div className="grid grid-cols-2 gap-2 mb-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center space-x-2 p-3 rounded-xl text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-gold-500 text-charcoal-900 font-semibold' 
                      : 'bg-charcoal-800/80 text-gray-200 hover:bg-charcoal-700'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto px-1.5 py-0.5 text-[10px] rounded-full bg-charcoal-900 text-gold-400">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-charcoal-800 flex justify-between items-center text-xs text-gray-400">
            <span>{queueOpen ? t.openStatus : t.closedStatus}</span>
            <button
              onClick={() => {
                resetDemoData();
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-1 text-gold-400 hover:underline"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t.demoReset}</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
