import React, { useState, useEffect, useRef } from "react";
import {
  Settings2,
  PlusCircle,
  ArrowRight,
  LayoutGrid,
  Database,
  Layers,
  Pyramid,
  ChevronDown,
  Building2,
  Grid3x3,
} from "lucide-react";
import { Button } from "primereact/button";
import Layout from "../../components/layout/Layoutt";
import { Toast } from "primereact/toast";
import EntiteeUnForm from "./EntiteeUn/EntiteeUnForm";
import EntiteeDeuxForm from "./EntiteeDeux/EntiteeDeuxForm";
import EntiteeTroisForm from "./EntiteeTrois/EntiteeTroisForm";
import FormTitreUn from "./FormTitreUn";
import FormTitreDeux from "./FormTitreDeux";
import FormTitreTrois from "./FormTitreTrois";
import StructureForm from "./StructureForm";

import {
  getAllEntiteeUn,
  getEntiteeUnTitre,
  updateEntiteeUnTitre,
} from "../../api/entiteeUn";
import {
  getAllEntiteeDeux,
  getEntiteeDeuxTitre,
  updateEntiteeDeuxTitre,
} from "../../api/entiteeDeux";
import {
  getEntiteeTroisTitre,
  updateEntiteeTroisTitre,
} from "../../api/entiteeTrois";

