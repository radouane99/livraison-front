import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PlusCircle, ChefHat, ClipboardList, Utensils, Coins, Clock, BarChart3, TrendingUp, Star, Users, Image as ImageIcon } from 'lucide-react';
import { API_URL } from '../config';
import { changerStatutCommande } from '../utils/orderService';

// Dynamic food photography mapping (Premium Photos)
const obtenirImagePlat = (plat) => {
  if (plat.imageUrl && plat.imageUrl.trim() !== '') {
    return plat.imageUrl;
  }
  const nomLower = (plat.nom || '').toLowerCase();
  if (nomLower.includes('pizza')) {
    return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80';
  }
  if (nomLower.includes('burger') || nomLower.includes('sandwich') || nomLower.includes('chicago')) {
    return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80';
  }
  if (nomLower.includes('tajine') || nomLower.includes('couscous') || nomLower.includes('maroc') || nomLower.includes('marocain')) {
    return 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=600&q=80';
  }
  if (nomLower.includes('sushi') || nomLower.includes('noodle') || nomLower.includes('riz') || nomLower.includes('wok') || nomLower.includes('asiatique')) {
    return 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80';
  }
  if (nomLower.includes('salade') || nomLower.includes('healthy') || nomLower.includes('regime') || nomLower.includes('cesar')) {
    return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80';
  }
  if (nomLower.includes('pate') || nomLower.includes('pasta') || nomLower.includes('spaghetti') || nomLower.includes('lasagne')) {
    return 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80';
  }
  if (nomLower.includes('dessert') || nomLower.includes('chocolat') || nomLower.includes('crepe') || nomLower.includes('glace') || nomLower.includes('gateau')) {
    return 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=600&q=80';
  }
  return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80';
};

