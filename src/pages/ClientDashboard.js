import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, ShoppingBag, CreditCard, Clock, MapPin, Utensils, Trash2, Star, Bike, CheckCircle, Navigation, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const API_URL = "http://localhost:8181/api";

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

const ClientDashboard = ({ user }) => {
  const [plats, setPlats] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [panier, setPanier] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mode de paiement selectionné (STRIPE ou CASH)
  const [methodePaiement, setMethodePaiement] = useState('STRIPE');

  // États Phase 2 - Conflit Panier Multi-Restaurant
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictPlat, setConflictPlat] = useState(null);

  // États Phase 2 - Modal d'évaluation
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingOrder, setRatingOrder] = useState(null);
  const [ratingPlat, setRatingPlat] = useState(5);
  const [ratingLivreur, setRatingLivreur] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [evaluatedOrders, setEvaluatedOrders] = useState(() => {
    const saved = localStorage.getItem(`evaluated_orders_${user.id}`);
    return saved ? JSON.parse(saved) : [];
  });

  // États Phase 2 - Suivi GPS et télémétrie simulés
  const [telemetry, setTelemetry] = useState({
    distance: 1.8,
    eta: 8,
    speed: 24,
    progress: 10
  });

  const chargerDonnees = async () => {
    try {
      setLoading(true);
      const [resPlats, resCommandes] = await Promise.all([
        axios.get(`${API_URL}/plats`),
        axios.get(`${API_URL}/commandes`)
      ]);
      setPlats(resPlats.data);
      setCommandes(resCommandes.data);
    } catch (err) {
      toast.error("Erreur de chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chargerDonnees();
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API_URL}/commandes`);
        setCommandes(res.data);
      } catch (e) {
        console.error(e);
      }
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Simulation d'activité de télémétrie GPS pour la commande en cours de livraison
  useEffect(() => {
    const hasActiveDelivery = commandes.some(
      c => c.client?.id === user.id && c.statut === 'EN_COURS_DE_LIVRAISON'
    );

    if (hasActiveDelivery) {
      const routeInterval = setInterval(() => {
        setTelemetry(prev => {
          if (prev.distance <= 0.1) {
            return { distance: 0.1, eta: 1, speed: 0, progress: 95 };
          }
          const nextDist = parseFloat((prev.distance - 0.1).toFixed(2));
          const nextEta = Math.max(1, Math.round(prev.eta - 1));
          const nextProgress = Math.min(95, prev.progress + 6);
          const nextSpeed = Math.floor(18 + Math.random() * 8);
          return {
            distance: nextDist,
            eta: nextEta,
            speed: nextSpeed,
            progress: nextProgress
          };
        });
      }, 5000);
      return () => clearInterval(routeInterval);
    } else {
      setTelemetry({ distance: 1.8, eta: 8, speed: 24, progress: 10 });
    }
  }, [commandes, user.id]);

  // Détection automatique de commande livrée non évaluée
  useEffect(() => {
    const commandeLivreeNonEvaluee = commandes.find(
      c => c.client?.id === user.id && 
           c.statut === 'LIVRÉE' && 
           !evaluatedOrders.includes(c.id)
    );

    if (commandeLivreeNonEvaluee && !showRatingModal) {
      setRatingOrder(commandeLivreeNonEvaluee);
      setShowRatingModal(true);
    }
  }, [commandes, evaluatedOrders, user.id, showRatingModal]);

  // Actions Panier & Gestion de conflit
  const ajouterAuPanier = (plat) => {
    if (panier.length > 0 && panier[0].restaurant?.id !== plat.restaurant?.id) {
      setConflictPlat(plat);
      setShowConflictModal(true);
      return;
    }

    const exist = panier.find(x => x.id === plat.id);
    if (exist) {
      setPanier(panier.map(x => x.id === plat.id ? { ...exist, qte: exist.qte + 1 } : x));
    } else {
      setPanier([...panier, { ...plat, qte: 1 }]);
    }
    toast.success(`${plat.nom} ajouté au panier`);
  };

  const viderEtAjouterConflit = () => {
    if (conflictPlat) {
      setPanier([{ ...conflictPlat, qte: 1 }]);
      toast.success(`Panier réinitialisé avec les plats de : ${conflictPlat.restaurant?.nom}`);
    }
    setShowConflictModal(false);
    setConflictPlat(null);
  };

  const retirerDuPanier = (id) => {
    setPanier(panier.filter(x => x.id !== id));
    toast.error("Plat retiré du panier");
  };

  const totalPanier = panier.reduce((a, c) => a + c.prix * c.qte, 0);

  // Commande groupée
  const handleCommander = async () => {
    if (panier.length === 0) return;
    const loadingToast = toast.loading(methodePaiement === 'STRIPE' ? "Simulation du paiement Stripe..." : "Enregistrement de la commande...");
    try {
      let paiementReussi = false;
      let transactionId = "CASH_ON_DELIVERY";

      if (methodePaiement === 'STRIPE') {
        const paiementRes = await axios.post(`${API_URL}/paiement/charger`, {
          montant: totalPanier,
          email: user.email
        });

        if (paiementRes.data.status === "succeeded") {
          paiementReussi = true;
          transactionId = paiementRes.data.transactionId;
          toast.success(`💳 Paiement Stripe Réussi ! ID: ${transactionId}`, { id: loadingToast });
        } else {
          toast.error("Le paiement Stripe a échoué.", { id: loadingToast });
          return;
        }
      } else {
        paiementReussi = true;
        toast.success("📦 Commande enregistrée en mode : À la livraison !", { id: loadingToast });
      }

      if (paiementReussi) {
        await axios.post(`${API_URL}/commandes`, {
          client: { id: user.id },
          restaurant: { id: panier[0].restaurant.id },
          total: totalPanier,
          adresseLivraison: "Casablanca, Maroc",
          methodePaiement: methodePaiement,
          statutPaiement: methodePaiement === 'STRIPE' ? 'PAYÉ' : 'EN_ATTENTE'
        });

        toast.success("🚀 Commande envoyée au restaurant avec succès !");
        setPanier([]);
        
        const res = await axios.get(`${API_URL}/commandes`);
        setCommandes(res.data);
      }
    } catch (err) {
      toast.error("Échec de l'enregistrement de la commande", { id: loadingToast });
    }
  };

  const soumettreEvaluation = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Enregistrement de votre avis...");
    try {
      await axios.post(`${API_URL}/evaluations`, {
        commandeId: ratingOrder.id,
        notePlat: ratingPlat,
        noteLivreur: ratingLivreur,
        commentaire: ratingComment
      }).catch(() => {
        console.log("Evaluation enregistrée localement");
      });

      const newEvaluated = [...evaluatedOrders, ratingOrder.id];
      setEvaluatedOrders(newEvaluated);
      localStorage.setItem(`evaluated_orders_${user.id}`, JSON.stringify(newEvaluated));
      
      toast.success("Merci beaucoup pour votre retour d'expérience ! ⭐", { id: loadingToast });
      
      setShowRatingModal(false);
      setRatingOrder(null);
      setRatingPlat(5);
      setRatingLivreur(5);
      setRatingComment('');
    } catch (err) {
      toast.error("Erreur lors de la soumission de l'avis", { id: loadingToast });
    }
  };

  const mesCommandes = commandes.filter(c => c.client?.id === user.id);
  const commandeEnCoursLivraison = mesCommandes.find(c => c.statut === 'EN_COURS_DE_LIVRAISON');

  return (
    <div className="relative">
      
      {/* 🚀 COMPOSANT CARTE DE SUIVI EN DIRECT SIMULÉE */}
      {commandeEnCoursLivraison && (
        <div className="mb-8 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-indigo-950 overflow-hidden relative group">
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-700">
            <Bike size={180} />
          </div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500/25 p-2 rounded-xl animate-pulse">
                <Bike className="text-indigo-400" size={24} />
              </div>
              <div>
                <h3 className="font-extrabold text-xl">Suivi de Livraison en Direct</h3>
                <p className="text-xs text-indigo-300">Commande #{commandeEnCoursLivraison.id} • En cours de livraison</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-indigo-200">
                  <span className="flex items-center gap-1"><Utensils size={14} /> Restaurant</span>
                  <span className="flex items-center gap-1"><MapPin size={14} /> Chez Vous</span>
                </div>
                <div className="relative w-full h-4 bg-white/5 rounded-full overflow-hidden border border-white/5 flex items-center px-1">
                  <div className="absolute left-0 top-0 bottom-0 bg-indigo-500/20 transition-all duration-1000" style={{ width: `${telemetry.progress}%` }}></div>
                  <div 
                    className="absolute transition-all duration-1000 transform -translate-y-1/2 top-1/2" 
                    style={{ left: `calc(${telemetry.progress}% - 8px)` }}
                  >
                    <div className="bg-orange-500 p-1 rounded-full shadow-lg shadow-orange-500/50 flex items-center justify-center animate-bounce">
                      <Bike size={12} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 md:border-l md:border-white/10 md:pl-6 shrink-0 justify-around">
                <div className="text-center">
                  <span className="block text-[10px] uppercase font-bold text-indigo-300 tracking-wider">Distance</span>
                  <span className="font-black text-xl text-white">{telemetry.distance} km</span>
                </div>
                <div className="text-center border-x border-white/10 px-4">
                  <span className="block text-[10px] uppercase font-bold text-indigo-300 tracking-wider">Temps estimé</span>
                  <span className="font-black text-xl text-white animate-pulse">{telemetry.eta} min</span>
                </div>
                <div className="text-center">
                  <span className="block text-[10px] uppercase font-bold text-indigo-300 tracking-wider">Vitesse</span>
                  <span className="font-black text-xl text-indigo-400">{telemetry.speed} km/h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* 🍕 SECTION DES PLATS (2 Colonnes) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3">
            <Utensils className="text-orange-500" size={28} />
            <h3 className="text-2xl font-black text-gray-800">Découvrez nos Menus</h3>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plats.map(plat => (
                <div key={plat.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all flex flex-col justify-between group">
                  
                  {/* Gourmet Food Photo Header */}
                  <div className="h-44 w-full overflow-hidden relative bg-gray-100">
                    <img 
                      src={obtenirImagePlat(plat)} 
                      alt={plat.nom}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/35 to-transparent"></div>
                    <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-orange-600 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      {plat.restaurant?.nom || "Restaurant"}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <h4 className="text-lg font-bold text-gray-900 group-hover:text-orange-500 transition-colors">{plat.nom}</h4>
                      <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{plat.description || "Aucune description fournie par le chef."}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                      <span className="text-xl font-black text-gray-900">{plat.prix} DH</span>
                      <button
                        onClick={() => ajouterAuPanier(plat)}
                        className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-orange-100 text-xs active:scale-95"
                      >
                        <ShoppingCart size={14} /> Ajouter
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

          {/* 📋 SUIVI DES COMMANDES */}
          <div className="pt-8">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="text-gray-700" size={24} />
              <h4 className="text-xl font-bold text-gray-800">Historique & Suivi Live</h4>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {mesCommandes.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">Aucune commande enregistrée.</p>
              ) : (
                mesCommandes.slice().reverse().map(c => (
                  <div key={c.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center hover:border-gray-200 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-150 p-2.5 rounded-xl text-gray-600">
                        <ShoppingBag size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900">Commande #{c.id}</p>
                          {evaluatedOrders.includes(c.id) && (
                            <span className="bg-yellow-50 text-yellow-600 text-[10px] font-bold px-1.5 py-0.5 rounded border border-yellow-100 flex items-center gap-0.5">
                              <Star size={10} fill="currentColor" /> Évaluée
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <MapPin size={12} /> Casablanca, Maroc
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-gray-900">{c.total} DH</p>
                      <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full mt-1 border ${
                        c.statut === 'LIVRÉE' ? 'bg-green-50 text-green-700 border-green-150' :
                        c.statut === 'EN_COURS_DE_LIVRAISON' ? 'bg-indigo-50 text-indigo-700 border-indigo-150 animate-pulse' :
                        'bg-orange-50 text-orange-700 border-orange-150'
                      }`}>
                        {c.statut}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 🛒 SIDEBAR DU PANIER INTERACTIF (1 Colonne) */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl h-fit sticky top-24">
          <div className="flex items-center gap-2 pb-4 border-b border-gray-100 mb-4">
            <ShoppingCart className="text-orange-500" size={22} />
            <h3 className="text-lg font-black text-gray-900">Mon Panier</h3>
            <span className="ml-auto bg-orange-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
              {panier.reduce((a, c) => a + c.qte, 0)}
            </span>
          </div>

          {panier.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <ShoppingBag className="mx-auto mb-2 opacity-40" size={40} />
              <p className="text-sm">Votre panier est vide</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                {panier.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div>
                      <p className="font-bold text-sm text-gray-900">{item.nom}</p>
                      <p className="text-xs text-gray-500">{item.prix} DH x {item.qte}</p>
                      <span className="text-[10px] text-orange-600 font-bold block mt-0.5">{item.restaurant?.nom}</span>
                    </div>
                    <button
                      onClick={() => retirerDuPanier(item.id)}
                      className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Remplacer le bloc du bas de la sidebar par la selection Cash / Stripe */}
              <div className="pt-4 border-t border-gray-100 space-y-4">
                
                {/* Choix de la méthode de paiement */}
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Mode de paiement</label>
                  <div className="grid grid-cols-2 gap-2">
                    
                    <button
                      type="button"
                      onClick={() => setMethodePaiement('STRIPE')}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-0.5 active:scale-95 ${
                        methodePaiement === 'STRIPE' 
                          ? 'border-orange-500 bg-orange-50/50 text-orange-950 ring-2 ring-orange-500/10' 
                          : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      <span className="font-bold text-xs">💳 En ligne</span>
                      <span className="text-[9px] opacity-70">Stripe</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMethodePaiement('CASH')}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-0.5 active:scale-95 ${
                        methodePaiement === 'CASH' 
                          ? 'border-orange-500 bg-orange-50/50 text-orange-950 ring-2 ring-orange-500/10' 
                          : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      <span className="font-bold text-xs">💵 Au Livreur</span>
                      <span className="text-[9px] opacity-70">Sur Place (COD)</span>
                    </button>

                  </div>
                </div>

                <div className="flex justify-between font-bold text-gray-900 text-lg pt-2">
                  <span>Total :</span>
                  <span>{totalPanier} DH</span>
                </div>

                <button 
                  onClick={handleCommander}
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-orange-100 transition-all flex items-center justify-center gap-2 text-sm active:scale-98"
                >
                  <CreditCard size={18} /> 
                  {methodePaiement === 'STRIPE' ? `Payer via Stripe (${totalPanier} DH)` : `Confirmer la Commande (${totalPanier} DH)`}
                </button>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* ⚠️ MODAL DE CONFLIT MULTI-RESTAURANT */}
      {showConflictModal && conflictPlat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 transform scale-100 transition-all">
            <div className="flex items-center gap-3 text-amber-600 mb-4">
              <div className="bg-amber-50 p-2.5 rounded-xl">
                <AlertTriangle size={24} />
              </div>
              <h3 className="font-extrabold text-lg text-gray-900">Restaurant différent !</h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Votre panier contient déjà des plats de <strong className="text-gray-900">{panier[0]?.restaurant?.nom}</strong>. 
              Pour commander chez <strong className="text-gray-900">{conflictPlat.restaurant?.nom}</strong>, vous devez d'abord vider votre panier actuel.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowConflictModal(false); setConflictPlat(null); }}
                className="flex-1 bg-gray-100 hover:bg-gray-250 text-gray-700 font-bold py-2.5 rounded-xl text-sm transition-colors"
              >
                Garder mon panier
              </button>
              <button
                onClick={viderEtAjouterConflit}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-md shadow-orange-100"
              >
                Vider et Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⭐ MODAL D'ÉVALUATION POST-LIVRAISON */}
      {showRatingModal && ratingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 overflow-hidden transform scale-100 transition-all">
            
            <div className="text-center pb-4 border-b border-gray-100 mb-6">
              <div className="inline-flex bg-yellow-50 p-3.5 rounded-full text-yellow-500 mb-2">
                <Star size={32} fill="currentColor" />
              </div>
              <h3 className="font-black text-xl text-gray-900">Donnez votre avis ! ⭐</h3>
              <p className="text-xs text-gray-400 mt-1">Votre commande #{ratingOrder.id} a été livrée avec succès</p>
            </div>

            <form onSubmit={soumettreEvaluation} className="space-y-6">
              <div className="space-y-2 text-center">
                <label className="text-sm font-extrabold text-gray-800 block">Comment était votre repas ? 🍔</label>
                <div className="flex justify-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingPlat(star)}
                      className="text-yellow-400 transition-transform active:scale-125 focus:outline-none"
                    >
                      <Star size={28} fill={star <= ratingPlat ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 text-center">
                <label className="text-sm font-extrabold text-gray-800 block">Comment s'est passée la livraison ? 🚴</label>
                <div className="flex justify-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingLivreur(star)}
                      className="text-yellow-400 transition-transform active:scale-125 focus:outline-none"
                    >
                      <Star size={28} fill={star <= ratingLivreur ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 block">Laissez un commentaire (optionnel)</label>
                <textarea
                  placeholder="Le plat était succulent, livraison très aimable !"
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-250 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-xs h-20 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const newEvaluated = [...evaluatedOrders, ratingOrder.id];
                    setEvaluatedOrders(newEvaluated);
                    localStorage.setItem(`evaluated_orders_${user.id}`, JSON.stringify(newEvaluated));
                    setShowRatingModal(false);
                    setRatingOrder(null);
                  }}
                  className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-500 font-bold py-2.5 rounded-xl text-sm transition-colors border border-gray-150"
                >
                  Passer
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-md shadow-orange-100"
                >
                  Envoyer mon avis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ClientDashboard;