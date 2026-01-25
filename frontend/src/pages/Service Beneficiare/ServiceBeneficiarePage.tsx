import { useEffect, useRef, useState } from "react";
import Layout from "../../components/layout/Layoutt";
import ServiceBeneficiareDetails from "./ServiceBeneficiareDetails";
import ServiceBeneficiareForm from "./ServiceBeneficiareForm";
import type { ServiceBeneficiaire } from "../../interfaces";
import {
  getServiceBeneficiaire,
  createServiceBeneficiaire,
  updateServiceBeneficiaire,
  deleteServiceBeneficiare,
} from "../../api/serviceBeneficiaire";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import Pagination from "../../components/layout/Pagination";
import {
  Landmark,
  Plus,
  Search,
  Eye,
  Pencil,
  MapPin,
  Trash2,
} from "lucide-react";
import { confirmDialog } from "primereact/confirmdialog";

export default function ServiceBeneficiarePage() {
  const [allServiceBeneficiaire, setAllServiceBeneficiaire] = useState<
    ServiceBeneficiaire[]
  >([]);
  const [selected, setSelected] = useState<ServiceBeneficiaire | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<Partial<ServiceBeneficiaire> | null>(
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
      const data = await getServiceBeneficiaire();
      setAllServiceBeneficiaire(
        Array.isArray(data.serviceBeneficiaire) ? data.serviceBeneficiaire : [],
      );
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

  const onCreate = async (payload: Partial<ServiceBeneficiaire>) => {
    try {
      const saved = await createServiceBeneficiaire(payload);
      setAllServiceBeneficiaire((s) => [saved, ...s]);
      toast.current?.show({
        severity: "success",
        summary: "OK",
        detail: "Nature créée",
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

  const onEdit = async (payload: Partial<ServiceBeneficiaire>) => {
    if (!editing || !editing.id) return;

    try {
      const update = await updateServiceBeneficiaire(payload, editing.id);

      setAllServiceBeneficiaire((s) =>
        s.map((g) => (g.id === update.id ? update : g)),
      );
      toast.current?.show({
        severity: "success",
        summary: "Ok",
        detail: "Pièce mis à jour avec succès.",
      });
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail:
          err?.response?.data?.message || "Erreur lors de la modification",
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
          await deleteServiceBeneficiare(id);
          setAllServiceBeneficiaire((s) =>
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

  // Filtrage intelligent
  const filtered = allServiceBeneficiaire.filter((n) =>
    `${n.codeService} ${n.sigle} ${n.libelle}`
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
          <div className="bg-blue-800 p-3 rounded-2xl text-white shadow-lg shadow-blue-100">
            <Landmark size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Services Bénéficiaires
            </h1>
            <p className="text-slate-500 font-medium">
              Gestion des entités et départements internes
            </p>
          </div>
        </div>
        <Button
          label="Nouveau service"
          icon={<Plus size={20} className="mr-2" />}
          className="bg-indigo-600 hover:bg-indigo-700 text-white border-none px-6 py-3 rounded-xl shadow-lg transition-all shadow-indigo-200"
          onClick={() => {
            setEditing(null);
            setFormVisible(true);
          }}
        />
      </div>

      {/* Barre de recherche */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <div className="relative group max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
            size={20}
          />
          <InputText
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
            placeholder="Rechercher par code ou sigle..."
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
              <th className="px-6 py-4">Code & Sigle</th>
              <th className="px-6 py-4">Désignation</th>
              <th className="px-6 py-4">Localisation</th>
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
                className="cursor-pointer hover:bg-indigo-50/30 transition-all group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md font-bold text-xs border border-indigo-100 uppercase">
                      {n.codeService}
                    </span>
                    <span className="font-bold text-slate-700">{n.sigle}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                  {n.libelle}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <MapPin size={14} /> {n.adresse || "Non renseignée"}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        setSelected(n);
                        setDetailsVisible(true);
                      }}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        setEditing(n);
                        setFormVisible(true);
                        e.stopPropagation();
                      }}
                      className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
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
          <div className="p-10 text-center text-slate-400">
            Chargement en cours...
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="p-12 text-center text-slate-500 font-medium">
            Aucun service trouvé.
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

      <ServiceBeneficiareForm
        visible={formVisible}
        onHide={() => setFormVisible(false)}
        onSubmit={editing ? onEdit : onCreate}
        initial={editing || {}}
        title={editing ? "Modifier le Service" : "Ajouter un Service"}
      />

      <ServiceBeneficiareDetails
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        serviceBeneficiaire={selected}
      />
    </Layout>
  );
}
