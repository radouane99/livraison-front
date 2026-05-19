import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Bike, Navigation, MapPin, CheckCircle, Package, Clock, ShieldAlert } from 'lucide-react';
import { API_URL } from '../config';
import { changerStatutCommande } from '../utils/orderService';

const LivreurDashboard = ({ user }) => {
  const [commandes, setCommandes] = useState([]);
  const [activeTab, setActiveTab] = useState('dispo'); // dispo, en_cours, livrees

  const chargerCommandes = async () => {
    try {
      const res = await axios.get(`${API_URL}/commandes`);
      setCommandes(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Impossible de charger les livraisons");
    }
  };

  useEffect(() => {
    chargerCommandes();

    const interval = setInterval(chargerCommandes, 8000);
    return () => clearInterval(interval);
  }, []);

  const gererStatutCommande = async (id, nouveauStatut, labelStatut) => {
    const loadingToast = toast.loading(`Mise à jour de la course : ${labelStatut}...`);
    try {
      await changerStatutCommande(id, nouveauStatut);
      toast.success(`Course mise à jour : ${labelStatut} !`, { id: loadingToast });
      chargerCommandes();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la mise à jour de la course", { id: loadingToast });
    }
  };

  // Filtrage des commandes selon le rôle du livreur
  // 1. Disponibles : Prêtes pour livraison
  const commandesDispo = commandes.filter(c => c.statut === 'PRÊTE_POUR_LIVRAISON');
  // 2. En cours : En cours de livraison
  const commandesEnCours = commandes.filter(c => c.statut === 'EN_COURS_DE_LIVRAISON');
  // 3. Livrées : Livrées (toutes)
  const commandesLivrees = commandes.filter(c => c.statut === 'LIVRÉE');

  return (
    <div className="space-y-8">
      {/* Rider Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-orange-600 to-orange-500 p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl font-extrabold tracking-tight">Espace Livreur Nomade 🚴</h1>
          <p className="mt-2 text-orange-50 font-medium text-lg">
            Consultez les commandes prêtes et assurez des livraisons rapides et professionnelles.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-15 transform translate-y-8 translate-x-8">
          <Bike size={250} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-150 gap-4">
        <button
          onClick={() => setActiveTab('dispo')}
          className={`pb-3 text-sm font-bold border-b-2 px-4 transition-all ${
            activeTab === 'dispo' 
              ? 'border-orange-500 text-orange-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Courses Disponibles ({commandesDispo.length})
        </button>
        <button
          onClick={() => setActiveTab('en_cours')}
          className={`pb-3 text-sm font-bold border-b-2 px-4 transition-all ${
            activeTab === 'en_cours' 
              ? 'border-orange-500 text-orange-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Vos Livraisons ({commandesEnCours.length})
        </button>
        <button
          onClick={() => setActiveTab('livrees')}
          className={`pb-3 text-sm font-bold border-b-2 px-4 transition-all ${
            activeTab === 'livrees' 
              ? 'border-orange-500 text-orange-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Historique ({commandesLivrees.length})
        </button>
      </div>

      {/* Content based on tab */}
      <div>
        {activeTab === 'dispo' && (
          <div className="space-y-4">
            {commandesDispo.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center text-gray-400 shadow-sm">
                <Clock size={48} className="mx-auto mb-3 text-gray-300 animate-pulse" />
                <p className="font-semibold text-gray-700 text-lg">Aucune commande en attente de livraison</p>
                <p className="text-sm mt-1">Dès que le chef de cuisine marque un plat comme prêt, il apparaîtra ici.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {commandesDispo.map(c => (
                  <div key={c.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-orange-200 hover:shadow-md transition-all duration-200">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                        <span className="font-black text-gray-800 text-lg">Commande #{c.id}</span>
                        <span className="font-extrabold text-orange-600 text-lg">{c.total} DH</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-start gap-2.5 text-sm text-gray-600">
                          <Package size={18} className="text-gray-400 shrink-0 mt-0.5" />
                          <p><span className="font-semibold text-gray-700">Resto :</span> {c.restaurant?.nom || "Partenaire QuickEat"}</p>
                        </div>
                        <div className="flex items-start gap-2.5 text-sm text-gray-600">
                          <MapPin size={18} className="text-gray-400 shrink-0 mt-0.5" />
                          <p><span className="font-semibold text-gray-700">Adresse de livraison :</span> {c.adresseLivraison || "Casablanca, Maroc"}</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => gererStatutCommande(c.id, 'EN_COURS_DE_LIVRAISON', 'En Cours de Livraison')}
                      className="w-full mt-6 bg-gray-900 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]"
                    >
                      <Navigation size={18} />
                      <span>Prendre en Charge la Course</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'en_cours' && (
          <div className="space-y-4">
            {commandesEnCours.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center text-gray-400 shadow-sm">
                <Bike size={48} className="mx-auto mb-3 text-gray-300" />
                <p className="font-semibold text-gray-700 text-lg">Vous n'avez pas de course active</p>
                <p className="text-sm mt-1">Prenez en charge une course disponible pour commencer à livrer !</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {commandesEnCours.map(c => (
                  <div key={c.id} className="bg-white border border-indigo-100 rounded-2xl p-6 shadow-md shadow-indigo-50/20 flex flex-col justify-between hover:shadow-lg transition-all duration-200">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                        <span className="font-black text-gray-800 text-lg">Commande #{c.id}</span>
                        <span className="font-extrabold text-indigo-600 text-lg">{c.total} DH</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-start gap-2.5 text-sm text-gray-600">
                          <Package size={18} className="text-gray-400 shrink-0 mt-0.5" />
                          <p><span className="font-semibold text-gray-700">Resto :</span> {c.restaurant?.nom || "Partenaire QuickEat"}</p>
                        </div>
                        <div className="flex items-start gap-2.5 text-sm text-gray-600">
                          <MapPin size={18} className="text-indigo-500 shrink-0 mt-0.5" />
                          <p><span className="font-semibold text-gray-700 text-gray-800">Destination :</span> {c.adresseLivraison || "Casablanca, Maroc"}</p>
                        </div>
                      </div>

                      {/* Simulated Telemetry Broadcast (Phase 2) */}
                      <div className="mt-4 bg-slate-50 border border-slate-150 rounded-xl p-3.5 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                          <span className="h-2 w-2 rounded-full bg-green-500 animate-ping"></span>
                          <span className="flex items-center gap-1">Télémétrie GPS Active (WebSocket 📡)</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500">
                          <div>
                            <span className="block font-semibold">Position Émise :</span>
                            <span className="font-mono">33.5731° N, 7.5898° W</span>
                          </div>
                          <div>
                            <span className="block font-semibold">Vitesse :</span>
                            <span>24 km/h (Moyenne)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => gererStatutCommande(c.id, 'LIVRÉE', 'Livrée')}
                      className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-md shadow-green-100 hover:shadow-green-200 active:scale-[0.98]"
                    >
                      <CheckCircle size={18} />
                      <span>Confirmer la Livraison</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'livrees' && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            {commandesLivrees.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <CheckCircle size={40} className="mx-auto mb-3 text-gray-300" />
                <p className="font-semibold text-gray-700">Aucune course livrée pour le moment</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <th className="py-4 px-6">Commande</th>
                      <th className="py-4 px-6">Restaurant</th>
                      <th className="py-4 px-6">Destination</th>
                      <th className="py-4 px-6 text-right">Montant</th>
                      <th className="py-4 px-6 text-center">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {commandesLivrees.slice().reverse().map(c => (
                      <tr key={c.id} className="hover:bg-gray-50/55 transition-colors">
                        <td className="py-4 px-6 font-bold text-gray-800">#{c.id}</td>
                        <td className="py-4 px-6 text-gray-600">{c.restaurant?.nom || "Partenaire"}</td>
                        <td className="py-4 px-6 text-gray-500 truncate max-w-xs">{c.adresseLivraison}</td>
                        <td className="py-4 px-6 text-right font-bold text-gray-900">{c.total} DH</td>
                        <td className="py-4 px-6 text-center">
                          <span className="bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full border border-green-150">
                            Livrée ✅
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LivreurDashboard;
