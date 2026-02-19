import { useEffect, useRef, useState } from "react";
import Layout from "../../../components/layout/Layoutt";
import EntiteeTroisDetails from "./EntiteeTroisDetails";
import EntiteeTroisForm from "./EntiteeTroisForm";
import EntiteeTroisAjoutFonction from "./EntiteeTroisAjoutFonction";
import { EntiteeDeux, EntiteeTrois } from "../../../interfaces";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import Pagination from "../../../components/layout/Pagination";
import { InputText } from "primereact/inputtext";
import { confirmDialog } from "primereact/confirmdialog";
import {
  getAllEntiteeTrois,
  createEntiteeTrois,
  updateEntiteeTroisById,
  deleteEntiteeTroisById,
} from "../../../api/entiteeTrois";
import { getAllEntiteeDeux } from "../../../api/entiteeDeux";
import {
  GitMerge,
  Plus,
  Search,
  Eye,
  PlusCircle,
  Layers,
  Trash2,
  Pencil,
} from "lucide-react";

export default function EntiteeTroisPage() {
  const [allEntiteeTrois, setAllEntiteeTrois] = useState<EntiteeTrois[]>([]);
  const [selected, setSelected] = useState<EntiteeTrois | null>(null);
  const [allEntiteeDeux, setAllEntiteeDeux] = useState<EntiteeDeux[]>([]);

  const [formVisible, setFormVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [ajoutFonctionVisible, setAjoutFonctionVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Partial<EntiteeTrois> | null>(null);

  const toast = useRef<Toast>(null);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchEntiteeTrois = async () => {
    setLoading(true);
    try {
      const [sec, div] = await Promise.all([
        getAllEntiteeTrois(),
        getAllEntiteeDeux(),
      ]);
      setAllEntiteeTrois(Array.isArray(sec) ? sec : []);
      setAllEntiteeDeux(Array.isArray(div) ? div : []);
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
    fetchEntiteeTrois();
  }, []);

  const onEdit = async (payload: Partial<EntiteeTrois>) => {
    if (!editing?.id) return;
    try {
      const updated = await updateEntiteeTroisById(editing.id, payload);
      setAllEntiteeTrois((s) =>
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
      message: `Voulez-vous supprimer ${allEntiteeTrois[0]?.titre} définitivement cet élément ? Cette action est irréversible.`,
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
          await deleteEntiteeTroisById(id);
          setAllEntiteeTrois((s) =>
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

  const onCreate = async (payload: Partial<EntiteeTrois>) => {
    try {
      const saved = await createEntiteeTrois(payload);
      setAllEntiteeTrois((s) => [saved, ...s]);
      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: `${allEntiteeTrois[0]?.titre} créé`,
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

  // Filtrage :
  // 1. On exclut les éléments où le code ET le libellé sont absents (null ou vide)
  // 2. On applique la recherche sur le libellé
  const filtered = allEntiteeTrois.filter((s) => {
    // Vérifie si l'élément est valide (a au moins un code ou un libellé)
    const isPopulated = s.code !== null && s.libelle !== null;

    if (!isPopulated) return false;

    // Applique la recherche textuelle
    return (s.libelle || s.code || "")
      .toLowerCase()
      .includes(query.toLowerCase());
  });

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <Layout>
      <Toast ref={toast} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-500 p-3 rounded-2xl text-white shadow-lg shadow-orange-100">
            <GitMerge size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              {allEntiteeTrois[0]?.titre}
            </h1>
            <p className="text-slate-500 font-medium">
              Gestion des unités de base
            </p>
          </div>
        </div>
        <Button
          label={`Nouvelle ${allEntiteeTrois[0]?.titre} `}
          icon={<Plus size={20} className="mr-2" />}
          className="bg-emerald-500 hover:bg-emerald-600 text-white border-none px-6 py-3 rounded-xl shadow-lg transition-all"
          onClick={() => setFormVisible(true)}
        />
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <div className="relative group max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
            size={20}
          />
          <InputText
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:ring-4 focus:ring-orange-500/10 outline-none"
            placeholder={`Rechercher une ${allEntiteeTrois[0]?.titre} ...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-widest">
              <th className="px-6 py-4">Code {allEntiteeTrois[0]?.titre} </th>
              <th className="px-6 py-4">
                Unité / {allEntiteeTrois[0]?.titre}{" "}
              </th>
              <th className="px-6 py-4">{allEntiteeDeux[0]?.titre} Parente</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginated.map((d) => (
              <tr
                key={d.id}
                onClick={() => {
                  setSelected(d);
                  setDetailsVisible(true);
                }}
                className="hover:bg-orange-50/30 transition-all group cursor-pointer"
              >
                <td className="px-6 py-4 font-mono text-sm font-bold text-emerald-700">
                  {d.code || "---"}
                </td>
                <td className="px-6 py-4 font-bold text-slate-700">
                  {d.libelle}
                </td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-2 text-slate-500 italic text-sm">
                    <Layers size={14} /> {d.entitee_deux?.libelle || "N/A"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        setSelected(d);
                        setDetailsVisible(true);
                      }}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-orange-50 rounded-lg"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        setSelected(d);
                        setAjoutFonctionVisible(true);
                        e.stopPropagation();
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
      <EntiteeTroisForm
        visible={formVisible}
        onHide={() => setFormVisible(false)}
        onSubmit={editing ? onEdit : onCreate}
        refresh={fetchEntiteeTrois}
        initial={editing || undefined}
        title={editing ? "Modifier le division" : "Créer un nouveau division"}
        entiteeDeux={allEntiteeDeux}
      />
      <EntiteeTroisAjoutFonction
        visible={ajoutFonctionVisible}
        onHide={() => setAjoutFonctionVisible(false)}
        entiteeTrois={selected}
        refresh={fetchEntiteeTrois}
      />
      <EntiteeTroisDetails
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        entiteeTrois={selected}
      />
    </Layout>
  );
}
