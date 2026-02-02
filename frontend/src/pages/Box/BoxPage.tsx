import { useEffect, useRef, useState } from "react";
import Layout from "../../components/layout/Layoutt";
import BoxDetails from "./BoxDetails";
import BoxForm from "./BoxForm";
import type { Box } from "../../interfaces";
import { confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import Pagination from "../../components/layout/Pagination";
import { getBoxes, createBox, updateBox, deleteBox } from "../../api/box";
import {
  Archive,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Hash,
  BoxIcon,
  AlertCircle,
} from "lucide-react";
import AddToBoxForm from "./AddToBoxForm";

export default function BoxPage() {
  const [allBoxes, setAllBoxes] = useState<Box[]>([]);
  const [selected, setSelected] = useState<Box | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<Partial<Box> | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchBoxes = async () => {
    setLoading(true);
    try {
      const data = await getBoxes();
      setAllBoxes(data);
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Impossible de charger les boxes",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoxes();
  }, []);

  const handleAction = async (payload: any) => {
    try {
      if (editing?.id) {
        const updated = await updateBox(editing.id, payload);
        setAllBoxes((prev) =>
          prev.map((b) => (b.id === updated.id ? updated : b)),
        );
        toast.current?.show({
          severity: "success",
          summary: "Succès",
          detail: "Box mis à jour",
        });
      } else {
        const saved = await createBox(payload);
        setAllBoxes((prev) => [saved, ...prev]);
        toast.current?.show({
          severity: "success",
          summary: "Succès",
          detail: "Box créé",
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

  const handleDelete = (id: string) => {
    confirmDialog({
      message:
        "Voulez-vous supprimer ce box ? Cela peut affecter les documents liés.",
      header: "Confirmation de suppression",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await deleteBox(id);
          setAllBoxes((prev) => prev.filter((b) => b.id !== id));
          toast.current?.show({
            severity: "success",
            summary: "Supprimé",
            detail: "Box supprimé avec succès",
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

  const filtered = allBoxes.filter((b) =>
    `${b.code_box} ${b.libelle}`.toLowerCase().includes(query.toLowerCase()),
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
          <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-lg">
            <Archive size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Boxes d' <span className="text-emerald-600">Archivage</span>
            </h1>
            <p className="text-slate-500 font-medium">
              Gestion de la capacité et du contenu
            </p>
          </div>
        </div>
        <Button
          label="Nouveau Box"
          icon={<Plus size={20} className="mr-2" />}
          className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-6 py-3 rounded-xl shadow-blue-100 shadow-lg"
          onClick={() => {
            setEditing(null);
            setFormVisible(true);
          }}
        />
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 mb-6">
        <div className="relative group max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500"
            size={20}
          />
          <InputText
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl"
            placeholder="Rechercher un box..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginated.map((box) => {
          const ratio =
            (Number(box.current_count) / Number(box.capacite_max)) * 100;
          const isFull = ratio >= 100;

          return (
            <div
              key={box.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg font-mono text-xs border border-slate-200 uppercase tracking-wider">
                  {box.code_box}
                </div>
                {isFull && (
                  <span className="flex items-center gap-1 text-[10px] font-black bg-red-100 text-red-600 px-2 py-1 rounded-full uppercase">
                    <AlertCircle size={10} /> Plein
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-slate-800 mb-4">
                {box.libelle}
              </h3>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>Remplissage</span>
                  <span>
                    {box.current_count} / {box.capacite_max}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${isFull ? "bg-red-500" : ratio > 80 ? "bg-orange-400" : "bg-blue-500"}`}
                    style={{ width: `${Math.min(ratio, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-50">
                <button
                  onClick={() => {
                    setSelected(box);
                    setDetailsVisible(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                >
                  <Eye size={16} /> Voir Documents
                </button>
                <button
                  onClick={() => {
                    setEditing(box);
                    setFormVisible(true);
                  }}
                  className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => handleDelete(String(box.id))}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {loading && (
        <div className="p-12 text-center text-slate-400 animate-pulse">
          Chargement des données...
        </div>
      )}
      {!loading && filtered.length === 0 && (
        <div className="p-12 text-center text-slate-500">
          <Archive size={48} className="mx-auto text-slate-200 mb-4" />
          Aucune box trouvée.
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

      <BoxForm
        visible={formVisible}
        onHide={() => setFormVisible(false)}
        onSubmit={handleAction}
        initial={editing || {}}
      />
      <BoxDetails
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        boxId={selected?.id}
        onUpdate={fetchBoxes}
      />
    </Layout>
  );
}
