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
  getPermissionsByDroitId, // <-- Changé ici
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
      setLoading(true);
      try {
        const [all, permissionsData] = await Promise.all([
          getAllPermissions(),
          getPermissionsByDroitId(droitId), // <-- Changé ici
        ]);

        const grouped = groupPermissionsByResource(all.data);
        setAllPermissionsGrouped(grouped);

        // permissionsData est déjà le tableau de permissions
        setAssignedIds(permissionsData.map((p: any) => p.id));

        // Reset selections
        setSelectedAvailable([]);
        setSelectedAssigned([]);
      } catch (error) {
        console.error("Erreur lors du chargement des permissions", error);
        toast.current?.show({
          severity: "error",
          summary: "Erreur",
          detail: "Impossible de charger les permissions",
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [visible, droitId]);

  const toggleResource = (resource: string) => {
    setExpandedResources((prev) => ({ ...prev, [resource]: !prev[resource] }));
  };

  // Fonction pour sélectionner/désélectionner toutes les permissions d'un groupe
  const toggleAllInGroup = (
    group: UIPermissionGroup,
    targetList: "available" | "assigned",
  ) => {
    const permissions = group.permissions;

    if (targetList === "available") {
      const availableInGroup = permissions.filter(
        (p) => !assignedIds.includes(p.id),
      );
      const allSelected = availableInGroup.every((p) =>
        selectedAvailable.includes(p.id),
      );

      if (allSelected) {
        // Désélectionner toutes
        setSelectedAvailable((prev) =>
          prev.filter((id) => !availableInGroup.some((p) => p.id === id)),
        );
      } else {
        // Sélectionner toutes
        setSelectedAvailable((prev) => [
          ...prev,
          ...availableInGroup
            .map((p) => p.id)
            .filter((id) => !prev.includes(id)),
        ]);
      }
    } else {
      const assignedInGroup = permissions.filter((p) =>
        assignedIds.includes(p.id),
      );
      const allSelected = assignedInGroup.every((p) =>
        selectedAssigned.includes(p.id),
      );

      if (allSelected) {
        // Désélectionner toutes
        setSelectedAssigned((prev) =>
          prev.filter((id) => !assignedInGroup.some((p) => p.id === id)),
        );
      } else {
        // Sélectionner toutes
        setSelectedAssigned((prev) => [
          ...prev,
          ...assignedInGroup
            .map((p) => p.id)
            .filter((id) => !prev.includes(id)),
        ]);
      }
    }
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

  // Transférer toutes les permissions disponibles
  const moveAllRight = () => {
    const allAvailableIds = allPermissionsGrouped.flatMap((group) =>
      group.permissions
        .filter((p) => !assignedIds.includes(p.id))
        .map((p) => p.id),
    );
    setAssignedIds((prev) => [...prev, ...allAvailableIds]);
    setSelectedAvailable([]);
  };

  // Retirer toutes les permissions assignées
  const moveAllLeft = () => {
    setAssignedIds([]);
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
        life: 3000,
      });

      // Petit délai avant de fermer pour voir le message de succès
      setTimeout(() => {
        onHide();
      }, 1500);
    } catch (error: any) {
      console.error(error);
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail:
          error?.response?.data?.message || "Erreur lors de la mise à jour",
      });
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
        className="border border-emerald-400"
      />
      <div className="flex items-center gap-2 flex-1">
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            actionBadgeColor[perm.action as keyof typeof actionBadgeColor] ||
            "bg-gray-100 text-gray-700"
          }`}
        >
          {perm.action.toUpperCase()}
        </span>
        <label
          htmlFor={String(perm.id)}
          className="text-sm text-slate-700 cursor-pointer hover:text-emerald-600 transition-colors"
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

      {loading && !allPermissionsGrouped.length ? (
        <div className="flex items-center justify-center h-[450px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Chargement des permissions...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-11 gap-2 items-center pt-2">
          {/* COLONNE GAUCHE: Liste des permissions disponibles */}
          <div className="col-span-5 flex flex-col h-[450px]">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2">
                <List size={16} className="text-slate-500" />
                <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">
                  Permissions disponibles
                </span>
              </div>
              <Button
                label="Tout sélectionner"
                onClick={() => {
                  const allAvailableIds = allPermissionsGrouped.flatMap(
                    (group) =>
                      group.permissions
                        .filter((p) => !assignedIds.includes(p.id))
                        .map((p) => p.id),
                  );
                  setSelectedAvailable(allAvailableIds);
                }}
                className="text-xs bg-transparent text-emerald-600 border border-emerald-200 rounded-lg px-2 py-1 hover:bg-emerald-50"
                disabled={selectedAvailable.length > 0}
              />
            </div>

            <div className="flex-1 border-2 border-slate-200 rounded-2xl overflow-y-auto bg-white shadow-inner p-2">
              {allPermissionsGrouped.map((group) => {
                const availableInGroup = group.permissions.filter(
                  (p) => !assignedIds.includes(p.id),
                );
                if (availableInGroup.length === 0) return null;

                const isExpanded = expandedResources[group.resource] ?? true;
                const allSelectedInGroup = availableInGroup.every((p) =>
                  selectedAvailable.includes(p.id),
                );

                return (
                  <div
                    key={group.resource}
                    className="mb-2 border rounded-xl overflow-hidden"
                  >
                    <div
                      className="bg-slate-50 p-2 flex justify-between items-center cursor-pointer border-b hover:bg-slate-100 transition-colors"
                      onClick={() => toggleResource(group.resource)}
                    >
                      <div className="flex items-center gap-2">
                        <Lock size={12} className="text-slate-500" />
                        <span className="text-xs font-bold uppercase">
                          {group.resource}
                        </span>
                        <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 rounded-full">
                          {availableInGroup.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          inputId={`select_all_${group.resource}`}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleAllInGroup(group, "available");
                          }}
                          checked={allSelectedInGroup}
                          className="border border-emerald-400"
                          onClick={(e) => e.stopPropagation()}
                        />
                        {isExpanded ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="bg-white max-h-48 overflow-y-auto">
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
          <div className="col-span-1 flex flex-col gap-2 items-center">
            <Button
              icon={<ArrowRight size={20} />}
              onClick={moveRight}
              disabled={selectedAvailable.length === 0}
              className={`p-2 rounded-full shadow-md transition-all ${
                selectedAvailable.length > 0
                  ? "bg-emerald-600 border-none text-white hover:bg-emerald-700 hover:scale-110"
                  : "bg-slate-100 border-none text-slate-400 cursor-not-allowed"
              }`}
              tooltip="Ajouter les permissions sélectionnées"
              tooltipOptions={{ position: "top" }}
            />
            <Button
              icon={<ArrowLeft size={20} />}
              onClick={moveLeft}
              disabled={selectedAssigned.length === 0}
              className={`p-2 rounded-full shadow-md transition-all ${
                selectedAssigned.length > 0
                  ? "bg-amber-600 border-none text-white hover:bg-amber-700 hover:scale-110"
                  : "bg-slate-100 border-none text-slate-400 cursor-not-allowed"
              }`}
              tooltip="Retirer les permissions sélectionnées"
              tooltipOptions={{ position: "top" }}
            />
            <div className="h-px w-8 bg-slate-200 my-1"></div>
            <Button
              icon={<ArrowRight size={20} />}
              onClick={moveAllRight}
              disabled={allPermissionsGrouped.every((group) =>
                group.permissions.every((p) => assignedIds.includes(p.id)),
              )}
              className="p-2 rounded-full bg-slate-200 border-none text-slate-600 hover:bg-slate-300 transition-all"
              tooltip="Ajouter toutes les permissions"
              tooltipOptions={{ position: "top" }}
            />
            <Button
              icon={<ArrowLeft size={20} />}
              onClick={moveAllLeft}
              disabled={assignedIds.length === 0}
              className="p-2 rounded-full bg-slate-200 border-none text-slate-600 hover:bg-slate-300 transition-all"
              tooltip="Retirer toutes les permissions"
              tooltipOptions={{ position: "top" }}
            />
          </div>

          {/* COLONNE DROITE: Permissions accordées */}
          <div className="col-span-5 flex flex-col h-[450px]">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2">
                <CheckSquare size={16} className="text-emerald-500" />
                <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">
                  Permissions accordées
                </span>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg font-semibold">
                {assignedIds.length} sélectionnée(s)
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
                const allSelectedInGroup = assignedInGroup.every((p) =>
                  selectedAssigned.includes(p.id),
                );

                return (
                  <div
                    key={`assigned_${group.resource}`}
                    className="mb-2 border border-emerald-100 rounded-xl overflow-hidden"
                  >
                    <div
                      className="bg-emerald-50/50 p-2 flex justify-between items-center cursor-pointer border-b border-emerald-100 hover:bg-emerald-100/50 transition-colors"
                      onClick={() =>
                        toggleResource(`assigned_${group.resource}`)
                      }
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={12} className="text-emerald-600" />
                        <span className="text-xs font-bold uppercase text-emerald-700">
                          {group.resource}
                        </span>
                        <span className="text-[10px] bg-emerald-200 text-emerald-700 px-1.5 rounded-full">
                          {assignedInGroup.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          inputId={`select_all_assigned_${group.resource}`}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleAllInGroup(group, "assigned");
                          }}
                          checked={allSelectedInGroup}
                          className="border border-emerald-400"
                          onClick={(e) => e.stopPropagation()}
                        />
                        {isExpanded ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="bg-white max-h-48 overflow-y-auto">
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
              {assignedIds.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <ShieldCheck size={40} className="text-slate-300 mb-2" />
                  <p className="text-slate-400 text-sm">
                    Aucune permission accordée
                  </p>
                  <p className="text-xs text-slate-300">
                    Utilisez les flèches pour ajouter des permissions
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
        <Button
          label="Annuler"
          icon={<X size={16} />}
          onClick={onHide}
          className="p-button-text text-slate-400 hover:text-slate-600 transition-colors"
          disabled={loading}
        />
        <Button
          label={
            loading ? "Enregistrement..." : "Enregistrer les modifications"
          }
          icon={!loading && <Save size={16} />}
          disabled={loading}
          onClick={save}
          className="bg-slate-900 text-white font-bold px-8 py-3 rounded-xl border-none shadow-lg hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
    </Dialog>
  );
}