export default function ConfigurationStructure() {
  const [configVisible, setConfigVisible] = useState(false);
  const [form1Visible, setForm1Visible] = useState(false);
  const [form2Visible, setForm2Visible] = useState(false);
  const [form3Visible, setForm3Visible] = useState(false);

  const [dataEntiteUn, setDataEntiteUn] = useState<any[]>([]);
  const [dataEntiteDeux, setDataEntiteDeux] = useState<any[]>([]);

  const toast = useRef<Toast>(null);

  const [titles, setTitles] = useState({
    entitee1: "", // Vide au lieu de "Direction"
    entitee2: "", // Vide au lieu de "Division"
    entitee3: "", // Vide au lieu de "Service"
  });

  // Dans initData
  const initData = async () => {
    try {
      const [t1, t2, t3, un, deux] = await Promise.all([
        getEntiteeUnTitre(),
        getEntiteeDeuxTitre(),
        getEntiteeTroisTitre(),
        getAllEntiteeUn(),
        getAllEntiteeDeux(),
      ]);

      // ✅ Plus de fallback - on garde la valeur de l'API (qui peut être vide)
      setTitles({
        entitee1: t1.titre || "",
        entitee2: t2.titre || "",
        entitee3: t3.titre || "",
      });

      setDataEntiteUn(Array.isArray(un) ? un : []);
      setDataEntiteDeux(Array.isArray(deux) ? deux : []);
      setConfigVisible(false);
    } catch (err) {
      console.error("Erreur initialisation:", err);
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Impossible de charger les données",
      });
    }
  };

  useEffect(() => {
    initData();
  }, []);

  // ✅ Sauvegarde des titres vers l'API
  const saveTitles = async () => {
    try {
      await Promise.all([
        updateEntiteeUnTitre(titles.entitee1),
        updateEntiteeDeuxTitre(titles.entitee2),
        updateEntiteeTroisTitre(titles.entitee3),
      ]);

      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Titres mis à jour avec succès",
      });

      await initData();
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Impossible de sauvegarder les titres",
      });
      console.error("Erreur lors de la sauvegarde des titres:", err);
    }
  };

  // NOUVEAU: Gestionnaires pour ouvrir les formulaires
  const handleOpenForm1 = () => setForm1Visible(true);
  const handleOpenForm2 = () => setForm2Visible(true);
  const handleOpenForm3 = () => setForm3Visible(true);

  const hierarchy = [
    {
      title: titles.entitee1,
      icon: <LayoutGrid size={24} className="text-emerald-500" />,
      desc: `Niveau stratégique : Définissez vos ${titles.entitee1}.`,
      action: handleOpenForm1,
      color: "border-emerald-500",
      bg: "bg-emerald-50",
      level: "Niveau 1",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-700",
    },
    {
      title: titles.entitee2,
      icon: <Layers size={24} className="text-blue-500" />,
      desc: `Niveau opérationnel : Structurez les ${titles.entitee2}.`,
      action: handleOpenForm2,
      color: "border-blue-500",
      bg: "bg-blue-50",
      level: "Niveau 2",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-700",
    },
    {
      title: titles.entitee3,
      icon: <Database size={24} className="text-purple-500" />,
      desc: `Niveau exécution : Gérez les ${titles.entitee3}.`,
      action: handleOpenForm3,
      color: "border-purple-500",
      bg: "bg-purple-50",
      level: "Niveau 3",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-700",
    },
  ];

  // NOUVEAU: Section avec les 3 boutons
  const renderActionButtons = () => (
    <div className="max-w-4xl mx-auto mb-12">
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
        <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
          <PlusCircle size={20} className="text-emerald-600" />
          Actions rapides
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Bouton Niveau 1 */}
          <button
            onClick={handleOpenForm1}
            className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-white p-6 rounded-2xl border-2 border-emerald-200 hover:border-emerald-500 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-100/50"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500" />

            <div className="relative z-10">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Building2 size={24} className="text-emerald-700" />
              </div>
              <h3 className="font-black text-emerald-900 text-lg mb-1">
                {titles.entitee1}
              </h3>
              <p className="text-[11px] font-medium text-emerald-600 uppercase tracking-wider mb-4">
                Niveau 1
              </p>
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm group-hover:gap-3 transition-all">
                <span>Créer</span>
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </div>
            </div>
          </button>

          {/* Bouton Niveau 2 */}
          <button
            onClick={handleOpenForm2}
            className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border-2 border-blue-200 hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-100/50"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500" />

            <div className="relative z-10">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Layers size={24} className="text-blue-700" />
              </div>
              <h3 className="font-black text-blue-900 text-lg mb-1">
                {titles.entitee2}
              </h3>
              <p className="text-[11px] font-medium text-blue-600 uppercase tracking-wider mb-4">
                Niveau 2
              </p>
              <div className="flex items-center gap-2 text-blue-700 font-bold text-sm group-hover:gap-3 transition-all">
                <span>Créer</span>
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </div>
            </div>
          </button>

          {/* Bouton Niveau 3 */}
          <button
            onClick={handleOpenForm3}
            className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl border-2 border-purple-200 hover:border-purple-500 transition-all duration-300 hover:shadow-lg hover:shadow-purple-100/50"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500" />

            <div className="relative z-10">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Grid3x3 size={24} className="text-purple-700" />
              </div>
              <h3 className="font-black text-purple-900 text-lg mb-1">
                {titles.entitee3}
              </h3>
              <p className="text-[11px] font-medium text-purple-600 uppercase tracking-wider mb-4">
                Niveau 3
              </p>
              <div className="flex items-center gap-2 text-purple-700 font-bold text-sm group-hover:gap-3 transition-all">
                <span>Créer</span>
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <Toast ref={toast} />
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        {/* HEADER */}
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-emerald-900 text-white rounded-3xl shadow-xl">
              <Pyramid size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                Structure
              </h1>
              <p className="text-slate-500 font-medium text-sm">
                Hiérarchie administrative
              </p>
            </div>
          </div>

          <Button
            onClick={() => setConfigVisible(true)}
            className="p-button-outlined p-button-success border-2 font-bold rounded-2xl px-6 py-3"
          >
            <Settings2 size={20} className="mr-2" />
            Personnaliser les titres
          </Button>
        </div>

        {/* NOUVEAU: Section des 3 boutons */}
        {renderActionButtons()}

        {/* HIERARCHY VIEW */}
        <div className="max-w-4xl mx-auto space-y-4">
          {hierarchy.map((item, i) => (
            <div key={i} className="relative">
              {/* Ligne de connexion verticale entre les cartes */}
              {i !== hierarchy.length - 1 && (
                <div
                  className="absolute left-10 top-20 bottom-0 w-1 bg-gradient-to-b from-slate-200 to-transparent z-0 ml-[-2px]"
                  style={{ height: "60px", top: "80px", left: "44px" }}
                />
              )}

              <div
                className={`relative z-10 bg-white rounded-[2rem] p-6 border-l-8 ${item.color} shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row items-center gap-6`}
                style={{ marginLeft: `${i * 40}px` }}
              >
                {/* Icon Circle */}
                <div className={`shrink-0 p-5 ${item.bg} rounded-2xl`}>
                  {item.icon}
                </div>

                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {item.level}
                  </span>
                  <h3 className="text-xl font-black text-slate-800 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-slate-500 text-sm italic">{item.desc}</p>
                </div>

                {/* Action Button dans la hiérarchie */}
                <button
                  onClick={item.action}
                  className="shrink-0 flex items-center gap-3 px-6 py-4 bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl transition-colors font-bold group"
                >
                  <PlusCircle size={20} />
                  <span>Nouveau {item.title}</span>
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </div>

              {/* Indicateur visuel de hiérarchie */}
              {i !== hierarchy.length - 1 && (
                <div
                  className="flex justify-start items-center"
                  style={{ marginLeft: `${i * 40 + 32}px`, height: "40px" }}
                >
                  <ChevronDown className="text-slate-300" size={24} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* MODALE DE CONFIGURATION DES TITRES */}
        {/* <StructureForm
          visible={configVisible}
          onHide={() => setConfigVisible(false)}
          titles={titles}
          setTitles={setTitles}
          onSave={saveTitles}
        /> */}

        {/* FORMULAIRES D'ENTITÉS */}
        <EntiteeUnForm
          visible={form1Visible}
          onHide={() => setForm1Visible(false)}
          onSubmit={async (d) => setForm1Visible(false)}
          refresh={initData}
          title={`Créer ${titles.entitee1}`}
        />

        {/* FORMULAIRE NIVEAU 2 (Corrigé) */}
        <EntiteeDeuxForm
          visible={form2Visible} // Utilise form2Visible
          onHide={() => setForm2Visible(false)}
          onSubmit={async (d) => setForm2Visible(false)}
          refresh={initData}
          title={`Nouveau ${titles.entitee2}`}
          entiteeUn={dataEntiteUn} // On passe la liste des parents niveau 1
        />

        {/* FORMULAIRE NIVEAU 3 (Corrigé) */}
        <EntiteeTroisForm
          visible={form3Visible} // Utilise form3Visible
          onHide={() => setForm3Visible(false)}
          onSubmit={async (d) => setForm3Visible(false)}
          refresh={initData}
          title={`Nouveau ${titles.entitee3}`}
          entiteeDeux={dataEntiteDeux} // Décommente si tu as chargé dataEntiteDeux
        />

        {/* FORMULAIRES D'ENTITÉS - AVEC LES TITRES PASSÉS EN PROPS */}
        <FormTitreUn
          visible={form1Visible}
          onHide={() => setForm1Visible(false)}
          onSubmit={async () => {
            setForm1Visible(false);
            await initData();
          }}
          refresh={initData}
          title={`Créer ${titles.entitee1}`}
          // ✅ AJOUTER CES LIGNES
          currentTitre={titles.entitee1}
          onTitreUpdate={(newTitre) => {
            setTitles((prev) => ({ ...prev, entitee1: newTitre }));
          }}
        />

        <FormTitreDeux
          visible={form2Visible}
          onHide={() => setForm2Visible(false)}
          onSubmit={async () => {
            setForm2Visible(false);
            await initData();
          }}
          refresh={initData}
          title={`Nouveau ${titles.entitee2}`}
          entiteeUn={dataEntiteUn}
          // ✅ AJOUTER CES LIGNES
          currentTitre={titles.entitee2}
          onTitreUpdate={(newTitre) => {
            setTitles((prev) => ({ ...prev, entitee2: newTitre }));
          }}
          titles={titles} // Pour utiliser entitee1 dans le label
        />

        <FormTitreTrois
          visible={form3Visible}
          onHide={() => setForm3Visible(false)}
          onSubmit={async () => {
            setForm3Visible(false);
            await initData();
          }}
          refresh={initData}
          title={`Nouveau ${titles.entitee3}`}
          entiteeDeux={dataEntiteDeux}
          // ✅ AJOUTER CES LIGNES
          currentTitre={titles.entitee3}
          onTitreUpdate={(newTitre) => {
            setTitles((prev) => ({ ...prev, entitee3: newTitre }));
          }}
          titles={titles} // Pour utiliser entitee2 dans le label
        />
      </div>
    </Layout>
  );
}
