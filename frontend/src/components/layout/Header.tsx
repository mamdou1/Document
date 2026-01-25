import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Bell, LogOut, Search, Settings } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Header() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Fonction pour transformer le chemin (/membres -> Membres)
  const getPageTitle = () => {
    const path =
      location.pathname === "/"
        ? "Tableau de bord"
        : location.pathname.substring(1);
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header className="flex justify-between items-center h-20 px-8 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
      {/* Côté Gauche : Titre dynamique */}
      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-blue-900 tracking-tight">
          {getPageTitle()}
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Bienvenue, {user?.prenom || "Utilisateur"}
        </p>
      </div>

      {/* Côté Droit : Actions */}
      <div className="flex items-center gap-3">
        {/* Barre de recherche discrète */}
        <div className="hidden md:flex items-center bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-48 text-slate-700 placeholder:text-slate-400"
          />
        </div>

        <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden md:block" />

        {/* Bouton Notifications */}
        <button className="relative p-2.5 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all group">
          <Bell size={20} />
          <span className="absolute top-2 right-2 bg-red-500 border-2 border-white text-[10px] font-bold text-white rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
            3
          </span>
        </button>

        {/* Bouton Paramètres (Optionnel mais joli) */}
        <button className="p-2.5 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all">
          <Settings size={20} />
        </button>

        {/* Bouton Déconnexion - Style Outlined pour ne pas surcharger */}
        <button
          onClick={logout}
          className="flex items-center gap-2 ml-2 bg-white border border-red-200 text-red-600 px-4 py-2 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all font-semibold text-sm shadow-sm"
        >
          <LogOut size={18} />
          <span className="hidden lg:inline">Déconnexion</span>
        </button>
      </div>
    </header>
  );
}
