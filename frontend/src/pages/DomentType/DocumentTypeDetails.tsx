import { Dialog } from "primereact/dialog";
import { FileText, Layers, Tag, ChevronRight } from "lucide-react";
import { Button } from "primereact/button";

export default function DocumentTypeDetails({ visible, onHide, type }: any) {
  if (!type) return null;

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2 text-blue-900">
          <Layers size={20} />
          <span className="font-bold">Détails de la Configuration</span>
        </div>
      }
      visible={visible}
      style={{ width: "450px" }}
      onHide={onHide}
      className="custom-dialog"
      footer={
        <div className="flex justify-end p-2">
          <Button
            label="Fermer"
            onClick={onHide}
            className="px-6 py-2 bg-slate-100 text-slate-700 border-none rounded-xl font-semibold hover:bg-slate-200"
          />
        </div>
      }
    >
      <div className="space-y-6 pt-2">
        {/* Header Type */}
        <div className="bg-gradient-to-br from-indigo-800 to-blue-900 p-5 rounded-2xl shadow-lg">
          <span className="text-blue-300 text-[10px] uppercase font-black tracking-widest">
            Type de document
          </span>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <FileText className="text-blue-400" size={24} /> {type.nom}
          </h2>
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2">
            <div className="bg-white/10 p-2 rounded-lg text-white">
              <Layers size={14} />
            </div>
            <div>
              <p className="text-[10px] text-blue-300 uppercase font-bold leading-none">
                Division rattachée
              </p>
              <p className="text-sm text-white font-bold">
                {type.division?.libelle || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Champs de métadonnées */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Champs configurés
          </h3>
          <div className="space-y-2">
            {type.metaFields?.length > 0 ? (
              type.metaFields.map((m: any) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <Tag size={14} className="text-blue-500" />
                    <span className="text-sm font-bold text-slate-700">
                      {m.label}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-black px-2 py-1 rounded-md ${m.required ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"}`}
                  >
                    {m.field_type?.toUpperCase() || ""}{" "}
                    {m.required && "• REQUIS"}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-400 italic text-sm py-4">
                Aucun champ configuré
              </p>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
