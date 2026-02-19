import { useEffect, useRef, useState } from "react";
import Layout from "../../components/layout/Layoutt";
import SiteDetails from "./SiteDetails";
import SiteForm from "./SiteForm";
import type { Site } from "../../interfaces";
import { confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import Pagination from "../../components/layout/Pagination";
import { getSites, createSite, updateSite, deleteSite } from "../../api/site";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Hash,
  MapPinned,
} from "lucide-react";

export default function SitePage() {
  const [allSite, setAllSite] = useState<Site[]>([]);
  const [selected, setSelected] = useState<Site | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<Partial<Site> | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchSites = async () => {
    setLoading(true);
    try {
      const data = await getSites();
      setAllSite(Array.isArray(data) ? data : data.salle || []);
    } catch (err) {
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
    fetchSites();
  }, []);

  const handleAction = async (payload: any) => {
    try {
      if (editing?.id) {
        const updated = await updateSite(editing.id, payload);
        setAllSite((prev) =>
          prev.map((s) => (s.id === updated.id ? updated : s)),
        );
        toast.current?.show({
          severity: "success",
          summary: "Succès",
          detail: "Site mise à jour",
        });
      } else {
        const saved = await createSite(payload);
        setAllSite((prev) => [saved, ...prev]);
        toast.current?.show({
          severity: "success",
          summary: "Succès",
          detail: "Site créée",
        });
      }
      setFormVisible(false);
      fetchSites();
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Opération échouée",
      });
    }
  };

  const handleDelete = async (id: string) => {
    confirmDialog({
      message:
        "Voulez-vous supprimer ce site définitivement ? Cette action est irréversible.",
      header: "Confirmation",
      icon: "pi pi-info-circle", // Icône plus neutre, ou gardez pi-exclamation-triangle

      // --- Personnalisation des labels ---
      acceptLabel: "Supprimer",
      rejectLabel: "Annuler",

      // --- Styling des boutons ---
      // Ajout de classes de mise en page (flexbox) et de style
      acceptClassName: "p-button-danger p-button-raised p-button-rounded p-2",
      rejectClassName:
        "p-button-secondary p-button-outlined p-button-rounded mr-4 p-2",

      // --- Style du dialogue lui-même (optionnel) ---
      style: { width: "450px" },
      accept: async () => {
        try {
          await deleteSite(id);
          setAllSite((prev) => prev.filter((s) => s.id !== id));
          toast.current?.show({
            severity: "success",
            summary: "Supprimé",
            detail: "Site retirée",
          });
        } catch (err) {
          toast.current?.show({
            severity: "error",
            summary: "Erreur",
            detail: "Suppression impossible",
          });
        }
      },
    });
  };

  const filtered = allSite.filter((s) =>
    `${s.nom} ${s.adresse}`.toLowerCase().includes(query.toLowerCase()),
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
          <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-lg shadow-emerald-100">
            <MapPinned size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Sites d' <span className="text-emerald-600">Archivage</span>
            </h1>
            <p className="text-slate-500 font-medium font-sans">
              Organisation des espaces de stockage
            </p>
          </div>
        </div>
        <Button
          label="Nouveau site"
          icon={<Plus size={20} className="mr-2" />}
          className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-6 py-3 rounded-xl shadow-lg transition-all shadow-emerald-200"
          onClick={() => {
            setEditing(null);
            setFormVisible(true);
          }}
        />
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex justify-between items-center">
        <div className="relative group max-w-md w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
            size={20}
          />
          <InputText
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Rechercher un site..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-widest">
              <th className="px-6 py-4">Nom du Site</th>
              <th className="px-6 py-4">Adresse / Localisation</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginated.map((s) => (
              <tr
                key={s.id}
                className="cursor-pointer hover:bg-emerald-50/30 transition-all group"
                onClick={() => {
                  setSelected(s);
                  setDetailsVisible(true);
                }}
              >
                {/* Nom */}
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-slate-700">
                    {s.nom}
                  </span>
                </td>

                {/* Adresse stylisée comme un "Code" */}
                <td className="px-6 py-4">
                  <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg font-bold text-xs border border-emerald-100 flex items-center gap-1 w-fit">
                    <Hash size={12} /> {s.adresse}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        setSelected(s);
                        setDetailsVisible(true);
                      }}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Voir détails"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setEditing(s);
                        setFormVisible(true);
                      }}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                      title="Modifier"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(String(s.id))}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && filtered.length === 0 && (
          <div className="p-20 text-center">
            <MapPinned size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-500 font-medium">Aucun site trouvé</p>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-center">
        <Pagination
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filtered.length}
          onPageChange={setCurrentPage}
        />
      </div>

      <SiteForm
        visible={formVisible}
        onHide={() => setFormVisible(false)}
        onSubmit={handleAction}
        initial={editing || {}}
      />
      <SiteDetails
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        site={selected}
      />
    </Layout>
  );
}
