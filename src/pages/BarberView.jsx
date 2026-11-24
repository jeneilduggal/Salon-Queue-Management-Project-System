import React, { useState, useEffect } from 'react';
import { useQueue } from '../context/QueueContext';
import { 
  Scissors, 
  Play, 
  CheckCircle2, 
  Coffee, 
  Clock, 
  User, 
  PhoneCall, 
  AlertCircle,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { getNextCustomerForBarber } from '../utils/queueRules';

export function BarberView({ barberName = 'ravi', onNavigate }) {
  const { 
    t, 
    language,
    barbers, 
    tickets, 
    services, 
    toggleBarberBreak, 
    callNextForBarber, 
    startService, 
    completeService,
    getServicesTotals 
  } = useQueue();

  // Active selected barber
  const activeBarber = barbers.find(
    b => b.id.toLowerCase() === barberName.toLowerCase() || b.name.toLowerCase() === barberName.toLowerCase()
  ) || barbers[0];

  // Current ticket assigned to this barber
  const currentTicket = tickets.find(
    t => t.id === activeBarber.currentTicketId && ['called', 'in_chair'].includes(t.status)
  );

  // Next ticket in line for this barber
  const nextTicket = getNextCustomerForBarber(activeBarber.id, tickets);

  // Elapsed timer ticker for service
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    let interval = null;
    if (currentTicket && currentTicket.status === 'in_chair' && currentTicket.startedAt) {
      const updateTimer = () => {
        const secs = Math.floor((Date.now() - currentTicket.startedAt) / 1000);
        setElapsedSeconds(Math.max(0, secs));
      };
      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [currentTicket]);

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const { duration: expectedDuration } = currentTicket 
    ? getServicesTotals(currentTicket.serviceIds) 
    : { duration: 0 };

  return (
    <div className="py-6 px-4 sm:px-6 max-w-md mx-auto space-y-6">
      
      {/* Barber Station Switcher Bar */}
      <div className="flex items-center justify-between bg-charcoal-800 p-2 rounded-2xl border border-charcoal-700">
        <span className="text-xs font-bold text-gray-400 pl-2">
          {t.selectBarberStation}:
        </span>
        <div className="flex gap-1">
          {barbers.map(b => (
            <button
              key={b.id}
              onClick={() => onNavigate(`barber/${b.id}`)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                b.id === activeBarber.id
                  ? 'bg-gold-500 text-charcoal-900 shadow-sm'
                  : 'text-gray-300 hover:bg-charcoal-700'
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {/* Mirror Header */}
      <div className="bg-charcoal-800/90 border border-charcoal-700 rounded-3xl p-5 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <span className="text-3xl p-1 bg-charcoal-900 rounded-2xl border border-charcoal-700">
            {activeBarber.avatar}
          </span>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-black text-white">{activeBarber.name}</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/30">
                Chair #{activeBarber.chair}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {activeBarber.onBreak ? t.onBreak : t.available}
            </p>
          </div>
        </div>

        {/* Break Toggle Button */}
        <button
          onClick={() => toggleBarberBreak(activeBarber.id)}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeBarber.onBreak
              ? 'bg-amber-500 text-charcoal-900 shadow-md shadow-amber-500/20'
              : 'bg-charcoal-900 text-gray-300 hover:text-white border border-charcoal-700'
          }`}
        >
          <Coffee className="w-3.5 h-3.5" />
          <span>{activeBarber.onBreak ? t.onBreakToggle : t.availableToggle}</span>
        </button>
      </div>

      {/* On Break Notice */}
      {activeBarber.onBreak && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs flex items-center space-x-2.5">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>{t.breakActiveNotice}</span>
        </div>
      )}

      {/* Main Working Card: Current Customer */}
      <div className="bg-charcoal-800/90 border border-gold-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <p className="text-xs uppercase font-extrabold tracking-wider text-gold-400 mb-4 flex items-center space-x-1.5">
          <User className="w-4 h-4" />
          <span>{t.currentCustomer}</span>
        </p>

        {currentTicket ? (
          <div className="space-y-5">
            {/* Token & Customer Info */}
            <div className="flex items-center justify-between pb-4 border-b border-charcoal-700">
              <div>
                <span className="text-2xl sm:text-3xl font-black text-gold-400 font-display">
                  {currentTicket.token}
                </span>
                <h2 className="text-base font-bold text-white mt-1">
                  {currentTicket.name}
                </h2>
                <p className="text-xs text-gray-400 font-mono">
                  {currentTicket.phone}
                </p>
              </div>

              <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                currentTicket.status === 'in_chair'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-gold-500/20 text-gold-400 border-gold-500/40 animate-pulse'
              }`}>
                {currentTicket.status === 'in_chair' ? t.statusInChair : t.statusCalled}
              </span>
            </div>

            {/* Services */}
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold mb-1">
                {t.serviceBreakdown}
              </p>
              <div className="space-y-1">
                {currentTicket.serviceIds.map(id => {
                  const s = services.find(item => item.id === id);
                  return (
                    <div key={id} className="text-xs text-gray-300 flex justify-between">
                      <span>{language === 'gu' ? s?.nameGu : s?.nameEn}</span>
                      <span className="text-gold-400 font-semibold">{s?.duration}m</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Service Timer */}
            {currentTicket.status === 'in_chair' && (
              <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-700 text-center">
                <p className="text-[11px] text-gray-400 uppercase tracking-wider">
                  {t.serviceTimer}
                </p>
                <p className="text-3xl font-black text-white font-mono mt-1">
                  {formatTimer(elapsedSeconds)}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Target: {expectedDuration} {t.mins}
                </p>
              </div>
            )}

            {/* Big Action Buttons (Min height 48px for mirror touch targets) */}
            <div className="pt-2">
              {currentTicket.status === 'called' ? (
                <button
                  onClick={() => startService(currentTicket.id, activeBarber.id)}
                  className="w-full min-h-[52px] py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-base flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>{t.startBtn}</span>
                </button>
              ) : (
                <button
                  onClick={() => completeService(currentTicket.id, activeBarber.id)}
                  className="w-full min-h-[52px] py-3.5 px-6 rounded-2xl bg-gold-500 hover:bg-gold-400 text-charcoal-900 font-extrabold text-base flex items-center justify-center space-x-2 shadow-lg shadow-gold-500/30 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                  <span>{t.doneBtn}</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-charcoal-900 text-gray-500 flex items-center justify-center mx-auto border border-charcoal-700">
              <Scissors className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">{t.noCustomerInChair}</p>
              <p className="text-xs text-gray-400 mt-1">
                {activeBarber.onBreak ? t.breakActiveNotice : 'Tap below to call the next waiting client'}
              </p>
            </div>

            <button
              onClick={() => callNextForBarber(activeBarber.id)}
              disabled={activeBarber.onBreak || !activeBarber.onDuty}
              className={`w-full min-h-[52px] py-3.5 px-6 rounded-2xl font-extrabold text-sm flex items-center justify-center space-x-2 transition-all ${
                activeBarber.onBreak || !activeBarber.onDuty
                  ? 'bg-charcoal-900 text-gray-600 cursor-not-allowed border border-charcoal-800'
                  : 'bg-gold-500 hover:bg-gold-400 text-charcoal-900 shadow-xl shadow-gold-500/20 cursor-pointer'
              }`}
            >
              <PhoneCall className="w-5 h-5" />
              <span>{t.callCustomerHere}</span>
            </button>
          </div>
        )}
      </div>

      {/* Upcoming Client Preview Card */}
      <div className="bg-charcoal-800/80 border border-charcoal-700 rounded-3xl p-5">
        <p className="text-xs uppercase font-extrabold tracking-wider text-gray-400 mb-3 flex items-center space-x-1.5">
          <Clock className="w-3.5 h-3.5 text-gold-400" />
          <span>{t.nextForYou}</span>
        </p>

        {nextTicket ? (
          <div className="p-3.5 rounded-2xl bg-charcoal-900 border border-charcoal-700 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-extrabold text-gold-400 bg-gold-500/10 px-2 py-1 rounded-lg border border-gold-500/30">
                {nextTicket.token}
              </span>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white">{nextTicket.name}</p>
                <p className="text-[11px] text-gray-400">
                  {nextTicket.serviceIds.map(id => services.find(s => s.id === id)?.nameEn).join(', ')}
                </p>
              </div>
            </div>
            <span className="text-xs text-gold-400 font-semibold">
              {getServicesTotals(nextTicket.serviceIds).duration}m
            </span>
          </div>
        ) : (
          <p className="text-xs text-gray-400 text-center py-2">
            {t.noUpcomingCustomer}
          </p>
        )}
      </div>

    </div>
  );
}
