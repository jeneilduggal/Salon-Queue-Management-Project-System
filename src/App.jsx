import React, { useState, useEffect } from 'react';
import { QueueProvider, useQueue } from './context/QueueContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { JoinQueue } from './pages/JoinQueue';
import { MyStatus } from './pages/MyStatus';
import { ReceptionDashboard } from './pages/ReceptionDashboard';
import { BarberView } from './pages/BarberView';
import { WaitingDisplay } from './pages/WaitingDisplay';
import { AdminSettings } from './pages/AdminSettings';
import { Tv, ArrowLeft } from 'lucide-react';

function MainApp() {
  // Simple, robust client-side routing supporting both path and hash
  const getInitialRoute = () => {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    if (hash) return hash;
    const path = window.location.pathname.replace(/^\//, '');
    return path || 'home';
  };

  const [currentRoute, setCurrentRoute] = useState(getInitialRoute);
  const { myTicketId } = useQueue();

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(getInitialRoute());
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigate = (route) => {
    // If route is 'status' with no ID, default to myTicketId or first waiting ticket
    let targetRoute = route;
    if (route === 'status' && myTicketId) {
      targetRoute = `status/${myTicketId}`;
    } else if (route === 'status' && !myTicketId) {
      targetRoute = 'status/S-14'; // Demo default
    }

    window.location.hash = `#/${targetRoute}`;
    setCurrentRoute(targetRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route matching
  const renderScreen = () => {
    if (currentRoute === 'home' || currentRoute === '') {
      return <Home onNavigate={navigate} />;
    }
    if (currentRoute === 'join') {
      return <JoinQueue onNavigate={navigate} />;
    }
    if (currentRoute.startsWith('status')) {
      const parts = currentRoute.split('/');
      const ticketId = parts[1] || myTicketId || 'S-14';
      return <MyStatus ticketId={ticketId} onNavigate={navigate} />;
    }
    if (currentRoute === 'reception') {
      return <ReceptionDashboard onNavigate={navigate} />;
    }
    if (currentRoute.startsWith('barber')) {
      const parts = currentRoute.split('/');
      const barberName = parts[1] || 'ravi';
      return <BarberView barberName={barberName} onNavigate={navigate} />;
    }
    if (currentRoute === 'display') {
      return (
        <div className="relative">
          <div className="fixed bottom-4 right-4 z-50">
            <button
              onClick={() => navigate('home')}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-charcoal-800/80 backdrop-blur hover:bg-gold-500 hover:text-charcoal-900 text-gray-300 text-xs border border-charcoal-700 shadow-xl transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit TV View</span>
            </button>
          </div>
          <WaitingDisplay />
        </div>
      );
    }
    if (currentRoute === 'admin') {
      return <AdminSettings onNavigate={navigate} />;
    }

    return <Home onNavigate={navigate} />;
  };

  const isTVView = currentRoute === 'display';

  return (
    <div className="min-h-screen bg-charcoal-900 text-gray-100 flex flex-col font-sans">
      {!isTVView && (
        <Navbar currentRoute={currentRoute} onNavigate={navigate} />
      )}
      <main className="flex-1">
        {renderScreen()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueueProvider>
      <MainApp />
    </QueueProvider>
  );
}
