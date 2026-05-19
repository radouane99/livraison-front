import React from 'react';
import { User, LogOut, Utensils } from 'lucide-react';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-orange-500 p-2 rounded-lg shadow-md shadow-orange-200">
              <Utensils className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
              QuickEat
            </span>
          </div>

          {/* Menu Actions */}
          <div className="flex items-center gap-6">
            {user && (
              <>
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="bg-gray-100 p-1.5 rounded-full">
                    <User size={18} className="text-gray-500" />
                  </div>
                  <span className="font-medium text-gray-700">{user.nom}</span>
                  <span className="text-xs bg-orange-100 text-orange-600 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    {user.role}
                  </span>
                </div>
                
                <button 
                  onClick={onLogout}
                  className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-3.5 py-2 rounded-lg transition-all duration-200 active:scale-95"
                >
                  <LogOut size={18} />
                  <span className="font-semibold">Déconnexion</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
