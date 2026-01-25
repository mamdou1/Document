// import React, { useEffect, useState } from "react";
// import { Dialog } from "primereact/dialog";
// import { InputText } from "primereact/inputtext";
// import { Button } from "primereact/button";
// import { Dropdown } from "primereact/dropdown";
// import { Toast } from "primereact/toast";
// import type {
//   Service,
//   Division,
//   Section,
//   Fonction,
//   Droit,
//   User,
//   Role,
// } from "../../interfaces";
// import {
//   Save,
//   X,
//   User as UserIcon,
//   Mail,
//   Phone,
//   Briefcase,
//   Hash,
//   Camera,
//   Layers,
//   LayoutList,
//   ToyBrick,
//   ListCheck,
//   UserPlus,
//   Building2,
//   GitMerge,
//   Fingerprint,
// } from "lucide-react";
// import { getAllServices } from "../../api/service";
// import {
//   getDivisionsByService,
//   getFunctionsByDivision,
// } from "../../api/division";
// import {
//   getSectionsByDivision,
//   getFunctionsBySection,
// } from "../../api/section";
// import { getFunctionsByService } from "../../api/service"; // Assurez-vous d'avoir ces exports

// type Props = {
//   visible: boolean;
//   onHide: () => void;
//   onSubmit: (data: Partial<User>, photoFile?: File) => Promise<void>;
//   initial?: Partial<User>;
//   title?: string;
//   droits: Droit[];
//   services: Service[];
//   divisions: Division[];
//   sections: Section[];
//   fonction: Fonction[];
// };

// const roleOptions: Role[] = ["ADMIN", "MEMBRE", "MEMBRE_AUTHORIZE"];

// export default function UserForm({
//   visible,
//   onHide,
//   onSubmit,
//   initial = {},
//   title = "Créer un utilisateur",
//   droits,
//   services,
//   divisions,
//   sections,
//   fonction,
// }: Props) {
// const [droit, setDroit] = useState<Droit | string>(
//   initial.droit || droits[0]?.id || ""
// );
//   const [fonction_id, setFonction_id] = useState<number>(
//     initial.fonction_id || services[0]?.id || 0
//   );
//   // const [service_id, setService_id] = useState<number>(
//   //   initial.service_id || service[0]?.id || 0
//   // );
//   // const [service_id, setService_id] = useState<number>(
//   //   initial.service_id || service[0]?.id || 0
//   // );
//   // const [service_id, setService_id] = useState<number>(
//   //   initial.service_id || service[0]?.id || 0
//   // );
//   const [nom, setNom] = useState(initial.nom || "");
//   const [prenom, setPrenom] = useState(initial.prenom || "");
//   // const [fonction, setFonction] = useState(initial.fonction || "");
//   const [email, setEmail] = useState(initial.email || "");
//   const [telephone, setTelephone] = useState(initial.telephone || "");

//   const [num_matricule, setNum_matricule] = useState(
//     initial.num_matricule || ""
//   );
//   const [role, setRole] = useState(initial.role || "MEMBRE");
//   const [loading, setLoading] = useState(false);
// const [photoFile, setPhotoFile] = useState<File | null>(null);

//   // const [service, setService] = useState(initial.service || "");
//   // const [division, setDivision] = useState(initial.division || "");
//   // const [section, setSection] = useState(initial.section || "");

//   useEffect(() => {
//     if (visible) {
// setDroit(initial.droit || droits[0]?.id || "");
//       setNom(initial.nom || "");
//       setPrenom(initial.prenom || "");
//       //setFonction(initial.fonction || "");
//       setEmail(initial.email || "");
//       setTelephone(initial.telephone || "");
//       setRole(initial.role || "MEMBRE");
//       setNum_matricule(initial.num_matricule || "");
//       setPhotoFile(null);
//     }
//   }, [visible]);

//   const handle = async () => {
//     setLoading(true);
//     try {
//       await onSubmit(
//         {
//           droit,
//           nom,
//           prenom,
//           //fonction,
//           email,
//           telephone,
//           role,
//           num_matricule,
//         },
//         photoFile || undefined
//       );
//       //onHide();
//     } finally {
//       setLoading(false);
//     }
//   };

// const labelStyle =
//   "flex items-center gap-2 text-sm font-bold text-slate-700 mb-2";
// const inputContainer = "relative group";
// const inputStyle =
//   "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-blue-900 font-medium pr-10";
// const iconStyle =
//   "absolute right-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors";

//   return (
//     <Dialog
//       header={<div className="text-blue-900 font-bold">{title}</div>}
//       visible={visible}
//       style={{ width: "650px" }}
//       onHide={onHide}
//       draggable={false}
//       className="custom-dialog"
//     >
//       <div className="pt-4 space-y-5">
//         {/* Row 1: Prénom & Nom */}
//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <label className={labelStyle}>
//               Prénom <span className="text-red-500">*</span>
//             </label>
//             <div className={inputContainer}>
//               <InputText
//                 value={prenom}
//                 onChange={(e) => setPrenom(e.target.value)}
//                 className={inputStyle}
//                 placeholder="Prénom"
//               />
//               <UserIcon className={iconStyle} size={18} />
//             </div>
//           </div>
//           <div>
//             <label className={labelStyle}>
//               Nom <span className="text-red-500">*</span>
//             </label>
//             <div className={inputContainer}>
//               <InputText
//                 value={nom}
//                 onChange={(e) => setNom(e.target.value)}
//                 className={inputStyle}
//                 placeholder="Nom"
//               />
//               <UserIcon className={iconStyle} size={18} />
//             </div>
//           </div>
//         </div>

