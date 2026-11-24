import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { 
  Users, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  Search,
  CheckCircle2,
  Coffee
} from 'lucide-react';

export function Home({ onNavigate }) {
  const { 
    t, 
    language,
    queueOpen, 
    barbers, 
    activeWaitingCount, 
    totalEstimatedWaitTime, 
    myTicketId,
    tickets
  } = useQueue();

  const [trackInput, setTrackInput] = useState('');
  const [trackError, setTrackError] = useState('');

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    const token = trackInput.trim().toUpperCase();
    if (!token) return;

    const found = tickets.find(t => t.token === token || t.id === token);
    if (found) {
      onNavigate(`status/${found.id}`);
    } else {
      setTrackError(language === 'gu' ? 'ટોકન મળ્યું નથી' : 'Ticket not found. Check token format.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      
      {/* Top Banner if Active Ticket exists on this device */}
      {myTicketId && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-gold-500/20 via-charcoal-800 to-charcoal-800 border border-gold-500/40 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500 text-charcoal-900 font-bold flex items-center justify-center text-sm">
              {myTicketId}
            </div>
            <div>
              <p className="text-xs text-gold-400 font-semibold uppercase tracking-wider">
                {language === 'gu' ? 'તમારું ચાલુ ટોકન' : 'Active Spot Found'}
              </p>
              <p className="text-sm font-medium text-white">
                {language === 'gu' ? 'તમારું ટોકન લાઇવ ટ્રેક કરો' : 'You have an active spot in queue'}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate(`status/${myTicketId}`)}
            className="px-4 py-2 rounded-xl bg-gold-500 text-charcoal-900 text-xs font-bold hover:bg-gold-400 transition-colors flex items-center space-x-1"
          >
            <span>{t.trackMySpotBtn}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Hero Header */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t.tagline}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
          {t.salonName}
        </h1>
        <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
          {language === 'gu' 
            ? 'સલૂનમાં બેઠા વગર તમારા ફોનથી લાઈવ કતારમાં જોડાવો અને તમારો વારો આવે ત્યારે પહોંચો.' 
            : 'Skip the weekend salon rush. Join our live queue from your phone and walk in right when it is your turn.'}
        </p>
      </div>

      {/* Main Live Queue Status Card */}
      <div className="bg-charcoal-800/90 border border-charcoal-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden mb-8 backdrop-blur">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-charcoal-700">
          
          {/* Waiting Count */}
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-charcoal-900 border border-gold-500/30 flex items-center justify-center text-gold-400 shadow-inner">
              <Users className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">
                {t.liveQueueStatus}
              </p>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-white">
                  {activeWaitingCount}
                </span>
                <span className="text-sm font-medium text-gray-300">
                  {activeWaitingCount === 1 ? t.personWaiting : t.peopleWaiting}
                </span>
              </div>
            </div>
          </div>

          {/* Wait Time Estimate */}
          <div className="flex items-center space-x-4 bg-charcoal-900/60 px-5 py-3.5 rounded-2xl border border-charcoal-700/60">
            <Clock className="w-6 h-6 text-gold-400" />
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">
                {t.aboutWait}
              </p>
              <p className="text-lg sm:text-xl font-bold text-white">
                {activeWaitingCount === 0 ? '0 ' + t.mins : `~${totalEstimatedWaitTime} ${t.mins}`}
              </p>
            </div>
          </div>
        </div>

        {/* Empty state note */}
        {activeWaitingCount === 0 && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{t.noOneWaiting}</span>
          </div>
        )}

        {/* Barbers on Duty Chips */}
        <div className="mt-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {t.barberStatusTitle}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {barbers.map((barber) => {
              const isBusy = barber.status === 'busy';
              const isOnBreak = barber.onBreak || barber.status === 'on_break';
              const isAvailable = barber.status === 'available';

              let statusText = t.available;
              let badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
              if (isOnBreak) {
                statusText = t.onBreak;
                badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
              } else if (isBusy) {
                statusText = t.busy;
                badgeColor = 'bg-red-500/20 text-red-300 border-red-500/40';
              }

              return (
                <div 
                  key={barber.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-charcoal-900/80 border border-charcoal-700 hover:border-gold-500/40 transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="text-2xl">{barber.avatar}</span>
                    <div>
                      <p className="text-sm font-semibold text-white">{barber.name}</p>
                      <p className="text-[11px] text-gray-400">Chair #{barber.chair}</p>
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${badgeColor}`}>
                    {statusText}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Queue Closed Notice if turned off */}
        {!queueOpen && (
          <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-300">{t.onlineQueueClosed}</p>
              <p className="text-xs text-amber-200/80 mt-0.5">{t.onlineQueueClosedDesc}</p>
            </div>
          </div>
        )}

        {/* Primary CTA Button */}
        <div className="mt-8">
          <button
            onClick={() => onNavigate('join')}
            disabled={!queueOpen}
            className={`w-full py-4 px-6 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center space-x-2 shadow-xl transition-all duration-200 ${
              queueOpen
                ? 'bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-charcoal-900 shadow-gold-500/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
                : 'bg-charcoal-700 text-gray-400 cursor-not-allowed opacity-60'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span>{t.joinQueueBtn}</span>
            <ArrowRight className="w-5 h-5 ml-1" />
          </button>
        </div>
      </div>

      {/* Secondary Action: Track Existing Token */}
      <div className="bg-charcoal-800/50 border border-charcoal-700/60 rounded-2xl p-5 mb-8">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          {t.trackMySpotBtn}
        </p>
        <form onSubmit={handleTrackSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={trackInput}
              onChange={(e) => {
                setTrackInput(e.target.value);
                setTrackError('');
              }}
              placeholder={t.enterTokenPlaceholder}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm focus:outline-none focus:border-gold-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-charcoal-700 hover:bg-gold-500 hover:text-charcoal-900 text-white text-xs font-bold transition-colors"
          >
            {t.trackMySpotBtn}
          </button>
        </form>
        {trackError && (
          <p className="text-xs text-red-400 mt-2">{trackError}</p>
        )}
      </div>

      {/* Footer Features */}
      <div className="grid grid-cols-3 gap-3 text-center pt-4 border-t border-charcoal-800 text-xs text-gray-400">
        <div>
          <p className="font-semibold text-white">⚡ Instant Wait</p>
          <p className="text-[11px] text-gray-500">Live dynamic counter</p>
        </div>
        <div>
          <p className="font-semibold text-white">🔔 You're Next Alert</p>
          <p className="text-[11px] text-gray-500">Notification at 2nd spot</p>
        </div>
        <div>
          <p className="font-semibold text-white">✂️ Top Barbers</p>
          <p className="text-[11px] text-gray-500">Pick preferred artist</p>
        </div>
      </div>

    </div>
  );
}
