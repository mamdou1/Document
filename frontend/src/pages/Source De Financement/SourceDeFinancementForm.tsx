import React, { useState, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { UserPlus, Save, Bookmark } from "lucide-react";
import { SourceDeFinancement } from "../../interfaces";

type Props = {
  visible: boolean;
  onHide: () => void;
  onSubmit: (data: Partial<SourceDeFinancement>) => Promise<void>;
  initial?: Partial<SourceDeFinancement>;
  title?: string;
};

export default function SourceDeFinancementForm({
  visible,
  onHide,
  onSubmit,
  initial = {},
  title = "Créer Source De Financement",
}: Props) {
  const [libelle, setLibelle] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setLibelle(initial.libelle || "");
    }
  }, [visible]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit({ libelle });
      setLibelle("");
      ////onHide();
    } finally {
      setLoading(false);
    }
  };

  const labelClass =
    "flex items-center gap-2 text-sm font-bold text-slate-700 mb-2";
  const inputClass =
    "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none";

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2 text-blue-900 font-bold">
          <UserPlus size={20} className="text-blue-500" />
          <span>{title}</span>
        </div>
      }
      visible={visible}
      style={{ width: "600px" }}
      onHide={onHide}
      draggable={false}
    >
      <div className="pt-4 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              <Bookmark size={16} className="text-blue-500" /> Libélle{" "}
              <span className="text-red-500">*</span>
            </label>
            <InputText
              value={libelle}
              onChange={(e) => setLibelle(e.target.value)}
              className={labelClass}
              placeholder="FMI..."
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
          <Button
            label="Annuler"
            onClick={onHide}
            className="p-button-text text-slate-500 font-semibold"
          />
          <Button
            label={loading ? "Enregistrement..." : "Enregistrer"}
            icon={!loading && <Save size={18} className="mr-2" />}
            onClick={handleSubmit}
            disabled={loading || !libelle}
            className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
          />
        </div>
      </div>
    </Dialog>
  );
}
