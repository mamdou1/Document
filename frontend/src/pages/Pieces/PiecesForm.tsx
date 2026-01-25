import React, { useState, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { FileStack, Hash, Type, Save, X, Layers } from "lucide-react";
import { Division, Pieces } from "../../interfaces";
import { Dropdown } from "primereact/dropdown";

type Props = {
  visible: boolean;
  onHide: () => void;
  onSubmit: (data: Partial<Pieces>) => Promise<void>;
  initial?: Partial<Pieces>;
  title?: string;
  division: Division[]; // Liste des services venant du parent
};

export default function PiecesForm({
  visible,
  onHide,
  onSubmit,
  initial = {},
  title,
  division = [],
}: Props) {
  const [division_id, setDivision_id] = useState<number | null>(null);
  const [code_pieces, setCode_pieces] = useState("");
  const [libelle, setLibelle] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setCode_pieces(initial.code_pieces || "");
      setLibelle(initial.libelle || "");
      setDivision_id(initial.division_id || division[0]?.id || 0);
    }
  }, [visible, division]);

  const handleSubmit = async () => {
    if (!libelle || !division_id) return;
    setLoading(true);
    try {
      await onSubmit({ code_pieces, libelle, division_id });
      ////onHide();
    } finally {
      setLoading(false);
    }
  };

  // Mise à jour du style focus : emerald -> indigo
  const inputStyle =
    "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-slate-700";

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2 text-slate-800 font-bold">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <FileStack size={18} className="text-indigo-600" />
          </div>
          <span>{title}</span>
        </div>
      }
      visible={visible}
      style={{ width: "500px" }}
      onHide={onHide}
      draggable={false}
      className="rounded-3xl shadow-2xl"
    >
      <div className="pt-4 space-y-6">
        {/* Champ Code Référence */}
        <div className="space-y-2">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
              <Layers size={16} className="text-blue-500" /> Division de
              rattachement
            </label>
            <Dropdown
              value={division_id}
              options={division}
              onChange={(e) => setDivision_id(e.value)}
              optionLabel="libelle"
              optionValue="id"
              placeholder="Choisir une division"
              className="w-full bg-slate-50 border-slate-200 rounded-xl"
              filter
            />
          </div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-600 ml-1">
            <Hash size={16} className="text-indigo-500" /> Code Référence *
          </label>
          <InputText
            value={code_pieces}
            onChange={(e) => setCode_pieces(e.target.value)}
            placeholder="Ex: FACT-01"
            className={inputStyle}
          />
        </div>

        {/* Champ Libellé */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-600 ml-1">
            <Type size={16} className="text-indigo-500" /> Libellé de la pièce *
          </label>
          <InputText
            value={libelle}
            onChange={(e) => setLibelle(e.target.value)}
            placeholder="Ex: Facture d'achat"
            className={inputStyle}
          />
        </div>

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
            disabled={loading || !code_pieces || !libelle || !division_id}
            className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl border-none shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
          />
        </div>
      </div>
    </Dialog>
  );
}
