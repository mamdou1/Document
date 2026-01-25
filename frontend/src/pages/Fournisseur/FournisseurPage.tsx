import { useEffect, useRef, useState } from "react";
import Layout from "../../components/layout/Layoutt";
import FournisseurDetails from "./FournisseurDetails";
import FournsseurForm from "./FournisseurForm";
import type { Fournisseur } from "../../interfaces";
import { confirmDialog } from "primereact/confirmdialog";
import {
  getFournisseurs,
  createFournisseur,
  updateFournisseur,
  deleteFournisseur,
} from "../../api/fournisseur";
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
  Phone,
  MapPin,
  Hash,
  Trash2,
} from "lucide-react";

export default function FournisseurPage() {
  const [allFournisseur, setAllFournisseur] = useState<Fournisseur[]>([]);
  const [selected, setSelected] = useState<Fournisseur | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<Partial<Fournisseur> | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const affichage = async () => {
    setLoading(true);
    try {
      const data = await getFournisseurs();
      setAllFournisseur(data.fournisseur);
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

  const handleAction = async (payload: Partial<Fournisseur>) => {
    try {
      if (editing?.id) {
        const update = await updateFournisseur(payload, editing.id);
        setAllFournisseur((s) =>
          s.map((g) => (g.id === update.id ? update : g)),
        );
        toast.current?.show({
          severity: "success",
          summary: "Succès",
          detail: "Fournisseur mis à jour",
        });
      } else {
        const saved = await createFournisseur(payload);
        setAllFournisseur((s) => [saved, ...s]);
        toast.current?.show({
          severity: "success",
          summary: "Succès",
          detail: "Fournisseur créé",
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
          await deleteFournisseur(id);
          setAllFournisseur((s) =>
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

  const filtered = allFournisseur.filter((n) =>
    `${n.NIF} ${n.sigle} ${n.raisonSocial}`
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
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-100">
            <Users size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Fournisseurs
            </h1>
            <p className="text-slate-500 font-medium font-sans">
              Répertoire des prestataires et partenaires
            </p>
          </div>
        </div>
        <Button
          label="Nouveau fournisseur"
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
              <th className="px-6 py-4">Identification</th>
              <th className="px-6 py-4">Entreprise</th>
              <th className="px-6 py-4">Secteur d'activité</th>
              <th className="px-6 py-4">Coordonnées</th>
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
                    <Hash size={12} /> {n.NIF}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-700">{n.sigle}</span>
                    <span className="text-xs text-slate-400 truncate max-w-[200px]">
                      {n.raisonSocial}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg font-bold text-xs border border-blue-100 flex items-center gap-1 w-fit">
                    {/* <Hash size={12} />*/}{" "}
                    {n.secteurActivite || "Non spécifier"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone size={14} className="text-slate-400" /> {n.numero}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                      <MapPin size={12} /> {n.adresse}
                    </div>
                  </div>
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
              Aucun fournisseur trouvé
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

      <FournsseurForm
        visible={formVisible}
        onHide={() => setFormVisible(false)}
        onSubmit={handleAction}
        initial={editing || {}}
        title={editing ? "Modifier le fournisseur" : "Nouveau partenaire"}
        fournisseur={allFournisseur}
      />

      <FournisseurDetails
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        fournisseur={selected}
      />
    </Layout>
  );
}
