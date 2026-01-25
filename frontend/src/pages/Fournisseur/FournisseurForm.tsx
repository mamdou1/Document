import React, { useState, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import {
  UserPlus,
  Save,
  Building,
  Phone,
  MapPin,
  Hash,
  Info,
  Layers,
} from "lucide-react";

export default function FournsseurForm({
  visible,
  onHide,
  onSubmit,
  initial = {},
  title = "Créer fournisseur",
}: any) {
  const [formData, setFormData] = useState({
    NIF: "",
    sigle: "",
    raisonSocial: "",
    adresse: "",
    numero: "",
    secteurActivite: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setFormData({
        NIF: initial.NIF || "",
        sigle: initial.sigle || "",
        raisonSocial: initial.raisonSocial || "",
        adresse: initial.adresse || "",
        numero: initial.numero || "",
        secteurActivite: initial.secteurActivite || "",
      });
    }
  }, [visible]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProcess = async () => {
    setLoading(true);
    try {
      await onSubmit(formData);
      //onHide();
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
              <Hash size={16} className="text-blue-500" /> NIF{" "}
              <span className="text-red-500">*</span>
            </label>
            <InputText
              value={formData.NIF}
              onChange={(e) => handleChange("NIF", e.target.value)}
              className={inputClass}
              placeholder="Identifiant Fiscal"
            />
          </div>
          <div>
            <label className={labelClass}>
              <Building size={16} className="text-blue-500" /> Sigle / Nom court{" "}
              <span className="text-red-500">*</span>
            </label>
            <InputText
              value={formData.sigle}
              onChange={(e) => handleChange("sigle", e.target.value)}
              className={inputClass}
              placeholder="Ex: GSL"
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>
            <Info size={16} className="text-blue-500" /> Raison Sociale{" "}
            <span className="text-red-500">*</span>
          </label>
          <InputText
            value={formData.raisonSocial}
            onChange={(e) => handleChange("raisonSocial", e.target.value)}
            className={inputClass}
            placeholder="Nom complet de l'entreprise"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              <MapPin size={16} className="text-blue-500" /> Adresse{" "}
              <span className="text-red-500">*</span>
            </label>
            <InputText
              value={formData.adresse}
              onChange={(e) => handleChange("adresse", e.target.value)}
              className={inputClass}
              placeholder="Siège social"
            />
          </div>
          <div>
            <label className={labelClass}>
              <Phone size={16} className="text-blue-500" /> Téléphone{" "}
              <span className="text-red-500">*</span>
            </label>
            <InputText
              value={formData.numero}
              onChange={(e) => handleChange("numero", e.target.value)}
              className={inputClass}
              placeholder="+223 ..."
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>
            <Layers size={16} className="text-blue-500" /> Secteur d'activité{" "}
            <span className="text-red-500">*</span>
          </label>
          <InputText
            value={formData.secteurActivite}
            onChange={(e) => handleChange("secteurActivite", e.target.value)}
            className={inputClass}
            placeholder="Commerce générale"
          />
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
            onClick={handleProcess}
            disabled={loading || !formData.NIF || !formData.sigle}
            className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
          />
        </div>
      </div>
    </Dialog>
  );
}
