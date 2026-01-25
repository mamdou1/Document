import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { FileText, Save, Hash, Layers, Info } from "lucide-react";
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
        <div className="flex items-center gap-2 text-blue-900 font-bold">
          <Info size={20} /> {title}
        </div>
      }
      visible={visible}
      style={{ width: 600 }}
      onHide={onHide}
      className="custom-dialog"
      footer={
        <div className="flex justify-end gap-3 p-2">
          <Button
            label="Annuler"
            onClick={onHide}
            className="p-button-text text-slate-500 font-bold"
          />
          <Button
            label={loading ? "Action..." : "Enregistrer"}
            icon={!loading && <Save size={18} className="mr-2" />}
            onClick={handleSubmit}
            disabled={loading || !nom}
            className="bg-blue-600 text-white px-8 rounded-xl border-none shadow-lg"
          />
        </div>
      }
    >
      <div className="space-y-6 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex gap-2">
              <Hash size={12} /> Code
            </label>
            <InputText
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-3 bg-slate-50 border-slate-200 rounded-xl"
              placeholder="Ex: FACT-01"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex gap-2">
              <Layers size={12} /> Division
            </label>
            <Dropdown
              value={division_id}
              options={division}
              onChange={(e) => setDivision_id(e.value)}
              optionLabel="libelle"
              optionValue="id"
              className="w-full bg-slate-50 border-slate-200 rounded-xl"
              filter
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex gap-2">
            <FileText size={12} /> Libellé du type
          </label>
          <InputText
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="w-full p-3 bg-slate-50 border-slate-200 rounded-xl"
            placeholder="Nom du type de document..."
          />
        </div>
      </div>
    </Dialog>
  );
}
