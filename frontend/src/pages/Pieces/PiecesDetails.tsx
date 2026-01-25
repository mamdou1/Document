import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import {
  FileText,
  Calendar,
  Info,
  CheckCircle2,
  Hash,
  Split,
} from "lucide-react";

export default function PiecesDetails({ visible, onHide, pieces }: any) {
  if (!pieces) return null;

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2 text-slate-800 font-bold">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <Info size={18} className="text-indigo-600" />
          </div>
          <span>Détails de la pièce</span>
        </div>
      }
      visible={visible}
      style={{ width: "450px" }}
      onHide={onHide}
      draggable={false}
      footer={
        <div className="flex justify-end p-2">
          <Button
            label="Fermer"
            onClick={onHide}
            className="bg-slate-100 text-slate-600 font-bold px-8 py-2 rounded-xl hover:bg-slate-200 border-none transition-all"
          />
        </div>
      }
    >
      <div className="pt-2">
        {/* Card Header Style - Indigo Theme */}
        <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl mb-6 flex flex-col items-center text-center">
          <div className="bg-indigo-600 text-white p-4 rounded-full shadow-lg shadow-indigo-200 mb-3">
            <Split size={32} />
          </div>
          <div className="flex">
            <h3 className="text-md font-black text-indigo-900 leading-tight">
              Source de production:
            </h3>
            <span className="flex gap-2 text-slate-500 italic font-bold text-sm ml-2">
              {pieces.division?.libelle || "Non défini"}
            </span>
          </div>
          {/* <span className="mt-2 text-xs font-mono font-bold bg-indigo-200 text-indigo-800 px-3 py-1 rounded-full border border-indigo-300">
            {pieces.code_pieces}
          </span> */}
        </div>

        {/* Info Grid */}
        <div className="space-y-4 px-2">
          {/* <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <CheckCircle2 size={16} className="text-indigo-500" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Statut
              </span>
            </div>
            <span className="text-indigo-700 text-sm font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
              Actif
            </span>
          </div> */}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <FileText size={16} className="text-indigo-500" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Libellé pièce
              </span>
            </div>
            <span className="mt-2 text-xs font-mono font-bold  text-indigo-800 px-3 py-1 ">
              {pieces.libelle}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <Hash size={16} className="text-indigo-500" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Code pièce
              </span>
            </div>
            <span className="mt-2 text-xs font-mono font-bold bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full border border-indigo-300">
              {pieces.code_pieces}
            </span>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
              Observation
            </p>
            <p className="text-xs text-slate-500 italic">
              Cette pièce est configurée pour être utilisée dans les processus
              de liquidation standards.
            </p>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
