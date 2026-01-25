import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import {
  Save,
  X,
  Hash,
  Type,
  Calendar,
  AlignLeft,
  FilePlus,
} from "lucide-react";
import type { Programme, Exercice } from "../../interfaces";

type Props = {
  visible: boolean;
  onHide: () => void;
  onSubmit: (data: Partial<Programme>) => Promise<void>;
  initial?: Partial<Programme>;
  title?: string;
  exercices: Exercice[];
};

export default function ProgrammeForm({
  visible,
  onHide,
  onSubmit,
  initial = {},
  title = "Créer programme",
  exercices,
}: Props) {
  const [code_programme, setCode_programme] = useState(
    initial.code_programme || "",
  );

  const [libelle, setLibelle] = useState(initial.libelle || "");
  const [description, setDescription] = useState(initial.description || "");
  const [exercice, setExercice] = useState<Exercice | string>(
    initial.exercice || exercices[0]?.id || "",
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setCode_programme(initial.code_programme || "");
      setLibelle(initial.libelle || "");
      setDescription(initial.description || "");
      setExercice(initial.exercice || exercices[0]?.id || "");
    }
  }, [visible, exercices]);

  const handleAction = async () => {
    setLoading(true);
    try {
      await onSubmit({ code_programme, libelle, exercice, description });
      ////onHide();
    } finally {
      setLoading(false);
    }
  };

  const labelStyle =
    "flex items-center gap-2 text-sm font-bold text-slate-700 mb-2";
  const inputWrapper = "relative group";
  const inputStyle =
    "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-blue-900 font-medium";
  const iconStyle =
    "absolute right-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors";

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2 text-blue-900 font-bold">
          <FilePlus size={20} className="text-blue-500" />
          <span>{title}</span>
        </div>
      }
      visible={visible}
      style={{ width: "600px" }}
      onHide={onHide}
      draggable={false}
      className="custom-dialog"
    >
      <div className="pt-4 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelStyle}>
              Code <span className="text-red-500">*</span>
            </label>
            <div className={inputWrapper}>
              <InputText
                value={code_programme}
                onChange={(e) => setCode_programme(e.target.value)}
                className={`${inputStyle} pr-10`}
                placeholder="Ex: PROG-01"
              />
              <Hash className={iconStyle} size={18} />
            </div>
          </div>

          <div>
            <label className={labelStyle}>
              Exercice <span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={exercice}
              options={exercices.map((x) => ({
                label: `Année ${x.annee}`,
                value: x.id,
              }))}
              onChange={(e) => setExercice(e.value)}
              placeholder="Choisir l'année"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </div>

        <div>
          <label className={labelStyle}>
            Libellé du programme <span className="text-red-500">*</span>
          </label>
          <div className={inputWrapper}>
            <InputText
              value={libelle}
              onChange={(e) => setLibelle(e.target.value)}
              className={`${inputStyle} pr-10`}
              placeholder="Nom complet du programme"
            />
            <Type className={iconStyle} size={18} />
          </div>
        </div>

        <div>
          <label className={labelStyle}>Description détaillée</label>
          <div className={inputWrapper}>
            <InputTextarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className={`${inputStyle} resize-none`}
              placeholder="Objectifs et détails du programme..."
            />
            <AlignLeft
              className="absolute right-4 bottom-3 text-slate-400 group-focus-within:text-blue-500"
              size={18}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
          <Button
            label="Annuler"
            icon={<X size={18} className="mr-2" />}
            onClick={onHide}
            className="p-button-text text-slate-500 hover:text-slate-800 font-semibold py-2 px-4 rounded-xl transition-colors"
          />
          <Button
            label={loading ? "Enregistrement..." : "Enregistrer"}
            icon={!loading && <Save size={18} className="mr-2" />}
            disabled={loading || !libelle || !code_programme}
            onClick={handleAction}
            className="bg-blue-600 text-white font-bold py-2.5 px-8 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-200 transition-all active:scale-95"
          />
        </div>
      </div>
    </Dialog>
  );
}
