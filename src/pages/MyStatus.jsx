import React, { useState, useEffect } from 'react';
import { useQueue } from '../context/QueueContext';
import { 
  Sparkles, 
  Clock, 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  User, 
  Scissors, 
  X,
  PhoneCall,
  ArrowLeft
} from 'lucide-react';

export function MyStatus({ ticketId, onNavigate }) {
  const { 
    t, 
    language,
    tickets, 
    barbers, 
    services, 
    cancelTicket, 
    calculateEstimatedWait, 
    getQueuePosition,
    getServicesTotals
  } = useQueue();

  const [showCancelModal, setShowCancelModal] = useState(false);

  // Find target ticket
  const ticket = tickets.find(t => t.id === ticketId || t.token === ticketId);

  // Associated assigned or preferred barber
  const assignedBarber = barbers.find(b => b.id === (ticket?.assignedBarberId || ticket?.barberPreference));
  const isPreferredBarberOnBreak = assignedBarber?.onBreak;

  // Real-time position & wait time
  const position = ticket ? getQueuePosition(ticket.id) : 0;
  const estimatedWait = ticket ? calculateEstimatedWait(ticket) : 0;
  const { duration: totalDuration, price: totalPrice } = ticket 
    ? getServicesTotals(ticket.serviceIds) 
    : { duration: 0, price: 0 };

  // Trigger vibration when ticket is called
  useEffect(() => {
    if (ticket?.status === 'called' && typeof window !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([300, 150, 300, 150, 500]);
      } catch (e) {
        // Ignore vibration error
      }
    }
  }, [ticket?.status]);

  if (!ticket) {
    return (
      <div className="py-16 px-4 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-charcoal-800 border border-charcoal-700 flex items-center justify-center mx-auto text-gold-400 mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">
          {language === 'gu' ? 'ટોકન મળ્યું નથી' : 'Ticket Not Found'}
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          {language === 'gu' 
            ? 'આ ટોકન સક્રિય નથી અથવા રદ કરવામાં આવ્યું છે.' 
            : 'This token does not exist or has expired from the live queue.'}
        </p>
        <button
          onClick={() => onNavigate('home')}
          className="px-6 py-3 rounded-xl bg-gold-500 text-charcoal-900 font-bold text-sm hover:bg-gold-400 transition-colors"
        >
          {t.navHome}
        </button>
      </div>
    );
  }

  // Position label helper
  const getPositionText = () => {
    if (ticket.status === 'in_chair') return t.currentlyServing;
    if (ticket.status === 'called') return t.statusCalled;
    if (position === 1) return t.firstInLine;
    if (position === 2) return t.secondInLine;
    if (position === 3) return t.thirdInLine;
    if (position === 4) return t.fourthInLine;
    if (position === 5) return t.fifthInLine;
    return `${position} ${t.nthInLine}`;
  };

  // FULL-SCREEN GOLD TAKEOVER WHEN CALLED
  if (ticket.status === 'called') {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-gold-500 via-gold-400 to-amber-500 text-charcoal-900 flex flex-col items-center justify-center p-6 text-center animate-gold-glow">
        <div className="max-w-md w-full bg-charcoal-900/90 rounded-3xl p-8 border border-white/20 shadow-2xl backdrop-blur-xl text-white space-y-6 animate-pulse-subtle">
          
          <div className="w-20 h-20 rounded-full bg-gold-500 text-charcoal-900 flex items-center justify-center mx-auto shadow-xl">
            <Bell className="w-10 h-10 animate-bounce-subtle" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full bg-gold-500/20 text-gold-400 font-extrabold text-xs uppercase tracking-widest border border-gold-500/40">
              {ticket.token}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold mt-3 text-gold-400 font-display">
              {t.itsYourTurnTitle}
            </h1>
            <p className="text-lg text-gray-200 mt-2 font-medium">
              {t.goToBarberPrefix} <span className="font-bold text-white text-xl">{assignedBarber?.name || 'Staff'}</span>
            </p>
            <p className="text-sm text-gold-300 mt-1">
              {t.chairStation} #{assignedBarber?.chair || 1}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-charcoal-800/80 border border-charcoal-700 text-xs text-gray-300 space-y-1">
            <p className="font-semibold text-white">{ticket.name}</p>
            <p>{ticket.serviceIds.map(id => services.find(s => s.id === id)?.nameEn).join(', ')}</p>
          </div>

          <button
            onClick={() => onNavigate('home')}
            className="w-full py-3.5 px-6 rounded-xl bg-gold-500 text-charcoal-900 font-bold text-sm hover:bg-gold-400 transition-colors shadow-lg"
          >
            {language === 'gu' ? 'સમજાઈ ગયું' : 'Got it — Walking in now'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-xl mx-auto space-y-6">
      
      {/* Top Back Nav */}
      <button
        onClick={() => onNavigate('home')}
        className="flex items-center space-x-1.5 text-xs text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t.navHome}</span>
      </button>

      {/* 2nd IN LINE BANNER: "Start coming to the salon!" */}
      {position === 2 && ticket.status === 'waiting' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-600/30 to-amber-500/20 border-2 border-amber-400 text-white flex items-center space-x-3 shadow-xl animate-pulse">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-charcoal-900 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
              {language === 'gu' ? 'ધ્યાન આપો!' : 'Action Required'}
            </p>
            <p className="text-sm font-extrabold text-white">
              {t.startComingBanner}
            </p>
          </div>
        </div>
      )}

      {/* Barber On Break Notice */}
      {isPreferredBarberOnBreak && ticket.status === 'waiting' && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center space-x-2.5">
          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{t.barberBreakNotice}</span>
        </div>
      )}

      {/* Main Ticket Card */}
      <div className="bg-charcoal-800/95 border border-charcoal-700 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur text-center">
        
        {/* Token Badge */}
        <div className="inline-block px-6 py-2 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-600 text-charcoal-900 font-extrabold text-3xl sm:text-4xl shadow-lg shadow-gold-500/20 tracking-wider">
          {ticket.token}
        </div>

        <p className="text-white text-base font-bold mt-3">
          {ticket.name}
        </p>

        {/* Status Badge */}
        <div className="mt-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
            ticket.status === 'in_chair' 
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' 
              : ticket.status === 'done' 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-gold-500/20 text-gold-400 border border-gold-500/40'
          }`}>
            {ticket.status === 'in_chair' ? t.statusInChair : ticket.status === 'done' ? t.statusDone : t.statusWaiting}
          </span>
        </div>

        {/* Position in Line */}
        {ticket.status === 'waiting' && (
          <div className="mt-4">
            <p className="text-xs uppercase text-gray-400 tracking-wider font-semibold">
              {t.yourPosition}
            </p>
            <p className="text-xl sm:text-2xl font-black text-white mt-0.5">
              {getPositionText()}
            </p>
          </div>
        )}

        {/* Circular Countdown Progress */}
        {ticket.status === 'waiting' && (
          <div className="my-8 flex flex-col items-center justify-center">
            <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center">
              {/* Outer SVG Ring */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-charcoal-700"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-gold-500 transition-all duration-1000"
                  strokeWidth="8"
                  strokeDasharray="264"
                  strokeDashoffset={Math.max(20, 264 - (position > 0 ? (1 / position) * 200 : 50))}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              
              {/* Center Content */}
              <div className="absolute flex flex-col items-center text-center">
                <Clock className="w-5 h-5 text-gold-400 mb-1" />
                <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                  {t.expectedWait}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">
                  ~{estimatedWait}
                </span>
                <span className="text-xs text-gold-400 font-semibold">{t.mins}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {language === 'gu' ? 'કતાર જેમ આગળ વધશે તેમ સમય આપોઆપ ઘટશે' : 'Updates dynamically in real-time'}
            </p>
          </div>
        )}

        {/* In Chair State */}
        {ticket.status === 'in_chair' && (
          <div className="my-6 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-200 text-sm">
            <p className="font-bold text-white text-base">✂️ {t.statusInChair}</p>
            <p className="text-xs text-gray-300 mt-1">
              {assignedBarber?.name ? `Being served by ${assignedBarber.name} at Chair #${assignedBarber.chair}` : 'Service started'}
            </p>
          </div>
        )}

        {/* Done State */}
        {ticket.status === 'done' && (
          <div className="my-6 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-center space-y-2">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
            <p className="font-bold text-white text-base">{t.statusDone}</p>
            <p className="text-xs text-gray-300">{t.thankYouMessage}</p>
          </div>
        )}

        {/* Services & Summary Card */}
        <div className="mt-6 pt-5 border-t border-charcoal-700 text-left space-y-3">
          <p className="text-xs uppercase font-bold text-gray-400 tracking-wider">
            {t.serviceBreakdown}
          </p>
          
          <div className="space-y-2">
            {ticket.serviceIds.map(id => {
              const s = services.find(item => item.id === id);
              if (!s) return null;
              return (
                <div key={id} className="flex justify-between items-center text-xs text-gray-300 py-1 border-b border-charcoal-700/50">
                  <span>{language === 'gu' ? s.nameGu : s.nameEn}</span>
                  <span className="font-semibold text-white">₹{s.price} ({s.duration}m)</span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-2 text-sm font-bold">
            <span className="text-gray-300">{t.totalPrice}</span>
            <span className="text-gold-400 text-base">₹{totalPrice}</span>
          </div>

          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>{t.preferredBarber}</span>
            <span className="font-medium text-white">
              {ticket.barberPreference === 'any' ? t.anyBarber : (assignedBarber?.name || ticket.barberPreference)}
            </span>
          </div>
        </div>

        {/* Cancel Spot Button (Only if waiting) */}
        {ticket.status === 'waiting' && (
          <div className="mt-8 pt-4">
            <button
              onClick={() => setShowCancelModal(true)}
              className="w-full py-3 px-4 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-colors"
            >
              {t.cancelSpotBtn}
            </button>
          </div>
        )}

      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-charcoal-900 border border-charcoal-700 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">
              {t.cancelModalTitle}
            </h3>
            <p className="text-xs text-gray-300">
              {t.cancelModalDesc}
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="py-2.5 px-4 rounded-xl bg-charcoal-800 text-gray-300 font-semibold text-xs hover:bg-charcoal-700 transition-colors"
              >
                {t.keepMySpot}
              </button>
              <button
                onClick={() => {
                  cancelTicket(ticket.id);
                  setShowCancelModal(false);
                }}
                className="py-2.5 px-4 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-500 transition-colors"
              >
                {t.confirmCancel}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
