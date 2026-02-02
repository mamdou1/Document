import React, { useState, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import {
  FileStack,
  Hash,
  Type,
  Save,
  X,
  Layers,
  Building2,
  GitMerge,
  FileText,
} from "lucide-react";
import { Division, Pieces } from "../../interfaces";
import { getAllEntiteeUn } from "../../api/entiteeUn";
import { getAllEntiteeDeux } from "../../api/entiteeDeux";
import { getAllEntiteeTrois } from "../../api/entiteeTrois";
import { EntiteeDeux, EntiteeTrois, EntiteeUn } from "../../interfaces";

import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";

type Props = {
  visible: boolean;
  onHide: () => void;
  onSubmit: (data: Partial<Pieces>) => Promise<void>;
  initial?: Partial<Pieces>;
  title?: string;
  division: Division[]; // Liste des services venant du parent
};

export default function PiecesForm({
  visible,
  onHide,
  onSubmit,
  initial = {},
  title,
  division = [],
}: Props) {
  const [formData, setFormData] = useState({
    code_piece: "",
    libelle: "",
    entites_un_id: [] as number[],
    entites_deux_id: [] as number[],
    entites_trois_id: [] as number[],
  });

  const [options, setOptions] = useState({
    n1: [] as EntiteeUn[],
    n2: [] as EntiteeDeux[],
    n3: [] as EntiteeTrois[],
  });

  const [loading, setLoading] = useState(false);

  // Chargement des options
  useEffect(() => {
    if (visible) {
      const loadData = async () => {
        try {
          const [r1, r2, r3] = await Promise.all([
            getAllEntiteeUn(),
            getAllEntiteeDeux(),
            getAllEntiteeTrois(),
          ]);
          setOptions({
            n1: Array.isArray(r1) ? r1 : [],
            n2: Array.isArray(r2) ? r2 : [],
            n3: Array.isArray(r3) ? r3 : [],
          });
        } catch (err) {
          console.error("Erreur options:", err);
        }
      };
      loadData();
    }
  }, [visible]);

  // Initialisation du formulaire (Edit vs Create)
  useEffect(() => {
    if (visible && initial?.id) {
      setFormData({
        code_piece: initial.code_pieces || "",
        libelle: initial.libelle || "",
        entites_un_id: initial.entites_un?.map((e: any) => e.id) || [],
        entites_deux_id: initial.entites_deux?.map((e: any) => e.id) || [],
        entites_trois_id: initial.entites_trois?.map((e: any) => e.id) || [],
      });
    } else {
      setFormData({
        code_piece: "",
        libelle: "",
        entites_un_id: [],
        entites_deux_id: [],
        entites_trois_id: [],
      });
    }
  }, [visible, initial]);

  const handleSubmit = async () => {
    if (!formData.libelle || !formData.code_piece) return;
    setLoading(true);
    try {
      await onSubmit(formData);
      onHide();
    } finally {
      setLoading(false);
    }
  };

  // Styles réutilisables
  const labelStyle =
    "text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2";
  const inputWrapper = "flex flex-col gap-1";

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2 text-slate-800 font-bold">
          <div className="bg-emerald-100 p-2 rounded-lg">
            <FileStack size={18} className="text-emerald-600" />
          </div>
          <span>{title}</span>
        </div>
      }
      visible={visible}
      style={{ width: "700px" }}
      onHide={onHide}
      draggable={false}
      className="rounded-[2.5rem] overflow-hidden shadow-2xl"
    >
      <div className="pt-4 space-y-6">
        {/* Champ Code Référence */}

        <form onSubmit={handleSubmit} className="pt-4 grid grid-cols-1 gap-6">
          {/* Colonne Gauche: Identité */}
          <div className="grid grid-cols-2 gap-4">
            <div className={inputWrapper}>
              <label className={labelStyle}>
                <Hash size={14} className="text-emerald-500" /> Code
              </label>
              <InputText
                value={formData.code_piece}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code_piece: e.target.value.toUpperCase(),
                  })
                }
                placeholder="Ex: DOC-01"
                className="p-3 bg-slate-50 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div className={inputWrapper}>
              <label className={labelStyle}>
                <FileText size={14} className="text-emerald-500" /> Nom du type
              </label>
              <InputText
                value={formData.libelle}
                onChange={(e) =>
                  setFormData({ ...formData, libelle: e.target.value })
                }
                placeholder="Ex: Facture d'achat"
                className="p-3 bg-slate-50 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section Affectations Multiples */}
          <div className="space-y-5 bg-slate-100/40 p-5 rounded-2xl border border-slate-100">
            <h3 className="text-xs font-black uppercase text-emerald-600 tracking-tighter mb-4">
              Périmètres d'application
            </h3>

            <div className={inputWrapper}>
              <label className={labelStyle}>
                <Building2 size={14} /> Ministères (Niveau 1)
              </label>
              <MultiSelect
                value={formData.entites_un_id}
                options={options.n1}
                optionLabel="libelle"
                optionValue="id"
                onChange={(e) =>
                  setFormData({ ...formData, entites_un_id: e.value })
                }
                placeholder="Sélectionner les ministères"
                display="chip"
                filter
                className="w-full border border-emerald-200 rounded-xl hover:border-emerald-400"
              />
            </div>

            <div className={inputWrapper}>
              <label className={labelStyle}>
                <Layers size={14} /> Directions (Niveau 2)
              </label>
              <MultiSelect
                value={formData.entites_deux_id}
                options={options.n2}
                optionLabel="libelle"
                optionValue="id"
                onChange={(e) =>
                  setFormData({ ...formData, entites_deux_id: e.value })
                }
                placeholder="Sélectionner les directions"
                display="chip"
                filter
                className="w-full border border-emerald-200 rounded-xl hover:border-emerald-400"
              />
            </div>

            <div className={inputWrapper}>
              <label className={labelStyle}>
                <GitMerge size={14} /> Services (Niveau 3)
              </label>
              <MultiSelect
                value={formData.entites_trois_id}
                options={options.n3}
                optionLabel="libelle"
                optionValue="id"
                onChange={(e) =>
                  setFormData({ ...formData, entites_trois_id: e.value })
                }
                placeholder="Sélectionner les services"
                display="chip"
                filter
                className="w-full border border-emerald-200 rounded-xl hover:border-emerald-400"
              />
            </div>
          </div>
        </form>

        {/* Actions du pied de page */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
          <Button
            label="Annuler"
            icon={<X size={18} className="mr-2" />}
            onClick={onHide}
            className="p-button-text text-slate-400 font-bold hover:text-slate-600 transition-colors"
          />
          <Button
            label={loading ? "Traitement..." : "Enregistrer la pièce"}
            icon={!loading && <Save size={18} className="mr-2" />}
            onClick={handleSubmit}
            disabled={loading || !formData.code_piece || !formData.libelle}
            className="bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl border-none shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
          />
        </div>
      </div>
    </Dialog>
  );
}
