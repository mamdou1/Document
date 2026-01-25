import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Tag, Hash, Bookmark, Info, Calendar, X } from "lucide-react";

export default function NatureDetails({ visible, onHide, nature }: any) {
  if (!nature) return null;

  const DetailRow = ({
    icon: Icon,
    label,
    value,
    color = "text-blue-600",
  }: any) => (
    <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
      <div className={`p-2 bg-white rounded-lg shadow-sm ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
          {label}
        </p>
        <p className="text-slate-700 font-semibold">{value || "---"}</p>
      </div>
    </div>
  );

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2 text-blue-900 font-bold">
          <Tag size={20} className="text-blue-500" />
          <span>Fiche Nature</span>
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
      <div className="space-y-3 pt-2">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 rounded-2xl text-white shadow-lg mb-4">
          <h2 className="text-xl font-bold leading-tight">{nature.libelle}</h2>
          <p className="text-emerald-100 text-sm mt-1 flex items-center gap-2">
            <Hash size={14} /> Code : {nature.code_nature}
          </p>
        </div>

        <DetailRow
          icon={Bookmark}
          label="Appartient au Chapitre"
          value={
            typeof nature.chapitre === "string"
              ? nature.chapitre
              : nature.chapitre?.libelle
          }
          color="text-emerald-600"
        />
        <DetailRow
          icon={Info}
          label="Description détaillée"
          value={nature.description}
          color="text-blue-500"
        />
        {/* <DetailRow
          icon={Calendar}
          label="Date de création"
          value={
            nature.createdAt
              ? new Date(nature.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "-"
          }
          color="text-slate-400"
        /> */}
      </div>
    </Dialog>
  );
}
