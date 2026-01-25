import React, { useState, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Save, PlusCircle, BookmarkPlus, Info } from "lucide-react";
import { createFonction } from "../../api/fonction"; // Assurez-vous d'avoir ce service
import { Toast } from "primereact/toast";

export default function ServiceAjoutFonction({
  visible,
  onHide,
  service,
  onSuccess,
}: any) {
  const [libelle, setLibelle] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);

  if (!service) return null;

  const handleSubmit = async () => {
    if (!libelle) return;
    setLoading(true);
    try {
      // On crée la fonction en lui passant le service_id
      await createFonction({
        libelle,
        service_id: service.id,
      });

      setLibelle("");
      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Division créé",
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout de la fonction", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2 text-slate-800 font-bold">
          <PlusCircle size={20} className="text-indigo-500" />
          <span>Ajouter une fonction au service</span>
        </div>
      }
      visible={visible}
      style={{ width: "450px" }}
      onHide={onHide}
      draggable={false}
    >
      <div className="pt-4 space-y-5">
        {/* Rappel du service concerné */}
        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">
            Service sélectionné
          </p>
          <p className="text-indigo-900 font-bold">{service.libelle}</p>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
            <BookmarkPlus size={16} className="text-blue-500" /> Nom de la
            fonction
          </label>
          <InputText
            value={libelle}
            onChange={(e) => setLibelle(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none"
            placeholder="Ex: Chef de Service, Secrétaire..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
          <Button
            label="Annuler"
            onClick={onHide}
            className="p-button-text text-slate-500 font-semibold"
          />
          <Button
            label={loading ? "Ajout..." : "Ajouter la fonction"}
            icon={!loading && <Save size={18} className="mr-2" />}
            onClick={handleSubmit}
            disabled={!libelle || loading}
            className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-indigo-200 hover:bg-blue-700 transition-all"
          />
        </div>
      </div>
    </Dialog>
  );
}
