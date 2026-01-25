import { useEffect, useRef, useState } from "react";
import Layout from "../../components/layout/Layoutt";
import DocumentTypeForm from "./DocumentTypeForm";
import DocumentTypeDetails from "./DocumentTypeDetails";
import DocumentTypeMetaForm from "./DocumentTypeMetaForm";
import { confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  Database,
  Settings,
  Search,
  Layers,
} from "lucide-react";
import {
  getTypeDocuments,
  createTypeDocument,
  updateTypeDocument,
  deleteTypeDocument,
} from "../../api/typeDocument";
import { getAllDivision } from "../../api/division";
import {
  CreateMetaFieldPayload,
  Division,
  TypeDocument,
} from "../../interfaces";
import { createMetaField } from "../../api/metaField";
import Pagination from "../../components/layout/Pagination";

export default function DocumentTypePage() {
  const [allDivisions, setAllDivisions] = useState<Division[]>([]);
  const [types, setTypes] = useState<TypeDocument[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [editing, setEditing] = useState<any>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [metaVisible, setMetaVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const toast = useRef<Toast>(null);

  const load = async () => {
    const [ty, div] = await Promise.all([getTypeDocuments(), getAllDivision()]);
    setTypes(Array.isArray(ty) ? ty : []);
    setAllDivisions(Array.isArray(div) ? div : []);
  };

  useEffect(() => {
    load();
  }, []);

  /* ================= ACTIONS ================= */

  const onCreate = () => {
    setEditing(null);
    setFormVisible(true);
  };

  const onEdit = (row: any) => {
    setEditing(row);
    setFormVisible(true);
  };

  const handleSubmit = async (payload: any) => {
    if (editing?.id) {
      const up = await updateTypeDocument(payload, editing.id);
      setTypes((s) => s.map((x) => (x.id === up.id ? up : x)));
      toast.current?.show({ severity: "success", summary: "Mis à jour" });
    } else {
      const cr = await createTypeDocument(payload);
      setTypes((s) => [cr, ...s]);
      toast.current?.show({ severity: "success", summary: "Créé" });
    }
  };

  const handleDelete = (id: string) => {
    confirmDialog({
      message: "Supprimer ce type de document ?",
      header: "Confirmation",
      acceptClassName: "p-button-danger",
      accept: async () => {
        await deleteTypeDocument(id);
        setTypes((s) => s.filter((x) => String(x.id) !== String(id)));
        toast.current?.show({ severity: "success", summary: "Supprimé" });
      },
    });
  };

  const handleCreateMeta = async (payload: CreateMetaFieldPayload) => {
    if (!selected?.id) return;

    const res = await createMetaField(selected.id, payload);

    setTypes((s) =>
      s.map((t) =>
        t.id === selected.id
          ? { ...t, metaFields: [...(t.metaFields || []), res] }
          : t,
      ),
    );

    toast.current?.show({
      severity: "success",
      summary: "Champ ajouté",
    });
  };

  const filtered = types.filter((t) =>
    `${t.code} ${t.nom}`.toLowerCase().includes(query.toLowerCase()),
  );

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <Layout>
      <Toast ref={toast} />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
              <Database size={24} />
            </div>
            Configuration des Types
          </h1>
          <p className="text-slate-500 text-sm mt-1 ml-16 font-medium">
            Définissez les modèles et métadonnées de vos documents
          </p>
        </div>
        <Button
          label="Nouveau Type"
          icon={<Plus size={18} className="mr-2" />}
          onClick={onCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white border-none px-6 py-3 rounded-xl shadow-lg transition-all"
        />
      </div>

      <div className="mb-6 relative max-w-md group">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
          size={18}
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un type..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
        />
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-24">
                Code
              </th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Type Document
              </th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Division
              </th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginated.map((t) => (
              <tr
                key={t.id}
                className="group hover:bg-blue-50/40 transition-colors cursor-pointer"
                onClick={() => {
                  setSelected(t);
                  setDetailsVisible(true);
                }}
              >
                <td className="p-4 text-xs font-black text-blue-600">
                  <span className="bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                    {t.code}
                  </span>
                </td>
                <td className="p-4 font-bold text-slate-700">{t.nom}</td>
                <td className="p-4">
                  <span className="flex items-center gap-2 text-slate-500 text-sm">
                    <Layers size={14} className="text-slate-400" />{" "}
                    {t.division?.libelle || "---"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(t);
                        setDetailsVisible(true);
                      }}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-xl transition-all"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(t);
                      }}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(t);
                        setMetaVisible(true);
                      }}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      title="Champs"
                    >
                      <Settings size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(String(t.id));
                      }}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
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

      <Pagination
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalItems={filtered.length}
        onPageChange={setCurrentPage}
      />

      <DocumentTypeForm
        visible={formVisible}
        onHide={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        initial={editing || {}}
        division={allDivisions}
      />

      <DocumentTypeDetails
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        type={selected}
      />

      <DocumentTypeMetaForm
        visible={metaVisible}
        onHide={() => setMetaVisible(false)}
        onSubmit={handleCreateMeta}
        type={selected}
      />
    </Layout>
  );
}
