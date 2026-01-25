import { useEffect, useRef, useState } from "react";
import Layout from "../../components/layout/Layoutt";
import LiquidationForm from "./LiquidationForm";
import LiquidationDetails from "./LiquidationDetails";
//import LiquidationAjoutPieces from "./LiquidationAjoutPieces";
import LiquidationDisponiblePieces from "./LiquidationDisponiblePieces";
import LiquidationUploadPieces from "./LiquidationUploadPieces";
import type {
  Programme,
  Chapitre,
  Nature,
  Type,
  Liquidation,
  Fournisseur,
  ServiceBeneficiaire,
  SourceDeFinancement,
} from "../../interfaces";
import {
  getLiquidations,
  createLiquidation,
  uploadPiece,
  deleteLiquidationById,
} from "../../api/liquidation";
import { getNatures } from "../../api/nature";
import { getProgrammes } from "../../api/programme";
import { getChapitres } from "../../api/chapitre";
import { getType } from "../../api/type";
import { getFournisseurs } from "../../api/fournisseur";
import { getServiceBeneficiaire } from "../../api/serviceBeneficiaire";
import { getSourceDeFinancements } from "../../api/sourceDeFinancement";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { confirmDialog } from "primereact/confirmdialog";
import Pagination from "../../components/layout/Pagination";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  CloudDownload,
  RefreshCcw,
  CircleDollarSign,
  Check,
} from "lucide-react";

