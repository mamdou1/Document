import { Dialog } from "primereact/dialog";
import { FileText, Tag, Hash, Calendar } from "lucide-react";
import { Button } from "primereact/button";

export default function DocumentDetails({ visible, onHide, doc }: any) {
  if (!doc) return null;

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2 text-blue-900">
          <FileText size={20} />
          <span className="font-bold">Consultation Document</span>
        </div>
      }
      visible={visible}
      style={{ width: "500px" }}
      onHide={onHide}
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
        {/* En-tête du document */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-2xl shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-black tracking-widest">
                Référence
              </span>
              <h2 className="text-2xl font-black text-white">
                #{String(doc.id).padStart(4, "0")}
              </h2>
            </div>
            <div className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-lg text-xs font-bold border border-blue-500/30">
              {doc.typeDocument?.nom}
            </div>
          </div>
        </div>

        {/* Liste des valeurs métadonnées */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Attributs du document
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {doc.values?.map((v: any) => (
              <div
                key={v.id}
                className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-blue-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-blue-500 group-hover:scale-110 transition-transform">
                    <Tag size={16} />
                  </div>
                  <span className="text-sm font-bold text-slate-600">
                    {v.metaField.label}
                  </span>
                </div>
                <span className="text-sm font-black text-blue-900">
                  {v.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
