import { useEffect, useRef, useState } from "react";
import Layout from "../../components/layout/Layoutt";
import ChapitreForm from "./ChapitreForm";
import ChapitreDetails from "./ChapitreDetails";
import type { Chapitre, Programme } from "../../interfaces";
import {
  getChapitres,
  createChapitre,
  updateChapitreById,
  deleteChapitreById,
} from "../../api/chapitre";
import { getProgrammes } from "../../api/programme";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { confirmDialog } from "primereact/confirmdialog";
import Pagination from "../../components/layout/Pagination";
import { InputText } from "primereact/inputtext";
import {
  BookOpen,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Layers,
  Hash,
} from "lucide-react";

export default function ChapitrePage() {
  const [items, setItems] = useState<Chapitre[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [selected, setSelected] = useState<Chapitre | null>(null);
  const [editing, setEditing] = useState<Partial<Chapitre> | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const affichage = async () => {
    setLoading(true);
    try {
      const [c, p] = await Promise.all([getChapitres(), getProgrammes()]);
      setItems(Array.isArray(c.chapitre) ? c.chapitre : []);
      setProgrammes(Array.isArray(p.programme) ? p.programme : []);
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

  const onCreate = async (payload: Partial<Chapitre>) => {
    try {
      const saved = await createChapitre(payload);
      setItems((s) => [saved, ...s]);
      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Chapitre créé avec succès",
      });
      //setFormVisible(false);
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Échec de la création",
      });
    }
  };

  const onEdit = async (payload: Partial<Chapitre>) => {
    if (!editing?.id) return;
    try {
      const updated = await updateChapitreById(String(editing.id), payload);
      setItems((s) => s.map((it) => (it.id === updated.id ? updated : it)));
      toast.current?.show({
        severity: "success",
        summary: "Mis à jour",
        detail: "Chapitre modifié",
      });
      setEditing(null);
      setFormVisible(false);
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Échec de la mise à jour",
      });
    }
  };

  const handleDelete = async (id: string) => {
    confirmDialog({
      message: "Voulez-vous vraiment supprimer ce chapitre ?",
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await deleteChapitreById(id);
          setItems((s) => s.filter((x) => String(x.id) !== String(id)));
          toast.current?.show({
            severity: "success",
            summary: "Supprimé",
            detail: "Chapitre retiré",
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

  const filtered = items.filter((c) =>
    `${c.code_chapitre} ${c.libelle}`
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

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-100">
            <BookOpen size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Chapitres
            </h1>
            <p className="text-slate-500 font-medium">
              Gestion de la structure des chapitres
            </p>
          </div>
        </div>
        <Button
          label="Nouveau chapitre"
          icon={<Plus size={20} className="mr-2" />}
          className="bg-blue-600 hover:bg-blue-700 text-white border-none px-6 py-3 rounded-xl shadow-lg shadow-blue-200 transition-all"
          onClick={() => {
            setEditing(null);
            setFormVisible(true);
          }}
        />
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 relative group">
        <Search
          className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
          size={20}
        />
        <InputText
          className="w-full pl-14 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
          placeholder="Rechercher par code ou intitulé..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-widest">
              <th className="px-6 py-4">Code</th>
              <th className="px-6 py-4">Libellé</th>
              <th className="px-6 py-4">Programme associé</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginated.map((c) => (
              <tr
                key={c.id}
                onClick={() => {
                  setSelected(c);
                  setDetailsVisible(true);
                }}
                className="cursor-pointer hover:bg-blue-50/30 transition-all group"
              >
                <td className="px-6 py-4">
                  <span className="bg-white border border-slate-200 text-slate-700 px-3 py-1 rounded-lg font-bold text-sm shadow-sm">
                    {c.code_chapitre}
                  </span>
                </td>
                <td className="px-6 py-4 font-semibold text-slate-700">
                  {c.libelle}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full w-fit text-xs border border-blue-100">
                    <Layers size={14} />
                    {typeof c.programme === "string"
                      ? c.programme
                      : c.programme?.libelle}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setSelected(c);
                        setDetailsVisible(true);
                      }}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        setEditing(c);
                        setFormVisible(true);
                        e.stopPropagation();
                      }}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(String(c.id!))}
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
          <div className="p-20 text-center text-blue-500 animate-pulse font-bold uppercase tracking-tighter">
            Chargement...
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

      <ChapitreForm
        visible={formVisible}
        onHide={() => setFormVisible(false)}
        onSubmit={editing ? onEdit : onCreate}
        initial={editing || undefined}
        title={editing ? "Modifier le chapitre" : "Ajouter un chapitre"}
        programmes={programmes}
      />
      <ChapitreDetails
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        chapitre={selected}
      />
    </Layout>
  );
}
