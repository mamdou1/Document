import { Calendar, Clock, Edit3, ShieldCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { TabView, TabPanel } from "primereact/tabview";

import { getDroitPermission } from "../../api/permission";
import { getAgentsByDroit } from "../../api/droit";
import type { Permission, Droit, User } from "../../interfaces";

// Import des nouveaux sous-composants
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

  useEffect(() => {
    if (!visible || !droit?.id) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [permRes, agentRes] = await Promise.all([
          getDroitPermission(Number(droit.id)),
          getAgentsByDroit(Number(droit.id)),
        ]);
        setPermissions(permRes.data);
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
        <div className="flex items-center gap-2 text-blue-900">
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
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center justify-between">
          <span className="text-blue-700 font-semibold italic text-sm uppercase">
            Libellé
          </span>
          <span className="text-2xl font-black text-blue-900">
            {droit.libelle}
          </span>
        </div>

        {/* Navigation par Onglets */}
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
                      ? "border-blue-600 text-blue-600 bg-blue-50/50"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }
                `,
              }),
            }}
          >
            <DroitPermissionListe
              permissions={permissions}
              createdAt={droit.createdAt}
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
                      ? "border-blue-600 text-blue-600 bg-blue-50/50"
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
