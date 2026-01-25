import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Save, X, BookOpen, Hash, FileText, LayoutGrid } from "lucide-react";
import type { Chapitre, Programme } from "../../interfaces";

export default function ChapitreForm({
  visible,
  onHide,
  onSubmit,
  initial = {},
  title = "Créer chapitre",
  programmes,
}: any) {
  const [code_chapitre, setCode_chapitre] = useState(
    initial.code_chapitre || "",
  );
  const [description, setDescription] = useState(initial.description || "");
  const [libelle, setLibelle] = useState(initial.libelle || "");
  const [programme, setProgramme] = useState(
    initial.programme || programmes[0]?.id || "",
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setCode_chapitre(initial.code_chapitre || "");
      setLibelle(initial.libelle || "");
      setDescription(initial.description || "");
      setProgramme(initial.programme || programmes[0]?.id || "");
    }
  }, [visible, programmes]);

  const handleAction = async () => {
    setLoading(true);
    try {
      await onSubmit({ code_chapitre, libelle, programme, description });
      //onHide();
    } finally {
      setLoading(false);
    }
  };

  const labelStyle =
    "flex items-center gap-2 text-sm font-bold text-slate-700 mb-2";
  const inputStyle =
    "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800";

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2 text-blue-900 font-bold">
          <BookOpen size={20} className="text-blue-500" />
          <span>{title}</span>
        </div>
      }
      visible={visible}
      style={{ width: "580px" }}
      onHide={onHide}
      draggable={false}
    >
      <div className="pt-4 space-y-5">
        <div>
          <label className={labelStyle}>
            <LayoutGrid size={16} className="text-blue-500" /> Programme de
            rattachement
          </label>
          <Dropdown
            value={programme}
            options={programmes.map((p: any) => ({
              label: p.libelle,
              value: p.id,
            }))}
            onChange={(e) => setProgramme(e.value)}
            className="w-full bg-slate-50 border-slate-200 rounded-xl"
            placeholder="Sélectionner un programme"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <label className={labelStyle}>
              <Hash size={16} className="text-blue-500" /> Code
            </label>
            <InputText
              value={code_chapitre}
              onChange={(e) => setCode_chapitre(e.target.value)}
              className={inputStyle}
              placeholder="C-01"
            />
          </div>
          <div className="col-span-2">
            <label className={labelStyle}>Libellé du chapitre</label>
            <InputText
              value={libelle}
              onChange={(e) => setLibelle(e.target.value)}
              className={inputStyle}
              placeholder="Ex: Administration Générale"
            />
          </div>
        </div>

        <div>
          <label className={labelStyle}>
            <FileText size={16} className="text-blue-500" /> Description
          </label>
          <InputTextarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={`${inputStyle} resize-none`}
            placeholder="Précisez le périmètre de ce chapitre..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
          <Button
            label="Annuler"
            onClick={onHide}
            className="p-button-text text-slate-500 font-semibold px-4"
          />
          <Button
            label={loading ? "Enregistrement..." : "Enregistrer"}
            icon={!loading && <Save size={18} className="mr-2" />}
            onClick={handleAction}
            disabled={loading || !libelle || !code_chapitre}
            className="bg-blue-600 text-white font-bold px-8 py-2.5 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
          />
        </div>
      </div>
    </Dialog>
  );
}
