import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Save, X, Briefcase, Building2, Layers, GitMerge } from "lucide-react";
import type {
  EntiteeUn,
  EntiteeDeux,
  EntiteeTrois,
  Fonction,
} from "../../interfaces";

type Props = {
  visible: boolean;
  onHide: () => void;
  onSubmit: (data: Partial<Fonction>) => Promise<void>;
  initial?: Partial<Fonction> | null;
  entiteeUn: EntiteeUn[];
  entiteeDeux: EntiteeDeux[];
  entiteeTrois: EntiteeTrois[];
  titres?: {
    entitee1: string;
    entitee2: string;
    entitee3: string;
  };
};

export default function FonctionForm({
  visible,
  onHide,
  onSubmit,
  initial,
  entiteeUn,
  entiteeDeux,
  entiteeTrois,
  titres = { entitee1: "Entité 1", entitee2: "Entité 2", entitee3: "Entité 3" },
}: Props) {
  const [libelle, setLibelle] = useState("");
  const [entitee_un_id, setEntitee_un_id] = useState<number | undefined>();
  const [entitee_deux_id, setEntitee_deux_id] = useState<number | undefined>();
  const [entitee_trois_id, setEntitee_trois_id] = useState<
    number | undefined
  >();
  const [loading, setLoading] = useState(false);

  // États pour les listes filtrées
  const [filteredDeux, setFilteredDeux] = useState<EntiteeDeux[]>([]);
  const [filteredTrois, setFilteredTrois] = useState<EntiteeTrois[]>([]);

  // Initialisation
  useEffect(() => {
    if (visible) {
      if (initial) {
        setLibelle(initial.libelle || "");
        setEntitee_un_id(initial.entitee_un_id);
        setEntitee_deux_id(initial.entitee_deux_id);
        setEntitee_trois_id(initial.entitee_trois_id);
      } else {
        setLibelle("");
        setEntitee_un_id(undefined);
        setEntitee_deux_id(undefined);
        setEntitee_trois_id(undefined);
      }
    }
  }, [visible, initial]);

  // Filtrer les entités de niveau 2 quand le niveau 1 change
  useEffect(() => {
    if (entitee_un_id) {
      const filtered = entiteeDeux.filter(
        (e) => e.entitee_un_id === entitee_un_id,
      );
      setFilteredDeux(filtered);
      setEntitee_deux_id(undefined);
      setEntitee_trois_id(undefined);
    } else {
      setFilteredDeux([]);
    }
  }, [entitee_un_id, entiteeDeux]);

  // Filtrer les entités de niveau 3 quand le niveau 2 change
  useEffect(() => {
    if (entitee_deux_id) {
      const filtered = entiteeTrois.filter(
        (e) => e.entitee_deux_id === entitee_deux_id,
      );
      setFilteredTrois(filtered);
      setEntitee_trois_id(undefined);
    } else {
      setFilteredTrois([]);
    }
  }, [entitee_deux_id, entiteeTrois]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!libelle.trim()) return;

    setLoading(true);
    try {
      await onSubmit({
        libelle,
        entitee_un_id,
        entitee_deux_id,
        entitee_trois_id,
      });
      onHide();
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  // Vérifier si les titres existent
  const titreUnExiste = entiteeUn.length > 0 && entiteeUn[0]?.titre;
  const titreDeuxExiste = entiteeDeux.length > 0 && entiteeDeux[0]?.titre;
  const titreTroisExiste = entiteeTrois.length > 0 && entiteeTrois[0]?.titre;

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      showHeader={false}
      style={{ width: "700px" }}
      className="  rounded-lg overflow-hidden shadow-2xl border-none"
      contentClassName="p-0 bg-white"
    >
      <form onSubmit={handleSubmit}>
        <div className="relative">
          {/* HEADER */}
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-900 p-6 text-white">
            <button
              type="button"
              onClick={onHide}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <Briefcase size={18} className="text-emerald-200" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200">
                {initial ? "Modification" : "Nouvelle fonction"}
              </span>
            </div>
            <h2 className="text-xl font-black tracking-tight">
              {initial ? "Modifier la fonction" : "Créer une fonction"}
            </h2>
          </div>

          {/* CORPS */}
          <div className="p-6 space-y-5">
            {/* Libellé */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Libellé de la fonction <span className="text-red-500">*</span>
              </label>
              <InputText
                value={libelle}
                onChange={(e) => setLibelle(e.target.value)}
                placeholder="Ex: Chef de service, Directeur..."
                className="w-full p-4 bg-slate-50 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
            </div>

            {/* Niveau 1 */}
            {titreUnExiste && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                  <Building2 size={12} className="text-emerald-500" />
                  {titres.entitee1}
                </label>
                <Dropdown
                  value={entitee_un_id}
                  options={entiteeUn}
                  optionLabel="libelle"
                  optionValue="id"
                  onChange={(e) => setEntitee_un_id(e.value)}
                  placeholder={`Sélectionner ${titres.entitee1}`}
                  className="w-full border rounded-xl border-emerald-300 focus:ring-2 focus:ring-emerald-500"
                  filter
                  showClear
                />
              </div>
            )}

            {/* Niveau 2 */}
            {titreDeuxExiste && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                  <Layers size={12} className="text-blue-500" />
                  {titres.entitee2}
                </label>
                <Dropdown
                  value={entitee_deux_id}
                  options={filteredDeux}
                  optionLabel="libelle"
                  optionValue="id"
                  onChange={(e) => setEntitee_deux_id(e.value)}
                  placeholder={`Sélectionner ${titres.entitee2}`}
                  className="w-full rounded-xl border border-emerald-300"
                  disabled={!entitee_un_id}
                  filter
                  showClear
                />
              </div>
            )}

            {/* Niveau 3 */}
            {titreTroisExiste && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                  <GitMerge size={12} className="text-emerald-500" />
                  {titres.entitee3}
                </label>
                <Dropdown
                  value={entitee_trois_id}
                  options={filteredTrois}
                  optionLabel="libelle"
                  optionValue="id"
                  onChange={(e) => setEntitee_trois_id(e.value)}
                  placeholder={`Sélectionner ${titres.entitee3}`}
                  className="w-full rounded-xl border border-emerald-300"
                  disabled={!entitee_deux_id}
                  filter
                  showClear
                />
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-3 p-6 border-t border-slate-100">
            <Button
              type="button"
              label="Annuler"
              icon={<X size={16} />}
              onClick={onHide}
              className="p-button-text text-slate-500"
              disabled={loading}
            />
            <Button
              type="submit"
              label={
                loading ? "Enregistrement..." : initial ? "Modifier" : "Créer"
              }
              icon={<Save size={16} />}
              loading={loading}
              disabled={!libelle.trim()}
              className="bg-emerald-600 text-white font-bold px-10 py-3 rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all"
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
}
