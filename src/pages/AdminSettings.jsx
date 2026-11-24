import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { 
  Sliders, 
  Users, 
  Clock, 
  DollarSign, 
  AlertOctagon, 
  Check, 
  Plus, 
  Edit2, 
  RotateCcw, 
  ToggleLeft, 
  ToggleRight,
  ShieldAlert,
  Scissors
} from 'lucide-react';

export function AdminSettings() {
  const { 
    t, 
    language,
    services, 
    barbers, 
    stats, 
    queueOpen, 
    toggleQueueOpen, 
    toggleServiceActive, 
    saveService,
    addService,
    toggleBarberDuty, 
    resetDemoData 
  } = useQueue();

  // New Service Modal / Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [formNameEn, setFormNameEn] = useState('');
  const [formNameGu, setFormNameGu] = useState('');
  const [formDuration, setFormDuration] = useState(30);
  const [formPrice, setFormPrice] = useState(200);

  const handleStartEdit = (service) => {
    setEditingServiceId(service.id);
    setFormNameEn(service.nameEn);
    setFormNameGu(service.nameGu);
    setFormDuration(service.duration);
    setFormPrice(service.price);
  };

  const handleSaveEdit = (serviceId) => {
    const existing = services.find(s => s.id === serviceId);
    if (!existing) return;

    saveService({
      ...existing,
      nameEn: formNameEn.trim(),
      nameGu: formNameGu.trim(),
      duration: Number(formDuration),
      price: Number(formPrice)
    });
    setEditingServiceId(null);
  };

  const handleCreateNewService = (e) => {
    e.preventDefault();
    if (!formNameEn.trim()) return;

    const newId = `srv_${Date.now()}`;
    addService({
      id: newId,
      nameEn: formNameEn.trim(),
      nameGu: formNameGu.trim() || formNameEn.trim(),
      duration: Number(formDuration),
      price: Number(formPrice),
      icon: 'Scissors',
      active: true
    });

    setFormNameEn('');
    setFormNameGu('');
    setFormDuration(30);
    setFormPrice(200);
    setShowAddModal(false);
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-charcoal-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display">
            {t.adminTitle}
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            {t.adminSubtitle}
          </p>
        </div>

        <button
          onClick={() => {
            if (window.confirm("Reset all queue tickets and load fresh demo data?")) {
              resetDemoData();
            }
          }}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-charcoal-800 hover:bg-gold-500 hover:text-charcoal-900 border border-charcoal-700 text-gray-300 text-xs font-bold transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{t.demoReset}</span>
        </button>
      </div>

      {/* 1. Today's Performance Metrics Cards */}
      <div>
        <h2 className="text-xs uppercase font-extrabold tracking-wider text-gold-400 mb-3 flex items-center space-x-2">
          <Sliders className="w-4 h-4" />
          <span>{t.statsHeader}</span>
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-charcoal-800/90 border border-charcoal-700">
            <p className="text-xs text-gray-400 uppercase tracking-wider">{t.statServed}</p>
            <p className="text-3xl font-black text-white mt-1">{stats.servedCount}</p>
          </div>
          <div className="p-5 rounded-3xl bg-charcoal-800/90 border border-charcoal-700">
            <p className="text-xs text-gray-400 uppercase tracking-wider">{t.statAvgWait}</p>
            <p className="text-3xl font-black text-white mt-1">{stats.avgWait} <span className="text-xs text-gold-400 font-semibold">{t.mins}</span></p>
          </div>
          <div className="p-5 rounded-3xl bg-charcoal-800/90 border border-charcoal-700">
            <p className="text-xs text-gray-400 uppercase tracking-wider">{t.statNoShows}</p>
            <p className="text-3xl font-black text-amber-400 mt-1">{stats.noShowCount}</p>
          </div>
          <div className="p-5 rounded-3xl bg-charcoal-800/90 border border-charcoal-700">
            <p className="text-xs text-gray-400 uppercase tracking-wider">{t.statRevenue}</p>
            <p className="text-3xl font-black text-gold-400 mt-1">₹{stats.totalRevenue}</p>
          </div>
        </div>
      </div>

      {/* 2. Master Queue Switch */}
      <div className="p-6 rounded-3xl bg-charcoal-800/90 border border-charcoal-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white">{t.queueControls}</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {queueOpen ? t.openForPublic : t.closedForPublic}
          </p>
        </div>

        <button
          onClick={toggleQueueOpen}
          className={`flex items-center space-x-2 px-5 py-3 rounded-2xl text-xs font-extrabold transition-all ${
            queueOpen
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
          }`}
        >
          {queueOpen ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
          <span>{queueOpen ? 'QUEUE IS OPEN' : 'QUEUE IS CLOSED'}</span>
        </button>
      </div>

      {/* 3. Barbers On Duty Today */}
      <div>
        <h2 className="text-xs uppercase font-extrabold tracking-wider text-gold-400 mb-3 flex items-center space-x-2">
          <Users className="w-4 h-4" />
          <span>{t.barberStaffConfig}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {barbers.map(barber => (
            <div 
              key={barber.id}
              className="p-5 rounded-3xl bg-charcoal-800/90 border border-charcoal-700 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{barber.avatar}</span>
                <div>
                  <p className="text-sm font-bold text-white">{barber.name}</p>
                  <p className="text-xs text-gray-400">Chair #{barber.chair}</p>
                </div>
              </div>

              <button
                onClick={() => toggleBarberDuty(barber.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                  barber.onDuty
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    : 'bg-charcoal-900 border-charcoal-700 text-gray-500'
                }`}
              >
                {barber.onDuty ? t.onDuty : t.offDuty}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Services Management Catalog */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs uppercase font-extrabold tracking-wider text-gold-400 flex items-center space-x-2">
            <Scissors className="w-4 h-4" />
            <span>{t.servicesConfig}</span>
          </h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gold-500 text-charcoal-900 text-xs font-bold hover:bg-gold-400 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addNewService}</span>
          </button>
        </div>

        <div className="bg-charcoal-800/90 border border-charcoal-700 rounded-3xl overflow-hidden shadow-xl">
          <div className="divide-y divide-charcoal-700">
            {services.map(service => {
              const isEditing = editingServiceId === service.id;

              return (
                <div key={service.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {isEditing ? (
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 flex-1 w-full">
                      <input
                        type="text"
                        value={formNameEn}
                        onChange={(e) => setFormNameEn(e.target.value)}
                        placeholder="English Name"
                        className="px-3 py-2 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-xs"
                      />
                      <input
                        type="text"
                        value={formNameGu}
                        onChange={(e) => setFormNameGu(e.target.value)}
                        placeholder="Gujarati Name"
                        className="px-3 py-2 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-xs font-gu"
                      />
                      <input
                        type="number"
                        value={formDuration}
                        onChange={(e) => setFormDuration(e.target.value)}
                        placeholder="Mins"
                        className="px-3 py-2 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-xs"
                      />
                      <input
                        type="number"
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                        placeholder="Price ₹"
                        className="px-3 py-2 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-xs"
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-bold text-white">{service.nameEn}</p>
                        <span className="text-xs text-gold-400/80 font-gu">({service.nameGu})</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {service.duration} {t.mins} • ₹{service.price}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                    {isEditing ? (
                      <button
                        onClick={() => handleSaveEdit(service.id)}
                        className="px-3 py-1.5 rounded-xl bg-gold-500 text-charcoal-900 text-xs font-bold"
                      >
                        {t.save}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartEdit(service)}
                        className="p-2 rounded-xl bg-charcoal-900 text-gray-400 hover:text-white border border-charcoal-700"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Active/Hide Switch */}
                    <button
                      onClick={() => toggleServiceActive(service.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                        service.active
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-charcoal-900 text-gray-500 border-charcoal-700'
                      }`}
                    >
                      {service.active ? t.active : t.inactive}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add New Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-charcoal-900 border border-charcoal-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">{t.addNewService}</h3>
            <form onSubmit={handleCreateNewService} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">{t.serviceNameEn} *</label>
                <input
                  type="text"
                  required
                  value={formNameEn}
                  onChange={(e) => setFormNameEn(e.target.value)}
                  placeholder="e.g. Beard Dye"
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">{t.serviceNameGu}</label>
                <input
                  type="text"
                  value={formNameGu}
                  onChange={(e) => setFormNameGu(e.target.value)}
                  placeholder="દા.ત. દાઢી ડાઈ"
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white text-xs font-gu"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">{t.serviceDuration} *</label>
                  <input
                    type="number"
                    required
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">{t.servicePrice} *</label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-charcoal-800 text-gray-300 text-xs font-semibold"
                >
                  {t.close}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gold-500 text-charcoal-900 text-xs font-bold"
                >
                  {t.addNewService}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
