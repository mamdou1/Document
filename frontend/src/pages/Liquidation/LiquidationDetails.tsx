import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import {
  CircleDollarSign,
  FileText,
  User,
  Building2,
  Calendar,
  Layers,
  CheckCircle2,
  XCircle,
  Hash,
  Info,
} from "lucide-react";
import type { Liquidation } from "../../interfaces";

interface Props {
  visible: boolean;
  onHide: () => void;
  liquidation: Liquidation | null;
}

export default function LiquidationDetails({
  visible,
  onHide,
  liquidation,
}: Props) {
  if (!liquidation) return null;

  // Accès sécurisé aux données imbriquées (Postman structure)

  const typeData =
    typeof liquidation.type === "object" ? liquidation.type : null;

  const typePieces = typeData?.pieces || [];
  const liquidationPieces = liquidation.pieces || [];

  const pieces = typePieces.map((tp: any) => {
    const lp = liquidationPieces.find((p: any) => p.id === tp.id);

    return {
      ...tp,
      LiquidationPieces: lp?.LiquidationPieces || { disponible: false },
    };
  });

  const service = liquidation.serviceBeneficiaire;
  const fournisseur = liquidation.fournisseur;
  const source_de_financement = liquidation.sourceDeFinancement;

  const InfoCard = ({ icon: Icon, label, value, colorClass }: any) => (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100">
      <div className={`p-2 bg-white rounded-lg shadow-sm ${colorClass}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter mb-0.5">
          {label}
        </p>
        <p className="text-blue-900 font-bold text-xs leading-tight break-words">
          {value || "---"}
        </p>
      </div>
    </div>
  );

  return (
    <Dialog
      header={
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="text-blue-900 font-bold leading-none">
              Détails de Liquidation
            </h3>
            <p className="text-[11px] text-blue-400 font-medium mt-1 uppercase tracking-widest italic">
              Dossier N° {liquidation.numDossier}
            </p>
          </div>
        </div>
      }
      visible={visible}
      style={{ width: "95vw", maxWidth: "800px" }}
      onHide={onHide}
      draggable={false}
      blockScroll
      footer={
        <div className="flex justify-end p-2">
          <Button
            label="Fermer"
            onClick={onHide}
            className="bg-blue-600 text-white font-bold px-8 py-2.5 rounded-xl hover:bg-blue-700 border-none transition-all text-sm shadow-lg"
          />
        </div>
      }
    >
      <div className="space-y-6 pt-2 font-sans">
        {/* --- BANNER PRINCIPALE --- */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 rounded-3xl text-white shadow-xl">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center">
                <span className="text-blue-100/70 text-[10px] mr-2 font-bold uppercase tracking-[0.2em]">
                  Montant Total
                </span>
                <h2 className="text-3xl font-black mt-1 flex items-baseline gap-2">
                  {Number(liquidation.montant).toLocaleString()}
                  <span className="text-sm font-medium text-cyan-300">
                    FCFA
                  </span>
                </h2>
              </div>
              <p className="mt-4 text-blue-50 text-sm font-medium leading-relaxed italic opacity-90">
                Source de financement :{"  "}
                {typeof source_de_financement === "object"
                  ? source_de_financement.libelle
                  : source_de_financement || "Aucune "}
              </p>
              <p className="mt-4 text-blue-50 text-sm font-medium leading-relaxed italic opacity-90">
                Description : "
                {liquidation.description || "Aucune description fournie"}"
              </p>
            </div>

            <div className="flex flex-col justify-end md:items-end gap-2">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 w-full md:w-auto">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-400 flex items-center justify-center text-blue-900 font-black">
                    {typeof service === "object"
                      ? service.sigle?.substring(0, 2)
                      : "SB"}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-cyan-200 leading-none">
                      Bénéficiaire
                    </p>
                    <p className="text-sm font-bold">
                      {typeof service === "object" ? service.sigle : service}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <CircleDollarSign className="absolute -right-8 -bottom-8 text-white/5 w-48 h-48" />
        </div>

        {/* --- GRILLE D'INFORMATIONS --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <InfoCard
            icon={Building2}
            label="Fournisseur"
            value={
              typeof fournisseur === "object" ? fournisseur.sigle : fournisseur
            }
            colorClass="text-blue-600"
          />
          <InfoCard
            icon={Layers}
            label="Type Dossier"
            value={typeData?.nom}
            colorClass="text-indigo-600"
          />
          <InfoCard
            icon={Hash}
            label="Code Nature"
            value={
              typeof liquidation.nature === "object"
                ? liquidation.nature.code_nature
                : "N/A"
            }
            colorClass="text-emerald-600"
          />
          <InfoCard
            icon={Calendar}
            label="Date Création"
            value={
              liquidation.createdAt
                ? new Date(liquidation.createdAt).toLocaleDateString()
                : "---"
            }
            colorClass="text-amber-600"
          />
        </div>

        {/* --- TABLEAU DES PIÈCES --- */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Info size={16} className="text-blue-500" />
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Pièces requises pour ce type
            </h4>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Code
                  </th>
                  <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Libellé de la pièce
                  </th>
                  <th className="px-4 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Disponibilité
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pieces.map((p: any, idx: number) => {
                  const piece = p.piece || p;

                  const isDisponible =
                    p.liquidation_pieces?.disponible ??
                    p.LiquidationPieces?.disponible ??
                    false;

                  return (
                    <tr key={idx}>
                      <td className="px-4 py-3 font-mono text-[11px] text-blue-600 font-bold">
                        {piece.code_pieces}
                      </td>

                      <td className="px-4 py-3 text-xs font-semibold text-slate-700">
                        {piece.libelle}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {isDisponible ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                            <CheckCircle2 size={12} /> DISPONIBLE
                          </span>
                        ) : (
                          <span className="inline-flex w-32 items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
                            <XCircle size={12} /> NON DISPONIBLE
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
