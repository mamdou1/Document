// src/interfaces/index.ts

import { Agent } from "http";

export type Role = "ADMIN" | "MEMBRE" | "MEMBRE_AUTHORIZE";
export type Genre = "HOMME" | "FEMME";

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

export interface Programme {
  id?: string;
  code_programme: string;
  libelle: string;
  description?: string;
  exercice?: Exercice | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Chapitre {
  id?: number;
  code_chapitre: string;
  libelle: string;
  description?: string;
  programme: Programme | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Nature {
  id?: string;
  code_nature: string;
  libelle: string;
  description?: string;
  chapitre: Chapitre | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Liquidation {
  id?: string;
  description?: string;
  numDossier?: string;
  montant: number;
  dateLiquidation?: string;

  programme: Programme | string; // même si pas stocké directement
  chapitre: Chapitre | string;
  nature: Nature | string;
  fournisseur?: Fournisseur | string;
  serviceBeneficiaire?: ServiceBeneficiaire | string;
  //Pieces: TypePiece[];
  type: Type | string;
  pieces?: Pieces[];
  //pieces: LiquidationPiece[];

  sourceDeFinancement: SourceDeFinancement | string;

  createdAt?: string;
  updatedAt?: string;
}

export interface TypePiece {
  id?: string;
  piece: Pieces;
  disponible: boolean;
  // pdfPath?: string;
}

export interface Type {
  id?: string;
  codeType: string;
  nom: string;
  pieces: TypePiece[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTypePayload {
  codeType: string;
  nom: string;
}

export interface AddPieceToType {
  piece: string; // id de la pièce
  disponible?: boolean;
}

export interface AddPiecesToTypePayload {
  pieces: AddPieceToType[];
}

export interface Pieces {
  id: string;
  code_pieces: string;
  libelle: string;
  division_id: number;
  division: Division;

  entitee_un_id?: number[];
  entitee_deux_id?: number[];
  entitee_trois_id?: number[];

  entites_un?: EntiteeUn[];
  entites_deux?: EntiteeDeux[];
  entites_trois?: EntiteeTrois[];

  entitee_cible_id: number;

  LiquidationPieces?: {
    disponible: boolean;
  };
  DocumentPieces?: {
    disponible: boolean;
  };

  createdAt?: string;
  updatedAt?: string;
}

export interface PieceFichier {
  id: string;
  type_piece_id: TypePiece | string;
  fichier: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface LiquidationPiece {
  piece: Pieces;
  disponible: boolean;
}

// export interface User {
//   id: string;
//   nom: string;
//   prenom: string;
//   email: string;
//   telephone?: string;
//   role: Role;
//   num_matricule: string;
//   createdAt: string;
//   updatedAt: string;
//   droit: Droit | string;
//   fonction_id: Fonction | string;

//   // ✅ Ajout du champ photoProfil
//   photoProfil?: string;
// }

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: Role;
  num_matricule: string;
  createdAt: string;
  updatedAt: string;

  // On utilise l'ID pour les formulaires, et l'objet pour l'affichage
  droit?: Droit | string;

  fonction?: number;
  fonction_details?: Fonction;

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

export interface Piece {
  _id?: string; // généré par MongoDB
  nom: string;
  // estValider: boolean;

  expressionDeBesoin?: string;
  demandeDeCotion?: string;
  ficheDeLiquidation?: string;
  ficheEngagement?: string;
  bonDeCommande?: string;
  bonAchat?: string;
  facturesProForma?: string;
  contratDepense?: string;
  piecesFiscale?: string;
  rapportDeCotisation?: string;
  lettreDeNotification?: string;
  bordereauEmission?: string;
  mandatDePaiement?: string;
  etatDeRetenu?: string;
  OEM?: string;
  bordereauLIvraison?: string;
  pvDeDepense?: string;
  facture?: string;

  createdAt?: string; // si tu utilises timestamps dans Mongoose
  updatedAt?: string;
}

export interface Fournisseur {
  id?: string;
  raisonSocial: string;
  sigle: string;
  NIF: string;
  adresse: string;
  numero: string;
  secteurActivite: string;

  createdAt?: string; // si tu utilises timestamps dans Mongoose
  updatedAt?: string;
}

export interface ServiceBeneficiaire {
  id?: string;
  codeService: string;
  libelle: string;
  sigle: string;
  adresse: string;

  createdAt?: string; // si tu utilises timestamps dans Mongoose
  updatedAt?: string;
}

export interface Service {
  id: number;
  code_service: string;
  libelle: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface Division {
  id: number;
  code_division: string;
  libelle: string;
  service_id: number;
  service: Service;

  createdAt?: string; // si tu utilises timestamps dans Mongoose
  updatedAt?: string;
}

export interface Section {
  id: number;
  code_section: string;
  libelle: string;
  division_id: number;
  division: Division;

  createdAt?: string; // si tu utilises timestamps dans Mongoose
  updatedAt?: string;
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

export interface SourceDeFinancement {
  id?: string;
  libelle: string;
  createdAt?: string;
  updatedAt?: string;
}

//---------------------DOcument et genration de champs----------------------------------

// export interface TypeDocument {
//   id: number;
//   code: string;
//   nom: string;
//   division_id?: number; // Ajoutez le '?' pour le rendre optionnel
//   division?: {
//     id: number;
//     libelle: string;
//   } | null;

//   entitee_un_id?: number;
//   entitee_deux_id?: number;
//   entitee_trois_id?: number;
//   entitee_un: EntiteeUn;
//   entitee_deux: EntiteeDeux;
//   entitee_trois: EntiteeTrois;

//   structure_libelle: string;

//   metaFields?: MetaField[];
//   pieces: TypeDocumentPiece[];
//   createdAt?: string;
//   updatedAt?: string;
// }

// export interface CreateTypeDocumentPayload {
//   code: string;
//   nom: string;
//   division_id: number;
//   entitee_un_id?: number;
//   entitee_deux_id?: number;
//   entitee_trois_id?: number;
// }

export interface TypeDocument {
  id: number;
  code: string;
  nom: string;

  // IDs (pour les formulaires)
  division_id?: number | null;
  entitee_un_id?: number[];
  entitee_deux_id?: number[];
  entitee_trois_id?: number[];

  // Objets joints (pour l'affichage) - on les rend optionnels car ils viennent du "include"
  entites_un?: EntiteeUn[];
  entites_deux?: EntiteeDeux[];
  entites_trois?: EntiteeTrois[];

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

export interface Salle {
  id?: string;
  code_salle: string;
  libelle: string;
  etagere: Etagere;
  etagere_id: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Etagere {
  id?: string;
  code_etagere: string;
  libelle: string;
  salle_id: string; // Foreign Key vers Salle
  salle?: Salle;
  boxes?: Box[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Box {
  id?: string;
  code_box: string;
  libelle: string;
  capacite_max: string;
  current_count: string;
  etagere_id: string; // Foreign Key vers Salle
  etagere?: Etagere;
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
