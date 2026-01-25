import { useEffect, useRef, useState } from "react";
import Layout from "../../components/layout/Layoutt";
import ExerciceForm from "./ExerciceForm";
import ExerciceDetails from "./ExerciceDetails";
import type { Exercice } from "../../interfaces";
import {
  getExercices,
  createExercice,
  deleteExerciceById,
} from "../../api/exercice";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { confirmDialog } from "primereact/confirmdialog";
import Pagination from "../../components/layout/Pagination";
import { Plus, Search, Eye, Pencil, Trash2, CalendarDays } from "lucide-react";
import { Boxes } from "lucide-react";

export default function ExercicePage() {
  const [allExercices, setAllExercices] = useState<Exercice[]>([]);
  const [selected, setSelected] = useState<Exercice | null>(null);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [editing, setEditing] = useState<Partial<Exercice> | null>(null);
  const toast = useRef<Toast>(null);

  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const load = async () => {
    setLoading(true);
    try {
      const data = await getExercices();
      setAllExercices(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Impossible de charger les exercices",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async (payload: Partial<Exercice>) => {
    try {
      const saved = await createExercice(payload);
      setAllExercices((s) => [saved, ...s]);
      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Exercice créé avec succès",
      });
      //setFormVisible(false);
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: err?.response?.data?.message || "Erreur création",
      });
    }
  };

  const onEdit = async (payload: Partial<Exercice>) => {
    if (!editing || !editing.id) return;
    try {
      const { updateExerciceById } = await import("../../api/exercice");
      const updated = await updateExerciceById(editing.id, payload);
      setAllExercices((s) => s.map((e) => (e.id === updated.id ? updated : e)));
      toast.current?.show({
        severity: "success",
        summary: "Mis à jour",
        detail: "L'exercice a été modifié",
      });
      setEditing(null);
      setFormVisible(false);
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: err?.response?.data?.message || "Erreur maj",
      });
    }
  };

  const handleDelete = async (id: string) => {
    confirmDialog({
      message: "Êtes-vous sûr de vouloir supprimer cet exercice ?",
      header: "Confirmation de suppression",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger bg-red-600 border-none rounded-xl",
      rejectClassName: "p-button-text text-slate-600 rounded-xl",
      accept: async () => {
        try {
          await deleteExerciceById(id);
          setAllExercices((s) => s.filter((x) => x.id !== id));
          toast.current?.show({
            severity: "success",
            summary: "Supprimé",
            detail: "Exercice supprimé",
          });
        } catch (err: any) {
          toast.current?.show({
            severity: "error",
            summary: "Erreur",
            detail: "Impossible de supprimer",
          });
        }
      },
    });
  };

  const filtered = allExercices.filter((e) =>
    String(e.annee).includes(query.trim()),
  );

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <Layout>
      <Toast ref={toast} />

      {/* Header de Page */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-blue-800 p-3 rounded-2xl text-white shadow-lg shadow-blue-100">
              <Boxes size={26} />
            </div>
            <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">
              Exercices
            </h1>
          </div>
          <p className="text-slate-500 font-medium ml-14">
            Gestion et suivi des périodes budgétaires annuelles
          </p>
        </div>

        <Button
          onClick={() => {
            setEditing(null);
            setFormVisible(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white border-none px-6 py-3 rounded-2xl shadow-lg shadow-blue-200 transition-all flex items-center gap-2 group"
        >
          <Plus
            size={20}
            className="group-hover:rotate-90 transition-transform"
          />
          <span className="font-bold">Nouvel exercice</span>
        </Button>
      </div>

      {/* Barre d'outils / Filtres */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex items-center">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-sm"
            placeholder="Rechercher une année..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                Année
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                Date de création
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginated.length > 0 ? (
              paginated.map((ex) => (
                <tr
                  key={ex.id}
                  className="hover:bg-blue-50/30 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <CalendarDays size={18} />
                      </div>
                      <span className="font-bold text-slate-700 text-lg">
                        {ex.annee}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm font-medium">
                    {ex.createdAt
                      ? new Date(ex.createdAt).toLocaleDateString("fr-FR")
                      : "-"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelected(ex);
                          setDetailsVisible(true);
                        }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="Voir détails"
                      >
                        <Eye size={20} />
                      </button>
                      <button
                        onClick={() => {
                          setEditing(ex);
                          setFormVisible(true);
                        }}
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                        title="Modifier"
                      >
                        <Pencil size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(ex.id!)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Supprimer"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-12 text-center text-slate-400"
                >
                  Aucun exercice trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Container */}
      <div className="mt-6 flex justify-center">
        <Pagination
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filtered.length}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modals */}
      <ExerciceForm
        visible={formVisible}
        onHide={() => setFormVisible(false)}
        onSubmit={editing ? onEdit : onCreate}
        initial={editing || undefined}
        title={editing ? "Modifier l'exercice" : "Ajouter un nouvel exercice"}
      />

      <ExerciceDetails
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        exercice={selected}
      />
    </Layout>
  );
}
