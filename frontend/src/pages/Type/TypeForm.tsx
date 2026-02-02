import React, { useState, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Type, CreateTypePayload } from "../../interfaces";
import { LayoutGrid, Type as TypeIcon, Hash, Save } from "lucide-react";

type Props = {
  visible: boolean;
  onHide: () => void;
  onSubmit: (data: CreateTypePayload) => Promise<void>;
  initial?: Partial<Type>;
  title?: string;
};

export default function TypeForm({
  visible,
  onHide,
  onSubmit,
  initial = {},
  title = "Créer un type de dossier",
}: Props) {
  const [codeType, setCodeType] = useState(initial.codeType || "");
  const [nom, setNom] = useState(initial.nom || "");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setCodeType(initial.codeType || "");
      setNom(initial.nom || "");
    }
  }, [visible]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit({
        codeType,
        nom,
      });
      ////onHide();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2 text-slate-800">
          <LayoutGrid className="text-emerald-600" size={20} />{" "}
          <span>{title}</span>
        </div>
      }
      visible={visible}
      style={{ width: "450px" }}
      onHide={onHide}
      draggable={false}
      className="rounded-2xl"
    >
      <div className="pt-4 space-y-6">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <Hash size={16} /> Code du Type *
          </label>
          <InputText
            value={codeType}
            onChange={(e) => setCodeType(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
            placeholder="Ex: DOS-PERSO"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <TypeIcon size={16} /> Libellé du Dossier *
          </label>
          <InputText
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
            placeholder="Ex: Frais de déplacement"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            label="Annuler"
            onClick={onHide}
            className="p-button-text text-slate-400 font-bold"
          />
          <Button
            label={loading ? "Enregistrement..." : "Enregistrer"}
            icon={<Save size={18} className="mr-2" />}
            onClick={handleSubmit}
            disabled={loading}
            className="bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl border-none shadow-lg shadow-emerald-200"
          />
        </div>
      </div>
    </Dialog>
  );
}
