// import React, { useEffect, useState } from "react";
// import { Dialog } from "primereact/dialog";
// import { InputText } from "primereact/inputtext";
// import { Button } from "primereact/button";
// import {
//   FileText,
//   Save,
//   Hash,
//   Layers,
//   Building2,
//   GitMerge,
// } from "lucide-react";
// import { Dropdown } from "primereact/dropdown";

// import type { EntiteeTrois, EntiteeDeux, EntiteeUn } from "../../interfaces";
// import { getAllEntiteeUn } from "../../api/entiteeUn";
// import { getEntiteeDeuxByEntiteeUn } from "../../api/entiteeDeux";
// import { getEntiteeTroisByEntiteeDeux } from "../../api/entiteeTrois";

// export default function DocumentTypeForm({
//   visible,
//   onHide,
//   onSubmit,
//   initial = {},
//   title = "Créer type document",
// }: any) {
//   const [code, setCode] = useState("");
//   const [nom, setNom] = useState("");
//   const [loading, setLoading] = useState(false);

//   // États d'affectation
//   const [entitee_un_id, setEntitee_un_id] = useState<number | undefined>();
//   const [entitee_deux_id, setEntitee_deux_id] = useState<number | undefined>();
//   const [entitee_trois_id, setEntitee_trois_id] = useState<
//     number | undefined
//   >();

//   const [allEntiteeUn, setAllEntiteeUn] = useState<EntiteeUn[]>([]);
//   const [allEntiteeDeux, setAllEntiteeDeux] = useState<EntiteeDeux[]>([]);
//   const [allEntiteeTrois, setAllEntiteeTrois] = useState<EntiteeTrois[]>([]);

// useEffect(() => {
//   const fetchInitialData = async () => {
//     const srvs = await getAllEntiteeUn();
//     setAllEntiteeUn(Array.isArray(srvs) ? srvs : []);
//   };
//   fetchInitialData();
// }, []);

// useEffect(() => {
//   const loadEditData = async () => {
//     if (visible && initial?.id) {
//       setCode(initial.code || "");
//       setNom(initial.nom || "");

//       // 1. Initialiser les IDs
//       setEntitee_un_id(initial.entitee_un?.id);
//       setEntitee_deux_id(initial.entitee_deux?.id);
//       setEntitee_trois_id(initial.entitee_trois?.id);

//       // 2. Charger les listes en cascade pour l'affichage
//       if (initial.entitee_un?.id) {
//         const divs = await getEntiteeDeuxByEntiteeUn(initial.entitee_un.id);
//         setAllEntiteeDeux(Array.isArray(divs) ? divs : []);
//       }
//       if (initial.entitee_deux?.id) {
//         const secs = await getEntiteeTroisByEntiteeDeux(
//           initial.entitee_deux.id,
//         );
//         setAllEntiteeTrois(Array.isArray(secs) ? secs : []);
//       }
//     } else if (visible) {
//       // Reset pour création
//       setCode("");
//       setNom("");
//       setEntitee_un_id(undefined);
//       setEntitee_deux_id(undefined);
//       setEntitee_trois_id(undefined);
//       setAllEntiteeDeux([]);
//       setAllEntiteeTrois([]);
//     }
//   };
//   loadEditData();
// }, [visible, initial]);

//   // --- Handlers de changement (Logique de cascade) ---
// const handleEntiteeUnChange = async (id: number) => {
//   setEntitee_un_id(id);
//   setEntitee_deux_id(undefined);
//   setEntitee_trois_id(undefined);

//   const divs = await getEntiteeDeuxByEntiteeUn(id);
//   setAllEntiteeDeux(Array.isArray(divs) ? divs : []);
//   setAllEntiteeTrois([]);
// };

// const handleEntiteeDeuxChange = async (id: number) => {
//   setEntitee_deux_id(id);
//   setEntitee_trois_id(undefined);

//   const secs = await getEntiteeTroisByEntiteeDeux(id);
//   setAllEntiteeTrois(Array.isArray(secs) ? secs : []);
// };

//   const handleEntiteeTroisChange = (id: number) => {
//     setEntitee_trois_id(id);
//   };

