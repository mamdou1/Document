import { useEffect, useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import {
  ShieldCheck,
  Save,
  X,
  Lock,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  List,
  CheckSquare,
} from "lucide-react";

import {
  getAllPermissions,
  getDroitPermission,
  updateDroitPermissions,
} from "../../api/permission";

import {
  groupPermissionsByResource,
  actionBadgeColor,
  UIPermission,
  UIPermissionGroup,
} from "../../utils/permissionHelpers";

import { Toast } from "primereact/toast";

type Props = {
  visible: boolean;
  droitId: number | null;
  onHide: () => void;
};

export default function DroitPermissionForm({
  visible,
  droitId,
  onHide,
}: Props) {
  const [allPermissionsGrouped, setAllPermissionsGrouped] = useState<
    UIPermissionGroup[]
  >([]);
  const [assignedIds, setAssignedIds] = useState<number[]>([]);
  const [selectedAvailable, setSelectedAvailable] = useState<number[]>([]);
  const [selectedAssigned, setSelectedAssigned] = useState<number[]>([]);

  const [loading, setLoading] = useState(false);
  const [expandedResources, setExpandedResources] = useState<
    Record<string, boolean>
  >({});
  const toast = useRef<Toast>(null);

  useEffect(() => {
    if (!visible || !droitId) return;

    const load = async () => {
      try {
        const [all, agentPerms] = await Promise.all([
          getAllPermissions(),
          getDroitPermission(droitId),
        ]);

        const grouped = groupPermissionsByResource(all.data);
        setAllPermissionsGrouped(grouped);
        setAssignedIds(agentPerms.data.map((p: any) => p.id));

        // Reset selections
        setSelectedAvailable([]);
        setSelectedAssigned([]);
      } catch (error) {
        console.error("Erreur lors du chargement des permissions", error);
      }
    };

    load();
  }, [visible, droitId]);

  const toggleResource = (resource: string) => {
    setExpandedResources((prev) => ({ ...prev, [resource]: !prev[resource] }));
  };

  // Logique de transfert
  const moveRight = () => {
    setAssignedIds((prev) => [...prev, ...selectedAvailable]);
    setSelectedAvailable([]);
  };

  const moveLeft = () => {
    setAssignedIds((prev) =>
      prev.filter((id) => !selectedAssigned.includes(id)),
    );
    setSelectedAssigned([]);
  };

  const save = async () => {
    if (!droitId) return;
    setLoading(true);
    try {
      await updateDroitPermissions(droitId, assignedIds);
      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Permissions mises à jour.",
      });
      //onHide();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Rendu d'une permission individuelle (Item)
  const renderPermissionItem = (
    perm: UIPermission,
    selectedList: number[],
    setSelected: React.Dispatch<React.SetStateAction<number[]>>,
  ) => (
    <div
      key={perm.id}
      className="flex items-center gap-3 p-2 hover:bg-slate-50 border-b border-slate-50 last:border-none transition-colors"
    >
      <Checkbox
        inputId={String(perm.id)}
        onChange={(e) => {
          if (e.checked) setSelected([...selectedList, perm.id]);
          else setSelected(selectedList.filter((id) => id !== perm.id));
        }}
        checked={selectedList.includes(perm.id)}
        className="border border-blue-400"
      />
      <div className="flex items-center gap-2 flex-1">
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            actionBadgeColor[perm.action]
          }`}
        >
          {perm.action.toUpperCase()}
        </span>
        <label
          htmlFor={String(perm.id)}
          className="text-sm text-slate-700 cursor-pointer"
        >
          {perm.label}
        </label>
      </div>
    </div>
  );

  return (
    <Dialog
      header={
        <div className="flex items-center gap-3 font-bold text-slate-800">
          <div className="bg-amber-100 p-2 rounded-lg">
            <ShieldCheck size={22} className="text-amber-600" />
          </div>
          <span>Configuration des privilèges</span>
        </div>
      }
      visible={visible}
      style={{ width: "1000px" }}
      onHide={onHide}
      draggable={false}
      className="rounded-2xl"
    >
      <Toast ref={toast} />

      <div className="grid grid-cols-11 gap-2 items-center pt-2">
        {/* COLONNE GAUCHE: Liste des permissions (Filtrées pour exclure celles déjà à droite) */}
        <div className="col-span-5 flex flex-col h-[450px]">
          <div className="flex items-center gap-2 mb-2 px-1">
            <List size={16} className="text-slate-500" />
            <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">
              Permissions disponibles
            </span>
          </div>

          <div className="flex-1 border-2 border-slate-200 rounded-2xl overflow-y-auto bg-white shadow-inner p-2">
            {allPermissionsGrouped.map((group) => {
              const availableInGroup = group.permissions.filter(
                (p) => !assignedIds.includes(p.id),
              );
              if (availableInGroup.length === 0) return null;

              const isExpanded = expandedResources[group.resource] ?? false;

              return (
                <div
                  key={group.resource}
                  className="mb-2 border rounded-xl overflow-hidden"
                >
                  <div
                    className="bg-slate-50 p-2 flex justify-between items-center cursor-pointer border-b"
                    onClick={() => toggleResource(group.resource)}
                  >
                    <span className="text-xs font-bold uppercase flex items-center gap-2">
                      <Lock size={12} /> {group.resource}
                    </span>
                    {isExpanded ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )}
                  </div>
                  {isExpanded && (
                    <div className="bg-white">
                      {availableInGroup.map((p) =>
                        renderPermissionItem(
                          p,
                          selectedAvailable,
                          setSelectedAvailable,
                        ),
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* COLONNE MILIEU: Boutons */}
        <div className="col-span-1 flex flex-col gap-4 items-center">
          <Button
            icon={<ArrowRight size={20} />}
            onClick={moveRight}
            disabled={selectedAvailable.length === 0}
            className={`p-3 rounded-full shadow-md ${
              selectedAvailable.length > 0
                ? "bg-blue-600 border-none text-white"
                : "bg-slate-100 border-none text-slate-400"
            }`}
          />
          <Button
            icon={<ArrowLeft size={20} />}
            onClick={moveLeft}
            disabled={selectedAssigned.length === 0}
            className={`p-3 rounded-full shadow-md ${
              selectedAssigned.length > 0
                ? "bg-amber-600 border-none text-white"
                : "bg-slate-100 border-none text-slate-400"
            }`}
          />
        </div>

        {/* COLONNE DROITE: Permissions ajoutées */}
        <div className="col-span-5 flex flex-col h-[450px]">
          <div className="flex items-center gap-2 mb-2 px-1">
            <CheckSquare size={16} className="text-emerald-500" />
            <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">
              Permissions accordées
            </span>
          </div>

          <div className="flex-1 border-2 border-emerald-100 rounded-2xl overflow-y-auto bg-emerald-50/20 shadow-inner p-2">
            {allPermissionsGrouped.map((group) => {
              const assignedInGroup = group.permissions.filter((p) =>
                assignedIds.includes(p.id),
              );
              if (assignedInGroup.length === 0) return null;

              const isExpanded =
                expandedResources[`assigned_${group.resource}`] ?? true;

              return (
                <div
                  key={`assigned_${group.resource}`}
                  className="mb-2 border border-emerald-100 rounded-xl overflow-hidden"
                >
                  <div
                    className="bg-emerald-50/50 p-2 flex justify-between items-center cursor-pointer border-b border-emerald-100"
                    onClick={() => toggleResource(`assigned_${group.resource}`)}
                  >
                    <span className="text-xs font-bold uppercase flex items-center gap-2 text-emerald-700">
                      <ShieldCheck size={12} /> {group.resource}
                    </span>
                    {isExpanded ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )}
                  </div>
                  {isExpanded && (
                    <div className="bg-white">
                      {assignedInGroup.map((p) =>
                        renderPermissionItem(
                          p,
                          selectedAssigned,
                          setSelectedAssigned,
                        ),
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
        <Button
          label="Annuler"
          icon={<X size={16} />}
          onClick={onHide}
          className="p-button-text text-slate-400"
        />
        <Button
          label={
            loading ? "Enregistrement..." : "Enregistrer les modifications"
          }
          icon={!loading && <Save size={16} />}
          disabled={loading}
          onClick={save}
          className="bg-slate-900 text-white font-bold px-8 py-3 rounded-xl border-none shadow-lg"
        />
      </div>
    </Dialog>
  );
}
