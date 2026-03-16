import { useEffect, useRef, useState } from "react";
import Layout from "../../components/layout/Layoutt";
import DroitDetails from "./DroitDetails";
import DroitForm from "./DroitForm";
import DroitPermissionForm from "./DroitPermissionForm";
import type { Droit } from "../../interfaces";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { confirmDialog } from "primereact/confirmdialog";
import Pagination from "../../components/layout/Pagination";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  CalendarDays,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Boxes } from "lucide-react";

// ✅ IMPORTER LES NOUVEAUX HOOKS
import {
  useDroits,
  useCreateDroit,
  useUpdateDroit,
  useDeleteDroit,
} from "../../hooks/useDroits";

export default function DroitPage() {
  const toast = useRef<Toast>(null);

  // ✅ ÉTAT 1: Remplacer useState par useDroits
  const { data: allDroits = [], isLoading, error, refetch } = useDroits();

  // ✅ ÉTAT 2: Remplacer les mutations
  const createMutation = useCreateDroit();
  const updateMutation = useUpdateDroit();
  const deleteMutation = useDeleteDroit();

  // États UI (inchangés)
  const [selected, setSelected] = useState<Droit | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [editing, setEditing] = useState<Partial<Droit> | null>(null);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [permissionModal, setPermissionModal] = useState(false);
  const [selectedDroitId, setSelectedDroitId] = useState<number | null>(null);

  // ✅ PLUS BESOIN DE LA FONCTION load() NI DE useEffect !

  // ✅ ÉTAPE 3: Remplacer onCreate
  const onCreate = async (payload: Partial<Droit>) => {
    try {
      await createMutation.mutateAsync(payload);
      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Droit créé avec succès",
      });
      setFormVisible(false);
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: err?.response?.data?.message || "Erreur création",
      });
    }
  };

  // ✅ ÉTAPE 4: Remplacer onEdit
  const onEdit = async (payload: Partial<Droit>) => {
    if (!editing || !editing.id) return;
    try {
      await updateMutation.mutateAsync({
        id: String(editing.id),
        data: payload,
      });
      toast.current?.show({
        severity: "success",
        summary: "Mis à jour",
        detail: "Droit a été modifié",
      });
      setEditing(null);
      setFormVisible(false);
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: err?.response?.data?.message || "Erreur maj",
      });
    }
  };

  // ✅ ÉTAPE 5: Remplacer handleDelete
  const handleDelete = async (id: string) => {
    confirmDialog({
      message:
        "Voulez-vous supprimer ce profil définitivement ? Cette action est irréversible.",
      header: "Confirmation",
      icon: "pi pi-info-circle",
      acceptLabel: "Supprimer",
      rejectLabel: "Annuler",
      acceptClassName: "p-button-danger p-button-raised p-button-rounded p-2",
      rejectClassName:
        "p-button-secondary p-button-outlined p-button-rounded mr-4 p-2",
      style: { width: "450px" },
      accept: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          toast.current?.show({
            severity: "success",
            summary: "Supprimé",
            detail: "Droit supprimé",
          });
        } catch (err: any) {
          toast.current?.show({
            severity: "error",
            summary: "Erreur",
            detail: "Impossible de supprimer",
          });
        }
      },
    });
  };

  // Filtrer et paginer (inchangé)
  const filtered = allDroits.filter((d) =>
    String(d.libelle).toLowerCase().includes(query.toLowerCase().trim()),
  );

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // ✅ ÉTAPE 6: Gérer les états de chargement/erreur
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center text-red-600 p-8">
          <XCircle size={48} className="mx-auto mb-4" />
          <p>Erreur de chargement: {error.message}</p>
          <Button
            label="Réessayer"
            onClick={() => refetch()}
            className="mt-4"
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Toast ref={toast} />

      {/* Header de Page (inchangé) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-emerald-800 p-3 rounded-2xl text-white shadow-lg shadow-emerald-100">
              <Boxes size={26} />
            </div>
            <h1 className="text-3xl font-extrabold text-emerald-900 tracking-tight">
              Profils
            </h1>
          </div>
          <p className="text-slate-500 font-medium ml-14">
            Dans cet interface géré les authorisation
          </p>
        </div>

        <Button
          onClick={() => {
            setEditing(null);
            setFormVisible(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-6 py-3 rounded-2xl shadow-lg shadow-emerald-200 transition-all flex items-center gap-2 group"
        >
          <Plus
            size={20}
            className="group-hover:rotate-90 transition-transform"
          />
          <span className="font-bold">Nouveau profil</span>
        </Button>
      </div>

      {/* Barre d'outils / Filtres (inchangé) */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex items-center">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-sm"
            placeholder="Rechercher un type d'autorisation..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table Section (inchangé) */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                Libéllé
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                Date de création
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginated.length > 0 ? (
              paginated.map((dr) => (
                <tr
                  key={dr.id}
                  onClick={() => {
                    setSelected(dr);
                    setDetailsVisible(true);
                  }}
                  className=" hover:bg-emerald-50/30 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <CalendarDays size={18} />
                      </div>
                      <span className="font-bold text-slate-700 text-lg">
                        {dr.libelle}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm font-medium">
                    {dr.createdAt
                      ? new Date(dr.createdAt).toLocaleDateString("fr-FR")
                      : "-"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelected(dr);
                          setDetailsVisible(true);
                        }}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                        title="Voir détails"
                      >
                        <Eye size={20} />
                      </button>
                      <button
                        onClick={(e) => {
                          setEditing(dr);
                          setFormVisible(true);
                          e.stopPropagation();
                        }}
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                        title="Modifier"
                      >
                        <Pencil size={20} />
                      </button>
                      <button
                        onClick={(e) => {
                          setSelectedDroitId(dr.id as any);
                          setPermissionModal(true);
                          e.stopPropagation();
                        }}
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                        title="Permissions"
                      >
                        <ShieldCheck size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          handleDelete(dr.id!);
                          e.stopPropagation();
                        }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Supprimer"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-12 text-center text-slate-400"
                >
                  Aucun droit trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Container (inchangé) */}
      <div className="mt-6 flex justify-center">
        <Pagination
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filtered.length}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modals (inchangés) */}
      <DroitForm
        visible={formVisible}
        onHide={() => setFormVisible(false)}
        onSubmit={editing ? onEdit : onCreate}
        //refresh={load} // ✅ PLUS BESOIN de refresh !
        initial={editing || undefined}
        title={
          editing
            ? "Modifier l'autorisation"
            : "Ajouter une nouvelle autorisation"
        }
      />

      <DroitDetails
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        droit={selected}
      />

      <DroitPermissionForm
        visible={permissionModal}
        droitId={selectedDroitId}
        onHide={() => {
          setPermissionModal(false);
          refetch(); // ✅ Recharger après modification des permissions
        }}
      />
    </Layout>
  );
}
