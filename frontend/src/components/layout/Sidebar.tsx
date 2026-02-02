import {
  LayoutDashboard,
  FileText,
  Boxes,
  Layers,
  ListChecks,
  CircleDollarSign,
  ChevronFirst,
  ChevronLast,
  Search,
  MoreVertical,
  UserRound,
  ArrowBigDown,
  FolderPen,
  HandCoins,
  PanelTopOpenIcon,
  ChevronDown,
  Lock,
  ShieldCheck,
  Split,
  TableOfContents,
  GitFork,
  Landmark,
  History,
  Database,
  Pyramid,
  Archive,
  Warehouse,
  WavesLadder,
} from "lucide-react";

import logo from "../../assets/logoArchi.png";
import profil from "../../assets/homme.jpg";
import { Link, useLocation } from "react-router-dom";
import { createContext, useContext, useState, useEffect } from "react";
import { SidebarProps, SidebarContextType } from "../../interfaces/composant";
import { useAuth } from "../../context/AuthContext";
import { getEntiteeUnTitre } from "../../api/entiteeUn";
import { getEntiteeDeuxTitre } from "../../api/entiteeDeux";
import { getEntiteeTroisTitre } from "../../api/entiteeTrois";

export const SidebarContext = createContext<SidebarContextType>({
  expended: true,
  treeOpen: {},
  toggleTree: () => {},
});

