import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Type, Save, X, Info } from "lucide-react";

type StructureTitles = {
  entitee1: string;
  entitee2: string;
  entitee3: string;
};

type Props = {
  visible: boolean;
  onHide: () => void;
  titles: StructureTitles;
  setTitles: (titles: StructureTitles) => void;
  onSave?: () => void;
};

export default function StructureForm({
  visible,
  onHide,
  titles,
  setTitles,
  onSave,
}: Props) {
  const [loading, setLoading] = useState(false);
  const handleInputChange = (key: keyof StructureTitles, value: string) => {
    setTitles({ ...titles, [key]: value });
  };

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      showHeader={false}
      style={{ width: "700px" }}
      className="rounded-[2.5rem] overflow-hidden shadow-2xl border-none"
      contentClassName="p-0 bg-white"
    >
      <div className="relative">
        {/* HEADER DU FORMULAIRE */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-900 p-8 text-white relative overflow-hidden">
          {/* Motif décoratif en arrière-plan */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />

          <button
            onClick={onHide}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 backdrop-blur-md rounded-lg">
              <Type size={20} className="text-emerald-100" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200">
              Configuration
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            Titres des Entités
          </h2>
        </div>

        {/* CORPS DU FORMULAIRE */}
        <div className="p-8 space-y-6">
          <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 mb-2">
            <Info size={18} className="text-emerald-600 mt-0.5 shrink-0" />
            <p className="text-[11px] text-emerald-800 font-medium leading-relaxed">
              Modifiez ici les noms qui apparaîtront sur vos cartes de gestion
              et dans les formulaires d'ajout.
            </p>
          </div>

          <div className="space-y-5">
            {/* CHAMP ENTITÉ 1 */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Libellé Niveau 1
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={titles.entitee1}
                  onChange={(e) =>
                    handleInputChange("entitee1", e.target.value)
                  }
                  placeholder="Ex: Direction..."
                  className="w-full pl-4 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none font-bold text-slate-700 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* CHAMP ENTITÉ 2 */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Libellé Niveau 2
              </label>
              <input
                type="text"
                value={titles.entitee2}
                onChange={(e) => handleInputChange("entitee2", e.target.value)}
                placeholder="Ex: Division..."
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none font-bold text-slate-700 transition-all shadow-sm"
              />
            </div>

            {/* CHAMP ENTITÉ 3 */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Libellé Niveau 3
              </label>
              <input
                type="text"
                value={titles.entitee3}
                onChange={(e) => handleInputChange("entitee3", e.target.value)}
                placeholder="Ex: Service..."
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none font-bold text-slate-700 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* ACTIONS */}
          {/* <div className="pt-4 flex gap-3">
            <Button
              label="Annuler"
              onClick={onHide}
              className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl border-none transition-all outline-none"
            />
            <Button
              onClick={() => {
                if (onSave) onSave();
                onHide();
              }}
              className="flex-3 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl border-none shadow-lg shadow-emerald-200 transition-all outline-none"
            >
              <div className="flex items-center justify-center gap-2 w-full">
                <Save size={18} />
                <span>Enregistrer</span>
              </div>
            </Button>
          </div> */}
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 mt-4">
            <Button
              label="Annuler"
              icon={<X size={16} className="mr-2" />}
              onClick={onHide}
              className="p-button-text text-slate-500 font-bold hover:bg-slate-100 px-4 py-2 rounded-xl transition-all"
              disabled={loading}
            />
            <Button
              label={loading ? "Enregistrement..." : "Enregistrer le type"}
              icon={!loading && <Save size={18} className="mr-2" />}
              onClick={() => {
                if (onSave) onSave();
                onHide();
              }}
              loading={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-8 py-3 rounded-xl shadow-lg shadow-emerald-200 transition-all font-bold"
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
}
