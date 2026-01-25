import { useEffect, useRef, useState } from "react";
import Layout from "../../components/layout/Layoutt";
import TypeForm from "./TypeForm";
import TypeDetails from "./TypeDetails";
import TypeAjoutPieces from "./TypeAjoutPieces";
import type {
  Pieces,
  Type,
  AddPiecesToTypePayload,
  CreateTypePayload,
} from "../../interfaces";
import {
  getType,
  createType,
  addPiecesToType,
  deleteType,
} from "../../api/type";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import Pagination from "../../components/layout/Pagination";
import { getPieces } from "../../api/pieces";
import {
  FolderTree,
  Search,
  Plus,
  Eye,
  Pencil,
  FilePlus,
  Trash2,
} from "lucide-react";
import { confirmDialog } from "primereact/confirmdialog";

export default function TypePage() {
  const [allType, setAllType] = useState<Type[]>([]);
  const [pieces, setPieces] = useState<Pieces[]>([]);
  const [selected, setSelected] = useState<Type | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [formPiecesVisible, setFormPiecesVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const affichage = async () => {
    setLoading(true);
    try {
      const [t, p] = await Promise.all([getType(), getPieces()]);
      setAllType(
        Array.isArray(t.type)
          ? t.type.map((x: any) => ({
              id: x.id,
              codeType: x.codeType, // ✅ déjà bon
              nom: x.nom,
              pieces: x.Pieces || [], // ✅ mapping clé correcte
              createdAt: x.createdAt,
              updatedAt: x.updatedAt,
            }))
          : [],
      );
      console.log("🧪 TYPES :", t.type);

      setPieces(Array.isArray(p) ? p : []);
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Impossible de charger",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    affichage();
  }, []);

  const onCreate = async (payload: CreateTypePayload) => {
    try {
      const saved = await createType(payload);
      setAllType((s) => [saved, ...s]);
      toast.current?.show({
        severity: "success",
        summary: "OK",
        detail: "Type de dossier créée",
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

  const onAddPieces = async (
    typeId: string,
    payload: AddPiecesToTypePayload,
  ) => {
    try {
      await addPiecesToType(typeId, payload);

      toast.current?.show({
        severity: "success",
        summary: "OK",
        detail: "Pièces ajoutées avec succès",
      });

      // 🔄 Recharger la liste complète
      affichage();

      setFormPiecesVisible(false);
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: err?.response?.data?.message || "Erreur ajout pièces",
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
          await deleteType(id);
          setAllType((s) => s.filter((x) => Number(x.id) !== Number(id)));
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

  const filtered = allType.filter(
    (n) =>
      n &&
      typeof n.codeType === "string" &&
      (n.codeType + " " + n.nom).toLowerCase().includes(query.toLowerCase()),
  );

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <Layout>
      <Toast ref={toast} />

      {/* Header avec Statistiques simples */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-blue-800 p-3 rounded-2xl text-white shadow-lg shadow-blue-100">
            <FolderTree size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Types de Dossier
            </h1>
            <p className="text-slate-500 font-medium">
              Configuration des structures de liquidation
            </p>
          </div>
        </div>
        <Button
          label="Nouveau type"
          icon={<Plus size={20} className="mr-2" />}
          className="bg-blue-700 hover:bg-blue-800 text-white border-none px-6 py-3 rounded-xl shadow-lg transition-all"
          onClick={() => {
            setSelected(null);
            setFormVisible(true);
          }}
        />
      </div>

      {/* Barre de recherche optimisée */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <div className="relative group max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
            size={20}
          />
          <input
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-600/10 transition-all outline-none border focus:border-blue-400"
            placeholder="Rechercher un type ou un code..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table de données style moderne */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-widest">
              <th className="px-6 py-4">Code</th>
              <th className="px-6 py-4">Désignation du dossier</th>
              <th className="px-6 py-4">Pièces Requises</th>
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
                <td className="px-6 py-4 font-mono text-sm font-bold text-blue-700">
                  {n.codeType}
                </td>
                <td className="px-6 py-4 font-semibold text-slate-700">
                  {n.nom}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-bold">
                      {n.pieces?.length || 0}
                    </span>
                    <span className="text-xs text-slate-400 font-medium italic truncate max-w-[200px]">
                      {n.pieces?.length > 0 ? "Configuré" : "Aucune pièce"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      title="Ajouter des pièces"
                      onClick={(e) => {
                        setSelected(n);
                        setFormPiecesVisible(true);
                        e.stopPropagation();
                      }}
                      className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                      <FilePlus size={18} />
                    </button>
                    <button
                      title="Voir détails"
                      onClick={() => {
                        setSelected(n);
                        setDetailsVisible(true);
                      }}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      title="Modifier"
                      onClick={(e) => {
                        setSelected(n);
                        setFormVisible(true);
                        e.stopPropagation();
                      }}
                      className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
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
      </div>

      <div className="mt-6">
        <Pagination
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filtered.length}
          onPageChange={setCurrentPage}
        />
      </div>

      <TypeAjoutPieces
        visible={formPiecesVisible}
        onHide={() => setFormPiecesVisible(false)}
        onSubmit={onAddPieces}
        initial={selected}
        title={"Ajouter des pièces au dossier"}
        pieces={pieces}
      />
      <TypeForm
        visible={formVisible}
        onHide={() => setFormVisible(false)}
        onSubmit={onCreate}
        initial={selected ?? undefined}
        title={"Ajouter Type de dossier"}
        pieces={pieces}
      />
      <TypeDetails
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        type={selected}
      />
    </Layout>
  );
}
