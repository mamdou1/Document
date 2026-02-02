import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import {
  User as UserIcon,
  Mail,
  Phone,
  Briefcase,
  Hash,
  Calendar,
  X,
  Shield,
  Building2,
} from "lucide-react";
import { User } from "../../interfaces";
import person from "../../assets/person-96.png";

type Props = {
  visible: boolean;
  onHide: () => void;
  user: User | null;
};

export default function UserDetails({ visible, onHide, user }: Props) {
  if (!user) return null;

  // Petit helper pour les lignes d'info
  const InfoRow = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: any;
    label: string;
    value: string | undefined;
  }) => (
    <div className="flex items-start gap-3 p-2">
      <div className="mt-1 bg-emerald-50 p-2 rounded-lg text-emerald-500">
        <Icon size={16} />
      </div>
      <div>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          {label}
        </span>
        <p className="text-sm font-semibold text-emerald-900">
          {value || "Non renseigné"}
        </p>
      </div>
    </div>
  );

  const fonction = user.fonction_details;
  const libelleEntitee =
    fonction?.entitee_trois?.libelle ||
    fonction?.entitee_deux?.libelle ||
    fonction?.entitee_un?.libelle ||
    "Aucune affectation";

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2 text-emerald-900 font-bold">
          <UserIcon size={20} className="text-emerald-500" />
          <span>Profil du membre</span>
        </div>
      }
      visible={visible}
      style={{ width: "650px" }}
      onHide={onHide}
      draggable={false}
      className="custom-dialog"
      footer={
        <div className="flex justify-end pt-2">
          <Button
            label="Fermer"
            icon={<X size={18} className="mr-2" />}
            onClick={onHide}
            className="bg-slate-100 text-slate-600 font-bold px-6 py-2 rounded-xl hover:bg-slate-200 transition-all border-none"
          />
        </div>
      }
    >
      <div className="space-y-6 pt-2">
        {/* Header: Photo & Nom */}
        <div className="flex flex-col items-center pb-4 border-b border-slate-100">
          <div className="relative">
            <img
              src={
                user.photo_profil
                  ? `http://localhost:5000/uploads/profiles/${user.photo_profil}`
                  : person
              }
              alt={user.nom}
              className="w-28 h-22 rounded-2xl border-4 border-white shadow-md object-cover"
            />
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-lg shadow-lg">
              <Shield size={16} />
            </div>
          </div>
          <h2 className="mt-4 text-xl font-bold  text-emerald-900 uppercase">
            {user.prenom} {user.nom}
          </h2>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-xs font-bold rounded-full mt-1 uppercase">
            {typeof user.droit === "string" ? user.droit : user.droit?.libelle}
          </span>
        </div>

        {/* Grille d'informations */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 ">
          <InfoRow icon={Building2} label="Structure" value={libelleEntitee} />
          {/* <InfoRow
            icon={LayoutList}
            label="Service"
            value={user.service || "-"}
          />
          <InfoRow
            icon={ToyBrick}
            label="Division"
            value={user.division || "-"}
          />
          <InfoRow
            icon={ListCheck}
            label="Section"
            value={user.section || "-"} 
          />*/}
          <InfoRow icon={Mail} label="Email" value={user.email} />
          <InfoRow icon={Phone} label="Téléphone" value={user.telephone} />
          {/* <InfoRow icon={Briefcase} label="Fonction" value={user.fonction} /> */}

          <InfoRow icon={Hash} label="Matricule" value={user.num_matricule} />
          <InfoRow
            icon={Calendar}
            label="Membre depuis"
            value={
              user.createdAt
                ? new Date(user.createdAt).toLocaleDateString("fr-FR")
                : undefined
            }
          />
          <InfoRow
            icon={Briefcase}
            label="Fonction"
            value={user.fonction_details?.libelle}
          />
        </div>

        {/* Section Dates Modernisée */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>Dernière mise à jour le : </span>
            <span className="font-bold">
              {user.updatedAt
                ? new Date(user.updatedAt).toLocaleDateString("fr-FR")
                : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
