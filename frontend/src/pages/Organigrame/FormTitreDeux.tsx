import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Save, X, Edit2, Layers, Trash2 } from "lucide-react";
import {
  createEntiteeDeux,
  updateEntiteeDeuxTitre,
} from "../../api/entiteeDeux";
// ✅ NOUVEL IMPORT
import { deleteEntiteeDeuxTitre } from "../../api/entiteeDeux";
import { confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";

type Props = {
  visible: boolean;
  onHide: () => void;
  onSubmit: (data: any) => void;
  refresh: () => void;
  title: string;
  entiteeUn: any[];
  currentTitre?: string;
  onTitreUpdate?: (newTitre: string) => void;
  onTitreDelete?: () => void; // ✅ Nouvelle prop
  titles?: {
    entitee1: string;
    entitee2: string;
    entitee3: string;
  };
};

export default function FormTitreDeux({
  visible,
  onHide,
  onSubmit,
  refresh,
  title,
  entiteeUn,
  currentTitre,
  onTitreUpdate,
  onTitreDelete, // ✅ Nouvelle prop
  titles,
}: Props) {
  const [libelle, setLibelle] = useState("");
  const [entiteeUnId, setEntiteeUnId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editTitreMode, setEditTitreMode] = useState(false);
  const [newTitre, setNewTitre] = useState(currentTitre || "");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    if (visible) {
      setLibelle("");
      setEntiteeUnId(null);
      setNewTitre(currentTitre || "");
      setEditTitreMode(false);
    }
  }, [visible, currentTitre]);

  const handleSubmit = async () => {
    if (!libelle.trim() || !entiteeUnId) return;

    setLoading(true);
    try {
      await createEntiteeDeux({
        libelle,
        entitee_un_id: entiteeUnId,
      });
      onSubmit({ libelle, entiteeUnId });
      refresh();
      onHide();
    } catch (error) {
      console.error("Erreur création:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTitre = async () => {
    if (!newTitre.trim() || newTitre === currentTitre) {
      setEditTitreMode(false);
      return;
    }

    setLoading(true);
    try {
      await updateEntiteeDeuxTitre(newTitre);
      if (onTitreUpdate) {
        onTitreUpdate(newTitre);
      }
      setEditTitreMode(false);
    } catch (error) {
      console.error("Erreur mise à jour titre:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fonction pour supprimer le titre (MISE À JOUR AVEC LA NOUVELLE API)
  const handleDeleteTitre = async () => {
    if (!currentTitre) return;

    setDeleteLoading(true);
    confirmDialog({
      message: `Voulez-vous supprimer cet entitée définitivement ? Cette action est irréversible.`,
      header: "Confirmation",
      icon: "pi pi-info-circle",
      acceptLabel: "Supprimer",
      rejectLabel: "Annuler",
      acceptClassName: "p-button-danger p-button-raised p-button-rounded p-2",
      rejectClassName:
        "p-button-secondary p-button-outlined p-button-rounded mr-4 p-2",
      style: { width: "450px" },
      accept: async () => {
        try {
          const result = await deleteEntiteeDeuxTitre();
          console.log("✅ Résultat suppression:", result);

          if (onTitreDelete) {
            onTitreDelete();
          }

          setNewTitre("");
          toast.current?.show({
            severity: "success",
            summary: "Supprimé",
            detail: "Élément supprimé",
          });
        } catch (err: any) {
          toast.current?.show({
            severity: "error",
            summary: "Erreur",
            detail: err?.response?.data?.message || "Suppression impossible",
          });
        } finally {
          setDeleteLoading(false);
        }
      },
    });
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={visible}
        onHide={onHide}
        showHeader={false}
        style={{ width: "600px" }}
        className="rounded-[2.5rem] overflow-hidden shadow-2xl border-none"
        contentClassName="p-0 bg-white"
      >
        <div className="relative">
          {/* HEADER */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-900 p-6 text-white">
            <button
              onClick={onHide}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <Layers size={18} className="text-blue-200" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">
                Niveau 2
              </span>
            </div>
            <h2 className="text-xl font-black tracking-tight">{title}</h2>
          </div>

          {/* CORPS */}
          <div className="p-6 space-y-6">
            {/* SECTION TITRE MODIFIABLE */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-black text-blue-700 uppercase tracking-widest">
                  Titre de l'entité
                </label>
                <div className="flex items-center gap-1">
                  {/* Bouton Supprimer */}
                  {!editTitreMode && currentTitre && (
                    <button
                      onClick={handleDeleteTitre}
                      disabled={deleteLoading}
                      className="p-2 hover:bg-red-200 rounded-lg transition-colors group"
                      title="Supprimer le titre (retour au défaut)"
                    >
                      <Trash2
                        size={14}
                        className="text-red-600 group-hover:text-red-700"
                      />
                    </button>
                  )}
                  {/* Bouton Éditer */}
                  {!editTitreMode && (
                    <button
                      onClick={() => setEditTitreMode(true)}
                      className="p-2 hover:bg-blue-200 rounded-lg transition-colors"
                    >
                      <Edit2 size={14} className="text-blue-700" />
                    </button>
                  )}
                </div>
              </div>

              {editTitreMode ? (
                <div className="space-y-2">
                  <InputText
                    value={newTitre}
                    onChange={(e) => setNewTitre(e.target.value)}
                    className="w-full p-3 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="Nouveau titre..."
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      label="Annuler"
                      onClick={() => {
                        setNewTitre(currentTitre || "");
                        setEditTitreMode(false);
                      }}
                      className="p-button-text p-button-sm text-slate-500"
                    />
                    <Button
                      label="Enregistrer"
                      onClick={handleUpdateTitre}
                      loading={loading}
                      className="p-button-sm bg-blue-600 border-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="font-bold text-blue-900 text-lg">
                    {currentTitre || title}
                  </p>
                  {deleteLoading && (
                    <span className="text-xs text-red-600 animate-pulse">
                      Suppression...
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* SECTION CRÉATION */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  {titles?.entitee1 || "Entité parente"} (Niveau 1)
                </label>
                <Dropdown
                  value={entiteeUnId}
                  onChange={(e) => setEntiteeUnId(e.value)}
                  options={entiteeUn}
                  optionLabel="libelle"
                  optionValue="id"
                  placeholder={`Sélectionner un(e) ${titles?.entitee1 || "parent"}`}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Libellé du nouveau {currentTitre || "élément"}
                </label>
                <InputText
                  value={libelle}
                  onChange={(e) => setLibelle(e.target.value)}
                  placeholder={`Ex: ${currentTitre || "Division"} Commerciale...`}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                label="Annuler"
                icon={<X size={16} />}
                onClick={onHide}
                className="p-button-text text-slate-500"
                disabled={loading || deleteLoading}
              />
              <Button
                label="Créer"
                icon={<Save size={16} />}
                onClick={handleSubmit}
                loading={loading}
                disabled={!libelle.trim() || !entiteeUnId || deleteLoading}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition-all"
              />
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}
