import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import {
  FileText,
  Info,
  Hash,
  Split,
  Settings,
  Calendar,
  Type,
  File,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { getPieceMetaFields } from "../../api/pieceMetaField";
import type { PieceMetaField } from "../../interfaces";

export default function PiecesDetails({ visible, onHide, pieces }: any) {
  const [metaFields, setMetaFields] = useState<PieceMetaField[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && pieces?.id) {
      loadMetaFields();
    } else {
      setMetaFields([]);
    }
  }, [visible, pieces]);

  const loadMetaFields = async () => {
    if (!pieces?.id) return;
    setLoading(true);
    try {
      const fields = await getPieceMetaFields(pieces.id.toString());
      setMetaFields(fields);
    } catch (error) {
      console.error("Erreur chargement métadonnées:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!pieces) return null;

  const getFieldIcon = (type: string) => {
    switch (type) {
      case "date":
        return <Calendar size={14} className="text-amber-500" />;
      case "file":
        return <File size={14} className="text-blue-500" />;
      case "number":
        return <Hash size={14} className="text-purple-500" />;
      default:
        return <Type size={14} className="text-emerald-500" />;
    }
  };

  const getFieldTypeLabel = (type: string) => {
    switch (type) {
      case "date":
        return "Date";
      case "file":
        return "Fichier";
      case "number":
        return "Nombre";
      default:
        return "Texte";
    }
  };

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2 text-slate-800 font-bold">
          <div className="bg-emerald-100 p-2 rounded-lg">
            <Info size={18} className="text-emerald-600" />
          </div>
          <span>Détails de la pièce</span>
        </div>
      }
      visible={visible}
      style={{ width: "700px" }}
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
        {/* Card Header Style - emerald Theme */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 p-6 rounded-2xl mb-6 flex flex-col items-center text-center">
          <div className="bg-emerald-600 text-white p-4 rounded-full shadow-lg shadow-emerald-200 mb-3">
            <Split size={32} />
          </div>
          <h3 className="text-xl font-black text-emerald-900 mb-2">
            {pieces.libelle}
          </h3>
          <div className="bg-emerald-200/50 px-4 py-2 rounded-full">
            <span className="text-xs font-mono font-bold text-emerald-800">
              {pieces.code_pieces}
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="space-y-4 px-2">
          {/* Métadonnées configurées */}
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Settings size={16} className="text-emerald-600" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                Métadonnées configurées ({metaFields.length})
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
              </div>
            ) : metaFields.length > 0 ? (
              <div className="space-y-2">
                {metaFields.map((field) => (
                  <div
                    key={field.id}
                    className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 hover:border-emerald-200 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                        {getFieldIcon(field.field_type)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-700">
                          {field.label}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase">
                            {getFieldTypeLabel(field.field_type)}
                          </span>
                          {field.required ? (
                            <span className="text-[9px] font-black bg-red-50 text-red-500 px-1.5 py-0.5 rounded uppercase flex items-center gap-0.5">
                              <XCircle size={10} /> Obligatoire
                            </span>
                          ) : (
                            <span className="text-[9px] font-black bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded uppercase flex items-center gap-0.5">
                              <CheckCircle size={10} /> Optionnel
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      #{field.position + 1}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-white rounded-lg border border-dashed border-slate-200">
                <Settings size={24} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs text-slate-400 italic">
                  Aucune métadonnée configurée pour cette pièce
                </p>
                <p className="text-[10px] text-slate-300 mt-1">
                  Cliquez sur l'icône <span className="font-bold">⚙️</span> dans
                  la liste pour en ajouter
                </p>
              </div>
            )}
          </div>

          {/* Informations générales */}

          {/* Note d'observation */}
          <div className="pt-2">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
              <Info size={12} /> Observation
            </p>
            <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
              Cette pièce est configurée pour être utilisée dans les processus
              du traitement des dossiers.{" "}
              {metaFields.length > 0
                ? `Elle contient ${metaFields.length} champ${metaFields.length > 1 ? "s" : ""} de métadonnées à renseigner.`
                : "Aucune métadonnée spécifique n'est requise."}
            </p>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
