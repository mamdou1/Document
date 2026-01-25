import React, { useEffect, useState, useRef } from "react";
import {
  getTotalByProgramme,
  getTotalByChapitre,
  getTotalByNature,
} from "../../api/statistiques.api";
import Layout from "../../components/layout/Layoutt";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Exercice } from "../../interfaces";
import { getExercices } from "../../api/exercice";
import { Toast } from "primereact/toast";
import {
  LayoutDashboard,
  PieChart,
  BarChart3,
  TrendingUp,
  Calendar,
  Plus,
  ArrowUpRight,
} from "lucide-react";

export default function Dashboard() {
  const [programmeStats, setProgrammeStats] = useState([]);
  const [chapitreStats, setChapitreStats] = useState([]);
  const [natureStats, setNatureStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);

  const [exercices, setExercices] = useState<Exercice[]>([]);
  const [selectedExercice, setSelectedExercice] = useState<Exercice | null>(
    null
  );

  const affichage = async () => {
    setLoading(true);
    try {
      const data = await getExercices();
      setExercices(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast?.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: err?.response?.data?.message || "Veuillez saisir un exercice.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    affichage();
  }, []);

  const loadStats = async () => {
    setProgrammeStats(await getTotalByProgramme());
    setChapitreStats(await getTotalByChapitre());
    setNatureStats(await getTotalByNature());
  };

  // Composant Card stylisé
  const StatCard = ({ title, data, icon: Icon, colorClass }: any) => (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className={`p-3 rounded-2xl ${colorClass} bg-opacity-10`}>
            <Icon size={24} className={colorClass.replace("bg-", "text-")} />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Temps réel
          </span>
        </div>

        <h2 className="text-lg font-extrabold text-slate-800 mb-4 tracking-tight">
          {title}
        </h2>

        {data.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-slate-400 text-sm italic">
              Aucune donnée trouvée.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.map((item: any, index: number) => (
              <div
                key={index}
                className="group flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-transparent hover:border-blue-100 hover:bg-blue-50/50 transition-all cursor-default"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-500 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                    {item.libelle}
                  </span>
                  <div className="flex items-center gap-1 mt-1 text-emerald-500">
                    <TrendingUp size={12} />
                    <span className="text-[15px] font-bold">Cumul annuel</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[20px] font-black text-slate-700">
                    {item.totalMontant.toLocaleString()}
                    <small className="ml-1 text-[15px] font-medium text-slate-400">
                      FCFA
                    </small>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-between items-center">
        <span className="text-[10px] font-bold text-slate-400 uppercase italic">
          Détails analytiques
        </span>
        <ArrowUpRight size={14} className="text-slate-300" />
      </div>
    </div>
  );

  return (
    <Layout>
      <Toast ref={toast} />

      {/* HEADER DU DASHBOARD */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard size={20} className="text-blue-600" />
            <span className="text-xs font-bold text-blue-600 uppercase tracking-[0.2em]">
              Reporting System
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">
            Tableau de <span className="text-blue-600">Bord</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Visualisation consolidée des statistiques financières
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 px-3 text-slate-400 border-r border-slate-100">
            <Calendar size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">
              Exercice
            </span>
          </div>
          <Dropdown
            value={selectedExercice}
            options={exercices}
            optionLabel="annee"
            onChange={(e) => setSelectedExercice(e.value)}
            className="border-none w-44 focus:ring-0 text-sm font-bold"
            placeholder="Sélectionner..."
          />
          <button
            className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
            title="Ajouter un exercice"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* GRILLE DE STATISTIQUES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <StatCard
          title="Consommation par Programme"
          data={programmeStats}
          icon={PieChart}
          colorClass="bg-blue-600"
        />
        <StatCard
          title="Répartition par Chapitre"
          data={chapitreStats}
          icon={BarChart3}
          colorClass="bg-indigo-600"
        />
        <StatCard
          title="Ventilation par Nature"
          data={natureStats}
          icon={TrendingUp}
          colorClass="bg-emerald-600"
        />
      </div>

      {/* OPTIONNEL : Graphique ou info supplémentaire en bas */}
      {/*<div className="mt-10 bg-blue-700 rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl shadow-blue-200">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-white">
            <h3 className="text-2xl font-bold">Prêt pour l'export ?</h3>
            <p className="text-blue-100 opacity-80 mt-1 font-medium">
              Générez un rapport PDF détaillé de l'exercice en cours.
            </p>
          </div>
          <Button
            label="Exporter les statistiques"
            icon="pi pi-file-pdf"
            className="bg-white text-blue-700 border-none px-8 py-4 rounded-2xl font-black text-sm hover:bg-blue-50 transition-all"
          />
        </div>*/}
      {/* Cercles de décoration en arrière-plan */}
      {/* <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-20%] left-[10%] w-48 h-48 bg-blue-400/20 rounded-full blur-2xl"></div> 
      </div>*/}
    </Layout>
  );
}
