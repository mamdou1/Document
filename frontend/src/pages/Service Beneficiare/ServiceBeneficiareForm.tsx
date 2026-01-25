import React, { useState, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Landmark, Hash, Info, MapPin, Save, Tag } from "lucide-react";

export default function ServiceBeneficiareForm({
  visible,
  onHide,
  onSubmit,
  initial = {},
  title,
}: any) {
  const [formData, setFormData] = useState({
    codeService: "",
    sigle: "",
    adresse: "",
    libelle: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setFormData({
        codeService: initial.codeService || "",
        sigle: initial.sigle || "",
        adresse: initial.adresse || "",
        libelle: initial.libelle || "",
      });
    }
  }, [visible]);

  const handleProcess = async () => {
    setLoading(true);
    try {
      await onSubmit(formData);
      ////onHide();
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none";
  const labelClass =
    "flex items-center gap-2 text-sm font-bold text-slate-700 mb-2";

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2 text-indigo-900 font-bold">
          <Landmark size={20} className="text-indigo-500" />
          <span>{title}</span>
        </div>
      }
      visible={visible}
      style={{ width: "550px" }}
      onHide={onHide}
      draggable={false}
    >
      <div className="pt-4 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              <Hash size={16} /> Code Service *
            </label>
            <InputText
              value={formData.codeService}
              onChange={(e) =>
                setFormData({ ...formData, codeService: e.target.value })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              <Tag size={16} /> Sigle *
            </label>
            <InputText
              value={formData.sigle}
              onChange={(e) =>
                setFormData({ ...formData, sigle: e.target.value })
              }
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>
            <Info size={16} /> Libellé complet *
          </label>
          <InputText
            value={formData.libelle}
            onChange={(e) =>
              setFormData({ ...formData, libelle: e.target.value })
            }
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>
            <MapPin size={16} /> Adresse / Bureau *
          </label>
          <InputText
            value={formData.adresse}
            onChange={(e) =>
              setFormData({ ...formData, adresse: e.target.value })
            }
            className={inputClass}
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
            icon={<Save size={18} className="mr-2" />}
            onClick={handleProcess}
            disabled={loading || !formData.codeService}
            className="bg-indigo-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all border-none"
          />
        </div>
      </div>
    </Dialog>
  );
}
