// import { useEffect, useRef, useState } from "react";
// import Layout from "../../../components/layout/Layoutt";
// import EntiteeUnDetails from "./EntiteeUnDetails";
// import EntiteeUnForm from "./EntiteeUnForm";
// import EntiteeUnAjoutFonction from "./EntiteeUnAjoutFonction";
// import { EntiteeUn } from "../../../interfaces";
// import { confirmDialog } from "primereact/confirmdialog";

// import {
//   getAllEntiteeUn,
//   createEntiteeUn,
//   updateEntiteeUnById,
//   deleteEntiteeUnById,
// } from "../../../api/entiteeUn";
// import { Toast } from "primereact/toast";
// import { Button } from "primereact/button";
// import Pagination from "../../../components/layout/Pagination";
// import { InputText } from "primereact/inputtext";
// import {
//   Briefcase,
//   Plus,
//   Search,
//   Eye,
//   Pencil,
//   Trash2,
//   PlusCircle,
// } from "lucide-react";
// import { log } from "console";

// export default function EntiteeUnPage() {
//   const [allEntiteeUn, setAllEntiteeUn] = useState<EntiteeUn[]>([]);
//   const [selected, setSelected] = useState<EntiteeUn | null>(null);
//   const [formVisible, setFormVisible] = useState(false);
//   const [detailsVisible, setDetailsVisible] = useState(false);
//   const [ajoutFonctionVisible, setAjoutFonctionVisible] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [editing, setEditing] = useState<Partial<EntiteeUn> | null>(null);
//   const toast = useRef<Toast>(null);
//   const [query, setQuery] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 8;

//   const fetchEntiteeUn = async () => {
//     setLoading(true);
//     try {
//       const data = await getAllEntiteeUn();
//       setAllEntiteeUn(Array.isArray(data) ? data : data.entiteeUn || []);
//     } catch (err: any) {
//       toast.current?.show({
//         severity: "error",
//         summary: "Erreur",
//         detail: "Impossible de charger",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchEntiteeUn();
//   }, []);

//   const onEdit = async (payload: Partial<EntiteeUn>) => {
//     if (!editing?.id) return;
//     try {
//       const updated = await updateEntiteeUnById(editing.id, payload);
//       setAllEntiteeUn((s) =>
//         s.map((it) => (it.id === updated.id ? updated : it)),
//       );
//       console.log(updated);

//       toast.current?.show({
//         severity: "success",
//         summary: "Mis à jour",
//         detail: "Programme modifié",
//       });
//       setEditing(null);
//       setFormVisible(false);
//     } catch (err: any) {
//       toast.current?.show({
//         severity: "error",
//         summary: "Erreur",
//         detail: "Échec de mise à jour",
//       });
//     }
//   };

//   const handleDelete = async (id: string) => {
//     confirmDialog({
//       message: `Voulez-vous supprimer ${allEntiteeUn[0]?.titre} définitivement cet élément ? Cette action est irréversible.`,
//       header: "Confirmation",
//       icon: "pi pi-info-circle", // Icône plus neutre, ou gardez pi-exclamation-triangle

//       // --- Personnalisation des labels ---
//       acceptLabel: "Supprimer",
//       rejectLabel: "Annuler",

//       // --- Styling des boutons ---
//       // Ajout de classes de mise en page (flexbox) et de style
//       acceptClassName: "p-button-danger p-button-raised p-button-rounded p-2",
//       rejectClassName:
//         "p-button-secondary p-button-outlined p-button-rounded mr-4 p-2",

//       // --- Style du dialogue lui-même (optionnel) ---
//       style: { width: "450px" },
//       accept: async () => {
//         try {
//           await deleteEntiteeUnById(id);
//           setAllEntiteeUn((s) => s.filter((x) => Number(x.id) !== Number(id)));
//           toast.current?.show({
//             severity: "success",
//             summary: "Supprimé",
//             detail: " supprimé",
//           });
//         } catch (err: any) {
//           toast.current?.show({
//             severity: "error",
//             summary: "Erreur",
//             detail: "Suppression impossible",
//           });
//         }
//       },
//     });
//   };

//   const onCreate = async (payload: Partial<EntiteeUn>) => {
//     console.log("Création avec payload:", payload); // <-- Log avant l'appel API
//     try {
//       const data = await createEntiteeUn(payload);
//       console.log("Réponse API:", data);
//       setAllEntiteeUn((s) => [data, ...s]);
//       toast.current?.show({
//         severity: "success",
//         summary: "Succès",
//         detail: "Créé avec succès",
//       });
//       console.log("data envoyer: ", data);
//       fetchEntiteeUn();

