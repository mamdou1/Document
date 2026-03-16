import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import {
  Activity,
  Database,
  Calendar,
  Tag,
  FileJson,
  Terminal,
  User,
  GitCompare,
  Trash2,
  PlusCircle,
  Edit3,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import type { HistoriqueLog } from "../../interfaces";
import { useState } from "react";

// --- Helpers de formatage ---
const formatAction = (action: string) => {
  const map: Record<string, string> = {
    create: "Création",
    update: "Modification",
    delete: "Suppression",
    read: "Consultation",
    access: "Accès",
    login: "Connexion",
    logout: "Déconnexion",
    upload: "Téléversement",
  };
  return map[action] || action;
};

const formatResource = (resource: string) => {
  const map: Record<string, string> = {
    user: "Agent",
    droits: "Profil",
    exercices: "Exercice",
    fonctions: "Fonction",
    pieces: "Pièce",
    document: "Document",
    documentType: "Type de document",
    entiteeUn: "Entité niveau 1",
    entiteeDeux: "Entité niveau 2",
    entiteeTrois: "Entité niveau 3",
    salle: "Salle",
    rayon: "Rayon",
    trave: "Travée",
    box: "Box",
    site: "Site",
    auth: "Authentification",
  };
  return map[resource] || resource;
};

const getActionColor = (action: string) => {
  switch (action) {
    case "create":
      return {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: PlusCircle,
        border: "border-green-200",
      };
    case "update":
      return {
        bg: "bg-blue-100",
        text: "text-blue-700",
        icon: Edit3,
        border: "border-blue-200",
      };
    case "delete":
      return {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: Trash2,
        border: "border-red-200",
      };
    case "read":
      return {
        bg: "bg-purple-100",
        text: "text-purple-700",
        icon: Activity,
        border: "border-purple-200",
      };
    case "access":
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        icon: User,
        border: "border-yellow-200",
      };
    default:
      return {
        bg: "bg-slate-100",
        text: "text-slate-700",
        icon: AlertCircle,
        border: "border-slate-200",
      };
  }
};