export default function Sidebar({ children }: SidebarProps) {
  const [expended, setExpended] = useState(true);
  const location = useLocation();
  const { user, can } = useAuth();

  const [treeOpen, setTreeOpen] = useState<{ [key: string]: boolean }>(() => {
    const saved = localStorage.getItem("sidebar-tree");
    return saved ? JSON.parse(saved) : {};
  });

  // 1. État pour stocker les titres dynamiques
  const [dynamicTitles, setDynamicTitles] = useState({
    titre1: "",
    titre2: "",
    titre3: "",
  });

  // 2. Récupération des titres au chargement
  useEffect(() => {
    const fetchTitles = async () => {
      try {
        const [t1, t2, t3] = await Promise.all([
          getEntiteeUnTitre(),
          getEntiteeDeuxTitre(),
          getEntiteeTroisTitre(),
        ]);
        setDynamicTitles({
          titre1: t1.titre || "",
          titre2: t2.titre || "",
          titre3: t3.titre || "",
        });
      } catch (error) {
        console.error("Erreur lors du chargement des titres sidebar", error);
      }
    };
    fetchTitles();
  }, []);

  const toggleTree = (label: string) => {
    setTreeOpen((prev) => {
      const next = { ...prev, [label]: !prev[label] };
      localStorage.setItem("sidebar-tree", JSON.stringify(next));
      return next;
    });
  };

  return (
    <aside className="h-screen sticky top-0">
      <nav
        className={`h-full flex flex-col bg-emerald-950 border-r border-emerald-900 shadow-2xl transition-all duration-300 ${
          expended ? "w-72" : "w-20"
        }`}
      >
        {/* Header - Logo et Toggle */}
        <div className="flex items-center justify-between p-4 h-20 bg-emerald-950">
          <div
            className={`overflow-hidden transition-all duration-300 ${
              expended ? "w-32" : "w-0"
            }`}
          >
            {/* brightness-0 invert permet de rendre ton logo blanc pur pour le fond sombre */}
            <img
              src={logo}
              alt="Logo"
              className="w-40 h-20 brightness-0 invert"
            />
          </div>

          <button
            onClick={() => setExpended((v) => !v)}
            className="p-2 rounded-lg bg-emerald-800 text-emerald-100 hover:bg-emerald-600 hover:text-white transition-all shadow-lg"
          >
            {expended ? <ChevronFirst size={20} /> : <ChevronLast size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 mt-4 custom-scrollbar">
          <SidebarContext.Provider value={{ expended, treeOpen, toggleTree }}>
            <ul className="space-y-1">
              <SidebarLink
                icon={LayoutDashboard}
                text="Tableau de bord"
                to="/"
                active={location.pathname === "/"}
              />

              <div
                className={`my-4 border-t border-emerald-800/50 mx-2 ${
                  !expended && "hidden"
                }`}
              />

              {/* {can("liquidation", "read") && (
                <SidebarLink
                  icon={CircleDollarSign}
                  text="Liquidations"
                  to="/liquidations"
                  active={location.pathname.startsWith("/liquidations")}
                />
              )} */}

              {/* ================= ORGANIGRAMME ================= */}

              <SidebarTree label="Organigrame" icon={GitFork}>
                {/* Condition : Affiché seulement si titre1 existe */}
                {dynamicTitles.titre1 && (
                  <SidebarLink
                    icon={Landmark}
                    text={dynamicTitles.titre1}
                    to="/entiteeUn"
                    active={location.pathname.startsWith("/entiteeUn")}
                  />
                )}

                {/* Condition : Affiché seulement si titre2 existe */}
                {dynamicTitles.titre2 && (
                  <SidebarLink
                    icon={Split}
                    text={dynamicTitles.titre2}
                    to="/entiteeDeux"
                    active={location.pathname.startsWith("/entiteeDeux")}
                  />
                )}

                {/* Condition : Affiché seulement si titre3 existe */}
                {dynamicTitles.titre3 && (
                  <SidebarLink
                    icon={TableOfContents}
                    text={dynamicTitles.titre3}
                    to="/entiteeTrois"
                    active={location.pathname.startsWith("/entiteeTrois")}
                  />
                )}
                <SidebarLink
                  icon={Pyramid}
                  text="Configuration"
                  to="/organigrame"
                  active={location.pathname.startsWith("/organigrame")}
                />
              </SidebarTree>

              {/* ================= GESTION ================= */}
              {(can("type", "read") ||
                can("pieces", "read") ||
                can("documentType", "read") ||
                can("document", "read")) && (
                <SidebarTree label="Gestion" icon={FolderPen}>
                  {/* {can("type", "read") && (
                    <SidebarLink
                      icon={ArrowBigDown}
                      text="Type de dossier"
                      to="/type"
                      active={location.pathname.startsWith("/type")}
                    />
                  )} */}
                  {can("pieces", "read") && (
                    <SidebarLink
                      icon={FolderPen}
                      text="Type de pièces"
                      to="/pieces"
                      active={location.pathname.startsWith("/pieces")}
                    />
                  )}
                  {can("documentType", "read") && (
                    <SidebarLink
                      icon={Database}
                      text="DocumentType"
                      to="/dossierType"
                      active={location.pathname.startsWith("/dossierType")}
                    />
                  )}
                  {can("document", "read") && (
                    <SidebarLink
                      icon={FileText}
                      text="Document"
                      to="/document"
                      active={location.pathname.startsWith("/document")}
                    />
                  )}
                </SidebarTree>
              )}

              {/* ================= PARAMETRAGE ================= */}
              {(can("exercice", "read") ||
                can("programme", "read") ||
                can("chapitre", "read") ||
                can("nature", "read") ||
                can("fournisseur", "read") ||
                can("serviceBeneficiaire", "read")) && (
                <SidebarTree label="Archivage" icon={Layers}>
                  {/* {can("exercice", "read") && (
                    <SidebarLink
                      icon={Boxes}
                      text="Exercices"
                      to="/exercices"
                      active={location.pathname.startsWith("/exercices")}
                    />
                  )}
                  {can("programme", "read") && (
                    <SidebarLink
                      icon={Layers}
                      text="Programmes"
                      to="/programmes"
                      active={location.pathname.startsWith("/programmes")}
                    />
                  )}
                  {can("chapitre", "read") && (
                    <SidebarLink
                      icon={ListChecks}
                      text="Chapitres"
                      to="/chapitres"
                      active={location.pathname.startsWith("/chapitres")}
                    />
                  )}
                  {can("nature", "read") && (
                    <SidebarLink
                      icon={FileText}
                      text="Natures"
                      to="/natures"
                      active={location.pathname.startsWith("/natures")}
                    />
                  )}
                  {can("fournisseur", "read") && (
                    <SidebarLink
                      icon={HandCoins}
                      text="Fournisseur"
                      to="/fournisseur"
                      active={location.pathname.startsWith("/fournisseur")}
                    />
                  )}
                  {can("serviceBeneficiaire", "read") && (
                    <SidebarLink
                      icon={PanelTopOpenIcon}
                      text="Services Bénéficiaire"
                      to="/serviceBeneficiaire"
                      active={location.pathname.startsWith(
                        "/serviceBeneficiaire",
                      )}
                    />
                  )}
                  {can("sourceDeFinancement", "read") && (
                    <SidebarLink
                      icon={BanknoteArrowUp}
                      text="Source de financement"
                      to="/sourceDeFinancement"
                      active={location.pathname.startsWith(
                        "/sourceDeFinancement",
                      )}
                    />
                  )} */}
                  {can("pieces", "read") && (
                    <SidebarLink
                      icon={Archive}
                      text="Box"
                      to="/box"
                      active={location.pathname.startsWith("/box")}
                    />
                  )}
                  {can("documentType", "read") && (
                    <SidebarLink
                      icon={WavesLadder}
                      text="Etagère"
                      to="/etagere"
                      active={location.pathname.startsWith("/etagere")}
                    />
                  )}
                  {can("document", "read") && (
                    <SidebarLink
                      icon={Warehouse}
                      text="Salle"
                      to="/salle"
                      active={location.pathname.startsWith("/salle")}
                    />
                  )}
                </SidebarTree>
              )}

              {/* ================= SECURITE ================= */}
              {(can("agent", "read") ||
                can("droit", "read") ||
                can("historique", "read")) && (
                <SidebarTree label="Sécurité" icon={Lock}>
                  {can("agent", "read") && (
                    <SidebarLink
                      icon={UserRound}
                      text="Agent"
                      to="/agents"
                      active={location.pathname.startsWith("/agents")}
                    />
                  )}
                  {can("droit", "read") && (
                    <SidebarLink
                      icon={ShieldCheck}
                      text="Profil"
                      to="/profils"
                      active={location.pathname.startsWith("/profils")}
                    />
                  )}
                  {can("historique", "read") && (
                    <SidebarLink
                      icon={History}
                      text="Historique"
                      to="/historique"
                      active={location.pathname.startsWith("/historique")}
                    />
                  )}
                </SidebarTree>
              )}

              {can("statistique", "read") && (
                <SidebarLink
                  icon={Search}
                  text="Recherche"
                  to="/recherche"
                  active={location.pathname.startsWith("/recherche")}
                />
              )}
            </ul>
          </SidebarContext.Provider>
        </div>

        {/* Footer - Profil Utilisateur */}
        <div className="p-4 bg-emerald-900/40 backdrop-blur-sm border-t border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="relative">
              {user?.photo_profil ? (
                <img
                  src={`http://localhost:5000/uploads/profiles/${user.photo_profil}`}
                  alt="Profil"
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/50 shadow-sm"
                />
              ) : (
                /* ✅ On utilise l'image 'profil' importée dans une balise img */
                <img
                  src={profil}
                  alt="Par défaut"
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/50 shadow-sm"
                />
              )}
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  user?.role === "ADMIN" ? "bg-amber-400" : "bg-emerald-400"
                }`}
              ></div>
            </div>

            <div
              className={`transition-all duration-300 overflow-hidden ${
                expended ? "w-40 opacity-100" : "w-0 opacity-0"
              }`}
            >
              <p className="text-sm font-bold text-white truncate uppercase tracking-wider">
                {user?.prenom} {user?.nom}
              </p>
              <p className="text-xs text-emerald-300 truncate">{user?.email}</p>
            </div>
            {expended && (
              <MoreVertical
                size={18}
                className="text-emerald-400 cursor-pointer hover:text-white"
              />
            )}
          </div>
        </div>
      </nav>
    </aside>
  );
}

function SidebarLink({ icon: Icon, text, to, active }: any) {
  const { expended } = useContext(SidebarContext);

  return (
    <Link
      to={to}
      className="block group"
      onClick={() => sessionStorage.setItem("audit", "true")}
    >
      <li
        className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 relative
        ${
          active
            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/50 scale-[1.02]"
            : "text-emerald-200 hover:bg-emerald-800/60 hover:text-white"
        }`}
      >
        <Icon
          size={22}
          className={`flex-shrink-0 ${
            active
              ? "text-white"
              : "text-emerald-400 group-hover:text-emerald-200"
          }`}
        />

        <span
          className={`whitespace-nowrap transition-all duration-300 font-medium ${
            expended ? "opacity-100 w-auto" : "opacity-0 w-0"
          }`}
        >
          {text}
        </span>

        {!expended && (
          <div className="absolute left-full rounded-md px-3 py-1.5 ml-6 bg-emerald-700 text-white text-sm invisible opacity-0 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 z-50 shadow-xl border border-emerald-500">
            {text}
          </div>
        )}
      </li>
    </Link>
  );
}

function SidebarTree({ label, icon: Icon, children }: any) {
  const { expended, treeOpen, toggleTree } = useContext(SidebarContext);
  const open = treeOpen[label] || false;

  return (
    <li className="list-none">
      <button
        onClick={() => toggleTree(label)}
        className={`flex items-center w-full px-3 py-3 rounded-xl transition-all duration-200 text-emerald-200 hover:bg-emerald-800/40
          ${!expended && "justify-center"}
        `}
      >
        <Icon size={22} className="flex-shrink-0 text-emerald-400" />
        {expended && (
          <>
            <span className="ml-3 font-medium">{label}</span>
            <span
              className={`ml-auto transition-transform duration-300 ${
                open ? "rotate-180 text-white" : "text-emerald-600"
              }`}
            >
              <ChevronDown size={16} />
            </span>
          </>
        )}
      </button>

      {open && expended && (
        <ul className="ml-6 mt-1 space-y-1 border-l border-emerald-800/50 pl-2 animate-in fade-in slide-in-from-left-2 duration-300">
          {children}
        </ul>
      )}
    </li>
  );
}
