import { useEffect, useRef, useState } from "react";
import Layout from "../../components/layout/Layoutt";
import NatureForm from "./NatureForm";
import NatureDetails from "./NatureDetails";
import type { Nature, Chapitre } from "../../interfaces";
import {
  getNatures,
  createNature,
  updateNatureById,
  deleteNatureById,
} from "../../api/nature";
import { getChapitres } from "../../api/chapitre";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { confirmDialog } from "primereact/confirmdialog";
import Pagination from "../../components/layout/Pagination";
import { InputText } from "primereact/inputtext";
import {
  Tag,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Bookmark,
  Hash,
} from "lucide-react";

export default function NaturePage() {
  const [items, setItems] = useState<Nature[]>([]);
  const [chapitres, setChapitres] = useState<Chapitre[]>([]);
  const [selected, setSelected] = useState<Nature | null>(null);
  const [editing, setEditing] = useState<Partial<Nature> | null>(null);
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
      const [n, c] = await Promise.all([getNatures(), getChapitres()]);
      setItems(Array.isArray(n.nature) ? n.nature : []);
      setChapitres(Array.isArray(c.chapitre) ? c.chapitre : []);
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

  const handleAction = async (
    method: any,
    payload: any,
    successMsg: string
  ) => {
    try {
      const result = await method(payload);
      if (editing) {
        setItems((s) => s.map((it) => (it.id === result.id ? result : it)));
      } else {
        setItems((s) => [result, ...s]);
      }
      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: successMsg,
      });
      setFormVisible(false);
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Opération échouée",
      });
    }
  };

  const handleDelete = async (id: string) => {
    confirmDialog({
      message: "Supprimer cette nature de dépense ?",
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await deleteNatureById(id);
          setItems((s) => s.filter((x) => x.id !== id));
          toast.current?.show({
            severity: "success",
            summary: "Supprimé",
            detail: "Nature supprimée",
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

  const filtered = items.filter((n) =>
    `${n.code_nature} ${n.libelle}`.toLowerCase().includes(query.toLowerCase())
  );
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Layout>
      <Toast ref={toast} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-blue-800 p-3 rounded-2xl text-white shadow-lg shadow-blue-100">
            <Tag size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Natures
            </h1>
            <p className="text-slate-500 font-medium">
              Nomenclature des natures de dépenses
            </p>
          </div>
        </div>
        <Button
          label="Nouvelle nature"
          icon={<Plus size={20} className="mr-2" />}
          className="bg-blue-600 hover:bg-blue-700 text-white border-none px-6 py-3 rounded-xl shadow-lg transition-all shadow-blue-200"
          onClick={() => {
            setEditing(null);
            setFormVisible(true);
          }}
        />
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex items-center gap-4">
        <div className="flex-1 relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
            size={20}
          />
          <InputText
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
            placeholder="Rechercher une nature (code ou libellé)..."
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
              <th className="px-6 py-4">Code</th>
              <th className="px-6 py-4">Libellé</th>
              <th className="px-6 py-4">Chapitre</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginated.map((n) => (
              <tr
                key={n.id}
                onClick={() => {
                  setSelected(n);
                  setDetailsVisible(true);
                }}
                className="cursor-pointer hover:bg-blue-50/30 transition-all group"
              >
                <td className="px-6 py-4">
                  <span className="bg-white border border-slate-200 text-slate-600 px-3 py-1 rounded-lg font-bold text-xs shadow-sm flex items-center gap-1 w-fit">
                    <Hash size={12} /> {n.code_nature}
                  </span>
                </td>
                <td className="px-6 py-4 font-semibold text-slate-700">
                  {n.libelle}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-full w-fit text-xs border border-emerald-100">
                    <Bookmark size={14} />
                    {typeof n.chapitre === "string"
                      ? n.chapitre
                      : n.chapitre?.libelle}
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500 text-sm italic max-w-[200px] truncate">
                  {n.description || "Aucune description"}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setSelected(n);
                        setDetailsVisible(true);
                      }}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        setEditing(n);
                        setFormVisible(true);
                        e.stopPropagation();
                      }}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(n.id!)}
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
          <div className="p-10 text-center text-blue-500 font-bold animate-pulse">
            Chargement des natures...
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

      <NatureForm
        visible={formVisible}
        onHide={() => setFormVisible(false)}
        onSubmit={
          editing ? (p: any) => updateNatureById(editing.id!, p) : createNature
        }
        initial={editing || undefined}
        title={editing ? "Modifier la nature" : "Ajouter une nature"}
        chapitres={chapitres}
      />
      <NatureDetails
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        nature={selected}
      />
    </Layout>
  );
}
