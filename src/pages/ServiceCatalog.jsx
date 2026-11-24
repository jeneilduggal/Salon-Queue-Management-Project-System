import React, { useMemo, useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { Scissors, Sparkles, ShowerHead, Smile, Palette, ArrowRight, CheckCircle2 } from 'lucide-react';

const SERVICE_ICONS = { Scissors, Sparkles, ShowerHead, Smile, Palette };

function getCategory(service) {
  if (service.category) return service.category;
  const id = String(service.id || '').toLowerCase();
  if (id.includes('spa') || id.includes('massage') || id.includes('treatment')) return 'treatment';
  if (id.includes('beard') || id.includes('shave') || id.includes('facial')) return 'grooming';
  if (id.includes('color')) return 'color';
  return 'hair';
}

export function ServiceCatalog({ onNavigate }) {
  const { services, t, language } = useQueue();
  const [activeCategory, setActiveCategory] = useState('all');
  const categories = [
    { id: 'all', label: language === 'gu' ? 'બધી સેવાઓ' : 'All Services' },
    { id: 'hair', label: language === 'gu' ? 'હેરકટ્સ' : 'Hair' },
    { id: 'grooming', label: language === 'gu' ? 'શેવ અને દાઢી' : 'Grooming' },
    { id: 'treatment', label: language === 'gu' ? 'સ્પા અને થેરાપી' : 'Treatments' },
    { id: 'color', label: language === 'gu' ? 'કલરિંગ' : 'Color' },
  ];
  const visibleServices = useMemo(() => services.filter(s => s.active && (activeCategory === 'all' || getCategory(s) === activeCategory)), [services, activeCategory]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <header className="max-w-2xl mx-auto text-center space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-400">L'ÉLITE StyleQ · Service Menu</p>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">Services & Treatments</h1>
        <p className="text-sm text-gray-400 leading-relaxed">Explore available salon services, estimated durations and pricing before joining the live queue.</p>
      </header>

      <div className="flex flex-wrap justify-center gap-2">
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${activeCategory === cat.id ? 'bg-gold-500 text-charcoal-900 border-gold-500' : 'bg-charcoal-800 text-gray-300 border-charcoal-700 hover:border-gold-500/50'}`}>
            {cat.label}
          </button>
        ))}
      </div>

      {visibleServices.length === 0 ? (
        <div className="rounded-2xl border border-charcoal-700 bg-charcoal-800/70 p-8 text-center text-sm text-gray-400">No active services in this category.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleServices.map(service => {
            const Icon = SERVICE_ICONS[service.icon] || Scissors;
            return (
              <article key={service.id} className="rounded-2xl border border-charcoal-700 bg-charcoal-800/90 p-5 flex flex-col justify-between gap-5 shadow-lg">
                <div className="flex items-start justify-between gap-3">
                  <span className="w-11 h-11 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-400 flex items-center justify-center"><Icon className="w-5 h-5" /></span>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gold-400">₹{service.price}</p>
                    <p className="text-[11px] text-gray-400">{service.duration} {t.mins}</p>
                  </div>
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">{language === 'gu' ? service.nameGu : service.nameEn}</h2>
                  <p className="mt-2 text-xs leading-relaxed text-gray-400">{service.description || 'Professional salon service performed by our experienced team.'}</p>
                </div>
                <div className="pt-4 border-t border-charcoal-700 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-emerald-300 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Available</span>
                  <button onClick={() => onNavigate('join')} className="text-xs font-bold text-gold-400 hover:text-gold-300 flex items-center gap-1">Select <ArrowRight className="w-3.5 h-3.5" /></button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <section className="rounded-3xl border border-gold-500/25 bg-gradient-to-br from-charcoal-800 to-charcoal-900 p-7 sm:p-9 flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="text-center sm:text-left space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gold-400">Walk-ins & Digital Queue</p>
          <h2 className="text-2xl font-black text-white">Ready to join the queue?</h2>
          <p className="text-xs text-gray-400">Choose your service and reserve a place in the live salon queue.</p>
        </div>
        <button onClick={() => onNavigate('join')} className="px-6 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-charcoal-900 text-xs font-bold flex items-center gap-2">Join Queue <ArrowRight className="w-4 h-4" /></button>
      </section>
    </div>
  );
}
