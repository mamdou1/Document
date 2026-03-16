-- =====================================================
-- SCRIPT DE CRÉATION DES TABLES - BASE DE DONNÉES ARCHIVE
-- =====================================================

-- Suppression des tables si elles existent (dans l'ordre inverse des dépendances)
DROP TABLE IF EXISTS token;
DROP TABLE IF EXISTS document_fichiers;
DROP TABLE IF EXISTS pieces_fichiers;
DROP TABLE IF EXISTS document_pieces;
DROP TABLE IF EXISTS document_type_pieces;
DROP TABLE IF EXISTS td_entitee_trois;
DROP TABLE IF EXISTS td_entitee_deux;
DROP TABLE IF EXISTS td_entitee_un;
DROP TABLE IF EXISTS p_entitee_trois;
DROP TABLE IF EXISTS p_entitee_deux;
DROP TABLE IF EXISTS p_entitee_un;
DROP TABLE IF EXISTS piece_values;
DROP TABLE IF EXISTS piece_meta_fields;
DROP TABLE IF EXISTS pieces_files;
DROP TABLE IF EXISTS document_files;
DROP TABLE IF EXISTS documentvalues;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS box;
DROP TABLE IF EXISTS traves;
DROP TABLE IF EXISTS rayons;
DROP TABLE IF EXISTS salle;
DROP TABLE IF EXISTS sites;
DROP TABLE IF EXISTS typedocuments;
DROP TABLE IF EXISTS meta_fields;
DROP TABLE IF EXISTS pieces;
DROP TABLE IF EXISTS droit_permission;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS Droit;
DROP TABLE IF EXISTS agent_entitee_access;
DROP TABLE IF EXISTS Fonctions;
DROP TABLE IF EXISTS historiqueLog;
DROP TABLE IF EXISTS agent;
DROP TABLE IF EXISTS entitee_trois;
DROP TABLE IF EXISTS entitee_deux;
DROP TABLE IF EXISTS entitee_un;
DROP TABLE IF EXISTS exercice;

-- =====================================================
-- TABLES DE BASE
-- =====================================================

-- Table exercice
CREATE TABLE exercice (
    id INT AUTO_INCREMENT PRIMARY KEY,
    annee INT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table entitee_un
CREATE TABLE entitee_un (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(255),
    code VARCHAR(255),
    libelle VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table entitee_deux
CREATE TABLE entitee_deux (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(255),
    code VARCHAR(255),
    libelle VARCHAR(255),
    entitee_un_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (entitee_un_id) REFERENCES entitee_un(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table entitee_trois
CREATE TABLE entitee_trois (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    code VARCHAR(255),
    libelle VARCHAR(255),
    entitee_deux_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (entitee_deux_id) REFERENCES entitee_deux(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table Fonctions
CREATE TABLE Fonctions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    libelle VARCHAR(255) NOT NULL,
    entitee_un_id INT,
    entitee_deux_id INT,
    entitee_trois_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (entitee_un_id) REFERENCES entitee_un(id) ON DELETE SET NULL,
    FOREIGN KEY (entitee_deux_id) REFERENCES entitee_deux(id) ON DELETE SET NULL,
    FOREIGN KEY (entitee_trois_id) REFERENCES entitee_trois(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table Droit
CREATE TABLE Droit (
    id INT AUTO_INCREMENT PRIMARY KEY,
    libelle VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table permissions
CREATE TABLE permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resource VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_resource_action (resource, action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table droit_permission
CREATE TABLE droit_permission (
    droit_id INT NOT NULL,
    permission_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (droit_id, permission_id),
    FOREIGN KEY (droit_id) REFERENCES Droit(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table agent
CREATE TABLE agent (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255),
    prenom VARCHAR(255),
    num_matricule VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    telephone VARCHAR(255) UNIQUE,
    droit_id INT,
    username VARCHAR(255) UNIQUE,
    is_on_line BOOLEAN NOT NULL DEFAULT FALSE,
    last_activity DATETIME,
    code_verification VARCHAR(255),
    reset_code_expiry DATETIME,
    is_verified_for_reset BOOLEAN DEFAULT FALSE,
    photo_profil VARCHAR(255) DEFAULT '',
    fonction_id INT,
    enregistrer_par INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (droit_id) REFERENCES Droit(id) ON DELETE SET NULL,
    FOREIGN KEY (fonction_id) REFERENCES Fonctions(id) ON DELETE SET NULL,
    FOREIGN KEY (enregistrer_par) REFERENCES agent(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table token
CREATE TABLE token (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    agent_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agent(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table historiqueLog
CREATE TABLE historiqueLog (
    id INT AUTO_INCREMENT PRIMARY KEY,
    agent_id INT,
    action VARCHAR(255) NOT NULL,
    resource VARCHAR(255) NOT NULL,
    resource_id INT,
    resource_identifier VARCHAR(255),
    description TEXT,
    method VARCHAR(255) NOT NULL,
    path VARCHAR(255) NOT NULL,
    status INT NOT NULL,
    ip VARCHAR(255),
    user_agent TEXT,
    old_data JSON,
    new_data JSON,
    deleted_data JSON,
    data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agent(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table agent_entitee_access
CREATE TABLE agent_entitee_access (
    id INT AUTO_INCREMENT PRIMARY KEY,
    agent_id INT,
    entitee_un_id INT,
    entitee_deux_id INT,
    entitee_trois_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agent(id) ON DELETE CASCADE,
    FOREIGN KEY (entitee_un_id) REFERENCES entitee_un(id) ON DELETE CASCADE,
    FOREIGN KEY (entitee_deux_id) REFERENCES entitee_deux(id) ON DELETE CASCADE,
    FOREIGN KEY (entitee_trois_id) REFERENCES entitee_trois(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLES POUR LES PIÈCES
-- =====================================================

-- Table pieces
CREATE TABLE pieces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code_pieces VARCHAR(255) NOT NULL,
    libelle VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tables de liaison pièces-entités
CREATE TABLE p_entitee_un (
    id INT AUTO_INCREMENT PRIMARY KEY,
    piece_id INT,
    entitee_un_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (piece_id) REFERENCES pieces(id) ON DELETE CASCADE,
    FOREIGN KEY (entitee_un_id) REFERENCES entitee_un(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE p_entitee_deux (
    id INT AUTO_INCREMENT PRIMARY KEY,
    piece_id INT,
    entitee_deux_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (piece_id) REFERENCES pieces(id) ON DELETE CASCADE,
    FOREIGN KEY (entitee_deux_id) REFERENCES entitee_deux(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE p_entitee_trois (
    id INT AUTO_INCREMENT PRIMARY KEY,
    piece_id INT,
    entitee_trois_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (piece_id) REFERENCES pieces(id) ON DELETE CASCADE,
    FOREIGN KEY (entitee_trois_id) REFERENCES entitee_trois(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table piece_meta_fields
CREATE TABLE piece_meta_fields (
    id INT AUTO_INCREMENT PRIMARY KEY,
    piece_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    label VARCHAR(255) NOT NULL,
    field_type ENUM('text', 'date', 'file') NOT NULL,
    required BOOLEAN DEFAULT FALSE,
    position INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (piece_id) REFERENCES pieces(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table piece_values
CREATE TABLE piece_values (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id INT NOT NULL,
    piece_id INT NOT NULL,
    piece_meta_field_id INT NOT NULL,
    row_id INT,
    value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (piece_id) REFERENCES pieces(id) ON DELETE CASCADE,
    FOREIGN KEY (piece_meta_field_id) REFERENCES piece_meta_fields(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table pieces_files
CREATE TABLE pieces_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255),
    path VARCHAR(255),
    size INT,
    mimetype VARCHAR(255),
    document_id INT NOT NULL,
    pieces_value_id INT,
    pieces_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pieces_value_id) REFERENCES piece_values(id) ON DELETE SET NULL,
    FOREIGN KEY (pieces_id) REFERENCES pieces(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table pieces_fichiers
CREATE TABLE pieces_fichiers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id INT NOT NULL,
    piece_id INT,
    piece_value_id INT,
    fichier VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    new_file_name VARCHAR(255),
    mode ENUM('INDIVIDUEL', 'LOT_UNIQUE') NOT NULL DEFAULT 'INDIVIDUEL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (piece_id) REFERENCES pieces(id) ON DELETE SET NULL,
    FOREIGN KEY (piece_value_id) REFERENCES piece_values(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLES POUR LES DOCUMENTS
-- =====================================================

-- Table typedocuments
CREATE TABLE typedocuments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(255),
    nom VARCHAR(255),
    entitee_un_id INT,
    entitee_deux_id INT,
    entitee_trois_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (entitee_un_id) REFERENCES entitee_un(id) ON DELETE SET NULL,
    FOREIGN KEY (entitee_deux_id) REFERENCES entitee_deux(id) ON DELETE SET NULL,
    FOREIGN KEY (entitee_trois_id) REFERENCES entitee_trois(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tables de liaison type document-entités
CREATE TABLE td_entitee_un (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_document_id INT,
    entitee_un_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (type_document_id) REFERENCES typedocuments(id) ON DELETE CASCADE,
    FOREIGN KEY (entitee_un_id) REFERENCES entitee_un(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE td_entitee_deux (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_document_id INT,
    entitee_deux_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (type_document_id) REFERENCES typedocuments(id) ON DELETE CASCADE,
    FOREIGN KEY (entitee_deux_id) REFERENCES entitee_deux(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE td_entitee_trois (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_document_id INT,
    entitee_trois_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (type_document_id) REFERENCES typedocuments(id) ON DELETE CASCADE,
    FOREIGN KEY (entitee_trois_id) REFERENCES entitee_trois(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table meta_fields
CREATE TABLE meta_fields (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    label VARCHAR(255),
    field_type VARCHAR(255),
    required BOOLEAN,
    options JSON,
    position INT,
    type_document_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (type_document_id) REFERENCES typedocuments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table document_type_pieces
CREATE TABLE document_type_pieces (
    document_type_id INT NOT NULL,
    piece_id INT NOT NULL,
    PRIMARY KEY (document_type_id, piece_id),
    FOREIGN KEY (document_type_id) REFERENCES typedocuments(id) ON DELETE CASCADE,
    FOREIGN KEY (piece_id) REFERENCES pieces(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLES POUR L'ARCHIVAGE PHYSIQUE
-- =====================================================

-- Table sites
CREATE TABLE sites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    adresse VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table salle
CREATE TABLE salle (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code_salle VARCHAR(255) NOT NULL,
    libelle VARCHAR(255) NOT NULL,
    site_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table rayons
CREATE TABLE rayons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(255) NOT NULL,
    salle_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (salle_id) REFERENCES salle(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table traves
CREATE TABLE traves (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(255) NOT NULL,
    rayon_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (rayon_id) REFERENCES rayons(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table box
CREATE TABLE box (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code_box VARCHAR(255) NOT NULL,
    libelle VARCHAR(255) NOT NULL,
    capacite_max INT NOT NULL,
    current_count INT DEFAULT 0,
    type_document_id INT,
    trave_id INT,
    entitee_un_id INT,
    entitee_deux_id INT,
    entitee_trois_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (type_document_id) REFERENCES typedocuments(id) ON DELETE SET NULL,
    FOREIGN KEY (trave_id) REFERENCES traves(id) ON DELETE SET NULL,
    FOREIGN KEY (entitee_un_id) REFERENCES entitee_un(id) ON DELETE SET NULL,
    FOREIGN KEY (entitee_deux_id) REFERENCES entitee_deux(id) ON DELETE SET NULL,
    FOREIGN KEY (entitee_trois_id) REFERENCES entitee_trois(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLES POUR LES DOCUMENTS (SUITE)
-- =====================================================

-- Table documents
CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    box_id INT,
    type_document_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (box_id) REFERENCES box(id) ON DELETE SET NULL,
    FOREIGN KEY (type_document_id) REFERENCES typedocuments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table document_pieces
CREATE TABLE document_pieces (
    document_id INT NOT NULL,
    piece_id INT NOT NULL,
    disponible BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (document_id, piece_id),
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (piece_id) REFERENCES pieces(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table documentvalues
CREATE TABLE documentvalues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    value TEXT,
    document_id INT,
    meta_field_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (meta_field_id) REFERENCES metafields(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table document_files
CREATE TABLE document_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255),
    path VARCHAR(255),
    size INT,
    mimetype VARCHAR(255),
    document_id INT NOT NULL,
    document_value_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (document_value_id) REFERENCES documentvalues(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table document_fichiers
CREATE TABLE document_fichiers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id INT NOT NULL,
    piece_id INT,
    piece_value_id INT,
    document_value_id INT,
    fichier VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    new_file_name VARCHAR(255),
    mode ENUM('INDIVIDUEL', 'LOT_UNIQUE') NOT NULL DEFAULT 'INDIVIDUEL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (piece_id) REFERENCES pieces(id) ON DELETE SET NULL,
    FOREIGN KEY (piece_value_id) REFERENCES piece_values(id) ON DELETE SET NULL,
    FOREIGN KEY (document_value_id) REFERENCES documentvalues(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- CRÉATION DES INDEX POUR OPTIMISATION
-- =====================================================

-- Index pour agent
CREATE INDEX idx_agent_email ON agent(email);
CREATE INDEX idx_agent_username ON agent(username);
CREATE INDEX idx_agent_droit_id ON agent(droit_id);
CREATE INDEX idx_agent_fonction_id ON agent(fonction_id);

-- Index pour les entités
CREATE INDEX idx_entitee_deux_un_id ON entitee_deux(entitee_un_id);
CREATE INDEX idx_entitee_trois_deux_id ON entitee_trois(entitee_deux_id);

-- Index pour les fonctions
CREATE INDEX idx_fonctions_entitee_un_id ON Fonctions(entitee_un_id);
CREATE INDEX idx_fonctions_entitee_deux_id ON Fonctions(entitee_deux_id);
CREATE INDEX idx_fonctions_entitee_trois_id ON Fonctions(entitee_trois_id);

-- Index pour l'historique
CREATE INDEX idx_historique_agent_id ON historiqueLog(agent_id);
CREATE INDEX idx_historique_action ON historiqueLog(action);
CREATE INDEX idx_historique_resource ON historiqueLog(resource);
CREATE INDEX idx_historique_created_at ON historiqueLog(created_at);

-- Index pour agent_entitee_access
CREATE INDEX idx_agent_access_agent_id ON agent_entitee_access(agent_id);
CREATE INDEX idx_agent_access_entitee_un ON agent_entitee_access(entitee_un_id);
CREATE INDEX idx_agent_access_entitee_deux ON agent_entitee_access(entitee_deux_id);
CREATE INDEX idx_agent_access_entitee_trois ON agent_entitee_access(entitee_trois_id);

-- Index pour les documents
CREATE INDEX idx_documents_box_id ON documents(box_id);
CREATE INDEX idx_documents_type_document_id ON documents(type_document_id);
CREATE INDEX idx_documents_created_at ON documents(created_at);

-- Index pour documentvalues
CREATE INDEX idx_docvalues_document_id ON documentvalues(document_id);
CREATE INDEX idx_docvalues_meta_field_id ON documentvalues(meta_field_id);

-- Index pour box
CREATE INDEX idx_box_trave_id ON box(trave_id);
CREATE INDEX idx_box_type_document_id ON box(type_document_id);
CREATE INDEX idx_box_entitee_un_id ON box(entitee_un_id);
CREATE INDEX idx_box_entitee_deux_id ON box(entitee_deux_id);
CREATE INDEX idx_box_entitee_trois_id ON box(entitee_trois_id);

-- Index pour typedocuments
CREATE INDEX idx_typedocuments_entitee_un_id ON typedocuments(entitee_un_id);
CREATE INDEX idx_typedocuments_entitee_deux_id ON typedocuments(entitee_deux_id);
CREATE INDEX idx_typedocuments_entitee_trois_id ON typedocuments(entitee_trois_id);

-- Index pour les pièces
CREATE INDEX idx_piece_values_document_id ON piece_values(document_id);
CREATE INDEX idx_piece_values_piece_id ON piece_values(piece_id);
CREATE INDEX idx_piece_values_meta_field_id ON piece_values(piece_meta_field_id);
CREATE INDEX idx_piece_meta_fields_piece_id ON piece_meta_fields(piece_id);

-- Index pour les fichiers
CREATE INDEX idx_document_fichiers_document_id ON document_fichiers(document_id);
CREATE INDEX idx_document_fichiers_piece_id ON document_fichiers(piece_id);
CREATE INDEX idx_pieces_fichiers_document_id ON pieces_fichiers(document_id);
CREATE INDEX idx_pieces_fichiers_piece_id ON pieces_fichiers(piece_id);