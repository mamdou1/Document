import React, { useRef, useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import {
  FileCheck,
  X,
  Printer,
  Folder,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Liquidation } from "../../interfaces";
import { updatePieceDisponibilite } from "../../api/liquidation";

type Props = {
  visible: boolean;
  onHide: () => void;
  liquidation: Liquidation | null;
};

export default function LiquidationDisponiblePieces({
  visible,
  onHide,
  liquidation,
}: Props) {
  const toast = useRef<Toast>(null);
  const [piecesState, setPiecesState] = useState<any[]>([]);
  const [expandedDivisions, setExpandedDivisions] = useState<
    Record<string, boolean>
  >({});

  const toggleDivision = (division: string) => {
    setExpandedDivisions((prev) => ({
      ...prev,
      [division]: !prev[division],
    }));
  };

  useEffect(() => {
    if (liquidation?.type && typeof liquidation.type !== "string") {
      if (liquidation?.type && typeof liquidation.type !== "string") {
        const typePieces = liquidation.type.pieces || [];
        const liqPieces = liquidation.pieces || [];

        const merged = typePieces.map((p: any) => {
          const lp = liqPieces.find((x: any) => x.id === p.id);

          return {
            ...p,
            LiquidationPieces: lp?.LiquidationPieces || { disponible: false },
          };
        });

        setPiecesState(merged);
      } else {
        setPiecesState([]);
      }
    } else {
      setPiecesState([]);
    }
    console.log("LIQUIDATION :", liquidation);
    console.log("PIECES :", liquidation?.type);
  }, [liquidation]);

  /* ================== TOGGLE DISPONIBILITÉ ================== */

  const togglePiece = async (index: number) => {
    if (!liquidation) return;

    const piece = piecesState[index];
    const newDisponible = !piece.LiquidationPieces?.disponible;

    const updatedPieces = [...piecesState];
    updatedPieces[index] = {
      ...piece,
      LiquidationPieces: {
        ...piece.LiquidationPieces,
        disponible: newDisponible,
      },
    };

    setPiecesState(updatedPieces);

    try {
      await updatePieceDisponibilite(liquidation.id!, piece.id, newDisponible);

      toast.current?.show({
        severity: "success",
        summary: "Mise à jour",
        detail: `${piece.libelle} : ${
          newDisponible ? "Disponible" : "Non disponible"
        }`,
      });
    } catch (err) {
      setPiecesState(piecesState);
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Échec de la mise à jour",
      });
    }
  };

  const handlePrint = () => window.print();

  // Dans LiquidationDisponiblePieces.tsx

  const groupedPieces = piecesState.reduce((acc: any, item: any) => {
    // On cherche la division soit à la racine, soit dans l'objet piece imbriqué
    const divisionObj = item.division || item.piece?.division;
    const divLibelle = divisionObj?.libelle || "AUTRES PIECES";

    if (!acc[divLibelle]) {
      acc[divLibelle] = [];
    }
    acc[divLibelle].push(item);
    return acc;
  }, {});

  if (!liquidation) return null;

  const getLabel = (field: any) =>
    typeof field === "object"
      ? field?.libelle || field?.sigle || field?.nom
      : field;

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={visible}
        onHide={onHide}
        style={{ width: "95vw", maxWidth: "1400px" }}
        header={false}
        showHeader={false} // Header personnalisé ci-dessous
        className="rounded-3xl overflow-hidden border-none shadow-2xl"
      >
        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-900 p-6 pt-10 -mx-6 -mt-6 mb-6 flex justify-between items-center text-white no-print">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <FileCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold uppercase">
                Contrôle de Conformité
              </h2>
              <p className="text-blue-200 text-xs font-mono">
                ID: {liquidation.id?.toString().slice(0, 8)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              icon={<Printer size={18} />}
              label="Imprimer"
              onClick={handlePrint}
              className="bg-white text-blue-800 font-bold"
            />

            <button onClick={onHide}>
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* COLONNE GAUCHE */}
          <div className="lg:col-span-4 space-y-3 max-h-[75vh] overflow-y-auto no-print pr-2">
            <h3 className="text-sm font-black text-slate-400 uppercase mb-4 px-2">
              Cocher les pièces reçues
            </h3>

            {Object.entries(groupedPieces).map(
              ([division, pieces]: [string, any]) => {
                const isExpanded = expandedDivisions[division] ?? false; // Ouvert par défaut

                return (
                  <div
                    key={division}
                    className="mb-3 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm"
                  >
                    {/* HEADER DE LA DIVISION (CLIQUABLE) */}
                    <div
                      onClick={() => toggleDivision(division)}
                      className="flex items-center justify-between p-3 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors border-b border-slate-100"
                    >
                      <div className="flex items-center gap-2">
                        <Folder size={16} className="text-blue-600" />
                        <span className="text-xs font-black uppercase text-slate-700 tracking-tight">
                          {division}
                        </span>
                        <span className="bg-slate-200 text-slate-600 text-[10px] px-1.5 py-0.5 rounded-full">
                          {pieces.length}
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </div>

                    {/* CONTENU : LISTE DES PIÈCES */}
                    {isExpanded && (
                      <div className="p-2 space-y-2 animate-in fade-in duration-300">
                        {pieces.map((p: any) => {
                          // On retrouve l'index global dans piecesState pour garder votre logique de togglePiece
                          const globalIndex = piecesState.findIndex(
                            (item) => item.id === p.id,
                          );
                          const isDisponible =
                            p.LiquidationPieces?.disponible ??
                            p.LiquidationPieces?.disponible ??
                            false;

                          return (
                            <div
                              key={p.id}
                              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                                isDisponible
                                  ? "bg-emerald-50 border-emerald-200"
                                  : "bg-white border-slate-100"
                              }`}
                            >
                              <Checkbox
                                checked={isDisponible}
                                onChange={() => togglePiece(globalIndex)}
                                className="flex-shrink-0 border border-blue-300"
                              />
                              <span
                                className={`text-xs font-semibold leading-tight ${
                                  isDisponible
                                    ? "text-emerald-900"
                                    : "text-slate-600"
                                }`}
                              >
                                {p.libelle}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              },
            )}
          </div>

          {/* COLONNE DROITE : FICHE DE LIQUIDATION (LA ZONE D'IMPRESSION) */}
          <div
            id="printable-area"
            className="lg:col-span-8 bg-white text-black p-4"
          >
            <table className="w-full border-collapse border-2 border-black text-sm">
              <tbody>
                {/* --- SECTION HAUT : DETAILS LIQUIDATION --- */}
                <tr>
                  <td className="border border-black p-2 font-bold w-1/3">
                    Type de dossier
                  </td>
                  <td className="border border-black p-2 uppercase font-medium">
                    {typeof liquidation.type === "object"
                      ? liquidation.type?.nom
                      : liquidation.type}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-bold">
                    N° de Dossier
                  </td>
                  <td className="border border-black p-2 font-mono">
                    {liquidation.numDossier}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-bold">
                    Bénéficiaire
                  </td>
                  <td className="border border-black p-2 uppercase">
                    {typeof liquidation.serviceBeneficiaire === "object"
                      ? liquidation.serviceBeneficiaire?.sigle ||
                        liquidation.serviceBeneficiaire?.libelle
                      : liquidation.serviceBeneficiaire}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-bold">Année</td>
                  <td className="border border-black p-2">
                    {liquidation.dateLiquidation
                      ? new Date(liquidation.dateLiquidation).getFullYear()
                      : "202X"}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-bold">Montant</td>
                  <td className="border border-black p-2 font-bold text-lg">
                    {liquidation.montant?.toLocaleString()} FCFA
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-bold">
                    Description
                  </td>
                  <td className="border border-black p-2 italic text-xs">
                    {liquidation.description ||
                      "Achat de fournitures et matériels..."}
                  </td>
                </tr>

                <tr className="bg-slate-100 print:bg-gray-200">
                  <td
                    className="border-2 border-black p-3 font-black text-center uppercase"
                    colSpan={2}
                  >
                    DEMANDE DE COTATION <br />
                    <span className="text-[10px] font-normal normal-case italic">
                      (Seuils réglementaires applicables)
                    </span>
                  </td>
                </tr>

                {/* --- SECTION MILIEU : TITRE DE LA PROCÉDURE --- */}
                <tr className="bg-slate-50">
                  <td
                    className="border-2 border-black p-3 font-black text-center uppercase"
                    colSpan={1}
                  >
                    SOURCE DE PRODUCTION <br />
                  </td>
                  <td className="border-2 border-black p-3 font-black text-center uppercase">
                    Observation
                  </td>
                </tr>

                {/* --- SECTION BAS : PIÈCES GROUPÉES PAR DIVISION --- */}
                {Object.entries(groupedPieces).map(
                  ([division, pieces]: [string, any]) => (
                    <React.Fragment key={division}>
                      {/* Ligne Titre de la Division */}
                      <tr className="bg-slate-100 print:bg-gray-200">
                        <td
                          className="border-2 text-center border-black p-2 font-black text-sm uppercase italic"
                          colSpan={2}
                        >
                          {division}
                        </td>
                      </tr>

                      {/* Liste des pièces de cette division */}
                      {pieces.map((p: any, idx: number) => {
                        return (
                          <tr key={p.id}>
                            <td className="border border-black p-2 text-xs">
                              - {p?.libelle || "Sans nom"}
                            </td>
                            <td className="border border-black p-2 text-center font-bold">
                              {p.LiquidationPieces?.disponible ? (
                                <span className="text-emerald-700">
                                  DISPONIBLE
                                </span>
                              ) : (
                                <span className="text-slate-300">
                                  NON DISPONIBLE
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ),
                )}
              </tbody>
            </table>

            {/* Zone de Signature (Visible à l'impression) */}
            <div className="mt-8 hidden print:grid grid-cols-2 gap-10 text-center text-[10px] font-bold uppercase">
              <div className="border-t-2 border-black pt-2">Le Liquidateur</div>
              <div className="border-t-2 border-black pt-2">
                Le Contrôleur Financier
              </div>
            </div>
          </div>
        </div>
      </Dialog>

      <style>
        {`@media print {
       .no-print { display: none !important; }
       
        #printable-area {

         width: 100%; 
         border: none; 
         padding: 0; 
         margin: 0; 
         } 
         #printable-area th { 
         font-size: 16pt !
         important; /* ✅ force la taille */ }
          body { 
          background: white; 
          
          } 

          table {
          width: 100%;
          font-size: 30pt; 
          border-collapse: collapse;
        }

          td, th {
            padding: 8px 10px;      /* ⬅ augmente la hauteur des lignes */
            line-height: 1.5;      /* ⬅ espace vertical du texte */
          }
          
          .p-dialog { 
          position: absolute !important; 
          left: 0 !important; 
          top: 0 !important; 
          margin: 0 !important; 
          padding: 0 !important; 
          width: 100% !important; 
          max-width: none !important; 
          box-shadow: none !important; 
          } 
           } `}
      </style>
    </>
  );
}
