import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import {
  Landmark,
  MapPin,
  Hash,
  Bookmark,
  Calendar,
  FileText,
  Info,
} from "lucide-react";

export default function ServiceBeneficiareDetails({
  visible,
  onHide,
  serviceBeneficiaire,
}: any) {
  if (!serviceBeneficiaire) return null;

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2 text-indigo-900 font-bold">
          <Info size={20} className="text-indigo-500" />
          <span>Détails du Service</span>
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
      <div className="pt-2 space-y-4">
        {/* Header de la fiche */}
        <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-lg">
          <div className="flex justify-between items-start mb-2">
            <Landmark size={32} className="opacity-50" />
            <span className="bg-white/20 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest">
              {serviceBeneficiaire.codeService}
            </span>
          </div>
          <h2 className="text-2xl font-black">{serviceBeneficiaire.sigle}</h2>
          <p className="text-indigo-100 text-sm mt-1">
            {serviceBeneficiaire.libelle}
          </p>
        </div>

        {/* Liste des infos */}

        <div className="space-y-3">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="p-2 bg-white rounded-lg text-indigo-500 shadow-sm">
              <Bookmark size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                Le libellé
              </p>
              <p className="text-slate-700 font-bold">
                {serviceBeneficiaire.libelle || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="p-2 bg-white rounded-lg text-indigo-500 shadow-sm">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                Adresse
              </p>
              <p className="text-slate-700 font-bold">
                {serviceBeneficiaire.adresse || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="p-2 bg-white rounded-lg text-indigo-500 shadow-sm">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                Date d'enregistrement
              </p>
              <p className="text-slate-700 font-bold">
                {serviceBeneficiaire.createdAt
                  ? new Date(serviceBeneficiaire.createdAt).toLocaleDateString(
                      "fr-FR",
                      { day: "numeric", month: "long", year: "numeric" }
                    )
                  : "-"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
