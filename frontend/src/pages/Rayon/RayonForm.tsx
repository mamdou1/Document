import React, { useState, useEffect } from "react";
import { getSalles } from "../../api/salle";
import { Salle } from "../../interfaces";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Hash, Type, MapPin, Save, Grid3X3, BoxIcon } from "lucide-react";
import { InputNumber } from "primereact/inputnumber";

export default function RayonForm({
  visible,
  onHide,
  onSubmit,
  refresh,
  initial,
}: any) {
  const [formData, setFormData] = useState({
    code: "",
    salle_id: "",
    // mb_traves_par_rayon: 1,
    // nb_box: 1, // Nouveau champ
    // sigle_trave: "T", // Nouveau champ
    // sigle_box: "B", // Nouveau champ
  });
  const [salles, setSalles] = useState<Salle[]>([]);
  const [loadingSalles, setLoadingSalles] = useState(false);

  // Synchronisation avec les données initiales (Édition vs Création)
  useEffect(() => {
    if (initial?.id) {
      setFormData({
        code: initial.code || "",
        salle_id: initial.salle_id || "",
        // mb_traves_par_rayon: 0,
        // nb_box: 0,
        // sigle_trave: "",
        // sigle_box: "",
      });
    } else {
      setFormData({
        code: "",
        salle_id: "",
        // mb_traves_par_rayon: 1,
        // nb_box: 1,
        // sigle_trave: "T",
        // sigle_box: "B",
      });
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
    // On passe formData au parent (RayonPage) qui gère l'appel API via handleAction
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
            {initial?.id ? "Modifier le Rayon" : "Nouvelle Rayon"}
          </span>
        </div>
      }
      className="w-full max-w-xl"
      modal
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-4">
        {/* Code de l'étagère */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-emerald-600 flex items-center gap-2">
            <Hash size={14} /> Code Rayon
          </label>
          <InputText
            className="p-3 bg-emerald-50 border-emerald-200 rounded-xl"
            placeholder="Ex: ETG-01"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
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

        {/* {!initial?.id && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b pb-2">
              Paramètres de génération
            </h3>

            <div className="grid grid-cols-2 gap-4"> */}
        {/* Travées */}
        {/* <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <label className="text-[10px] font-black text-emerald-800 flex items-center gap-1 uppercase">
                  <Grid3X3 size={12} /> Travées / R
                </label>
                <InputNumber
                  value={formData.mb_traves_par_rayon}
                  onValueChange={(e) =>
                    setFormData({
                      ...formData,
                      mb_traves_par_rayon: e.value || 1,
                    })
                  }
                  min={1}
                  className="w-full"
                  inputClassName="p-2 w-full text-center font-bold"
                  showButtons
                />
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase">
                    Sigle
                  </span>
                  <InputText
                    value={formData.sigle_trave}
                    onChange={(e) =>
                      setFormData({ ...formData, sigle_trave: e.target.value })
                    }
                    className="p-2 text-xs text-center uppercase"
                    placeholder="Ex: T"
                  />
                </div>
              </div> */}

        {/* Boxes */}
        {/* <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <label className="text-[10px] font-black text-emerald-800 flex items-center gap-1 uppercase">
                  <BoxIcon size={12} /> Boxes / T
                </label>
                <InputNumber
                  value={formData.nb_box}
                  onValueChange={(e) =>
                    setFormData({ ...formData, nb_box: e.value || 1 })
                  }
                  min={1}
                  className="w-full"
                  inputClassName="p-2 w-full text-center font-bold"
                  showButtons
                />
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase">
                    Sigle
                  </span>
                  <InputText
                    value={formData.sigle_box}
                    onChange={(e) =>
                      setFormData({ ...formData, sigle_box: e.target.value })
                    }
                    className="p-2 text-xs text-center uppercase"
                    placeholder="Ex: B"
                  />
                </div>
              </div>
            </div>
          </div>
        )} */}

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
