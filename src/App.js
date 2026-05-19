import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import SockJS from 'sockjs-client';
import { over } from 'stompjs';

// Import des composants réutilisables et des pages
import Navbar from './components/Navbar';
import Login from './pages/Login';
import ClientDashboard from './pages/ClientDashboard';
import RestoDashboard from './pages/RestoDashboard';
import LivreurDashboard from './pages/LivreurDashboard';

function App() {
  // Récupérer l'utilisateur sauvegardé au rafraîchissement
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    toast.success("Déconnexion réussie ! À bientôt.");
  };

  // Connexion au WebSocket Global pour les notifications de livraison en temps réel
  useEffect(() => {
    let sock = null;
    let stompClient = null;

    try {
      sock = new SockJS('http://localhost:8181/ws');
      stompClient = over(sock);
      
      // Désactiver le log de debug de stompjs dans la console pour avoir des logs propres
      stompClient.debug = null;

      stompClient.connect({}, () => {
        console.log("✅ WebSocket connecté avec succès dans l'application principale !");

        // Souscription au canal de suivi des livraisons
        stompClient.subscribe('/topic/suivi', (message) => {
          try {
            const data = JSON.parse(message.body);
            
            // Notification toast super premium !
            toast(data.message, {
              icon: '🔔',
              duration: 6000,
              style: {
                borderRadius: '16px',
                background: '#1e293b',
                color: '#fff',
                fontWeight: '600',
                fontSize: '14px',
                border: '1px solid #334155'
              },
            });

            // Si c'est l'utilisateur concerné ou si un rechargement global est requis,
            // l'événement WebSocket est intercepté par le composant enfant qui met à jour sa vue.
          } catch (e) {
            console.error("Erreur de parsing du message websocket", e);
          }
        });
      }, (err) => {
        console.error("❌ Erreur de connexion WebSocket globale", err);
      });
    } catch (error) {
      console.error("Erreur d'initialisation WebSocket", error);
    }

    return () => {
      if (sock) {
        console.log("Déconnexion du WebSocket principal...");
        sock.close();
      }
    };
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-slate-50/50 flex flex-col justify-between">
        <div className="flex-1">
          {/* Notifications stylées en haut à droite de l'écran */}
          <Toaster position="top-right" reverseOrder={false} />
          
          {/* Navbar dynamique */}
          <Navbar user={user} onLogout={handleLogout} />

          {/* Corps de page principal */}
          <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <Routes>
              {/* Redirection intelligente selon le rôle de l'utilisateur connecté */}
              <Route path="/" element={
                !user ? <Login setUser={setUser} /> : 
                user.role === 'CLIENT' ? <Navigate to="/client" replace /> :
                user.role === 'RESTAURANT' ? <Navigate to="/restaurant" replace /> :
                <Navigate to="/livreur" replace />
              } />

              {/* Accès sécurisé par rôle */}
              <Route 
                path="/client" 
                element={user?.role === 'CLIENT' ? <ClientDashboard user={user} /> : <Navigate to="/" replace />} 
              />
              <Route 
                path="/restaurant" 
                element={user?.role === 'RESTAURANT' ? <RestoDashboard user={user} /> : <Navigate to="/" replace />} 
              />
              <Route 
                path="/livreur" 
                element={user?.role === 'LIVREUR' ? <LivreurDashboard user={user} /> : <Navigate to="/" replace />} 
              />

              {/* Redirection générique en cas de route inconnue */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>

        {/* Footer simple et élégant */}
        <footer className="bg-white border-t border-gray-100 py-6 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} QuickEat. Tous droits réservés. Restructuré avec ❤️ en Clean Architecture.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;