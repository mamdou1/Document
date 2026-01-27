import React, { useState, useEffect, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
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
  Service,
  Division,
  Section,
  Fonction,
  Droit,
  User,
  Role,
} from "../../interfaces";
import { getAllServices } from "../../api/service";
import { getDivisionsByService } from "../../api/division";
import { getSectionsByDivision } from "../../api/section";
import { getFunctionsByService } from "../../api/service";
import { getFunctionsBySection } from "../../api/section";

import { getFunctionsByDivision } from "../../api/division";

type Props = {
  visible: boolean;
  onHide: () => void;
  onSubmit: (data: Partial<User>, photoFile?: File) => Promise<void>;
  initial?: Partial<User>;
  title?: string;
  droits: Droit[];
};

const roleOptions: Role[] = ["ADMIN", "MEMBRE", "MEMBRE_AUTHORIZE"];

export default function UserForm({
  visible,
  onHide,
  onSubmit,
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
  const [role, setRole] = useState<Role>("MEMBRE");

  // const [droitId, setDroitId] = useState<number | undefined>(
  //   initial.droit_id ??
  //     (typeof initial.droit === "object" ? initial.droit.id : droits[0]?.id),
  // );

  const [droit, setDroit] = useState<Droit | string>(
    initial.droit || droits[0]?.id || "",
  );

  // États d'affectation
  const [serviceId, setServiceId] = useState<number | undefined>();
  const [divisionId, setDivisionId] = useState<number | undefined>();
  const [sectionId, setSectionId] = useState<number | undefined>();
  const [fonctionId, setFonctionId] = useState<number | undefined>();

  // États des listes et UI
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [fonctions, setFonctions] = useState<Fonction[]>([]);
  const toast = useRef<Toast>(null);

  // --- Initialisation au montage/ouverture ---
  useEffect(() => {
    const fetchInitialData = async () => {
      const srvs = await getAllServices();
      setServices(Array.isArray(srvs) ? srvs : []);
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
      setRole(initial.role || "MEMBRE");
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
  const handleServiceChange = async (id: number) => {
    setServiceId(id);
    setDivisionId(undefined);
    setSectionId(undefined);
    setFonctionId(undefined);

    const [divs, funcs] = await Promise.all([
      getDivisionsByService(id),
      getFunctionsByService(id),
    ]);
    setDivisions(Array.isArray(divs) ? divs : []);
    setFonctions(Array.isArray(funcs) ? funcs : []);
    setSections([]);
  };

  const handleDivisionChange = async (id: number) => {
    setDivisionId(id);
    setSectionId(undefined);
    setFonctionId(undefined);

    const [secs, funcs] = await Promise.all([
      getSectionsByDivision(id),
      getFunctionsByDivision(id),
    ]);
    setSections(Array.isArray(secs) ? secs : []);
    setFonctions(Array.isArray(funcs) ? funcs : []);
  };

  const handleSectionChange = async (id: number) => {
    setSectionId(id);
    setFonctionId(undefined);
    const funcs = await getFunctionsBySection(id);
    setFonctions(funcs);
  };

  // --- Soumission ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<User> = {
      nom,
      prenom,
      email,
      telephone,
      num_matricule: numMatricule,
      role,
      droit,

      fonction: fonctionId,
      // @ts-ignore (Si vous gérez les IDs d'affectation dans votre interface User)
      service_id: serviceId,
      division_id: divisionId,
      section_id: sectionId,
    };

    await onSubmit(payload, photoFile || undefined);
    ////onHide();
  };

  const labelClass =
    "flex items-center gap-2 text-sm font-bold text-slate-700 mb-2";
  const inputClass =
    "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-blue-900 font-medium";
  const iconStyle =
    "text-slate-400 group-focus-within:text-blue-500 transition-colors";

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2 text-blue-900 font-bold">
          <UserPlus size={20} className="text-blue-500" />
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
        {/* Colonne Gauche: Identité */}
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
            <div>
              <label className={labelClass}>
                Rôle <span className="text-red-500">*</span>
              </label>
              <Dropdown
                value={role}
                options={roleOptions}
                onChange={(e) => setRole(e.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Photo de profil</label>
            <div className="flex items-center gap-3 p-4 bg-blue-50/50 border-2 border-dashed border-blue-200 rounded-xl">
              <Camera className="text-blue-500" size={24} />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-500 file:text-white cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Colonne Droite: Affectation */}
        <div className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
          <h3 className="text-xs font-black uppercase text-blue-500 tracking-widest border-b border-blue-100 pb-2">
            Affectation
          </h3>

          <div>
            <label className={labelClass}>
              <Building2 size={14} className="text-blue-500" /> Service
            </label>
            <Dropdown
              value={serviceId}
              options={services}
              optionLabel="libelle"
              optionValue="id"
              onChange={(e) => handleServiceChange(Number(e.value))}
              placeholder="Sélectionner Service"
              className="w-full rounded-xl"
              filter
            />
          </div>

          <div>
            <label className={labelClass}>
              <Layers size={14} className="text-emerald-500" /> Division
            </label>
            <Dropdown
              value={divisionId}
              options={divisions}
              optionLabel="libelle"
              optionValue="id"
              onChange={(e) => handleDivisionChange(Number(e.value))}
              placeholder="Sélectionner Division"
              className="w-full rounded-xl"
              disabled={!serviceId}
              filter
            />
          </div>

          <div>
            <label className={labelClass}>
              <GitMerge size={14} className="text-orange-500" /> Section
            </label>
            <Dropdown
              value={sectionId}
              options={sections}
              optionLabel="libelle"
              optionValue="id"
              onChange={(e) => handleSectionChange(Number(e.value))}
              placeholder="Sélectionner Section"
              className="w-full rounded-xl"
              disabled={!divisionId}
              filter
            />
          </div>

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
              className="w-full rounded-xl border-blue-500 border-2"
              disabled={!serviceId}
              filter
            />
          </div>
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
            className="bg-blue-600 text-white font-bold px-10 py-3 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
          />
        </div>
      </form>
    </Dialog>
  );
}
