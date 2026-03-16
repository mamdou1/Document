import React, { useState, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Save, Layers, Building2, Info, Hash } from "lucide-react";
import { EntiteeDeux, EntiteeUn } from "../../../interfaces";
type Props = {
  visible: boolean;
  onHide: () => void;
  onSubmit: (data: Partial<EntiteeDeux>) => Promise<void>;
  refresh: () => void;
  initial?: Partial<EntiteeDeux>; // ✅ correction ici
  title?: string;
  entiteeUn: EntiteeUn[];
};

export default function EntiteeDeuxForm({
  visible,
  onHide,
  onSubmit,
  refresh,
  initial = {},
  title = "Ajouter une division",
  entiteeUn,
}: Props) {
  const [libelle, setLibelle] = useState("");
  //const [code, setCode] = useState("");
  const [entitee_un_id, setEntitee_un_id] = useState<number>(
    initial.entitee_un_id || entiteeUn[0]?.id || 0,
  );

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      console.log("📝 Formulaire ouvert avec initial:", initial);
      console.log("📝 entitee_un_id:", initial.entitee_un_id);
      console.log("📝 libelle:", initial.libelle);
      console.log("📝 code:", initial.code);

      setLibelle(initial.libelle || "");
      //setCode(initial.code || "");
      setEntitee_un_id(initial.entitee_un_id || entiteeUn[0]?.id || 0);
    }
  }, [visible, entiteeUn]);

  const handleSubmit = async () => {
    console.log("🚀 Soumission avec:", { libelle, entitee_un_id });
    setLoading(true);
    try {
      await onSubmit({ libelle, entitee_un_id });
      console.log("✅ Soumission réussie");
      refresh();
    } catch (error) {
      console.error("❌ Erreur soumission:", error);
    } finally {
      setLoading(false);
    }
  };

  // On récupère les titres depuis les données reçues
  const titreNiveau1 = entiteeUn[0]?.titre || "----";
  // On peut essayer de deviner le titre du niveau 2 via l'objet initial ou un titre par défaut
  const titreNiveau2 = initial?.titre || "----";

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <Layers className="text-emerald-500" size={20} />
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
            <Building2 size={16} className="text-emerald-500" />
            Sélectionner le {titreNiveau1}{" "}
            {/* Dynamique : ex "Sélectionner le Service" */}
          </label>
          <Dropdown
            value={entitee_un_id}
            options={entiteeUn} // directement la liste des entitee_un
            onChange={(e) => setEntitee_un_id(e.value)}
            optionLabel="libelle"
            optionValue="id"
            placeholder={`Choisir un(e) ${titreNiveau1}`}
            filter
          />
        </div>

        {/* <div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
            <Hash size={16} className="text-emerald-500" />
            Code de la {titreNiveau2}{" "}
          </label>
          <InputText
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
            placeholder="Ex: PRC-001"
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
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
            placeholder={`Ex: ${titreNiveau2} Comptabilité`}
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button
            label="Annuler"
            onClick={onHide}
            className="p-button-text text-slate-500"
          />
          <Button
            label="Enregistrer"
            icon={<Save size={18} className="mr-2" />}
            onClick={handleSubmit}
            disabled={!libelle || !entitee_un_id}
            className="bg-emerald-600 text-white px-8 py-3 rounded-xl shadow-lg"
          />
        </div>
      </div>
    </Dialog>
  );
}
