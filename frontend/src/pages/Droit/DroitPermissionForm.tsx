import { useEffect, useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import {
  ShieldCheck,
  Save,
  X,
  Search,
  ChevronDown,
  ChevronUp,
  Filter,
  CheckCircle,
  XCircle,
} from "lucide-react";

import {
  getAllPermissions,
  getPermissionsByDroitId,
  updateDroitPermissions,
} from "../../api/permission";

import {
  groupPermissionsByResource,
  actionBadgeColor,
  UIPermission,
  UIPermissionGroup,
} from "../../utils/permissionHelpers";

import { Toast } from "primereact/toast";

// ✅ Importer les fonctions pour les titres
import {
  loadEntityTitles,
  getPermissionLabels,
  DEFAULT_TITLES,
  PermissionLabels,
} from "../../utils/permissionLabels";

type Props = {
  visible: boolean;
  droitId: number | null;
  onHide: () => void;
};

type FilterType = "all" | "granted" | "ungranted";

export default function DroitPermissionForm({
  visible,
  droitId,
  onHide,
}: Props) {
  const [allPermissionsGrouped, setAllPermissionsGrouped] = useState<
    UIPermissionGroup[]
  >([]);
  const [assignedIds, setAssignedIds] = useState<number[]>([]);
  const [permissionLabels, setPermissionLabels] = useState<PermissionLabels>(
    getPermissionLabels(DEFAULT_TITLES),
  );
  const [loading, setLoading] = useState(false);
  const [expandedResources, setExpandedResources] = useState<
    Record<string, boolean>
  >({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const toast = useRef<Toast>(null);

  // Options pour le dropdown de filtre
  const filterOptions = [
    { label: "Toutes les permissions", value: "all" },
    { label: "Permissions accordées", value: "granted" },
    { label: "Permissions non accordées", value: "ungranted" },
  ];

  // ✅ Charger les titres des entités au montage du modal
  useEffect(() => {
    if (visible) {
      const loadTitles = async () => {
        try {
          const titles = await loadEntityTitles();
          setPermissionLabels(getPermissionLabels(titles));
        } catch (error) {
          console.error("Erreur chargement titres:", error);
        }
      };
      loadTitles();
    }
  }, [visible]);

  useEffect(() => {
    if (!visible || !droitId) return;

    const load = async () => {
      setLoading(true);
      try {
        const [all, permissionsData] = await Promise.all([
          getAllPermissions(),
          getPermissionsByDroitId(droitId),
        ]);

        const grouped = groupPermissionsByResource(all.data);
        setAllPermissionsGrouped(grouped);
        setAssignedIds(permissionsData.map((p: any) => p.id));

        // Tout déplier par défaut
        const expanded: Record<string, boolean> = {};
        grouped.forEach((g) => {
          expanded[g.resource] = true;
        });
        setExpandedResources(expanded);
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

  const expandAll = () => {
    const expanded: Record<string, boolean> = {};
    allPermissionsGrouped.forEach((g) => {
      expanded[g.resource] = true;
    });
    setExpandedResources(expanded);
  };

  const collapseAll = () => {
    const collapsed: Record<string, boolean> = {};
    allPermissionsGrouped.forEach((g) => {
      collapsed[g.resource] = false;
    });
    setExpandedResources(collapsed);
  };

  const handleSwitchChange = (permId: number, checked: boolean) => {
    if (checked) {
      setAssignedIds((prev) => [...prev, permId]);
    } else {
      setAssignedIds((prev) => prev.filter((id) => id !== permId));
    }
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

  // Fonction pour obtenir le libellé complet d'une permission
  const getPermissionFullLabel = (perm: UIPermission): string => {
    const resourceLabels = permissionLabels[perm.resource];
    const actionLabel = resourceLabels?.[perm.action] || "";
    return actionLabel || `${perm.action} ${perm.resource}`;
  };

  // Filtrer et grouper les permissions
  const getFilteredGroupedPermissions = () => {
    return allPermissionsGrouped
      .map((group) => {
        // Filtrer les permissions du groupe selon les critères
        const filteredPermissions = group.permissions.filter((perm) => {
          // Filtre par recherche
          const matchesSearch = getPermissionFullLabel(perm)
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

          // Filtre par type (accordée/non accordée)
          const isGranted = assignedIds.includes(perm.id);
          const matchesFilter =
            filterType === "all" ||
            (filterType === "granted" && isGranted) ||
            (filterType === "ungranted" && !isGranted);

          return matchesSearch && matchesFilter;
        });

        return {
          ...group,
          permissions: filteredPermissions,
        };
      })
      .filter((group) => group.permissions.length > 0);
  };

  const filteredGrouped = getFilteredGroupedPermissions();

  return (
    <Dialog
      header={
        <div className="flex items-center gap-3 font-bold text-slate-800">
          <div className="bg-amber-100 p-2 rounded-lg">
            <ShieldCheck size={22} className="text-amber-600" />
          </div>
          <span>Configuration des permissions</span>
        </div>
      }
      visible={visible}
      style={{ width: "800px" }}
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
        <div className="space-y-4">
          {/* Barre de filtres et recherche */}
          <div className="bg-slate-50 p-4 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-500" />
              <span className="text-xs font-bold text-slate-500 uppercase">
                Filtres
              </span>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <InputText
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une permission..."
                  className="w-full pl-9 pr-4 py-2 bg-white border-slate-200 rounded-lg"
                />
              </div>

              <Dropdown
                value={filterType}
                options={filterOptions}
                onChange={(e) => setFilterType(e.value)}
                className="w-full md:w-48 bg-white border-slate-200 rounded-lg"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <CheckCircle size={14} className="text-emerald-500" />
                  <span className="text-xs text-slate-600">
                    {assignedIds.length} permission(s) accordée(s)
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  label="Tout déplier"
                  onClick={expandAll}
                  className="text-xs bg-transparent text-slate-600 border border-slate-200 rounded-lg px-3 py-1 hover:bg-slate-100"
                />
                <Button
                  label="Tout replier"
                  onClick={collapseAll}
                  className="text-xs bg-transparent text-slate-600 border border-slate-200 rounded-lg px-3 py-1 hover:bg-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Liste des permissions */}
          <div className="max-h-[500px] overflow-y-auto border border-slate-200 rounded-xl bg-white">
            {filteredGrouped.length > 0 ? (
              filteredGrouped.map((group) => {
                const isExpanded = expandedResources[group.resource] ?? true;
                const grantedCount = group.permissions.filter((p) =>
                  assignedIds.includes(p.id),
                ).length;

                return (
                  <div
                    key={group.resource}
                    className="border-b border-slate-100 last:border-none"
                  >
                    {/* Header du groupe */}
                    <div
                      onClick={() => toggleResource(group.resource)}
                      className="sticky top-0 bg-slate-50 p-3 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <ShieldCheck size={16} className="text-emerald-600" />
                        <span className="text-sm font-bold uppercase text-slate-700">
                          {group.resource}
                        </span>
                        <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                          {grantedCount}/{group.permissions.length}
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp size={16} className="text-slate-400" />
                      ) : (
                        <ChevronDown size={16} className="text-slate-400" />
                      )}
                    </div>

                    {/* Liste des permissions du groupe */}
                    {isExpanded && (
                      <div className="divide-y divide-slate-50">
                        {group.permissions.map((perm) => {
                          const isGranted = assignedIds.includes(perm.id);

                          return (
                            <div
                              key={perm.id}
                              className={`flex items-center justify-between p-3 hover:bg-slate-50 transition-colors ${
                                isGranted ? "bg-emerald-50/20" : ""
                              }`}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    actionBadgeColor[
                                      perm.action as keyof typeof actionBadgeColor
                                    ] || "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {perm.action.toUpperCase()}
                                </span>
                                <span className="text-sm text-slate-700">
                                  {getPermissionFullLabel(perm)}
                                </span>
                              </div>

                              <InputSwitch
                                checked={isGranted}
                                onChange={(e) =>
                                  handleSwitchChange(perm.id, e.value)
                                }
                                className="flex-shrink-0"
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <ShieldCheck
                  size={48}
                  className="mx-auto text-slate-300 mb-3"
                />
                <p className="text-slate-400 font-medium">
                  Aucune permission trouvée
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  Essayez de modifier vos filtres
                </p>
              </div>
            )}
          </div>

          {/* Résumé des modifications */}
          <div className="bg-emerald-50 p-3 rounded-lg flex items-center justify-between">
            <span className="text-xs text-emerald-700">
              {assignedIds.length} permission(s) sélectionnée(s)
            </span>
            <span className="text-[10px] text-emerald-500">
              Les modifications seront appliquées après validation
            </span>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="flex justify-end gap-3 mt-4 pt-2 border-t">
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