//       //setFormVisible(false);
//     } catch (err: any) {
//       console.error("Erreur complète:", err);
//       toast.current?.show({
//         severity: "error",
//         summary: "Erreur",
//         detail: "Opération échouée",
//       });
//     }
//   };

//   // Filtrage :
//   // 1. On exclut les éléments où le code ET le libellé sont absents (null ou vide)
//   // 2. On applique la recherche sur le libellé
//   const filtered = allEntiteeUn.filter((s) => {
//     // Vérifie si l'élément est valide (a au moins un code ou un libellé)
//     const isPopulated = s.code !== null && s.libelle !== null;

//     if (!isPopulated) return false;

//     // Applique la recherche textuelle
//     return (s.libelle || "").toLowerCase().includes(query.toLowerCase());
//   });

//   const paginated = filtered.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage,
//   );

//   return (
//     <Layout>
//       <Toast ref={toast} />

//       {/* Header */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
//         <div className="flex items-center gap-4">
//           <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-lg shadow-emerald-100">
//             <Briefcase size={28} />
//           </div>
//           <div>
//             <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
//               {allEntiteeUn[0]?.titre || "Chargement..."}
//             </h1>
//             <p className="text-slate-500 font-medium">
//               Gestion des {allEntiteeUn[0]?.titre.toLowerCase()}s
//             </p>
//           </div>
//         </div>
//         <Button
//           label={`Nouveau ${allEntiteeUn[0]?.titre || "Élément"}`}
//           icon={<Plus size={20} className="mr-2" />}
//           className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-6 py-3 rounded-xl shadow-lg transition-all"
//           onClick={() => setFormVisible(true)}
//         />
//       </div>

//       {/* Search */}
//       <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
//         <div className="relative group max-w-md">
//           <Search
//             className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
//             size={20}
//           />
//           <InputText
//             className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 outline-none"
//             placeholder="Rechercher ..."
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//           />
//         </div>
//       </div>

//       {/* Table */}
//       <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
//         <table className="w-full text-left border-collapse">
//           <thead>
//             <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-widest">
//               <th className="px-6 py-4">Code</th>
//               <th className="px-6 py-4">Libellé</th>
//               <th className="px-6 py-4 text-center">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-slate-50">
//             {paginated.map((s) => (
//               <tr
//                 key={s.id}
//                 onClick={() => {
//                   setSelected(s);
//                   setDetailsVisible(true);
//                 }}
//                 className="hover:bg-emerald-50/30 transition-all group cursor-pointer"
//               >
//                 <td className="px-6 py-4">
//                   <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono text-xs">
//                     {s.code}
//                   </span>
//                 </td>
//                 <td className="px-6 py-4 font-bold text-slate-700">
//                   {s.libelle}
//                 </td>
//                 <td className="px-6 py-4">
//                   <div className="flex items-center justify-center gap-2">
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         setSelected(s);
//                         setAjoutFonctionVisible(true);
//                       }}
//                       className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
//                       title="Ajouter une fonction"
//                     >
//                       <PlusCircle size={18} />
//                     </button>
// <button
//   onClick={() => {
//     setSelected(s);
//     setDetailsVisible(true);
//   }}
//   className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
// >
//   <Eye size={18} />
// </button>
//                     <button
//                       onClick={(e) => {
//                         setEditing(s);
//                         setFormVisible(true);
//                         e.stopPropagation();
//                       }}
//                       className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
//                     >
//                       <Pencil size={18} />
//                     </button>
//                     <button
//                       onClick={(e) => {
//                         handleDelete(String(s.id)!);
//                         e.stopPropagation();
//                       }}
//                       className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
//                     >
//                       <Trash2 size={18} />
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//         {loading && (
//           <div className="p-12 text-center text-slate-400">Chargement...</div>
//         )}
//       </div>

//       <div className="mt-6 flex justify-center">
//         <Pagination
//           currentPage={currentPage}
//           itemsPerPage={itemsPerPage}
//           totalItems={filtered.length}
//           onPageChange={setCurrentPage}
//         />
//       </div>
//       <EntiteeUnForm
//         visible={formVisible}
//         onHide={() => setFormVisible(false)}
//         onSubmit={editing ? onEdit : onCreate}
//         initial={editing || undefined}
//       />
//       <EntiteeUnDetails
//         visible={detailsVisible}
//         onHide={() => setDetailsVisible(false)}
//         entiteeUn={selected}
//       />
//       <EntiteeUnAjoutFonction
//         visible={ajoutFonctionVisible}
//         onHide={() => setAjoutFonctionVisible(false)}
//         entiteeUn={selected}
//         onSuccess={() => {
//           toast.current?.show({
//             severity: "success",
//             summary: "Succès",
//             detail: "Fonction ajoutée",
//           });
//         }}
//       />
//     </Layout>
//   );
// }

