import { useEffect, useRef, useState } from "react";
import Layout from "../../components/layout/Layoutt";
import HistoriqueDetails from "./HistoriqueDetails";
import type { HistoriqueLog, Droit } from "../../interfaces";
import { getHistoriqueLogs } from "../../api/historiqueLog";
import { Toast } from "primereact/toast";
import Pagination from "../../components/layout/Pagination";
import { InputText } from "primereact/inputtext";
import {
  History,
  Search,
  Eye,
  Calendar,
  UserCheck,
  Layers,
} from "lucide-react";

export default function HistoriquePage() {
  const [logs, setLogs] = useState<HistoriqueLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<HistoriqueLog | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const toast = useRef<Toast>(null);

  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [actionFilter, setActionFilter] = useState<string>("");
  const [resourceFilter, setResourceFilter] = useState<string>("");

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: itemsPerPage,
    pages: 1,
  });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await getHistoriqueLogs({
        page: currentPage,
        limit: itemsPerPage,
      });
      setLogs(response.data);
      setPagination(response.pagination); // ✅ stocker la pagination backend
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Impossible de charger l'historique",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [currentPage]);

  const filteredLogs = logs.filter((log) => {
    if (log.action === "other") return false;

    const agent = log.agent;

    const searchString =
      `${agent?.nom ?? ""} ${agent?.prenom ?? ""} ${log.action} ${log.resource} ${log.createdAt}`.toLowerCase();

    if (!searchString.includes(query.toLowerCase())) return false;

    if (actionFilter && log.action !== actionFilter) return false;

    if (
      resourceFilter &&
      !log.resource.toLowerCase().includes(resourceFilter.toLowerCase())
    )
      return false;

    if (dateFrom) {
      if (new Date(log.createdAt) < new Date(dateFrom)) return false;
    }

    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      if (new Date(log.createdAt) > end) return false;
    }

    return true;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [query, dateFrom, dateTo, actionFilter, resourceFilter]);

  // const paginated = filteredLogs.slice(
  //   (currentPage - 1) * itemsPerPage,
  //   currentPage * itemsPerPage,
  // );

  function getDroitLibelle(droit?: Droit | string): string {
    return typeof droit === "object" ? droit.libelle : "N/A";
  }

  function formatAction(action: string) {
    const map: Record<string, string> = {
      create: "Création",
      update: "Modification",
      delete: "Suppression",
      read: "Consultation",
      login: "Connexion",
      logout: "Déconnexion",
      upload: "Téléversement",
    };

    return map[action] || action;
  }

  function formatResource(resource: string) {
    const map: Record<string, string> = {
      user: "agent",
      liquidations: " liquidation",
      droits: "profil",
      exercices: "exercice",
      programmes: "programme",
      chapitres: " chapitre",
      natures: " nature",
      fonctions: " fonction",
      fournisseur: "fournisseur",
      serviceBeneficiaire: "service bénéficiaire",
      pieces: " pièce",
      piece: " pièce",
      type: "type de dossier",
      services: "service",
      divisions: " division",
      sections: " section",
      statistiques: " statistique",
      auth: "authentification",
      historique: "historique",
      droitPermission: " permission",
      connexion: "connexion",
      deconnexion: "deconnexion",
    };

    return map[resource] || resource;
  }

  function formatMessage(log: HistoriqueLog) {
    const action = formatAction(log.action);
    const resource = formatResource(log.resource);

    return `${action} ${resource}`;
  }

  function actionColor(action: string) {
    switch (action) {
      case "create":
        return "bg-green-50 text-green-700";
      case "update":
        return "bg-blue-50 text-blue-700";
      case "delete":
        return "bg-red-50 text-red-700";
      case "login":
        return "bg-purple-50 text-purple-700";
      default:
        return "bg-slate-50 text-slate-700";
    }
  }

  return (
    <Layout>
      <Toast ref={toast} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-blue-800 p-3 rounded-2xl text-white shadow-lg shadow-blue-100">
            <History size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Journal <span className="text-blue-600">d'audit</span>
            </h1>
            <p className="text-slate-500 font-medium font-sans">
              Suivi en temps réel des actions effectuées sur la plateforme
            </p>
          </div>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <div className="relative group max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
            size={20}
          />
          <InputText
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
            placeholder="Rechercher par agent, action ou ressource..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {/* Filtres */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
          <div className="grid grid-cols-4 md:grid-cols-4 gap-4">
            {/* Date début */}
            <div>
              <label className="text-xs font-bold text-slate-500">Du</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50"
              />
            </div>

            {/* Date fin */}
            <div>
              <label className="text-xs font-bold text-slate-500">Au</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50"
              />
            </div>

            {/* Action */}
            <div>
              <label className="text-xs font-bold text-slate-500">Action</label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50"
              >
                <option value="">Toutes</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="read">Read</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
              </select>
            </div>

            {/* Resource */}
            {/* <div>
              <label className="text-xs font-bold text-slate-500">
                Ressource
              </label>
              <input
                type="text"
                placeholder="agent, liquidation..."
                value={resourceFilter}
                onChange={(e) => setResourceFilter(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50"
              />
            </div> */}
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[11px] font-bold uppercase tracking-widest">
              <th className="px-6 py-4">#</th>
              <th className="px-6 py-4">Profil</th>
              <th className="px-6 py-4">Agent</th>
              <th className="px-6 py-4">Fonction</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Ressource</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-center">Détails</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredLogs.map((log, index) => {
              const agent = log.agent || null;
              const rowNumber = (currentPage - 1) * itemsPerPage + index + 1; // ✅ numérotation continue

              return (
                <tr
                  key={log.id}
                  onClick={() => {
                    setSelectedLog(log);
                    setDetailsVisible(true);
                  }}
                  className="cursor-pointer hover:bg-blue-50/30 transition-all group"
                >
                  <td className="px-6 py-4 text-slate-500 font-bold">
                    {rowNumber}
                  </td>
                  {/* ✅ affichage numéro */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded w-fit font-bold uppercase mt-1">
                        {getDroitLibelle(agent?.droit) || "N/A"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700">
                        {agent ? `${agent.nom} ${agent.prenom}` : "---"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Layers size={14} className="text-slate-400" />
                      {agent?.fonction_details?.libelle || "Non définie"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-lg font-bold text-xs border shadow-sm ${actionColor(log.action)}`}
                    >
                      {formatAction(log.action)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-500 italic">
                      {formatResource(log.resource)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar size={14} />
                      {new Date(log.createdAt).toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={(e) => {
                        setSelectedLog(log);
                        setDetailsVisible(true);
                        e.stopPropagation();
                      }}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {loading && (
          <div className="p-12 flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
            <p className="text-slate-400 font-medium">Analyse du journal...</p>
          </div>
        )}

        {!loading && filteredLogs.length === 0 && (
          <div className="p-12 text-center">
            <History size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-500 font-medium">
              Aucune activité enregistrée
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-center">
        <Pagination
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={pagination.total} // ✅ utiliser le total du backend
          onPageChange={setCurrentPage}
        />
      </div>

      <HistoriqueDetails
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        log={selectedLog}
      />
    </Layout>
  );
}
