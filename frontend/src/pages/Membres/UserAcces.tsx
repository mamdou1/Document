import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { MultiSelect } from "primereact/multiselect";
import { Save, Building2, Layers, GitMerge } from "lucide-react";

import { getAllEntiteeUn } from "../../api/entiteeUn";
import { getAllEntiteeDeux } from "../../api/entiteeDeux";
import { getAllEntiteeTrois } from "../../api/entiteeTrois";
import {
  EntiteeDeux,
  EntiteeTrois,
  EntiteeUn,
  AgentEntiteeAccess,
} from "../../interfaces";

type Props = {
  visible: boolean;
  onHide: () => void;
  onSubmit: (payload: any[]) => Promise<void>;
  agentId: number;
  initial?: AgentEntiteeAccess[];
  title?: string;
};

// Interface pour le payload de création multiple
interface GrantAccessPayload {
  agent_id: number;
  entitee_un_id?: number | null;
  entitee_deux_id?: number | null;
  entitee_trois_id?: number | null;
}

export default function UserAcces({
  visible,
  onHide,
  onSubmit,
  agentId,
  initial = [],
  title = "Gestion des accès",
}: Props) {
  const [formData, setFormData] = useState({
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
    let isMounted = true; // Pour éviter les mises à jour sur composant démonté

    if (visible) {
      const loadData = async () => {
        try {
          const [r1, r2, r3] = await Promise.all([
            getAllEntiteeUn(),
            getAllEntiteeDeux(),
            getAllEntiteeTrois(),
          ]);

          if (isMounted) {
            setOptions({
              n1: Array.isArray(r1) ? r1 : [],
              n2: Array.isArray(r2) ? r2 : [],
              n3: Array.isArray(r3) ? r3 : [],
            });
          }
        } catch (err) {
          console.error("Erreur options:", err);
        }
      };
      loadData();
    }

    return () => {
      isMounted = false; // Nettoyage
    };
  }, [visible]); // ✅ Dépendance UNIQUEMENT sur visible

  // 2. CORRIGER le useEffect d'initialisation du formulaire
  useEffect(() => {
    if (visible) {
      if (initial && initial.length > 0) {
        // Mode édition
        const unIds = initial
          .filter(
            (
              acc,
            ): acc is AgentEntiteeAccess & {
              entitee_un: NonNullable<AgentEntiteeAccess["entitee_un"]>;
            } => !!acc.entitee_un,
          )
          .map((acc) => acc.entitee_un.id)
          .filter((id, index, self) => self.indexOf(id) === index);

        const deuxIds = initial
          .filter(
            (
              acc,
            ): acc is AgentEntiteeAccess & {
              entitee_deux: NonNullable<AgentEntiteeAccess["entitee_deux"]>;
            } => !!acc.entitee_deux,
          )
          .map((acc) => acc.entitee_deux.id)
          .filter((id, index, self) => self.indexOf(id) === index);

        const troisIds = initial
          .filter(
            (
              acc,
            ): acc is AgentEntiteeAccess & {
              entitee_trois: NonNullable<AgentEntiteeAccess["entitee_trois"]>;
            } => !!acc.entitee_trois,
          )
          .map((acc) => acc.entitee_trois.id)
          .filter((id, index, self) => self.indexOf(id) === index);

        setFormData({
          entites_un_id: unIds,
          entites_deux_id: deuxIds,
          entites_trois_id: troisIds,
        });
      } else {
        // Mode création
        setFormData({
          entites_un_id: [],
          entites_deux_id: [],
          entites_trois_id: [],
        });
      }
    }
  }, [visible, initial]);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const payload: GrantAccessPayload[] = [];

      // Ajouter les accès EntiteeUn
      formData.entites_un_id.forEach((id) => {
        payload.push({
          agent_id: agentId,
          entitee_un_id: id,
          entitee_deux_id: null,
          entitee_trois_id: null,
        });
      });

      // Ajouter les accès EntiteeDeux
      formData.entites_deux_id.forEach((id) => {
        payload.push({
          agent_id: agentId,
          entitee_un_id: null,
          entitee_deux_id: id,
          entitee_trois_id: null,
        });
      });

      // Ajouter les accès EntiteeTrois
      formData.entites_trois_id.forEach((id) => {
        payload.push({
          agent_id: agentId,
          entitee_un_id: null,
          entitee_deux_id: null,
          entitee_trois_id: id,
        });
      });

      await onSubmit(payload);
      onHide();
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
    } finally {
      setLoading(false);
    }
  };

  // Styles réutilisables
  const labelStyle =
    "text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2";
  const inputWrapper = "flex flex-col gap-1";

  // ✅ Vérifier si les titres existent pour chaque niveau
  const titreN1Existe = options.n1.length > 0 && options.n1[0]?.titre;
  const titreN2Existe = options.n2.length > 0 && options.n2[0]?.titre;
  const titreN3Existe = options.n3.length > 0 && options.n3[0]?.titre;

  return (
    <Dialog
      header={
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
            <Building2 size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 leading-none">
              {title}
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {initial.length > 0
                ? `Modification des accès (${initial.length} existant(s))`
                : "Configurer les accès aux documents"}
            </p>
          </div>
        </div>
      }
      visible={visible}
      style={{ width: "700px" }}
      onHide={onHide}
      className="rounded-[2rem] overflow-hidden"
      footer={
        <div className="flex justify-end gap-3 p-6 bg-slate-50/80">
          <Button
            label="Annuler"
            onClick={onHide}
            className="p-button-text text-slate-400 font-bold hover:bg-slate-200"
            disabled={loading}
          />
          <Button
            label={loading ? "Enregistrement..." : "Sauvegarder"}
            icon={!loading && <Save size={18} className="mr-2" />}
            onClick={handleSubmit}
            loading={loading}
            disabled={
              formData.entites_un_id.length === 0 &&
              formData.entites_deux_id.length === 0 &&
              formData.entites_trois_id.length === 0
            }
            className="bg-emerald-600 text-emerald-50 border-none px-8 py-3 rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all font-bold"
          />
        </div>
      }
    >
      <div className="flex flex-col gap-6 pt-4 px-2">
        {/* Message d'info */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
          <p className="text-xs text-amber-800 flex items-center gap-2">
            <span className="font-bold">📌 Note :</span>
            Les accès sélectionnés seront attribués à l'agent. Vous pouvez
            choisir plusieurs entités de différents niveaux.
          </p>
        </div>

        {/* Section Affectations Multiples */}
        <div className="space-y-5 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
          <h3 className="text-xs font-black uppercase text-emerald-600 tracking-tighter mb-4 flex items-center gap-2">
            <Building2 size={14} />
            Périmètres d'application
          </h3>

          {/* Niveau 1 - EntiteeUn - S'affiche uniquement si le titre existe */}
          {titreN1Existe && (
            <div className={inputWrapper}>
              <label className={labelStyle}>
                <Building2 size={14} className="text-blue-500" />
                {options.n1[0]?.titre ||
                  "Ministères / Directions Générales"}{" "}
                (N1)
                {formData.entites_un_id.length > 0 && (
                  <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {formData.entites_un_id.length} sélectionnée(s)
                  </span>
                )}
              </label>
              <MultiSelect
                value={formData.entites_un_id}
                options={options.n1}
                optionLabel="libelle"
                optionValue="id"
                onChange={(e) =>
                  setFormData({ ...formData, entites_un_id: e.value })
                }
                placeholder={`Sélectionner les ${options.n1[0]?.titre || "entités"}`}
                display="chip"
                filter
                className="w-full border border-slate-200 rounded-xl hover:border-emerald-400 transition-all"
                maxSelectedLabels={3}
              />
            </div>
          )}

          {/* Niveau 2 - EntiteeDeux - S'affiche uniquement si le titre existe */}
          {titreN2Existe && (
            <div className={inputWrapper}>
              <label className={labelStyle}>
                <Layers size={14} className="text-purple-500" />
                {options.n2[0]?.titre || "Directions / Services"} (N2)
                {formData.entites_deux_id.length > 0 && (
                  <span className="ml-2 text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                    {formData.entites_deux_id.length} sélectionnée(s)
                  </span>
                )}
              </label>
              <MultiSelect
                value={formData.entites_deux_id}
                options={options.n2}
                optionLabel="libelle"
                optionValue="id"
                onChange={(e) =>
                  setFormData({ ...formData, entites_deux_id: e.value })
                }
                placeholder={`Sélectionner les ${options.n2[0]?.titre || "entités"}`}
                display="chip"
                filter
                className="w-full border border-slate-200 rounded-xl hover:border-emerald-400 transition-all"
                maxSelectedLabels={3}
              />
            </div>
          )}

          {/* Niveau 3 - EntiteeTrois - S'affiche uniquement si le titre existe */}
          {titreN3Existe && (
            <div className={inputWrapper}>
              <label className={labelStyle}>
                <GitMerge size={14} className="text-emerald-500" />
                {options.n3[0]?.titre || "Divisions / Sous-services"} (N3)
                {formData.entites_trois_id.length > 0 && (
                  <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                    {formData.entites_trois_id.length} sélectionnée(s)
                  </span>
                )}
              </label>
              <MultiSelect
                value={formData.entites_trois_id}
                options={options.n3}
                optionLabel="libelle"
                optionValue="id"
                onChange={(e) =>
                  setFormData({ ...formData, entites_trois_id: e.value })
                }
                placeholder={`Sélectionner les ${options.n3[0]?.titre || "entités"}`}
                display="chip"
                filter
                className="w-full border border-slate-200 rounded-xl hover:border-emerald-400 transition-all"
                maxSelectedLabels={3}
              />
            </div>
          )}

          {/* Message si aucun titre n'existe */}
          {!titreN1Existe && !titreN2Existe && !titreN3Existe && (
            <div className="p-6 bg-slate-100 rounded-xl text-center">
              <p className="text-sm text-slate-500 italic">
                Aucune entité disponible pour le moment
              </p>
            </div>
          )}

          {/* Résumé des sélections - s'affiche uniquement s'il y a des sélections */}
          {(formData.entites_un_id.length > 0 ||
            formData.entites_deux_id.length > 0 ||
            formData.entites_trois_id.length > 0) && (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
              <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-2">
                <span>📋 Récapitulatif</span>
              </p>
              <p className="text-xs text-emerald-600 mt-1">
                {titreN1Existe && `${formData.entites_un_id.length} N1, `}
                {titreN2Existe && `${formData.entites_deux_id.length} N2, `}
                {titreN3Existe && `${formData.entites_trois_id.length} N3`}
                <span className="ml-2 text-emerald-500">•</span>
                <span className="ml-2 font-bold">
                  Total:{" "}
                  {formData.entites_un_id.length +
                    formData.entites_deux_id.length +
                    formData.entites_trois_id.length}{" "}
                  accès
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}
