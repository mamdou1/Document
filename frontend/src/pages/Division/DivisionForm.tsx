import React, { useState, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Save, Layers, Building2, Info } from "lucide-react";
import { Division, Service } from "../../interfaces";
type Props = {
  visible: boolean;
  onHide: () => void;
  onSubmit: (data: Partial<Division>) => Promise<void>;
  initial?: Partial<Division>; // ✅ correction ici
  title?: string;
  service: Service[];
};

export default function DivisionForm({
  visible,
  onHide,
  onSubmit,
  initial = {},
  title = "Ajouter une division",
  service,
}: Props) {
  const [libelle, setLibelle] = useState("");
  const [service_id, setService_id] = useState<number>(
    initial.service_id || service[0]?.id || 0,
  );

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setLibelle(initial.libelle || "");
      setService_id(initial.service_id || service[0]?.id || 0);
    }
  }, [visible, service]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit({ libelle, service_id });
      //onHide();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <Layers className="text-blue-500" size={20} /> Nouveau Pôle / Division
        </div>
      }
      visible={visible}
      style={{ width: "500px" }}
      onHide={onHide}
      draggable={false}
    >
      <div className="pt-4 space-y-5">
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
            <Building2 size={16} className="text-blue-500" /> Sélectionner le
            Service
          </label>
          <Dropdown
            value={service_id}
            options={service} // directement la liste des services
            onChange={(e) => setService_id(e.value)}
            optionLabel="libelle"
            optionValue="id"
            placeholder="Choisir un service"
            filter
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
            <Info size={16} className="text-blue-500" /> Nom de la Division
          </label>
          <InputText
            value={libelle}
            onChange={(e) => setLibelle(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
            placeholder="Ex: Division Comptabilité"
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button
            label="Annuler"
            onClick={onHide}
            className="p-button-text text-slate-500"
          />
          <Button
            label="Enregistrer"
            icon={<Save size={18} className="mr-2" />}
            onClick={handleSubmit}
            disabled={!libelle || !service_id}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl shadow-lg"
          />
        </div>
      </div>
    </Dialog>
  );
}
