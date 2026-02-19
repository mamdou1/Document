import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Layout from "../../components/layout/Layoutt";
import DocumentForm from "./DocumentForm";
import DocumentDetails from "./DocumentDetails";
import { confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import {
  Plus,
  Trash2,
  FileText,
  Search,
  FileStack,
  Check,
  CloudDownload,
  Layers,
  ChevronRight,
  ChevronDown,
  Building2,
  GitMerge,
  Pencil,
} from "lucide-react";
import { getMetaById } from "../../api/metaField";
import {
  getDocuments,
  createDocument,
  deleteDocument,
  updateDocument,
} from "../../api/document";
import { getTypeDocuments } from "../../api/typeDocument";
import { Dropdown } from "primereact/dropdown";
import Pagination from "../../components/layout/Pagination";
import api from "../../api/axios";
import DocumentPiece from "./DocumentPieces";
import UploadPreview from "./UploadPreview";
import { TypeDocument, Document } from "../../interfaces";
import DocumentUploadPieces from "./DocumentUploadPieces";
import DocumentDisponiblePieces from "./DocumentDisponiblePieces";
import { getAllEntiteeUn } from "../../api/entiteeUn";
import { getAllEntiteeDeux } from "../../api/entiteeDeux";
import { getAllEntiteeTrois } from "../../api/entiteeTrois";
import { useAuth } from "../../context/AuthContext";

// Interfaces pour les entités
interface Entitee {
  id: number;
  libelle: string;
  code?: string;
  titre?: string;
  type: "un" | "deux" | "trois";
  parent_id?: number;
}

export default function DocumentPage() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<any[]>([]);
  const [types, setTypes] = useState<TypeDocument[]>([]);
  const [entitees, setEntitees] = useState<Entitee[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [typeCurrentPage, setTypeCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const typeItemsPerPage = 5;
  const toast = useRef<Toast>(null);
  const [documentType_id, setDocumentType_id] = useState<number | null>(null);
  const [metaFields, setMetaFields] = useState<any[]>([]);
  const [filteredTypes, setFilteredTypes] = useState<TypeDocument[]>([]);

  // États pour les accordéons imbriqués
  const [expandedEntitee, setExpandedEntitee] = useState<number | null>(null);
  const [expandedType, setExpandedType] = useState<number | null>(null);
  const [documentsByType, setDocumentsByType] = useState<Record<number, any[]>>(
    {},
  );
  const [loadingDocs, setLoadingDocs] = useState(false);

  const [tempFile, setTempFile] = useState<File | null>(null);
  const [targetDocId, setTargetDocId] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [ajoutVisible, setAjoutVisible] = useState(false);
  const [disponibleVisible, setDisponibleVisible] = useState(false);
  const location = useLocation();
  const [selectedNiveau, setSelectedNiveau] = useState<string | null>(null);
  const [editingDoc, setEditingDoc] = useState<Partial<Document> | null>(null);
  const [pendingTypeId, setPendingTypeId] = useState<number | null>(null);

  useEffect(() => {
    if (formVisible && pendingTypeId) {
      setDocumentType_id(pendingTypeId);
      setPendingTypeId(null);
    }
  }, [formVisible, pendingTypeId]);

  // =============================================
  // FONCTIONS UTILITAIRES POUR LES ACCÈS
  // =============================================

  const isUserAdmin = (): boolean => {
    if (!user) return false;
    const droitLibelle =
      typeof user.droit === "object" ? user.droit?.libelle : user.droit;
    if (!droitLibelle) return false;
    const libelle = droitLibelle.toString().toLowerCase();
    return (
      libelle.includes("admin") ||
      libelle.includes("administrateur") ||
      libelle === "admin" ||
      libelle === "administrateur"
    );
  };

  const getUserAccessibleEntityIds = () => {
    if (!user)
      return {
        un: new Set<number>(),
        deux: new Set<number>(),
        trois: new Set<number>(),
      };

    const ids = {
      un: new Set<number>(),
      deux: new Set<number>(),
      trois: new Set<number>(),
    };

    // Entité de la fonction
    if (user.fonction_details?.entitee_un?.id) {
      ids.un.add(user.fonction_details.entitee_un.id);
    }
    if (user.fonction_details?.entitee_deux?.id) {
      ids.deux.add(user.fonction_details.entitee_deux.id);
    }
    if (user.fonction_details?.entitee_trois?.id) {
      ids.trois.add(user.fonction_details.entitee_trois.id);
    }

    // Entités des agent_access
    user.agent_access?.forEach((access) => {
      if (access.entitee_un?.id) ids.un.add(access.entitee_un.id);
      if (access.entitee_deux?.id) ids.deux.add(access.entitee_deux.id);
      if (access.entitee_trois?.id) ids.trois.add(access.entitee_trois.id);
    });

    return ids;
  };

  const hasAdditionalAccess = (): boolean => {
    return (user?.agent_access?.length ?? 0) > 0;
  };

  const getUserFonctionEntityType = (): "un" | "deux" | "trois" | null => {
    if (user?.fonction_details?.entitee_trois) return "trois";
    if (user?.fonction_details?.entitee_deux) return "deux";
    if (user?.fonction_details?.entitee_un) return "un";
    return null;
  };

  const getUserFonctionEntityId = (): number | null => {
    return (
      user?.fonction_details?.entitee_trois?.id ||
      user?.fonction_details?.entitee_deux?.id ||
      user?.fonction_details?.entitee_un?.id ||
      null
    );
  };

  const getAccessibleTypesForNiveau = (niveau: "un" | "deux" | "trois") => {
    const ids = getUserAccessibleEntityIds();
    const targetSet = ids[niveau];

    return types.filter((doc) => {
      if (niveau === "un")
        return doc.entitee_un_id && targetSet.has(doc.entitee_un_id);
      if (niveau === "deux")
        return doc.entitee_deux_id && targetSet.has(doc.entitee_deux_id);
      if (niveau === "trois")
        return doc.entitee_trois_id && targetSet.has(doc.entitee_trois_id);
      return false;
    });
  };

  const getUserFonctionTypes = () => {
    const entityType = getUserFonctionEntityType();
    const entityId = getUserFonctionEntityId();

    if (!entityType || !entityId) return [];

    return types.filter((doc) => {
      if (entityType === "un") return doc.entitee_un_id === entityId;
      if (entityType === "deux") return doc.entitee_deux_id === entityId;
      if (entityType === "trois") return doc.entitee_trois_id === entityId;
      return false;
    });
  };

  // Charger toutes les données
  const load = async () => {
    try {
      const [resDocs, resTypes, resE1, resE2, resE3] = await Promise.all([
        getDocuments(),
        getTypeDocuments(),
        getAllEntiteeUn(),
        getAllEntiteeDeux(),
        getAllEntiteeTrois(),
      ]);

      setDocs(resDocs);
      setTypes(resTypes.typeDocument);

      // Fusionner toutes les entités
      const allEntitees: Entitee[] = [
        ...(Array.isArray(resE1) ? resE1 : []).map((e: any) => ({
          ...e,
          type: "un" as const,
        })),
        ...(Array.isArray(resE2) ? resE2 : []).map((e: any) => ({
          ...e,
          type: "deux" as const,
        })),
        ...(Array.isArray(resE3) ? resE3 : []).map((e: any) => ({
          ...e,
          type: "trois" as const,
        })),
      ];
      setEntitees(allEntitees);
    } catch (error) {
      console.error("❌ Erreur chargement:", error);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // LIRE LE PARAMÈTRE D'URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const entitee = params.get("entitee");
    const typeId = params.get("typeId");
    const niveaux = params.get("niveaux");

    if (typeId) {
      // Cas 2.2 : Affichage direct des documents du type
      setDocumentType_id(Number(typeId));
      setSelectedNiveau(null);
      loadDocumentsByType(Number(typeId));
    } else if (entitee) {
      // Cas 2.1 : Affichage par niveau
      setSelectedNiveau(entitee);

      // Récupérer les types accessibles pour ce niveau
      let filtered: TypeDocument[] = [];

      if (isUserAdmin()) {
        // Admin voit tous les types du niveau
        filtered = types.filter((t) => {
          if (entitee === "un") return t.entitee_un_id !== null;
          if (entitee === "deux") return t.entitee_deux_id !== null;
          if (entitee === "trois") return t.entitee_trois_id !== null;
          return false;
        });
      } else if (hasAdditionalAccess()) {
        // Utilisateur avec accès supplémentaires
        filtered = getAccessibleTypesForNiveau(
          entitee as "un" | "deux" | "trois",
        );
      } else {
        // Utilisateur sans accès supplémentaires - ne devrait pas arriver ici car cas 2.2 déjà traité
        filtered = [];
      }

      setFilteredTypes(filtered);
    }
  }, [location.search, types]);

  // Ajoutez cette fonction vers la ligne ~380, après handleDelete
  const onEdit = async (payload: any) => {
    if (!editingDoc?.id) {
      console.error("❌ Aucun document sélectionné pour modification");
      return;
    }

    try {
      // ✅ Convertir l'ID en string si nécessaire
      const documentId = String(editingDoc.id);
      const updated = await updateDocument(documentId, payload);

      // Mettre à jour la liste des documents
      setDocs((prevDocs) =>
        prevDocs.map((doc) => (doc.id === updated.id ? updated : doc)),
      );

      // Mettre à jour également documentsByType si nécessaire
      if (documentType_id) {
        setDocumentsByType((prev) => ({
          ...prev,
          [documentType_id]:
            prev[documentType_id]?.map((doc) =>
              doc.id === updated.id ? updated : doc,
            ) || [],
        }));
      }

      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Document modifié avec succès",
      });

      setFormVisible(false);
      setEditingDoc(null);
    } catch (error: any) {
      console.error("❌ Erreur modification document:", error);
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail:
          error?.response?.data?.message ||
          "Impossible de modifier le document",
      });
    }
  };

  // FILTRER LES ENTITÉS PAR NIVEAU SÉLECTIONNÉ
  const filteredEntitees = useMemo(() => {
    if (!selectedNiveau) return [];

    // D'abord, filtrer par niveau
    let entiteesDuNiveau = entitees.filter((e) => e.type === selectedNiveau);

    // Si l'utilisateur a des accès supplémentaires, filtrer uniquement les entités accessibles
    if (hasAdditionalAccess() && !isUserAdmin()) {
      const accessibleIds = getUserAccessibleEntityIds();
      const targetSet =
        accessibleIds[selectedNiveau as keyof typeof accessibleIds];

      entiteesDuNiveau = entiteesDuNiveau.filter((e) => targetSet.has(e.id));
    }

    return entiteesDuNiveau;
  }, [entitees, selectedNiveau, user]);

  // Grouper les types par entité
  const typesByEntitee = useMemo(() => {
    const grouped: Record<number, TypeDocument[]> = {};

    (filteredTypes.length > 0 ? filteredTypes : types).forEach((type) => {
      const entiteeId =
        type.entitee_un_id || type.entitee_deux_id || type.entitee_trois_id;
      if (entiteeId) {
        if (!grouped[entiteeId]) grouped[entiteeId] = [];
        grouped[entiteeId].push(type);
      }
    });

    return grouped;
  }, [filteredTypes, types]);

  // Charger les documents d'un type
  const loadDocumentsByType = async (typeId: number) => {
    if (documentsByType[typeId]) return;

    setLoadingDocs(true);
    try {
      const res = await getDocuments();
      const filtered = res.filter((d: any) => d.type_document_id === typeId);
      setDocumentsByType((prev) => ({ ...prev, [typeId]: filtered }));

      // Charger les metaFields pour ce type
      const meta = await getMetaById(String(typeId));
      setMetaFields(meta);
    } catch (error) {
      console.error("❌ Erreur chargement documents:", error);
    } finally {
      setLoadingDocs(false);
    }
  };

  const toggleEntitee = (entiteeId: number) => {
    setExpandedEntitee(expandedEntitee === entiteeId ? null : entiteeId);
    setExpandedType(null);
  };

  const toggleType = async (typeId: number) => {
    if (expandedType === typeId) {
      setExpandedType(null);
    } else {
      setExpandedType(typeId);
      await loadDocumentsByType(typeId);
    }
  };

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
      message: "Voulez-vous supprimer ce document définitivement ?",
      header: "Confirmation",
      icon: "pi pi-info-circle",
      acceptLabel: "Supprimer",
      rejectLabel: "Annuler",
      acceptClassName: "p-button-danger p-button-raised p-button-rounded p-2",
      rejectClassName:
        "p-button-secondary p-button-outlined p-button-rounded mr-4 p-2",
      style: { width: "450px" },
      accept: async () => {
        await deleteDocument(id);
        setDocs((s) => s.filter((x) => String(x.id) !== String(id)));
        toast.current?.show({ severity: "success", summary: "Supprimé" });
      },
    });
  };

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
      load();
    } catch (err) {
      toast.current?.show({ severity: "error", summary: "Échec de l'envoi" });
    }
  };

  // Déterminer ce qu'il faut afficher
  const getDisplayContent = () => {
    const params = new URLSearchParams(location.search);
    const typeId = params.get("typeId");
    const entitee = params.get("entitee");

    // ===== CAS 2.2 : Utilisateur sans accès supplémentaires =====
    // Affichage direct des documents du type sélectionné
    if (typeId) {
      const typeDocuments = documentsByType[Number(typeId)] || [];

      // État vide
      if (typeDocuments.length === 0) {
        return (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
            <FileText size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-400 font-medium">
              Aucun document pour ce type
            </p>
            <button
              onClick={() => {
                setDocumentType_id(Number(typeId));
                setFormVisible(true);
              }}
              className="mt-4 bg-emerald-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all"
            >
              <Plus size={16} className="inline mr-2" />
              Créer le premier document
            </button>
          </div>
        );
      }

      // Pagination
      const paginatedDocs = typeDocuments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
      );

      return (
        <div className="space-y-4">
          {/* En-tête avec bouton Nouveau document */}
          {/* <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-emerald-800">
              Documents du type sélectionné
            </h2>
            <Button
              label="Nouveau document"
              icon={<Plus size={16} />}
              onClick={() => {
                setDocumentType_id(Number(typeId));
                setFormVisible(true);
              }}
              className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm"
            />
          </div> */}

          {/* Tableau des documents avec métadonnées */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-emerald-50/30 border-b border-emerald-50">
                  <th className="p-4 text-[11px] font-black text-emerald-800 uppercase tracking-widest w-24">
                    Réf.
                  </th>
                  {metaFields.map((m) => (
                    <th
                      key={m.id}
                      className="p-4 text-[11px] font-black text-emerald-800 uppercase tracking-widest"
                    >
                      {m.label}
                    </th>
                  ))}
                  <th className="p-4 text-[11px] font-black text-emerald-800 uppercase tracking-widest text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50">
                {paginatedDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    onClick={() => {
                      setSelected(doc);
                      setDetailsVisible(true);
                    }}
                    className="cursor-pointer group hover:bg-emerald-50/40 transition-colors"
                  >
                    <td className="p-4">
                      <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-xs font-bold border border-emerald-200">
                        #{String(doc.id).padStart(3, "0")}
                      </span>
                    </td>

                    {metaFields.map((m) => {
                      const value = doc.values?.find(
                        (v: any) => v.metaField?.id === m.id,
                      )?.value;
                      return (
                        <td
                          key={m.id}
                          className="p-4 text-sm text-emerald-900 font-medium"
                        >
                          {value || (
                            <span className="text-emerald-200">---</span>
                          )}
                        </td>
                      );
                    })}

                    <td className="p-4">
                      <div
                        className="flex justify-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={(e) => {
                            setSelected(doc);
                            setDisponibleVisible(true);
                            e.stopPropagation();
                          }}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-white rounded-lg transition-all"
                          title="Contrôle de la disponibilité des pièces"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={(e) => {
                            setSelected(doc);
                            setAjoutVisible(true);
                            e.stopPropagation();
                          }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all"
                          title="Chargement des fichiers"
                        >
                          <CloudDownload size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex justify-center">
            <Pagination
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalItems={typeDocuments.length}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      );
    }

    // ===== CAS 1 : ADMIN ou Utilisateur avec accès supplémentaires =====
    // Affichage par entité avec accordéons
    if (selectedNiveau) {
      return (
        <div className="space-y-4">
          {filteredEntitees.length > 0 ? (
            filteredEntitees
              .filter((e) =>
                e.libelle?.toLowerCase().includes(query.toLowerCase()),
              )
              .map((entitee) => {
                const entiteeTypes = typesByEntitee[entitee.id] || [];
                const isExpanded = expandedEntitee === entitee.id;

                return (
                  <div
                    key={`${entitee.type}-${entitee.id}`}
                    className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${
                      isExpanded
                        ? "border-emerald-500 ring-2 ring-emerald-200"
                        : "border-slate-100"
                    }`}
                  >
                    {/* HEADER ENTITÉ */}
                    <button
                      onClick={() => toggleEntitee(entitee.id)}
                      className={`w-full flex items-center justify-between p-5 transition-all ${
                        isExpanded ? "bg-emerald-50/50" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded-lg ${
                            isExpanded
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {entitee.type === "un" && <Building2 size={20} />}
                          {entitee.type === "deux" && <Layers size={20} />}
                          {entitee.type === "trois" && <GitMerge size={20} />}
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <h3
                              className={`font-bold ${
                                isExpanded
                                  ? "text-emerald-800"
                                  : "text-slate-700"
                              }`}
                            >
                              {entitee.libelle}
                            </h3>
                            {entitee.code && (
                              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-mono">
                                {entitee.code}
                              </span>
                            )}
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                entitee.type === "un"
                                  ? "bg-blue-100 text-blue-700"
                                  : entitee.type === "deux"
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              N
                              {entitee.type === "un"
                                ? "1"
                                : entitee.type === "deux"
                                  ? "2"
                                  : "3"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium">
                            {entiteeTypes.length} type(s) de document
                          </p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronDown size={20} className="text-emerald-500" />
                      ) : (
                        <ChevronRight size={20} className="text-slate-400" />
                      )}
                    </button>

                    {/* TYPES DE DOCUMENTS DE L'ENTITÉ */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 p-5 space-y-3 bg-slate-50/30">
                        {entiteeTypes.length > 0 ? (
                          entiteeTypes.map((type) => {
                            const isTypeExpanded = expandedType === type.id;
                            const typeDocuments =
                              documentsByType[type.id] || [];
                            const paginatedDocs = typeDocuments.slice(
                              (currentPage - 1) * itemsPerPage,
                              currentPage * itemsPerPage,
                            );

                            return (
                              <div
                                key={type.id}
                                className={`bg-white border rounded-xl overflow-hidden transition-all ${
                                  isTypeExpanded
                                    ? "border-emerald-400"
                                    : "border-slate-100"
                                }`}
                              >
                                {/* HEADER TYPE */}
                                <div
                                  onClick={() => toggleType(type.id)}
                                  className={`w-full flex items-center justify-between p-4 transition-all ${
                                    isTypeExpanded
                                      ? "bg-emerald-50/50"
                                      : "hover:bg-slate-50"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`p-1.5 rounded-lg ${
                                        isTypeExpanded
                                          ? "bg-emerald-500 text-white"
                                          : "bg-slate-100 text-slate-500"
                                      }`}
                                    >
                                      <FileText size={16} />
                                    </div>
                                    <div className="text-left">
                                      <div className="flex items-center gap-2">
                                        <span
                                          className={`text-sm font-bold ${
                                            isTypeExpanded
                                              ? "text-emerald-700"
                                              : "text-slate-700"
                                          }`}
                                        >
                                          {type.nom}
                                        </span>
                                        <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-mono">
                                          {type.code}
                                        </span>
                                      </div>
                                      <p className="text-[10px] text-slate-500">
                                        {typeDocuments.length} document(s)
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setPendingTypeId(type.id); // ✅ Stocker l'ID avant d'ouvrir
                                        setEditingDoc(null);
                                        setFormVisible(true);
                                      }}
                                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                                      title="Nouveau document"
                                    >
                                      <Plus size={14} />
                                    </button>
                                    {isTypeExpanded ? (
                                      <ChevronDown
                                        size={16}
                                        className="text-emerald-500"
                                      />
                                    ) : (
                                      <ChevronRight
                                        size={16}
                                        className="text-slate-400"
                                      />
                                    )}
                                  </div>
                                </div>

                                {/* TABLEAU DES DOCUMENTS */}
                                {isTypeExpanded && (
                                  <div className="border-t border-slate-100 p-4 bg-slate-50/30">
                                    {typeDocuments.length > 0 ? (
                                      <>
                                        <div className="overflow-x-auto">
                                          <table className="w-full text-left border-collapse">
                                            <thead>
                                              <tr className="bg-emerald-50/30 border-b border-emerald-50">
                                                <th className="p-3 text-[11px] font-black text-emerald-800 uppercase tracking-widest w-24">
                                                  Réf.
                                                </th>
                                                {metaFields.map((m) => (
                                                  <th
                                                    key={m.id}
                                                    className="p-3 text-[11px] font-black text-emerald-800 uppercase tracking-widest"
                                                  >
                                                    {m.label}
                                                  </th>
                                                ))}
                                                <th className="p-3 text-[11px] font-black text-emerald-800 uppercase tracking-widest text-center">
                                                  Actions
                                                </th>
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-emerald-50">
                                              {paginatedDocs.map((doc) => (
                                                <tr
                                                  key={doc.id}
                                                  onClick={() => {
                                                    setSelected(doc);
                                                    setDetailsVisible(true);
                                                  }}
                                                  className="cursor-pointer group hover:bg-emerald-50/40 transition-colors"
                                                >
                                                  <td className="p-3">
                                                    <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-xs font-bold border border-emerald-200">
                                                      #
                                                      {String(doc.id).padStart(
                                                        3,
                                                        "0",
                                                      )}
                                                    </span>
                                                  </td>

                                                  {metaFields.map((m) => {
                                                    const value =
                                                      doc.values?.find(
                                                        (v: any) =>
                                                          v.metaField?.id ===
                                                          m.id,
                                                      )?.value;
                                                    return (
                                                      <td
                                                        key={m.id}
                                                        className="p-3 text-sm text-emerald-900 font-medium"
                                                      >
                                                        {value || (
                                                          <span className="text-emerald-200">
                                                            ---
                                                          </span>
                                                        )}
                                                      </td>
                                                    );
                                                  })}

                                                  <td className="p-3">
                                                    <div
                                                      className="flex justify-center gap-1"
                                                      onClick={(e) =>
                                                        e.stopPropagation()
                                                      }
                                                    >
                                                      {/* AJOUTEZ CE BOUTON MODIFIER */}
                                                      <button
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          setEditingDoc(doc); // ✅ Document complet
                                                          setPendingTypeId(
                                                            type.id,
                                                          );
                                                          setFormVisible(true);
                                                        }}
                                                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                        title="Modifier le document"
                                                      >
                                                        <Pencil size={18} />
                                                      </button>

                                                      {/* Boutons existants */}
                                                      <button
                                                        onClick={(e) => {
                                                          setSelected(doc);
                                                          setDisponibleVisible(
                                                            true,
                                                          );
                                                          e.stopPropagation();
                                                        }}
                                                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                                                        title="Contrôle de la disponibilité des pièces"
                                                      >
                                                        <Check size={18} />
                                                      </button>
                                                      <button
                                                        onClick={(e) => {
                                                          setSelected(doc);
                                                          setAjoutVisible(true);
                                                          e.stopPropagation();
                                                        }}
                                                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                        title="Chargement des fichiers"
                                                      >
                                                        <CloudDownload
                                                          size={18}
                                                        />
                                                      </button>
                                                      <button
                                                        onClick={() =>
                                                          handleDelete(doc.id)
                                                        }
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                      >
                                                        <Trash2 size={18} />
                                                      </button>
                                                    </div>
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>

                                        {/* Pagination */}
                                        <div className="mt-4 flex justify-center">
                                          <Pagination
                                            currentPage={currentPage}
                                            itemsPerPage={itemsPerPage}
                                            totalItems={typeDocuments.length}
                                            onPageChange={setCurrentPage}
                                          />
                                        </div>
                                      </>
                                    ) : (
                                      <div className="text-center py-8">
                                        <FileText
                                          size={32}
                                          className="mx-auto text-slate-300 mb-2"
                                        />
                                        <p className="text-sm text-slate-400 italic">
                                          Aucun document pour ce type
                                        </p>
                                        <button
                                          onClick={() => {
                                            setDocumentType_id(type.id);
                                            setFormVisible(true);
                                          }}
                                          className="mt-3 text-sm bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-all"
                                        >
                                          <Plus
                                            size={14}
                                            className="inline mr-1"
                                          />
                                          Créer le premier document
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-slate-400 text-sm italic">
                              Aucun type de document pour cette entité
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
              <div className="inline-flex p-4 bg-slate-50 rounded-full text-slate-300 mb-4">
                <Building2 size={40} />
              </div>
              <p className="text-slate-400 font-medium">
                Aucune entité trouvée pour ce niveau
              </p>
            </div>
          )}
        </div>
      );
    }

    // Aucune sélection
    return (
      <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
        <div className="inline-flex p-4 bg-slate-50 rounded-full text-slate-300 mb-4">
          <Layers size={40} />
        </div>
        <p className="text-slate-400 font-medium">
          Sélectionnez un niveau dans le menu de gauche
        </p>
      </div>
    );
  };

  return (
    <Layout>
      <Toast ref={toast} />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-emerald-950 flex items-center gap-3">
            <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200">
              <FileStack size={24} />
            </div>
            Gestion des Documents
          </h1>
          <p className="text-emerald-600/70 text-sm mt-1 ml-16 font-medium">
            Parcourez les documents par structure
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

      {/* Barre de recherche */}
      <div className="mb-8">
        <div className="relative group max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 group-focus-within:text-emerald-600 transition-colors"
            size={18}
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un document..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-emerald-100 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm"
          />
        </div>
      </div>

      {/* AFFICHAGE DYNAMIQUE SELON LE CAS */}
      {getDisplayContent()}

      {/* Modals */}
      <DocumentForm
        visible={formVisible}
        onHide={() => {
          setFormVisible(false);
          setEditingDoc(null);
        }}
        onSubmit={editingDoc ? onEdit : handleSubmit} // ✅ Choisir la bonne fonction
        refresh={load}
        documentType={types}
        selectedTypeId={documentType_id}
        editingDoc={editingDoc} // ✅ Passer le document à éditer
      />
      <DocumentDetails
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        doc={selected}
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