//         {/* Row 1: Prénom & Nom */}
//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <label className={labelStyle}>
//               Droit / Permission <span className="text-red-500">*</span>
//             </label>
//             <Dropdown
//               value={droit}
//               options={droits.map((x) => ({
//                 label: ` ${x.libelle}`,
//                 value: x.id,
//               }))}
//               onChange={(e) => setDroit(e.value)}
//               placeholder="Choisir type d'accréditation"
//               className="w-full bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10"
//             />
//           </div>
//         </div>

//         {/* Row 2: Email & Téléphone */}
//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <label className={labelStyle}>
//               Email <span className="text-red-500">*</span>
//             </label>
//             <div className={inputContainer}>
//               <InputText
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className={inputStyle}
//                 placeholder="exemple@mail.com"
//               />
//               <Mail className={iconStyle} size={18} />
//             </div>
//           </div>
//           <div>
//             <label className={labelStyle}>
//               Téléphone <span className="text-red-500">*</span>
//             </label>
//             <div className={inputContainer}>
//               <InputText
//                 value={telephone}
//                 onChange={(e) => setTelephone(e.target.value)}
//                 className={inputStyle}
//                 placeholder="+223..."
//               />
//               <Phone className={iconStyle} size={18} />
//             </div>
//           </div>
//         </div>

//         {/* Row 3: Fonction & Rôle */}
//         <div className="grid grid-cols-2 gap-4">
//           {/* <div>
//             <label className={labelStyle}>
//               Fonction <span className="text-red-500">*</span>
//             </label>
//             <div className={inputContainer}>
//               <InputText
//                 value={fonction}
//                 onChange={(e) => setFonction(e.target.value)}
//                 className={inputStyle}
//                 placeholder="Ex: Comptable"
//               />
//               <Briefcase className={iconStyle} size={18} />
//             </div>
//           </div> */}
// <div>
//   <label className={labelStyle}>
//     Rôle <span className="text-red-500">*</span>
//   </label>
//   <div className="relative">
//     <Dropdown
//       value={role}
//       options={roleOptions}
//       onChange={(e) => setRole(e.value)}
//       className="w-full bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10"
//       placeholder="Sélectionner"
//     />
//   </div>
// </div>
//         </div>

//         {/* Row 4: Service & Matricule */}
//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <label className={labelStyle}>N° Matricule</label>
//             <div className={inputContainer}>
//               <InputText
//                 value={num_matricule}
//                 onChange={(e) => setNum_matricule(e.target.value)}
//                 className={inputStyle}
//                 placeholder="Code matricule"
//               />
//               <Hash className={iconStyle} size={18} />
//             </div>
//           </div>
//         </div>

//         {/* Row 5: Service & Division & Section */}
//         {/* <div className="grid grid-cols-2 gap-4">
//           <div>
//             <label className={labelStyle}>
//               Service <span className="text-red-500">*</span>
//             </label>
//             <div className={inputContainer}>
//               <InputText
//                 value={service}
//                 onChange={(e) => setService(e.target.value)}
//                 className={inputStyle}
//                 placeholder="ministère de modernisation ..."
//               />
//               <LayoutList className={iconStyle} size={18} />
//             </div>
//           </div>
//           <div>
//             <label className={labelStyle}>
//               Division <span className="text-red-500">*</span>
//             </label>
//             <div className={inputContainer}>
//               <InputText
//                 value={division}
//                 onChange={(e) => setDivision(e.target.value)}
//                 className={inputStyle}
//                 placeholder="Acquisition"
//               />
//               <ToyBrick className={iconStyle} size={18} />
//             </div>
//           </div>
//           <div>
//             <label className={labelStyle}>
//               Section <span className="text-red-500">*</span>
//             </label>
//             <div className={inputContainer}>
//               <InputText
//                 value={section}
//                 onChange={(e) => setSection(e.target.value)}
//                 className={inputStyle}
//                 placeholder="Matériel"
//               />
//               <ListCheck className={iconStyle} size={18} />
//             </div>
//           </div>
//         </div> */}

//         {/* Photo Upload */}
// <div>
//   <label className={labelStyle}>Photo de profil</label>
//   <div className="flex items-center gap-3 p-4 bg-blue-50/50 border-2 border-dashed border-blue-200 rounded-xl">
//     <Camera className="text-blue-500" size={24} />
//     <input
//       type="file"
//       accept="image/*"
//       onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
//       className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-500 file:text-white hover:file:bg-blue-600 cursor-pointer"
//     />
//   </div>
// </div>

//         {/* Action Buttons */}
//         <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
//           <Button
//             label="Annuler"
//             icon={<X size={18} className="mr-2" />}
//             onClick={onHide}
//             className="p-button-text text-slate-500 hover:text-slate-800 font-semibold py-2 px-4 rounded-xl transition-colors"
//           />
//           <Button
//             label={loading ? "Enregistrement..." : "Enregistrer l'utilisateur"}
//             icon={!loading && <Save size={18} className="mr-2" />}
//             disabled={loading}
//             onClick={handle}
//             className="bg-blue-600 text-white font-bold py-2 px-6 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-200 transition-all active:scale-95"
//           />
//         </div>
//       </div>
//     </Dialog>
//   );
// }

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
