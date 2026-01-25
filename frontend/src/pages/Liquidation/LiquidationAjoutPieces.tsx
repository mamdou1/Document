import { useRef, useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import {
  FileUp,
  Eye,
  CheckCircle2,
  XCircle,
  FileText,
  Send,
  X,
  FileSearch,
} from "lucide-react";
import type { Liquidation } from "../../interfaces";
import api from "../../api/axios";
import { updatePieceDisponibilite } from "../../api/liquidation";

type Props = {
  visible: boolean;
  onHide: () => void;
  liquidation: Liquidation | null;
};

export default function LiquidationAjoutPieces({
  visible,
  onHide,
  liquidation,
}: Props) {
  const toast = useRef<Toast>(null);
  const [piecesState, setPiecesState] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<
    Record<string, File | null>
  >({});
  const [previewOpen, setPreviewOpen] = useState<Record<string, boolean>>({});
  const [uploaded, setUploaded] = useState<Record<string, boolean>>({});
  const [viewer, setViewer] = useState<{
    visible: boolean;
    url: string | null;
  }>({ visible: false, url: null });

  // useEffect(() => {
  //   if (!liquidation) return;
  //   setPiecesState(liquidation.Pieces ?? []);
  //   const uploadedInit: Record<string, boolean> = {};
  //   liquidation.Pieces?.forEach((p: any) => {
  //     if (p.LiquidationPieces?.fichier) uploadedInit[p.id] = true;
  //   });
  //   setUploaded(uploadedInit);
  // }, [liquidation]);

  const togglePiece = async (index: number) => {
    setPiecesState((prev) =>
      prev.map((piece, i) =>
        i === index
          ? {
              ...piece,
              LiquidationPieces: {
                ...piece.LiquidationPieces,
                disponible: !piece.LiquidationPieces?.disponible,
              },
            }
          : piece
      )
    );
    const piece = piecesState[index];
    const newDisponible = !piece.LiquidationPieces?.disponible;
    try {
      await updatePieceDisponibilite(liquidation!.id!, piece.id, newDisponible);
      toast.current?.show({
        severity: "success",
        summary: "OK",
        detail: `Disponibilité mise à jour (${newDisponible ? "✔" : "✘"})`,
      });
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: err?.response?.data?.message || "Impossible de mettre à jour",
      });
    }
  };

  const handleSelectFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    pieceId: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFiles((prev) => ({ ...prev, [pieceId]: file }));
    setPreviewOpen((prev) => ({ ...prev, [pieceId]: true }));
  };

  const handleUpload = async (pieceId: string) => {
    try {
      const file = selectedFiles[pieceId];
      if (!file) return;
      const formData = new FormData();
      formData.append("file", file);
      await api.post(
        `/liquidations/${liquidation?.id}/pieces/${pieceId}/upload`,
        formData
      );

      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Pièce enregistrée",
      });
      setPreviewOpen((p) => ({ ...p, [pieceId]: false }));
      setUploaded((p) => ({ ...p, [pieceId]: true }));
    } catch {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Échec de l’envoi",
      });
    }
  };

  if (!liquidation) return null;

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={visible}
        onHide={onHide}
        style={{ width: "95vw", maxWidth: "1400px" }}
        header={false}
        className="rounded-3xl overflow-hidden border-none shadow-2xl"
      >
        {/* Header Personnalisé style Sidebar */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-6 -mx-6 -mt-6 mb-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <FileUp size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                Gestion des Justificatifs
              </h2>
              <p className="text-blue-200 text-xs font-medium uppercase tracking-widest opacity-80">
                Dossier N° {liquidation.numDossier}
              </p>
            </div>
          </div>
          <button
            onClick={onHide}
            className="hover:bg-white/20 p-2 rounded-full transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Colonne de gauche : Liste des pièces */}
          <div className="lg:col-span-5 space-y-3 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
            {(piecesState ?? []).map((p, index) => {
              const pieceId = p.id;
              const disponible = p.LiquidationPieces?.disponible ?? false;
              const isUploaded = uploaded[pieceId];

              return (
                <div
                  key={pieceId}
                  className={`relative group flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    disponible
                      ? "bg-white border-blue-100 shadow-sm hover:border-blue-300"
                      : "bg-slate-50 border-slate-200 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={disponible}
                      onChange={() => togglePiece(index)}
                      className="custom-checkbox border border-blue-300"
                    />
                    <div>
                      <span
                        className={`block text-sm font-bold ${
                          disponible ? "text-slate-700" : "text-slate-400"
                        }`}
                      >
                        {p.libelle}
                      </span>
                      {disponible && (
                        <span className="flex items-center gap-1 mt-1">
                          {isUploaded ? (
                            <>
                              <CheckCircle2
                                size={12}
                                className="text-emerald-500"
                              />{" "}
                              <span className="text-[10px] text-emerald-600 font-bold uppercase">
                                Téléchargé
                              </span>
                            </>
                          ) : (
                            <>
                              <XCircle size={12} className="text-amber-500" />{" "}
                              <span className="text-[10px] text-amber-600 font-bold uppercase">
                                Manquant
                              </span>
                            </>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {disponible && (
                    <div className="flex gap-2">
                      {!isUploaded ? (
                        <>
                          <input
                            id={`file-${pieceId}`}
                            type="file"
                            accept="application/pdf"
                            hidden
                            onChange={(e) => handleSelectFile(e, pieceId)}
                          />
                          <label
                            htmlFor={`file-${pieceId}`}
                            className="flex items-center gap-2 cursor-pointer bg-blue-50 text-blue-600 px-3 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-all text-xs font-bold"
                          >
                            <FileText size={14} /> Choisir
                          </label>
                        </>
                      ) : (
                        <Button
                          icon={<Eye size={16} />}
                          label="Voir"
                          onClick={() =>
                            setViewer({
                              visible: true,
                              url: `http://localhost:5000/uploads/${p.LiquidationPieces.fichier}`,
                            })
                          }
                          className="p-button-text p-button-sm text-blue-600 font-bold"
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Colonne de droite : Zone de Travail / Aperçu */}
          <div className="lg:col-span-7 bg-slate-50 rounded-3xl border border-slate-200 border-dashed flex items-center justify-center relative min-h-[500px]">
            {Object.keys(previewOpen).some((id) => previewOpen[id]) ? (
              // Affichage du PDF sélectionné mais pas encore envoyé
              <div className="w-full h-full p-4 flex flex-col">
                {Object.entries(previewOpen).map(
                  ([id, isOpen]) =>
                    isOpen &&
                    selectedFiles[id] && (
                      <div key={id} className="flex flex-col h-full">
                        <div className="flex justify-between items-center mb-4 bg-white p-3 rounded-2xl shadow-sm border border-blue-100">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 text-white rounded-lg">
                              <Send size={16} />
                            </div>
                            <span className="text-sm font-bold text-slate-700">
                              Confirmation d'envoi
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              label="Envoyer au serveur"
                              icon="pi pi-check"
                              onClick={() => handleUpload(id)}
                              className="bg-emerald-100 text-emerald-600 hover:bg-emerald-200 p-2 border-none rounded-xl text-xs"
                            />
                            <Button
                              icon="pi pi-times"
                              severity="danger"
                              onClick={() => {
                                setPreviewOpen((p) => ({ ...p, [id]: false }));
                                setSelectedFiles((p) => ({ ...p, [id]: null }));
                              }}
                              className="rounded-xl p-button-outlined"
                            />
                          </div>
                        </div>
                        <iframe
                          src={URL.createObjectURL(selectedFiles[id]!)}
                          className="flex-1 w-full rounded-2xl border shadow-inner bg-white"
                          title="Aperçu"
                        />
                      </div>
                    )
                )}
              </div>
            ) : (
              // Zone vide
              <div className="text-center p-10">
                <div className="mx-auto w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 mb-4 border-4 border-white shadow-sm">
                  <FileSearch size={32} />
                </div>
                <h3 className="text-slate-600 font-bold italic">
                  Aucun aperçu disponible
                </h3>
                <p className="text-slate-400 text-sm max-w-xs mx-auto">
                  Veuillez sélectionner une pièce à gauche pour prévisualiser le
                  document avant l'envoi.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            label="Terminer la gestion"
            onClick={onHide}
            className="bg-slate-800 border-none px-10 py-3 rounded-xl font-bold shadow-lg hover:bg-slate-900 transition-all text-white"
          />
        </div>
      </Dialog>

      {/* Visualiseur plein écran */}
      <Dialog
        header="Visualisation Documentaire"
        visible={viewer.visible}
        style={{ width: "80vw" }}
        onHide={() => setViewer({ visible: false, url: null })}
        className="rounded-3xl"
      >
        {viewer.url && (
          <iframe
            src={viewer.url}
            width="100%"
            height="700"
            className="border-none rounded-xl shadow-inner"
            title="Viewer"
          />
        )}
      </Dialog>
    </>
  );
}
