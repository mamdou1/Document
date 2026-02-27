import React, { useState, useEffect, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
// import { Toast } from "primereact/toast";
import {
  UserPlus,
  Save,
  Building2,
  Layers,
  GitMerge,
  Briefcase,
  Mail,
  Phone,
  User as UserIcon,
  Fingerprint,
  Camera,
} from "lucide-react";
import type {
  EntiteeTrois,
  EntiteeDeux,
  EntiteeUn,
  Fonction,
  Droit,
  User,
} from "../../interfaces";
import { getAllEntiteeUn } from "../../api/entiteeUn";
import { getAllEntiteeDeux } from "../../api/entiteeDeux";
import { getAllEntiteeTrois } from "../../api/entiteeTrois";
import { getEntiteeDeuxByEntiteeUn } from "../../api/entiteeDeux";
import { getEntiteeTroisByEntiteeDeux } from "../../api/entiteeTrois";
import { getFunctionsByEntiteeUn } from "../../api/entiteeUn";
import { getFunctionsByEntiteeDeux } from "../../api/entiteeDeux";
import { getFunctionsByEntiteeTrois } from "../../api/entiteeTrois";

type Props = {
  visible: boolean;
  onHide: () => void;
  onSubmit: (data: Partial<User>, photoFile?: File) => Promise<void>;
  refresh: () => void;
  initial?: Partial<User>;
  title?: string;
  droits: Droit[];
};

// const roleOptions: Role[] = ["ADMIN", "MEMBRE", "MEMBRE_AUTHORIZE"];

export default function UserForm({
  visible,
  onHide,
  onSubmit,
  refresh,
  initial = {},
  title = "Fiche Agent",
  droits,
}: Props) {
  // --- États des champs (Indépendants comme LiquidationForm) ---
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [numMatricule, setNumMatricule] = useState("");

  // const [droitId, setDroitId] = useState<number | undefined>(
  //   initial.droit_id ??
  //     (typeof initial.droit === "object" ? initial.droit.id : droits[0]?.id),
  // );

  const [droit, setDroit] = useState<Droit | string>(
    initial.droit || droits[0]?.id || "",
  );

  // États d'affectation
  const [entitee_un_id, setEntitee_un_id] = useState<number | undefined>();
  const [entitee_deux_id, setEntitee_deux_id] = useState<number | undefined>();
  const [entitee_trois_id, setEntitee_trois_id] = useState<
    number | undefined
  >();
  const [fonctionId, setFonctionId] = useState<number | undefined>();

  // États des listes et UI
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [allEntiteeUn, setAllEntiteeUn] = useState<EntiteeUn[]>([]);
  const [allEntiteeDeux, setAllEntiteeDeux] = useState<EntiteeDeux[]>([]);
  const [allEntiteeTrois, setAllEntiteeTrois] = useState<EntiteeTrois[]>([]);

  const [titreEntiteeDeux, setTitreEntiteeDeux] = useState<EntiteeDeux[]>([]);
  const [titreEntiteeTrois, setTitreEntiteeTrois] = useState<EntiteeTrois[]>(
    [],
  );
  const [fonctions, setFonctions] = useState<Fonction[]>([]);
  // const toast = useRef<Toast>(null);

  // --- Initialisation au montage/ouverture ---
  useEffect(() => {
    const fetchInitialData = async () => {
      const [srvs, ent2, ent3] = await Promise.all([
        getAllEntiteeUn(),
        getAllEntiteeDeux(),
        getAllEntiteeTrois(),
      ]);
      setAllEntiteeUn(Array.isArray(srvs) ? srvs : []);
      setTitreEntiteeDeux(Array.isArray(ent2) ? ent2 : []);
      setTitreEntiteeTrois(Array.isArray(ent3) ? ent3 : []);
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (visible) {
      setNom(initial.nom || "");
      setPrenom(initial.prenom || "");
      setEmail(initial.email || "");
      setTelephone(initial.telephone || "");
      setNumMatricule(initial.num_matricule || "");
      setPhotoFile(null);

      // Gestion ID Droit
      setDroit(initial.droit || droits[0]?.id || "");

      // Gestion ID Fonction
      const initFonction =
        initial.fonction_details && typeof initial.fonction_details === "object"
          ? (initial.fonction_details as any).id
          : initial.fonction_details;

      //console.log(initFonction);

      setFonctionId(
        typeof initFonction === "number" ? initFonction : undefined,
      );
    }
  }, [visible, droits]);

  // --- Handlers de changement (Logique de cascade) ---
  const handleEntiteeUnChange = async (id: number) => {
    setEntitee_un_id(id);
    setEntitee_deux_id(undefined);
    setEntitee_trois_id(undefined);
    setFonctionId(undefined);

    const [divs, funcs] = await Promise.all([
      getEntiteeDeuxByEntiteeUn(id),
      getFunctionsByEntiteeUn(id),
    ]);
    setAllEntiteeDeux(Array.isArray(divs) ? divs : []);
    setFonctions(Array.isArray(funcs) ? funcs : []);
    setAllEntiteeTrois([]);
  };

  const handleEntiteeDeuxChange = async (id: number) => {
    setEntitee_deux_id(id);
    setEntitee_trois_id(undefined);
    setFonctionId(undefined);

    const [secs, funcs] = await Promise.all([
      getEntiteeTroisByEntiteeDeux(id),
      getFunctionsByEntiteeDeux(id),
    ]);
    setAllEntiteeTrois(Array.isArray(secs) ? secs : []);
    setFonctions(Array.isArray(funcs) ? funcs : []);
  };

  const handleEntiteeTroisChange = async (id: number) => {
    setEntitee_trois_id(id);
    setFonctionId(undefined);
    const funcs = await getFunctionsByEntiteeTrois(id);
    setFonctions(funcs);
  };

  // ✅ Vérifier si les titres existent
  const titreUnExiste = allEntiteeUn.length > 0 && allEntiteeUn[0]?.titre;
  const titreDeuxExiste =
    titreEntiteeDeux.length > 0 && titreEntiteeDeux[0]?.titre;
  const titreTroisExiste =
    titreEntiteeTrois.length > 0 && titreEntiteeTrois[0]?.titre;

  const titreUn = allEntiteeUn[0]?.titre || "Entité 1";
  const titreDeux = titreEntiteeDeux[0]?.titre || "Entité 2";
  const titreTrois = titreEntiteeTrois[0]?.titre || "Entité 3";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // On ne garde que ce qui est défini dans l'interface User
    const payload: Partial<User> = {
      nom,
      prenom,
      email,
      telephone,
      num_matricule: numMatricule,
      droit: typeof droit === "object" ? (droit as any).id : droit,
      fonction: fonctionId, // C'est cet ID qui lie l'utilisateur aux entités via la table Fonction
    };

    // --- LOGS DE DEBUG ---
    console.log("🚀 Tentative de création d'agent...");
    console.table(payload);
    console.log("📸 Photo :", photoFile ? photoFile.name : "Aucune");

    try {
      // On envoie le payload propre au onSubmit
      await onSubmit(payload, photoFile || undefined);
      console.log("✅ Agent créé avec succès !");
      refresh();
    } catch (error: any) {
      console.error("❌ ÉCHEC de la création :");
      if (error.response) {
        console.log("Détails du serveur :", error.response.data);
      } else {
        console.log("Message d'erreur :", error.message);
      }
    }
  };

  const labelClass =
    "flex items-center gap-2 text-sm font-bold text-slate-700 mb-2";
  const inputClass =
    "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-emerald-900 font-medium";
  // const iconStyle =
  //   "text-slate-400 group-focus-within:text-emerald-500 transition-colors";

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2 text-emerald-900 font-bold">
          <UserPlus size={20} className="text-emerald-500" />
          <span>{title}</span>
        </div>
      }
      visible={visible}
      style={{ width: "900px" }}
      onHide={onHide}
      draggable={false}
      className="rounded-3xl"
    >
      <form onSubmit={handleSubmit} className="pt-4 grid grid-cols-2 gap-6">
        {/* Colonne Gauche: Identité (inchangée) */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest border-b pb-2">
            Identité
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="group">
              <label className={labelClass}>
                <UserIcon size={14} /> Nom
              </label>
              <InputText
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="group">
              <label className={labelClass}>
                <UserIcon size={14} /> Prénom
              </label>
              <InputText
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="group">
            <label className={labelClass}>
              <Fingerprint size={14} /> Matricule
            </label>
            <InputText
              value={numMatricule}
              onChange={(e) => setNumMatricule(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Profil <span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={droit}
              options={droits.map((x) => ({ label: x.libelle, value: x.id }))}
              onChange={(e) => setDroit(e.value)}
              placeholder="Choisir type d'accréditation"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="group">
            <label className={labelClass}>
              <Mail size={14} /> Email
            </label>
            <InputText
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="group">
              <label className={labelClass}>
                <Phone size={14} /> Téléphone
              </label>
              <InputText
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Photo de profil</label>
            <div className="flex items-center gap-3 p-4 bg-emerald-50/50 border-2 border-dashed border-emerald-200 rounded-xl">
              <Camera className="text-emerald-500" size={24} />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-500 file:text-white cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Colonne Droite: Affectation - AVEC CONDITIONS D'AFFICHAGE */}
        <div className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
          <h3 className="text-xs font-black uppercase text-emerald-500 tracking-widest border-b border-emerald-100 pb-2">
            Affectation
          </h3>

          {/* Niveau 1 - S'affiche uniquement si le titre existe */}
          {titreUnExiste && (
            <div>
              <label className={labelClass}>
                <Building2 size={14} className="text-emerald-500" /> {titreUn}
              </label>
              <Dropdown
                value={entitee_un_id}
                options={allEntiteeUn}
                optionLabel="libelle"
                optionValue="id"
                onChange={(e) => handleEntiteeUnChange(Number(e.value))}
                placeholder={`Sélectionner ${titreUn}`}
                className="w-full rounded-xl"
                filter
              />
            </div>
          )}

          {/* Niveau 2 - S'affiche uniquement si le titre existe */}
          {titreDeuxExiste && (
            <div>
              <label className={labelClass}>
                <Layers size={14} className="text-emerald-500" /> {titreDeux}
              </label>
              <Dropdown
                value={entitee_deux_id}
                options={allEntiteeDeux}
                optionLabel="libelle"
                optionValue="id"
                onChange={(e) => handleEntiteeDeuxChange(Number(e.value))}
                placeholder={`Sélectionner ${titreDeux}`}
                className="w-full rounded-xl"
                disabled={titreUnExiste ? !entitee_un_id : false}
                filter
              />
            </div>
          )}

          {/* Niveau 3 - S'affiche uniquement si le titre existe */}
          {titreTroisExiste && (
            <div>
              <label className={labelClass}>
                <GitMerge size={14} className="text-orange-500" /> {titreTrois}
              </label>
              <Dropdown
                value={entitee_trois_id}
                options={allEntiteeTrois}
                optionLabel="libelle"
                optionValue="id"
                onChange={(e) => handleEntiteeTroisChange(Number(e.value))}
                placeholder={`Sélectionner ${titreTrois}`}
                className="w-full rounded-xl"
                disabled={titreDeuxExiste ? !entitee_deux_id : false}
                filter
              />
            </div>
          )}

          {/* Fonction - S'affiche toujours mais s'adapte */}
          <div>
            <label className={labelClass}>
              <Briefcase size={14} className="text-purple-500" /> Fonction /
              Poste
            </label>
            <Dropdown
              value={fonctionId}
              options={fonctions}
              optionLabel="libelle"
              optionValue="id"
              onChange={(e) => setFonctionId(Number(e.value))}
              placeholder="Attribuer une fonction"
              className="w-full rounded-xl border-emerald-500 border-2"
              disabled={titreUnExiste ? !entitee_un_id : false}
              filter
            />
          </div>

          {/* Message si aucune entité n'existe */}
          {!titreUnExiste && !titreDeuxExiste && !titreTroisExiste && (
            <div className="p-6 bg-slate-100 rounded-xl text-center">
              <p className="text-sm text-slate-500 italic">
                Aucune entité disponible pour l'affectation
              </p>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="col-span-2 flex justify-end gap-3 pt-6 mt-4 border-t border-slate-100">
          <Button
            type="button"
            label="Annuler"
            onClick={onHide}
            className="p-button-text text-slate-500 font-bold"
          />
          <Button
            type="submit"
            label="Enregistrer l'agent"
            icon={<Save size={18} className="mr-2" />}
            className="bg-emerald-600 text-white font-bold px-10 py-3 rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all"
          />
        </div>
      </form>
    </Dialog>
  );
}