const RestoDashboard = ({ user }) => {
  const [plats, setPlats] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [activeTab, setActiveTab] = useState('orders'); // orders, menu, stats
  
  // États Formulaire Plat
  const [nomPlat, setNomPlat] = useState('');
  const [descPlat, setDescPlat] = useState('');
  const [prixPlat, setPrixPlat] = useState('');
  const [imagePlat, setImagePlat] = useState(''); // Phase 2 Image support
  const [submitting, setSubmitting] = useState(false);

  const chargerPlats = async () => {
    try {
      const res = await axios.get(`${API_URL}/plats`);
      const mesPlats = res.data.filter(p => p.restaurant?.id === user.id);
      setPlats(mesPlats);
    } catch (err) {
      console.error(err);
      toast.error("Impossible de charger votre menu");
    }
  };

  const chargerCommandes = async () => {
    try {
      const res = await axios.get(`${API_URL}/commandes`);
      const mesCommandes = res.data.filter(c => c.restaurant?.id === user.id);
      setCommandes(mesCommandes);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    chargerPlats();
    chargerCommandes();

    const interval = setInterval(chargerCommandes, 8000);
    return () => clearInterval(interval);
  }, []);

  const ajouterNouveauPlat = async (e) => {
    e.preventDefault();
    if (!nomPlat || !prixPlat) {
      toast.error("Veuillez saisir au moins le nom et le prix");
      return;
    }

    setSubmitting(true);
    const loadingToast = toast.loading("Ajout du plat au menu...");
    try {
      await axios.post(`${API_URL}/plats`, {
        nom: nomPlat,
        description: descPlat,
        prix: parseFloat(prixPlat),
        imageUrl: imagePlat, // Envoi de l'imageUrl au backend
        restaurant: { id: user.id }
      });

      toast.success("Nouveau plat ajouté au menu !", { id: loadingToast });
      setNomPlat('');
      setDescPlat('');
      setPrixPlat('');
      setImagePlat('');
      chargerPlats();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'ajout du plat", { id: loadingToast });
    } finally {
      setSubmitting(false);
    }
  };

  const gererStatutCommande = async (id, nouveauStatut, labelStatut) => {
    const loadingToast = toast.loading(`Mise à jour du statut vers : ${labelStatut}...`);
    try {
      await changerStatutCommande(id, nouveauStatut);
      toast.success(`Commande mise à jour en : ${labelStatut} !`, { id: loadingToast });
      chargerCommandes();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la modification", { id: loadingToast });
    }
  };

  // Traitements Statistiques
  const commandesLivrees = commandes.filter(c => c.statut === 'LIVRÉE');
  const chiffreAffaires = commandesLivrees.reduce((sum, c) => sum + c.total, 0);
  const panierMoyen = commandesLivrees.length > 0 ? Math.round(chiffreAffaires / commandesLivrees.length) : 0;
  
  // Simulation de données de vente par jour de la semaine
  const statsVentesSemaine = [
    { jour: 'Lun', montant: chiffreAffaires > 0 ? Math.round(chiffreAffaires * 0.1) : 450, orders: 4 },
    { jour: 'Mar', montant: chiffreAffaires > 0 ? Math.round(chiffreAffaires * 0.08) : 320, orders: 3 },
    { jour: 'Mer', montant: chiffreAffaires > 0 ? Math.round(chiffreAffaires * 0.15) : 890, orders: 8 },
    { jour: 'Jeu', montant: chiffreAffaires > 0 ? Math.round(chiffreAffaires * 0.12) : 640, orders: 6 },
    { jour: 'Ven', montant: chiffreAffaires > 0 ? Math.round(chiffreAffaires * 0.22) : 1850, orders: 15 },
    { jour: 'Sam', montant: chiffreAffaires > 0 ? Math.round(chiffreAffaires * 0.23) : 2100, orders: 18 },
    { jour: 'Dim', montant: chiffreAffaires > 0 ? Math.round(chiffreAffaires * 0.1) : 1200, orders: 10 }
  ];
  
  const maxVenteSemaine = Math.max(...statsVentesSemaine.map(s => s.montant), 1);

  // Plats les plus populaires (simulation ou calcul basique)
  const platsPopulaires = plats.slice(0, 3).map((p, index) => {
    const ordersCounts = [24, 18, 12];
    return {
      nom: p.nom,
      prix: p.prix,
      quantite: ordersCounts[index] || 8,
      percent: index === 0 ? 100 : index === 1 ? 75 : 45
    };
  });

  const commandesRevenues = commandes.slice().reverse();

  return (
    <div className="space-y-8">
      {/* Head banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl font-extrabold tracking-tight">Espace Gérant Restaurant 👨‍🍳</h1>
          <p className="mt-2 text-slate-300 font-medium text-lg">
            Gérez votre carte, suivez vos performances et gérez les commandes en temps réel.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-8 translate-x-8">
          <ChefHat size={250} />
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-gray-150 gap-4">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-sm font-bold border-b-2 px-4 transition-all flex items-center gap-2 ${
            activeTab === 'orders' 
              ? 'border-orange-500 text-orange-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <ClipboardList size={18} />
          Commandes Reçues ({commandes.length})
        </button>
        <button
          onClick={() => setActiveTab('menu')}
          className={`pb-3 text-sm font-bold border-b-2 px-4 transition-all flex items-center gap-2 ${
            activeTab === 'menu' 
              ? 'border-orange-500 text-orange-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Utensils size={18} />
          Menu & Plats ({plats.length})
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`pb-3 text-sm font-bold border-b-2 px-4 transition-all flex items-center gap-2 ${
            activeTab === 'stats' 
              ? 'border-orange-500 text-orange-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <BarChart3 size={18} />
          Statistiques & Analyses 📊
        </button>
      </div>

      {/* Tab Contents */}
      <div>
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                <ClipboardList size={26} className="text-slate-800" />
                Dernières Commandes
              </h2>
              <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">
                {commandesRevenues.length} Reçue(s)
              </span>
            </div>

            {commandesRevenues.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center text-gray-400 shadow-sm">
                <Clock size={48} className="mx-auto mb-3 text-gray-300 animate-spin" style={{ animationDuration: '4s' }} />
                <p className="font-semibold text-gray-700 text-lg">Aucune commande reçue à cette heure</p>
                <p className="text-sm mt-1">Dès qu'un client passe commande, elle apparaîtra instantanément ici.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
                {commandesRevenues.map(c => (
                  <div key={c.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-orange-100 transition-colors">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-lg text-gray-900">Commande #{c.id}</span>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                          c.statut === 'COMMANDE_CREEE' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          c.statut === 'EN_PREPARATION' ? 'bg-orange-50 text-orange-700 border-orange-100 animate-pulse' :
                          c.statut === 'PRÊTE_POUR_LIVRAISON' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                          c.statut === 'EN_COURS_DE_LIVRAISON' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                          'bg-green-50 text-green-700 border-green-100'
                        }`}>
                          {c.statut}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 space-y-0.5">
                        <p><span className="font-medium text-gray-700">Client :</span> {c.client?.nom || "Client QuickEat"}</p>
                        <p><span className="font-medium text-gray-700">Adresse :</span> {c.adresseLivraison || "Non fournie"}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="font-extrabold text-orange-600 text-lg">{c.total} DH</span>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md border ${
                          c.methodePaiement === 'STRIPE' ? 'bg-purple-50 text-purple-700 border-purple-150' : 'bg-blue-50 text-blue-700 border-blue-150'
                        }`}>
                          {c.methodePaiement === 'STRIPE' ? '💳 Payé en ligne' : '💵 À encaisser (Cash)'}
                        </span>
                      </div>
                    </div>

                    {/* Actions buttons */}
                    <div className="flex sm:flex-col gap-2 shrink-0">
                      {c.statut === 'COMMANDE_CREEE' && (
                        <button
                          onClick={() => gererStatutCommande(c.id, 'EN_PREPARATION', 'En Cuisine')}
                          className="flex-1 sm:flex-initial bg-orange-150 hover:bg-orange-200 text-orange-800 font-bold py-2.5 px-4 rounded-xl text-sm transition-colors text-center"
                        >
                          🧑‍🍳 Mettre en Préparation
                        </button>
                      )}
                      {(c.statut === 'COMMANDE_CREEE' || c.statut === 'EN_PREPARATION') && (
                        <button
                          onClick={() => gererStatutCommande(c.id, 'PRÊTE_POUR_LIVRAISON', 'Prête pour Livraison')}
                          className="flex-1 sm:flex-initial bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all shadow-md shadow-green-100 hover:shadow-green-200 text-center active:scale-95"
                        >
                          🍳 Marquer comme Prête
                        </button>
                      )}
                      {c.statut === 'PRÊTE_POUR_LIVRAISON' && (
                        <span className="text-xs font-semibold text-gray-400 bg-gray-50 border border-gray-100 py-2.5 px-4 rounded-xl text-center">
                          En attente du livreur... 🚴
                        </span>
                      )}
                      {c.statut === 'EN_COURS_DE_LIVRAISON' && (
                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 py-2.5 px-4 rounded-xl text-center">
                          En cours de livraison 🚴
                        </span>
                      )}
                      {c.statut === 'LIVRÉE' && (
                        <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-100 py-2.5 px-4 rounded-xl text-center">
                          Livrée avec succès ! ✅
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form add plat */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm h-fit">
              <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <PlusCircle size={20} className="text-orange-500" />
                Nouveau Plat
              </h2>

              <form onSubmit={ajouterNouveauPlat} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom du Plat</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <Utensils size={18} />
                    </span>
                    <input
                      type="text"
                      placeholder="Ex: Tajine de Poulet"
                      value={nomPlat}
                      onChange={(e) => setNomPlat(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Prix (DH)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <Coins size={18} />
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Ex: 65.00"
                      value={prixPlat}
                      onChange={(e) => setPrixPlat(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Image URL (Optionnel)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <ImageIcon size={18} />
                    </span>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={imagePlat}
                      onChange={(e) => setImagePlat(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description (Optionnel)</label>
                  <textarea
                    placeholder="Ingrédients, accompagnements..."
                    value={descPlat}
                    onChange={(e) => setDescPlat(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm h-20 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-4 rounded-xl shadow-md shadow-orange-100 hover:shadow-orange-200 transition-all duration-150 transform active:scale-[0.98]"
                >
                  Ajouter au Menu
                </button>
              </form>
            </div>

            {/* Current Menu List */}
            <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Utensils size={20} className="text-orange-500" />
                Votre Menu Actuel ({plats.length} Plats)
              </h2>

              {plats.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-12">Aucun plat enregistré pour le moment.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
                  {plats.map(plat => (
                    <div key={plat.id} className="p-3 bg-gray-50 border border-gray-100 rounded-2xl flex gap-3 items-center">
                      <img 
                        src={obtenirImagePlat(plat)} 
                        alt={plat.nom}
                        className="h-14 w-14 object-cover rounded-xl shrink-0 border border-gray-200 shadow-sm"
                        loading="lazy"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="font-extrabold text-gray-800 text-sm block truncate">{plat.nom}</span>
                        <span className="text-xs text-gray-500 block leading-relaxed mt-0.5 truncate">{plat.description || "Aucune description"}</span>
                      </div>
                      <span className="font-black text-orange-600 text-sm shrink-0">{plat.prix} DH</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 📊 TAB STATISTIQUES & ANALYSES */}
        {activeTab === 'stats' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Row 1: KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card CA */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                <div className="bg-green-50 p-3.5 rounded-2xl text-green-600">
                  <Coins size={24} />
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Chiffre d'Affaires</span>
                  <span className="text-2xl font-black text-gray-900">{chiffreAffaires} DH</span>
                </div>
              </div>

              {/* Card Commandes */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                <div className="bg-orange-50 p-3.5 rounded-2xl text-orange-600">
                  <ClipboardList size={24} />
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Commandes Clôturées</span>
                  <span className="text-2xl font-black text-gray-900">{commandesLivrees.length}</span>
                </div>
              </div>

              {/* Card Panier Moyen */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                <div className="bg-blue-50 p-3.5 rounded-2xl text-blue-600">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Panier Moyen</span>
                  <span className="text-2xl font-black text-gray-900">{panierMoyen} DH</span>
                </div>
              </div>

              {/* Card Evaluation moyenne */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                <div className="bg-yellow-50 p-3.5 rounded-2xl text-yellow-500">
                  <Star size={24} fill="currentColor" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Avis Clients</span>
                  <span className="text-2xl font-black text-gray-900">4.8 / 5</span>
                </div>
              </div>
            </div>

            {/* Row 2: Sales Chart & Best Sellers */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Sales Chart (Custom CSS Bar Chart) */}
              <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-gray-900 text-lg">Chiffre d'Affaires Hebdomadaire</h3>
                  <span className="text-xs font-semibold text-gray-400">Derniers 7 jours</span>
                </div>

                <div className="h-64 flex items-end gap-3 sm:gap-6 pt-4 border-b border-gray-100 pb-2">
                  {statsVentesSemaine.map((item, idx) => {
                    const heightPercent = Math.max(8, Math.round((item.montant / maxVenteSemaine) * 100));
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center group relative cursor-pointer">
                        <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          {item.montant} DH • {item.orders} cmd
                        </div>

                        <div 
                          className="w-full rounded-t-lg bg-gradient-to-t from-orange-500 to-orange-400 group-hover:from-orange-600 group-hover:to-orange-500 transition-all duration-300"
                          style={{ height: `${heightPercent}%` }}
                        />
                        <span className="text-xs font-bold text-gray-500 mt-2 block">{item.jour}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Best Selling Dishes */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
                <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
                  <TrendingUp size={20} className="text-orange-500" />
                  Plats Populaires
                </h3>

                {platsPopulaires.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-12">Aucune donnée disponible. Ajoutez des plats et recevez des commandes !</p>
                ) : (
                  <div className="space-y-5">
                    {platsPopulaires.map((plat, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-bold text-gray-800">{plat.nom}</span>
                          <span className="text-xs font-bold text-gray-400">{plat.quantite} vendus</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-orange-500 to-orange-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${plat.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Row 3: Live feedback summary */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="font-extrabold text-gray-900 text-lg mb-4 flex items-center gap-2">
                <Users size={20} className="text-slate-700" />
                Derniers Avis Clients Simulés
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-800 text-sm">Mohamed A.</span>
                    <span className="flex text-yellow-500 text-xs gap-0.5"><Star size={12} fill="currentColor" /> 5/5</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    "Le tajine était succulent, encore très chaud à la livraison. Nous recommanderons avec plaisir !"
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-800 text-sm">Yasmine K.</span>
                    <span className="flex text-yellow-500 text-xs gap-0.5"><Star size={12} fill="currentColor" /> 4/5</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    "Très bonnes frites et portion généreuse. Livraison un poil longue mais le goût fait tout pardonner."
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default RestoDashboard;
