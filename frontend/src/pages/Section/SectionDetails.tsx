import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Fonction, Section } from "../../interfaces";
import { getFunctionsBySection } from "../../api/section";
import {
  GitMerge,
  Hash,
  Calendar,
  Briefcase,
  List,
  PlusCircle,
} from "lucide-react";
import SectionAjoutFonction from "./SectionAjoutFonction";

export default function SectionDetails({ visible, onHide, section }: any) {
  const [fonctions, setFonctions] = useState<Fonction[]>([]);
  const [selected, setSelected] = useState<Section | null>(null);
  const [ajoutFonctionVisible, setAjoutFonctionVisible] = useState(false);

  useEffect(() => {
    const fetchFonctions = async () => {
      if (visible && section?.id) {
        try {
          const data = await getFunctionsBySection(section.id);
          setFonctions(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Erreur lors du chargement des fonctions", err);
        }
      }
    };
    fetchFonctions();
  }, [visible, section]);

  if (!section) return null;

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2 text-slate-800 font-bold">
          <div className="bg-orange-100 p-2 rounded-lg">
            <GitMerge size={18} className="text-orange-600" />
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
          <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
            / Section / Unité
          </p>
          {/* Infos complémentaires */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-orange-50/50 border border-orange-100/50">
            <div className="p-1.5 bg-orange-500 rounded-lg">
              <Hash size={15} className="text-white" />
            </div>
            <p className="text-[13px] text-orange-700 font-bold leading-tight">
              Service rattachée à la division <br />
              <span className="text-[13px] uppercase text-orange-400 font-black">
                {section.division?.libelle || "N/A"}
              </span>
            </p>
          </div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            {section.libelle}
            {/* <span className="text-slate-600 text-sm font-normal">
              #SEC-{section.id}
            </span> */}
          </h2>
        </div>

        {/* Tableau des Fonctions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Fonctions Répertoriées
              </p>

              <span className="bg-orange-500 text-white text-[10px] font-bold px-2 ml-2 py-0.5 rounded-full shadow-sm">
                {fonctions.length} Total
              </span>
            </div>

            <div className="flex ">
              <Button
                label="Ajouter une fonction"
                onClick={(e) => {
                  setSelected(section);
                  setAjoutFonctionVisible(true);
                  e.stopPropagation();
                }}
                className="p-2 text-blue-600 font-bold bg-blue-100 hover:text-white hover:bg-blue-500 rounded-lg shadow-blue-50 shadow-lg"
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {fonctions.map((f, index) => (
                    <tr
                      key={f.id}
                      className="group hover:bg-orange-50/30 transition-colors"
                    >
                      <td className="p-3">
                        <span className="text-xs font-bold text-slate-400 group-hover:text-orange-500">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Briefcase
                            size={14}
                            className="text-slate-300 group-hover:text-orange-400"
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

      <SectionAjoutFonction
        visible={ajoutFonctionVisible}
        onHide={() => setAjoutFonctionVisible(false)}
        section={selected}
      />
    </Dialog>
  );
}
