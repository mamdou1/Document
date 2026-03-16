import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import {
  Fonction,
  EntiteeUn,
  EntiteeDeux,
  EntiteeTrois,
} from "../../../interfaces";
import { getFunctionsByEntiteeUn } from "../../../api/entiteeUn";
import {
  Bookmark,
  Hash,
  Briefcase,
  PlusCircle,
  Layers,
  GitMerge,
  Pencil,
  Trash2,
  Search,
} from "lucide-react";
import EntiteeUnAjoutFonction from "./EntiteeUnAjoutFonction";
import { confirmDialog } from "primereact/confirmdialog";
import { deleteFonctionById } from "../../../api/fonction";
import Pagination from "../../../components/layout/Pagination";
import { InputText } from "primereact/inputtext";

export default function EntiteeUnDetails({
  visible,
  onHide,
  entiteeUn,
  toast,
}: any) {
  const [fonctions, setFonctions] = useState<Fonction[]>([]);
  const [editing, setEditing] = useState<Partial<Fonction> | null>(null);
  const [ajoutFonctionVisible, setAjoutFonctionVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Charger les fonctions au montage
  const fetchData = async () => {
    if (visible && entiteeUn?.id) {
      try {
        const funcData = await getFunctionsByEntiteeUn(entiteeUn.id);
        setFonctions(funcData);
      } catch (err) {
        console.error("Erreur lors du chargement des données", err);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [visible, entiteeUn]);

  const handleDelete = (id: number) => {
    confirmDialog({
      message: `Voulez-vous supprimer cette fonction définitivement ? Cette action est irréversible.`,
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
          await deleteFonctionById(id);
          toast.current?.show({
            severity: "success",
            summary: "Supprimé",
            detail: "Fonction supprimée avec succès",
          });
          fetchData();
        } catch (err) {
          toast.current?.show({
            severity: "error",
            summary: "Erreur",
            detail: "Impossible de supprimer la fonction",
          });
        }
      },
    });
  };

  // Filtrage et pagination
  const filtered = fonctions.filter((f) => {
    const isPopulated = f.libelle !== null;
    if (!isPopulated) return false;
    return (f.libelle || "").toLowerCase().includes(query.toLowerCase());
  });

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  if (!entiteeUn) return null;

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2 text-slate-800 font-bold">
          <div className="bg-emerald-100 p-2 rounded-lg">
            <Bookmark size={18} className="text-emerald-600" />
          </div>
          <span>Détails du {entiteeUn.titre}</span>
        </div>
      }
      visible={visible}
      style={{ width: "700px" }}
      onHide={onHide}
      draggable={false}
      footer={
        <div className="flex justify-end p-2">
          <Button
            label="Fermer"
            onClick={onHide}
            className="bg-slate-800 text-white font-bold px-6 py-2 rounded-xl border-none hover:bg-slate-700 transition-all shadow-md"
          />
        </div>
      }
    >
      <div className="pt-2 space-y-6">
        {/* Header EntiteeUn */}
        <div className="border-b border-slate-100 pb-4">
          <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
            {entiteeUn.titre}
          </p>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            {entiteeUn.libelle}
            <span className="text-slate-600 text-sm font-normal">
              {entiteeUn.code}
            </span>
          </h2>
        </div>

        {/* Search */}
        <div className="relative group max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
            size={20}
          />
          <InputText
            className="w-full pl-12 pr-4 py-2 bg-slate-50 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 outline-none"
            placeholder="Rechercher ..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Tableau des Fonctions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Fonctions de {entiteeUn.titre}
              </p>
            </div>

            <Button
              onClick={(e) => {
                setAjoutFonctionVisible(true);
                e.stopPropagation();
              }}
              className="flex items-center gap-2 px-3 py-2 text-emerald-600 font-bold bg-emerald-50 hover:text-white hover:bg-emerald-500 rounded-lg transition-all border-none"
            >
              <PlusCircle size={15} />
              <span className="text-xs">Ajouter une fonction</span>
            </Button>
          </div>

          {fonctions.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
              <table className="w-full text-left border-collapse bg-white">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-wider w-12">
                      #
                    </th>
                    <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      Libellé
                    </th>
                    <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginated.map((f, index) => (
                    <tr
                      key={f.id}
                      className="group hover:bg-emerald-50/30 transition-colors"
                    >
                      <td className="p-3">
                        <span className="text-xs font-bold text-slate-400 group-hover:text-emerald-500">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Briefcase
                            size={14}
                            className="text-slate-300 group-hover:text-emerald-400"
                          />
                          <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">
                            {f.libelle}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              setEditing(f);
                              setAjoutFonctionVisible(true);
                              e.stopPropagation();
                            }}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={(e) => {
                              handleDelete(f.id);
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
          ) : (
            <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-slate-400 text-sm italic">
                Aucune fonction rattachée
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

        {/* Footer info */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <Hash size={15} className="text-slate-400" />
          <p className="text-[11px] text-slate-500 font-medium">
            Code :{" "}
            <span className="font-bold uppercase">
              {entiteeUn.code || "N/A"}
            </span>
          </p>
        </div>
      </div>

      <EntiteeUnAjoutFonction
        visible={ajoutFonctionVisible}
        onHide={() => {
          setAjoutFonctionVisible(false);
          setEditing(null);
        }}
        entiteeUn={entiteeUn}
        editing={editing}
        onSuccess={() => {
          setAjoutFonctionVisible(false);
          setEditing(null);
          fetchData();
          toast?.current?.show({
            severity: "success",
            summary: "Succès",
            detail: "Fonction ajoutée/modifiée",
          });
        }}
      />
    </Dialog>
  );
}
