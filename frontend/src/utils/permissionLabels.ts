// src/constants/permissionLabels.ts

export type PermissionAction = "create" | "read" | "update" | "delete";

export const PERMISSION_LABELS: Record<
  string,
  Partial<Record<PermissionAction, string>>
> = {
  programme: {
    create: "Créer un programme",
    read: "Consulter les programmes",
    update: "Modifier un programme",
    delete: "Supprimer un programme",
  },
  chapitre: {
    create: "Créer un chapitre",
    read: "Consulter les chapitres",
    update: "Modifier un chapitre",
    delete: "Supprimer un chapitre",
  },
  liquidation: {
    create: "Créer une liquidation",
    read: "Consulter les liquidations",
    update: "Modifier une liquidation",
    delete: "Supprimer une liquidation",
  },
  nature: {
    create: "Créer une nature",
    read: "Consulter les natures",
    update: "Modifier une nature",
    delete: "Supprimer une nature",
  },
  exercice: {
    create: "Créer un exercice",
    read: "Consulter les exercices",
    update: "Modifier un exercice",
    delete: "Supprimer un exercice",
  },
  fournisseur: {
    create: "Créer un fournisseur",
    read: "Consulter les fournisseurs",
    update: "Modifier un fournisseur",
    delete: "Supprimer un fournisseur",
  },
  serviceBeneficiaire: {
    create: "Créer un service bénéficiaire",
    read: "Consulter les services bénéficiaires",
    update: "Modifier un service bénéficiaire",
    delete: "Supprimer un service bénéficiaire",
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
  type: {
    create: "Créer un type",
    read: "Consulter les types",
    update: "Modifier un type",
  },
};
