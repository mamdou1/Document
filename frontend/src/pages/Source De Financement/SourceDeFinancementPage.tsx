import { useEffect, useRef, useState } from "react";
import Layout from "../../components/layout/Layoutt";
import SourceDeFinancementDetails from "./SourceDeFinancementDetails";
import SourceDeFinancementForm from "./SourceDeFinancementForm";
import type { SourceDeFinancement } from "../../interfaces";
import { confirmDialog } from "primereact/confirmdialog";
import {
  getSourceDeFinancements,
  createSourceDeFinancement,
  updateSourceDeFinancement,
  deleteSourceDeFinancement,
} from "../../api/sourceDeFinancement";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import Pagination from "../../components/layout/Pagination";
import { InputText } from "primereact/inputtext";
import {
  Users,
  Plus,
  Search,
  Eye,
  Pencil,
  Building2,
  Hash,
  Trash2,
} from "lucide-react";

export default function SourceDeFinancementPage() {
  const [allSourceDeFinancement, setAllSourceDeFinancement] = useState<
    SourceDeFinancement[]
  >([]);
  const [selected, setSelected] = useState<SourceDeFinancement | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<Partial<SourceDeFinancement> | null>(
    null,
  );
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const affichage = async () => {
    setLoading(true);
    try {
      const data = await getSourceDeFinancements();
      setAllSourceDeFinancement(data.source || []);
      console.log(data);
    } catch (err: any) {
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
    affichage();
  }, []);

  const handleAction = async (payload: Partial<SourceDeFinancement>) => {
    try {
      if (editing?.id) {
        const update = await updateSourceDeFinancement(payload, editing.id);
        setAllSourceDeFinancement((s) =>
          s.map((g) => (g.id === update.id ? update : g)),
        );
        toast.current?.show({
          severity: "success",
          summary: "Succès",
          detail: "SourceDeFinancement mis à jour",
        });
      } else {
        const saved = await createSourceDeFinancement(payload);
        setAllSourceDeFinancement((s) => [saved, ...s]);
        toast.current?.show({
          severity: "success",
          summary: "Succès",
          detail: "SourceDeFinancement créé",
        });
      }
      //setFormVisible(false);
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
      message: "Voulez-vous supprimer ce programme définitivement ?",
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await deleteSourceDeFinancement(id);
          setAllSourceDeFinancement((s) =>
            s.filter((x) => Number(x.id) !== Number(id)),
          );
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

  const filtered = allSourceDeFinancement.filter((n) =>
    `${n.libelle}`.toLowerCase().includes(query.toLowerCase()),
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
          <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-100">
            <Users size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              SourceDeFinancement
            </h1>
            <p className="text-slate-500 font-medium font-sans">
              Répertoire des prestataires et partenaires
            </p>
          </div>
        </div>
        <Button
          label="Nouveau sourceDeFinancement"
          icon={<Plus size={20} className="mr-2" />}
          className="bg-blue-600 hover:bg-blue-700 text-white border-none px-6 py-3 rounded-xl shadow-lg transition-all shadow-blue-200"
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
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
            size={20}
          />
          <InputText
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
            placeholder="Rechercher par NIF, Sigle ou Raison Sociale..."
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
              <th className="px-6 py-4">Libélle</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                Date de création
              </th>
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
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg font-bold text-xs border border-blue-100 flex items-center gap-1 w-fit">
                    <Hash size={12} /> {n.libelle}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500 text-sm font-medium">
                  {n.createdAt
                    ? new Date(n.createdAt).toLocaleDateString("fr-FR")
                    : "-"}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
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
                      onClick={(e) => {
                        handleDelete(String(n.id)!);
                        e.stopPropagation();
                      }}
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
          <div className="p-12 flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-slate-400 font-medium">
              Récupération des données...
            </p>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="p-12 text-center">
            <Building2 size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-500 font-medium">
              Aucun source de financement trouvé
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

      <SourceDeFinancementForm
        visible={formVisible}
        onHide={() => setFormVisible(false)}
        onSubmit={handleAction}
        initial={editing || {}}
        title={
          editing ? "Modifier le source de financement" : "Nouveau partenaire"
        }
      />

      <SourceDeFinancementDetails
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        sourceDeFinancement={selected}
      />
    </Layout>
  );
}
