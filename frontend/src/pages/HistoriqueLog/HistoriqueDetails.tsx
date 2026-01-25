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
} from "lucide-react";
import type { HistoriqueLog, Droit } from "../../interfaces";

// --- Helpers de formatage ---
const formatAction = (action: string) => {
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
};

const formatResource = (resource: string) => {
  const map: Record<string, string> = {
    user: "d'un agent",
    liquidations: "d'une liquidation",
    droits: "d'un profil",
    exercices: "d'un exercice",
    programmes: "d'un programme",
    chapitres: "d'un chapitre",
    natures: "d'une nature",
    fonctions: "d'une fonction",
    fournisseur: "d'un fournisseur",
    serviceBeneficiaire: "d'un service bénéficiaire",
    pieces: "d'une pièce",
    type: "d'un type de dossier",
    services: "d'un service",
    auth: "d'une authentification",
    connexion: "connexion",
    deconnexion: "deconnexion",
  };
  return map[resource] || resource;
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
    default:
      return "bg-blue-500/20 text-blue-200 border-blue-500/30";
  }
};

interface Props {
  visible: boolean;
  onHide: () => void;
  log: HistoriqueLog | null;
}

export default function HistoriqueDetails({ visible, onHide, log }: Props) {
  if (!log) return null;

  const agent = log.agent || null;
  const actionFr = formatAction(log.action);
  const resourceFr = formatResource(log.resource);

  const InfoCard = ({ icon: Icon, label, value, colorClass }: any) => (
    <div className="flex items-start gap-4 p-4 rounded-2xl bg-blue-50/50 border border-blue-100 transition-all hover:bg-white hover:shadow-md group">
      <div
        className={`p-2 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform ${colorClass}`}
      >
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter mb-0.5">
          {label}
        </p>
        <p className="text-blue-900 font-bold text-sm leading-tight break-words">
          {value || "---"}
        </p>
      </div>
    </div>
  );

  return (
    <Dialog
      header={
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <Activity size={20} />
          </div>
          <div>
            <h3 className="text-blue-900 font-bold leading-none">
              Journal d'Audit
            </h3>
            <p className="text-[11px] text-blue-400 font-medium mt-1 uppercase tracking-widest italic">
              Analyse de l'activité
            </p>
          </div>
        </div>
      }
      visible={visible}
      style={{ width: "95vw", maxWidth: "600px" }}
      onHide={onHide}
      draggable={false}
      blockScroll
      footer={
        <div className="flex justify-end p-2">
          <Button
            label="Fermer"
            onClick={onHide}
            className="bg-blue-600 text-white font-bold px-8 py-2.5 rounded-xl hover:bg-blue-700 border-none transition-all text-sm shadow-lg shadow-blue-200"
          />
        </div>
      }
    >
      <div className="space-y-4 pt-2 font-sans">
        {/* Banner : Bleu Royal */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 rounded-3xl text-white shadow-xl shadow-blue-200">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded border backdrop-blur-md ${getMethodStyle(log.method)}`}
              >
                {log.method}
              </span>
              <span className="text-blue-100/60 text-xs font-medium tracking-wider">
                LOG ID: #{log.id}
              </span>
            </div>

            <h2 className="text-2xl font-black leading-tight mb-2 drop-shadow-sm">
              {actionFr} <span className="text-cyan-300">{resourceFr}</span>
            </h2>

            <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center font-black text-sm">
                  {agent?.nom?.charAt(0)}
                  {agent?.prenom?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold leading-none text-white">
                    {agent
                      ? `${agent.nom} ${agent.prenom}`
                      : "Système Automatique"}
                  </p>
                  <p className="text-[10px] text-cyan-200 mt-1 uppercase font-bold tracking-widest">
                    {typeof agent?.droit === "object"
                      ? agent.droit.libelle
                      : "Utilisateur"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Décoration en fond */}
          <Activity className="absolute -right-6 -bottom-6 text-white/10 w-40 h-40" />
        </div>

        {/* Informations de base */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoCard
            icon={Calendar}
            label="Date et Heure"
            value={new Date(log.createdAt).toLocaleString("fr-FR")}
            colorClass="text-blue-600"
          />
          <InfoCard
            icon={Database}
            label="Source de donnée"
            value={log.resource}
            colorClass="text-indigo-600"
          />
        </div>

        {/* Bloc JSON en Bleu Marine */}
        {log.data && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-blue-400" />
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                  Données transmises
                </span>
              </div>
              {/* <span className="text-[9px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase">
                Raw JSON
              </span> */}
            </div>

            <div className="relative rounded-3xl bg-blue-950 p-1.5 shadow-inner border border-blue-200/20">
              <div className="bg-[#0a192f] rounded-2xl p-5 max-h-[250px] overflow-y-auto custom-scrollbar border border-white/5">
                <pre className="text-[11px] font-mono text-cyan-400/90 leading-relaxed">
                  {JSON.stringify(log.data, null, 2)}
                </pre>
              </div>
              <FileJson className="absolute right-6 bottom-6 text-white/5 w-12 h-12" />
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
