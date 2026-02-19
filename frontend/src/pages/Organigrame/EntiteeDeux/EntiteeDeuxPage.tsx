import { useEffect, useRef, useState } from "react";
import Layout from "../../../components/layout/Layoutt";
import EntiteeDeuxDetails from "./EntiteeDeuxDetails";
import EntiteeDeuxForm from "./EntiteeDeuxForm";
import EntiteeDeuxAjoutFonction from "./EntiteeDeuxAjoutFonction";
import { EntiteeDeux, EntiteeUn, EntiteeTrois } from "../../../interfaces";
import { confirmDialog } from "primereact/confirmdialog";
import {
  getAllEntiteeDeux,
  createEntiteeDeux,
  updateEntiteeDeuxById,
  deleteEntiteeDeuxById,
} from "../../../api/entiteeDeux";
import { getAllEntiteeUn } from "../../../api/entiteeUn";
import {
  createEntiteeTrois,
  getEntiteeTroisByEntiteeDeux,
  updateEntiteeTroisById,
} from "../../../api/entiteeTrois";
import { getFunctionsByEntiteeDeux } from "../../../api/entiteeDeux";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import Pagination from "../../../components/layout/Pagination";
import { InputText } from "primereact/inputtext";
import {
  Layers,
  Plus,
  Search,
  Eye,
  Pencil,
  PlusCircle,
  Building2,
  Trash2,
  ChevronDown,
  ChevronRight,
  GitMerge,
  Briefcase,
  Calendar,
} from "lucide-react";
import EntiteeTroisForm from "../EntiteeTrois/EntiteeTroisForm";
import EntiteeTroisAjoutFonction from "../EntiteeTrois/EntiteeTroisAjoutFonction";

