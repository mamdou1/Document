import { useEffect, useRef, useState } from "react";
import Layout from "../../components/layout/Layoutt";
import DocumentForm from "./DocumentForm";
import DocumentDetails from "./DocumentDetails";
import { confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Plus, Eye, Trash2, FileText, Search, FileStack } from "lucide-react";
import {
  getDocuments,
  createDocument,
  deleteDocument,
} from "../../api/document";
import { getTypeDocuments } from "../../api/typeDocument";

export default function DocumentPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [query, setQuery] = useState("");
  const toast = useRef<Toast>(null);

  const load = async () => {
    const [resDocs, resTypes] = await Promise.all([
      getDocuments(),
      getTypeDocuments(),
    ]);
    setDocs(resDocs);
    setTypes(resTypes);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (payload: any) => {
    try {
      const cr = await createDocument(payload);
      setDocs((s) => [cr, ...s]);
      setFormVisible(false);
      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Document archivé avec succès",
      });
    } catch (e) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Impossible de créer le document",
      });
    }
  };

  const handleDelete = (id: string) => {
    confirmDialog({
      message: "Cette action est irréversible. Supprimer ?",
      header: "Confirmation de suppression",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger rounded-xl",
      rejectClassName: "p-button-text rounded-xl",
      acceptLabel: "Oui, supprimer",
      rejectLabel: "Annuler",
      accept: async () => {
        await deleteDocument(id);
        setDocs((s) => s.filter((x) => String(x.id) !== String(id)));
        toast.current?.show({ severity: "success", summary: "Supprimé" });
      },
    });
  };

  const filtered = docs.filter((d) =>
    `${d.id} ${d.typeDocument?.nom}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <Layout>
      <Toast ref={toast} />

      {/* Header Page */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
              <FileStack size={24} />
            </div>
            Gestion des Documents
          </h1>
          <p className="text-slate-500 text-sm mt-1 ml-16 font-medium">
            Consultez et archivez vos documents administratifs
          </p>
        </div>
        <Button
          label="Nouveau Document"
          icon={<Plus size={18} className="mr-2" />}
          onClick={() => {
            setSelected(null);
            setFormVisible(true);
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white border-none px-6 py-3 rounded-xl shadow-lg transition-all"
        />
      </div>

      {/* Barre de recherche */}
      <div className="mb-6 relative max-w-md group">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
          size={18}
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher par référence ou type..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
        />
      </div>

      {/* Table stylisée */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-20">
                Réf.
              </th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Type de document
              </th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((d, index) => (
              <tr
                key={d.id}
                className="group hover:bg-blue-50/40 transition-colors"
              >
                <td className="p-4">
                  <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-lg text-xs font-bold">
                    #{String(d.id).padStart(3, "0")}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="font-bold text-slate-700">
                      {d?.typeDocument?.nom || "Non classé"}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => {
                        setSelected(d);
                        setDetailsVisible(true);
                      }}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-xl transition-all"
                      title="Voir détails"
                    >
                      <Eye size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(d.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="Supprimer"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <div className="inline-flex p-4 bg-slate-50 rounded-full mb-4 text-slate-300">
              <FileText size={40} />
            </div>
            <p className="text-slate-400 italic">Aucun document trouvé</p>
          </div>
        )}
      </div>

      <DocumentForm
        visible={formVisible}
        onHide={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        documentType={types}
      />
      <DocumentDetails
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        doc={selected}
      />
    </Layout>
  );
}
