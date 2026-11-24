import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { 
  UserPlus, 
  Users, 
  Clock, 
  PhoneCall, 
  AlertTriangle, 
  Check, 
  X, 
  Scissors, 
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
  Play,
  CheckCircle2,
  Coffee
} from 'lucide-react';

export function ReceptionDashboard({ onNavigate }) {
  const { 
    t, 
    language,
    tickets, 
    barbers, 
    services, 
    queueOpen, 
    toggleQueueOpen, 
    callNextForBarber, 
    startService, 
    completeService, 
    markNoShow, 
    cancelTicket, 
    joinQueue,
    getServicesTotals 
  } = useQueue();

  // Walk-in modal state
  const [showAddWalkIn, setShowAddWalkIn] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInServices, setWalkInServices] = useState(['haircut']);
  const [walkInBarber, setWalkInBarber] = useState('any');
  const [modalError, setModalError] = useState('');

  // Active waiting queue (FIFO)
  const waitingQueue = tickets
    .filter(t => t.status === 'waiting')
    .sort((a, b) => a.createdAt - b.createdAt);

  const activeServices = services.filter(s => s.active);

  // Handle Quick Walk-in Submit
  const handleWalkInSubmit = (e) => {
    e.preventDefault();
    setModalError('');

    if (!walkInName.trim()) {
      setModalError(t.nameValidationErr);
      return;
    }
    const cleanPhone = walkInPhone.replace(/[\s-]/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setModalError(t.phoneValidationErr);
      return;
    }
    if (walkInServices.length === 0 || walkInServices.length > 3) {
      setModalError(t.servicesValidationErr);
      return;
    }

    const res = joinQueue({
      name: walkInName.trim(),
      phone: cleanPhone,
      serviceIds: walkInServices,
      barberPreference: walkInBarber
    });

    if (res.success) {
      setWalkInName('');
      setWalkInPhone('');
      setWalkInServices(['haircut']);
      setWalkInBarber('any');
      setShowAddWalkIn(false);
    } else if (res.error === 'duplicate_phone') {
      setModalError(`${t.duplicatePhoneErr} (Token: ${res.existingTicket.token})`);
    } else {
      setModalError(res.error);
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      
      {/* Top Tablet Navigation & Control Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-charcoal-800/90 border border-charcoal-700 p-5 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gold-400"></span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight font-display">
              {t.receptionTitle}
            </h1>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {t.receptionSubtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Add Walk-in Button */}
          <button
            onClick={() => setShowAddWalkIn(true)}
            className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gold-500 text-charcoal-900 font-bold text-xs hover:bg-gold-400 shadow-md shadow-gold-500/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>{t.addWalkInBtn}</span>
          </button>

          {/* Master Queue Open/Closed Toggle */}
          <button
            onClick={toggleQueueOpen}
            className={`flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
              queueOpen 
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25' 
                : 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
            }`}
          >
            {queueOpen ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            <span>{queueOpen ? t.queueToggleOpen : t.queueToggleClosed}</span>
          </button>
        </div>
      </div>

      {/* Main Two-Panel Layout (Tablet Landscape Optimized) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT PANEL: Barber Stations (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase font-extrabold tracking-wider text-gold-400 flex items-center space-x-1.5">
              <Scissors className="w-4 h-4" />
              <span>{t.barbersOverview}</span>
            </h2>
            <span className="text-xs text-gray-400">
              {barbers.filter(b => b.onDuty).length} active
            </span>
          </div>

          <div className="space-y-4">
            {barbers.map((barber) => {
              const currentTicket = tickets.find(t => t.id === barber.currentTicketId && ['called', 'in_chair'].includes(t.status));
              const isBusy = barber.status === 'busy' && currentTicket;
              const isOnBreak = barber.onBreak;
              const { duration: serviceDuration } = currentTicket ? getServicesTotals(currentTicket.serviceIds) : { duration: 0 };
              
              // Calculate elapsed minutes if in chair
              const elapsedMins = currentTicket?.startedAt 
                ? Math.floor((Date.now() - currentTicket.startedAt) / 60000) 
                : 0;
              const progressPct = serviceDuration > 0 ? Math.min(100, Math.round((elapsedMins / serviceDuration) * 100)) : 0;

              return (
                <div 
                  key={barber.id}
                  className={`p-5 rounded-3xl border transition-all ${
                    isOnBreak
                      ? 'bg-charcoal-900/60 border-charcoal-800 opacity-75'
                      : isBusy
                      ? 'bg-charcoal-800/90 border-gold-500/40 shadow-lg'
                      : 'bg-charcoal-800/70 border-charcoal-700'
                  }`}
                >
                  {/* Barber Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-charcoal-700/60">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{barber.avatar}</span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-bold text-white">{barber.name}</h3>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-charcoal-900 text-gray-400">
                            Chair #{barber.chair}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400">
                          {barber.onDuty ? 'On duty today' : 'Off duty'}
                        </p>
                      </div>
                    </div>

                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      isOnBreak
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : isBusy
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}>
                      {isOnBreak ? t.onBreak : isBusy ? (currentTicket.status === 'in_chair' ? t.inChair : t.statusCalled) : t.available}
                    </span>
                  </div>

                  {/* Customer in Chair Details */}
                  {currentTicket ? (
                    <div className="mt-3.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-extrabold text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded-lg border border-gold-500/30">
                            {currentTicket.token}
                          </span>
                          <span className="text-sm font-bold text-white ml-2">
                            {currentTicket.name}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {currentTicket.status === 'in_chair' ? `${elapsedMins}/${serviceDuration}m` : 'Called'}
                        </span>
                      </div>

                      {/* Progress bar */}
                      {currentTicket.status === 'in_chair' && (
                        <div className="w-full bg-charcoal-900 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-gold-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${progressPct}%` }}
                          ></div>
                        </div>
                      )}

                      {/* Station Actions: Start & Complete */}
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        {currentTicket.status === 'called' ? (
                          <button
                            onClick={() => startService(currentTicket.id, barber.id)}
                            className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>{t.startBtn}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => completeService(currentTicket.id, barber.id)}
                            className="w-full py-2 px-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-charcoal-900 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{t.doneBtn}</span>
                          </button>
                        )}

                        <button
                          onClick={() => markNoShow(currentTicket.id)}
                          className="w-full py-2 px-3 rounded-xl bg-charcoal-900 hover:bg-red-500/20 text-red-400 border border-charcoal-700 hover:border-red-500/40 font-semibold text-xs transition-colors"
                        >
                          {t.noShowBtn}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <p className="text-xs text-gray-400">
                        {isOnBreak ? t.onBreak : t.noActiveCustomer}
                      </p>

                      <button
                        onClick={() => callNextForBarber(barber.id)}
                        disabled={isOnBreak || !barber.onDuty}
                        className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                          isOnBreak || !barber.onDuty
                            ? 'bg-charcoal-900 text-gray-500 cursor-not-allowed border border-charcoal-800'
                            : 'bg-gold-500 text-charcoal-900 hover:bg-gold-400 shadow-md shadow-gold-500/20 cursor-pointer'
                        }`}
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>{t.callNextBtn}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANEL: Waiting Queue List (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase font-extrabold tracking-wider text-gold-400 flex items-center space-x-1.5">
              <Users className="w-4 h-4" />
              <span>{t.waitingQueueHeader}</span>
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-charcoal-800 border border-charcoal-700 text-white font-semibold">
              {waitingQueue.length} {t.peopleWaiting}
            </span>
          </div>

          {waitingQueue.length === 0 ? (
            <div className="p-12 rounded-3xl bg-charcoal-800/40 border border-charcoal-700 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-sm font-bold text-white">{t.noOneWaiting}</p>
              <p className="text-xs text-gray-400">All customers have been served.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {waitingQueue.map((ticket, index) => {
                const elapsedWaitMins = Math.floor((Date.now() - ticket.createdAt) / 60000);
                const isOver60Min = elapsedWaitMins >= 60;
                const { duration, price } = getServicesTotals(ticket.serviceIds);
                const prefBarber = barbers.find(b => b.id === ticket.barberPreference);

                return (
                  <div
                    key={ticket.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      isOver60Min
                        ? 'bg-amber-950/30 border-amber-500/50 shadow-md'
                        : 'bg-charcoal-800/90 border-charcoal-700/80 hover:border-gold-500/30'
                    }`}
                  >
                    {/* Token & Info */}
                    <div className="flex items-center space-x-3.5">
                      <div className="w-11 h-11 rounded-xl bg-charcoal-900 border border-gold-500/30 flex items-center justify-center font-extrabold text-sm text-gold-400">
                        {ticket.token}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-bold text-white">{ticket.name}</p>
                          <span className="text-[11px] text-gray-400 font-mono">
                            {ticket.phone}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-gray-300 mt-1">
                          <span className="text-gray-400">
                            {ticket.serviceIds.map(id => services.find(s => s.id === id)?.nameEn).join(' + ')}
                          </span>
                          <span>•</span>
                          <span className="text-gold-400 font-semibold">
                            {duration}m · ₹{price}
                          </span>
                          <span>•</span>
                          <span className="text-gray-400">
                            Barber: <strong className="text-white">{ticket.barberPreference === 'any' ? t.anyBarber : prefBarber?.name}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Waiting Duration & Action Buttons */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-charcoal-700/50">
                      <div className="text-right mr-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          isOver60Min 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse' 
                            : 'text-gray-400'
                        }`}>
                          {elapsedWaitMins}m wait
                        </span>
                      </div>

                      <button
                        onClick={() => markNoShow(ticket.id)}
                        title="Mark No-Show"
                        className="px-2.5 py-1.5 rounded-xl bg-charcoal-900 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-charcoal-700 hover:border-red-500/30 transition-colors"
                      >
                        {t.noShowBtn}
                      </button>

                      <button
                        onClick={() => cancelTicket(ticket.id)}
                        title="Cancel Spot"
                        className="px-2.5 py-1.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-700 text-gray-400 hover:text-white text-xs font-semibold border border-charcoal-700 transition-colors"
                      >
                        {t.cancelBtn}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Quick Add Walk-in Modal */}
      {showAddWalkIn && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-charcoal-900 border border-charcoal-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-charcoal-700">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-gold-400" />
                <span>{t.walkInModalTitle}</span>
              </h3>
              <button
                onClick={() => setShowAddWalkIn(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWalkInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">{t.fullName} *</label>
                <input
                  type="text"
                  required
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  placeholder="e.g. Ramesh Bhai"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white text-sm focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">{t.phoneNumber} (10 digits) *</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={walkInPhone}
                  onChange={(e) => setWalkInPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white text-sm focus:outline-none focus:border-gold-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">{t.selectServices} (Max 3)</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                  {activeServices.map(s => {
                    const isSelected = walkInServices.includes(s.id);
                    return (
                      <div
                        key={s.id}
                        onClick={() => {
                          if (isSelected) {
                            if (walkInServices.length > 1) {
                              setWalkInServices(walkInServices.filter(id => id !== s.id));
                            }
                          } else {
                            if (walkInServices.length < 3) {
                              setWalkInServices([...walkInServices, s.id]);
                            }
                          }
                        }}
                        className={`p-2 rounded-xl border text-xs cursor-pointer flex items-center justify-between ${
                          isSelected ? 'bg-gold-500/20 border-gold-500 text-white' : 'bg-charcoal-800 border-charcoal-700 text-gray-300'
                        }`}
                      >
                        <span className="truncate">{s.nameEn}</span>
                        <span className="text-gold-400 font-semibold ml-1">₹{s.price}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">{t.selectBarber}</label>
                <select
                  value={walkInBarber}
                  onChange={(e) => setWalkInBarber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white text-sm focus:outline-none focus:border-gold-500"
                >
                  <option value="any">{t.anyBarber}</option>
                  {barbers.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} (Chair #{b.chair}) {b.onBreak ? `[${t.onBreak}]` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {modalError && (
                <p className="text-xs text-red-400">{modalError}</p>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddWalkIn(false)}
                  className="flex-1 py-2.5 rounded-xl bg-charcoal-800 text-gray-300 text-xs font-semibold hover:bg-charcoal-700"
                >
                  {t.close}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gold-500 text-charcoal-900 text-xs font-bold hover:bg-gold-400 shadow-md shadow-gold-500/20"
                >
                  {t.quickSubmit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
