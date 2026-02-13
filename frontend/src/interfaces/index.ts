// src/interfaces/index.ts

import { Agent } from "http";

export type Genre = "HOMME" | "FEMME";
export type ModeChargement = "INDIVIDUEL" | "LOT_UNIQUE";

export interface Permission {
  id: number;
  resource: string;
  action: "create" | "read" | "update" | "delete";
}

export interface DroitPermission {
  permissionId: number;
}

export interface Exercice {
  id?: string;
  annee: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Droit {
  id?: string;
  libelle: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Pieces {
  id: string;
  code_pieces: string;
  libelle: string;
  division_id: number;
  LiquidationPieces?: {
    disponible: boolean;
  };
  DocumentPieces?: {
    disponible: boolean;
  };

  createdAt?: string;
  updatedAt?: string;
}

export interface LiquidationPiece {
  piece: Pieces;
  disponible: boolean;
}

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  num_matricule: string;
  createdAt: string;
  updatedAt: string;

  // On utilise l'ID pour les formulaires, et l'objet pour l'affichage
  droit?: Droit | string;

  fonction?: number;
  fonction_details?: Fonction;

  agent_access?: AgentEntiteeAccess[];

  photo_profil?: string;
}

export interface InscriptionPayload {
  nomGym: string;
  adresseGym: string;
  telephoneGym: string;
  nomAdmin: string;
  prenomAdmin: string;
  emailAdmin: string;
  passwordAdmin: string;
  telephoneAdmin: string;
  adresseAdmin: string;
}

export interface Fonction {
  id: number;
  libelle: string;
  service_id?: number;
  division_id?: number;
  section_id?: number;
  entitee_un_id?: number;
  entitee_deux_id?: number;
  entitee_trois_id?: number;
  entitee_un: EntiteeUn;
  entitee_deux: EntiteeDeux;
  entitee_trois: EntiteeTrois;

  createdAt?: string; // si tu utilises timestamps dans Mongoose
  updatedAt?: string;
}

export interface HistoriqueLog {
  id: number;
  agent_id?: number; // juste l’ID
  agent?: User;
  action: string;
  resource: string;
  resource_id?: number | null;
  method: string;
  path: string;
  status: number;
  ip?: string | null;
  user_agent?: string | null;
  data?: any | null;
  createdAt: string;
  updatedAt: string;
}

//---------------------DOcument et genration de champs----------------------------------

export interface TypeDocument {
  id: number;
  code: string;
  nom: string;

  // IDs (pour les formulaires)
  division_id?: number | null;
  entitee_un_id?: number;
  entitee_deux_id?: number;
  entitee_trois_id?: number;

  // Objets joints (pour l'affichage) - on les rend optionnels car ils viennent du "include"
  entitee_un?: EntiteeUn;
  entitee_deux?: EntiteeDeux;
  entitee_trois?: EntiteeTrois;

  // Champs calculés par le backend (getAll)
  structure_libelle?: string;
  structure_niveau?: string;

  metaFields?: MetaField[];
  pieces?: TypeDocumentPiece[]; // Rendu optionnel pour éviter les erreurs si non inclus
  createdAt?: string;
  updatedAt?: string;
}

// Pour la création, on rend tout optionnel sauf code et nom
export interface CreateTypeDocumentPayload {
  code: string;
  nom: string;
  entitee_un_id?: number | null;
  entitee_deux_id?: number | null;
  entitee_trois_id?: number | null;
}

export type MetaFieldType =
  | "text"
  | "number"
  | "date"
  | "textarea"
  | "select"
  | "file";

export interface MetaField {
  id: number;
  label: string;
  name: string;
  type: MetaFieldType;
  required: boolean;
  options?: string[]; // pour select
  type_document_id: number;
  createdAt?: string;
}

export interface CreateMetaFieldPayload {
  label: string;
  name: string;
  type: MetaFieldType;
  required: boolean;
  options?: string[];
}

export interface DocumentValue {
  id: number;
  meta_field_id: number;
  metaField?: MetaField;
  value: string;
}

export interface Document {
  id: number;
  type_document_id: number;
  typeDocument?: TypeDocument;
  values?: DocumentValue[];
  pieces?: Pieces[];
  createdAt?: string;
}

export interface CreateDocumentPayload {
  type_document_id: number;
  values: Record<number, any>;
}

export interface UploadResponse {
  success: boolean;
}

export interface Site {
  id?: string;
  nom: string;
  adresse: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface Salle {
  id?: string;
  code_salle: string;
  libelle: string;

  mb_rayons?: number;
  mb_traves_par_rayon?: number;
  nb_box?: number;
  sigle_rayon: string;
  sigle_trave: string;
  sigle_box: string;

  site: Site;
  site_id: number;

  createdAt?: string;
  updatedAt?: string;
}

export interface Rayon {
  id?: string;
  code: string;
  salle: Salle;
  salle_id: number;

  mb_traves_par_rayon?: number;
  nb_box?: number;
  sigle_trave: string;
  sigle_box: string;

  // trave: Trave[];
  // trave_id: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Trave {
  id?: string;
  code: string;
  rayon: Rayon;
  rayon_id: number;

  // box_id: string; // Foreign Key vers Salle
  // box?: Box[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Box {
  id?: string;
  code_box: string;
  libelle: string;
  capacite_max: string;
  current_count: string;

  trave_id: string; // Foreign Key vers Salle
  trave?: Trave;

  type_document_id: string;

  document: Document;
  document_id: number;

  createdAt?: string;
  updatedAt?: string;
}
//------------------------------------------------

export interface TypeDocumentPiece {
  id?: string;
  piece: Pieces;
  disponible: boolean;
  // pdfPath?: string;
}

export interface CreateTypeDocumentPayload {
  // codeType: string;
  // nom: string;
}

export interface AddPieceToTypeDocument {
  piece: string; // id de la pièce
  disponible?: boolean;
}

export interface AddPiecesToTypeDocumentPayload {
  pieces: AddPieceToTypeDocument[];
}

export interface PieceFichier {
  id: string;
  document_type_piece_id: TypeDocumentPiece | string;
  fichier: string;
  mode: ModeChargement;

  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentPiece {
  piece: Pieces;
  disponible: boolean;
}

export interface EntiteeUn {
  id: number;
  titre: string;
  code: string;
  libelle: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface EntiteeDeux {
  id: number;
  titre: string;
  code: string;
  libelle: string;
  entitee_un_id: number;
  entitee_un: EntiteeUn;

  createdAt?: string; // si tu utilises timestamps dans Mongoose
  updatedAt?: string;
}

export interface EntiteeTrois {
  id: number;
  titre: string;
  code: string;
  libelle: string;
  entitee_deux_id: number;
  entitee_deux: EntiteeDeux;

  createdAt?: string; // si tu utilises timestamps dans Mongoose
  updatedAt?: string;
}

// interfaces.ts
export interface AgentEntiteeAccess {
  id: number;
  agent_id: number;
  entitee_un_id?: number | null;
  entitee_deux_id?: number | null;
  entitee_trois_id?: number | null;
  created_at?: string;
  updated_at?: string;

  // Associations
  entitee_un?: EntiteeUn;
  entitee_deux?: EntiteeDeux;
  entitee_trois?: EntiteeTrois;
  agent?: Agent;
}

export interface GrantAccessPayload {
  agent_id: number;
  entitee_un_id?: number | null;
  entitee_deux_id?: number | null;
  entitee_trois_id?: number | null;
}

export interface UpdateAccessPayload {
  agent_id?: number;
  entitee_un_id?: number | null;
  entitee_deux_id?: number | null;
  entitee_trois_id?: number | null;
}
