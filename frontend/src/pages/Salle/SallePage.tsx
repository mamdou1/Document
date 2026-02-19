import { useEffect, useRef, useState } from "react";
import Layout from "../../components/layout/Layoutt";
import SalleDetails from "./SalleDetails";
import SalleForm from "./SalleForm";
import type { Salle } from "../../interfaces";
import { confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import Pagination from "../../components/layout/Pagination";
import {
  getSalles,
  createSalle,
  updateSalle,
  deleteSalle,
} from "../../api/salle";
import {
  LayoutGrid,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Hash,
  DoorOpen,
} from "lucide-react";

export default function SallePage() {
  const [allSalles, setAllSalles] = useState<Salle[]>([]);
  const [selected, setSelected] = useState<Salle | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<Partial<Salle> | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchSalles = async () => {
    setLoading(true);
    try {
      const data = await getSalles();
      setAllSalles(Array.isArray(data) ? data : data.salle || []);
    } catch (err) {
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
    fetchSalles();
  }, []);

  const handleAction = async (payload: any) => {
    try {
      if (editing?.id) {
        const updated = await updateSalle(editing.id, payload);
        setAllSalles((prev) =>
          prev.map((s) => (s.id === updated.id ? updated : s)),
        );
        toast.current?.show({
          severity: "success",
          summary: "Succès",
          detail: "Salle mise à jour",
        });
      } else {
        const saved = await createSalle(payload);
        setAllSalles((prev) => [saved, ...prev]);
        toast.current?.show({
          severity: "success",
          summary: "Succès",
          detail: "Salle créée",
        });
      }
      setFormVisible(false);
      fetchSalles();
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Opération échouée",
      });
    }
  };

  const handleDelete = async (id: string) => {
    confirmDialog({
      message:
        "Voulez-vous supprimer cette salle définitivement ? Cette action est irréversible.",
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
          await deleteSalle(id);
          setAllSalles((prev) => prev.filter((s) => s.id !== id));
          toast.current?.show({
            severity: "success",
            summary: "Supprimé",
            detail: "Salle retirée",
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

  const filtered = allSalles.filter((s) =>
    `${s.code_salle} ${s.libelle}`.toLowerCase().includes(query.toLowerCase()),
  );

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
            <LayoutGrid size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Salles d' <span className="text-emerald-600">Archivage</span>
            </h1>
            <p className="text-slate-500 font-medium font-sans">
              Organisation des espaces de stockage
            </p>
          </div>
        </div>
        <Button
          label="Nouvelle salle"
          icon={<Plus size={20} className="mr-2" />}
          className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-6 py-3 rounded-xl shadow-lg transition-all shadow-emerald-200"
          onClick={() => {
            setEditing(null);
            setFormVisible(true);
          }}
        />
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex justify-between items-center">
        <div className="relative group max-w-md w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
            size={20}
          />
          <InputText
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Rechercher une salle..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginated.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg font-bold text-xs border border-emerald-100 flex items-center gap-1">
                  <Hash size={12} /> {s.code_salle}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditing(s);
                      setFormVisible(true);
                    }}
                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(String(s.id))}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-1">
                {s.libelle}
              </h3>
              <p className="text-slate-400 text-sm mb-6 flex items-center gap-1">
                <DoorOpen size={14} /> Espace de stockage sécurisé
              </p>

              <Button
                label="Voir les étagères"
                icon={<Eye size={16} className="mr-2" />}
                className="w-full p-button-outlined border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl font-bold py-2"
                onClick={() => {
                  setSelected(s);
                  setDetailsVisible(true);
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="p-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
          <LayoutGrid size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-500 font-medium">Aucune salle trouvée</p>
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <Pagination
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filtered.length}
          onPageChange={setCurrentPage}
        />
      </div>

      <SalleForm
        visible={formVisible}
        onHide={() => setFormVisible(false)}
        onSubmit={handleAction}
        initial={editing || {}}
      />
      <SalleDetails
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        salle={selected}
      />
    </Layout>
  );
}
