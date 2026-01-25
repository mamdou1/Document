import { useRef, useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
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
  Folders,
  ChevronDown,
  Folder,
  ChevronUp,
} from "lucide-react";
import type { Liquidation } from "../../interfaces";
import api from "../../api/axios";

type Props = {
  visible: boolean;
  onHide: () => void;
  liquidation: Liquidation | null;
};

export default function LiquidationUploadPieces({
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
  const [pieceFiles, setPieceFiles] = useState<Record<number, any[]>>({});
  //const [activePieceId, setActivePieceId] = useState<number | null>(null);
  const [expandedPieces, setExpandedPieces] = useState<Record<number, boolean>>(
    {},
  );

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

  /* ---------------- FILE SELECT ---------------- */
  const handleSelectFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    pieceId: string,
  ) => {
    const files = e.target.files?.[0];
    if (!files) return;
    setSelectedFiles((prev) => ({ ...prev, [pieceId]: files }));
    setPreviewOpen({ [pieceId]: true }); // On n'ouvre qu'un seul aperçu à la fois
  };

  /* ---------------- UPLOAD ---------------- */
  const handleUpload = async (pieceId: string) => {
    if (!liquidation) return;

    const file = selectedFiles[pieceId];
    if (!file) return;

    const typeId =
      typeof liquidation.type === "string"
        ? liquidation.type
        : liquidation.type.id;

    const formData = new FormData();
    formData.append("files", file);

    try {
      await api.post(
        `/liquidations/${liquidation.id}/type/${typeId}/piece/${pieceId}/files`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      // await loadPieceFiles(Number(pieceId));
      // setActivePieceId(Number(pieceId));

      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Fichier enregistré",
      });
      setPreviewOpen((prev) => ({ ...prev, [pieceId]: false }));
      setUploaded((prev) => ({ ...prev, [pieceId]: true }));
    } catch {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Échec de l’envoi",
      });
    }
  };

  if (!liquidation) return null;

  /* ================= LOAD FILES ================= */
  const loadPieceFiles = async (pieceId: number) => {
    if (!liquidation) return;

    const { data } = await api.get(
      `/liquidations/${liquidation.id}/piece/${pieceId}/files`,
    );

    setPieceFiles((prev) => ({
      ...prev,
      [pieceId]: Array.isArray(data) ? data : [],
    }));

    setUploaded((prev) => ({
      ...prev,
      [pieceId]: Array.isArray(data) && data.length > 0,
    }));
  };

  const togglePiece = async (pieceId: number) => {
    setExpandedPieces((prev) => ({
      ...prev,
      [pieceId]: !prev[pieceId],
    }));

    // Charger les fichiers seulement si pas déjà chargés
    if (!pieceFiles[pieceId]) {
      await loadPieceFiles(pieceId);
    }
  };

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

  // const handleSelectPiece = async (pieceId: number) => {
  //   setActivePieceId(pieceId);
  //   await loadPieceFiles(pieceId);
  // };

  /* ================= RENDER ================= */
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
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-6 pt-10 -mx-6 -mt-6 mb-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <FileUp size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                Dépôt des Justificatifs Physiques
              </h2>
              <p className="text-blue-200 text-xs uppercase opacity-80">
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
                      <div className="lg:col-span-4 space-y-3 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
                        {piecesState
                          .filter((p) => {
                            const isDisponible =
                              p.liquidation_pieces?.disponible ??
                              p.LiquidationPieces?.disponible ??
                              false;

                            return isDisponible;
                          })
                          .map((p) => (
                            <div
                              key={p.id}
                              onClick={() => togglePiece(p.id)}
                              className={`cursor-pointer p-4 rounded-2xl border transition ${
                                expandedPieces[p.id]
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-slate-100 bg-white"
                              }`}
                            >
                              <div className="flex flex-col">
                                <div className="flex ">
                                  <Folders
                                    size={18}
                                    className=" mr-2 text-blue-400"
                                  />
                                  <span className="text-sm font-bold text-slate-700">
                                    {p.libelle}
                                  </span>

                                  <div className="flex gap-2 ml-36">
                                    <input
                                      id={`file-${p.id}`}
                                      type="file"
                                      accept="application/pdf"
                                      hidden
                                      onChange={(e) =>
                                        handleSelectFile(e, p.id)
                                      }
                                    />

                                    <label
                                      htmlFor={`file-${p.id}`}
                                      onClick={(e) => e.stopPropagation()}
                                      className="cursor-pointer bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                                    >
                                      <FileText size={18} />
                                    </label>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 mt-1">
                                  {uploaded[p.id] ? (
                                    <>
                                      <CheckCircle2
                                        size={12}
                                        className="text-emerald-500"
                                      />
                                      <span className="text-[10px] text-emerald-600 font-bold uppercase">
                                        Présent
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <XCircle
                                        size={12}
                                        className="text-amber-500"
                                      />
                                      <span className="text-[10px] text-amber-600 font-bold uppercase">
                                        Manquant
                                      </span>
                                    </>
                                  )}
                                </div>

                                {expandedPieces[p.id] &&
                                  (pieceFiles[p.id]?.length > 0 ? (
                                    <div className="space-y-3 mt-3">
                                      {pieceFiles[p.id].map((f) => (
                                        <div
                                          key={f.id}
                                          className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm"
                                        >
                                          <span className="text-sm font-medium">
                                            {f.original_name}
                                          </span>

                                          <Button
                                            icon={<Eye size={16} />}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setViewer({
                                                visible: true,
                                                url: `http://localhost:5000/${f.fichier}`,
                                              });
                                            }}
                                            className="p-button-text"
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-slate-400 text-sm mt-3">
                                      Aucun fichier
                                    </p>
                                  ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                );
              },
            )}
          </div>

          <div className="lg:col-span-8 bg-slate-100 rounded-3xl border-2 border-dashed border-slate-300 flex items-center justify-center relative min-h-[500px]">
            {Object.entries(previewOpen).find(([_, isOpen]) => isOpen) ? (
              <div className="w-full h-full p-4 flex flex-col">
                {Object.entries(previewOpen).map(
                  ([id, isOpen]) =>
                    isOpen &&
                    selectedFiles[id] && (
                      <div key={id} className="flex flex-col h-full">
                        <div className="flex justify-between items-center mb-4 bg-white p-3 rounded-2xl shadow-sm">
                          <span className="text-sm font-bold">
                            <Send
                              size={14}
                              className="inline mr-2 text-blue-600"
                            />{" "}
                            Confirmer l'upload
                          </span>
                          <div className="flex gap-2">
                            <Button
                              label="Envoyer"
                              icon="pi pi-upload"
                              onClick={() => handleUpload(id)}
                              className="p-button-success p-button-sm rounded-lg"
                            />
                            <Button
                              icon="pi pi-times"
                              className="p-button-danger p-button-sm rounded-lg"
                              onClick={() => setPreviewOpen({ [id]: false })}
                            />
                          </div>
                        </div>
                        <iframe
                          src={URL.createObjectURL(selectedFiles[id]!)}
                          className="flex-1 rounded-xl bg-white border"
                          title="Aperçu"
                        />
                      </div>
                    ),
                )}
              </div>
            ) : viewer.url ? (
              <iframe
                src={viewer.url}
                width="100%"
                height="600"
                className="border-none rounded-xl"
                title="Viewer"
              />
            ) : (
              <div className="text-center">
                <FileSearch size={48} className="mx-auto text-slate-300 mb-2" />
                <p className="text-slate-400 text-sm">
                  Sélectionnez une pièce à gauche pour l'aperçu
                </p>
              </div>
            )}
          </div>
        </div>
      </Dialog>

      {/* <Dialog
        header="Visualisation"
        visible={viewer.visible}
        style={{ width: "70vw" }}
        onHide={() => setViewer({ visible: false, url: null })}
      >
        {viewer.url && (
          <iframe
            src={viewer.url}
            width="100%"
            height="600"
            className="border-none rounded-xl"
            title="Viewer"
          />
        )}
      </Dialog> */}
    </>
  );
}
