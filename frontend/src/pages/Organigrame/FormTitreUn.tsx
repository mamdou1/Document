import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Save, X, Edit2, Trash2 } from "lucide-react";
import { createEntiteeUn, updateEntiteeUnTitre } from "../../api/entiteeUn";
// ✅ NOUVEL IMPORT
import { deleteEntiteeUnTitre } from "../../api/entiteeUn";
import { confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";

type Props = {
  visible: boolean;
  onHide: () => void;
  onSubmit: (data: any) => void;
  refresh: () => void;
  title: string;
  currentTitre?: string; // Titre actuel de l'entité
  onTitreUpdate?: (newTitre: string) => void; // Callback pour mettre à jour le titre global
  onTitreDelete?: () => void; // ✅ Nouvelle prop pour supprimer le titre
};

export default function FormTitreUn({
  visible,
  onHide,
  onSubmit,
  refresh,
  title,
  currentTitre,
  onTitreUpdate,
  onTitreDelete, // ✅ Nouvelle prop
}: Props) {
  const [libelle, setLibelle] = useState("");
  const [loading, setLoading] = useState(false);
  const [editTitreMode, setEditTitreMode] = useState(false);
  const [newTitre, setNewTitre] = useState(currentTitre || "");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const toast = useRef<Toast>(null);

  // Réinitialiser quand le formulaire s'ouvre
  useEffect(() => {
    if (visible) {
      setLibelle("");
      setNewTitre(currentTitre || "");
      setEditTitreMode(false);
    }
  }, [visible, currentTitre]);

  const handleSubmit = async () => {
    if (!libelle.trim()) return;

    setLoading(true);
    try {
      await createEntiteeUn({ libelle });
      onSubmit({ libelle });
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
      await updateEntiteeUnTitre(newTitre);
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
          const result = await deleteEntiteeUnTitre();
          console.log("✅ Résultat suppression:", result);

          if (onTitreDelete) {
            onTitreDelete();
          }

          // Mettre à jour le state local
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
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-900 p-6 text-white">
            <button
              onClick={onHide}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200">
                Niveau 1
              </span>
            </div>
            <h2 className="text-xl font-black tracking-tight">{title}</h2>
          </div>

          {/* CORPS */}
          <div className="p-6 space-y-6">
            {/* SECTION TITRE MODIFIABLE */}
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                  Titre de l'entité
                </label>
                <div className="flex items-center gap-1">
                  {/* Bouton Supprimer - visible seulement si pas en mode édition */}
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
                      className="p-2 hover:bg-emerald-200 rounded-lg transition-colors"
                    >
                      <Edit2 size={14} className="text-emerald-700" />
                    </button>
                  )}
                </div>
              </div>

              {editTitreMode ? (
                <div className="space-y-2">
                  <InputText
                    value={newTitre}
                    onChange={(e) => setNewTitre(e.target.value)}
                    className="w-full p-3 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
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
                      className="p-button-sm bg-emerald-600 border-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="font-bold text-emerald-900 text-lg">
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
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Libellé du nouveau {currentTitre || "élément"}
              </label>
              <InputText
                value={libelle}
                onChange={(e) => setLibelle(e.target.value)}
                placeholder={`Ex: ${currentTitre || "Direction"} Centrale...`}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
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
                disabled={!libelle.trim() || deleteLoading}
                className="bg-emerald-600 text-white px-8 py-3 rounded-xl shadow-lg hover:bg-emerald-700 transition-all"
              />
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}
