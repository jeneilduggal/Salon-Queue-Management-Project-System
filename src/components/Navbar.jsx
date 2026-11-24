import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { useAuth } from '../context/AuthContext';
import {
  Scissors, Globe, RotateCcw, Tv, UserCheck, LayoutDashboard,
  Smartphone, Sliders, Menu, X, Sparkles, Compass, Lock,
  LogIn, LogOut, UserCircle
} from 'lucide-react';

export function Navbar({ currentRoute, onNavigate }) {
  const { t, language, setLanguage, queueOpen, resetDemoData, myTicketId } = useQueue();
  const { user, isAuthenticated, logout, openLoginFor } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: t.navHome, icon: Sparkles },
    { id: 'services', label: t.navServices || 'Services', icon: Compass },
    { id: 'join', label: t.navJoin, icon: Smartphone },
    { id: 'status', label: t.navMyStatus, icon: UserCheck, badge: myTicketId ? 'Active' : null },
    { id: 'reception', label: t.navReception, icon: LayoutDashboard, locked: true },
    { id: 'barber', label: t.navBarber, icon: Scissors, locked: true },
    { id: 'display', label: t.navTV, icon: Tv },
    { id: 'admin', label: t.navAdmin, icon: Sliders, locked: true },
  ];

  const navigate = (id) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };
  const toggleLanguage = () => setLanguage(language === 'en' ? 'gu' : 'en');

  const renderNavItems = (mobile = false) => navItems.map((item) => {
    const Icon = item.icon;
    const active = currentRoute === item.id || (item.id === 'barber' && currentRoute.startsWith('barber'));
    return (
      <button key={item.id} onClick={() => navigate(item.id)}
        className={`${mobile ? 'w-full justify-start p-3' : 'px-3 py-2'} relative flex items-center gap-2 rounded-xl text-xs font-semibold transition-all ${active ? 'bg-gold-500 text-charcoal-900 shadow-md' : mobile ? 'bg-charcoal-800 text-gray-200 hover:bg-charcoal-700' : 'text-gray-300 hover:text-white hover:bg-charcoal-800'}`}>
        <Icon className="w-4 h-4 shrink-0" />
        <span>{item.label}</span>
        {item.locked && !isAuthenticated && <Lock className="w-3 h-3 opacity-60" />}
        {item.badge && <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-charcoal-900 text-gold-400">{item.badge}</span>}
      </button>
    );
  });

  return (
    <nav className="bg-charcoal-900/95 backdrop-blur-md border-b border-charcoal-700 sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-16 sm:min-h-20 gap-3">
          <button onClick={() => navigate('home')} className="flex items-center gap-3 text-left shrink-0">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 text-charcoal-900 flex items-center justify-center shadow-lg"><Scissors className="w-5 h-5" /></span>
            <span>
              <span className="block text-base sm:text-xl font-bold text-white tracking-tight">L'ÉLITE StyleQ</span>
              <span className="flex items-center gap-1.5 text-[11px] text-gray-400"><span className={`w-2 h-2 rounded-full ${queueOpen ? 'bg-emerald-400' : 'bg-amber-400'}`} />{queueOpen ? t.openStatus : t.closedStatus}</span>
            </span>
          </button>

          <div className="hidden xl:flex items-center gap-1">{renderNavItems()}</div>

          <div className="flex items-center gap-2 shrink-0">
            <button onClick={toggleLanguage} title="Switch language" className="px-2.5 py-2 rounded-xl text-xs font-semibold bg-charcoal-800 text-gold-400 border border-gold-500/30"><Globe className="w-4 h-4 inline mr-1" />{t.langToggle}</button>
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-[11px] text-gray-300 max-w-24 truncate"><UserCircle className="w-4 h-4 inline mr-1" />{user.name}</span>
                <button onClick={logout} className="px-2.5 py-2 rounded-xl text-xs text-gray-200 bg-charcoal-800 border border-charcoal-700 hover:text-white"><LogOut className="w-4 h-4 inline mr-1" />Logout</button>
              </div>
            ) : (
              <button onClick={() => openLoginFor('receptionist')} className="hidden sm:inline-flex px-3 py-2 rounded-xl text-xs font-bold bg-gold-500 text-charcoal-900 hover:bg-gold-400"><LogIn className="w-4 h-4 inline mr-1" />Staff Login</button>
            )}
            <button onClick={() => setMobileMenuOpen(v => !v)} className="xl:hidden p-2 rounded-xl text-gray-200 hover:bg-charcoal-800" aria-label="Toggle navigation">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <button onClick={() => { if (window.confirm('Reset queue to fresh demo state?')) resetDemoData(); }} title={t.demoReset} className="hidden lg:flex p-2 rounded-xl text-gray-400 hover:text-white bg-charcoal-800 border border-charcoal-700"><RotateCcw className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-charcoal-800 bg-charcoal-900 px-4 py-4 space-y-2">
          <div className="grid grid-cols-2 gap-2">{renderNavItems(true)}</div>
          {isAuthenticated ? (
            <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="w-full p-3 rounded-xl bg-charcoal-800 text-gray-100 text-xs text-left"><LogOut className="w-4 h-4 inline mr-2" />Logout · {user.name}</button>
          ) : (
            <button onClick={() => { openLoginFor('receptionist'); setMobileMenuOpen(false); }} className="w-full p-3 rounded-xl bg-gold-500 text-charcoal-900 text-xs font-bold text-left"><LogIn className="w-4 h-4 inline mr-2" />Staff Login</button>
          )}
          <div className="flex justify-between items-center text-xs text-gray-400 pt-2 border-t border-charcoal-800">
            <span>{queueOpen ? t.openStatus : t.closedStatus}</span>
            <button onClick={() => { resetDemoData(); setMobileMenuOpen(false); }} className="text-gold-400"><RotateCcw className="w-3 h-3 inline mr-1" />{t.demoReset}</button>
          </div>
        </div>
      )}
    </nav>
  );
}
