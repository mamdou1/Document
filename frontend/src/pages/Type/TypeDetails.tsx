import { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Type, Pieces, AddPiecesToTypePayload } from "../../interfaces";
import TypeAjoutPieces from "./TypeAjoutPieces";
import { addPiecesToType } from "../../api/type";
import {
  Info,
  Files,
  FileCheck,
  Calendar,
  PlusCircle,
  Settings2,
  Layers,
  ChevronDown,
  ChevronRight,
  GitMerge,
} from "lucide-react";
import { Toast } from "primereact/toast";
import { getPieces } from "../../api/pieces";

interface Props {
  visible: boolean;
  onHide: () => void;
  type: Type | null;
}

export default function TypeDetails({ visible, onHide, type }: Props) {
  const [piecesState, setPiecesState] = useState<any[]>([]);
  const [formPiecesVisible, setFormPiecesVisible] = useState(false);
  const [pieces, setPieces] = useState<Pieces[]>([]);
  const [expandedDivision, setExpandedDivision] = useState<string | null>(null);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    if (visible && type?.pieces) {
      setPiecesState(type.pieces);
    }
  }, [visible, type]);

  const affichage = async () => {
    try {
      const p = await getPieces();
      setPieces(Array.isArray(p) ? p : []);
    } catch (err: any) {
      console.error("Erreur chargement pièces", err);
    }
  };

  useEffect(() => {
    affichage();
  }, []);

  // --- LOGIQUE DE GROUPAGE CORRIGÉE ---

  // Pièces SANS division (on vérifie p.division directement)
  const piecesSansDivision = piecesState.filter((p) => !p.division?.libelle);

  // Pièces GROUPÉES par division
  const groupedPieces = piecesState.reduce((acc: Record<string, any[]>, p) => {
    // On accède à p.division (et non p.piece.division)
    const divLibelle = p.division?.libelle;
    if (divLibelle) {
      if (!acc[divLibelle]) acc[divLibelle] = [];
      acc[divLibelle].push(p);
    }
    return acc;
  }, {});

  const toggleDivision = (libelle: string) => {
    setExpandedDivision(expandedDivision === libelle ? null : libelle);
  };

  if (!type) return null;

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2 text-slate-800 font-bold">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Info size={18} className="text-blue-600" />
          </div>
          <span>Détails du Type de Dossier</span>
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
            className="bg-slate-800 text-white font-bold px-6 py-2 rounded-xl border-none hover:bg-slate-700 transition-all shadow-md"
          />
        </div>
      }
    >
      <div className="pt-2 space-y-6">
        {/* Header */}
        <div className="border-b border-slate-100 pb-4">
          <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
            / Configuration / Type
          </p>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              {type.nom}
              <span className="text-slate-600 text-sm font-mono font-normal bg-slate-100 px-2 py-1 rounded">
                #{type.codeType}
              </span>
            </h2>
          </div>
        </div>

        {/* 1. TABLEAU : PIÈCES SANS DIVISION */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pièces Générales (Hors Division)
            </p>
            <Button
              onClick={() => setFormPiecesVisible(true)}
              className="flex items-center gap-2 px-3 py-2 text-blue-600 font-bold bg-blue-50 hover:text-white hover:bg-blue-500 rounded-lg transition-all border-none"
            >
              <PlusCircle size={15} />
              <span className="text-xs">Ajouter</span>
            </Button>
          </div>

          {piecesSansDivision.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm bg-white">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="p-3 text-[10px] font-black text-slate-400 uppercase w-12">
                      #
                    </th>
                    <th className="p-3 text-[10px] font-black text-slate-400 uppercase">
                      Libellé
                    </th>
                    <th className="p-3 text-[10px] font-black text-slate-400 uppercase text-right">
                      Code
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {piecesSansDivision.map((item, index) => (
                    <tr
                      key={index}
                      className="group hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="p-3 text-xs font-bold text-slate-400">
                        {String(index + 1).padStart(2, "0")}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <FileCheck size={14} className="text-slate-300" />
                          <span className="text-sm font-bold text-slate-700">
                            {item.libelle}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <span className="text-[10px] font-mono bg-slate-50 px-2 py-1 rounded">
                          {item.code_pieces}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-4 text-slate-400 text-xs italic bg-slate-50 rounded-xl border border-dashed">
              Aucune pièce générale
            </p>
          )}
        </div>

        {/* 2. ACCORDÉON : PIÈCES PAR DIVISION */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Source de production des pièces
          </p>
          <div className="space-y-2">
            {Object.keys(groupedPieces).length > 0 ? (
              Object.entries(groupedPieces).map(([libelle, items]) => (
                <div
                  key={libelle}
                  className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm"
                >
                  <button
                    onClick={() => toggleDivision(libelle)}
                    className={`w-full flex items-center justify-between p-4 transition-all ${expandedDivision === libelle ? "bg-blue-50/50" : "hover:bg-slate-50"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${expandedDivision === libelle ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"}`}
                      >
                        <Layers size={16} />
                      </div>
                      <span
                        className={`font-bold text-sm ${expandedDivision === libelle ? "text-blue-700" : "text-slate-700"}`}
                      >
                        {libelle}
                      </span>
                      <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full">
                        {items.length}
                      </span>
                    </div>
                    {expandedDivision === libelle ? (
                      <ChevronDown size={18} className="text-blue-500" />
                    ) : (
                      <ChevronRight size={18} className="text-slate-400" />
                    )}
                  </button>

                  {expandedDivision === libelle && (
                    <div className="p-3 bg-slate-50/30 border-t border-slate-50 space-y-1 animate-in slide-in-from-top-2 duration-200">
                      {items.map((sec, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 ml-8 p-2 text-sm text-slate-600 hover:text-blue-600 transition-colors"
                        >
                          <GitMerge size={14} className="text-slate-300" />
                          <span className="font-medium">{sec.libelle}</span>
                          <span className="ml-auto text-[10px] font-mono text-slate-400">
                            {sec.code_pieces}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm italic">
                  Aucune division rattachée aux pièces
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Note informative */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50/50 border border-blue-100/50">
          <div className="p-1.5 bg-blue-500 rounded-lg">
            <Settings2 size={15} className="text-white" />
          </div>
          <p className="text-[12px] text-blue-700 font-medium leading-tight">
            Ces pièces seront systématiquement demandées pour le type{" "}
            <b>{type.nom}</b>.
          </p>
        </div>
      </div>

      <TypeAjoutPieces
        visible={formPiecesVisible}
        onHide={() => setFormPiecesVisible(false)}
        onSubmit={async (id, payload) => {
          await addPiecesToType(id, payload);
          affichage();
          setFormPiecesVisible(false);
        }}
        initial={type}
        title={"Ajouter des pièces au dossier"}
        pieces={pieces}
      />
    </Dialog>
  );
}
