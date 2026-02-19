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
} from "lucide-react";
import { Button } from "primereact/button";
import Layout from "../../components/layout/Layoutt";
import { Toast } from "primereact/toast";
import EntiteeUnForm from "./EntiteeUn/EntiteeUnForm";
import EntiteeDeuxForm from "./EntiteeDeux/EntiteeDeuxForm";
import EntiteeTroisForm from "./EntiteeTrois/EntiteeTroisForm";
import StructureForm from "./StructureForm";

import {
  getAllEntiteeUn,
  getEntiteeUnTitre,
  updateEntiteeUnTitre,
} from "../../api/entiteeUn";
import {
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
    entitee1: "Direction",
    entitee2: "Division",
    entitee3: "Service",
  });

  // ✅ Charger les titres et les parents au montage
  const initData = async () => {
    try {
      const [t1, t2, t3, un] = await Promise.all([
        getEntiteeUnTitre(),
        getEntiteeDeuxTitre(),
        getEntiteeTroisTitre(),
        getAllEntiteeUn(),
      ]);

      // ✅ IL MANQUAIT CECI : Mettre à jour l'état titles avec les données reçues
      setTitles({
        entitee1: t1.titre || "Direction",
        entitee2: t2.titre || "Division",
        entitee3: t3.titre || "Service",
      });

      // Fermer la modale
      setConfigVisible(false);

      setDataEntiteUn(Array.isArray(un) ? un : []);
    } catch (err) {
      console.error("Erreur initialisation:", err);
      toast.current?.show({
        severity: "error",
        summary: "erruer",
        detail: "Titre non récuperer",
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
      // Optionnel : ajouter une notification de succès ici
      toast.current?.show({
        severity: "success",
        summary: "Ok",
        detail: "Titre ajouter avec succès",
      });
      initData();
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "erruer",
        detail: "Titre non crée",
      });
      console.error("Erreur lors de la sauvegarde des titres:", err);
    }
  };

  const cards = [
    {
      title: titles.entitee1,
      icon: <LayoutGrid className="text-emerald-500" />,
      desc: `Définissez vos ${titles.entitee1}.`,
      action: () => setForm1Visible(true),
    },
    {
      title: titles.entitee2,
      icon: <Layers className="text-emerald-600" />,
      desc: `Structurez les ${titles.entitee2}.`,
      action: () => setForm2Visible(true),
    },
    {
      title: titles.entitee3,
      icon: <Database className="text-emerald-700" />,
      desc: `Gérez les ${titles.entitee3}.`,
      action: () => setForm3Visible(true),
    },
  ];

  const hierarchy = [
    {
      title: titles.entitee1,
      icon: <LayoutGrid size={24} className="text-emerald-500" />,
      desc: `Niveau stratégique : Définissez vos ${titles.entitee1}.`,
      action: () => setForm1Visible(true),
      color: "border-emerald-500",
      bg: "bg-emerald-50",
      level: "Niveau 1",
    },
    {
      title: titles.entitee2,
      icon: <Layers size={24} className="text-blue-500" />,
      desc: `Niveau opérationnel : Structurez les ${titles.entitee2}.`,
      action: () => setForm2Visible(true),
      color: "border-blue-500",
      bg: "bg-blue-50",
      level: "Niveau 2",
    },
    {
      title: titles.entitee3,
      icon: <Database size={24} className="text-purple-500" />,
      desc: `Niveau exécution : Gérez les ${titles.entitee3}.`,
      action: () => setForm3Visible(true),
      color: "border-purple-500",
      bg: "bg-purple-50",
      level: "Niveau 3",
    },
  ];

  return (
    <Layout>
      <Toast ref={toast} />
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        {/* HEADER */}
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
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
                style={{ marginLeft: `${i * 40}px` }} // Indentation progressive
              >
                {/* Icon Circle */}
                <div className={`shrink-0 p-5 ${item.bg} rounded-2xl text-xl`}>
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

                {/* Action Button */}
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

              {/* Indicateur visuel de hiérarchie (Flèche descendante) */}
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
        <StructureForm
          visible={configVisible}
          onHide={() => setConfigVisible(false)}
          titles={titles}
          setTitles={setTitles}
          onSave={saveTitles}
        />

        {/* FORMULAIRES D'ENTITÉS */}
        {/* FORMULAIRE NIVEAU 1 */}
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
      </div>
    </Layout>
  );
}
