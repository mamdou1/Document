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
  BanknoteArrowUp,
} from "lucide-react";

import logo from "../../assets/logoArchi.png";
import profil from "../../assets/homme.jpg";
import { Link, useLocation } from "react-router-dom";
import { createContext, useContext, useState } from "react";
import { SidebarProps, SidebarContextType } from "../../interfaces/composant";
import { useAuth } from "../../context/AuthContext";

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

              {can("liquidation", "read") && (
                <SidebarLink
                  icon={CircleDollarSign}
                  text="Liquidations"
                  to="/liquidations"
                  active={location.pathname.startsWith("/liquidations")}
                />
              )}

              {/* ================= PARAMETRAGE ================= */}
              {(can("exercice", "read") ||
                can("programme", "read") ||
                can("chapitre", "read") ||
                can("nature", "read") ||
                can("fournisseur", "read") ||
                can("serviceBeneficiaire", "read")) && (
                <SidebarTree label="Paramétrage" icon={Layers}>
                  {can("exercice", "read") && (
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
                  )}
                </SidebarTree>
              )}

              {/* ================= GESTION ================= */}
              {(can("type", "read") ||
                can("pieces", "read") ||
                can("documentType", "read") ||
                can("document", "read")) && (
                <SidebarTree label="Gestion" icon={FolderPen}>
                  {can("type", "read") && (
                    <SidebarLink
                      icon={ArrowBigDown}
                      text="Type de dossier"
                      to="/type"
                      active={location.pathname.startsWith("/type")}
                    />
                  )}
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

              {/* ================= ORGANIGRAMME ================= */}
              {(can("service", "read") ||
                can("division", "read") ||
                can("section", "read")) && (
                <SidebarTree label="Organigrame" icon={GitFork}>
                  {can("service", "read") && (
                    <SidebarLink
                      icon={Landmark}
                      text="Service"
                      to="/service"
                      active={location.pathname.startsWith("/service")}
                    />
                  )}
                  {can("division", "read") && (
                    <SidebarLink
                      icon={Split}
                      text="Division"
                      to="/division"
                      active={location.pathname.startsWith("/division")}
                    />
                  )}
                  {can("section", "read") && (
                    <SidebarLink
                      icon={TableOfContents}
                      text="Section"
                      to="/section"
                      active={location.pathname.startsWith("/section")}
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
            <img
              src={profil}
              className="w-10 h-10 rounded-lg object-cover border-2 border-emerald-600 shadow-md"
              alt="profile"
            />

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
