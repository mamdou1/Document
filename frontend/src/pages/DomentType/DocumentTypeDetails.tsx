import { Dialog } from "primereact/dialog";
import { FileText, Layers, Tag, ChevronRight, X, Hash } from "lucide-react";
import { Button } from "primereact/button";

export default function DocumentTypeDetails({ visible, onHide, type }: any) {
  if (!type) return null;

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      showHeader={false} // On fait notre propre header
      style={{ width: "480px" }}
      className="rounded-[2.5rem] overflow-hidden shadow-2xl"
    >
      <div className="relative">
        {/* HEADER PROFILE */}
        <div className="bg-gradient-to-br from-emerald-700 via-emerald-900 to-slate-900 p-8 pt-10">
          <button
            onClick={onHide}
            className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <div className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-emerald-200 text-[10px] font-black uppercase tracking-[0.2em] mb-3">
            Structure du Document
          </div>
          <h2 className="text-3xl font-black text-white leading-tight">
            {type.nom}
          </h2>
          <div className="flex items-center gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 border border-white/10">
              <Hash size={16} className="text-emerald-300" />
              <span className="text-white font-bold">{type.code}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 border border-white/10">
              <Layers size={16} className="text-emerald-300" />
              <span className="text-white font-bold">
                {type.division?.libelle || "N/A"}
              </span>
            </div>
          </div>
        </div>
        {/* CONTENT */}
        <div className="p-8 bg-white">
          <div className="space-y-3">
            {type.metaFields?.map((m: any) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-200" />
                  <span className="font-bold text-slate-700">{m.label}</span>
                </div>
                {/* ... */}
              </div>
            ))}
          </div>
          <Button
            label="Fermer la vue"
            onClick={onHide}
            className="w-full mt-8 py-4 bg-emerald-950 text-white font-bold rounded-2xl hover:bg-emerald-900 transition-all shadow-xl shadow-emerald-200"
          />
        </div>{" "}
      </div>
    </Dialog>
  );
}
