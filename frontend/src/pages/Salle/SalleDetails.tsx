import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { getEtageresBySalle } from "../../api/salle";
import { Etagere, Salle } from "../../interfaces";
import { Layers, MapPin, Hash, Info, Archive, WavesLadder } from "lucide-react";

export default function SalleDetails({
  visible,
  onHide,
  salle,
}: {
  visible: boolean;
  onHide: () => void;
  salle: Salle | null;
}) {
  const [etageres, setEtageres] = useState<Etagere[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && salle?.id) {
      setLoading(true);
      getEtageresBySalle(salle.id)
        .then(setEtageres)
        .finally(() => setLoading(false));
    }
  }, [visible, salle]);

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={
        <div className="flex items-center gap-2">
          <Info className="text-indigo-500" size={20} />{" "}
          <span>Vue d'ensemble de la salle</span>
        </div>
      }
      className="w-full max-w-3xl"
      modal
    >
      {salle && (
        <div className="space-y-6 pt-2">
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white p-6 rounded-2xl shadow-md flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black mb-1">{salle.libelle}</h1>
              <div className="flex items-center gap-3 text-sm opacity-80">
                <span className="flex items-center gap-1">
                  <Hash size={14} /> {salle.code_salle}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={14} /> Site Principal
                </span>
              </div>
            </div>
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm text-center">
              <span className="block text-2xl font-black">
                {etageres.length}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider">
                Étagères
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2 italic">
              <Layers className="text-indigo-600" size={18} /> Étagères
              installées dans cet espace
            </h2>

            {loading ? (
              <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : etageres.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {etageres.map((etg) => (
                  <div
                    key={etg.id}
                    className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-white hover:shadow-md transition-all flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-700">{etg.libelle}</p>
                      <p className="text-xs text-indigo-500 font-mono font-medium">
                        {etg.code_etagere}
                      </p>
                    </div>
                    <div className="bg-indigo-50 p-2 rounded-lg text-indigo-400">
                      <Layers size={16} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-2xl">
                <WavesLadder
                  size={40}
                  className="mx-auto text-slate-200 mb-2"
                />
                <p className="text-slate-400 text-sm">
                  Aucune étagère configurée pour cette salle.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </Dialog>
  );
}
