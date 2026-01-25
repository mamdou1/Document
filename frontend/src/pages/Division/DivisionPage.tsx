import { useEffect, useRef, useState } from "react";
import Layout from "../../components/layout/Layoutt";
import DivisionDetails from "./DivisionDetails";
import DivisionForm from "./DivisionForm";
import DivisionAjoutFonction from "./DivisionAjoutFonction";
import { Service, Division } from "../../interfaces";
import { confirmDialog } from "primereact/confirmdialog";
import {
  getAllDivision,
  createDivision,
  updateDivisionById,
  deleteDivisionById,
} from "../../api/division"; // À adapter si vous voulez un getAll
import { getAllServices } from "../../api/service";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import Pagination from "../../components/layout/Pagination";
import { InputText } from "primereact/inputtext";
import {
  Layers,
  Plus,
  Search,
  Eye,
  Pencil,
  PlusCircle,
  Building2,
  Trash2,
} from "lucide-react";

export default function DivisionPage() {
  const [allDivisions, setAllDivisions] = useState<Division[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [selected, setSelected] = useState<Division | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [ajoutFonctionVisible, setAjoutFonctionVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Partial<Division> | null>(null);
  const toast = useRef<Toast>(null);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchDivisions = async () => {
    setLoading(true);
    try {
      // Note: Vous pouvez créer une route getAllDivisions ou boucler.
      // Ici, on suppose une route /api/divisions qui retourne tout avec include Service
      const [div, serv] = await Promise.all([
        getAllDivision(),
        getAllServices(),
      ]);
      setAllDivisions(Array.isArray(div) ? div : []);
      setAllServices(Array.isArray(serv) ? serv : []);

      console.log("Services récupérés:", serv);
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

  const onEdit = async (payload: Partial<Service>) => {
    if (!editing?.id) return;
    try {
      const updated = await updateDivisionById(editing.id, payload);
      setAllDivisions((s) =>
        s.map((it) => (it.id === updated.id ? updated : it)),
      );
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
          await deleteDivisionById(id);
          setAllDivisions((s) => s.filter((x) => Number(x.id) !== Number(id)));
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

  useEffect(() => {
    fetchDivisions();
  }, []);

  const onCreate = async (payload: Partial<Division>) => {
    try {
      const saved = await createDivision(payload);
      setAllDivisions((s) => [saved, ...s]);
      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Division créé",
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

  const filtered = allDivisions.filter((d) =>
    d.libelle.toLowerCase().includes(query.toLowerCase()),
  );

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <Layout>
      <Toast ref={toast} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-blue-800 p-3 rounded-2xl text-white shadow-lg shadow-emerald-100">
            <Layers size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Divisions
            </h1>
            <p className="text-slate-500 font-medium">
              Gestion des pôles par service
            </p>
          </div>
        </div>
        <Button
          label="Nouvelle Division"
          icon={<Plus size={20} className="mr-2" />}
          className="bg-blue-600 hover:bg-blue-700 text-white border-none px-6 py-3 rounded-xl shadow-lg transition-all"
          onClick={() => setFormVisible(true)}
        />
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <div className="relative group max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
            size={20}
          />
          <InputText
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 outline-none"
            placeholder="Rechercher une division..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-widest">
              <th className="px-6 py-4">Division</th>
              <th className="px-6 py-4">Service de rattachement</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginated.map((d: any) => (
              <tr
                key={d.id}
                onClick={() => {
                  setSelected(d);
                  setDetailsVisible(true);
                }}
                className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
              >
                <td className="px-6 py-4 font-bold text-slate-700">
                  {d.libelle}
                </td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-2 text-slate-500 italic text-sm">
                    <Building2 size={14} /> {d.service?.libelle || "N/A"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        setSelected(d);
                        setDetailsVisible(true);
                      }}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-emerald-50 rounded-lg"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setSelected(d);
                        setAjoutFonctionVisible(true);
                      }}
                      className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                      title="Ajouter une fonction"
                    >
                      <PlusCircle size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        setEditing(d);
                        setFormVisible(true);
                        e.stopPropagation();
                      }}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        handleDelete(String(d.id)!);
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
      </div>

      <Pagination
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalItems={filtered.length}
        onPageChange={setCurrentPage}
      />
      <DivisionForm
        visible={formVisible}
        onHide={() => setFormVisible(false)}
        onSubmit={editing ? onEdit : onCreate}
        initial={editing || undefined}
        title={editing ? "Modifier le division" : "Créer un nouveau division"}
        service={allServices} // On passe la liste chargée ici
      />

      <DivisionAjoutFonction
        visible={ajoutFonctionVisible}
        onHide={() => setAjoutFonctionVisible(false)}
        division={selected}
      />
      <DivisionDetails
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        division={selected}
        services={allServices}
      />
    </Layout>
  );
}
