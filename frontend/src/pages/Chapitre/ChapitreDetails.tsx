import { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import {
  BookOpen,
  Hash,
  Layers,
  AlignLeft,
  Calendar,
  X,
  Briefcase,
  PlusCircle,
} from "lucide-react";
import type { Programme, Chapitre, Section, Nature } from "../../interfaces";
import { Toast } from "primereact/toast";
import { getNatureChapitre, createNature, getNatures } from "../../api/nature";
import NatureForm from "../Nature/NatureForm";

export default function ChapitreDetails({ visible, onHide, chapitre }: any) {
  const [selected, setSelected] = useState<Chapitre[]>([]);
  const [ajoutNatureVisible, setAjoutNatureVisible] = useState(false);
  const [nature, setNature] = useState<Nature[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const fetchData = async () => {
    if (visible && chapitre?.id) {
      try {
        if (!chapitre?.id) return;
        const data = await getNatureChapitre(Number(chapitre.id));
        setNature(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erreur lors du chargement des données", err);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [visible]);

  if (!chapitre) return null;

  const Row = ({ icon: Icon, label, value, color = "text-blue-600" }: any) => (
    <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
      <div className={`p-2 bg-white rounded-lg shadow-sm ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
          {label}
        </p>
        <p className="text-slate-700 font-semibold">{value || "---"}</p>
      </div>
    </div>
  );
  const ProgrammeRow = ({
    icon: Icon,
    label,
    value,
    color = "text-blue-600",
  }: any) => (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50/50 border border-indigo-100/50">
      <div className={`p-2 bg-white rounded-lg shadow-sm ${color}`}>
        <Icon size={16} />
      </div>
      <div>
        <h2 className="text-[10px] font-black text-indigo-600/50 uppercase tracking-widest">
          {label}
        </h2>
        <p className=" text-sm text-indigo-800 font-bold uppercase">
          {value || "---"}
        </p>
      </div>
    </div>
  );

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2 text-blue-900 font-bold">
          <BookOpen size={20} className="text-blue-500" />
          <span>Détails du Chapitre</span>
        </div>
      }
      visible={visible}
      style={{ width: "700px" }}
      onHide={onHide}
      draggable={false}
      footer={
        <Button
          label="Fermer"
          icon={<X size={18} className="mr-2" />}
          onClick={onHide}
          className="bg-slate-100 text-slate-600 font-bold px-6 py-2 rounded-xl border-none hover:bg-slate-200 transition-all"
        />
      }
    >
      <div className="pt-2 space-y-6">
        <ProgrammeRow
          icon={Layers}
          label="Programme de rattachement"
          className="text-"
          value={
            typeof chapitre.programme === "string"
              ? chapitre.programme
              : chapitre.programme?.libelle
          }
        />
        {/* Header Service */}
        <div className="border-b border-slate-100 pb-4">
          <p className="text-indigo-500 text-[16px] font-black uppercase tracking-[0.2em] mb-1">
            Chapitre
          </p>
          <h2 className="text-[13px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
            {chapitre.libelle}
            {/* <span className="text-slate-600 text-sm font-normal">
              #P-
              {chapitre.id ? chapitre.id.toString().padStart(4, "0") : "0000"}
            </span> */}
          </h2>
        </div>

        {/* Tableau des Fonctions (Inchangé) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Nature de chapitre
              </p>
              {/* <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 ml-2 py-0.5 rounded-full shadow-sm">
                {fonctions.length} Total
              </span> */}
            </div>

            <Button
              onClick={(e) => {
                setSelected(chapitre);
                setFormVisible(true);
                e.stopPropagation();
              }}
              className="flex items-center gap-2 px-3 py-2 text-blue-600 font-bold bg-blue-50 hover:text-white hover:bg-blue-500 rounded-lg transition-all border-none"
            >
              <PlusCircle size={15} />
              <span className="text-xs">Ajouter une nature</span>
            </Button>
          </div>

          {nature.length > 0 ? (
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
                    <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">
                      Création
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {nature.map((f, index) => (
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
            <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-slate-400 text-sm italic">
                Aucune fonction rattachée
              </p>
            </div>
          )}
        </div>

        <Row
          icon={AlignLeft}
          label="Description"
          value={chapitre.description}
        />
        {/* <Row
          icon={Calendar}
          label="Date de création"
          value={
            chapitre.createdAt
              ? new Date(chapitre.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "-"
          }
          color="text-slate-500"
        /> */}
      </div>

      <NatureForm
        visible={formVisible}
        onHide={() => setFormVisible(false)}
        onSubmit={createNature}
        initial={undefined}
        title={"Ajouter une nature"}
        chapitres={selected ? [selected] : []}
      />
    </Dialog>
  );
}