export default function EntiteeDeuxPage() {
  const [allEntiteeTrois, setAllEntiteeTrois] = useState<EntiteeTrois[]>([]);
  const [allEntiteeDeux, setAllEntiteeDeux] = useState<EntiteeDeux[]>([]);
  const [allEntiteeUn, setAllEntiteeUn] = useState<EntiteeUn[]>([]);
  const [selected, setSelected] = useState<EntiteeDeux | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [ajoutFonctionVisible, setAjoutFonctionVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Partial<EntiteeDeux> | null>(null);
  const toast = useRef<Toast>(null);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // États pour les accordéons
  const [expandedEntitee, setExpandedEntitee] = useState<number | null>(null);
  const [entiteeTrois, setEntiteeTrois] = useState<
    Record<number, EntiteeTrois[]>
  >({});
  const [fonctions, setFonctions] = useState<Record<number, any[]>>({});
  const [expandedSections, setExpandedSections] = useState<
    Record<number, boolean>
  >({});
  const [ajoutFonctionTroisVisible, setAjoutFonctionTroisVisible] =
    useState(false);
  const [formTroisVisible, setFormTroisVisible] = useState(false);
  const [editingTrois, setEditingTrois] =
    useState<Partial<EntiteeTrois> | null>(null);
  const [selectedEntiteeTrois, setSelectedEntiteeTrois] =
    useState<EntiteeTrois | null>(null);
  const [isEditingTrois, setIsEditingTrois] = useState(false);

  const fetchEntiteeDeux = async () => {
    setLoading(true);
    try {
      const [div, serv] = await Promise.all([
        getAllEntiteeDeux(),
        getAllEntiteeUn(),
      ]);
      setAllEntiteeDeux(Array.isArray(div) ? div : []);
      setAllEntiteeUn(Array.isArray(serv) ? serv : []);
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Chargement échoué",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntiteeDeux();
  }, []);

  // Charger les détails d'une entiteeDeux quand on l'ouvre
  const loadEntiteeDetails = async (entiteeId: number) => {
    try {
      // Charger les sections (EntiteeTrois)
      const secData = await getEntiteeTroisByEntiteeDeux(entiteeId);
      setEntiteeTrois((prev) => ({
        ...prev,
        [entiteeId]: Array.isArray(secData) ? secData : [],
      }));

      // Charger les fonctions
      const funcData = await getFunctionsByEntiteeDeux(entiteeId);
      setFonctions((prev) => ({
        ...prev,
        [entiteeId]: funcData || [],
      }));
    } catch (err) {
      console.error("Erreur chargement détails entiteeDeux", err);
    }
  };

  const toggleEntitee = async (entitee: EntiteeDeux) => {
    if (expandedEntitee === entitee.id) {
      setExpandedEntitee(null);
      setExpandedSections({});
    } else {
      setExpandedEntitee(entitee.id);
      setSelected(entitee);
      await loadEntiteeDetails(entitee.id);
    }
  };

  const toggleSection = (sectionId: number) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const onEdit = async (payload: Partial<EntiteeDeux>) => {
    if (!editing?.id) return;
    try {
      const updated = await updateEntiteeDeuxById(editing.id, payload);
      setAllEntiteeDeux((s) =>
        s.map((it) => (it.id === updated.id ? updated : it)),
      );
      toast.current?.show({
        severity: "success",
        summary: "Mis à jour",
        detail: "Élément modifié",
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
          await deleteEntiteeDeuxById(id);
          setAllEntiteeDeux((s) =>
            s.filter((x) => Number(x.id) !== Number(id)),
          );
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

  const onCreate = async (payload: Partial<EntiteeDeux>) => {
    try {
      const saved = await createEntiteeDeux(payload);
      setAllEntiteeDeux((s) => [saved, ...s]);
      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Élément créé",
      });
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Échec de création",
      });
    }
  };

  const onCreateTrois = async (payload: Partial<EntiteeTrois>) => {
    try {
      const saved = await createEntiteeTrois(payload);
      setAllEntiteeTrois((s) => [saved, ...s]);
      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: `${allEntiteeTrois[0]?.titre} créé`,
      });
      //setFormVisible(false);
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Échec de création",
      });
    }
  };

  const onEditTrois = async (payload: Partial<EntiteeTrois>) => {
    if (!editingTrois?.id) return;
    try {
      const updated = await updateEntiteeTroisById(editingTrois.id, payload);
      setAllEntiteeTrois((s) =>
        s.map((it) => (it.id === updated.id ? updated : it)),
      );
      toast.current?.show({
        severity: "success",
        summary: "Mis à jour",
        detail: "Programme modifié",
      });
      setEditingTrois(null);
      setFormTroisVisible(false);
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Échec de mise à jour",
      });
    }
  };

  const filtered = allEntiteeDeux.filter((s) => {
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
          <div className="bg-emerald-800 p-3 rounded-2xl text-white shadow-lg shadow-emerald-100">
            <Layers size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              {allEntiteeDeux[0]?.titre || "Chargement..."}
            </h1>
            <p className="text-slate-500 font-medium">
              Gestion des {allEntiteeDeux[0]?.titre?.toLowerCase()}s
            </p>
          </div>
        </div>
        <Button
          label={`Nouveau ${allEntiteeDeux[0]?.titre || "Élément"}`}
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
            const parentUn = allEntiteeUn.find(
              (un) => un.id === entitee.entitee_un_id,
            );
            const entiteeSections = entiteeTrois[entitee.id] || [];
            const entiteeFonctions = fonctions[entitee.id] || [];

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
                  <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
                    <div
                      className={`p-2 rounded-lg flex-shrink-0 ${
                        isExpanded
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <Layers size={20} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={`text-base font-bold truncate ${
                            isExpanded ? "text-emerald-800" : "text-slate-700"
                          }`}
                          title={entitee.libelle}
                        >
                          {entitee.libelle}
                        </h3>
                        {entitee.code && (
                          <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-mono flex-shrink-0">
                            {entitee.code}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <Building2 size={12} />
                        <span className="truncate">
                          {parentUn?.libelle || "Non rattaché"}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span>{entiteeSections.length} section(s)</span>
                        <span className="text-slate-300">•</span>
                        <span>{entiteeFonctions.length} fonction(s)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* BOUTON EYE - Ouvre les détails */}
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

                    {/* BOUTON AJOUTER FONCTION */}
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
                      <ChevronDown
                        size={20}
                        className="text-emerald-500 ml-1"
                      />
                    ) : (
                      <ChevronRight size={20} className="text-slate-400 ml-1" />
                    )}
                  </div>
                </div>

                {/* CONTENU DÉPLIÉ (Sections et Fonctions) */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-5 space-y-6 bg-slate-50/30">
                    {/* SECTION SECTIONS (EntiteeTrois) */}
                    <div className=" space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                          <GitMerge size={14} className="text-emerald-500" />
                          Sections rattachées ({entiteeSections.length})
                        </h4>
                        {/* Bouton Nouvelle section */}
                        <Button
                          onClick={(e) => {
                            setEditingTrois({ entitee_deux_id: entitee.id });
                            setIsEditingTrois(false);
                            setFormTroisVisible(true);
                            e.stopPropagation();
                          }}
                          className="flex items-center gap-2 px-4 py-2.5 text-orange-600 font-bold bg-orange-50 hover:bg-orange-600 hover:text-white rounded-xl transition-all border-none shadow-sm hover:shadow-md"
                          tooltip={`Ajouter une nouvelle ${entitee.titre || "section"}`}
                          tooltipOptions={{ position: "top" }}
                        >
                          <PlusCircle size={16} />
                          <span className="text-xs hidden sm:inline">
                            Nouveau
                          </span>
                        </Button>
                      </div>
                      {entiteeSections.length > 0 ? (
                        <div className="space-y-2">
                          {entiteeSections.map((section) => (
                            <div
                              key={section.id}
                              className="border border-slate-100 rounded-xl overflow-hidden bg-white"
                            >
                              {/* HEADER SECTION */}
                              <div
                                onClick={() => toggleSection(section.id)}
                                className={`w-full flex items-center p-4 cursor-pointer transition-all ${
                                  expandedSections[section.id]
                                    ? "bg-emerald-50/50"
                                    : "hover:bg-slate-50"
                                }`}
                              >
                                <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
                                  <div
                                    className={`p-2 rounded-lg flex-shrink-0 ${
                                      expandedSections[section.id]
                                        ? "bg-emerald-500 text-white"
                                        : "bg-slate-100 text-slate-500"
                                    }`}
                                  >
                                    <GitMerge size={16} />
                                  </div>
                                  <div className="flex flex-col min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span
                                        className={`text-sm font-bold truncate ${
                                          expandedSections[section.id]
                                            ? "text-emerald-700"
                                            : "text-slate-700"
                                        }`}
                                        title={section.libelle}
                                      >
                                        {section.libelle}
                                      </span>
                                      {section.code && (
                                        <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded flex-shrink-0">
                                          {section.code}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1">
                                      {entitee.titre} • {entitee.libelle}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 flex-shrink-0">
                                  {/* Bouton Ajouter fonction */}
                                  <Button
                                    onClick={(e) => {
                                      // Ici on passe l'entité parente, pas la division
                                      setIsEditingTrois(true);
                                      setEditingTrois(section); // ou un état spécifique pour la création
                                      setFormTroisVisible(true);
                                      e.stopPropagation();
                                    }}
                                    className="flex items-center gap-2 p-2 text-blue-600 font-bold bg-blue-50 hover:bg-blue-600 hover:text-white rounded-full transition-all border-none shadow-sm hover:shadow-md"
                                    tooltip={`Modifier cet(te) ${entitee.titre || "division"}`}
                                    tooltipOptions={{ position: "top" }}
                                  >
                                    <Pencil size={16} />
                                  </Button>
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setAjoutFonctionTroisVisible(true);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2.5 text-emerald-600 font-bold bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-xl transition-all border-none shadow-sm hover:shadow-md min-w-[120px] justify-center"
                                    tooltip="Ajouter une fonction"
                                  >
                                    <PlusCircle size={16} />
                                    <span className="text-xs hidden sm:inline">
                                      Fonction
                                    </span>
                                  </Button>

                                  {/* Flèche d'expansion */}
                                  {expandedSections[section.id] ? (
                                    <ChevronDown
                                      size={18}
                                      className="text-emerald-500 ml-1"
                                    />
                                  ) : (
                                    <ChevronRight
                                      size={18}
                                      className="text-slate-400 ml-1"
                                    />
                                  )}
                                </div>
                              </div>

                              {/* CONTENU SECTION (Fonctions) */}
                              {expandedSections[section.id] && (
                                <div className="border-t border-slate-100 p-4 bg-slate-50/30 ml-12">
                                  {fonctions[entitee.id]
                                    ?.filter(
                                      (f) => f.entitee_trois_id === section.id,
                                    )
                                    .map((f, idx) => (
                                      <div
                                        key={f.id}
                                        className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 hover:border-emerald-200 transition-all mb-2 last:mb-0"
                                      >
                                        <div className="flex items-center gap-3">
                                          <Briefcase
                                            size={14}
                                            className="text-slate-400"
                                          />
                                          <span className="text-sm font-medium text-slate-600">
                                            {f.libelle}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <span className="text-xs text-slate-400">
                                            {f.createdAt
                                              ? new Date(
                                                  f.createdAt,
                                                ).toLocaleDateString()
                                              : ""}
                                          </span>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              // handleDeleteFonction(f.id);
                                            }}
                                            className="text-red-400 hover:text-red-600 transition-colors"
                                          >
                                            <Trash2 size={14} />
                                          </button>
                                        </div>
                                      </div>
                                    ))}

                                  {fonctions[entitee.id]?.filter(
                                    (f) => f.entitee_trois_id === section.id,
                                  ).length === 0 && (
                                    <p className="text-xs text-slate-400 italic text-center py-2">
                                      Aucune fonction dans cette section
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
                            Aucune section rattachée
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

      <EntiteeDeuxForm
        visible={formVisible}
        onHide={() => {
          setFormVisible(false);
          setEditing(null);
        }}
        onSubmit={editing ? onEdit : onCreate}
        refresh={fetchEntiteeDeux}
        initial={editing || undefined}
        title={
          editing
            ? `Modifier ${allEntiteeDeux[0]?.titre}`
            : `Créer ${allEntiteeDeux[0]?.titre}`
        }
        entiteeUn={allEntiteeUn}
      />

      <EntiteeDeuxAjoutFonction
        visible={ajoutFonctionVisible}
        onHide={() => {
          setAjoutFonctionVisible(false);
        }}
        entiteeDeux={selected}
        onSuccess={() => {
          if (selected) {
            loadEntiteeDetails(selected.id);
          }
          toast.current?.show({
            severity: "success",
            summary: "Succès",
            detail: "Fonction ajoutée",
          });
        }}
      />

      <EntiteeDeuxDetails
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        entiteeDeux={selected}
        entiteeUn={allEntiteeUn}
        toast={toast}
      />

      <EntiteeTroisForm
        visible={formTroisVisible}
        onHide={() => {
          setFormTroisVisible(false);
          setEditingTrois(null);
          setIsEditingTrois(false);
        }}
        onSubmit={isEditingTrois ? onEditTrois : onCreateTrois}
        refresh={fetchEntiteeDeux}
        initial={editingTrois || undefined}
        title={
          isEditingTrois
            ? "Modifier la structutre"
            : "Créer un nouvelle structure"
        }
        entiteeDeux={allEntiteeDeux}
      />
      <EntiteeTroisAjoutFonction
        visible={ajoutFonctionTroisVisible}
        onHide={() => setAjoutFonctionTroisVisible(false)}
        entiteeTrois={selectedEntiteeTrois}
        onSuccess={() => {
          if (selectedEntiteeTrois) {
            // Recharger les détails de l'entité parente
            loadEntiteeDetails(selectedEntiteeTrois.entitee_deux_id);
          }
          // ✅ Afficher le toast de succès
          toast.current?.show({
            severity: "success",
            summary: "Succès",
            detail: "Fonction ajoutée avec succès",
          });
        }}
      />
    </Layout>
  );
}
