import { useEffect, useRef, useState, useMemo } from "react";
import Layout from "../../components/layout/Layoutt";
import { Toast } from "primereact/toast";
import { Checkbox } from "primereact/checkbox";
import { Dropdown } from "primereact/dropdown";
import {
  Search,
  Layers,
  FileText,
  Building2,
  GitMerge,
  Eye,
  Pencil,
  Trash2,
  CloudDownload,
} from "lucide-react";
import { getMetaById } from "../../api/metaField";
import { getDocuments } from "../../api/document";
import { getTypeDocuments } from "../../api/typeDocument";
import Pagination from "../../components/layout/Pagination";
import { useAuth } from "../../context/AuthContext";
import {
  TypeDocument,
  EntiteeUn,
  EntiteeDeux,
  EntiteeTrois,
  User,
} from "../../interfaces";
import { getAllEntiteeUn, getEntiteeUnTitre } from "../../api/entiteeUn";
import { getAllEntiteeDeux, getEntiteeDeuxTitre } from "../../api/entiteeDeux";
import {
  getAllEntiteeTrois,
  getEntiteeTroisTitre,
} from "../../api/entiteeTrois";
import DocumentDetails from "../Document/DocumentDetails";
import RechercheUploadPieces from "./RechercheUploadPieces";

export default function Recherche() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<any[]>([]);
  const [types, setTypes] = useState<TypeDocument[]>([]);
  const [documentType_id, setDocumentType_id] = useState<number | null>(null);
  const [metaFields, setMetaFields] = useState<any[]>([]);

  // États pour les dropdowns en cascade
  const [entiteeUn, setEntiteeUn] = useState<EntiteeUn[]>([]);
  const [entiteeDeux, setEntiteeDeux] = useState<EntiteeDeux[]>([]);
  const [entiteeTrois, setEntiteeTrois] = useState<EntiteeTrois[]>([]);

  const [selectedNiveau, setSelectedNiveau] = useState<string | null>(null);
  const [selectedEntitee, setSelectedEntitee] = useState<number | null>(null);
  const [filteredTypesByEntitee, setFilteredTypesByEntitee] = useState<
    TypeDocument[]
  >([]);

  const [selected, setSelected] = useState<any>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [ajoutVisible, setAjoutVisible] = useState(false);

  // Titres dynamiques
  const [titres, setTitres] = useState<{
    niveau1: string;
    niveau2: string;
    niveau3: string;
  }>({
    niveau1: "",
    niveau2: "",
    niveau3: "",
  });

  // États spécifiques à la recherche dynamique
  const [selectedFields, setSelectedFields] = useState<number[]>([]);
  const [searchValues, setSearchValues] = useState<{ [key: number]: string }>(
    {},
  );
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const toast = useRef<Toast>(null);

  // =============================================
  // FONCTIONS UTILITAIRES
  // =============================================

  const isUserAdmin = (user: User | null): boolean => {
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

  const getUserAccessibleEntityIds = (user: User | null) => {
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

  const hasAdditionalAccess = (user: User | null): boolean => {
    return (user?.agent_access?.length ?? 0) > 0;
  };

  const getUserFonctionEntityType = (
    user: User | null,
  ): "un" | "deux" | "trois" | null => {
    if (user?.fonction_details?.entitee_trois) return "trois";
    if (user?.fonction_details?.entitee_deux) return "deux";
    if (user?.fonction_details?.entitee_un) return "un";
    return null;
  };

  const getUserFonctionEntityId = (user: User | null): number | null => {
    return (
      user?.fonction_details?.entitee_trois?.id ||
      user?.fonction_details?.entitee_deux?.id ||
      user?.fonction_details?.entitee_un?.id ||
      null
    );
  };

  // Récupérer les types de documents de la fonction
  const getUserFonctionTypes = (
    user: User | null,
    allTypes: TypeDocument[],
  ) => {
    const entityType = getUserFonctionEntityType(user);
    const entityId = getUserFonctionEntityId(user);

    if (!entityType || !entityId) return [];

    return allTypes.filter((typeDoc) => {
      if (entityType === "un") return typeDoc.entitee_un_id === entityId;
      if (entityType === "deux") return typeDoc.entitee_deux_id === entityId;
      if (entityType === "trois") return typeDoc.entitee_trois_id === entityId;
      return false;
    });
  };

  // ✅ FILTRER LES TYPES DE DOCUMENTS SELON L'UTILISATEUR
  const filteredTypes = useMemo(() => {
    if (isUserAdmin(user)) return types;

    const accessibleIds = getUserAccessibleEntityIds(user);
    const hasUnAccess = accessibleIds.un.size > 0;
    const hasDeuxAccess = accessibleIds.deux.size > 0;
    const hasTroisAccess = accessibleIds.trois.size > 0;

    // Cas 2.1 : Utilisateur avec accès supplémentaires
    if (hasAdditionalAccess(user)) {
      return types.filter((typeDoc) => {
        if (
          typeDoc.entitee_un_id &&
          hasUnAccess &&
          accessibleIds.un.has(typeDoc.entitee_un_id)
        )
          return true;
        if (
          typeDoc.entitee_deux_id &&
          hasDeuxAccess &&
          accessibleIds.deux.has(typeDoc.entitee_deux_id)
        )
          return true;
        if (
          typeDoc.entitee_trois_id &&
          hasTroisAccess &&
          accessibleIds.trois.has(typeDoc.entitee_trois_id)
        )
          return true;
        return false;
      });
    }

    // Cas 2.2 : Utilisateur sans accès supplémentaires (fonction uniquement)
    const fonctionId = getUserFonctionEntityId(user);
    const fonctionType = getUserFonctionEntityType(user);

    if (!fonctionId || !fonctionType) return [];

    return types.filter((typeDoc) => {
      if (fonctionType === "un") return typeDoc.entitee_un_id === fonctionId;
      if (fonctionType === "deux")
        return typeDoc.entitee_deux_id === fonctionId;
      if (fonctionType === "trois")
        return typeDoc.entitee_trois_id === fonctionId;
      return false;
    });
  }, [types, user]);

  // Charger les titres et les entités
  useEffect(() => {
    const loadTitresEtEntites = async () => {
      try {
        const [t1, t2, t3, e1, e2, e3] = await Promise.all([
          getEntiteeUnTitre(),
          getEntiteeDeuxTitre(),
          getEntiteeTroisTitre(),
          getAllEntiteeUn(),
          getAllEntiteeDeux(),
          getAllEntiteeTrois(),
        ]);

        // ✅ Ne garder que les niveaux qui ont un titre
        const newTitres = {
          niveau1: t1.titre || "",
          niveau2: t2.titre || "",
          niveau3: t3.titre || "",
        };
        setTitres(newTitres);

        setEntiteeUn(Array.isArray(e1) ? e1 : []);
        setEntiteeDeux(Array.isArray(e2) ? e2 : []);
        setEntiteeTrois(Array.isArray(e3) ? e3 : []);
      } catch (error) {
        console.error("❌ Erreur chargement titres:", error);
      }
    };
    loadTitresEtEntites();
  }, []);

  // Options pour le premier dropdown (niveaux)
  const niveauOptions = useMemo(() => {
    const options = [];

    // Admin voit tous les niveaux avec titre
    if (isUserAdmin(user)) {
      if (titres.niveau1) options.push({ label: titres.niveau1, value: "un" });
      if (titres.niveau2)
        options.push({ label: titres.niveau2, value: "deux" });
      if (titres.niveau3)
        options.push({ label: titres.niveau3, value: "trois" });
      return options;
    }

    // Non-admin : vérifier les accès
    const ids = getUserAccessibleEntityIds(user);

    if (ids.un.size > 0 && titres.niveau1) {
      options.push({ label: titres.niveau1, value: "un" });
    }
    if (ids.deux.size > 0 && titres.niveau2) {
      options.push({ label: titres.niveau2, value: "deux" });
    }
    if (ids.trois.size > 0 && titres.niveau3) {
      options.push({ label: titres.niveau3, value: "trois" });
    }

    return options;
  }, [titres, user]);

  // Options pour le deuxième dropdown (entités du niveau sélectionné)
  const entiteeOptions = useMemo(() => {
    if (!selectedNiveau) return [];

    let entites: any[] = [];
    if (selectedNiveau === "un") entites = entiteeUn;
    if (selectedNiveau === "deux") entites = entiteeDeux;
    if (selectedNiveau === "trois") entites = entiteeTrois;

    // Filtrer selon les accès si nécessaire
    if (!isUserAdmin(user)) {
      const ids = getUserAccessibleEntityIds(user);
      const targetSet = ids[selectedNiveau as keyof typeof ids];

      entites = entites.filter((e) => targetSet.has(e.id));
    }

    return entites.map((e) => ({
      label: e.libelle,
      value: e.id,
      code: e.code,
    }));
  }, [selectedNiveau, entiteeUn, entiteeDeux, entiteeTrois, user]);

  // Filtrer les types de documents selon l'entité sélectionnée
  useEffect(() => {
    if (!selectedEntitee || !selectedNiveau) {
      setFilteredTypesByEntitee([]);
      return;
    }

    const filtered = types.filter((typeDoc) => {
      if (selectedNiveau === "un")
        return typeDoc.entitee_un_id === selectedEntitee;
      if (selectedNiveau === "deux")
        return typeDoc.entitee_deux_id === selectedEntitee;
      if (selectedNiveau === "trois")
        return typeDoc.entitee_trois_id === selectedEntitee;
      return false;
    });

    setFilteredTypesByEntitee(filtered);
  }, [selectedEntitee, selectedNiveau, types]);

  // Chargement initial des documents et types
  useEffect(() => {
    const loadData = async () => {
      const [resDocs, resTypes] = await Promise.all([
        getDocuments(),
        getTypeDocuments(),
      ]);
      setDocs(resDocs);
      setTypes(resTypes.typeDocument);
    };
    loadData();
  }, []);

  // Chargement des métadonnées selon le type sélectionné
  useEffect(() => {
    if (documentType_id) {
      getMetaById(String(documentType_id)).then((res) => {
        setMetaFields(res);
        setSelectedFields([]);
        setSearchValues({});
      });
    } else {
      setMetaFields([]);
    }
  }, [documentType_id]);

  // Gérer le changement des checkboxes
  const toggleField = (id: number) => {
    setSelectedFields((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id],
    );
  };

  // Logique de filtrage avancée
  const filtered = docs.filter((d) => {
    const matchType = documentType_id
      ? d.typeDocument?.id === documentType_id
      : true;
    if (!matchType) return false;

    return selectedFields.every((fieldId) => {
      const searchValue = searchValues[fieldId]?.toLowerCase() || "";
      if (!searchValue) return true;
      const docValue =
        d.values?.find((v: any) => v.metaField?.id === fieldId)?.value || "";
      return String(docValue).toLowerCase().includes(searchValue);
    });
  });

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Déterminer ce qu'il faut afficher
  const getSearchInterface = () => {
    // Cas 3 : Sans accès supplémentaires
    if (!hasAdditionalAccess(user) && !isUserAdmin(user)) {
      const fonctionTypes = getUserFonctionTypes(user, types);
      const fonctionEntityType = getUserFonctionEntityType(user);

      return (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
            <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2 block">
              Types de documents de votre structure
            </label>
            <Dropdown
              value={documentType_id}
              options={fonctionTypes}
              onChange={(e) => setDocumentType_id(e.value)}
              optionLabel="nom"
              optionValue="id"
              placeholder="Sélectionner un type de document"
              className="w-full border-none shadow-none bg-emerald-50/50 rounded-xl"
              filter
            />
          </div>
        </div>
      );
    }

    // Cas 1 et 2 : Interface à 3 dropdowns
    return (
      <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Dropdown 1 : Niveaux */}
          <div>
            <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2 block">
              Niveau structure
            </label>
            <Dropdown
              value={selectedNiveau}
              options={niveauOptions}
              onChange={(e) => {
                setSelectedNiveau(e.value);
                setSelectedEntitee(null);
                setDocumentType_id(null);
              }}
              placeholder="Sélectionner un niveau"
              className="w-full border-none shadow-none bg-emerald-50/50 rounded-xl"
            />
          </div>

          {/* Dropdown 2 : Entités du niveau */}
          <div>
            <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2 block">
              {selectedNiveau
                ? niveauOptions.find((n) => n.value === selectedNiveau)?.label
                : "Structure"}
            </label>
            <Dropdown
              value={selectedEntitee}
              options={entiteeOptions}
              onChange={(e) => {
                setSelectedEntitee(e.value);
                setDocumentType_id(null);
              }}
              disabled={!selectedNiveau || entiteeOptions.length === 0}
              placeholder={
                !selectedNiveau
                  ? "Choisissez d'abord un niveau"
                  : entiteeOptions.length === 0
                    ? "Aucune structure accessible"
                    : "Sélectionner une structure"
              }
              className="w-full border-none shadow-none bg-emerald-50/50 rounded-xl"
              optionLabel="label"
              optionValue="value"
              filter
            />
          </div>

          {/* Dropdown 3 : Types de documents */}
          <div>
            <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2 block">
              Type de document
            </label>
            <Dropdown
              value={documentType_id}
              options={filteredTypesByEntitee}
              onChange={(e) => setDocumentType_id(e.value)}
              disabled={!selectedEntitee || filteredTypesByEntitee.length === 0}
              placeholder={
                !selectedEntitee
                  ? "Choisissez d'abord une structure"
                  : filteredTypesByEntitee.length === 0
                    ? "Aucun type disponible"
                    : "Sélectionner un type"
              }
              className="w-full border-none shadow-none bg-emerald-50/50 rounded-xl"
              optionLabel="nom"
              optionValue="id"
              filter
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <Toast ref={toast} />
      <div className="mb-8">
        <h1 className="text-3xl font-black text-emerald-950 flex items-center gap-3">
          <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg">
            <Search size={24} />
          </div>
          Recherche Avancée
        </h1>
      </div>

      {/* Interface adaptative */}
      {getSearchInterface()}

      {/* Checkboxes des libellés (Critères) - à afficher si un type est sélectionné */}
      {documentType_id && metaFields.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm mb-6">
          <p className="text-sm font-bold text-emerald-800 mb-3">
            Critères de recherche :
          </p>
          <div className="flex flex-wrap gap-4">
            {metaFields.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100"
              >
                <Checkbox
                  onChange={() => toggleField(m.id)}
                  checked={selectedFields.includes(m.id)}
                />
                <label className="text-sm text-emerald-900 font-medium">
                  {m.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Champs de recherche dynamiques */}
      {selectedFields.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-in fade-in duration-300">
          {metaFields
            .filter((m) => selectedFields.includes(m.id))
            .map((m) => (
              <div key={m.id} className="relative group">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400"
                  size={16}
                />
                <input
                  placeholder={`Rechercher par ${m.label}...`}
                  value={searchValues[m.id] || ""}
                  onChange={(e) =>
                    setSearchValues({ ...searchValues, [m.id]: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 bg-white border border-emerald-100 rounded-xl shadow-sm outline-none focus:border-emerald-500 transition-all text-sm"
                />
              </div>
            ))}
        </div>
      )}

      {/* Résultats (Tableau) */}
      <div className="bg-white rounded-[2rem] border border-emerald-100 shadow-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-emerald-50/30 border-b border-emerald-50">
              <th className="p-5 text-[11px] font-black text-emerald-800 uppercase w-24">
                Réf.
              </th>
              {metaFields.map((m) => (
                <th
                  key={m.id}
                  className="p-5 text-[11px] font-black text-emerald-800 uppercase"
                >
                  {m.label}
                </th>
              ))}
              <th className="p-5 text-[11px] font-black text-emerald-800 uppercase w-24">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-50">
            {documentType_id &&
              paginated.map((d) => (
                <tr
                  key={d.id}
                  onClick={() => {
                    setSelected(d);
                    setDetailsVisible(true);
                  }}
                  className="cursor-pointer hover:bg-emerald-50/40 transition-colors"
                >
                  <td className="p-5">
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-xs font-bold">
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
                  <td
                    className="px-6 py-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setSelected(d);
                          setDetailsVisible(true);
                        }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Voir détails"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          setSelected(d);
                          setAjoutVisible(true);
                          e.stopPropagation();
                        }}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        title="Chargement des fichiers"
                      >
                        <CloudDownload size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {!documentType_id && (
          <div className="p-20 text-center">
            <div className="inline-flex p-6 bg-emerald-50 rounded-full mb-4 text-emerald-200">
              <FileText size={48} />
            </div>
            <p className="text-emerald-800 font-bold text-lg">
              {!hasAdditionalAccess(user) && !isUserAdmin(user)
                ? "Sélectionnez un type de document"
                : "Sélectionnez un niveau, une structure et un type de document"}
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
      <DocumentDetails
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        doc={selected}
      />
      <RechercheUploadPieces
        visible={ajoutVisible}
        onHide={() => setAjoutVisible(false)}
        document={selected}
        onSuccess={() => {}} // ✅ Recharger après upload
      />
    </Layout>
  );
}
