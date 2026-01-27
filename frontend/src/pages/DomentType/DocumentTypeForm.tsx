import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { FileText, Save, Hash, Layers } from "lucide-react";
import { Dropdown } from "primereact/dropdown";

export default function DocumentTypeForm({
  visible,
  onHide,
  onSubmit,
  initial = {},
  title = "Créer type document",
  division,
}: any) {
  const [code, setCode] = useState("");
  const [nom, setNom] = useState("");
  const [division_id, setDivision_id] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setCode(initial.code || "");
      setNom(initial.nom || "");
      setDivision_id(initial.division_id || division[0]?.id || null);
    }
  }, [visible, initial, division]);

  const handleSubmit = async () => {
    if (!nom || !division_id || !code) return;
    setLoading(true);
    try {
      await onSubmit({ code, nom, division_id });
      onHide();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      header={
        <div className="text-2xl font-black text-slate-800 p-2">{title}</div>
      }
      visible={visible}
      style={{ width: 550 }}
      onHide={onHide}
      className="rounded-[2.5rem] overflow-hidden shadow-2xl"
      footer={
        <div className="flex justify-end gap-3 p-6 bg-slate-50/50">
          <Button
            label="Abandonner"
            onClick={onHide}
            className="p-button-text text-slate-400 font-bold"
          />
          <Button
            label={loading ? "Traitement..." : "Sauvegarder"}
            icon={!loading && <Save size={20} className="mr-2" />}
            onClick={handleSubmit}
            disabled={loading || !nom || !code}
            // Changement : bg-emerald-600 et shadow-emerald-200
            className="bg-emerald-600 text-white font-bold py-3.5 px-10 rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-200 transition-all active:scale-95 border-none"
          />
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-8 p-4">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Hash size={14} className="text-emerald-500" /> Code Référence
            </label>
            <InputText
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              // Changement : focus:ring-emerald-500
              className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700"
              placeholder="ex: FACT-SC"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Layers size={14} className="text-emerald-500" /> Division
            </label>
            <Dropdown
              value={division_id}
              options={division}
              onChange={(e) => setDivision_id(e.value)}
              optionLabel="libelle"
              optionValue="id"
              // Changement : focus:ring-emerald-500
              className="w-full bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-semibold"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <FileText size={14} className="text-emerald-500" /> Nom Complet du
            Document
          </label>
          <InputText
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            // Changement : focus:ring-emerald-500
            className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-semibold"
            placeholder="ex: Facture Fournisseur Service"
          />
        </div>
      </div>
    </Dialog>
  );
}
