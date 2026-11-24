import React, { useState, useEffect } from 'react';
import { useQueue } from '../context/QueueContext';
import { 
  Tv, 
  Clock, 
  Bell, 
  Sparkles, 
  Users, 
  Scissors, 
  Volume2, 
  VolumeX 
} from 'lucide-react';
import { soundChime } from '../components/AudioNotification';

export function WaitingDisplay() {
  const { 
    t, 
    language,
    barbers, 
    tickets, 
    services, 
    lastCalled,
    getServicesTotals,
    calculateEstimatedWait 
  } = useQueue();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Live TV Clock ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Upcoming 5 tokens in queue (FIFO)
  const upNextTickets = tickets
    .filter(t => t.status === 'waiting')
    .sort((a, b) => a.createdAt - b.createdAt)
    .slice(0, 5);

  // Check if lastCalled happened recently (< 15 seconds) for golden pulsing banner
  const isRecentCall = lastCalled && (Date.now() - lastCalled.timestamp) < 15000;

  return (
    <div className="min-h-screen bg-charcoal-900 text-white p-6 sm:p-10 flex flex-col justify-between selection:bg-gold-500 selection:text-charcoal-900">
      
      {/* Top TV Bar: Salon Name, Clock, Sound indicator */}
      <div className="flex items-center justify-between pb-6 border-b-2 border-charcoal-800">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 text-charcoal-900 flex items-center justify-center font-black shadow-lg shadow-gold-500/20">
            <Scissors className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-display text-white">
              {t.salonName}
            </h1>
            <p className="text-gold-400 text-xs sm:text-sm font-semibold tracking-wider uppercase">
              {t.tvSubtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <button
            onClick={() => {
              setAudioEnabled(!audioEnabled);
              if (!audioEnabled) soundChime.playCallChime();
            }}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-xs font-semibold text-gray-300 hover:text-white"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4 text-gold-400" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
            <span className="hidden sm:inline">{audioEnabled ? t.soundNotificationOn : 'Chime Muted'}</span>
          </button>

          <div className="text-right">
            <p className="text-2xl sm:text-4xl font-black font-mono tracking-wider text-white">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
              {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* FLASHING GOLD BANNER WHEN TICKET IS NEWLY CALLED */}
      {isRecentCall && (
        <div className="my-6 p-6 rounded-3xl bg-gradient-to-r from-gold-500 via-amber-400 to-gold-500 text-charcoal-900 flex items-center justify-between shadow-2xl animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-charcoal-900 text-gold-400 flex items-center justify-center">
              <Bell className="w-8 h-8 animate-bounce-subtle" />
            </div>
            <div>
              <p className="text-xs uppercase font-black tracking-widest text-charcoal-800">
                {t.newlyCalledAlert}
              </p>
              <div className="flex items-baseline space-x-3">
                <span className="text-4xl sm:text-5xl font-black tracking-wider">
                  {lastCalled.token}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold">
                  {lastCalled.name}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right bg-charcoal-900/10 px-5 py-3 rounded-2xl border border-charcoal-900/20">
            <p className="text-xs uppercase font-bold text-charcoal-800">
              {t.pleaseProceedTo}
            </p>
            <p className="text-xl sm:text-2xl font-black">
              {lastCalled.barberName} (Station #{lastCalled.chair})
            </p>
          </div>
        </div>
      )}

      {/* Main Grid: Active Stations + Up Next Tokens */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-6 flex-1 items-stretch">
        
        {/* LEFT: Active Barber Stations (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-gold-400 flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>{t.nowServingHeader}</span>
          </h2>

          <div className="grid grid-cols-1 gap-4 flex-1">
            {barbers.map(barber => {
              const currentTicket = tickets.find(
                t => t.id === barber.currentTicketId && ['called', 'in_chair'].includes(t.status)
              );
              const isOnBreak = barber.onBreak;
              const isServing = Boolean(currentTicket);

              return (
                <div 
                  key={barber.id}
                  className={`p-6 rounded-3xl border-2 transition-all flex items-center justify-between ${
                    isServing
                      ? 'bg-charcoal-800/90 border-gold-500 shadow-xl shadow-gold-500/10'
                      : isOnBreak
                      ? 'bg-charcoal-900/70 border-charcoal-800 opacity-60'
                      : 'bg-charcoal-800/50 border-charcoal-700'
                  }`}
                >
                  {/* Barber Details */}
                  <div className="flex items-center space-x-4">
                    <span className="text-4xl p-2 bg-charcoal-900 rounded-2xl border border-charcoal-700">
                      {barber.avatar}
                    </span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-xl font-black text-white">{barber.name}</h3>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-charcoal-900 text-gray-400">
                          Station #{barber.chair}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {isOnBreak ? t.onBreak : isServing ? 'Serving Now' : t.available}
                      </p>
                    </div>
                  </div>

                  {/* Customer Token Badge */}
                  {currentTicket ? (
                    <div className="text-right">
                      <p className="text-xs text-gold-400 font-extrabold uppercase tracking-widest">
                        {t.nowLabel}
                      </p>
                      <div className="flex items-baseline space-x-2 justify-end">
                        <span className="text-3xl sm:text-4xl font-black text-gold-400 font-display">
                          {currentTicket.token}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-gray-200 mt-0.5">
                        {currentTicket.name}
                      </p>
                    </div>
                  ) : (
                    <span className={`text-sm font-bold px-4 py-2 rounded-2xl border ${
                      isOnBreak
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}>
                      {isOnBreak ? t.onBreak : t.available}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Up Next 5 Tokens (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wider text-gold-400 flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>{t.upNextHeader}</span>
            </h2>
            <span className="text-xs font-bold text-gray-400">
              Top 5 in line
            </span>
          </div>

          <div className="space-y-3 flex-1 flex flex-col justify-between">
            {upNextTickets.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 rounded-3xl bg-charcoal-800/40 border border-charcoal-700 text-center">
                <Scissors className="w-12 h-12 text-gray-600 mb-3" />
                <p className="text-base font-bold text-white">{t.noOneWaiting}</p>
                <p className="text-xs text-gray-400 mt-1">Walk-ins welcome</p>
              </div>
            ) : (
              upNextTickets.map((ticket, idx) => {
                const wait = calculateEstimatedWait(ticket);
                const isNext = idx === 0;

                return (
                  <div
                    key={ticket.id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                      isNext
                        ? 'bg-charcoal-800/90 border-gold-500/60 shadow-lg'
                        : 'bg-charcoal-800/50 border-charcoal-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black ${
                        isNext 
                          ? 'bg-gold-500 text-charcoal-900 shadow-md shadow-gold-500/20' 
                          : 'bg-charcoal-900 border border-charcoal-700 text-gold-400'
                      }`}>
                        {ticket.token}
                      </div>
                      <div>
                        <p className="text-base font-bold text-white">{ticket.name}</p>
                        <p className="text-xs text-gray-400">
                          {ticket.barberPreference === 'any' ? t.anyBarber : `For ${ticket.barberPreference}`}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs uppercase text-gray-400 tracking-wider font-semibold">
                        {t.aboutWait}
                      </span>
                      <p className="text-base font-extrabold text-gold-400">
                        ~{wait} {t.mins}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Footer Ticker */}
      <div className="pt-4 border-t border-charcoal-800 text-center text-xs text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>📍 Royal Cuts Salon & Spa · 2nd Floor, Grand Arcade</span>
        <span className="text-gold-400 font-semibold">✨ Join live from your phone at any time</span>
      </div>

    </div>
  );
}
