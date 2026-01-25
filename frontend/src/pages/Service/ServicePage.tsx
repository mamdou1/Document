import { useEffect, useRef, useState } from "react";
import Layout from "../../components/layout/Layoutt";
import ServiceDetails from "./ServiceDetails";
import ServiceForm from "./ServiceForm";
import ServiceAjoutFonction from "./ServiceAjoutFonction";
import { Service } from "../../interfaces";
import { confirmDialog } from "primereact/confirmdialog";

import {
  getAllServices,
  createService,
  updateServiceById,
  deleteServiceById,
} from "../../api/service";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import Pagination from "../../components/layout/Pagination";
import { InputText } from "primereact/inputtext";
import {
  Briefcase,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  PlusCircle,
} from "lucide-react";

export default function ServicePage() {
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [selected, setSelected] = useState<Service | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [ajoutFonctionVisible, setAjoutFonctionVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Partial<Service> | null>(null);
  const toast = useRef<Toast>(null);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await getAllServices();
      setAllServices(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Impossible de charger les services",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const onEdit = async (payload: Partial<Service>) => {
    if (!editing?.id) return;
    try {
      const updated = await updateServiceById(editing.id, payload);
      setAllServices((s) =>
        s.map((it) => (it.id === updated.id ? updated : it)),
      );
      console.log(updated);

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
          await deleteServiceById(id);
          setAllServices((s) => s.filter((x) => Number(x.id) !== Number(id)));
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

  const onCreate = async (payload: Partial<Service>) => {
    try {
      const data = await createService(payload);
      setAllServices((s) => [data, ...s]);
      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Service créé avec succès",
      });
      //setFormVisible(false);
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Opération échouée",
      });
    }
  };

  const filtered = allServices.filter((s) =>
    s.libelle.toLowerCase().includes(query.toLowerCase()),
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
          <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-100">
            <Briefcase size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Services
            </h1>
            <p className="text-slate-500 font-medium">
              Gestion des directions et départements
            </p>
          </div>
        </div>
        <Button
          label="Nouveau Service"
          icon={<Plus size={20} className="mr-2" />}
          className="bg-indigo-600 hover:bg-indigo-700 text-white border-none px-6 py-3 rounded-xl shadow-lg transition-all"
          onClick={() => setFormVisible(true)}
        />
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <div className="relative group max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
            size={20}
          />
          <InputText
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none"
            placeholder="Rechercher un service..."
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
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Libellé du Service</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginated.map((s) => (
              <tr
                key={s.id}
                onClick={() => {
                  setSelected(s);
                  setDetailsVisible(true);
                }}
                className="hover:bg-indigo-50/30 transition-all group cursor-pointer"
              >
                <td className="px-6 py-4">
                  <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono text-xs">
                    #{s.id}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-slate-700">
                  {s.libelle}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(s);
                        setAjoutFonctionVisible(true);
                      }}
                      className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                      title="Ajouter une fonction"
                    >
                      <PlusCircle size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setSelected(s);
                        setDetailsVisible(true);
                      }}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        setEditing(s);
                        setFormVisible(true);
                        e.stopPropagation();
                      }}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        handleDelete(String(s.id)!);
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
          <div className="p-12 text-center text-slate-400">Chargement...</div>
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
      <ServiceForm
        visible={formVisible}
        onHide={() => setFormVisible(false)}
        onSubmit={editing ? onEdit : onCreate}
        initial={editing || undefined}
        title={editing ? "Modifier le service" : "Créer un nouveau service"}
      />
      <ServiceDetails
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        service={selected}
      />
      <ServiceAjoutFonction
        visible={ajoutFonctionVisible}
        onHide={() => setAjoutFonctionVisible(false)}
        service={selected}
        onSuccess={() => {
          toast.current?.show({
            severity: "success",
            summary: "Succès",
            detail: "Fonction ajoutée au service",
          });
        }}
      />
    </Layout>
  );
}
