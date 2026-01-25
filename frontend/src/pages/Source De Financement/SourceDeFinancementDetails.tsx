import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Building2, Bookmark, Calendar } from "lucide-react";

export default function SourceDeFinancementDetails({
  visible,
  onHide,
  sourceDeFinancement,
}: any) {
  if (!sourceDeFinancement) return null;

  const InfoCard = ({ icon: Icon, label, value, colorClass }: any) => (
    <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:border-blue-200 group">
      <div
        className={`p-2 bg-white rounded-lg shadow-sm group-hover:scale-110 transition-transform ${colorClass}`}
      >
        <Icon size={20} />
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
          {label}
        </p>
        <p className="text-slate-700 font-bold leading-tight">
          {value || "---"}
        </p>
      </div>
    </div>
  );

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2 text-blue-900 font-bold">
          <Building2 size={20} className="text-blue-500" />
          <span>Fiche Partenaire</span>
        </div>
      }
      visible={visible}
      style={{ width: "500px" }}
      onHide={onHide}
      draggable={false}
      footer={
        <Button
          label="Fermer"
          onClick={onHide}
          className="bg-slate-100 text-slate-600 font-bold px-8 py-2 rounded-xl hover:bg-slate-200 border-none transition-all"
        />
      }
    >
      <div className="pt-2 space-y-3 font-sans">
        {/* Banner Identification */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-2xl text-white shadow-lg mb-4">
          <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">
            Libelle
          </p>
          <h2 className="text-2xl font-black mb-4">
            {sourceDeFinancement.libelle}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <InfoCard
            icon={Calendar}
            label="Date de création"
            value={
              sourceDeFinancement.createdAt
                ? new Date(sourceDeFinancement.createdAt).toLocaleDateString(
                    "fr-FR",
                  )
                : "-"
            }
            colorClass="text-blue-600"
          />
        </div>
      </div>
    </Dialog>
  );
}