import { useEffect, useRef, useState } from "react";
import Layout from "../../../components/layout/Layoutt";
import EntiteeUnDetails from "./EntiteeUnDetails";
import EntiteeUnForm from "./EntiteeUnForm";
import EntiteeUnAjoutFonction from "./EntiteeUnAjoutFonction";
import {
  EntiteeUn,
  EntiteeDeux,
  EntiteeTrois,
  Fonction,
} from "../../../interfaces";
import { confirmDialog } from "primereact/confirmdialog";

import {
  getAllEntiteeUn,
  createEntiteeUn,
  updateEntiteeUnById,
  deleteEntiteeUnById,
  getFunctionsByEntiteeUn,
} from "../../../api/entiteeUn";
import { getEntiteeDeuxByEntiteeUn } from "../../../api/entiteeDeux";
import { getEntiteeTroisByEntiteeDeux } from "../../../api/entiteeTrois";
import { deleteFonctionById } from "../../../api/fonction";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import Pagination from "../../../components/layout/Pagination";
import { InputText } from "primereact/inputtext";
import {
  Briefcase,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  PlusCircle,
  ChevronDown,
  ChevronRight,
  Layers,
  GitMerge,
  Bookmark,
} from "lucide-react";

export default function EntiteeUnPage() {
  const [allEntiteeUn, setAllEntiteeUn] = useState<EntiteeUn[]>([]);
  const [selected, setSelected] = useState<EntiteeUn | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [ajoutFonctionVisible, setAjoutFonctionVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Partial<EntiteeUn> | null>(null);
  const toast = useRef<Toast>(null);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // États pour les accordéons
  const [expandedEntitee, setExpandedEntitee] = useState<number | null>(null);
  const [entiteeDeux, setEntiteeDeux] = useState<Record<number, EntiteeDeux[]>>(
    {},
  );
  const [entiteeTroisMap, setEntiteeTroisMap] = useState<
    Record<number, EntiteeTrois[]>
  >({});
  const [expandedEntiteeDeux, setExpandedEntiteeDeux] = useState<number | null>(
    null,
  );

  const fetchEntiteeUn = async () => {
    setLoading(true);
    try {
      const data = await getAllEntiteeUn();
      setAllEntiteeUn(Array.isArray(data) ? data : data.entiteeUn || []);
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Impossible de charger",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntiteeUn();
  }, []);

  // Charger les divisions d'un entiteeUn quand on l'ouvre
  const loadEntiteeDetails = async (entiteeId: number) => {
    try {
      // Charger uniquement les divisions (pas les fonctions)
      const divData = await getEntiteeDeuxByEntiteeUn(entiteeId);
      setEntiteeDeux((prev) => ({
        ...prev,
        [entiteeId]: Array.isArray(divData) ? divData : [],
      }));
    } catch (err) {
      console.error("Erreur chargement détails entiteeUn", err);
    }
  };

  const toggleEntitee = async (entitee: EntiteeUn) => {
    if (expandedEntitee === entitee.id) {
      setExpandedEntitee(null);
      setExpandedEntiteeDeux(null);
    } else {
      setExpandedEntitee(entitee.id);
      await loadEntiteeDetails(entitee.id);
    }
  };

  const toggleEntiteeDeux = async (
    entiteeId: number,
    entiteeDeuxId: number,
  ) => {
    if (expandedEntiteeDeux === entiteeDeuxId) {
      setExpandedEntiteeDeux(null);
      return;
    }

    setExpandedEntiteeDeux(entiteeDeuxId);

    if (!entiteeTroisMap[entiteeDeuxId]) {
      try {
        const data = await getEntiteeTroisByEntiteeDeux(entiteeDeuxId);
        setEntiteeTroisMap((prev) => ({
          ...prev,
          [entiteeDeuxId]: Array.isArray(data) ? data : [],
        }));
      } catch (err) {
        console.error("Erreur chargement sections", err);
      }
    }
  };

  const onEdit = async (payload: Partial<EntiteeUn>) => {
    if (!editing?.id) return;
    try {
      const updated = await updateEntiteeUnById(editing.id, payload);
      setAllEntiteeUn((s) =>
        s.map((it) => (it.id === updated.id ? updated : it)),
      );
      toast.current?.show({
        severity: "success",
        summary: "Mis à jour",
        detail: "Programme modifié",
      });
      setEditing(null);
      setFormVisible(false);
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Échec de mise à jour",
      });
    }
  };

  const handleDeleteEntitee = async (id: string) => {
    confirmDialog({
      message: `Voulez-vous supprimer cet élément définitivement ? Cette action est irréversible.`,
      header: "Confirmation",
      icon: "pi pi-info-circle",
      acceptLabel: "Supprimer",
      rejectLabel: "Annuler",
      acceptClassName: "p-button-danger p-button-raised p-button-rounded p-2",
      rejectClassName:
        "p-button-secondary p-button-outlined p-button-rounded mr-4 p-2",
      style: { width: "450px" },
      accept: async () => {
        try {
          await deleteEntiteeUnById(id);
          setAllEntiteeUn((s) => s.filter((x) => Number(x.id) !== Number(id)));
          toast.current?.show({
            severity: "success",
            summary: "Supprimé",
            detail: "Élément supprimé",
          });
        } catch (err: any) {
          toast.current?.show({
            severity: "error",
            summary: "Erreur",
            detail: "Suppression impossible",
          });
        }
      },
    });
  };

  const onCreate = async (payload: Partial<EntiteeUn>) => {
    try {
      const data = await createEntiteeUn(payload);
      setAllEntiteeUn((s) => [data, ...s]);
      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Créé avec succès",
      });
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Opération échouée",
      });
    }
  };

  const filtered = allEntiteeUn.filter((s) => {
    const isPopulated = s.code !== null && s.libelle !== null;
    if (!isPopulated) return false;
    return (s.libelle || "").toLowerCase().includes(query.toLowerCase());
  });

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <Layout>
      <Toast ref={toast} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-lg shadow-emerald-100">
            <Briefcase size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              {allEntiteeUn[0]?.titre || "Chargement..."}
            </h1>
            <p className="text-slate-500 font-medium">
              Gestion des {allEntiteeUn[0]?.titre.toLowerCase()}s
            </p>
          </div>
        </div>
        <Button
          label={`Nouveau ${allEntiteeUn[0]?.titre || "Élément"}`}
          icon={<Plus size={20} className="mr-2" />}
          className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-6 py-3 rounded-xl shadow-lg transition-all"
          onClick={() => setFormVisible(true)}
        />
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <div className="relative group max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
            size={20}
          />
          <InputText
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 outline-none"
            placeholder="Rechercher ..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ACCORDÉON LIST */}
      <div className="space-y-4">
        {paginated.length > 0 ? (
          paginated.map((entitee) => {
            const isExpanded = expandedEntitee === entitee.id;
            const entiteeDivisions = entiteeDeux[entitee.id] || [];

            return (
              <div
                key={entitee.id}
                className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${
                  isExpanded
                    ? "border-emerald-500 ring-2 ring-emerald-200"
                    : "border-slate-100"
                }`}
              >
                {/* HEADER DE L'ENTITEE (clic pour déplier) */}
                <div
                  onClick={() => toggleEntitee(entitee)}
                  className={`w-full flex items-center justify-between p-5 transition-all cursor-pointer ${
                    isExpanded ? "bg-emerald-50/50" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-lg ${
                        isExpanded
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <Bookmark size={20} />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`font-bold ${
                            isExpanded ? "text-emerald-800" : "text-slate-700"
                          }`}
                        >
                          {entitee.libelle}
                        </h3>
                        {entitee.code && (
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-mono">
                            {entitee.code}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        {entiteeDivisions.length} division(s)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* ✅ BOUTON EYE ACTIF - Ouvre les détails */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(entitee);
                        setDetailsVisible(true);
                      }}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                      title="Voir les détails complets"
                    >
                      <Eye size={18} />
                    </button>

                    {/* ✅ BOUTON AJOUTER FONCTION - Dans l'accordéon */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(entitee);
                        setAjoutFonctionVisible(true);
                      }}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                      title="Ajouter une fonction"
                    >
                      <PlusCircle size={18} />
                    </button>

                    {/* BOUTON MODIFIER */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditing(entitee);
                        setFormVisible(true);
                      }}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                      title="Modifier"
                    >
                      <Pencil size={18} />
                    </button>

                    {/* BOUTON SUPPRIMER */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEntitee(String(entitee.id));
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>

                    {/* FLECHE DÉPLI/REPLI */}
                    {isExpanded ? (
                      <ChevronDown size={20} className="text-emerald-500" />
                    ) : (
                      <ChevronRight size={20} className="text-slate-400" />
                    )}
                  </div>
                </div>

                {/* CONTENU DÉPLIÉ (UNIQUEMENT les Divisions) */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-5 space-y-6 bg-slate-50/30">
                    {/* SECTION DIVISIONS (EntiteeDeux) - PLUS DE FONCTIONS ICI */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <Layers size={14} className="text-emerald-500" />
                        {entitee.titre || "Divisions"} rattachées (
                        {entiteeDivisions.length})
                      </h4>

                      {entiteeDivisions.length > 0 ? (
                        <div className="space-y-2">
                          {entiteeDivisions.map((div) => (
                            <div
                              key={div.id}
                              className="border border-slate-100 rounded-xl overflow-hidden bg-white"
                            >
                              {/* HEADER DIVISION */}
                              <div
                                onClick={() =>
                                  toggleEntiteeDeux(entitee.id, div.id)
                                }
                                className={`w-full flex items-center justify-between p-3 cursor-pointer transition-all ${
                                  expandedEntiteeDeux === div.id
                                    ? "bg-emerald-50/50"
                                    : "hover:bg-slate-50"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`p-1.5 rounded-lg ${
                                      expandedEntiteeDeux === div.id
                                        ? "bg-emerald-500 text-white"
                                        : "bg-slate-100 text-slate-500"
                                    }`}
                                  >
                                    <Layers size={14} />
                                  </div>
                                  <span
                                    className={`text-sm font-bold ${
                                      expandedEntiteeDeux === div.id
                                        ? "text-emerald-700"
                                        : "text-slate-700"
                                    }`}
                                  >
                                    {div.libelle}
                                  </span>
                                  {div.code && (
                                    <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                      {div.code}
                                    </span>
                                  )}
                                </div>
                                {expandedEntiteeDeux === div.id ? (
                                  <ChevronDown
                                    size={16}
                                    className="text-emerald-500"
                                  />
                                ) : (
                                  <ChevronRight
                                    size={16}
                                    className="text-slate-400"
                                  />
                                )}
                              </div>

                              {/* CONTENU DIVISION (EntiteeTrois) */}
                              {expandedEntiteeDeux === div.id && (
                                <div className="p-3 bg-slate-50/30 border-t border-slate-50 space-y-1 ml-8">
                                  {entiteeTroisMap[div.id]?.length ? (
                                    entiteeTroisMap[div.id].map((sec) => (
                                      <div
                                        key={sec.id}
                                        className="flex items-center gap-3 p-2 text-sm text-slate-600 hover:text-emerald-600 transition-colors"
                                      >
                                        <GitMerge
                                          size={14}
                                          className="text-slate-300"
                                        />
                                        <span className="font-medium">
                                          {sec.libelle}
                                        </span>
                                        {sec.code && (
                                          <span className="text-[9px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                            {sec.code}
                                          </span>
                                        )}
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-[11px] text-slate-400 italic py-2">
                                      Aucune section dans cette division
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 bg-white rounded-xl border border-dashed border-slate-200">
                          <p className="text-xs text-slate-400 italic">
                            Aucune division rattachée
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
            <div className="inline-flex p-4 bg-slate-50 rounded-full text-slate-300 mb-4">
              <Search size={40} />
            </div>
            <p className="text-slate-400 font-medium">
              Aucun élément trouvé pour cette sélection.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-center">
        <Pagination
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filtered.length}
          onPageChange={setCurrentPage}
        />
      </div>

      <EntiteeUnForm
        visible={formVisible}
        onHide={() => {
          setFormVisible(false);
          setEditing(null);
        }}
        onSubmit={editing ? onEdit : onCreate}
        initial={editing || undefined}
      />

      <EntiteeUnAjoutFonction
        visible={ajoutFonctionVisible}
        onHide={() => {
          setAjoutFonctionVisible(false);
        }}
        entiteeUn={selected}
        onSuccess={() => {
          toast.current?.show({
            severity: "success",
            summary: "Succès",
            detail: "Fonction ajoutée",
          });
        }}
      />

      <EntiteeUnDetails
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        entiteeUn={selected}
        toast={toast}
      />
    </Layout>
  );
}
