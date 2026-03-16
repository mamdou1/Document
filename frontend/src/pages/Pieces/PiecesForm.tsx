import React, { useState, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { FileStack, FileText, Hash, Save, X } from "lucide-react";
import { Pieces } from "../../interfaces";

type Props = {
  visible: boolean;
  onHide: () => void;
  onSubmit: (data: Partial<Pieces>) => Promise<void>;
  refresh: () => void;
  initial?: Partial<Pieces>;
  title?: string;
};

export default function PiecesForm({
  visible,
  onHide,
  onSubmit,
  refresh,
  initial = {},
  title,
}: Props) {
  const [formData, setFormData] = useState({
    libelle: "",
  });

  const [loading, setLoading] = useState(false);

  // Initialisation du formulaire (Edit vs Create)
  useEffect(() => {
    if (visible && initial?.id) {
      setFormData({
        libelle: initial.libelle || "",
      });
    } else {
      setFormData({
        libelle: "",
      });
    }
  }, [visible, initial]);

  const handleSubmit = async () => {
    if (!formData.libelle) return;
    setLoading(true);
    try {
      await onSubmit(formData);
      onHide();
      refresh();
    } finally {
      setLoading(false);
    }
  };

  // Styles réutilisables
  const labelStyle =
    "text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2";
  const inputWrapper = "flex flex-col gap-1";

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2 text-slate-800 font-bold">
          <div className="bg-emerald-100 p-2 rounded-lg">
            <FileStack size={18} className="text-emerald-600" />
          </div>
          <span>{title}</span>
        </div>
      }
      visible={visible}
      style={{ width: "700px" }}
      onHide={onHide}
      draggable={false}
      className="rounded-[2.5rem] overflow-hidden shadow-2xl"
    >
      <div className="pt-4 space-y-6">
        {/* Champ Code Référence */}

        <form onSubmit={handleSubmit} className="pt-4 grid grid-cols-1 gap-6">
          {/* Colonne Gauche: Identité */}
          <div className="grid grid-cols-2 gap-4">
            {/* <div className={inputWrapper}>
              <label className={labelStyle}>
                <Hash size={14} className="text-emerald-500" /> Code
              </label>
              <InputText
                value={formData.code_pieces}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code_pieces: e.target.value.toUpperCase(),
                  })
                }
                placeholder="Ex: DOC-01"
                className="p-3 bg-slate-50 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
              />
            </div> */}
            <div className={inputWrapper}>
              <label className={labelStyle}>
                <FileText size={14} className="text-emerald-500" /> Nom du type
              </label>
              <InputText
                value={formData.libelle}
                onChange={(e) =>
                  setFormData({ ...formData, libelle: e.target.value })
                }
                placeholder="Ex: Facture d'achat"
                className="p-3 bg-slate-50 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <hr className="border-slate-100" />
        </form>

        {/* Actions du pied de page */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
          <Button
            label="Annuler"
            icon={<X size={18} className="mr-2" />}
            onClick={onHide}
            className="p-button-text text-slate-400 font-bold hover:text-slate-600 transition-colors"
          />
          <Button
            label={loading ? "Traitement..." : "Enregistrer la pièce"}
            icon={!loading && <Save size={18} className="mr-2" />}
            onClick={handleSubmit}
            disabled={loading || !formData.libelle}
            className="bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl border-none shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
          />
        </div>
      </div>
    </Dialog>
  );
}
