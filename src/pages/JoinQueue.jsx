import React, { useState, useMemo } from 'react';
import { useQueue } from '../context/QueueContext';
import { 
  Scissors, 
  Sparkles, 
  ShowerHead, 
  Smile, 
  HeartHandshake, 
  Palette, 
  Check, 
  Clock, 
  User, 
  Phone, 
  AlertCircle,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

const SERVICE_ICONS = {
  Scissors,
  Sparkles,
  ShowerHead,
  Smile,
  HeartHandshake,
  Palette
};

export function JoinQueue({ onNavigate }) {
  const { 
    t, 
    language, 
    services, 
    barbers, 
    queueOpen, 
    joinQueue, 
    calculateEstimatedWait, 
    tickets 
  } = useQueue();

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState(['haircut']);
  const [selectedBarberId, setSelectedBarberId] = useState('any');
  const [formError, setFormError] = useState('');
  const [duplicateTicket, setDuplicateTicket] = useState(null);

  // Active services from catalog
  const activeServices = useMemo(() => services.filter(s => s.active), [services]);

  // Toggle service selection with 3-service maximum rule
  const handleToggleService = (serviceId) => {
    setFormError('');
    if (selectedServiceIds.includes(serviceId)) {
      if (selectedServiceIds.length === 1) {
        setFormError(t.servicesValidationErr);
        return;
      }
      setSelectedServiceIds(selectedServiceIds.filter(id => id !== serviceId));
    } else {
      if (selectedServiceIds.length >= 3) {
        setFormError(language === 'gu' ? 'મહત્તમ ૩ સેવાઓ પસંદ કરી શકાય' : 'Maximum 3 services allowed per booking.');
        return;
      }
      setSelectedServiceIds([...selectedServiceIds, serviceId]);
    }
  };

  // Live Summary Calculation
  const { totalDuration, totalPrice } = useMemo(() => {
    let duration = 0;
    let price = 0;
    selectedServiceIds.forEach(id => {
      const s = activeServices.find(item => item.id === id);
      if (s) {
        duration += s.duration || 0;
        price += s.price || 0;
      }
    });
    return { totalDuration: duration, totalPrice: price };
  }, [selectedServiceIds, activeServices]);

  // Dynamic Expected Wait Time for this hypothetical join
  const liveExpectedWait = useMemo(() => {
    const dummyTicket = {
      id: 'preview',
      token: 'PREVIEW',
      serviceIds: selectedServiceIds,
      barberPreference: selectedBarberId,
      status: 'waiting',
      createdAt: Date.now()
    };
    return calculateEstimatedWait(dummyTicket);
  }, [selectedServiceIds, selectedBarberId, calculateEstimatedWait]);

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    setDuplicateTicket(null);

    if (!queueOpen) {
      setFormError(t.onlineQueueClosedDesc);
      return;
    }

    if (!name.trim()) {
      setFormError(t.nameValidationErr);
      return;
    }

    // Phone validation (10 digits)
    const cleanedPhone = phone.replace(/[\s-]/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanedPhone)) {
      setFormError(t.phoneValidationErr);
      return;
    }

    if (selectedServiceIds.length === 0) {
      setFormError(t.servicesValidationErr);
      return;
    }

    const result = joinQueue({
      name: name.trim(),
      phone: cleanedPhone,
      serviceIds: selectedServiceIds,
      barberPreference: selectedBarberId
    });

    if (result.success) {
      onNavigate(`status/${result.ticket.id}`);
    } else if (result.error === 'duplicate_phone') {
      setDuplicateTicket(result.existingTicket);
      setFormError(t.duplicatePhoneErr);
    } else {
      setFormError(result.error);
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
      
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
          {t.joinQueueTitle}
        </h1>
        <p className="text-gray-400 text-xs sm:text-sm mt-1">
          {t.joinQueueSubtitle}
        </p>
      </div>

      {/* Online Queue Closed Banner */}
      {!queueOpen && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-200 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-300">{t.onlineQueueClosed}</p>
            <p className="text-xs text-amber-200/90 mt-1">{t.onlineQueueClosedDesc}</p>
          </div>
        </div>
      )}

      {/* Duplicate Phone Notice */}
      {duplicateTicket && (
        <div className="mb-6 p-4 rounded-2xl bg-gold-500/20 border border-gold-500/50 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center space-x-3">
            <ShieldAlert className="w-6 h-6 text-gold-400 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gold-400 uppercase">{t.duplicatePhoneErr}</p>
              <p className="text-sm font-bold">Ticket: {duplicateTicket.token} ({duplicateTicket.name})</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate(`status/${duplicateTicket.id}`)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gold-500 text-charcoal-900 text-xs font-bold hover:bg-gold-400 transition-colors"
          >
            {t.viewExistingSpot}
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Step 1: Customer Details */}
        <div className="bg-charcoal-800/90 border border-charcoal-700 rounded-3xl p-5 sm:p-6 shadow-xl">
          <h2 className="text-xs uppercase font-bold tracking-wider text-gold-400 mb-4 flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>1. {t.customerInfo}</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                {t.fullName} *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setFormError('');
                }}
                placeholder={t.fullNamePlaceholder}
                className="w-full px-4 py-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm focus:outline-none focus:border-gold-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                {t.phoneNumber} (10 digits) *
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center space-x-1.5 text-xs font-semibold text-gray-400 border-r border-charcoal-700 pr-2.5">
                  <span>🇮🇳 +91</span>
                </div>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setPhone(val);
                    setFormError('');
                    setDuplicateTicket(null);
                  }}
                  placeholder={t.phonePlaceholder}
                  className="w-full pl-24 pr-4 py-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm focus:outline-none focus:border-gold-500 transition-colors font-mono tracking-wider"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Service Selection (Max 3) */}
        <div className="bg-charcoal-800/90 border border-charcoal-700 rounded-3xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs uppercase font-bold tracking-wider text-gold-400 flex items-center space-x-2">
              <Scissors className="w-4 h-4" />
              <span>2. {t.selectServices}</span>
            </h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-charcoal-900 border border-charcoal-700 text-gold-400 font-semibold">
              {selectedServiceIds.length}/3 {t.selectedCount}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeServices.map((service) => {
              const isSelected = selectedServiceIds.includes(service.id);
              const IconComponent = SERVICE_ICONS[service.icon] || Scissors;

              return (
                <div
                  key={service.id}
                  onClick={() => handleToggleService(service.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-150 flex items-center justify-between ${
                    isSelected
                      ? 'bg-gold-500/15 border-gold-500 text-white shadow-md shadow-gold-500/10'
                      : 'bg-charcoal-900/80 border-charcoal-700 hover:border-charcoal-600 text-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-gold-500 text-charcoal-900' : 'bg-charcoal-800 text-gold-400'
                    }`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-white">
                        {language === 'gu' ? service.nameGu : service.nameEn}
                      </p>
                      <p className="text-[11px] text-gray-400 flex items-center space-x-2 mt-0.5">
                        <span>{service.duration} {t.mins}</span>
                        <span>•</span>
                        <span className="text-gold-400 font-semibold">₹{service.price}</span>
                      </p>
                    </div>
                  </div>

                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                    isSelected ? 'bg-gold-500 border-gold-500 text-charcoal-900' : 'border-charcoal-600 bg-charcoal-800'
                  }`}>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 3: Barber Preference */}
        <div className="bg-charcoal-800/90 border border-charcoal-700 rounded-3xl p-5 sm:p-6 shadow-xl">
          <h2 className="text-xs uppercase font-bold tracking-wider text-gold-400 mb-4 flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>3. {t.selectBarber}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Any Barber (Fastest) */}
            <div
              onClick={() => setSelectedBarberId('any')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center space-x-3 ${
                selectedBarberId === 'any'
                  ? 'bg-gold-500/15 border-gold-500 text-white shadow-md shadow-gold-500/10'
                  : 'bg-charcoal-900/80 border-charcoal-700 text-gray-300 hover:border-charcoal-600'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                selectedBarberId === 'any' ? 'bg-gold-500 text-charcoal-900' : 'bg-charcoal-800 text-gold-400'
              }`}>
                ⚡
              </div>
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-semibold text-white">
                  {t.anyBarber}
                </p>
                <p className="text-[11px] text-gray-400">
                  {t.anyBarberDesc}
                </p>
              </div>
              {selectedBarberId === 'any' && (
                <div className="w-5 h-5 rounded-md bg-gold-500 text-charcoal-900 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </div>

            {/* Specific Barbers */}
            {barbers.map((barber) => {
              const isSelected = selectedBarberId === barber.id;
              const isOnBreak = barber.onBreak;

              return (
                <div
                  key={barber.id}
                  onClick={() => setSelectedBarberId(barber.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center space-x-3 ${
                    isSelected
                      ? 'bg-gold-500/15 border-gold-500 text-white shadow-md shadow-gold-500/10'
                      : 'bg-charcoal-900/80 border-charcoal-700 text-gray-300 hover:border-charcoal-600'
                  }`}
                >
                  <span className="text-2xl">{barber.avatar}</span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-xs sm:text-sm font-semibold text-white">{barber.name}</p>
                      {isOnBreak && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          {t.onBreak}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400">Station #{barber.chair}</p>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-md bg-gold-500 text-charcoal-900 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Dynamic Summary Box */}
        <div className="bg-gradient-to-br from-charcoal-800 to-charcoal-900 border border-gold-500/40 rounded-3xl p-5 shadow-2xl">
          <p className="text-xs uppercase font-bold tracking-wider text-gold-400 mb-3">
            {t.summaryTitle}
          </p>

          <div className="grid grid-cols-3 gap-2 py-3 border-y border-charcoal-700/80 text-center">
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-wider">{t.totalDuration}</p>
              <p className="text-base sm:text-lg font-bold text-white mt-0.5">{totalDuration} {t.mins}</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-wider">{t.totalPrice}</p>
              <p className="text-base sm:text-lg font-bold text-gold-400 mt-0.5">₹{totalPrice}</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-wider">{t.expectedWait}</p>
              <p className="text-base sm:text-lg font-bold text-white mt-0.5">~{liveExpectedWait} {t.mins}</p>
            </div>
          </div>

          {formError && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-5">
            <button
              type="submit"
              disabled={!queueOpen}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-base flex items-center justify-center space-x-2 transition-all ${
                queueOpen
                  ? 'bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-charcoal-900 shadow-xl shadow-gold-500/20 cursor-pointer active:scale-[0.99]'
                  : 'bg-charcoal-700 text-gray-400 cursor-not-allowed opacity-50'
              }`}
            >
              <span>{t.confirmJoinBtn}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

      </form>

    </div>
  );
}
