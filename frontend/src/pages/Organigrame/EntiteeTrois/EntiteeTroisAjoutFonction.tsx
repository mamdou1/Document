import React, { useState, useRef, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Save, PlusCircle, BookmarkPlus } from "lucide-react";
import { createFonction, updateFonctionById } from "../../../api/fonction";
import { Toast } from "primereact/toast";

export default function EntiteeTroisAjoutFonction({
  visible,
  onHide,
  entiteeTrois,
  refresh,
  onSuccess,
  editing,
}: any) {
  const [libelle, setLibelle] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    if (editing) {
      setLibelle(editing.libelle);
    } else {
      setLibelle("");
    }
  }, [editing, visible]);

  const handleSubmit = async () => {
    // 1. Vérification de sécurité
    if (!libelle || !entiteeTrois?.id) {
      toast.current?.show({
        severity: "warn",
        summary: "Attention",
        detail: "Le libellé est requis",
        life: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      if (editing?.id) {
        // --- MODE EDITION ---
        await updateFonctionById(editing.id, { libelle });
        toast.current?.show({
          severity: "success",
          summary: "Mise à jour réussie",
          detail: `La fonction a été modifiée avec succès`,
          life: 3000,
        });
      } else {
        // --- MODE CREATION - CORRIGÉ ICI ---
        await createFonction({
          libelle,
          entitee_trois_id: entiteeTrois.id, // ✅ CORRECTION : entitee_trois_id au lieu de entitee_un_id
        });
        toast.current?.show({
          severity: "success",
          summary: "Création réussie",
          detail: "La nouvelle fonction a été ajoutée",
          life: 3000,
        });
      }

      setLibelle("");

      // On laisse un petit délai pour que l'utilisateur voit le toast avant la fermeture
      setTimeout(() => {
        if (onSuccess) onSuccess();
        //refresh();
        onHide();
      }, 500);
    } catch (error) {
      console.error("Erreur lors de l'opération", error);
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Une erreur est survenue lors de l'enregistrement",
        life: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header={
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <PlusCircle size={20} className="text-indigo-500" />
            <span>
              {editing ? "Modifier" : "Ajouter"} une fonction au{" "}
              {entiteeTrois?.titre || "..."}
            </span>
          </div>
        }
        visible={visible}
        style={{ width: "450px" }}
        onHide={() => {
          setLibelle("");
          onHide();
        }}
        draggable={false}
      >
        <Toast ref={toast} />
        <div className="pt-4 space-y-5">
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
            <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-1">
              {entiteeTrois?.titre} cible
            </p>
            <p className="text-orange-900 font-bold">{entiteeTrois?.libelle}</p>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
              <BookmarkPlus size={16} className="text-purple-500" /> Libellé du
              poste
            </label>
            <InputText
              value={libelle}
              onChange={(e) => setLibelle(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              placeholder="Ex: Technicien de surface"
            />
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              label={loading ? "Enregistrement..." : "Ajouter"}
              onClick={handleSubmit}
              disabled={loading}
              className="bg-purple-600 text-white px-8 py-3 rounded-xl shadow-lg"
            />
          </div>
        </div>
      </Dialog>
    </>
  );
}