//   const titreUn = allEntiteeUn[0]?.titre || "Entité 1";
//   const titreDeux = allEntiteeDeux[0]?.titre || "Entité 2";
//   const titreTrois = allEntiteeTrois[0]?.titre || "Entité 3";

//   const handleSubmit = async () => {
//     // Validation minimale : il faut au moins le nom, le code et la première entité
//     if (!nom || !code || !entitee_un_id) return;

//     setLoading(true);
//     try {
//       // LOGIQUE : On prend l'ID le plus bas dans la hiérarchie
//       // Si l'entité 3 est choisie, c'est elle. Sinon la 2, sinon la 1.
//       const cibleId = entitee_trois_id || entitee_deux_id || entitee_un_id;
//       console.log("l'entitee ID:", cibleId);

//       await onSubmit({
//         code,
//         nom,
//         // On envoie tous les IDs pour la traçabilité (optionnel selon ton backend)
//         entitee_un_id,
//         entitee_deux_id,
//         entitee_trois_id,
//         // Et on précise quelle est l'entité cible finale
//         entitee_cible_id: cibleId,
//       });
//       onHide();
//     } catch (error) {
//       console.error("Erreur lors de la sauvegarde", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const labelClass =
//     "flex items-center gap-2 text-sm font-bold text-slate-700 mb-2";
//   const inputClass =
//     "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-emerald-900 font-medium";

//   return (
//     <Dialog
//       header={
//         <div className="text-2xl font-black text-slate-800 p-2">{title}</div>
//       }
//       visible={visible}
//       style={{ width: 900 }}
//       onHide={onHide}
//       className="rounded-[2.5rem] overflow-hidden shadow-2xl"
//       footer={
//         <div className="flex justify-end gap-3 p-6 bg-slate-50/50">
//           <Button
//             label="Abandonner"
//             onClick={onHide}
//             className="p-button-text text-slate-400 font-bold"
//           />
//           <Button
//             label={loading ? "Traitement..." : "Sauvegarder"}
//             icon={!loading && <Save size={20} className="mr-2" />}
//             onClick={handleSubmit}
//             disabled={loading || !nom || !code}
//             // Changement : bg-emerald-600 et shadow-emerald-200
//             className="bg-emerald-600 text-white font-bold py-3.5 px-10 rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-200 transition-all active:scale-95 border-none"
//           />
//         </div>
//       }
//     >
//       <form onSubmit={handleSubmit} className="pt-4 grid grid-cols-2 gap-6">
//         {/* Colonne Gauche: Identité */}
//         <div className="grid grid-cols-1 gap-8 p-4">
//           <div className="grid grid-cols-1 gap-6">
//             <div className="space-y-3">
//               <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
//                 <Hash size={14} className="text-emerald-500" /> Code Référence
//               </label>
//               <InputText
//                 value={code}
//                 onChange={(e) => setCode(e.target.value.toUpperCase())}
//                 // Changement : focus:ring-emerald-500
//                 className={inputClass}
//                 placeholder="ex: FACT-SC"
//               />
//             </div>
//           </div>

//           <div className="space-y-3">
//             <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
//               <FileText size={14} className="text-emerald-500" /> Nom Complet du
//               Document
//             </label>
//             <InputText
//               value={nom}
//               onChange={(e) => setNom(e.target.value)}
//               // Changement : focus:ring-emerald-500
//               className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-semibold"
//               placeholder="ex: Facture Fournisseur Service"
//             />
//           </div>
//         </div>

//         {/* Colonne Droite: Affectation */}
//         <div className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
//           <h3 className="text-xs font-black uppercase text-emerald-500 tracking-widest border-b border-emerald-100 pb-2">
//             Affectation
//           </h3>

//           <div>
//             <label className={labelClass}>
//               <Building2 size={14} className="text-emerald-500" /> {titreUn}
//             </label>
//             <Dropdown
//               value={entitee_un_id}
//               options={allEntiteeUn}
//               optionLabel="libelle"
//               optionValue="id"
//               onChange={(e) => handleEntiteeUnChange(Number(e.value))}
//               placeholder={`Sélectionner ${titreUn}`}
//               className="w-full rounded-xl"
//               filter
//             />
//           </div>

