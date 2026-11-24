import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { initialServices, initialBarbers, initialTickets, initialStats } from '../data/initialData';
import {
  validatePhone,
  findActiveTicketByPhone,
  getServicesTotals,
  calculateEstimatedWait,
  getQueuePosition,
  getNextCustomerForBarber
} from '../utils/queueRules';
import { translations } from '../i18n/translations';
import { soundChime } from '../components/AudioNotification';

const QueueContext = createContext(null);

const STORAGE_KEYS = {
  TICKETS: 'salon_queue_tickets_v1',
  BARBERS: 'salon_queue_barbers_v1',
  SERVICES: 'salon_queue_services_v1',
  STATS: 'salon_queue_stats_v1',
  QUEUE_OPEN: 'salon_queue_open_v1',
  LANG: 'salon_queue_lang_v1',
  MY_TICKET: 'salon_queue_my_ticket_id_v1',
  LAST_CALLED: 'salon_queue_last_called_v1'
};

const SYNC_CHANNEL_NAME = 'royal_cuts_queue_sync_channel';

export function QueueProvider({ children }) {
  // 1. Language state
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.LANG) || 'en';
  });

  const t = useMemo(() => translations[language] || translations.en, [language]);

  const setLanguage = useCallback((lang) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEYS.LANG, lang);
  }, []);

  // 2. Queue Open/Close state
  const [queueOpen, setQueueOpenState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.QUEUE_OPEN);
    return saved !== null ? JSON.parse(saved) : true;
  });

  // 3. Services state
  const [services, setServicesState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SERVICES);
    return saved ? JSON.parse(saved) : initialServices;
  });

  // 4. Barbers state
  const [barbers, setBarbersState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BARBERS);
    return saved ? JSON.parse(saved) : initialBarbers;
  });

  // 5. Tickets state
  const [tickets, setTicketsState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TICKETS);
    return saved ? JSON.parse(saved) : initialTickets;
  });

  // 6. Stats state
  const [stats, setStatsState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STATS);
    return saved ? JSON.parse(saved) : initialStats;
  });

  // 7. Active Ticket on this client
  const [myTicketId, setMyTicketIdState] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.MY_TICKET) || null;
  });

  // 8. Last Called Ticket for animations/chimes
  const [lastCalled, setLastCalled] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LAST_CALLED);
    return saved ? JSON.parse(saved) : null;
  });

  // Broadcast Channel for instant multi-window sync
  const broadcastChannel = useMemo(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      return new BroadcastChannel(SYNC_CHANNEL_NAME);
    }
    return null;
  }, []);

  const broadcastStateUpdate = useCallback((type, payload) => {
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type, payload, timestamp: Date.now() });
    }
  }, [broadcastChannel]);

  // Persist to localStorage and broadcast whenever main data updates
  const updateTickets = useCallback((newTickets, sync = true) => {
    setTicketsState(newTickets);
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(newTickets));
    if (sync) broadcastStateUpdate('UPDATE_TICKETS', newTickets);
  }, [broadcastStateUpdate]);

  const updateBarbers = useCallback((newBarbers, sync = true) => {
    setBarbersState(newBarbers);
    localStorage.setItem(STORAGE_KEYS.BARBERS, JSON.stringify(newBarbers));
    if (sync) broadcastStateUpdate('UPDATE_BARBERS', newBarbers);
  }, [broadcastStateUpdate]);

  const updateServices = useCallback((newServices, sync = true) => {
    setServicesState(newServices);
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(newServices));
    if (sync) broadcastStateUpdate('UPDATE_SERVICES', newServices);
  }, [broadcastStateUpdate]);

  const updateStats = useCallback((newStats, sync = true) => {
    setStatsState(newStats);
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(newStats));
    if (sync) broadcastStateUpdate('UPDATE_STATS', newStats);
  }, [broadcastStateUpdate]);

  const setMyTicketId = useCallback((id) => {
    setMyTicketIdState(id);
    if (id) {
      localStorage.setItem(STORAGE_KEYS.MY_TICKET, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.MY_TICKET);
    }
  }, []);

  // Listen to BroadcastChannel messages from other browser tabs
  useEffect(() => {
    if (!broadcastChannel) return;

    const handleMessage = (event) => {
      const { type, payload } = event.data || {};
      if (!type) return;

      switch (type) {
        case 'UPDATE_TICKETS':
          setTicketsState(payload);
          break;
        case 'UPDATE_BARBERS':
          setBarbersState(payload);
          break;
        case 'UPDATE_SERVICES':
          setServicesState(payload);
          break;
        case 'UPDATE_STATS':
          setStatsState(payload);
          break;
        case 'TOGGLE_QUEUE_OPEN':
          setQueueOpenState(payload);
          break;
        case 'CALL_TICKET_ALERT':
          setLastCalled(payload);
          soundChime.playCallChime();
          soundChime.vibratePhone();
          break;
        case 'RESET_ALL':
          setTicketsState(initialTickets);
          setBarbersState(initialBarbers);
          setServicesState(initialServices);
          setStatsState(initialStats);
          setQueueOpenState(true);
          setLastCalled(null);
          break;
        default:
          break;
      }
    };

    broadcastChannel.onmessage = handleMessage;
    return () => {
      broadcastChannel.onmessage = null;
    };
  }, [broadcastChannel]);

  // Storage event listener fallback (for older browsers or cross-origin tabs)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEYS.TICKETS && e.newValue) {
        setTicketsState(JSON.parse(e.newValue));
      } else if (e.key === STORAGE_KEYS.BARBERS && e.newValue) {
        setBarbersState(JSON.parse(e.newValue));
      } else if (e.key === STORAGE_KEYS.STATS && e.newValue) {
        setStatsState(JSON.parse(e.newValue));
      } else if (e.key === STORAGE_KEYS.QUEUE_OPEN && e.newValue !== null) {
        setQueueOpenState(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Helper: Generate next sequential token number
  const generateNextToken = useCallback(() => {
    const existingTokens = tickets.map(t => {
      const match = t.token.match(/^S-(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    });
    const maxNum = existingTokens.length > 0 ? Math.max(...existingTokens) : 0;
    return `S-${maxNum + 1}`;
  }, [tickets]);

  // Actions

  /**
   * Join Queue (from customer phone or walk-in)
   */
  const joinQueue = useCallback(({ name, phone, serviceIds, barberPreference = 'any' }) => {
    // 1. Validation
    if (!name || !name.trim()) {
      return { success: false, error: 'name_required' };
    }
    if (!validatePhone(phone)) {
      return { success: false, error: 'invalid_phone' };
    }
    if (!serviceIds || serviceIds.length === 0 || serviceIds.length > 3) {
      return { success: false, error: 'invalid_services' };
    }

    // 2. Check duplicate phone
    const existingActiveTicket = findActiveTicketByPhone(phone, tickets);
    if (existingActiveTicket) {
      return {
        success: false,
        error: 'duplicate_phone',
        existingTicket: existingActiveTicket
      };
    }

    // 3. Create ticket
    const token = generateNextToken();
    const newTicket = {
      id: token,
      token,
      name: name.trim(),
      phone: phone.trim(),
      serviceIds,
      barberPreference: barberPreference || 'any',
      status: 'waiting',
      assignedBarberId: null,
      createdAt: Date.now(),
      startedAt: null,
      completedAt: null
    };

    const updated = [...tickets, newTicket];
    updateTickets(updated);
    setMyTicketId(newTicket.id);

    return { success: true, ticket: newTicket };
  }, [tickets, generateNextToken, updateTickets, setMyTicketId]);

  /**
   * Cancel Spot
   */
  const cancelTicket = useCallback((ticketId) => {
    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        return { ...t, status: 'cancelled', completedAt: Date.now() };
      }
      return t;
    });

    // Also free up barber if currently assigned
    const updatedBarbers = barbers.map(b => {
      if (b.currentTicketId === ticketId) {
        return { ...b, status: 'available', currentTicketId: null };
      }
      return b;
    });

    updateTickets(updated);
    updateBarbers(updatedBarbers);

    if (myTicketId === ticketId) {
      setMyTicketId(null);
    }
  }, [tickets, barbers, myTicketId, updateTickets, updateBarbers, setMyTicketId]);

  /**
   * Receptionist or Barber calls next customer for Barber station
   */
  const callNextForBarber = useCallback((barberId) => {
    const barber = barbers.find(b => b.id === barberId);
    if (!barber || barber.onBreak) {
      return { success: false, reason: 'barber_unavailable' };
    }

    // Find next customer strictly following the rule in docs/03-flows-rules.md:
    // "Call next for barber X picks the earliest customer who chose X or 'Any'.
    // A customer who chose Ravi is never given to another barber."
    const nextCustomer = getNextCustomerForBarber(barberId, tickets);

    if (!nextCustomer) {
      return { success: false, reason: 'no_waiting_customers' };
    }

    // Update ticket to 'called'
    const updatedTickets = tickets.map(t => {
      if (t.id === nextCustomer.id) {
        return {
          ...t,
          status: 'called',
          assignedBarberId: barberId,
          calledAt: Date.now()
        };
      }
      return t;
    });

    // Update barber to busy
    const updatedBarbers = barbers.map(b => {
      if (b.id === barberId) {
        return {
          ...b,
          status: 'busy',
          currentTicketId: nextCustomer.id
        };
      }
      return b;
    });

    const callPayload = {
      token: nextCustomer.token,
      name: nextCustomer.name,
      barberId: barber.id,
      barberName: barber.name,
      chair: barber.chair,
      timestamp: Date.now()
    };

    updateTickets(updatedTickets);
    updateBarbers(updatedBarbers);
    setLastCalled(callPayload);
    localStorage.setItem(STORAGE_KEYS.LAST_CALLED, JSON.stringify(callPayload));
    
    // Broadcast audible chime and visual flash to all windows
    broadcastStateUpdate('CALL_TICKET_ALERT', callPayload);
    soundChime.playCallChime();
    soundChime.vibratePhone();

    return { success: true, ticket: nextCustomer };
  }, [barbers, tickets, updateTickets, updateBarbers, broadcastStateUpdate]);

  /**
   * Start Service (customer sits in chair)
   */
  const startService = useCallback((ticketId, barberId) => {
    const updatedTickets = tickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: 'in_chair',
          startedAt: Date.now()
        };
      }
      return t;
    });

    const updatedBarbers = barbers.map(b => {
      if (b.id === barberId) {
        return { ...b, status: 'busy', currentTicketId: ticketId };
      }
      return b;
    });

    updateTickets(updatedTickets);
    updateBarbers(updatedBarbers);
  }, [tickets, barbers, updateTickets, updateBarbers]);

  /**
   * Complete Service (customer finished)
   */
  const completeService = useCallback((ticketId, barberId) => {
    const targetTicket = tickets.find(t => t.id === ticketId);
    if (!targetTicket) return;

    const completedAt = Date.now();
    const waitDuration = targetTicket.createdAt ? Math.round((completedAt - targetTicket.createdAt) / 60000) : 15;
    const { price } = getServicesTotals(targetTicket.serviceIds, services);

    const updatedTickets = tickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: 'done',
          completedAt
        };
      }
      return t;
    });

    const updatedBarbers = barbers.map(b => {
      if (b.id === barberId || b.currentTicketId === ticketId) {
        return {
          ...b,
          status: b.onBreak ? 'on_break' : 'available',
          currentTicketId: null
        };
      }
      return b;
    });

    // Update stats
    const newServedCount = stats.servedCount + 1;
    const newTotalRevenue = stats.totalRevenue + price;
    const newAvgWait = Math.round(((stats.avgWait * stats.servedCount) + waitDuration) / newServedCount);

    const updatedStats = {
      ...stats,
      servedCount: newServedCount,
      totalRevenue: newTotalRevenue,
      avgWait: newAvgWait
    };

    updateTickets(updatedTickets);
    updateBarbers(updatedBarbers);
    updateStats(updatedStats);

    if (myTicketId === ticketId) {
      // Keep completed ticket viewable or clear
    }
  }, [tickets, barbers, services, stats, myTicketId, updateTickets, updateBarbers, updateStats]);

  /**
   * Mark customer as No-Show
   */
  const markNoShow = useCallback((ticketId) => {
    const updatedTickets = tickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: 'no_show',
          completedAt: Date.now()
        };
      }
      return t;
    });

    const updatedBarbers = barbers.map(b => {
      if (b.currentTicketId === ticketId) {
        return {
          ...b,
          status: b.onBreak ? 'on_break' : 'available',
          currentTicketId: null
        };
      }
      return b;
    });

    const updatedStats = {
      ...stats,
      noShowCount: stats.noShowCount + 1
    };

    updateTickets(updatedTickets);
    updateBarbers(updatedBarbers);
    updateStats(updatedStats);
  }, [tickets, barbers, stats, updateTickets, updateBarbers, updateStats]);

  /**
   * Toggle Barber Break
   */
  const toggleBarberBreak = useCallback((barberId) => {
    const updatedBarbers = barbers.map(b => {
      if (b.id === barberId) {
        const nextBreak = !b.onBreak;
        return {
          ...b,
          onBreak: nextBreak,
          status: nextBreak ? 'on_break' : (b.currentTicketId ? 'busy' : 'available')
        };
      }
      return b;
    });

    updateBarbers(updatedBarbers);
  }, [barbers, updateBarbers]);

  /**
   * Toggle Barber On Duty
   */
  const toggleBarberDuty = useCallback((barberId) => {
    const updatedBarbers = barbers.map(b => {
      if (b.id === barberId) {
        const nextDuty = !b.onDuty;
        return {
          ...b,
          onDuty: nextDuty,
          status: !nextDuty ? 'off_duty' : (b.onBreak ? 'on_break' : 'available')
        };
      }
      return b;
    });

    updateBarbers(updatedBarbers);
  }, [barbers, updateBarbers]);

  /**
   * Toggle Service Active / Inactive
   */
  const toggleServiceActive = useCallback((serviceId) => {
    const updated = services.map(s => {
      if (s.id === serviceId) {
        return { ...s, active: !s.active };
      }
      return s;
    });
    updateServices(updated);
  }, [services, updateServices]);

  /**
   * Edit or Save Service
   */
  const saveService = useCallback((updatedService) => {
    const updated = services.map(s => s.id === updatedService.id ? updatedService : s);
    updateServices(updated);
  }, [services, updateServices]);

  /**
   * Add New Service
   */
  const addService = useCallback((newService) => {
    const updated = [...services, newService];
    updateServices(updated);
  }, [services, updateServices]);

  /**
   * Toggle Master Queue Open / Closed
   */
  const toggleQueueOpen = useCallback(() => {
    setQueueOpenState(prev => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEYS.QUEUE_OPEN, JSON.stringify(next));
      broadcastStateUpdate('TOGGLE_QUEUE_OPEN', next);
      return next;
    });
  }, [broadcastStateUpdate]);

  /**
   * Reset Demo Data
   */
  const resetDemoData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TICKETS);
    localStorage.removeItem(STORAGE_KEYS.BARBERS);
    localStorage.removeItem(STORAGE_KEYS.SERVICES);
    localStorage.removeItem(STORAGE_KEYS.STATS);
    localStorage.removeItem(STORAGE_KEYS.QUEUE_OPEN);
    localStorage.removeItem(STORAGE_KEYS.MY_TICKET);
    localStorage.removeItem(STORAGE_KEYS.LAST_CALLED);

    setTicketsState(initialTickets);
    setBarbersState(initialBarbers);
    setServicesState(initialServices);
    setStatsState(initialStats);
    setQueueOpenState(true);
    setMyTicketIdState(null);
    setLastCalled(null);

    broadcastStateUpdate('RESET_ALL', null);
  }, [broadcastStateUpdate]);

  // Derived Values
  const waitingTickets = useMemo(() => {
    return tickets
      .filter(t => t.status === 'waiting')
      .sort((a, b) => a.createdAt - b.createdAt);
  }, [tickets]);

  const activeWaitingCount = waitingTickets.length;

  const totalEstimatedWaitTime = useMemo(() => {
    if (waitingTickets.length === 0) return 0;
    const lastTicket = waitingTickets[waitingTickets.length - 1];
    return calculateEstimatedWait(lastTicket, tickets, barbers, services);
  }, [waitingTickets, tickets, barbers, services]);

  const value = {
    // State
    language,
    t,
    setLanguage,
    queueOpen,
    services,
    barbers,
    tickets,
    waitingTickets,
    activeWaitingCount,
    totalEstimatedWaitTime,
    stats,
    myTicketId,
    lastCalled,

    // Actions
    setMyTicketId,
    joinQueue,
    cancelTicket,
    callNextForBarber,
    startService,
    completeService,
    markNoShow,
    toggleBarberBreak,
    toggleBarberDuty,
    toggleServiceActive,
    saveService,
    addService,
    toggleQueueOpen,
    resetDemoData,

    // Algorithmic helpers
    calculateEstimatedWait: (ticket) => calculateEstimatedWait(ticket, tickets, barbers, services),
    getQueuePosition: (ticketId) => getQueuePosition(ticketId, tickets),
    getServicesTotals: (serviceIds) => getServicesTotals(serviceIds, services),
  };

  return (
    <QueueContext.Provider value={value}>
      {children}
    </QueueContext.Provider>
  );
}

export function useQueue() {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
}
