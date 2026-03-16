import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Bell, LogOut, Search, Settings } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  TypeDocument,
  EntiteeUn,
  EntiteeDeux,
  EntiteeTrois,
  User,
} from "../../interfaces";
import { getAllEntiteeUn, getEntiteeUnTitre } from "../../api/entiteeUn";
import { getAllEntiteeDeux, getEntiteeDeuxTitre } from "../../api/entiteeDeux";
import {
  getAllEntiteeTrois,
  getEntiteeTroisTitre,
} from "../../api/entiteeTrois";

export default function Header() {
  // États pour les dropdowns des entitees
  const [entiteeUn, setEntiteeUn] = useState<EntiteeUn[]>([]);
  const [entiteeDeux, setEntiteeDeux] = useState<EntiteeDeux[]>([]);
  const [entiteeTrois, setEntiteeTrois] = useState<EntiteeTrois[]>([]);

  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Fonction corrigée pour obtenir le titre de la page
  const getPageTitle = () => {
    // Cas spécial pour le dashboard
    if (location.pathname === "/") {
      return "Tableau de bord";
    }

    // Vérifier les chemins avec startsWith pour les pages d'entités
    if (location.pathname.startsWith("/entiteeUn")) {
      return titres.niveau1 || "Niveau 1";
    }

    if (location.pathname.startsWith("/entiteeDeux")) {
      return titres.niveau2 || "Niveau 2";
    }

    if (location.pathname.startsWith("/entiteeTrois")) {
      return titres.niveau3 || "Niveau 3";
    }

    // Pour les autres pages, on prend le dernier segment du chemin
    const segments = location.pathname.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1] || "";

    // Capitaliser la première lettre
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
  };

  // Titres dynamiques
  const [titres, setTitres] = useState<{
    niveau1: string;
    niveau2: string;
    niveau3: string;
  }>({
    niveau1: "",
    niveau2: "",
    niveau3: "",
  });

  useEffect(() => {
    const loadTitresEtEntites = async () => {
      try {
        const [t1, t2, t3, e1, e2, e3] = await Promise.all([
          getEntiteeUnTitre(),
          getEntiteeDeuxTitre(),
          getEntiteeTroisTitre(),
          getAllEntiteeUn(),
          getAllEntiteeDeux(),
          getAllEntiteeTrois(),
        ]);

        // ✅ Ne garder que les niveaux qui ont un titre
        const newTitres = {
          niveau1: t1.titre || "",
          niveau2: t2.titre || "",
          niveau3: t3.titre || "",
        };
        setTitres(newTitres);

        setEntiteeUn(Array.isArray(e1) ? e1 : []);
        setEntiteeDeux(Array.isArray(e2) ? e2 : []);
        setEntiteeTrois(Array.isArray(e3) ? e3 : []);
      } catch (error) {
        console.error("❌ Erreur chargement titres:", error);
      }
    };
    loadTitresEtEntites();
  }, []);

  return (
    <header className="flex justify-between items-center h-20 px-8 bg-white border-b border-emerald-100 sticky top-0 z-40 shadow-sm">
      {/* Côté Gauche */}
      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-emerald-950 tracking-tight">
          {getPageTitle()}
        </h1>
        <p className="text-xs text-emerald-600 font-medium">
          Bienvenue,{" "}
          <span className="text-emerald-900 font-bold">
            {user?.prenom || "Utilisateur"}
          </span>
        </p>
      </div>

      {/* Côté Droit */}
      <div className="flex items-center gap-3">
        {/* <div className="hidden md:flex items-center bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
          <Search size={18} className="text-emerald-600" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-48 text-emerald-900 placeholder:text-emerald-400"
          />
        </div> */}

        <div className="h-8 w-[1px] bg-emerald-100 mx-2 hidden md:block" />

        <div className="flex items-center gap-1">
          {/* <button className="relative p-2.5 text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all group">
            <Bell size={20} />
            <span className="absolute top-2 right-2 bg-orange-500 border-2 border-white text-[10px] font-bold text-white rounded-full h-4 w-4 flex items-center justify-center">
              3
            </span>
          </button> */}
          <button
            onClick={() => navigate("/change-password")}
            className="p-2.5 text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all"
            title="Changer le mot de passe"
          >
            <Settings size={20} />
          </button>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 ml-2 bg-red-50 text-red-600 border border-red-100 px-4 py-2 rounded-xl hover:bg-red-600 hover:text-white transition-all font-semibold text-sm"
        >
          <LogOut size={18} />
          <span className="hidden lg:inline">Déconnexion</span>
        </button>
      </div>
    </header>
  );
}
