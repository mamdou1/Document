import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { ShieldCheck, Save, X, Key, Lock, Info } from "lucide-react";
import {
  getAllPermissions,
  getDroitPermission,
  updateDroitPermissions,
} from "../../api/permission";
import { Permission } from "../../interfaces/index";

type Props = {
  visible: boolean;
  agentId: number | null;
  onHide: () => void;
};

const actions = ["create", "read", "update", "delete"];

// Helper pour traduire ou styliser les icônes par action
const actionIcons: Record<string, any> = {
  create: { label: "Créer", color: "text-green-600" },
  read: { label: "Lire", color: "text-blue-600" },
  update: { label: "Modifier", color: "text-amber-600" },
  delete: { label: "Supprimer", color: "text-red-600" },
};

export default function UserPermission({ visible, agentId, onHide }: Props) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [checked, setChecked] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible || !agentId) return;

    const load = async () => {
      try {
        const [all, agentPerms] = await Promise.all([
          getAllPermissions(),
          getDroitPermission(agentId),
        ]);
        setPermissions(all.data);
        setChecked(agentPerms.data.map((p: any) => p.id));
      } catch (error) {
        console.error("Erreur lors du chargement des permissions", error);
      }
    };

    load();
  }, [visible, agentId]);

  const toggle = (permissionId: number) => {
    setChecked((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId],
    );
  };

  const save = async () => {
    if (!agentId) return;
    setLoading(true);
    try {
      await updateDroitPermissions(agentId, checked);
      //onHide();
    } finally {
      setLoading(false);
    }
  };

  const grouped = permissions.reduce((acc: any, p) => {
    acc[p.resource] = acc[p.resource] || {};
    acc[p.resource][p.action] = p.id;
    return acc;
  }, {});

  return (
    <Dialog
      header={
        <div className="flex items-center gap-3 text-blue-900 font-bold">
          <div className="bg-blue-100 p-2 rounded-lg">
            <ShieldCheck size={22} className="text-blue-600" />
          </div>
          <span>Gestion des accès & permissions</span>
        </div>
      }
      visible={visible}
      style={{ width: "850px" }}
      onHide={onHide}
      draggable={false}
      className="custom-dialog"
    >
      <div className="pt-2">
        {/* En-tête informatif */}
        <div className="mb-6 flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 text-sm">
          <Info size={16} />
          <span>
            Cochez les cases pour définir les droits d'accès aux différentes
            ressources du système.
          </span>
        </div>

        <div className="overflow-hidden border border-slate-200 rounded-2xl">
          <table className="w-full border-collapse bg-white text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-sm font-bold text-slate-600 uppercase tracking-wider">
                  Ressource Système
                </th>
                {actions.map((a) => (
                  <th
                    key={a}
                    className="p-4 text-center text-sm font-bold text-slate-600 uppercase tracking-wider"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className={actionIcons[a].color}>
                        {actionIcons[a].label}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.keys(grouped).map((resource) => (
                <tr
                  key={resource}
                  className="hover:bg-blue-50/30 transition-colors group"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                        <Lock size={16} />
                      </div>
                      <span className="font-bold text-slate-700 capitalize">
                        {resource}
                      </span>
                    </div>
                  </td>
                  {actions.map((action) => {
                    const id = grouped[resource][action];
                    return (
                      <td key={action} className="p-4 text-center">
                        {id ? (
                          <div className="flex justify-center">
                            <Checkbox
                              checked={checked.includes(id)}
                              onChange={() => toggle(id)}
                              className="w-6 h-6 border-2 border-blue-200 rounded transition-all focus:ring-blue-500"
                            />
                          </div>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
          <Button
            label="Annuler"
            icon={<X size={18} className="mr-2" />}
            onClick={onHide}
            className="p-button-text text-slate-500 hover:text-slate-800 font-semibold py-2 px-6 rounded-xl transition-colors"
          />
          <Button
            label={loading ? "Enregistrement..." : "Enregistrer les droits"}
            icon={!loading && <Save size={18} className="mr-2" />}
            disabled={loading}
            onClick={save}
            className="bg-blue-600 text-white font-bold py-2.5 px-8 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
          />
        </div>
      </div>
    </Dialog>
  );
}
