import { useEffect, useRef, useState } from "react";
import Layout from "../../components/layout/Layoutt";
import TraveDetails from "./TraveDetails";
import TraveForm from "./TraveForm";
import type { Trave } from "../../interfaces";
import { confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import Pagination from "../../components/layout/Pagination";
import {
  getTraves,
  createTrave,
  updateTrave,
  deleteTrave,
} from "../../api/trave";
import {
  Layers,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  MapPin,
  Hash,
  Archive,
  WavesLadder,
} from "lucide-react";

export default function TravePage() {
  const [allTrave, setAllTrave] = useState<Trave[]>([]);
  const [selected, setSelected] = useState<Trave | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<Partial<Trave> | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchTraves = async () => {
    setLoading(true);
    try {
      const data = await getTraves();
      setAllTrave(data);
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Impossible de charger les étagères",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTraves();
  }, []);

  const handleAction = async (payload: any) => {
    try {
      if (editing?.id) {
        const updated = await updateTrave(editing.id, payload);
        setAllTrave((prev) =>
          prev.map((e) => (e.id === updated.id ? updated : e)),
        );
        toast.current?.show({
          severity: "success",
          summary: "Succès",
          detail: "Étagère mise à jour",
        });
      } else {
        const saved = await createTrave(payload);
        setAllTrave((prev) => [saved, ...prev]);
        toast.current?.show({
          severity: "success",
          summary: "Succès",
          detail: "Étagère créée",
        });
      }
      setFormVisible(false);
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "L'opération a échoué",
      });
    }
  };

  const handleDelete = async (id: string) => {
    confirmDialog({
      message:
        "Voulez-vous supprimer ce trave définitivement ? Cette action est irréversible.",
      header: "Confirmation",
      icon: "pi pi-info-circle", // Icône plus neutre, ou gardez pi-exclamation-triangle

      // --- Personnalisation des labels ---
      acceptLabel: "Supprimer",
      rejectLabel: "Annuler",

      // --- Styling des boutons ---
      // Ajout de classes de mise en page (flexbox) et de style
      acceptClassName: "p-button-danger p-button-raised p-button-rounded p-2",
      rejectClassName:
        "p-button-secondary p-button-outlined p-button-rounded mr-4 p-2",

      // --- Style du dialogue lui-même (optionnel) ---
      style: { width: "450px" },
      accept: async () => {
        try {
          await deleteTrave(id);
          setAllTrave((prev) => prev.filter((e) => e.id !== id));
          toast.current?.show({
            severity: "success",
            summary: "Supprimé",
            detail: "Étagère supprimée",
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

  const filtered = allTrave.filter((e) =>
    `${e.code} ${e.rayon?.code || ""}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <Layout>
      <Toast ref={toast} />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-lg shadow-emerald-100">
            <WavesLadder size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Traver
            </h1>
            <p className="text-slate-500 font-medium font-sans">
              Gestion des emplacements de stockage
            </p>
          </div>
        </div>
        <Button
          label="Nouvelle traver"
          icon={<Plus size={20} className="mr-2" />}
          className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-6 py-3 rounded-xl shadow-lg transition-all"
          onClick={() => {
            setEditing(null);
            setFormVisible(true);
          }}
        />
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <div className="relative group max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
            size={20}
          />
          <InputText
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl outline-none"
            placeholder="Rechercher par code ou code rayon..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-widest">
              <th className="px-6 py-4">Code</th>
              <th className="px-6 py-4">Rayon / Emplacement</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginated.map((e) => (
              <tr
                key={e.id}
                className="cursor-pointer hover:bg-emerald-50/30 transition-all group"
                onClick={() => {
                  setSelected(e);
                  setDetailsVisible(true);
                }}
              >
                <td className="px-6 py-4">
                  <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg font-bold text-xs border border-emerald-100 flex items-center gap-1 w-fit">
                    <Hash size={12} /> {e.code}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin size={14} className="text-blue-500" />
                    {e.rayon?.code || "Non assignée"}
                  </div>
                </td>
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        setSelected(e);
                        setDetailsVisible(true);
                      }}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setEditing(e);
                        setFormVisible(true);
                      }}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(String(e.id))}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && (
          <div className="p-12 text-center text-slate-400 animate-pulse">
            Chargement des données...
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            <WavesLadder size={48} className="mx-auto text-slate-200 mb-4" />
            Aucun traver trouvée.
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

      <TraveForm
        visible={formVisible}
        onHide={() => setFormVisible(false)}
        onSubmit={handleAction}
        initial={editing || {}}
      />

      <TraveDetails
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        trave={selected}
      />
    </Layout>
  );
}
