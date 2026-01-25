import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Fonction, Service, Division, Section } from "../../interfaces";
import { getFunctionsByDivision } from "../../api/division";
import { getSectionsByDivision } from "../../api/section";
import {
  Layers,
  GitMerge,
  Calendar,
  Briefcase,
  PlusCircle,
  Building2,
} from "lucide-react";
import DivisionAjoutFonction from "./DivisionAjoutFonction";

export default function DivisionDetails({
  visible,
  onHide,
  division,
  services,
  toast,
}: any) {
  const [fonctions, setFonctions] = useState<Fonction[]>([]);
  const [selected, setSelected] = useState<Division | null>(null);
  const [ajoutFonctionVisible, setAjoutFonctionVisible] = useState(false);
  const [section, setSection] = useState<Section[]>([]);

  // Récupération du libellé du service parent
  const serviceLibelle = services?.find(
    (s: Service) => s.id === division?.service_id,
  )?.libelle;

  const fetchFonctions = async () => {
    if (visible && division?.id) {
      try {
        const [data, sec] = await Promise.all([
          getFunctionsByDivision(division.id),
          getSectionsByDivision(division.id),
        ]);
        setFonctions(data);
        setSection(Array.isArray(sec) ? sec : []);
      } catch (err) {
        console.error("Erreur lors du chargement des fonctions", err);
      }
    }
  };

  useEffect(() => {
    fetchFonctions();
  }, [visible, division]);

  const sectionLibelle = section.find(
    (s: Section) => s.division_id === division?.id,
  )?.libelle;

  if (!division) return null;

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2 text-slate-800 font-bold">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <Layers size={18} className="text-indigo-600" />
          </div>
          <span>Détails de la Division</span>
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
        {/* Header Division */}
        <div className="border-b border-slate-100 pb-4 space-y-2">
          <p className="text-indigo-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
            Département / Division
          </p>
          {/* Infos complémentaires */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50/50 border border-indigo-100/50">
            <div className="p-2 bg-indigo-500 rounded-lg shadow-sm shadow-indigo-200">
              <Building2 size={16} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-indigo-600/50 uppercase tracking-widest">
                Service de rattachement
              </p>
              <p className="text-sm text-indigo-800 font-bold uppercase">
                {serviceLibelle || "Non spécifié"}
              </p>
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            {division.libelle}
            <span className="text-slate-600 text-sm font-normal">
              #DIV-{division.id.toString().padStart(3, "0")}
            </span>
          </h2>
        </div>

        {/* Tableau des Fonctions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Fonctions de division
              </p>
              <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 ml-2 py-0.5 rounded-full shadow-sm">
                {fonctions.length} Total
              </span>
            </div>

            <Button
              onClick={(e) => {
                setSelected(division);
                setAjoutFonctionVisible(true);
                e.stopPropagation();
              }}
              className="flex items-center gap-2 px-3 py-2 text-indigo-600 font-bold bg-indigo-50 hover:text-white hover:bg-indigo-500 rounded-lg transition-all border-none shadow-sm"
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
                      className="group hover:bg-indigo-50/30 transition-colors"
                    >
                      <td className="p-3">
                        <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-500">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Briefcase
                            size={14}
                            className="text-slate-300 group-hover:text-indigo-400"
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

        {/* Liste des Section */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50/50 border border-indigo-100/50">
          <div className="p-2 bg-indigo-500 rounded-lg shadow-sm shadow-indigo-200">
            <GitMerge size={16} className="text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black text-indigo-600/50 uppercase tracking-widest">
              Section de rattachement
            </p>
            <p className="text-sm text-indigo-800 font-bold uppercase">
              {sectionLibelle || "Non spécifié"}
            </p>
          </div>
        </div>
      </div>

      <DivisionAjoutFonction
        visible={ajoutFonctionVisible}
        onHide={() => setAjoutFonctionVisible(false)}
        division={selected}
        onSuccess={() => {
          setAjoutFonctionVisible(false);
          fetchFonctions();
          toast?.current?.show({
            severity: "success",
            summary: "Succès",
            detail: "Fonction ajoutée avec succès à la division",
          });
        }}
      />
    </Dialog>
  );
}
