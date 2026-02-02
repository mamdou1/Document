import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Hash, Type, DoorOpen, Save } from "lucide-react";

export default function SalleForm({ visible, onHide, onSubmit, initial }: any) {
  const [formData, setFormData] = useState({ code_salle: "", libelle: "" });

  useEffect(() => {
    if (initial?.id)
      setFormData({ code_salle: initial.code_salle, libelle: initial.libelle });
    else setFormData({ code_salle: "", libelle: "" });
  }, [initial, visible]);

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={
        <div className="flex items-center gap-2">
          <DoorOpen className="text-emerald-600" size={20} />{" "}
          <span>{initial?.id ? "Modifier la salle" : "Nouvelle salle"}</span>
        </div>
      }
      className="w-full max-w-md"
      modal
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(formData);
        }}
        className="flex flex-col gap-5 pt-4"
      >
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-emerald-600 flex items-center gap-2">
            <Hash size={14} /> Code Salle
          </label>
          <InputText
            className="p-3 bg-emerald-50 border-emerald-200 rounded-xl"
            placeholder="Ex: SALLE-01"
            value={formData.code_salle}
            onChange={(e) =>
              setFormData({ ...formData, code_salle: e.target.value })
            }
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-emerald-600 flex items-center gap-2">
            <Type size={14} /> Libellé
          </label>
          <InputText
            className="p-3 bg-emerald-50 border-emerald-200 rounded-xl"
            placeholder="Ex: Salle des archives comptables"
            value={formData.libelle}
            onChange={(e) =>
              setFormData({ ...formData, libelle: e.target.value })
            }
            required
          />
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <Button
            type="button"
            label="Annuler"
            onClick={onHide}
            className="p-button-text text-emerald-400"
          />
          <Button
            type="submit"
            icon={<Save size={18} className="mr-2" />}
            label="Enregistrer"
            className="bg-emerald-600 text-white px-8 py-3 rounded-xl shadow-lg hover:bg-emerald-700 transition-all"
          />
        </div>
      </form>
    </Dialog>
  );
}
