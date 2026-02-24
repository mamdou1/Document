import { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Fonction, EntiteeTrois } from "../../../interfaces";
import { getFunctionsByEntiteeTrois } from "../../../api/entiteeTrois";
import {
  GitMerge,
  Hash,
  Calendar,
  Briefcase,
  PlusCircle,
  Trash2,
  Pencil,
} from "lucide-react";
import EntiteeTroisAjoutFonction from "./EntiteeTroisAjoutFonction";
import { confirmDialog } from "primereact/confirmdialog";
import { deleteFonctionById } from "../../../api/fonction";
import { Toast } from "primereact/toast";

export default function EntiteeTroisDetails({
  visible,
  onHide,
  entiteeTrois,
}: any) {
  const [fonctions, setFonctions] = useState<Fonction[]>([]);
  const [editing, setEditing] = useState<Partial<Fonction> | null>(null);
  const [selected, setSelected] = useState<EntiteeTrois | null>(null);
  const [ajoutFonctionVisible, setAjoutFonctionVisible] = useState(false);
  const toast = useRef<Toast>(null);

  const fetchFonctions = async () => {
    if (visible && entiteeTrois?.id) {
      try {
        const data = await getFunctionsByEntiteeTrois(entiteeTrois.id);
        setFonctions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erreur lors du chargement des fonctions", err);
      }
    }
  };

  useEffect(() => {
    fetchFonctions();
  }, [visible, entiteeTrois]);

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
          fetchFonctions(); // Rafraîchir la liste
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

  if (!entiteeTrois) return null;

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header={
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <GitMerge size={18} className="text-emerald-600" />
            </div>
            <span>Détails des Postes</span>
          </div>
        }
        visible={visible}
        style={{ width: "700px" }} // Légèrement élargi pour le tableau
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
          {/* Header Section */}
          <div className="border-b border-slate-100 pb-4">
            <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
              / {entiteeTrois.titre} / Unité
            </p>
            {/* Infos complémentaires */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/50">
              <div className="p-1.5 bg-emerald-500 rounded-lg">
                <Hash size={15} className="text-white" />
              </div>
              <p className="text-[13px] text-emerald-700 font-bold leading-tight">
                {entiteeTrois.titre} rattachée à la{" "}
                {entiteeTrois.entitee_deux?.libelle || "---"} <br />
                <span className="text-[13px] uppercase text-emerald-400 font-black">
                  {entiteeTrois.entitee_deux?.libelle || "N/A"}
                </span>
              </p>
            </div>
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              {entiteeTrois.libelle}
              <span className="text-slate-600 text-sm font-normal">
                {entiteeTrois.code}
              </span>
            </h2>
          </div>

          {/* Tableau des Fonctions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Fonctions Répertoriées
                </p>

                <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 ml-2 py-0.5 rounded-full shadow-sm">
                  {fonctions.length} Total
                </span>
              </div>

              <div className="flex ">
                <Button
                  label="Ajouter une fonction"
                  onClick={(e) => {
                    setSelected(entiteeTrois);
                    setAjoutFonctionVisible(true);
                    e.stopPropagation();
                  }}
                  className="p-2 text-emerald-600 font-bold bg-emerald-100 hover:text-white hover:bg-emerald-500 rounded-lg shadow-emerald-50 shadow-lg"
                  title="Ajouter une fonction"
                >
                  <PlusCircle size={15} className="ml-1" />
                </Button>
              </div>
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
                        Libellé de la Fonction
                      </th>
                      <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">
                        Date Création
                      </th>
                      <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {fonctions.map((f, index) => (
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
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 font-medium">
                            <Calendar size={12} />
                            {f.createdAt
                              ? new Date(f.createdAt).toLocaleDateString()
                              : "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={(e) => {
                                setEditing(f); // f est l'objet fonction de votre map
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
              <div className="text-center py-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
                <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <Briefcase size={20} className="text-slate-300" />
                </div>
                <p className="text-slate-400 italic text-sm">
                  Aucune fonction rattachée
                </p>
              </div>
            )}
          </div>
        </div>

        <EntiteeTroisAjoutFonction
          visible={ajoutFonctionVisible}
          onHide={() => {
            setAjoutFonctionVisible(false);
            setEditing(null); // Très important : vider l'édition à la fermeture
          }}
          entiteeTrois={entiteeTrois}
          editing={editing} // Passer l'état editing
          onSuccess={() => {
            setAjoutFonctionVisible(false);
            fetchFonctions();
            toast?.current?.show({
              severity: "success",
              summary: "Succès",
              detail: "Fonction ajoutée avec succès à la entiteeDeux",
            });
          }}
        />
      </Dialog>
    </>
  );
}
