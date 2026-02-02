import React, { useState, useEffect } from "react";
import { getSalles } from "../../api/salle";
import { Salle } from "../../interfaces";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Hash, Type, MapPin, Save } from "lucide-react";

export default function EtagereForm({
  visible,
  onHide,
  onSubmit,
  initial,
}: any) {
  const [formData, setFormData] = useState({
    code_etagere: "",
    libelle: "",
    salle_id: "",
  });
  const [salles, setSalles] = useState<Salle[]>([]);
  const [loadingSalles, setLoadingSalles] = useState(false);

  // Synchronisation avec les données initiales (Édition vs Création)
  useEffect(() => {
    if (initial?.id) {
      setFormData({
        code_etagere: initial.code_etagere || "",
        libelle: initial.libelle || "",
        salle_id: initial.salle_id || "",
      });
    } else {
      setFormData({ code_etagere: "", libelle: "", salle_id: "" });
    }
  }, [initial, visible]);

  // Chargement de la liste des salles pour le menu déroulant
  useEffect(() => {
    if (visible) {
      setLoadingSalles(true);
      getSalles()
        .then((data) => setSalles(data.salle || data)) // S'adapte selon le format de ton API
        .finally(() => setLoadingSalles(false));
    }
  }, [visible]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // On passe formData au parent (EtagerePage) qui gère l'appel API via handleAction
    onSubmit(formData);
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
            <Hash size={14} /> Code Étagère
          </label>
          <InputText
            className="p-3 bg-emerald-50 border-emerald-200 rounded-xl"
            placeholder="Ex: ETG-01"
            value={formData.code_etagere}
            onChange={(e) =>
              setFormData({ ...formData, code_etagere: e.target.value })
            }
            required
          />
        </div>

        {/* Libellé */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-emerald-600 flex items-center gap-2">
            <Type size={14} /> Libellé / Nom
          </label>
          <InputText
            className="p-3 bg-emerald-50 border-emerald-200 rounded-xl"
            placeholder="Ex: Étagère Nord Section A"
            value={formData.libelle}
            onChange={(e) =>
              setFormData({ ...formData, libelle: e.target.value })
            }
            required
          />
        </div>

        {/* Sélection de la Salle */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-emerald-600 flex items-center gap-2">
            <MapPin size={14} /> Salle de destination
          </label>
          <Dropdown
            value={formData.salle_id}
            options={salles}
            optionLabel="libelle"
            optionValue="id"
            placeholder={loadingSalles ? "Chargement..." : "Choisir une salle"}
            className="w-full bg-emerald-50 border-emerald-200 rounded-xl text-left"
            onChange={(e) => setFormData({ ...formData, salle_id: e.value })}
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
