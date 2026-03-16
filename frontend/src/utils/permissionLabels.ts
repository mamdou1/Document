// utils/permissionLabels.ts
import { getAllEntiteeUn } from "../api/entiteeUn";
import { getAllEntiteeDeux } from "../api/entiteeDeux";
import { getAllEntiteeTrois } from "../api/entiteeTrois";

export type PermissionAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "access";

// Interface pour une ressource avec ses actions
export interface ResourceLabels {
  access?: string;
  create?: string;
  read?: string;
  update?: string;
  delete?: string;
}

// ✅ Interface avec index signature
export interface PermissionLabels {
  [key: string]: ResourceLabels; // Index signature
  exercice: ResourceLabels;
  agent: ResourceLabels;
  pieces: ResourceLabels;
  statistique: ResourceLabels;
  droit: ResourceLabels;
  fonction: ResourceLabels;
  document: ResourceLabels;
  documentType: ResourceLabels;
  historique: ResourceLabels;
  entiteeUn: ResourceLabels;
  entiteeDeux: ResourceLabels;
  entiteeTrois: ResourceLabels;
  salle: ResourceLabels;
  rayon: ResourceLabels;
  box: ResourceLabels;
  trave: ResourceLabels;
  site: ResourceLabels;
}

// Interface pour stocker les titres dynamiques
export interface EntityTitles {
  entiteeUn: string;
  entiteeDeux: string;
  entiteeTrois: string;
}

// Valeurs par défaut
export const DEFAULT_TITLES: EntityTitles = {
  entiteeUn: "Entité 1",
  entiteeDeux: "Entité 2",
  entiteeTrois: "Entité 3",
};

// Fonction pour charger les titres des entités
export const loadEntityTitles = async (): Promise<EntityTitles> => {
  try {
    const [un, deux, trois] = await Promise.all([
      getAllEntiteeUn(),
      getAllEntiteeDeux(),
      getAllEntiteeTrois(),
    ]);

    const titreUn =
      Array.isArray(un) && un.length > 0
        ? un[0].titre
        : DEFAULT_TITLES.entiteeUn;
    const titreDeux =
      Array.isArray(deux) && deux.length > 0
        ? deux[0].titre
        : DEFAULT_TITLES.entiteeDeux;
    const titreTrois =
      Array.isArray(trois) && trois.length > 0
        ? trois[0].titre
        : DEFAULT_TITLES.entiteeTrois;

    return {
      entiteeUn: titreUn,
      entiteeDeux: titreDeux,
      entiteeTrois: titreTrois,
    };
  } catch (error) {
    console.error("Erreur chargement titres entités:", error);
    return DEFAULT_TITLES;
  }
};

// Fonction pour générer les labels avec les titres dynamiques
export const getPermissionLabels = (
  titles: EntityTitles = DEFAULT_TITLES,
): PermissionLabels => ({
  exercice: {
    access: "Accès au module exercice",
    create: "Créer un exercice",
    read: "Consulter les exercices",
    update: "Modifier un exercice",
    delete: "Supprimer un exercice",
  },
  agent: {
    access: "Accès au module agents",
    create: "Créer un agent",
    read: "Consulter les agents",
    update: "Modifier un agent",
    delete: "Supprimer un agent",
  },
  pieces: {
    access: "Accès au module pièces",
    create: "Ajouter une pièce",
    read: "Consulter les pièces",
    update: "Modifier une pièce",
    delete: "Supprimer une pièce",
  },
  statistique: {
    access: "Accès aux statistiques",
    create: "Générer une statistique",
    read: "Consulter les statistiques",
    update: "Modifier une statistique",
  },
  droit: {
    access: "Accès à la gestion des droits",
    create: "Créer un droit",
    read: "Consulter les droits",
    update: "Modifier un droit",
    delete: "Supprimer un droit",
  },
  fonction: {
    access: "Accès aux fonctions",
    create: "Créer une fonction",
    read: "Consulter les fonctions",
    update: "Modifier une fonction",
    delete: "Supprimer une fonction",
  },
  document: {
    access: "Accès aux documents",
    create: "Ajouter un document",
    read: "Consulter les documents",
    update: "Modifier un document",
    delete: "Supprimer un document",
  },
  documentType: {
    access: "Accès aux types de documents",
    create: "Créer un type de document",
    read: "Consulter les types de documents",
    update: "Modifier un type de document",
    delete: "Supprimer un type de document",
  },
  historique: {
    access: "Accès à l'historique",
    read: "Consulter l'historique",
  },
  entiteeUn: {
    access: `Accès ${titles.entiteeUn}`,
    create: `Créer ${titles.entiteeUn}`,
    read: `Voir ${titles.entiteeUn}`,
    update: `Modifier ${titles.entiteeUn}`,
    delete: `Supprimer ${titles.entiteeUn}`,
  },
  entiteeDeux: {
    access: `Accès ${titles.entiteeDeux}`,
    create: `Créer ${titles.entiteeDeux}`,
    read: `Voir ${titles.entiteeDeux}`,
    update: `Modifier ${titles.entiteeDeux}`,
    delete: `Supprimer ${titles.entiteeDeux}`,
  },
  entiteeTrois: {
    access: `Accès ${titles.entiteeTrois}`,
    create: `Créer ${titles.entiteeTrois}`,
    read: `Voir ${titles.entiteeTrois}`,
    update: `Modifier ${titles.entiteeTrois}`,
    delete: `Supprimer ${titles.entiteeTrois}`,
  },
  salle: {
    access: "Accès aux salles",
    create: "Créer une salle",
    read: "Consulter les salles",
    update: "Modifier une salle",
    delete: "Supprimer une salle",
  },
  rayon: {
    access: "Accès aux rayons",
    create: "Créer un rayon",
    read: "Consulter les rayons",
    update: "Modifier un rayon",
    delete: "Supprimer un rayon",
  },
  box: {
    access: "Accès aux box",
    create: "Créer un box",
    read: "Consulter les box",
    update: "Modifier un box",
    delete: "Supprimer un box",
  },
  trave: {
    access: "Accès aux travées",
    create: "Créer une travée",
    read: "Consulter les travées",
    update: "Modifier une travée",
    delete: "Supprimer une travée",
  },
  site: {
    access: "Accès aux sites",
    create: "Créer un site",
    read: "Consulter les sites",
    update: "Modifier un site",
    delete: "Supprimer un site",
  },
});
