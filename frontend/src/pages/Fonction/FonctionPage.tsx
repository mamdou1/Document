import { useEffect, useRef, useState, useMemo } from "react";
import {
  useInitialData,
  useCreateFonction,
  useUpdateFonction,
  useDeleteFonction,
} from "../../hooks/useFonctions";
import {
  Fonction,
  EntiteeUn,
  EntiteeDeux,
  EntiteeTrois,
} from "../../interfaces";
import { Toast } from "primereact/toast";
import Layout from "../../components/layout/Layoutt";
import { Button } from "primereact/button";
import {
  Briefcase,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  GitMerge,
  Layers,
  Building2,
} from "lucide-react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { confirmDialog } from "primereact/confirmdialog";
import Pagination from "../../components/layout/Pagination";
import FonctionForm from "./FonctionForm";
import FonctionDetails from "./FonctionDetails";

// Type pour les options de filtre
type FilterOption = {
  label: string;
  value: string | null;
};

export default function FonctionPage() {
  const toast = useRef<Toast>(null);

  // Données initiales
  const {
    fonctions = [],
    entiteeUn = [],
    entiteeDeux = [],
    entiteeTrois = [],
    isLoading,
    error,
    refetch,
  } = useInitialData();

  console.log("🔍 fonctions chargées:", fonctions); // ✅ DEBUG
  console.log("🔍 isLoading:", isLoading);
  console.log("🔍 error:", error);

  // Mutations
  const createMutation = useCreateFonction();
  const updateMutation = useUpdateFonction();
  const deleteMutation = useDeleteFonction();

  // États UI
  const [query, setQuery] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [formVisible, setFormVisible] = useState<boolean>(false);
  const [detailsVisible, setDetailsVisible] = useState<boolean>(false);
  const [editing, setEditing] = useState<Partial<Fonction> | null>(null);
  const [selectedFonction, setSelectedFonction] = useState<Fonction | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  const getActiveEntity = (fonction: Fonction) => {
    if (fonction.entitee_trois) {
      return {
        niveau: "entitee_trois",
        libelle: fonction.entitee_trois.libelle,
        code: fonction.entitee_trois.code,
        titre: titres.entitee3,
        couleur: "bg-purple-100 text-purple-700 border-purple-200",
        icone: <GitMerge size={14} className="text-purple-600" />,
        parent: fonction.entitee_deux,
        grandParent: fonction.entitee_un,
      };
    }
    if (fonction.entitee_deux) {
      return {
        niveau: "entitee_deux",
        libelle: fonction.entitee_deux.libelle,
        code: fonction.entitee_deux.code,
        titre: titres.entitee2,
        couleur: "bg-blue-100 text-blue-700 border-blue-200",
        icone: <Layers size={14} className="text-blue-600" />,
        parent: fonction.entitee_un,
        grandParent: null,
      };
    }
    if (fonction.entitee_un) {
      return {
        niveau: "entitee_un",
        libelle: fonction.entitee_un.libelle,
        code: fonction.entitee_un.code,
        titre: titres.entitee1,
        couleur: "bg-emerald-100 text-emerald-700 border-emerald-200",
        icone: <Building2 size={14} className="text-emerald-600" />,
        parent: null,
        grandParent: null,
      };
    }
    return null;
  };

  // Options pour le filtre
  const filterOptions = useMemo<FilterOption[]>(() => {
    const options: FilterOption[] = [
      { label: "Toutes les fonctions", value: null },
    ];

    (entiteeUn || []).forEach((e: EntiteeUn) => {
      options.push({
        label: `🏢 ${e.libelle}`,
        value: `E1-${e.id}`,
      });
    });

    (entiteeDeux || []).forEach((e: EntiteeDeux) => {
      options.push({
        label: `📂 ${e.libelle}`,
        value: `E2-${e.id}`,
      });
    });

    (entiteeTrois || []).forEach((e: EntiteeTrois) => {
      options.push({
        label: `📄 ${e.libelle}`,
        value: `E3-${e.id}`,
      });
    });

    return options;
  }, [entiteeUn, entiteeDeux, entiteeTrois]);

  // Titres dynamiques
  const titres = useMemo(
    () => ({
      entitee1: (entiteeUn[0] as EntiteeUn)?.titre || "Entité 1",
      entitee2: (entiteeDeux[0] as EntiteeDeux)?.titre || "Entité 2",
      entitee3: (entiteeTrois[0] as EntiteeTrois)?.titre || "Entité 3",
    }),
    [entiteeUn, entiteeDeux, entiteeTrois],
  );

  // Filtrage
  const filteredFonctions = useMemo<Fonction[]>(() => {
    let filtered = fonctions;

    // Filtre par recherche textuelle
    if (query) {
      filtered = filtered.filter((f: Fonction) =>
        f.libelle.toLowerCase().includes(query.toLowerCase()),
      );
    }

    // Filtre par entité
    if (selectedFilter) {
      const [prefix, idStr] = selectedFilter.split("-");
      const id = parseInt(idStr, 10);

      filtered = filtered.filter((f: Fonction) => {
        if (prefix === "E1") return f.entitee_un_id === id;
        if (prefix === "E2") return f.entitee_deux_id === id;
        if (prefix === "E3") return f.entitee_trois_id === id;
        return true;
      });
    }

    return filtered;
  }, [fonctions, query, selectedFilter]);

  // Pagination
  const paginatedFonctions = useMemo<Fonction[]>(() => {
    return filteredFonctions.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    );
  }, [filteredFonctions, currentPage, itemsPerPage]);

  // Handlers
  const handleCreate = async (data: Partial<Fonction>): Promise<void> => {
    try {
      await createMutation.mutateAsync(data);
      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Fonction créée avec succès",
      });
      setFormVisible(false);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Échec de la création",
      });
    }
  };

  const handleUpdate = async (data: Partial<Fonction>): Promise<void> => {
    if (!editing?.id) return;
    try {
      await updateMutation.mutateAsync({ id: editing.id, data });
      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Fonction mise à jour",
      });
      setEditing(null);
      setFormVisible(false);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Échec de la modification",
      });
    }
  };

  const handleDelete = (id: number): void => {
    confirmDialog({
      message: "Voulez-vous supprimer cette définitivement ?",
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
          await deleteMutation.mutateAsync(id);
          toast.current?.show({
            severity: "success",
            summary: "Supprimé",
            detail: "Fonction supprimée",
          });
        } catch (error) {
          toast.current?.show({
            severity: "error",
            summary: "Erreur",
            detail: "Échec de la suppression",
          });
        }
      },
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </Layout>
    );
  }

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
              Fonctions
            </h1>
            <p className="text-slate-500 font-medium">
              Gérez les fonctions et postes ({fonctions.length})
            </p>
          </div>
        </div>
        <Button
          label="Nouvelle fonction"
          icon={<Plus size={20} className="mr-2" />}
          className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-6 py-3 rounded-xl shadow-lg transition-all"
          onClick={() => {
            setEditing(null);
            setFormVisible(true);
          }}
        />
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[300px] relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <InputText
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setQuery(e.target.value)
            }
            placeholder="Rechercher une fonction..."
            value={query}
          />
        </div>
        <Dropdown
          value={selectedFilter}
          onChange={(e: { value: string | null }) => setSelectedFilter(e.value)}
          options={filterOptions}
          placeholder="Filtrer par entité"
          className="w-64 bg-slate-50 border-slate-200 rounded-xl"
          showClear
          filter
        />
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-widest">
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Libellé</th>
              <th className="px-6 py-4">Affectation</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginatedFonctions.map((f: Fonction) => (
              <tr
                key={f.id}
                onClick={() => {
                  setSelectedFonction(f);
                  setDetailsVisible(true);
                }}
                className="cursor-pointer hover:bg-emerald-50/30 transition-all group"
              >
                <td className="px-6 py-4">
                  <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg font-mono font-bold text-xs border border-emerald-100">
                    #{String(f.id).padStart(3, "0")}
                  </span>
                </td>
                <td className="px-6 py-4 font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <Briefcase
                      size={16}
                      className="text-slate-300 group-hover:text-emerald-400"
                    />
                    {f.libelle}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {(() => {
                    const activeEntity = getActiveEntity(f);
                    if (!activeEntity) {
                      return (
                        <span className="text-slate-400 text-xs">
                          Non affecté
                        </span>
                      );
                    }

                    return (
                      <div className="space-y-1">
                        {/* Entité active */}
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 ${activeEntity.couleur} text-[10px] font-bold rounded-lg border`}
                        >
                          {activeEntity.icone}
                          {activeEntity.libelle}
                        </span>

                        {/* Hiérarchie (optionnel - en petit) */}
                        <div className="text-[9px] text-slate-400 mt-1">
                          {activeEntity.parent && (
                            <span className="mr-1">
                              {activeEntity.parent.libelle}
                            </span>
                          )}
                          {activeEntity.grandParent && (
                            <span className="mr-1">
                              ← {activeEntity.grandParent.libelle}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        setSelectedFonction(f);
                        setDetailsVisible(true);
                      }}
                      className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                      title="Voir détails"
                    >
                      <Eye size={20} />
                    </button>
                    <button
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        setEditing(f);
                        setFormVisible(true);
                      }}
                      className="p-3 text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                      title="Modifier"
                    >
                      <Pencil size={20} />
                    </button>
                    <button
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleDelete(f.id);
                      }}
                      className="p-3 text-slate-400 hover:text-red-500 hover:bg-white hover:shadow-md rounded-xl transition-all"
                      title="Supprimer"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredFonctions.length === 0 && (
          <div className="text-center py-20">
            <Briefcase size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-400 font-medium">
              Aucune fonction trouvée
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-6">
        <Pagination
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filteredFonctions.length}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modals */}
      <FonctionForm
        visible={formVisible}
        onHide={() => {
          setFormVisible(false);
          setEditing(null);
        }}
        onSubmit={editing ? handleUpdate : handleCreate}
        initial={editing}
        entiteeUn={entiteeUn}
        entiteeDeux={entiteeDeux}
        entiteeTrois={entiteeTrois}
        titres={titres}
      />

      <FonctionDetails
        visible={detailsVisible}
        onHide={() => {
          setDetailsVisible(false);
          setSelectedFonction(null);
        }}
        fonction={selectedFonction}
        titres={titres}
      />
    </Layout>
  );
}
