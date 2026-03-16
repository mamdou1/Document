import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Save, X, Info } from "lucide-react";
import type { Droit } from "../../interfaces";
import { BookOpenCheck } from "lucide-react";

type Props = {
  visible: boolean;
  onHide: () => void;
  onSubmit: (data: Partial<Droit>) => Promise<void>;
  //refresh: () => void;
  initial?: Partial<Droit>;
  title?: string;
};
//,nnnnn

export default function DroitForm({
  visible,
  onHide,
  onSubmit,
  //refresh,
  initial = {},
  title = "Créer un droit",
}: Props) {
  const [libelle, setLibelle] = useState(initial.libelle || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) setLibelle(initial.libelle || "");
  }, [visible]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit({ libelle });
      //onHide();
      //refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      header={<div className="text-emerald-900 font-bold">{title}</div>}
      visible={visible}
      style={{ width: "400px" }}
      onHide={onHide}
      draggable={false}
      className="custom-dialog"
    >
      <div className="pt-4 space-y-6">
        <div className="relative">
          <label className="flex items-center gap-1 text-sm font-bold text-slate-700 mb-2">
            Libéllé <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <InputText
              value={String(libelle)}
              //keyfilter="int"
              onChange={(e) => setLibelle(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-lg font-semibold text-emerald-900"
              placeholder="Technicien, auditeur,..."
            />
            {/* <InputText
                                value={libelle}
                                onChange={(e) => setLibelle(e.target.value)}
                                placeholder="Description ou objet de la dépense"
                                className="p-3 rounded-xl  border-emerald-300  border-2 mx-2 focus:border-emerald-200 focus:ring-0 focus:border-4 shadow-sm"
                              /> */}
            <BookOpenCheck
              className="absolute right-4 top-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
              size={20}
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <Info size={12} /> Libéllé de l'autorisation.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            label="Annuler"
            icon={<X size={18} className="mr-2" />}
            onClick={onHide}
            className="p-button-text text-slate-500 hover:text-slate-800 font-semibold py-2 px-4 rounded-xl"
          />
          <Button
            label={loading ? "Enregistrement..." : "Enregistrer l'exercice"}
            icon={!loading && <Save size={18} className="mr-2" />}
            disabled={loading || !libelle}
            onClick={handleSubmit}
            className="bg-emerald-600 text-white font-bold py-2 px-6 rounded-xl hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-all"
          />
        </div>
      </div>
    </Dialog>
  );
}
