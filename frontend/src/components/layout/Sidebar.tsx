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
  LibraryBig,
  MapPinned,
  FileStack,
} from "lucide-react";

import logo from "../../assets/logoArchi.png";
import profil from "../../assets/homme.jpg";
import { Link, useLocation } from "react-router-dom";
import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { SidebarProps, SidebarContextType } from "../../interfaces/composant";
import { useAuth } from "../../context/AuthContext";
import { getEntiteeUnTitre } from "../../api/entiteeUn";
import { getEntiteeDeuxTitre } from "../../api/entiteeDeux";
import { getEntiteeTroisTitre } from "../../api/entiteeTrois";
import { getTypeDocuments } from "../../api/typeDocument";
import { TypeDocument, User } from "../../interfaces";

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

  const [docTypes, setDocTypes] = useState<TypeDocument[]>([]);

  // Charger les types de documents
  useEffect(() => {
    const fetchDocTypes = async () => {
      try {
        const res = await getTypeDocuments();
        // ✅ Vérification que les IDs sont bien présents
        const types = res.typeDocument || [];
        console.log("📄 Types chargés dans sidebar:", types.length);
        if (types.length > 0) {
          console.log("🔍 Exemple:", {
            nom: types[0].nom,
            entitee_un_id: types[0].entitee_un_id,
            entitee_deux_id: types[0].entitee_deux_id,
            entitee_trois_id: types[0].entitee_trois_id,
          });
        }
        setDocTypes(types);
      } catch (error) {
        console.error("❌ Erreur types documents sidebar:", error);
      }
    };
    fetchDocTypes();
  }, []);

  // ✅ Fonction identique à DocumentTypeEntitee
  const isUserAdmin = (user: User | null): boolean => {
    if (!user) return false;

    const droitLibelle =
      typeof user.droit === "object" ? user.droit?.libelle : user.droit;

    if (!droitLibelle) return false;

    const libelle = droitLibelle.toString().toLowerCase();
    return (
      libelle.includes("admin") ||
      libelle.includes("administrateur") ||
      libelle === "admin" ||
      libelle === "administrateur"
    );
  };

  // ✅ MÊME LOGIQUE QUE DANS DOCUMENTTYPEENTITEE
  // ✅ MÊME LOGIQUE QUE DANS DOCUMENTTYPEENTITEE - VERSION STRICTE
  const hasAccessToDocument = (typeDoc: TypeDocument): boolean => {
    // ADMIN voit tout
    if (isUserAdmin(user)) return true;

    // NON-ADMIN : vérifier les accès STRICTS
    const userEntityIds = {
      un: new Set<number>(),
      deux: new Set<number>(),
      trois: new Set<number>(),
    };

    // Entité de la fonction
    if (user?.fonction_details?.entitee_un?.id) {
      userEntityIds.un.add(user.fonction_details.entitee_un.id);
    }
    if (user?.fonction_details?.entitee_deux?.id) {
      userEntityIds.deux.add(user.fonction_details.entitee_deux.id);
    }
    if (user?.fonction_details?.entitee_trois?.id) {
      userEntityIds.trois.add(user.fonction_details.entitee_trois.id);
    }

    // Entités des agent_access
    user?.agent_access?.forEach((access) => {
      if (access.entitee_un?.id) userEntityIds.un.add(access.entitee_un.id);
      if (access.entitee_deux?.id)
        userEntityIds.deux.add(access.entitee_deux.id);
      if (access.entitee_trois?.id)
        userEntityIds.trois.add(access.entitee_trois.id);
    });

    // 🔴 CORRECTION : VÉRIFICATION STRICTE PAR NIVEAU

    // 1. Si le document est lié à une entitee_trois
    if (typeDoc.entitee_trois_id) {
      // ✅ Seulement si l'utilisateur a ACCÈS DIRECT à CETTE entitee_trois
      return userEntityIds.trois.has(typeDoc.entitee_trois_id);
    }

    // 2. Si le document est lié à une entitee_deux (et PAS à une entitee_trois)
    if (typeDoc.entitee_deux_id && !typeDoc.entitee_trois_id) {
      // ✅ Seulement si l'utilisateur a ACCÈS DIRECT à CETTE entitee_deux
      return userEntityIds.deux.has(typeDoc.entitee_deux_id);
    }

    // 3. Si le document est lié à une entitee_un (et PAS à entitee_deux/trois)
    if (
      typeDoc.entitee_un_id &&
      !typeDoc.entitee_deux_id &&
      !typeDoc.entitee_trois_id
    ) {
      // ✅ Seulement si l'utilisateur a ACCÈS DIRECT à CETTE entitee_un
      return userEntityIds.un.has(typeDoc.entitee_un_id);
    }

    // 4. Document non assigné
    if (
      !typeDoc.entitee_un_id &&
      !typeDoc.entitee_deux_id &&
      !typeDoc.entitee_trois_id
    ) {
      return false; // Seuls les admins voient les non assignés
    }

    return false;
  };

  // ✅ Filtrer les documents accessibles
  const accessibleDocTypes = useMemo(() => {
    const filtered = docTypes.filter((doc) => hasAccessToDocument(doc));
    console.log(
      `📊 Sidebar - ${filtered.length}/${docTypes.length} documents accessibles`,
    );
    return filtered;
  }, [docTypes, user]);

  // ✅ Compter les documents non assignés (pour les admins)
  const unassignedCount = useMemo(() => {
    if (!isUserAdmin(user)) return 0;
    return docTypes.filter(
      (doc) =>
        !doc.entitee_un_id && !doc.entitee_deux_id && !doc.entitee_trois_id,
    ).length;
  }, [docTypes, user]);

  // ✅ TITRES DYNAMIQUES (optionnel, si besoin dans sidebar)
  const [dynamicTitles, setDynamicTitles] = useState({
    titre1: "",
    titre2: "",
    titre3: "",
  });

  useEffect(() => {
    const fetchTitles = async () => {
      try {
        const [t1, t2, t3] = await Promise.all([
          getEntiteeUnTitre(),
          getEntiteeDeuxTitre(),
          getEntiteeTroisTitre(),
        ]);
        setDynamicTitles({
          titre1: t1.titre || "Ministères",
          titre2: t2.titre || "Directions",
          titre3: t3.titre || "Services",
        });
      } catch (error) {
        console.error("❌ Erreur chargement titres sidebar:", error);
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
                    <SidebarTree
                      label="Documents"
                      icon={FileText}
                      badge={
                        <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                          {accessibleDocTypes.length}
                        </span>
                      }
                    >
                      {/* 📄 DOCUMENTS ACCESSIBLES */}
                      {accessibleDocTypes.length > 0
                        ? accessibleDocTypes.map((t) => (
                            <SidebarLink
                              key={t.id}
                              icon={FileStack}
                              text={t.nom}
                              to={`/document?typeId=${t.id}`}
                              active={
                                location.pathname === "/document" &&
                                new URLSearchParams(location.search).get(
                                  "typeId",
                                ) === String(t.id)
                              }
                              // ✅ Indicateur visuel du niveau
                              suffix={
                                t.entitee_un_id ? (
                                  <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full ml-2">
                                    N1
                                  </span>
                                ) : t.entitee_deux_id ? (
                                  <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full ml-2">
                                    N2
                                  </span>
                                ) : t.entitee_trois_id ? (
                                  <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full ml-2">
                                    N3
                                  </span>
                                ) : null
                              }
                            />
                          ))
                        : // ✅ Message si aucun document accessible
                          !isUserAdmin(user) && (
                            <div className="px-4 py-3 text-xs text-slate-400 italic bg-slate-50/50 rounded-lg mx-2 my-1">
                              Aucun document accessible
                            </div>
                          )}

                      {/* ✅ Message pour les admins sans aucun document */}
                      {isUserAdmin(user) && docTypes.length === 0 && (
                        <div className="px-4 py-3 text-xs text-slate-400 italic bg-slate-50/50 rounded-lg mx-2 my-1">
                          Aucun document dans la base
                        </div>
                      )}
                    </SidebarTree>
                  )}
                </SidebarTree>
              )}

              {/* ================= PARAMETRAGE ================= */}
              {(can("box", "read") ||
                can("trave", "read") ||
                can("rayon", "read") ||
                can("salle", "read") ||
                can("site", "read")) && (
                <SidebarTree label="Archivage" icon={Layers}>
                  {can("box", "read") && (
                    <SidebarLink
                      icon={Archive}
                      text="Box"
                      to="/box"
                      active={location.pathname.startsWith("/box")}
                    />
                  )}
                  {can("trave", "read") && (
                    <SidebarLink
                      icon={LibraryBig}
                      text="Travé"
                      to="/trave"
                      active={location.pathname.startsWith("/trave")}
                    />
                  )}
                  {can("rayon", "read") && (
                    <SidebarLink
                      icon={WavesLadder}
                      text="Rayon"
                      to="/rayon"
                      active={location.pathname.startsWith("/rayon")}
                    />
                  )}
                  {can("salle", "read") && (
                    <SidebarLink
                      icon={Warehouse}
                      text="Salle"
                      to="/salle"
                      active={location.pathname.startsWith("/salle")}
                    />
                  )}

                  {can("site", "read") && (
                    <SidebarLink
                      icon={MapPinned}
                      text="Site"
                      to="/site"
                      active={location.pathname.startsWith("/site")}
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
