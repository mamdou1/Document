import React, { useState, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Save, GitMerge, Layers, Info } from "lucide-react";

// Importez vos nouveaux services et interfaces
import { getAllDivision } from "../../api/division";
import { createSection } from "../../api/section"; // ou secteur.ts selon votre nom de fichier
import { Division, Section } from "../../interfaces";

type Props = {
  visible: boolean;
  onHide: () => void;
  onSubmit: (data: Partial<Section>) => Promise<void>;
  initial?: Partial<Section>;
  title?: string;
  division: Division[]; // Liste des services venant du parent
};

export default function SectionForm({
  visible,
  onHide,
  onSubmit,
  initial = {},
  division = [], // Valeur par défaut pour éviter les erreurs .map
}: Props) {
  const [libelle, setLibelle] = useState("");
  const [division_id, setDivision_id] = useState<number | null>(null);
  //const [divisions, setDivisions] = useState<Division[]>([]); // Typage explicite
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setLibelle(initial.libelle || "");
      // Gestion intelligente de l'ID initial
      setDivision_id(initial.division_id || division[0]?.id || 0);
    }
  }, [visible, division]);

  const handleSubmit = async () => {
    if (!libelle || !division_id) return;
    setLoading(true);
    try {
      await onSubmit({
        libelle,
        division_id,
      });
      setLibelle("");
      ////onHide();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <GitMerge className="text-blue-500" size={20} />
          <span>Nouvelle Unité de Section</span>
        </div>
      }
      visible={visible}
      style={{ width: "500px" }}
      onHide={onHide}
      draggable={false}
    >
      <div className="pt-4 space-y-5">
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
            <Layers size={16} className="text-blue-500" /> Division de
            rattachement
          </label>
          <Dropdown
            value={division_id}
            options={division}
            onChange={(e) => setDivision_id(e.value)}
            optionLabel="libelle"
            optionValue="id"
            placeholder="Choisir une division"
            className="w-full bg-slate-50 border-slate-200 rounded-xl"
            filter
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
            <Info size={16} className="text-blue-500" /> Libellé de la Section
          </label>
          <InputText
            value={libelle}
            onChange={(e) => setLibelle(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20"
            placeholder="Ex: Section Maintenance"
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button
            label="Annuler"
            onClick={onHide}
            className="p-button-text text-slate-500 font-semibold"
          />
          <Button
            label={loading ? "Enregistrement..." : "Enregistrer"}
            icon={!loading && <Save size={18} className="mr-2" />}
            onClick={handleSubmit}
            disabled={!libelle || !division_id || loading}
            className="bg-blue-500 text-white px-8 py-3 rounded-xl shadow-lg hover:bg-orange-600 transition-all border-none"
          />
        </div>
      </div>
    </Dialog>
  );
}
