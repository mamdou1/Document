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
  CloudUpload,
  Layers,
  Archive,
} from "lucide-react";
import type { Document, Pieces, TypeDocumentPiece } from "../../interfaces";
import api from "../../api/axios";

type Props = {
  visible: boolean;
  onHide: () => void;
  document: Document | null;
};

type ModeChargement = "INDIVIDUEL" | "LOT_UNIQUE";

export default function DocumentUploadPieces({
  visible,
  onHide,
  document,
}: Props) {
  const toast = useRef<Toast>(null);
  const [uploadMode, setUploadMode] = useState<ModeChargement>("INDIVIDUEL");

  const [lotFiles, setLotFiles] = useState<any[]>([]);
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
  const [expandedPieces, setExpandedPieces] = useState<Record<number, boolean>>(
    {},
  );
  const [expandedDivisions, setExpandedDivisions] = useState<
    Record<string, boolean>
  >({});

  /* ================= CHARGEMENT INITIAL ================= */
  useEffect(() => {
    console.log("📦 DOCUMENT REÇU:", document);

    if (!document) {
      setPiecesState([]);
      return;
    }

    const dossierPieces = document.pieces || [];
    console.log("📂 document.pieces =", dossierPieces);

    const merged = dossierPieces.map((p: any) => {
      return {
        ...p,
        disponible: p.DocumentPieces?.disponible ?? true,
      };
    });

    console.log("✅ MERGED PIECES =", merged);
    setPiecesState(merged);
  }, [document]);

  /* ================= CHARGEMENT DES FICHIERS LOT ================= */
  const loadLotUniqueFiles = async () => {
    if (!document) return;
    try {
      const { data } = await api.get(
        `/documents/${document.id}/lot-unique/files`,
      );
      setLotFiles(Array.isArray(data) ? data : []);
      console.log(`📦 ${data.length} fichiers lot chargés`);
    } catch (error) {
      console.error("Erreur chargement fichiers lot:", error);
    }
  };

  /* ================= DÉTECTION DU MODE ================= */
  const detectUploadMode = async () => {
    if (!document) return;

    try {
      const [uniqueRes] = await Promise.all([
        api.get(`/documents/${document.id}/lot-unique/files`),
      ]);

      const uniqueFiles = uniqueRes.data || [];

      if (uniqueFiles.length > 0) {
        setUploadMode("LOT_UNIQUE");
        setLotFiles(uniqueFiles);
      } else {
        setUploadMode("INDIVIDUEL");
      }
    } catch (error) {
      console.error("Erreur détection mode:", error);
    }
  };

  useEffect(() => {
    if (visible && document) {
      detectUploadMode();
    }
  }, [visible, document]);

  useEffect(() => {
    if (uploadMode === "LOT_UNIQUE") loadLotUniqueFiles();
  }, [uploadMode]);

  useEffect(() => {
    setPreviewOpen({});
    setViewer({ visible: false, url: null });
  }, [uploadMode]);

  const toggleDivision = (division: string) => {
    setExpandedDivisions((prev) => ({
      ...prev,
      [division]: !prev[division],
    }));
  };

  /* ================= FILE SELECT ================= */
  const handleSelectFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    pieceId: string,
  ) => {
    const files = e.target.files?.[0];
    if (!files) return;
    setSelectedFiles((prev) => ({ ...prev, [pieceId]: files }));
    setPreviewOpen({ [pieceId]: true });
  };

  const handleSelectLotFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files?.[0];
    if (!files) return;
    setSelectedFiles((prev) => ({ ...prev, LOT_UNIQUE: files }));
    setPreviewOpen({ LOT_UNIQUE: true });
  };

  /* ================= UPLOAD ================= */
  const handleUpload = async (pieceId: string) => {
    if (!document) return;

    const file = selectedFiles[pieceId];
    if (!file) return;

    const typeId = document.type_document_id;
    const formData = new FormData();

    // Mode LOT_UNIQUE
    if (pieceId === "LOT_UNIQUE") {
      formData.append("upload_mode", "LOT_UNIQUE");
      formData.append("files", file);

      try {
        await api.post(
          `/documents/${document.id}/document-type/${typeId}/lot-unique/files`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } },
        );

        toast.current?.show({
          severity: "success",
          summary: "Succès",
          detail: "Dossier complet enregistré",
        });

        await loadLotUniqueFiles();
        setPreviewOpen({});
        setUploaded((prev) => ({ ...prev, LOT_UNIQUE: true }));
      } catch {
        toast.current?.show({
          severity: "error",
          summary: "Erreur",
          detail: "Échec de l’envoi du dossier",
        });
      }
    } else {
      // Mode INDIVIDUEL
      formData.append("files", file);

      try {
        await api.post(
          `/documents/${document.id}/document-type/${typeId}/piece/${pieceId}/files`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } },
        );

        await loadPieceFiles(Number(pieceId));

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
    }
  };

  /* ================= LOAD FILES ================= */
  const loadPieceFiles = async (pieceId: number) => {
    if (!document) return;

    try {
      const { data } = await api.get(
        `/documents/${document.id}/piece/${pieceId}/files`,
      );

      setPieceFiles((prev) => ({
        ...prev,
        [pieceId]: Array.isArray(data) ? data : [],
      }));

      setUploaded((prev) => ({
        ...prev,
        [pieceId]: Array.isArray(data) && data.length > 0,
      }));
    } catch (error) {
      console.error("Erreur chargement fichiers pièce:", error);
    }
  };

  const togglePiece = async (pieceId: number) => {
    setExpandedPieces((prev) => ({
      ...prev,
      [pieceId]: !prev[pieceId],
    }));

    if (!pieceFiles[pieceId]) {
      await loadPieceFiles(pieceId);
    }
  };

  if (!document) return null;

  const groupedPieces = piecesState.reduce((acc: any, item: any) => {
    const divisionObj = item.division || item.piece?.division;
    const divLibelle = divisionObj?.libelle || "AUTRES PIECES";

    if (!acc[divLibelle]) {
      acc[divLibelle] = [];
    }
    acc[divLibelle].push(item);
    return acc;
  }, {});

  console.log("📊 piecesState =", piecesState);
  console.log("🗂 groupedPieces =", groupedPieces);

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={visible}
        onHide={onHide}
        style={{ width: "95vw", maxWidth: "1400px" }}
        header={false}
        showHeader={false}
        className="rounded-3xl overflow-hidden border-none shadow-2xl"
      >
        {/* HEADER */}
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 p-6 pt-10 -mx-6 -mt-6 mb-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <FileUp size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                Dépôt des Justificatifs Physiques
              </h2>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-100 mt-1">
                <span>Document #{document.id}</span>
                <span className="h-1 w-1 rounded-full bg-emerald-300"></span>
                <span className="uppercase font-bold">
                  Mode:{" "}
                  {uploadMode === "LOT_UNIQUE"
                    ? "📦 LOT UNIQUE"
                    : "📄 PAR PIÈCE"}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onHide}
            className="hover:bg-white/20 p-2 rounded-full transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* CONTENU PRINCIPAL - 2 COLONNES */}
        <div className="flex flex-1 overflow-hidden p-2 gap-6 h-[calc(100vh-200px)]">
          {/* ================= COLONNE GAUCHE ================= */}
          <div className="w-1/3 h-full overflow-y-auto pr-2 custom-scrollbar">
            {/* SÉLECTEUR DE MODE */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm mb-6">
              <label className="text-[10px] font-black uppercase text-slate-400 mb-3 block tracking-widest">
                Mode de chargement
              </label>
              <div className="flex flex-col gap-4">
                <select
                  value={uploadMode}
                  onChange={(e) =>
                    setUploadMode(e.target.value as ModeChargement)
                  }
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 ring-emerald-500/20"
                >
                  <option value="INDIVIDUEL">📄 PAR PIÈCE INDIVIDUELLE</option>
                  <option value="LOT_UNIQUE">
                    📦 DOSSIER COMPLET (LOT UNIQUE)
                  </option>
                </select>

                {/* Zone upload LOT UNIQUE */}
                {uploadMode === "LOT_UNIQUE" && (
                  <div className="mt-2 animate-in fade-in zoom-in duration-200">
                    <input
                      type="file"
                      id="lot-unique-upload"
                      hidden
                      accept="application/pdf"
                      onChange={handleSelectLotFile}
                    />
                    <label
                      htmlFor="lot-unique-upload"
                      className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-emerald-200 rounded-2xl bg-emerald-50/50 hover:bg-emerald-50 cursor-pointer transition-all group"
                    >
                      <CloudUpload
                        className="text-emerald-500 group-hover:scale-110 transition-transform"
                        size={24}
                      />
                      <span className="text-sm font-bold text-emerald-700">
                        Sélectionner le PDF du dossier complet
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* AFFICHAGE DES FICHIERS LOT UNIQUE */}
            {uploadMode === "LOT_UNIQUE" && (
              <div className="mt-4 space-y-3">
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                  <Archive size={14} /> Documents du dossier complet
                </h3>

                {lotFiles.length > 0 ? (
                  lotFiles.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <FileText size={18} className="text-emerald-500" />
                        <span className="text-xs font-medium truncate w-40">
                          {f.original_name}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setViewer({
                            visible: true,
                            url: `http://localhost:5000/${f.fichier}`,
                          });
                        }}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Archive
                      size={32}
                      className="mx-auto text-slate-300 mb-2"
                    />
                    <p className="text-xs text-slate-400 italic">
                      Aucun dossier complet déposé
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* LISTE DES PIÈCES - MODE INDIVIDUEL */}
            {uploadMode === "INDIVIDUEL" && (
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                  <Folders size={14} /> Nomenclature des pièces
                </h3>

                {Object.entries(groupedPieces).map(
                  ([division, pieces]: [string, any]) => {
                    const isExpanded = expandedDivisions[division] ?? true;

                    return (
                      <div
                        key={division}
                        className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm"
                      >
                        <div
                          onClick={() => toggleDivision(division)}
                          className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Folder size={18} className="text-emerald-500" />
                            <span className="text-xs font-black text-slate-700 uppercase">
                              {division}
                            </span>
                            <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full">
                              {pieces.length}
                            </span>
                          </div>
                          {isExpanded ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </div>

                        {isExpanded && (
                          <div className="p-2 space-y-1">
                            {pieces
                              .filter((p: any) => p.disponible !== false)
                              .map((p: any) => (
                                <div
                                  key={p.id}
                                  onClick={() => togglePiece(p.id)}
                                  className={`cursor-pointer p-3 rounded-2xl border transition-all ${
                                    expandedPieces[p.id]
                                      ? "border-emerald-500 bg-emerald-50/50"
                                      : "border-transparent hover:bg-slate-50"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      {uploaded[p.id] ||
                                      pieceFiles[p.id]?.length > 0 ? (
                                        <CheckCircle2
                                          size={16}
                                          className="text-emerald-500"
                                        />
                                      ) : (
                                        <div className="h-4 w-4 rounded-full border-2 border-slate-200" />
                                      )}
                                      <span className="text-sm font-bold text-slate-700">
                                        {p.libelle}
                                      </span>
                                    </div>

                                    <div onClick={(e) => e.stopPropagation()}>
                                      <input
                                        id={`file-${p.id}`}
                                        type="file"
                                        accept="application/pdf"
                                        hidden
                                        onChange={(e) =>
                                          handleSelectFile(e, p.id.toString())
                                        }
                                      />
                                      <label
                                        htmlFor={`file-${p.id}`}
                                        className="cursor-pointer bg-emerald-50 text-emerald-600 p-2 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"
                                      >
                                        <FileText size={18} />
                                      </label>
                                    </div>
                                  </div>

                                  {expandedPieces[p.id] && pieceFiles[p.id] && (
                                    <div className="mt-3 pl-7 space-y-2">
                                      {pieceFiles[p.id].length > 0 ? (
                                        pieceFiles[p.id].map((f) => (
                                          <div
                                            key={f.id}
                                            className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100"
                                          >
                                            <span className="text-xs font-medium truncate w-40">
                                              {f.original_name}
                                            </span>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setViewer({
                                                  visible: true,
                                                  url: `http://localhost:5000/${f.fichier}`,
                                                });
                                              }}
                                              className="text-emerald-600 hover:text-emerald-800"
                                            >
                                              <Eye size={16} />
                                            </button>
                                          </div>
                                        ))
                                      ) : (
                                        <p className="text-xs text-slate-400 italic">
                                          Aucun fichier
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </div>

          {/* ================= COLONNE DROITE - APERÇU ================= */}
          <div className="flex-1 h-full bg-slate-100 rounded-[40px] border border-slate-200 shadow-xl flex flex-col overflow-hidden">
            {Object.values(previewOpen).some((v) => v) ? (
              <div className="flex-1 flex flex-col">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-emerald-600 text-white">
                  <div>
                    <h3 className="font-bold flex items-center gap-2">
                      <CloudUpload size={20} />
                      Validation du document
                    </h3>
                    <p className="text-xs text-emerald-100 mt-1 uppercase font-bold">
                      Mode :{" "}
                      {uploadMode === "LOT_UNIQUE"
                        ? "📦 LOT UNIQUE"
                        : "📄 PIÈCE INDIVIDUELLE"}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      label="Annuler"
                      onClick={() => setPreviewOpen({})}
                      className="p-button-text text-white font-bold"
                    />
                    <Button
                      label="Confirmer & Envoyer"
                      icon="pi pi-check"
                      className="bg-white text-emerald-600 border-none rounded-2xl px-6 font-black"
                      onClick={() => {
                        const id = Object.keys(previewOpen).find(
                          (k) => previewOpen[k],
                        );
                        if (id) handleUpload(id);
                      }}
                    />
                  </div>
                </div>
                <div className="flex-1 p-4 bg-slate-800">
                  <iframe
                    src={URL.createObjectURL(
                      selectedFiles[
                        Object.keys(previewOpen).find((k) => previewOpen[k])!
                      ]!,
                    )}
                    className="w-full h-full rounded-2xl shadow-2xl border-none"
                    title="Aperçu avant upload"
                  />
                </div>
              </div>
            ) : viewer.url ? (
              <div className="flex-1 flex flex-col">
                <div className="p-4 flex justify-between items-center border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Eye size={14} /> Consultation archive
                  </span>
                  <Button
                    icon="pi pi-times"
                    rounded
                    text
                    onClick={() => setViewer({ visible: false, url: null })}
                  />
                </div>
                <iframe
                  src={viewer.url}
                  className="flex-1 w-full border-none"
                  title="Viewer"
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <FileSearch size={64} className="text-slate-200" />
                </div>
                <h4 className="text-xl font-bold text-slate-400">
                  En attente de sélection
                </h4>
                <p className="max-w-xs text-slate-400 mt-2 text-sm">
                  {uploadMode === "LOT_UNIQUE"
                    ? "Chargez le dossier complet PDF ou sélectionnez une pièce"
                    : "Sélectionnez une pièce pour charger son justificatif"}
                </p>
              </div>
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
}
