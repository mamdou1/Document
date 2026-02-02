import { useEffect, useRef, useState } from "react";
import Layout from "../../components/layout/Layoutt";
import PiecesForm from "./PiecesForm";
import PiecesDetails from "./PiecesDetails";
import type { Pieces, Division } from "../../interfaces";
import {
  getPieces,
  createPieces,
  updatedPieces,
  deletePieceById,
} from "../../api/pieces";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import Pagination from "../../components/layout/Pagination";
import {
  FileText,
  Plus,
  Search,
  Eye,
  Pencil,
  FileStack,
  Layers,
  Trash2,
} from "lucide-react";
import { getAllDivision } from "../../api/division";
import { confirmDialog } from "primereact/confirmdialog";
import { Dropdown } from "primereact/dropdown";

export default function PiecesPage() {
  const [allPieces, setAllPieces] = useState<Pieces[]>([]);
  const [selected, setSelected] = useState<Pieces | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<Partial<Pieces> | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [allDivisions, setAllDivisions] = useState<Division[]>([]);
  // --- NOUVEAUX ÉTATS POUR LE FILTRE ---
  const [selectedDivision, setSelectedDivision] = useState<any>(null);
  const [divisions, setDivisions] = useState<any[]>([]);

  const affichage = async () => {
    setLoading(true);
    try {
      const [p, div] = await Promise.all([getPieces(), getAllDivision()]);
      setAllPieces(Array.isArray(p) ? p : []);
      setAllDivisions(Array.isArray(div) ? div : []);

      // Remplir le dropdown (optionnel : ajouter l'option "Toutes")
      if (Array.isArray(div)) {
        setDivisions(div);
      }
      // console.log("Les pièces:", p);
      // console.log("diviSIon: ", div);
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

  const onCreate = async (payload: Partial<Pieces>) => {
    try {
      const saved = await createPieces(payload);
      setAllPieces((s) => [saved, ...s]);
      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Pièce de pièce créée",
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

  const onEdit = async (payload: Partial<Pieces>) => {
    if (!editing || !editing.id) return;
    try {
      const update = await updatedPieces(payload, editing.id);
      setAllPieces((s) => s.map((g) => (g.id === update.id ? update : g)));
      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Pièce mise à jour avec succès.",
      });
      setFormVisible(false);
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
      message: "Voulez-vous supprimer cet pieces définitivement ?",
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await deletePieceById(id);
          setAllPieces((s) => s.filter((x) => Number(x.id) !== Number(id)));
          toast.current?.show({
            severity: "success",
            summary: "Supprimé",
            detail: "Pieces supprimé",
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

  // --- LOGIQUE DE FILTRAGE UNIFIÉE ---
  const filteredData = allPieces.filter((p) => {
    // 1. Filtre par recherche textuelle
    const matchesSearch = `${p.code_pieces} ${p.libelle} ${p.division?.libelle}`
      .toLowerCase()
      .includes(query.toLowerCase());

    // 2. Filtre par division
    const matchesDivision = selectedDivision
      ? p.division?.id === selectedDivision
      : true;

    return matchesSearch && matchesDivision;
  });

  // Utilise filteredData pour la pagination
  const paginated = filteredData.slice(
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
            <FileStack size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Types de Pièces
            </h1>
            <p className="text-slate-500 font-medium">
              Référentiel des pièces justificatives de liquidation
            </p>
          </div>
        </div>
        <Button
          label="Nouvelle pièce"
          icon={<Plus size={20} className="mr-2" />}
          className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-6 py-3 rounded-xl shadow-lg transition-all shadow-emerald-200"
          onClick={() => {
            setEditing(null);
            setFormVisible(true);
          }}
        />
      </div>

      {/* Recherche et Filtre */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative group max-w-md w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
            size={20}
          />
          <InputText
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
            placeholder="Rechercher..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1);
            }} // Reset page on search
          />
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <Dropdown
            value={selectedDivision}
            options={allDivisions} // Utilise directement allDivisions
            onChange={(e) => {
              setSelectedDivision(e.value);
              setCurrentPage(1);
            }} // Reset page on filter
            optionLabel="libelle"
            optionValue="id"
            placeholder="Toutes les divisions"
            className="w-full md:w-64 border border-slate-200 bg-slate-50 rounded-xl shadow-sm"
            showClear={!!selectedDivision}
          />
          <div className="hidden lg:block text-sm text-slate-400 font-medium whitespace-nowrap">
            <span className="text-emerald-600 font-bold">
              {filteredData.length}
            </span>{" "}
            résultats
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-widest">
              <th className="px-6 py-4">Code Référence</th>
              <th className="px-6 py-4">Désignation du type de pièce</th>
              <th className="px-6 py-4">Structure Producteur</th>
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
                className="cursor-pointer hover:bg-emerald-50/30 transition-all group"
              >
                <td className="px-6 py-4">
                  <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg font-mono font-bold text-xs border border-emerald-100">
                    {n.code_pieces}
                  </span>
                </td>
                <td className="px-6 py-4 font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <FileText
                      size={16}
                      className="text-slate-300 group-hover:text-emerald-400 transition-colors"
                    />
                    {n.libelle}
                  </div>
                </td>
                <td className="p-6 text-slate-600 font-medium">
                  <div className="flex flex-wrap gap-1 max-w-[300px]">
                    {/* Utilisation de listes nommées pour garantir des clés uniques */}
                    {(n.entites_un?.length || 0) +
                      (n.entites_deux?.length || 0) +
                      (n.entites_trois?.length || 0) >
                    0 ? (
                      <>
                        {n.entites_un?.map((ent: any) => (
                          <span
                            key={`n1-${ent.id}`}
                            className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold border border-blue-200"
                          >
                            {ent.libelle}
                          </span>
                        ))}
                        {n.entites_deux?.map((ent: any) => (
                          <span
                            key={`n2-${ent.id}`}
                            className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-200"
                          >
                            {ent.libelle}
                          </span>
                        ))}
                        {n.entites_trois?.map((ent: any) => (
                          <span
                            key={`n3-${ent.id}`}
                            className="bg-amber-50 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-bold border border-amber-200"
                          >
                            {ent.libelle}
                          </span>
                        ))}
                      </>
                    ) : (
                      <span className="text-slate-400 italic text-xs">
                        Transversal (Tous)
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        setSelected(n);
                        setDetailsVisible(true);
                      }}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                      title="Voir détails"
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
                      title="Modifier"
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
          <div className="p-12 text-center animate-pulse text-emerald-400 font-medium">
            Chargement des données en cours...
          </div>
        )}
        {!loading && filteredData.length === 0 && (
          <div className="p-16 text-center border-t border-slate-50">
            <FileStack size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 italic">
              Aucune pièce ne correspond à votre recherche
            </p>
          </div>
        )}
      </div>

      <div className="mt-6">
        <Pagination
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filteredData.length}
          onPageChange={setCurrentPage}
        />
      </div>

      <PiecesForm
        visible={formVisible}
        onHide={() => setFormVisible(false)}
        onSubmit={editing ? onEdit : onCreate}
        initial={editing || {}}
        title={
          editing ? "Modifier le type de pièce" : "Ajouter un nouveau type"
        }
        division={allDivisions}
      />

      <PiecesDetails
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        pieces={selected}
      />
    </Layout>
  );
}
