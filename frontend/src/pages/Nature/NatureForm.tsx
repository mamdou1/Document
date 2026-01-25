import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Tag, Bookmark, Hash, Info, Save, LayoutGrid } from "lucide-react";

export default function NatureForm({
  visible,
  onHide,
  onSubmit,
  initial = {},
  title = "Créer nature",
  chapitres,
}: any) {
  const [code_nature, setCode_nature] = useState(initial.code_nature || "");
  const [description, setDescription] = useState(initial.description || "");
  const [libelle, setLibelle] = useState(initial.libelle || "");
  const [chapitre, setChapitre] = useState(
    initial.chapitre || chapitres[0]?.id || "",
  );
  const [loading, setLoading] = useState(false);

  const selectedChapitre = Array.isArray(chapitres)
    ? chapitres.find((c: any) => c.id === chapitre)
    : null;

  const progLibelle =
    selectedChapitre && typeof selectedChapitre.programme === "object"
      ? selectedChapitre.programme.libelle
      : "";

  useEffect(() => {
    if (visible) {
      setCode_nature(initial.code_nature || "");
      setLibelle(initial.libelle || "");
      setChapitre(initial.chapitre || chapitres[0]?.id || "");
      setDescription(initial.description || "");
    }
  }, [visible, chapitres]);

  const handleAction = async () => {
    setLoading(true);
    try {
      await onSubmit({ code_nature, libelle, chapitre, description });
      ////onHide();
    } finally {
      setLoading(false);
    }
  };

  const labelStyle =
    "flex items-center gap-2 text-sm font-bold text-slate-700 mb-2";
  const inputStyle =
    "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none";

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2 text-blue-900 font-bold">
          <Tag size={20} className="text-blue-500" />
          <span>{title}</span>
        </div>
      }
      visible={visible}
      style={{ width: "550px" }}
      onHide={onHide}
      draggable={false}
    >
      <div className="pt-4 space-y-5">
        {/* Info Programme Hérité */}
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center gap-4">
          <div className="bg-white p-2 rounded-lg text-blue-600 shadow-sm">
            <LayoutGrid size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
              Programme de référence
            </p>
            <p className="text-blue-800 font-bold text-sm truncate w-[350px]">
              {progLibelle}
            </p>
          </div>
        </div>

        <div>
          <label className={labelStyle}>
            <Bookmark size={16} className="text-blue-500" /> Chapitre Parent
          </label>
          <Dropdown
            value={chapitre}
            options={chapitres.map((c: any) => ({
              label: c.libelle,
              value: c.id,
            }))}
            onChange={(e) => setChapitre(e.value)}
            className="w-full bg-slate-50 border-slate-200 rounded-xl"
            placeholder="Sélectionner le chapitre"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <label className={labelStyle}>
              <Hash size={16} className="text-blue-500" /> Code
            </label>
            <InputText
              value={code_nature}
              onChange={(e) => setCode_nature(e.target.value)}
              className={inputStyle}
            />
          </div>
          <div className="col-span-2">
            <label className={labelStyle}>Libellé Nature</label>
            <InputText
              value={libelle}
              onChange={(e) => setLibelle(e.target.value)}
              className={inputStyle}
            />
          </div>
        </div>

        <div>
          <label className={labelStyle}>
            <Info size={16} className="text-blue-500" /> Description
          </label>
          <InputTextarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={`${inputStyle} resize-none`}
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
          <Button
            label="Annuler"
            onClick={onHide}
            className="p-button-text text-slate-500 font-semibold"
          />
          <Button
            label={loading ? "Enregistrement..." : "Enregistrer la nature"}
            icon={!loading && <Save size={18} className="mr-2" />}
            onClick={handleAction}
            disabled={loading || !libelle}
            className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
          />
        </div>
      </div>
    </Dialog>
  );
}
