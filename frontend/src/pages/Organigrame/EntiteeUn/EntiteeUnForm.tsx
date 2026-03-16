import React, { useState, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Save, Briefcase, Info, Hash } from "lucide-react";
import { EntiteeUn } from "../../../interfaces";

type Props = {
  visible: boolean;
  onHide: () => void;
  onSubmit: (data: Partial<EntiteeUn>) => Promise<void>;
  refresh: () => void;
  initial?: Partial<EntiteeUn>;
  title?: string;
};

export default function EntiteeUnForm({
  visible,
  onHide,
  onSubmit,
  refresh,
  initial = {},
  title = "Nouveau",
}: Props) {
  ///const [code, setCode] = useState("");
  const [libelle, setLibelle] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      //setCode(initial.code || "");
      setLibelle(initial.libelle || "");
    }
  }, [visible]);

  const handleSubmit = async () => {
    setLoading(true);
    console.log("Formulaire soumis avec:", { libelle });
    try {
      await onSubmit({ libelle });
      console.log("Soumission réussie");
      setLibelle("");
      //onHide(); // Décidez si vous voulez fermer automatiquement ou non
      refresh();
    } catch (error) {
      console.error("Erreur lors de la soumission:", error); // <-- Ajoutez ce log
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2 text-slate-800 font-bold">
          <Briefcase size={20} className="text-emerald-500" />
          <span>{title}</span>
        </div>
      }
      visible={visible}
      style={{ width: "450px" }}
      onHide={onHide}
      draggable={false}
    >
      <div className="pt-4 space-y-5">
        <div>
          {/* <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
              <Hash size={16} className="text-blue-500" /> Code
            </label>
            <InputText
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              placeholder="Ex: DIVC-001"
            />
          </div> */}

          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
            <Info size={16} className="text-emerald-500" /> Libellé{" "}
            <span className="text-red-500">*</span>
          </label>
          <InputText
            value={libelle}
            onChange={(e) => setLibelle(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 outline-none"
            placeholder="Ex: Direction des Ressources Humaines"
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
          <Button
            label="Annuler"
            onClick={onHide}
            className="p-button-text text-slate-500"
          />
          <Button
            label={loading ? "Enregistrement..." : "Enregistrer"}
            icon={!loading && <Save size={18} className="mr-2" />}
            onClick={handleSubmit}
            disabled={!libelle || loading}
            className="bg-emerald-600 text-white px-8 py-3 rounded-xl shadow-lg hover:bg-emerald-700 transition-all"
          />
        </div>
      </div>
    </Dialog>
  );
}
