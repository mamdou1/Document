import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Building2, Layers, GitMerge, Save } from "lucide-react";
import { getAllEntiteeUn } from "../../api/entiteeUn";
import { getEntiteeDeuxByEntiteeUn } from "../../api/entiteeDeux";
import { getEntiteeTroisByEntiteeDeux } from "../../api/entiteeTrois";
import type { EntiteeUn, EntiteeDeux, EntiteeTrois } from "../../interfaces";

export default function DocumentTypeAffectationForm({
  visible,
  onHide,
  onSubmit,
  initial,
  title,
}: any) {
  const [loading, setLoading] = useState(false);
  const [entitee_un_id, setEntitee_un_id] = useState<number | undefined>();
  const [entitee_deux_id, setEntitee_deux_id] = useState<number | undefined>();
  const [entitee_trois_id, setEntitee_trois_id] = useState<
    number | undefined
  >();

  // ✅ Typage explicite des états
  const [allEntiteeUn, setAllEntiteeUn] = useState<EntiteeUn[]>([]);
  const [allEntiteeDeux, setAllEntiteeDeux] = useState<EntiteeDeux[]>([]);
  const [allEntiteeTrois, setAllEntiteeTrois] = useState<EntiteeTrois[]>([]);

  // ✅ Vérifier si les titres existent pour chaque niveau
  const [titreUn, setTitreUn] = useState<string>("Entité Niveau 1");
  const [titreDeux, setTitreDeux] = useState<string>("Entité Niveau 2");
  const [titreTrois, setTitreTrois] = useState<string>("Entité Niveau 3");

  // ✅ Variables pour vérifier l'existence des titres - CORRIGÉES
  const titreUnExiste =
    allEntiteeUn.length > 0 && allEntiteeUn[0]?.titre ? true : false;
  const titreDeuxExiste =
    allEntiteeDeux.length > 0 && allEntiteeDeux[0]?.titre ? true : false;
  const titreTroisExiste =
    allEntiteeTrois.length > 0 && allEntiteeTrois[0]?.titre ? true : false;

  useEffect(() => {
    const fetchInitialData = async () => {
      const srvs = await getAllEntiteeUn();
      const entiteeUnData = Array.isArray(srvs) ? srvs : [];
      setAllEntiteeUn(entiteeUnData);

      // ✅ Mettre à jour les titres si disponibles
      if (entiteeUnData.length > 0 && entiteeUnData[0]?.titre) {
        setTitreUn(entiteeUnData[0].titre);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const loadEditData = async () => {
      if (visible && initial?.id) {
        // 1. Initialiser les IDs
        setEntitee_un_id(initial.entitee_un?.id);
        setEntitee_deux_id(initial.entitee_deux?.id);
        setEntitee_trois_id(initial.entitee_trois?.id);

        // 2. Charger les listes en cascade pour l'affichage
        if (initial.entitee_un?.id) {
          const divs = await getEntiteeDeuxByEntiteeUn(initial.entitee_un.id);
          const entiteeDeuxData = Array.isArray(divs) ? divs : [];
          setAllEntiteeDeux(entiteeDeuxData);

          // ✅ Mettre à jour le titre N2
          if (entiteeDeuxData.length > 0 && entiteeDeuxData[0]?.titre) {
            setTitreDeux(entiteeDeuxData[0].titre);
          }
        }
        if (initial.entitee_deux?.id) {
          const secs = await getEntiteeTroisByEntiteeDeux(
            initial.entitee_deux.id,
          );
          const entiteeTroisData = Array.isArray(secs) ? secs : [];
          setAllEntiteeTrois(entiteeTroisData);

          // ✅ Mettre à jour le titre N3
          if (entiteeTroisData.length > 0 && entiteeTroisData[0]?.titre) {
            setTitreTrois(entiteeTroisData[0].titre);
          }
        }
      } else if (visible) {
        setEntitee_un_id(undefined);
        setEntitee_deux_id(undefined);
        setEntitee_trois_id(undefined);
        setAllEntiteeDeux([]);
        setAllEntiteeTrois([]);
      }
    };
    loadEditData();
  }, [visible, initial]);

  const handleUnChange = async (id: number) => {
    setEntitee_un_id(id);
    setEntitee_deux_id(undefined);
    setEntitee_trois_id(undefined);

    const res = await getEntiteeDeuxByEntiteeUn(id);
    const entiteeDeuxData = Array.isArray(res) ? res : [];
    setAllEntiteeDeux(entiteeDeuxData);

    // ✅ Mettre à jour le titre N2
    if (entiteeDeuxData.length > 0 && entiteeDeuxData[0]?.titre) {
      setTitreDeux(entiteeDeuxData[0].titre);
    } else {
      setTitreDeux("Entité Niveau 2");
    }
  };

  const handleDeuxChange = async (id: number) => {
    setEntitee_deux_id(id);
    setEntitee_trois_id(undefined);

    const res = await getEntiteeTroisByEntiteeDeux(id);
    const entiteeTroisData = Array.isArray(res) ? res : [];
    setAllEntiteeTrois(entiteeTroisData);

    // ✅ Mettre à jour le titre N3
    if (entiteeTroisData.length > 0 && entiteeTroisData[0]?.titre) {
      setTitreTrois(entiteeTroisData[0].titre);
    } else {
      setTitreTrois("Entité Niveau 3");
    }
  };

  const onSave = async () => {
    setLoading(true);
    const cibleId = entitee_trois_id || entitee_deux_id || entitee_un_id;
    await onSubmit({
      entitee_un_id,
      entitee_deux_id,
      entitee_trois_id,
      entitee_cible_id: cibleId,
    });
    setLoading(false);
  };

  return (
    <Dialog
      header={
        <div className="text-xl font-bold flex items-center gap-2">
          <GitMerge className="text-emerald-600" /> {title}
        </div>
      }
      visible={visible}
      style={{ width: 500 }}
      onHide={onHide}
      footer={
        <div className="p-4">
          <Button
            label="Appliquer l'affectation"
            icon={<Save className="mr-2" />}
            onClick={onSave}
            loading={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-200 transition-all font-bold"
          />
        </div>
      }
    >
      <div className="space-y-4 pt-4">
        <div className="p-4 bg-emerald-50 rounded-2xl mb-4 text-emerald-800 text-sm">
          Sélectionnez le niveau de structure auquel ce document appartient.
        </div>

        {/* Niveau 1 - S'affiche toujours mais avec titre dynamique */}
        <div>
          <label className="text-xs font-bold mb-2 block">
            <Building2 size={14} className="inline mr-1 text-emerald-600" />
            {titreUn}
          </label>
          <Dropdown
            value={entitee_un_id}
            options={allEntiteeUn}
            optionLabel="libelle"
            optionValue="id"
            onChange={(e) => handleUnChange(e.value)}
            placeholder={`Choisir ${titreUn}`}
            className="w-full"
            filter
          />
        </div>

        {/* Niveau 2 - S'affiche uniquement si le titre existe */}
        {titreDeuxExiste && (
          <div>
            <label className="text-xs font-bold mb-2 block">
              <Layers size={14} className="inline mr-1 text-blue-600" />
              {titreDeux}
            </label>
            <Dropdown
              value={entitee_deux_id}
              options={allEntiteeDeux}
              optionLabel="libelle"
              optionValue="id"
              onChange={(e) => handleDeuxChange(e.value)}
              placeholder={`Choisir ${titreDeux}`}
              className="w-full"
              disabled={!entitee_un_id}
              filter
            />
          </div>
        )}

        {/* Niveau 3 - S'affiche uniquement si le titre existe */}
        {titreTroisExiste && (
          <div>
            <label className="text-xs font-bold mb-2 block">
              <GitMerge size={14} className="inline mr-1 text-purple-600" />
              {titreTrois} (Optionnel)
            </label>
            <Dropdown
              value={entitee_trois_id}
              options={allEntiteeTrois}
              optionLabel="libelle"
              optionValue="id"
              onChange={(e) => setEntitee_trois_id(e.value)}
              placeholder={`Choisir ${titreTrois}`}
              className="w-full"
              disabled={!entitee_deux_id}
              filter
              showClear
            />
          </div>
        )}

        {/* Message si aucun niveau 2 ou 3 n'existe */}
        {!titreDeuxExiste && !titreTroisExiste && entitee_un_id && (
          <div className="p-4 bg-amber-50 rounded-xl text-amber-700 text-sm">
            Aucun niveau inférieur disponible pour cette entité.
          </div>
        )}
      </div>
    </Dialog>
  );
}
