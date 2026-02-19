// src/constants/permissionLabels.ts

export type PermissionAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "access";

export const PERMISSION_LABELS: Record<
  string,
  Partial<Record<PermissionAction, string>>
> = {
  exercice: {
    create: "Créer un exercice",
    read: "Consulter les exercices",
    update: "Modifier un exercice",
    delete: "Supprimer un exercice",
  },
  agent: {
    create: "Créer un agent",
    read: "Consulter les agents",
    update: "Modifier un agent",
    delete: "Supprimer un agent",
  },
  pieces: {
    create: "Ajouter une pièce",
    read: "Consulter les pièces",
    update: "Modifier une pièce",
  },
  statistique: {
    create: "Créer une statistique",
    read: "Consulter les statistiques",
    update: "Modifier une statistique",
  },
};
