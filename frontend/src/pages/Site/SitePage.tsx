import { useRef, useState } from "react";
import Layout from "../../components/layout/Layoutt";
import SiteDetails from "./SiteDetails";
import SiteForm from "./SiteForm";
import type { Site } from "../../interfaces";
import { confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import Pagination from "../../components/layout/Pagination";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Hash,
  MapPinned,
  XCircle,
} from "lucide-react";

// ✅ IMPORTER LES NOUVEAUX HOOKS
import {
  useSites,
  useCreateSite,
  useUpdateSite,
  useDeleteSite,
} from "../../hooks/useSites";

export default function SitePage() {
  const toast = useRef<Toast>(null);

  // ✅ ÉTAT 1: Remplacer useState par useSites
  const { data: allSite = [], isLoading, error, refetch } = useSites();

  // ✅ ÉTAT 2: Remplacer les mutations
  const createMutation = useCreateSite();
  const updateMutation = useUpdateSite();
  const deleteMutation = useDeleteSite();

  // États UI (inchangés)
  const [selected, setSelected] = useState<Site | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<Partial<Site> | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // ✅ PLUS BESOIN DE fetchSites() NI DE useEffect !

  // ✅ ÉTAPE 3: Remplacer handleAction
  const handleAction = async (payload: any) => {
    try {
      if (editing?.id) {
        await updateMutation.mutateAsync({
          id: String(editing.id),
          data: payload,
        });
        toast.current?.show({
          severity: "success",
          summary: "Succès",
          detail: "Site mis à jour",
        });
      } else {
        await createMutation.mutateAsync(payload);
        toast.current?.show({
          severity: "success",
          summary: "Succès",
          detail: "Site créé",
        });
      }
      setFormVisible(false);
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Opération échouée",
      });
    }
  };

  // ✅ ÉTAPE 4: Remplacer handleDelete
  const handleDelete = async (id: string) => {
    confirmDialog({
      message:
        "Voulez-vous supprimer ce site définitivement ? Cette action est irréversible.",
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
            detail: "Site retiré",
          });
        } catch (err) {
          toast.current?.show({
            severity: "error",
            summary: "Erreur",
            detail: "Suppression impossible",
          });
        }
      },
    });
  };

  // Filtrage et pagination (inchangés)
  const filtered = allSite.filter((s) =>
    `${s.nom} ${s.adresse}`.toLowerCase().includes(query.toLowerCase()),
  );

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // ✅ ÉTAPE 5: Gérer les états de chargement/erreur
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
            onClick={() => refetch()}
            className="mt-4"
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Toast ref={toast} />

      {/* Header (inchangé) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-lg shadow-emerald-100">
            <MapPinned size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Sites d' <span className="text-emerald-600">Archivage</span>
            </h1>
            <p className="text-slate-500 font-medium font-sans">
              Organisation des espaces de stockage
            </p>
          </div>
        </div>
        <Button
          label="Nouveau site"
          icon={<Plus size={20} className="mr-2" />}
          className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-6 py-3 rounded-xl shadow-lg transition-all shadow-emerald-200"
          onClick={() => {
            setEditing(null);
            setFormVisible(true);
          }}
        />
      </div>

      {/* Search (inchangé) */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex justify-between items-center">
        <div className="relative group max-w-md w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
            size={20}
          />
          <InputText
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Rechercher un site..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table Section (inchangé) */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-widest">
              <th className="px-6 py-4">Nom du Site</th>
              <th className="px-6 py-4">Adresse / Localisation</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginated.map((s) => (
              <tr
                key={s.id}
                className="cursor-pointer hover:bg-emerald-50/30 transition-all group"
                onClick={() => {
                  setSelected(s);
                  setDetailsVisible(true);
                }}
              >
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-slate-700">
                    {s.nom}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg font-bold text-xs border border-emerald-100 flex items-center gap-1 w-fit">
                    <Hash size={12} /> {s.adresse}
                  </span>
                </td>
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        setSelected(s);
                        setDetailsVisible(true);
                      }}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Voir détails"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setEditing(s);
                        setFormVisible(true);
                      }}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                      title="Modifier"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(String(s.id))}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!isLoading && filtered.length === 0 && (
          <div className="p-20 text-center">
            <MapPinned size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-500 font-medium">Aucun site trouvé</p>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-center">
        <Pagination
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filtered.length}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modals (inchangés) */}
      <SiteForm
        visible={formVisible}
        onHide={() => setFormVisible(false)}
        onSubmit={handleAction}
        initial={editing || {}}
      />
      <SiteDetails
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        site={selected}
      />
    </Layout>
  );
}
