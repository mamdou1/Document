import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Layout from "../../components/layout/Layoutt";
import DocumentForm from "./DocumentForm";
import DocumentDetails from "./DocumentDetails";
import { confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import {
  Plus,
  Eye,
  Trash2,
  FileText,
  Search,
  FileStack,
  Check,
  CloudDownload,
  FileUp,
  Layers,
} from "lucide-react";
import { getMetaById } from "../../api/metaField";
import {
  getDocuments,
  createDocument,
  deleteDocument,
} from "../../api/document";
import { getTypeDocuments } from "../../api/typeDocument";
import { Dropdown } from "primereact/dropdown";
import Pagination from "../../components/layout/Pagination";
import api from "../../api/axios";
import DocumentPiece from "./DocumentPieces";
import UploadPreview from "./UploadPreview";
import { TypeDocument } from "../../interfaces";
import DocumentUploadPieces from "./DocumentUploadPieces";
import DocumentDisponiblePieces from "./DocumentDisponiblePieces";

export default function DocumentPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [types, setTypes] = useState<TypeDocument[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const toast = useRef<Toast>(null);
  const [documentType_id, setDocumentType_id] = useState<number | null>(null);
  const [metaFields, setMetaFields] = useState<any[]>([]);

  // 1. Ajouter une ref pour l'input file caché
  const [pieceVisible, setPieceVisible] = useState(false);

  const [tempFile, setTempFile] = useState<File | null>(null);
  const [targetDocId, setTargetDocId] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [ajoutVisible, setAjoutVisible] = useState(false);
  const [disponibleVisible, setDisponibleVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const typeIdFormUrl = params.get("typeId");

    if (typeIdFormUrl) {
      setDocumentType_id(Number(typeIdFormUrl));
    }
  }, [location.search]);

  const load = async () => {
    const [resDocs, resTypes] = await Promise.all([
      getDocuments(),
      getTypeDocuments(),
    ]);
    setDocs(resDocs);
    setTypes(resTypes.typeDocument);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (documentType_id) {
      getMetaById(String(documentType_id)).then(setMetaFields);
    } else {
      setMetaFields([]);
    }
  }, [documentType_id]);

  const handleSubmit = async (payload: any) => {
    try {
      const cr = await createDocument(payload);
      setDocs((s) => [cr, ...s]);
      setFormVisible(false);
      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Document archivé avec succès",
      });
      return cr;
    } catch (e) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Impossible de créer le document",
      });
    }
  };

  const handleDelete = (id: string) => {
    confirmDialog({
      message:
        "Voulez-vous supprimer ce document définitivement ? Cette action est irréversible.",
      header: "Confirmation",
      icon: "pi pi-info-circle", // Icône plus neutre, ou gardez pi-exclamation-triangle

      // --- Personnalisation des labels ---
      acceptLabel: "Supprimer",
      rejectLabel: "Annuler",

      // --- Styling des boutons ---
      // Ajout de classes de mise en page (flexbox) et de style
      acceptClassName: "p-button-danger p-button-raised p-button-rounded p-2",
      rejectClassName:
        "p-button-secondary p-button-outlined p-button-rounded mr-4 p-2",

      // --- Style du dialogue lui-même (optionnel) ---
      style: { width: "450px" },
      accept: async () => {
        await deleteDocument(id);
        setDocs((s) => s.filter((x) => String(x.id) !== String(id)));
        toast.current?.show({ severity: "success", summary: "Supprimé" });
      },
    });
  };

  const handleDirectUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    docId: string,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !docId) return;

    setTempFile(file);
    setTargetDocId(docId);
    setPreviewVisible(true); // Ouvre la prévisualisation au lieu d'envoyer
  };

  // 3. Créer la fonction de confirmation finale
  const confirmUpload = async () => {
    if (!tempFile || !targetDocId) return;

    const formData = new FormData();
    formData.append("files", tempFile);

    try {
      await api.post(`/documents/${targetDocId}/files`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.current?.show({
        severity: "success",
        summary: "Fichier uploadé avec succès",
      });
      setPreviewVisible(false);
      setTempFile(null);
      load(); // Recharger la liste
    } catch (err) {
      toast.current?.show({ severity: "error", summary: "Échec de l'envoi" });
    }
  };

  const filtered = docs.filter((d) => {
    const matchQuery = `${d.id} ${d.typeDocument?.nom}`
      .toLowerCase()
      .includes(query.toLowerCase());

    const matchType = documentType_id
      ? d.typeDocument?.id === documentType_id
      : true;

    return matchQuery && matchType;
  });

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <Layout>
      <Toast ref={toast} />

      {/* Header Page */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-emerald-950 flex items-center gap-3">
            <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200">
              <FileStack size={24} />
            </div>
            Gestion des Documents
          </h1>
          <p className="text-emerald-600/70 text-sm mt-1 ml-16 font-medium">
            Consultez et archivez vos documents administratifs
          </p>
        </div>
        <Button
          label="Nouveau Document"
          icon={<Plus size={18} className="mr-2" />}
          onClick={() => {
            setSelected(null);
            setFormVisible(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-6 py-3 rounded-xl shadow-lg shadow-emerald-200 transition-all font-bold"
        />
      </div>

      {/* Barre de recherche et Filtre */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 group-focus-within:text-emerald-600 transition-colors"
            size={18}
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par référence ou type..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-emerald-100 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-medium text-emerald-900"
          />
        </div>

        <div className="bg-emerald-50/50 p-2 rounded-2xl border border-emerald-100 flex items-center px-4">
          <Layers size={18} className="text-emerald-600 mr-3" />
          <Dropdown
            value={documentType_id}
            options={types}
            onChange={(e) => setDocumentType_id(e.value)}
            optionLabel="nom"
            optionValue="id"
            placeholder="Trier par type de dossier"
            className="w-full bg-transparent border-none shadow-none focus:ring-0"
            filter
          />
        </div>
      </div>

      {/* Table stylisée */}
      <div className="bg-white rounded-[2rem] border border-emerald-100 shadow-xl shadow-emerald-900/5 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-emerald-50/30 border-b border-emerald-50">
              <th className="p-5 text-[11px] font-black text-emerald-800 uppercase tracking-widest w-24">
                Réf.
              </th>
              {metaFields.map((m) => (
                <th
                  key={m.id}
                  className="p-5 text-[11px] font-black text-emerald-800 uppercase tracking-widest"
                >
                  {m.label}
                </th>
              ))}
              <th className="p-5 text-[11px] font-black text-emerald-800 uppercase tracking-widest text-center">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-emerald-50">
            {documentType_id &&
              filtered.map((d) => (
                <tr
                  key={d.id}
                  onClick={() => {
                    setSelected(d);
                    setDetailsVisible(true);
                  }}
                  className="cursor-pointer group hover:bg-emerald-50/40 transition-colors"
                >
                  <td className="p-5">
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-xs font-bold border border-emerald-200">
                      #{String(d.id).padStart(3, "0")}
                    </span>
                  </td>

                  {metaFields.map((m) => {
                    const value = d.values?.find(
                      (v: any) => v.metaField?.id === m.id,
                    )?.value;
                    return (
                      <td
                        key={m.id}
                        className="p-5 text-sm text-emerald-900 font-medium"
                      >
                        {value || <span className="text-emerald-200">---</span>}
                      </td>
                    );
                  })}

                  <td className="p-5">
                    <div
                      className="flex justify-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* <input
                        type="file"
                        onChange={(e) => handleDirectUpload(e, d.id)}
                        className="hidden"
                        id={`upload-${d.id}`}
                      />
                      <label
                        htmlFor={`upload-${d.id}`}
                        className="p-2.5 text-emerald-400 hover:text-emerald-700 hover:bg-emerald-100 rounded-xl transition-all cursor-pointer"
                        title="Uploader"
                      >
                        <FileUp size={20} />
                      </label>

                      <button
                        onClick={() => {
                          setSelected(d);
                          setPieceVisible(true);
                        }}
                        className="p-2.5 text-emerald-400 hover:text-emerald-700 hover:bg-emerald-100 rounded-xl transition-all"
                      >
                        <Eye size={20} />
                      </button> */}

                      <button
                        onClick={(e) => {
                          setSelected(d);

                          setDisponibleVisible(true);
                          e.stopPropagation();
                        }}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-white rounded-lg transition-all"
                        title="Contrôle de la disponiblitédes pièces"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          setSelected(d);
                          setAjoutVisible(true);
                          e.stopPropagation();
                        }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all"
                        title="Chargement des fichiers"
                      >
                        <CloudDownload size={18} />
                      </button>

                      <button
                        onClick={() => handleDelete(d.id)}
                        className="p-2.5 text-emerald-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* Empty States */}
        {!documentType_id && (
          <div className="p-20 text-center">
            <div className="inline-flex p-6 bg-emerald-50 rounded-full mb-4 text-emerald-200">
              <FileText size={48} />
            </div>
            <p className="text-emerald-800 font-bold text-lg">
              Prêt à consulter ?
            </p>
            <p className="text-emerald-500 text-sm">
              Sélectionnez un type de document pour commencer l'exploration.
            </p>
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalItems={filtered.length}
        onPageChange={setCurrentPage}
      />

      <DocumentForm
        visible={formVisible}
        onHide={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        documentType={types}
        selectedTypeId={documentType_id}
      />
      <DocumentDetails
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        doc={selected}
      />

      <DocumentPiece
        visible={pieceVisible}
        onHide={() => setPieceVisible(false)}
        document={selected}
      />

      <UploadPreview
        visible={previewVisible}
        onHide={() => {
          setPreviewVisible(false);
          setTempFile(null);
        }}
        file={tempFile}
        onConfirm={confirmUpload}
      />
      <DocumentUploadPieces
        visible={ajoutVisible}
        onHide={() => setAjoutVisible(false)}
        document={selected}
      />
      <DocumentDisponiblePieces
        visible={disponibleVisible}
        onHide={() => setDisponibleVisible(false)}
        document={selected}
      />
    </Layout>
  );
}