const getMethodStyle = (method: string) => {
  switch (method?.toUpperCase()) {
    case "POST":
      return "bg-emerald-500/20 text-emerald-200 border-emerald-500/30";
    case "PUT":
    case "PATCH":
      return "bg-amber-500/20 text-amber-200 border-amber-500/30";
    case "DELETE":
      return "bg-red-500/20 text-red-200 border-red-500/30";
    case "access":
      return "bg-yellow-500/20 text-yellow-200 border-yellow-500/30";
    default:
      return "bg-emerald-500/20 text-emerald-200 border-emerald-500/30";
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleString("fr-FR", {
    dateStyle: "long",
    timeStyle: "medium",
  });
};

interface Props {
  visible: boolean;
  onHide: () => void;
  log: HistoriqueLog | null;
}

export default function HistoriqueDetails({ visible, onHide, log }: Props) {
  const [showRawJson, setShowRawJson] = useState(false);

  if (!log) return null;

  const agent = log.agent || null;
  const actionFr = formatAction(log.action);
  const resourceFr = formatResource(log.resource);
  const actionStyle = getActionColor(log.action);
  const ActionIcon = actionStyle.icon;

  const renderChanges = () => {
    if (log.action === "update" && log.old_data && log.new_data) {
      const changes = [];
      const excludedFields = [
        "id",
        "createdAt",
        "updatedAt",
        "created_at",
        "updated_at",
      ];

      for (const key in log.new_data) {
        if (excludedFields.includes(key)) continue;

        const oldVal = log.old_data[key];
        const newVal = log.new_data[key];

        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
          changes.push(
            <div
              key={key}
              className="bg-slate-50 p-4 rounded-xl border border-slate-200"
            >
              <div className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">
                {key}
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-1 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
                  <div className="text-[10px] font-bold mb-1">AVANT</div>
                  <div className="text-sm font-mono break-words">
                    {oldVal !== null && oldVal !== undefined
                      ? String(oldVal)
                      : "vide"}
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <GitCompare
                    size={20}
                    className="text-slate-400 rotate-90 md:rotate-0"
                  />
                </div>
                <div className="flex-1 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200">
                  <div className="text-[10px] font-bold mb-1">APRÈS</div>
                  <div className="text-sm font-mono break-words">
                    {newVal !== null && newVal !== undefined
                      ? String(newVal)
                      : "vide"}
                  </div>
                </div>
              </div>
            </div>,
          );
        }
      }

      return changes.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <GitCompare size={14} className="text-blue-500" />
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
              Modifications détectées ({changes.length})
            </span>
          </div>
          {changes}
        </div>
      ) : (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
          <CheckCircle size={24} className="mx-auto text-slate-400 mb-2" />
          <p className="text-sm text-slate-500 italic">
            Aucun changement détecté
          </p>
        </div>
      );
    }

    if (log.action === "delete" && log.deleted_data) {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Trash2 size={14} className="text-red-500" />
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
              Élément supprimé
            </span>
          </div>
          <div className="bg-red-50 p-4 rounded-xl border border-red-200">
            <pre className="text-xs text-red-700 whitespace-pre-wrap font-mono">
              {JSON.stringify(log.deleted_data, null, 2)}
            </pre>
          </div>
        </div>
      );
    }

    if (log.action === "create" && log.new_data) {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <PlusCircle size={14} className="text-green-500" />
            <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">
              Élément créé
            </span>
          </div>
          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
            <pre className="text-xs text-green-700 whitespace-pre-wrap font-mono">
              {JSON.stringify(log.new_data, null, 2)}
            </pre>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog
      header={
        <div className="flex items-center gap-3">
          <div
            className={`p-2 ${actionStyle.bg} rounded-lg ${actionStyle.text}`}
          >
            <ActionIcon size={20} />
          </div>
          <div>
            <h3 className="text-slate-900 font-bold leading-none">
              Journal d'Audit
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-1 uppercase tracking-widest">
              {actionFr} • {resourceFr}
            </p>
          </div>
        </div>
      }
      visible={visible}
      style={{ width: "95vw", maxWidth: "700px" }}
      onHide={onHide}
      draggable={false}
      blockScroll
      footer={
        <div className="flex justify-end gap-2 p-2">
          <Button
            label="Fermer"
            onClick={onHide}
            className="bg-slate-100 text-slate-600 font-bold px-8 py-2.5 rounded-xl hover:bg-slate-200 border-none transition-all text-sm"
          />
        </div>
      }
    >
      <div className="space-y-4 pt-2 font-sans max-h-[70vh] overflow-y-auto pr-1">
        {/* Banner principal */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-6 rounded-3xl text-white shadow-xl">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded border backdrop-blur-md ${getMethodStyle(log.method)}`}
                >
                  {log.method}
                </span>
                <span className="text-slate-400 text-xs font-medium tracking-wider">
                  ID: #{log.id}
                </span>
              </div>
              {log.status < 400 ? (
                <span className="text-[10px] bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full border border-green-500/30">
                  Succès
                </span>
              ) : (
                <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full border border-red-500/30">
                  Erreur {log.status}
                </span>
              )}
            </div>

            <h2 className="text-2xl font-black leading-tight mb-4 drop-shadow-sm">
              {log.description || `${actionFr} de ${resourceFr}`}
            </h2>

            {log.resource_identifier && (
              <div className="mb-4 p-3 bg-white/10 rounded-xl border border-white/20">
                <p className="text-xs text-slate-300 mb-1">Élément concerné</p>
                <p className="text-sm font-bold text-white">
                  {log.resource_identifier}
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center font-black text-sm">
                  {agent?.nom?.charAt(0)}
                  {agent?.prenom?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold leading-none text-white">
                    {agent
                      ? `${agent.prenom} ${agent.nom}`
                      : "Système Automatique"}
                  </p>
                  <p className="text-[10px] text-slate-300 mt-1 uppercase font-bold tracking-widest">
                    {typeof agent?.droit === "object"
                      ? agent.droit.libelle
                      : agent?.droit || "Utilisateur"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <Activity className="absolute -right-6 -bottom-6 text-white/10 w-40 h-40" />
        </div>

        {/* Informations de base - Sans InfoCard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Date et Heure */}
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
            <div className="p-2 bg-white rounded-xl shadow-sm text-emerald-600">
              <Calendar size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter mb-0.5">
                Date et Heure
              </p>
              <p className="text-emerald-900 font-bold text-sm leading-tight break-words">
                {formatDate(log.createdAt)}
              </p>
            </div>
          </div>

          {/* Ressource */}
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
            <div className="p-2 bg-white rounded-xl shadow-sm text-emerald-600">
              <Database size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter mb-0.5">
                Ressource
              </p>
              <p className="text-emerald-900 font-bold text-sm leading-tight break-words">
                {`${log.resource}${log.resource_id ? ` #${log.resource_id}` : ""}`}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Action */}
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
            <div className="p-2 bg-white rounded-xl shadow-sm text-blue-600">
              <Activity size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter mb-0.5">
                Action
              </p>
              <p className="text-emerald-900 font-bold text-sm leading-tight break-words">
                {actionFr}
              </p>
            </div>
          </div>

          {/* Méthode HTTP */}
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
            <div className="p-2 bg-white rounded-xl shadow-sm text-purple-600">
              <Tag size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter mb-0.5">
                Méthode HTTP
              </p>
              <p className="text-emerald-900 font-bold text-sm leading-tight break-words">
                {log.method}
              </p>
            </div>
          </div>
        </div>

        {/* Données JSON brutes (optionnel) */}
        {log.data && (
          <div className="space-y-2">
            <button
              onClick={() => setShowRawJson(!showRawJson)}
              className="flex items-center gap-2 px-1 py-2 w-full"
            >
              <FileJson size={14} className="text-slate-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {showRawJson ? "Masquer" : "Afficher"} les données brutes
              </span>
            </button>

            {showRawJson && (
              <div className="relative rounded-3xl bg-slate-950 p-1.5 shadow-inner border border-slate-800">
                <div className="bg-[#0a192f] rounded-2xl p-5 max-h-[250px] overflow-y-auto custom-scrollbar border border-white/5">
                  <pre className="text-[11px] font-mono text-cyan-400/90 leading-relaxed">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Dialog>
  );
}