export default function LiquidationPage() {
  const [items, setItems] = useState<Liquidation[]>([]);
  const [natures, setNatures] = useState<Nature[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [chapitres, setChapitres] = useState<Chapitre[]>([]);
  const [types, setTypes] = useState<Type[]>([]);
  const [fournisseur, setFournisseur] = useState<Fournisseur[]>([]);
  const [sourceDeFinancement, setSourceDeFinancement] = useState<
    SourceDeFinancement[]
  >([]);
  const [serviceBeneficiaire, setServiceBeneficiare] = useState<
    ServiceBeneficiaire[]
  >([]);
  const [selected, setSelected] = useState<Liquidation | null>(null);
  const [editing, setEditing] = useState<Partial<Liquidation> | null>(null);

  const [formVisible, setFormVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [ajoutVisible, setAjoutVisible] = useState(false);
  const [disponibleVisible, setDisponibleVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [rawItems, setRawItems] = useState<any[]>([]);

  const affichage = async () => {
    setLoading(true);
    console.log("➡️ affichage() lancé");
    try {
      const [s, p, c, n, l, t, f, so] = await Promise.all([
        getServiceBeneficiaire(),
        getProgrammes(),
        getChapitres(),
        getNatures(),
        getLiquidations(),
        getType(),
        getFournisseurs(),
        getSourceDeFinancements(),
      ]);
      console.log("✅ Promise.all terminé");

      setServiceBeneficiare(
        Array.isArray(s.serviceBeneficiaire) ? s.serviceBeneficiaire : [],
      );

      setProgrammes(Array.isArray(p.programme) ? p.programme : []);
      setChapitres(Array.isArray(c.chapitre) ? c.chapitre : []);
      setNatures(Array.isArray(n.nature) ? n.nature : []);
      setTypes(Array.isArray(t.type) ? t.type : []);
      setFournisseur(Array.isArray(f.fournisseur) ? f.fournisseur : []);
      setSourceDeFinancement(Array.isArray(so.source) ? so.source : []);

      // 🔥 NORMALISATION DES LIQUIDATIONS
      // Dans affichage(), juste avant setItems :
      console.log("🔍 DEBUG - Premier élément de l.data[0]:", l.data[0]);
      console.log("Propriétés disponibles:", Object.keys(l.data[0]));
      console.log("pieces (minuscule):", l.data[0].pieces);
      //console.log("Pieces (majuscule):", l.data[0].Pieces);
      console.log("Type de pieces:", typeof l.data[0].pieces);
      console.log("Est-ce un tableau ?", Array.isArray(l.data[0].pieces));

      // Sauvegardez les données brutes
      setRawItems(l.data);

      setItems(
        l.data.map((x: any) => ({
          id: x.id,
          description: x.description,
          sourceDeFinancement: x.sourceDeFinancement,
          numDossier: x.num_dossier, // conversion snake_case → camelCase
          montant: x.montant,
          dateLiquidation: x.date_liquidation,
          chapitre: x.nature?.chapitre, // On récupère le chapitre depuis l'objet nature
          programme: x.nature?.chapitre?.programme, // On récupère le programme depuis le chapitre
          nature: x.nature,
          fournisseur: x.fournisseur,
          serviceBeneficiaire: x.serviceBeneficiaire,
          pieces: x.pieces || [],
          type: x.type,
          types: x.types,
          createdAt: x.createdAt,
          updatedAt: x.updatedAt,

          // Ajoutez les données brutes pour référence
          _raw: x,
        })),
      );
      // console.log("Programmes API:", p.programme);
      // console.log("Chapitres API:", c.chapitre);
      // console.log("Natures API:", n.nature);
      // console.log("Types API:", t.type);
      // console.log("Fournisseurs API:", f.fournisseur);
      // console.log("Service bénéficiaires API:", s.serviceBeneficiaire);
      console.log("Source de financement API:", so.source);
    } catch (err: any) {
      console.error("❌ load liquidation error:", err);
      // toast.current?.show({
      //   severity: "error",
      //   summary: "Erreur",
      //   detail: "Impossible de charger",
      // });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    affichage();
  }, []);

  const onCreate = async (payload: Partial<Liquidation>) => {
    try {
      const saved = await createLiquidation(payload);
      setItems((s) => [saved, ...s]);
      toast.current?.show({
        severity: "success",
        summary: "OK",
        detail: "Liquidation créée",
      });
      //setFormVisible(false);
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: err?.response?.data?.message || "Erreur création",
      });
    }
  };

  const onEdit = async (payload: Partial<Liquidation>) => {
    if (!editing?.id) return;
    try {
      const updated = await uploadPiece(editing.id, payload);
      setItems((s) => s.map((it) => (it.id === updated.id ? updated : it)));

      toast.current?.show({
        severity: "success",
        summary: "OK",
        detail: "Liquidation mise à jour",
      });
      setEditing(null);
      setFormVisible(false);
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: err?.response?.data?.message || "Erreur maj",
      });
    }
  };

  const handleDelete = async (id: string) => {
    confirmDialog({
      message: "Confirmer la suppression ?",
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          await deleteLiquidationById(id);
          setItems((s) => s.filter((x) => x.id !== id));
          toast.current?.show({
            severity: "success",
            summary: "Supprimé",
            detail: "Liquidation supprimée",
          });
        } catch (err: any) {
          toast.current?.show({
            severity: "error",
            summary: "Erreur",
            detail: err?.response?.data?.message || "Impossible de supprimer",
          });
        }
      },
    });
  };

  const filtered = items.filter((l) =>
    `${l.description || ""} ${l.serviceBeneficiaire || ""}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <Layout>
      <Toast ref={toast} />

      {/* --- HEADER DE PAGE --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-blue-800 p-3 rounded-2xl text-white shadow-lg shadow-blue-100">
              <CircleDollarSign size={26} />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Gestion des <span className="text-blue-600">Liquidations</span>
            </h1>
          </div>
          <p className="text-slate-500 font-medium ml-14">
            Suivi et traitement des dossiers de dépense
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={affichage}
            className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
            title="Rafraîchir"
          >
            <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
          </button>

          <Button
            label="Nouvelle Liquidation"
            icon={<Plus size={18} className="mr-2" />}
            className="bg-blue-600 hover:bg-blue-700 text-white border-none px-6 py-3 rounded-xl shadow-lg shadow-blue-200 font-bold transition-all"
            onClick={() => {
              setEditing(null);
              setFormVisible(true);
            }}
          />
        </div>
      </div>

      {/* --- BARRE D'OUTILS / RECHERCHE --- */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex items-center">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm"
            placeholder="Rechercher par description ou bénéficiaire..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="ml-4 text-sm text-slate-400 font-medium">
          {filtered.length} dossier(s) trouvé(s)
        </div>
      </div>

      {/* --- TABLEAU STYLISÉ --- */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  Dossier du dossier
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  Bénéficiaire
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  Montant
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  Source de financement
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  Nature
                </th>
                <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  Type de dossier
                </th>
                <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-20 text-center text-slate-400 font-medium"
                  >
                    Chargement des données...
                  </td>
                </tr>
              ) : (
                paginated.map((l) => {
                  const serviceLabel =
                    typeof l.serviceBeneficiaire === "string"
                      ? l.serviceBeneficiaire
                      : (l.serviceBeneficiaire?.sigle ?? "-");

                  return (
                    <tr
                      key={l.id}
                      onClick={() => {
                        setSelected(l);
                        setDetailsVisible(true);
                      }}
                      className="group cursor-pointer hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-blue-600 mb-0.5">
                          {l.numDossier}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-700 line-clamp-1">
                          {l.description || "-"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                            {serviceLabel.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium">
                            {serviceLabel}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-sm font-bold">
                          {l.montant?.toLocaleString()}{" "}
                          <span className="text-[10px] ml-1 opacity-70">
                            FCFA
                          </span>
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-700 line-clamp-1">
                          {typeof l.sourceDeFinancement === "string"
                            ? l.sourceDeFinancement
                            : l.sourceDeFinancement?.libelle || "--"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold text-slate-500 italic">
                          {typeof l.nature === "string"
                            ? l.nature
                            : l.nature?.libelle}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-700 line-clamp-1">
                          {typeof l.type === "string" ? l.type : l.type?.nom}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              setSelected(l);

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
                              setSelected(l);
                              setAjoutVisible(true);
                              e.stopPropagation();
                            }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all"
                            title="Chargement des fichiers"
                          >
                            <CloudDownload size={18} />
                          </button>
                          <button
                            onClick={(e) => {
                              setSelected(l);
                              setDetailsVisible(true);
                              e.stopPropagation();
                            }}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-white rounded-lg transition-all"
                            title="Détails"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={(e) => {
                              setEditing(l);
                              setFormVisible(true);
                              e.stopPropagation();
                            }}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-white rounded-lg transition-all"
                            title="Modifier"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={(e) => {
                              handleDelete(l.id!);
                              e.stopPropagation();
                            }}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-all"
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- PAGINATION --- */}
      <div className="mt-6 flex justify-center">
        <Pagination
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filtered.length}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* --- MODALES --- */}
      <LiquidationForm
        visible={formVisible}
        onHide={() => setFormVisible(false)}
        onSubmit={editing ? onEdit : onCreate}
        initial={editing || undefined}
        title={editing ? "Modifier la Liquidation" : "Nouvelle Liquidation"}
        programmes={programmes}
        chapitres={chapitres}
        natures={natures}
        types={types}
        fournisseurs={fournisseur}
        serviceBeneficiaires={serviceBeneficiaire}
        source_de_financements={sourceDeFinancement}
      />
      <LiquidationDetails
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        liquidation={selected}
      />
      <LiquidationUploadPieces
        visible={ajoutVisible}
        onHide={() => setAjoutVisible(false)}
        liquidation={selected}
      />
      <LiquidationDisponiblePieces
        visible={disponibleVisible}
        onHide={() => setDisponibleVisible(false)}
        liquidation={selected}
      />
    </Layout>
  );
}
