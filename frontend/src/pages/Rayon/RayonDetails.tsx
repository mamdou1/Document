import React, { useEffect, useState } from "react";
import { getTraveByRayon } from "../../api/rayon";
import { Rayon, Box } from "../../interfaces";
import {
  BoxIcon,
  MapPin,
  Hash,
  Info,
  Archive,
  AlertCircle,
} from "lucide-react";
import { Dialog } from "primereact/dialog";

interface RayonDetailsProps {
  visible: boolean;
  onHide: () => void;
  rayon: Rayon | null;
}

const RayonDetails = ({ visible, onHide, rayon }: RayonDetailsProps) => {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && rayon?.id) {
      setLoading(true);
      getTraveByRayon(rayon.id)
        .then(setBoxes)
        .finally(() => setLoading(false));
    }
  }, [visible, rayon]);

  return (
    <Dialog
      header={
        <div className="flex items-center gap-3 text-slate-800">
          <Info className="text-blue-500" size={24} />
          <span className="font-bold">Détails du rayon</span>
        </div>
      }
      visible={visible}
      onHide={onHide}
      className="w-full max-w-2xl"
      breakpoints={{ "960px": "75vw", "641px": "90vw" }}
      modal
    >
      {rayon ? (
        <div className="space-y-6 pt-2">
          {/* Header Info Card */}
          <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white p-6 rounded-2xl shadow-md">
            <h1 className="text-2xl font-black mb-2">{rayon.code}</h1>
            <div className="flex flex-wrap gap-4 text-sm opacity-90">
              <div className="flex items-center gap-1">
                <Hash size={16} /> <span>Code: {rayon.code}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin size={16} />{" "}
                <span>Salle: {rayon.salle?.libelle || "Non définie"}</span>
              </div>
            </div>
          </div>

          {/* Boxes Section */}
          <div>
            <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
              <BoxIcon className="text-green-600" size={20} />
              Boxes rattachés ({boxes.length})
            </h2>

            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : boxes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {boxes.map((b) => {
                  const isFull =
                    Number(b.current_count) >= Number(b.capacite_max);
                  return (
                    <div
                      key={b.id}
                      className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-white hover:shadow-md transition-all group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-slate-700 group-hover:text-green-600 transition-colors">
                          {b.libelle}
                        </span>
                        <div
                          className={`h-2.5 w-2.5 rounded-full shadow-sm ${
                            isFull ? "bg-red-500" : "bg-green-500"
                          }`}
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                          <div
                            className={`h-1.5 rounded-full ${isFull ? "bg-red-500" : "bg-green-500"}`}
                            style={{
                              width: `${Math.min((Number(b.current_count) / Number(b.capacite_max)) * 100, 100)}%`,
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-slate-500 font-medium flex justify-between mt-1">
                          <span>
                            {b.current_count} / {b.capacite_max} documents
                          </span>
                          <span
                            className={isFull ? "text-red-500 font-bold" : ""}
                          >
                            {isFull ? "Complet" : "Disponible"}
                          </span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center p-10 border-2 border-dashed border-slate-200 rounded-2xl">
                <Archive size={40} className="mx-auto text-slate-300 mb-2" />
                <p className="text-slate-400">Aucun box sur cette étagère</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-10 text-slate-400">
          <AlertCircle size={48} className="mb-2" />
          <p>Aucune donnée sélectionnée</p>
        </div>
      )}
    </Dialog>
  );
};

export default RayonDetails;
