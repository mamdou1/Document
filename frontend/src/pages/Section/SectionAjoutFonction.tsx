import React, { useState, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Save, PlusCircle, BookmarkPlus } from "lucide-react";
import { createFonction } from "../../api/fonction";
import { Toast } from "primereact/toast";

export default function SectionAjoutFonction({
  visible,
  onHide,
  section,
}: any) {
  const [libelle, setLibelle] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await createFonction({ libelle, section_id: section.id });
      setLibelle("");
      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Division créé",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <PlusCircle className="text-purple-500" size={20} /> Ajouter une
          fonction à la section
        </div>
      }
      visible={visible}
      style={{ width: "450px" }}
      onHide={onHide}
      draggable={false}
    >
      <div className="pt-4 space-y-5">
        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
          <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-1">
            Section cible
          </p>
          <p className="text-orange-900 font-bold">{section?.libelle}</p>
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
            <BookmarkPlus size={16} className="text-purple-500" /> Libellé du
            poste
          </label>
          <InputText
            value={libelle}
            onChange={(e) => setLibelle(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
            placeholder="Ex: Technicien de surface"
          />
        </div>
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button
            label="Ajouter"
            onClick={handleSubmit}
            className="bg-purple-600 text-white px-8 py-3 rounded-xl shadow-lg"
          />
        </div>
      </div>
    </Dialog>
  );
}
