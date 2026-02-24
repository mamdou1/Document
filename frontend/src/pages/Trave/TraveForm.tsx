import React, { useState, useEffect } from "react";
import { getSalles } from "../../api/salle";
import { Rayon, Salle } from "../../interfaces";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Hash, Type, MapPin, Save } from "lucide-react";
import { getRayons } from "../../api/rayon";

export default function TraveForm({
  visible,
  onHide,
  onSubmit,
  refresh,
  initial,
}: any) {
  const [formData, setFormData] = useState({
    code: "",
    rayon_id: "",
  });
  const [rayon, setRayon] = useState<Rayon[]>([]);
  const [loadingRayon, setLoadingRayon] = useState(false);

  // Synchronisation avec les données initiales (Édition vs Création)
  useEffect(() => {
    if (initial?.id) {
      setFormData({
        code: initial.code || "",
        rayon_id: initial.rayon_id || "",
      });
    } else {
      setFormData({ code: "", rayon_id: "" });
    }
  }, [initial, visible]);

  // Chargement de la liste des salles pour le menu déroulant
  useEffect(() => {
    if (visible) {
      setLoadingRayon(true);
      getRayons()
        .then((data) => setRayon(data.salle || data)) // S'adapte selon le format de ton API
        .finally(() => setLoadingRayon(false));
    }
  }, [visible]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // On passe formData au parent (TravePage) qui gère l'appel API via handleAction
    onSubmit(formData);
    refresh();
  };

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={
        <div className="flex items-center gap-2">
          <Type size={20} className="text-green-600" />
          <span className="font-bold">
            {initial?.id ? "Modifier l'Étagère" : "Nouvelle Étagère"}
          </span>
        </div>
      }
      className="w-full max-w-md"
      modal
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-4">
        {/* Code de l'étagère */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-emerald-600 flex items-center gap-2">
            <Hash size={14} /> Code Travé
          </label>
          <InputText
            className="p-3 bg-emerald-50 border-emerald-200 rounded-xl"
            placeholder="Ex: ETG-01"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            required
          />
        </div>

        {/* Sélection de la Rayon */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-emerald-600 flex items-center gap-2">
            <MapPin size={14} /> Salle de destination
          </label>
          <Dropdown
            value={formData.rayon_id}
            options={rayon}
            optionLabel="code"
            optionValue="id"
            placeholder={loadingRayon ? "Chargement..." : "Choisir une rayon"}
            className="w-full bg-emerald-50 border-emerald-200 rounded-xl text-left"
            onChange={(e) => setFormData({ ...formData, rayon_id: e.value })}
            filter
            required
          />
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button
            type="button"
            label="Annuler"
            icon="pi pi-times"
            onClick={onHide}
            className="p-button-text text-emerald-500"
          />
          <Button
            type="submit"
            label={initial?.id ? "Mettre à jour" : "Enregistrer"}
            icon={<Save size={18} className="mr-2" />}
            className="bg-emerald-600 text-white px-8 py-3 rounded-xl shadow-lg hover:bg-emerald-700 transition-all"
          />
        </div>
      </form>
    </Dialog>
  );
}
