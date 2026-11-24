import React, { useState, useEffect } from 'react';
import { QueueProvider, useQueue } from './context/QueueContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SpotlightBackground } from './components/SpotlightBackground';
import { Home } from './pages/Home';
import { ServiceCatalog } from './pages/ServiceCatalog';
import { JoinQueue } from './pages/JoinQueue';
import { MyStatus } from './pages/MyStatus';
import { ReceptionDashboard } from './pages/ReceptionDashboard';
import { BarberView } from './pages/BarberView';
import { WaitingDisplay } from './pages/WaitingDisplay';
import { AdminSettings } from './pages/AdminSettings';
import { ArrowLeft } from 'lucide-react';

function MainApp() {
  const getInitialRoute = () => {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    if (hash) return hash;
    return window.location.pathname.replace(/^\//, '') || 'home';
  };

  const [currentRoute, setCurrentRoute] = useState(getInitialRoute);
  const { myTicketId } = useQueue();

  useEffect(() => {
    const syncRoute = () => setCurrentRoute(getInitialRoute());
    window.addEventListener('popstate', syncRoute);
    window.addEventListener('hashchange', syncRoute);
    return () => {
      window.removeEventListener('popstate', syncRoute);
      window.removeEventListener('hashchange', syncRoute);
    };
  }, []);

  const navigate = (route) => {
    let target = route;
    if (route === 'status') target = `status/${myTicketId || 'S-14'}`;
    window.location.hash = `#/${target}`;
    setCurrentRoute(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderScreen = () => {
    if (!currentRoute || currentRoute === 'home') return <Home onNavigate={navigate} />;
    if (currentRoute === 'services') return <ServiceCatalog onNavigate={navigate} />;
    if (currentRoute === 'join') return <JoinQueue onNavigate={navigate} />;
    if (currentRoute.startsWith('status')) {
      const ticketId = currentRoute.split('/')[1] || myTicketId || 'S-14';
      return <MyStatus ticketId={ticketId} onNavigate={navigate} />;
    }
    if (currentRoute === 'reception') {
      return <ProtectedRoute requiredRole="receptionist" onNavigate={navigate}><ReceptionDashboard onNavigate={navigate} /></ProtectedRoute>;
    }
    if (currentRoute.startsWith('barber')) {
      const barberName = currentRoute.split('/')[1] || 'ravi';
      return <ProtectedRoute requiredRole="barber" onNavigate={navigate}><BarberView barberName={barberName} onNavigate={navigate} /></ProtectedRoute>;
    }
    if (currentRoute === 'admin') {
      return <ProtectedRoute requiredRole="admin" onNavigate={navigate}><AdminSettings onNavigate={navigate} /></ProtectedRoute>;
    }
    if (currentRoute === 'display') {
      return (
        <div className="relative">
          <div className="fixed bottom-4 right-4 z-50">
            <button onClick={() => navigate('home')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-charcoal-800/90 text-gray-100 border border-charcoal-700 shadow-xl">
              <ArrowLeft className="w-4 h-4" /><span>Exit TV View</span>
            </button>
          </div>
          <WaitingDisplay />
        </div>
      );
    }
    return <Home onNavigate={navigate} />;
  };

  const isTVView = currentRoute === 'display';
  return (
    <div className="min-h-screen bg-charcoal-900 text-gray-100 flex flex-col font-sans relative">
      <SpotlightBackground />
      <AuthModal />
      {!isTVView && <Navbar currentRoute={currentRoute} onNavigate={navigate} />}
      <main className="flex-1 relative z-10">{renderScreen()}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <QueueProvider>
        <MainApp />
      </QueueProvider>
    </AuthProvider>
  );
}
