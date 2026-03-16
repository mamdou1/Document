import { Calendar, Clock, Edit3, ShieldCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { TabView, TabPanel } from "primereact/tabview";

import { getPermissionsByDroitId } from "../../api/permission";
import { getAgentsByDroit } from "../../api/droit";
import type { Permission, Droit, User } from "../../interfaces";

// ✅ Importer les fonctions pour les titres
import {
  loadEntityTitles,
  getPermissionLabels,
  DEFAULT_TITLES,
  PermissionLabels,
} from "../../utils/permissionLabels";

// Import des sous-composants
import DroitPermissionListe from "./DroitPermissionListe";
import DroitAgentListe from "./DroitAgentListe";

type Props = {
  visible: boolean;
  onHide: () => void;
  droit: Droit | null;
};

export default function DroitDetails({ visible, onHide, droit }: Props) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ État pour les labels dynamiques
  const [permissionLabels, setPermissionLabels] = useState<PermissionLabels>(
    getPermissionLabels(DEFAULT_TITLES),
  );

  // ✅ Charger les titres des entités
  useEffect(() => {
    const loadTitles = async () => {
      try {
        const titles = await loadEntityTitles();
        setPermissionLabels(getPermissionLabels(titles));
      } catch (error) {
        console.error("Erreur chargement titres:", error);
      }
    };
    loadTitles();
  }, []);

  useEffect(() => {
    if (!visible || !droit?.id) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [permissionsData, agentRes] = await Promise.all([
          getPermissionsByDroitId(Number(droit.id)),
          getAgentsByDroit(Number(droit.id)),
        ]);

        setPermissions(permissionsData);
        setAgents(Array.isArray(agentRes) ? agentRes : []);
      } catch (err) {
        console.error("Erreur chargement détails droit", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [visible, droit]);

  if (!droit) return null;

  const formatDate = (date: string | undefined) =>
    date
      ? new Date(date).toLocaleString("fr-FR", {
          dateStyle: "long",
          timeStyle: "short",
        })
      : "-";

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2 text-emerald-900">
          <ShieldCheck size={20} />
          <span>Détails de l'autorisation</span>
        </div>
      }
      visible={visible}
      style={{ width: "750px" }}
      onHide={onHide}
      footer={
        <div className="flex justify-end p-2">
          <Button
            label="Fermer"
            onClick={onHide}
            className="px-6 py-2 bg-slate-100 text-slate-700 border-none rounded-xl font-semibold"
          />
        </div>
      }
    >
      <div className="space-y-6 pt-2">
        {/* Header Libellé */}
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center justify-between">
          <span className="text-emerald-700 font-semibold italic text-sm uppercase">
            Libellé
          </span>
          <span className="text-2xl font-black text-emerald-900">
            {droit.libelle}
          </span>
        </div>

        {/* Navigation par Onglets Stylisée */}
        <TabView
          pt={{
            navContainer: { className: "border-b border-slate-100" },
            nav: { className: "flex gap-2 bg-transparent border-none" },
          }}
        >
          <TabPanel
            header="Permissions"
            leftIcon={<ShieldCheck size={16} className="mr-2" />}
            pt={{
              headerAction: ({ context }: any) => ({
                className: `
                  flex items-center cursor-pointer select-none px-5 py-3 border-b-2 font-bold text-sm transition-all duration-300 rounded-t-xl
                  ${
                    context.active
                      ? "border-emerald-600 text-emerald-600 bg-emerald-50/50"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }
                `,
              }),
            }}
          >
            {/* ✅ Passage de permissionLabels */}
            <DroitPermissionListe
              permissions={permissions}
              createdAt={droit.createdAt}
              permissionLabels={permissionLabels}
            />
          </TabPanel>

          <TabPanel
            header="Agents assignés"
            leftIcon={<Users size={16} className="mr-2" />}
            pt={{
              headerAction: ({ context }: any) => ({
                className: `
                  flex items-center cursor-pointer select-none px-5 py-3 border-b-2 font-bold text-sm transition-all duration-300 rounded-t-xl
                  ${
                    context.active
                      ? "border-emerald-600 text-emerald-600 bg-emerald-50/50"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }
                `,
              }),
            }}
          >
            <DroitAgentListe agents={agents} />
          </TabPanel>
        </TabView>

        {/* Footer Dates */}
        <div className="grid grid-cols-2 gap-4 border-t pt-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">
                Création
              </p>
              <p className="text-sm font-semibold text-slate-800">
                {formatDate(droit.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <Edit3 size={18} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">
                Modification
              </p>
              <p className="text-sm font-semibold text-slate-800">
                {formatDate(droit.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
