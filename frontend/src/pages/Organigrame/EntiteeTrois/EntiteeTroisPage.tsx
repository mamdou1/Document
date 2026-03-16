import { useRef, useState } from "react";
import Layout from "../../../components/layout/Layoutt";
import EntiteeTroisDetails from "./EntiteeTroisDetails";
import EntiteeTroisForm from "./EntiteeTroisForm";
import EntiteeTroisAjoutFonction from "./EntiteeTroisAjoutFonction";
import { EntiteeDeux, EntiteeTrois } from "../../../interfaces";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import Pagination from "../../../components/layout/Pagination";
import { InputText } from "primereact/inputtext";
import { confirmDialog } from "primereact/confirmdialog";
import {
  GitMerge,
  Plus,
  Search,
  Eye,
  PlusCircle,
  Layers,
  Trash2,
  Pencil,
  XCircle,
} from "lucide-react";

// ✅ IMPORTER LES NOUVEAUX HOOKS
import {
  useEntiteeTrois,
  useCreateEntiteeTrois,
  useUpdateEntiteeTrois,
  useDeleteEntiteeTrois,
} from "../../../hooks/useEntiteeTrois";

import { useEntiteeDeux } from "../../../hooks/useEntiteeDeux";

export default function EntiteeTroisPage() {
  const toast = useRef<Toast>(null);

  // ✅ ÉTAT 1: Remplacer useState par les hooks
  const {
    data: allEntiteeTrois = [],
    isLoading: isLoadingTrois,
    error: errorTrois,
    refetch: refetchTrois,
  } = useEntiteeTrois();

  const {
    data: allEntiteeDeux = [],
    isLoading: isLoadingDeux,
    error: errorDeux,
    refetch: refetchDeux,
  } = useEntiteeDeux();

  // ✅ ÉTAT 2: Remplacer les mutations
  const createMutation = useCreateEntiteeTrois();
  const updateMutation = useUpdateEntiteeTrois();
  const deleteMutation = useDeleteEntiteeTrois();

  // États UI
  const [selected, setSelected] = useState<EntiteeTrois | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [ajoutFonctionVisible, setAjoutFonctionVisible] = useState(false);
  const [editing, setEditing] = useState<Partial<EntiteeTrois> | null>(null);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // ✅ PLUS BESOIN DE fetchEntiteeTrois() NI DE useEffect !

  // ✅ ÉTAPE 3: Remplacer les handlers
  const onEdit = async (payload: Partial<EntiteeTrois>) => {
    if (!editing?.id) return;
    try {
      await updateMutation.mutateAsync({
        id: editing.id,
        data: payload,
      });
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
        detail: err?.response?.data?.message || "Échec de mise à jour",
      });
    }
  };

  const handleDelete = async (id: string) => {
    confirmDialog({
      message: `Voulez-vous supprimer ${allEntiteeTrois[0]?.titre || "cet élément"} définitivement ? Cette action est irréversible.`,
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
            detail: "Programme supprimé",
          });
        } catch (err: any) {
          toast.current?.show({
            severity: "error",
            summary: "Erreur",
            detail: err?.response?.data?.message || "Suppression impossible",
          });
        }
      },
    });
  };

  const onCreate = async (payload: Partial<EntiteeTrois>) => {
    try {
      await createMutation.mutateAsync(payload);
      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: `${allEntiteeTrois[0]?.titre || "Élément"} créé`,
      });
      setFormVisible(false);
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: err?.response?.data?.message || "Échec de création",
      });
    }
  };

  // Filtrage
  const filtered = allEntiteeTrois.filter((s) => {
    const isPopulated = s.code !== null && s.libelle !== null;
    if (!isPopulated) return false;
    return (s.libelle || s.code || "")
      .toLowerCase()
      .includes(query.toLowerCase());
  });

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // ✅ ÉTAPE 4: Gérer les états de chargement/erreur
  const isLoading = isLoadingTrois || isLoadingDeux;
  const error = errorTrois || errorDeux;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center text-red-600 p-8">
          <XCircle size={48} className="mx-auto mb-4" />
          <p>Erreur de chargement: {error.message}</p>
          <Button
            label="Réessayer"
            onClick={() => {
              refetchTrois();
              refetchDeux();
            }}
            className="mt-4"
          />
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
          <div className="bg-emerald-500 p-3 rounded-2xl text-white shadow-lg shadow-orange-100">
            <GitMerge size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              {allEntiteeTrois[0]?.titre || "Sections"}
            </h1>
            <p className="text-slate-500 font-medium">
              Gestion des unités de base
            </p>
          </div>
        </div>
        <Button
          label={`Nouvelle ${allEntiteeTrois[0]?.titre || "section"}`}
          icon={<Plus size={20} className="mr-2" />}
          className="bg-emerald-500 hover:bg-emerald-600 text-white border-none px-6 py-3 rounded-xl shadow-lg transition-all"
          onClick={() => {
            setEditing(null);
            setFormVisible(true);
          }}
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
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:ring-4 focus:ring-orange-500/10 outline-none"
            placeholder={`Rechercher une ${allEntiteeTrois[0]?.titre || "section"} ...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-widest">
              <th className="px-6 py-4">
                Code {allEntiteeTrois[0]?.titre || "section"}
              </th>
              <th className="px-6 py-4">
                Unité / {allEntiteeTrois[0]?.titre || "section"}
              </th>
              <th className="px-6 py-4">
                {allEntiteeDeux[0]?.titre || "Division"} Parente
              </th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginated.map((d) => (
              <tr
                key={d.id}
                onClick={() => {
                  setSelected(d);
                  setDetailsVisible(true);
                }}
                className="hover:bg-orange-50/30 transition-all group cursor-pointer"
              >
                <td className="px-6 py-4 font-mono text-sm font-bold text-emerald-700">
                  {d.code || "---"}
                </td>
                <td className="px-6 py-4 font-bold text-slate-700">
                  {d.libelle}
                </td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-2 text-slate-500 italic text-sm">
                    <Layers size={14} /> {d.entitee_deux?.libelle || "N/A"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(d);
                        setDetailsVisible(true);
                      }}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-orange-50 rounded-lg"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(d);
                        setAjoutFonctionVisible(true);
                      }}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                      title="Ajouter une fonction"
                    >
                      <PlusCircle size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditing(d);
                        setFormVisible(true);
                      }}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(String(d.id)!);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-center">
        <Pagination
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filtered.length}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modals */}
      <EntiteeTroisForm
        visible={formVisible}
        onHide={() => {
          setFormVisible(false);
          setEditing(null);
        }}
        onSubmit={editing ? onEdit : onCreate}
        refresh={() => {}} // ✅ PLUS BESOIN de refresh !
        initial={editing || undefined}
        title={editing ? "Modifier la section" : "Créer une nouvelle section"}
        entiteeDeux={allEntiteeDeux}
      />

      <EntiteeTroisAjoutFonction
        visible={ajoutFonctionVisible}
        onHide={() => setAjoutFonctionVisible(false)}
        entiteeTrois={selected}
        refresh={() => {
          refetchTrois();
          refetchDeux();
        }}
      />

      <EntiteeTroisDetails
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        entiteeTrois={selected}
      />
    </Layout>
  );
}
