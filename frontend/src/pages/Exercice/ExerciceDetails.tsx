import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Calendar, Clock, Edit3 } from "lucide-react"; // Ajout d'icônes
import type { Exercice } from "../../interfaces";

type Props = {
  visible: boolean;
  onHide: () => void;
  exercice: Exercice | null;
};

export default function ExerciceDetails({ visible, onHide, exercice }: Props) {
  if (!exercice) return null;

  const formatDate = (date: string | undefined) =>
    date
      ? new Date(date).toLocaleString("fr-FR", {
          dateStyle: "long",
          timeStyle: "short",
        })
      : "-";

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2 text-blue-900">
          <Calendar size={20} />
          <span>Détails de l'Exercice</span>
        </div>
      }
      visible={visible}
      style={{ width: "450px" }}
      onHide={onHide}
      draggable={false}
      resizable={false}
      className="custom-dialog"
      footer={
        <div className="flex justify-end p-2">
          <Button
            label="Fermer"
            onClick={onHide}
            className="px-6 py-2 bg-slate-100 text-slate-700 border-none hover:bg-slate-200 transition-all rounded-xl font-semibold"
          />
        </div>
      }
    >
      <div className="space-y-4 pt-2">
        {/* Année mise en avant */}
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center justify-between">
          <span className="text-blue-700 font-semibold italic text-sm uppercase tracking-wider">
            Année budgétaire
          </span>
          <span className="text-3xl font-black text-blue-900">
            {exercice.annee}
          </span>
        </div>

        {/* Dates avec icônes */}
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">
                Date de création
              </p>
              <p className="text-sm font-semibold text-slate-800">
                {formatDate(exercice.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <Edit3 size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">
                Dernière modification
              </p>
              <p className="text-sm font-semibold text-slate-800">
                {formatDate(exercice.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
