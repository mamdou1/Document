import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Save, X, Info } from "lucide-react";
import type { Exercice } from "../../interfaces";
import { Calendar } from "lucide-react";

type Props = {
  visible: boolean;
  onHide: () => void;
  onSubmit: (data: Partial<Exercice>) => Promise<void>;
  refresh: () => void;
  initial?: Partial<Exercice>;
  title?: string;
};

export default function ExerciceForm({
  visible,
  onHide,
  onSubmit,
  refresh,
  initial = {},
  title = "Créer un exercice",
}: Props) {
  const [annee, setAnnee] = useState<number>(
    initial.annee || new Date().getFullYear(),
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) setAnnee(initial.annee || new Date().getFullYear());
  }, [visible]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit({ annee });
      //onHide();
      refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      header={<div className="text-blue-900 font-bold">{title}</div>}
      visible={visible}
      style={{ width: "400px" }}
      onHide={onHide}
      draggable={false}
      className="custom-dialog"
    >
      <div className="pt-4 space-y-6">
        <div className="relative">
          <label className="flex items-center gap-1 text-sm font-bold text-slate-700 mb-2">
            Année de l'exercice <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <InputText
              value={String(annee)}
              keyfilter="int"
              onChange={(e) => setAnnee(Number(e.target.value))}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-lg font-semibold text-blue-900"
              placeholder="Ex: 2024"
            />
            <Calendar
              className="absolute right-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors"
              size={20}
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <Info size={12} /> L'exercice doit correspondre à une année civile.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            label="Annuler"
            icon={<X size={18} className="mr-2" />}
            onClick={onHide}
            className="p-button-text text-slate-500 hover:text-slate-800 font-semibold py-2 px-4 rounded-xl"
          />
          <Button
            label={loading ? "Enregistrement..." : "Enregistrer l'exercice"}
            icon={!loading && <Save size={18} className="mr-2" />}
            disabled={loading || !annee}
            onClick={handleSubmit}
            className="bg-blue-600 text-white font-bold py-2 px-6 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-200 transition-all"
          />
        </div>
      </div>
    </Dialog>
  );
}
