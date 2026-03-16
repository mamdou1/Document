import React, { useState, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Save, GitMerge, Layers, Info, Hash } from "lucide-react";

import { EntiteeDeux, EntiteeTrois } from "../../../interfaces";

type Props = {
  visible: boolean;
  onHide: () => void;
  onSubmit: (data: Partial<EntiteeTrois>) => Promise<void>;
  refresh: () => void;
  initial?: Partial<EntiteeTrois>;
  title?: string;
  entiteeDeux: EntiteeDeux[]; // Liste des services venant du parent
};

export default function EntiteeTroisForm({
  visible,
  onHide,
  onSubmit,
  refresh,
  title = "Nouveau",
  initial = {},
  entiteeDeux = [], // Valeur par défaut pour éviter les erreurs .map
}: Props) {
  //const [code, setCode] = useState("");
  const [libelle, setLibelle] = useState("");
  const [entitee_deux_id, setEntitee_deux_id] = useState<number>(
    initial.entitee_deux_id || entiteeDeux[0]?.id || 0,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      //setCode(initial.code || "");
      setLibelle(initial.libelle || "");
      // Gestion intelligente de l'ID initial
      setEntitee_deux_id(initial.entitee_deux_id || 0);
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (!libelle || !entitee_deux_id) return;
    setLoading(true);
    try {
      await onSubmit({
        libelle,
        entitee_deux_id,
      });
      setLibelle("");
      ////onHide();
      refresh();
    } finally {
      setLoading(false);
    }
  };

  // On récupère les titres depuis les données reçues
  const titreNiveau1 = entiteeDeux[0]?.titre || "----";
  // On peut essayer de deviner le titre du niveau 2 via l'objet initial ou un titre par défaut
  const titreNiveau2 = initial?.titre || "----";

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <GitMerge className="text-emerald-500" size={20} />
          {initial.id ? "Modifier" : "Nouveau"} {titreNiveau2}
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
            <Layers size={16} className="text-emerald-500" />
            Sélectionner le {titreNiveau1}{" "}
          </label>
          <Dropdown
            value={entitee_deux_id}
            options={entiteeDeux}
            onChange={(e) => setEntitee_deux_id(e.value)}
            optionLabel="libelle"
            optionValue="id"
            placeholder={`Choisir un(e) ${titreNiveau1}`}
            className="w-full bg-slate-50 border-slate-200 rounded-xl"
            filter
          />
        </div>

        {/* <div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
            <Hash size={16} className="text-emerald-500" /> Code de la{" "}
            {titreNiveau2}{" "}
          </label>
          <InputText
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
            placeholder="Ex: SEC-001"
          />
        </div> */}

        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
            <Info size={16} className="text-emerald-500" />
            Libellé de la {titreNiveau2}
          </label>
          <InputText
            value={libelle}
            onChange={(e) => setLibelle(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20"
            placeholder={`Ex: ${titreNiveau2} Maintenance`}
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
            disabled={!libelle || !entitee_deux_id || loading}
            className="bg-emerald-500 text-white px-8 py-3 rounded-xl shadow-lg hover:bg-orange-600 transition-all border-none"
          />
        </div>
      </div>
    </Dialog>
  );
}
