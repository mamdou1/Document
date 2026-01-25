import { useEffect, useRef, useState } from "react";
import Layout from "../../components/layout/Layoutt";
import ProgrammeForm from "./ProgrammeForm";
import ProgrammeDetails from "./ProgrammeDetails";
import type { Programme, Exercice } from "../../interfaces";
import {
  getProgrammes,
  createProgramme,
  updateProgrammeById,
  deleteProgrammeById,
} from "../../api/programme";
import { getExercices } from "../../api/exercice";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { confirmDialog } from "primereact/confirmdialog";
import Pagination from "../../components/layout/Pagination";
import { InputText } from "primereact/inputtext";
import {
  FolderKanban,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  CalendarDays,
  Hash,
  Info,
} from "lucide-react";

export default function ProgrammePage() {
  const [items, setItems] = useState<Programme[]>([]);
  const [exercices, setExercices] = useState<Exercice[]>([]);
  const [selected, setSelected] = useState<Programme | null>(null);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [editing, setEditing] = useState<Partial<Programme> | null>(null);
  const toast = useRef<Toast>(null);

  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const affichage = async () => {
    setLoading(true);
    try {
      const [p, ex] = await Promise.all([getProgrammes(), getExercices()]);
      setItems(Array.isArray(p.programme) ? p.programme : []);
      setExercices(Array.isArray(ex) ? ex : []);
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Impossible de charger les données",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    affichage();
  }, []);

  const onCreate = async (payload: Partial<Programme>) => {
    try {
      const saved = await createProgramme(payload);
      setItems((s) => [saved, ...s]);
      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Programme créé",
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

  const onEdit = async (payload: Partial<Programme>) => {
    if (!editing?.id) return;
    try {
      const updated = await updateProgrammeById(editing.id, payload);
      setItems((s) => s.map((it) => (it.id === updated.id ? updated : it)));
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

  const handleDelete = async (id: string) => {
    confirmDialog({
      message: "Voulez-vous supprimer ce programme définitivement ?",
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await deleteProgrammeById(id);
          setItems((s) => s.filter((x) => x.id !== id));
          toast.current?.show({
            severity: "success",
            summary: "Supprimé",
            detail: "Programme supprimé",
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

  const filtered = items.filter((p) =>
    `${p.code_programme} ${p.libelle}`
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
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-blue-800 p-3 rounded-2xl text-white shadow-lg shadow-blue-100">
              <FolderKanban size={26} />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Programmes
            </h1>
          </div>
          <p className="text-slate-500 font-medium ml-14">
            Planification et suivi des programmes de l'exercice
          </p>
        </div>

        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white border-none px-6 py-3 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95"
          onClick={() => {
            setEditing(null);
            setFormVisible(true);
          }}
        >
          <Plus size={20} className="mr-2" />
          <span className="font-bold">Nouveau programme</span>
        </Button>
      </div>

      {/* Search Bar Area */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex items-center gap-4">
        <div className="flex-1 relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
            size={18}
          />
          <InputText
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
            placeholder="Rechercher par code ou libellé..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <Hash size={14} /> Code
                </div>
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                Libellé
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <CalendarDays size={14} /> Exercice
                </div>
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                Description
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginated.map((p) => (
              <tr
                key={p.id}
                onClick={() => {
                  setSelected(p);
                  setDetailsVisible(true);
                }}
                className="cursor-pointer hover:bg-blue-50/30 transition-all group"
              >
                <td className="px-6 py-4">
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg font-bold text-sm border border-blue-100">
                    {p.code_programme}
                  </span>
                </td>
                <td className="px-6 py-4 font-semibold text-slate-700">
                  {p.libelle}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="font-medium uppercase text-xs bg-slate-100 px-2 py-1 rounded">
                      {typeof p.exercice === "string"
                        ? p.exercice
                        : p.exercice?.annee}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p
                    className="text-slate-500 text-sm line-clamp-1 max-w-[200px]"
                    title={p.description}
                  >
                    {p.description || "---"}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setSelected(p);
                        setDetailsVisible(true);
                      }}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        setEditing(p);
                        setFormVisible(true);
                        e.stopPropagation();
                      }}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id!)}
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
          <div className="p-12 text-center text-blue-500 font-bold animate-pulse flex flex-col items-center gap-2">
            <FolderKanban size={40} className="animate-bounce" />
            Chargement des programmes...
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="p-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 text-slate-300 mb-4">
              <Info size={32} />
            </div>
            <p className="text-slate-500 font-bold">Aucun programme trouvé</p>
            <p className="text-slate-400 text-sm">
              Essayez de modifier vos critères de recherche.
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

      <ProgrammeForm
        visible={formVisible}
        onHide={() => setFormVisible(false)}
        onSubmit={editing ? onEdit : onCreate}
        initial={editing || undefined}
        title={editing ? "Modifier le programme" : "Créer un nouveau programme"}
        exercices={exercices}
      />

      <ProgrammeDetails
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        programme={selected}
      />
    </Layout>
  );
}
