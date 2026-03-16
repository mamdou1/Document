// utils/permissionHelpers.ts
import { Permission } from "../interfaces";
import {
  getPermissionLabels,
  PermissionAction,
  DEFAULT_TITLES,
  PermissionLabels, // ✅ Importer le type
} from "./permissionLabels";

// Utiliser les labels par défaut avec le bon typage
const PERMISSION_LABELS: PermissionLabels = getPermissionLabels(DEFAULT_TITLES);

export interface UIPermission extends Permission {
  label: string;
}

export interface UIPermissionGroup {
  resource: string;
  permissions: UIPermission[];
}

export const groupPermissionsByResource = (
  permissions: Permission[],
): UIPermissionGroup[] => {
  const map = new Map<string, UIPermission[]>();

  permissions.forEach((perm) => {
    const resourceLabels = PERMISSION_LABELS[perm.resource];
    const actionLabels = resourceLabels?.[perm.action as PermissionAction];
    const label = actionLabels ?? `${perm.action} ${perm.resource}`;

    if (!map.has(perm.resource)) {
      map.set(perm.resource, []);
    }

    map.get(perm.resource)!.push({
      ...perm,
      label,
    });
  });

  return Array.from(map.entries()).map(([resource, permissions]) => ({
    resource,
    permissions,
  }));
};

export const actionBadgeColor: Record<PermissionAction, string> = {
  create: "bg-green-100 text-green-700",
  read: "bg-blue-100 text-blue-700",
  update: "bg-orange-100 text-orange-700",
  delete: "bg-red-100 text-red-700",
  access: "bg-yellow-100 text-yellow-700",
};
