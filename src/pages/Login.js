import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Mail, Lock, User, KeyRound, ChefHat } from 'lucide-react';
import { API_URL } from '../config';

const Login = ({ setUser }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nom, setNom] = useState('');
  const [role, setRole] = useState('CLIENT');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      toast.success(`Bienvenue, ${res.data.nom} !`);
      
      // Enregistrer dans le localStorage
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Identifiants incorrects ou serveur injoignable");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !password || !nom) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/register`, { email, password, nom, role });
      toast.success("Inscription réussie ! Connectez-vous maintenant.");
      setIsRegister(false);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'inscription. Vérifiez votre backend Tomcat / MySQL.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl">
        <div className="p-8">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex bg-orange-100 p-4 rounded-full mb-3 text-orange-600">
              <ChefHat size={36} />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {isRegister ? "Créez votre compte" : "Heureux de vous revoir !"}
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              {isRegister 
                ? "Rejoignez QuickEat et commandez en un clic" 
                : "Connectez-vous pour accéder à vos commandes"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-5">
            {isRegister && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom Complet</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    placeholder="Ex: Mohamed Alami"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Adresse Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  placeholder="nom@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mot de passe</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Votre Rôle</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <KeyRound size={18} />
                  </span>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                  >
                    <option value="CLIENT">Client 🛒</option>
                    <option value="RESTAURANT">Gérant Restaurant 👨‍🍳</option>
                    <option value="LIVREUR">Livreur 🚴</option>
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-orange-100 hover:shadow-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-150 transform active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Chargement..." : isRegister ? "S'inscrire" : "Se Connecter"}
            </button>
          </form>

          {/* Toggle Link */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
            >
              {isRegister 
                ? "Vous avez déjà un compte ? Connectez-vous" 
                : "Nouveau sur QuickEat ? Créez un compte"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
