import { useEffect, useRef, useState } from "react";
import Layout from "../../components/layout/Layoutt";
import DocumentTypeForm from "./DocumentTypeForm";
import DocumentTypeDetails from "./DocumentTypeDetails";
import DocumentTypeMetaForm from "./DocumentTypeMetaForm";
import { confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  Database,
  Settings,
  Search,
  Layers,
  FilePlus,
} from "lucide-react";
import {
  getTypeDocuments,
  createTypeDocument,
  updateTypeDocument,
  deleteTypeDocument,
  addPiecesToTypeDocument,
} from "../../api/typeDocument";
import {
  TypeDocument,
  AddPiecesToTypeDocumentPayload,
  Pieces,
} from "../../interfaces";
import { createMetaField, updateMetaField } from "../../api/metaField";
import Pagination from "../../components/layout/Pagination";
import TypeDocumentAjoutPieces from "./TypeDocumentAjoutPieces";
import { getPieces } from "../../api/pieces";

export default function DocumentTypePage() {
  const [types, setTypes] = useState<TypeDocument[]>([]);
  const [pieces, setPieces] = useState<Pieces[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [editing, setEditing] = useState<any>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [metaVisible, setMetaVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const toast = useRef<Toast>(null);
  const [formPiecesVisible, setFormPiecesVisible] = useState(false);

  const load = async () => {
    try {
      const [resTy, resP] = await Promise.all([
        getTypeDocuments(),
        getPieces(),
      ]);

      // Adaptation au formatage du backend
      // On vérifie si resTy contient la clé typeDocument (formatée) ou est un tableau direct
      const typesData = resTy.typeDocument || resTy;
      setTypes(Array.isArray(typesData) ? typesData : []);
      setPieces(Array.isArray(resP) ? resP : []);
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Impossible de charger les données",
      });
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* ================= ACTIONS ================= */

  const onCreate = () => {
    setEditing(null);
    setFormVisible(true);
  };

  const onEdit = (row: any) => {
    setEditing(row);
    setFormVisible(true);
  };

  const handleSubmit = async (payload: any) => {
    try {
      if (editing?.id) {
        await updateTypeDocument(editing.id, payload);
        toast.current?.show({ severity: "success", summary: "Mis à jour" });
      } else {
        await createTypeDocument(payload);
        toast.current?.show({ severity: "success", summary: "Créé" });
      }
      // RECHARGE COMPLÈTE pour récupérer les libellés et jointures
      await load();
      setFormVisible(false); // Fermer le formulaire
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = (id: string) => {
    confirmDialog({
      message: "Supprimer ce type de document ?",
      header: "Confirmation",
      acceptClassName: "p-button-danger",
      accept: async () => {
        await deleteTypeDocument(id);
        setTypes((s) => s.filter((x) => String(x.id) !== String(id)));
        toast.current?.show({ severity: "success", summary: "Supprimé" });
      },
    });
  };

  const handleMetaSubmit = async (fieldsPayload: any[]) => {
    if (!selected?.id) return;

    try {
      for (const field of fieldsPayload) {
        if (field.id) {
          // Si le champ a un ID, c'est une modification -> PUT
          await updateMetaField(field.id, field);
        } else {
          // Si pas d'ID, c'est un nouveau -> POST
          await createMetaField(selected.id, field);
        }
      }

      toast.current?.show({
        severity: "success",
        summary: "Mise à jour réussie",
      });
      load(); // Recharger les types pour voir les changements
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur lors de la mise à jour",
      });
    }
  };

  const onAddPieces = async (
    typeId: string,
    payload: AddPiecesToTypeDocumentPayload,
  ) => {
    try {
      await addPiecesToTypeDocument(typeId, payload);

      toast.current?.show({
        severity: "success",
        summary: "OK",
        detail: "Pièces ajoutées avec succès",
      });

      // 🔄 Recharger la liste complète
      load();

      setFormPiecesVisible(false);
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: err?.response?.data?.message || "Erreur ajout pièces",
      });
    }
  };

  const filtered = types.filter((t) =>
    `${t.code} ${t.nom}`.toLowerCase().includes(query.toLowerCase()),
  );

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <Layout>
      <Toast ref={toast} />

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-4">
            {/* Changement : Gradient Emerald */}
            <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-800 text-white rounded-3xl shadow-xl shadow-emerald-100">
              <Database size={28} />
            </div>
            Types de Documents
          </h1>
          <p className="text-slate-500 text-base mt-2 ml-1 font-medium italic">
            Structurez vos archives et définissez vos métadonnées sur mesure.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            label="Nouveau Type"
            icon={<Plus size={20} className="mr-2" />}
            onClick={onCreate}
            className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-8 py-4 rounded-2xl shadow-lg shadow-emerald-100 transition-all hover:-translate-y-1 active:scale-95 font-bold"
          />
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="mb-8 relative max-w-xl group">
        <Search
          className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors"
          size={20}
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher par code ou nom de document..."
          className="w-full pl-14 pr-6 py-4 bg-white border-2 border-slate-100 rounded-[1.5rem] shadow-sm outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all text-slate-700 font-semibold"
        />
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/60 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Code
              </th>
              <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Libellé du Type
              </th>
              <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Structure
              </th>
              <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Métadonnées
              </th>
              <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginated.map((t) => (
              <tr
                key={t.id}
                onClick={() => {
                  setSelected(t);
                  setDetailsVisible(true);
                }}
                className="cursor-pointer group hover:bg-emerald-50/30 transition-all"
              >
                <td className="p-6">
                  <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-black border border-slate-200 uppercase">
                    {t.code}
                  </span>
                </td>
                <td className="p-6">
                  <div className="font-bold text-slate-800 text-lg">
                    {t.nom}
                  </div>
                </td>
                <td className="p-6 text-slate-600 font-medium">
                  <div className="flex flex-wrap gap-1 max-w-[300px]">
                    {/* On affiche les entités de tous les niveaux sous forme de badges */}
                    {[
                      ...(t.entites_un || []),
                      ...(t.entites_deux || []),
                      ...(t.entites_trois || []),
                    ].length > 0 ? (
                      [
                        ...(t.entites_un || []),
                        ...(t.entites_deux || []),
                        ...(t.entites_trois || []),
                      ].map((ent: any) => (
                        <span
                          key={ent.id}
                          className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-200"
                        >
                          {ent.libelle}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic text-xs">
                        Transversal (Tous)
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-6">
                  {/* Changement : Badge Emerald */}
                  <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[11px] font-black">
                    {t.metaFields?.length || 0} CHAMPS
                  </span>
                </td>
                <td className="p-6">
                  <div className="flex justify-center gap-2">
                    <button
                      title="Ajouter des pièces"
                      onClick={(e) => {
                        setSelected(t);
                        setFormPiecesVisible(true);
                        e.stopPropagation();
                      }}
                      className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                      <FilePlus size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        setSelected(t);
                        setDetailsVisible(true);
                        e.stopPropagation();
                      }}
                      className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                    >
                      <Eye size={20} />
                    </button>
                    <button
                      onClick={(e) => {
                        onEdit(t);
                        setFormVisible(true);
                        e.stopPropagation();
                      }}
                      className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                    >
                      <Pencil size={20} />
                    </button>
                    <button
                      onClick={(e) => {
                        setSelected(t);
                        setMetaVisible(true);
                        e.stopPropagation();
                      }}
                      className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                    >
                      <Settings size={20} />
                    </button>
                    <button
                      onClick={(e) => {
                        handleDelete(String(t.id));
                        e.stopPropagation();
                      }}
                      className="p-3 text-slate-400 hover:text-red-500 hover:bg-white hover:shadow-md rounded-xl transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalItems={filtered.length}
        onPageChange={setCurrentPage}
      />

      <DocumentTypeDetails
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        type={selected}
      />

      <DocumentTypeMetaForm
        visible={metaVisible}
        onHide={() => setMetaVisible(false)}
        onSubmit={handleMetaSubmit}
        type={selected}
      />

      <TypeDocumentAjoutPieces
        visible={formPiecesVisible}
        onHide={() => setFormPiecesVisible(false)}
        onSubmit={onAddPieces}
        initial={selected}
        title={"Ajouter des pièces au dossier"}
        pieces={pieces}
      />

      <DocumentTypeForm
        visible={formVisible}
        onHide={() => setFormVisible(false)}
        onSubmit={handleSubmit} // Cette fonction gère déjà la logique API
        initial={editing} // Contient les objets complets entitee_un, etc.
        title={editing ? "Modifier le Type" : "Nouveau Type"}
      />
    </Layout>
  );
}
