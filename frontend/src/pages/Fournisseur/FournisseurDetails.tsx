import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import {
  Building2,
  Hash,
  MapPin,
  Phone,
  Calendar,
  Info,
  Bookmark,
} from "lucide-react";

export default function FournisseurDetails({
  visible,
  onHide,
  fournisseur,
}: any) {
  if (!fournisseur) return null;

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
            Sigle Entreprise
          </p>
          <h2 className="text-2xl font-black mb-4">{fournisseur.sigle}</h2>
          {/* <div className="flex items-center gap-2 bg-white/10 w-fit px-3 py-1 rounded-full text-xs backdrop-blur-md border border-white/20">
            <Hash size={12} /> {fournisseur.NIF}
          </div> */}
        </div>

        <div className="grid grid-cols-1 gap-3">
          <InfoCard
            icon={Hash}
            label="Numéro NIF"
            value={fournisseur.NIF || "-"}
            colorClass="text-purple-500"
          />
          <InfoCard
            icon={Bookmark}
            label="Raison Sociale"
            value={fournisseur.raisonSocial}
            colorClass="text-blue-600"
          />
          <InfoCard
            icon={MapPin}
            label="Adresse"
            value={fournisseur.adresse}
            colorClass="text-emerald-600"
          />
          <InfoCard
            icon={Phone}
            label="Contact Direct"
            value={fournisseur.numero}
            colorClass="text-orange-500"
          />
          <InfoCard
            icon={Info}
            label="Secteur d'activité"
            value={fournisseur.secteurActivite || "-"}
            colorClass="text-purple-500"
          />

          {/* <div className="mt-2 p-4 rounded-2xl bg-slate-100/50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar size={14} />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Référencé le :
              </span>
            </div>
            <span className="text-slate-600 font-bold text-xs">
              {fournisseur.createdAt
                ? new Date(fournisseur.createdAt).toLocaleDateString()
                : "Date inconnue"}
            </span>
          </div> */}
        </div>
      </div>
    </Dialog>
  );
}