//           <div>
//             <label className={labelClass}>
//               <Layers size={14} className="text-emerald-500" /> {titreDeux}
//             </label>
//             <Dropdown
//               value={entitee_deux_id}
//               options={allEntiteeDeux}
//               optionLabel="libelle"
//               optionValue="id"
//               onChange={(e) => handleEntiteeDeuxChange(Number(e.value))}
//               placeholder={`Sélectionner ${titreDeux}`}
//               className="w-full rounded-xl"
//               disabled={!entitee_un_id}
//               filter
//             />
//           </div>

//           <div>
//             <label className={labelClass}>
//               <GitMerge size={14} className="text-orange-500" /> {titreTrois}
//             </label>
//             <Dropdown
//               value={entitee_trois_id}
//               options={allEntiteeTrois}
//               optionLabel="libelle"
//               optionValue="id"
//               onChange={(e) => handleEntiteeTroisChange(Number(e.value))} // Active ce handler
//               placeholder={`Sélectionner ${titreTrois} (Optionnel)`}
//               className="w-full rounded-xl"
//               disabled={!entitee_deux_id}
//               filter
//               showClear // Permet de désélectionner
//             />
//           </div>
//         </div>
//       </form>
//     </Dialog>
//   );
// }

import React, { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { FileText, Save, Hash, Info, X } from "lucide-react";

export default function DocumentTypeForm({
  onHide,
  onSubmit,
  refresh,
  initial = {},
  currentStructureLabel = "",
  isFiltered = false,
}: any) {
  //const [code, setCode] = useState("");
  const [nom, setNom] = useState("");
  const [loading, setLoading] = useState(false);

  // Initialisation des champs (le visible n'est plus requis ici car le TabView monte le composant)
  useEffect(() => {
    //setCode(initial?.code || "");
    setNom(initial?.nom || "");
  }, [initial]);

  const handleSubmit = async () => {
    if (!nom) return;
    setLoading(true);
    try {
      await onSubmit({ nom });
      // On peut appeler onHide() ici si on veut fermer la modale après succès
      //refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Alerte Affectation Automatique */}
      {!initial?.id && isFiltered && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl transition-all animate-in fade-in slide-in-from-top-2">
          <Info size={18} className="text-amber-600 mt-0.5" />
          <div className="text-xs text-amber-800 leading-relaxed">
            <span className="font-bold block uppercase mb-1">
              Affectation automatique
            </span>
            Ce type de document sera automatiquement lié à : <br />
            <span className="font-black underline italic">
              {currentStructureLabel}
            </span>
          </div>
        </div>
      )}

      {/* 2. Champs de saisie */}
      <div className="space-y-5">
        {/* <div className="space-y-2">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Hash size={14} className="text-emerald-500" /> Code Référence
          </label>
          <InputText
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-full p-3 bg-slate-50 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
            placeholder="ex: FACT-SC"
            autoFocus
          />
        </div> */}

        <div className="space-y-2">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <FileText size={14} className="text-emerald-500" /> Libellé du
            document
          </label>
          <InputText
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="w-full p-3 bg-slate-50 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 transition-all"
            placeholder="ex: Facture de service"
          />
        </div>
      </div>

      {/* 3. Footer intégré (Boutons d'action) */}
      <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-4">
        <Button
          label="Annuler"
          icon={<X size={16} className="mr-2" />}
          onClick={onHide}
          className="p-button-text text-slate-500 font-bold hover:bg-slate-100 px-4 py-2 rounded-xl transition-all"
          disabled={loading}
        />
        <Button
          label={loading ? "Enregistrement..." : "Enregistrer le type"}
          icon={!loading && <Save size={18} className="mr-2" />}
          onClick={handleSubmit}
          loading={loading}
          disabled={!nom}
          className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-8 py-3 rounded-xl shadow-lg shadow-emerald-200 transition-all font-bold"
        />
      </div>
    </div>
  );
}
