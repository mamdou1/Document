import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import type {
  Liquidation,
  Programme,
  Chapitre,
  Nature,
  Type,
  Fournisseur,
  ServiceBeneficiaire,
  SourceDeFinancement,
} from "../../interfaces";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Info,
  Folder,
  Wallet,
  UserCircle,
} from "lucide-react";

type Props = {
  visible: boolean;
  onHide: () => void;
  onSubmit: (data: Partial<Liquidation>) => Promise<void>;
  initial?: Partial<Liquidation>;
  title?: string;
  serviceBeneficiaires: ServiceBeneficiaire[];
  fournisseurs: Fournisseur[];
  programmes: Programme[];
  chapitres: Chapitre[];
  natures: Nature[];
  types: Type[];
  toastRef?: React.RefObject<Toast | null>;
  source_de_financements: SourceDeFinancement[];
};

export default function LiquidationForm({
  visible,
  onHide,
  onSubmit,
  initial = {},
  title = "Créer liquidation",
  serviceBeneficiaires,
  fournisseurs,
  programmes,
  chapitres,
  natures,
  types,
  source_de_financements,
  toastRef,
}: Props) {
  //Étape actuelle
  const [step, setStep] = useState(1);

  // Navigation
  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const [description, setDescription] = useState(initial.description || "");
  const [sourceDeFinancement, setSourceDeFinancement] = useState<string>("");
  //const [beneficiaire, setBeneficiaire] = useState(initial.beneficiaire || "");
  const [numDossier, setNumDossier] = useState(initial.numDossier || "");

  const [montant, setMontant] = useState<number>(initial.montant || 0);
  const [dateLiquidation, setDateLiquidation] = useState<string>(
    initial.dateLiquidation
      ? initial.dateLiquidation.slice(0, 10)
      : new Date().toISOString().slice(0, 10),
  );
  const [programme, setProgramme] = useState<string>("");
  const [chapitre, setChapitre] = useState<string>("");
  const [nature, setNature] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [fournisseur, setFournisseur] = useState<string>("");
  const [serviceBeneficiaire, setServiceBeneficiaire] = useState<string>("");

  const [filteredChapitres, setFilteredChapitres] = useState<Chapitre[]>([]);
  const [filteredNatures, setFilteredNatures] = useState<Nature[]>([]);

  const [typePieces, setTypePieces] = useState<any[]>([]);

  useEffect(() => {
    const t = types.find((x) => String(x.id) === selectedType);
    setTypePieces(t?.pieces ?? []);
  }, [selectedType, types]);

  // Quand programme change → filtrer chapitres
  useEffect(() => {
    if (programme) {
      const relatedChapitres = chapitres.filter((c) => {
        if (typeof c.programme === "string") {
          return c.programme === programme;
        }
        return c.programme?.id === programme;
      });
      setFilteredChapitres(relatedChapitres);

      // reset chapitre et nature
      setChapitre(String(relatedChapitres[0]?.id) || "");
      setFilteredNatures([]);
      setNature("");
    }
  }, [programme, chapitres]);

  // Quand chapitre change → filtrer natures
  useEffect(() => {
    if (chapitre) {
      const relatedNatures = natures.filter((n) => {
        if (typeof n.chapitre === "string") {
          return n.chapitre === chapitre;
        }
        return String(n.chapitre?.id) === chapitre;
      });
      setFilteredNatures(relatedNatures);

      // reset nature
      setNature(relatedNatures[0]?.id || "");
    }
  }, [chapitre, natures]);

  useEffect(() => {
    if (!visible) return;

    setDescription(initial.description || "");
    // setFounisseur(initial.fournisseur || "");
    // setBeneficiaire(initial.beneficiaire || "");
    setNumDossier(initial.numDossier || "");
    setMontant(initial.montant || 0);
    setProgramme(
      typeof initial?.programme === "object"
        ? String(initial.programme?.id || "")
        : String(initial?.programme || ""),
    );

    setChapitre(
      typeof initial?.chapitre === "object"
        ? String(initial.chapitre?.id || "")
        : String(initial?.chapitre || ""),
    );

    setNature(
      typeof initial?.nature === "object"
        ? String(initial.nature?.id || "")
        : String(initial?.nature || ""),
    );

    setSelectedType(
      typeof initial?.type === "object"
        ? String(initial.type?.id || "")
        : String(initial?.type || ""),
    );

    setFournisseur(
      typeof initial?.fournisseur === "object"
        ? String(initial.fournisseur?.id || "")
        : String(initial?.fournisseur || ""),
    );

    setServiceBeneficiaire(
      typeof initial?.serviceBeneficiaire === "string"
        ? String(initial.serviceBeneficiaire || "")
        : String(initial?.serviceBeneficiaire || ""),
    );

    setSourceDeFinancement(
      typeof initial?.sourceDeFinancement === "object"
        ? String(initial.sourceDeFinancement?.id || "")
        : String(initial?.sourceDeFinancement || ""),
    );
  }, [visible]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<Liquidation> = {
      description,
      sourceDeFinancement,
      fournisseur,
      serviceBeneficiaire,
      numDossier,
      montant,
      dateLiquidation,
      programme,
      chapitre,
      nature,
      type: selectedType,
    };
    await onSubmit(payload);
    setStep(1);
    console.log("Data de la liquidation:", payload);

    //onHide();
  };

  // Labels pour le récapitulatif
  const programmeLabel =
    programmes.find((p) => p.id === programme)?.libelle || "-";
  const chapitreLabel =
    chapitres.find((c) => String(c.id) === chapitre)?.libelle || "-";
  const natureLabel = natures.find((n) => n.id === nature)?.libelle || "-";
  const typeLabel = types.find((t) => t.id === selectedType)?.nom || "-";
  const fournisseurLabel =
    fournisseurs.find((f) => f.id === fournisseur)?.sigle || "-";
  const serviceBeneficiareLabel =
    serviceBeneficiaires.find((s) => s.id === serviceBeneficiaire)?.sigle ||
    "-";

  const source_de_financementLabel =
    source_de_financements.find((s) => s.id === sourceDeFinancement)?.libelle ||
    "-";

  return (
    <Dialog
      header={
        <div className="flex flex-col gap-1">
          <span className="text-blue-900 font-bold text-xl">{title}</span>
          <div className="flex items-center gap-2">
            <div
              className={`h-1 w-12 rounded-full ${
                step >= 1 ? "bg-blue-600" : "bg-slate-200"
              }`}
            />
            <div
              className={`h-1 w-12 rounded-full ${
                step >= 2 ? "bg-blue-600" : "bg-slate-200"
              }`}
            />
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider ml-2">
              Étape {step}/2
            </span>
          </div>
        </div>
      }
      visible={visible}
      style={{ width: "650px" }}
      onHide={() => {
        setStep(1);
        //onHide();
      }}
      className="rounded-3xl shadow-2xl border-none"
      contentClassName="p-0 overflow-hidden"
    >
      <form onSubmit={handleSubmit} className="bg-white">
        <div className="p-8 max-h-[60vh] overflow-y-auto">
          {step === 1 && (
            <div className="space-y-6">
              {/* Section Budget */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-700 font-bold text-sm mb-2 border-b border-blue-50 pb-2">
                  <Folder size={16} /> Affectation Budgétaire
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <Dropdown
                    value={programme}
                    options={programmes.map((p) => ({
                      label: p.libelle,
                      value: p.id,
                    }))}
                    onChange={(e) => setProgramme(e.value)}
                    placeholder="Sélectionner un programme"
                    className=" rounded-xl  border-blue-300 w-full border-2 p-2 mx-2 focus:border-blue-200 focus:ring-0 focus:border-4 shadow-sm"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Dropdown
                      value={chapitre}
                      options={filteredChapitres.map((c) => ({
                        label: c.libelle,
                        value: c.id,
                      }))}
                      onChange={(e) => setChapitre(e.value)}
                      disabled={!programme}
                      placeholder="Chapitre"
                      className="rounded-xl  border-blue-300  border-2 p-2 mx-2 focus:border-blue-200 focus:ring-0 focus:border-4 shadow-sm"
                    />
                    <Dropdown
                      value={nature}
                      options={filteredNatures.map((n) => ({
                        label: n.libelle,
                        value: n.id,
                      }))}
                      onChange={(e) => setNature(e.value)}
                      disabled={!chapitre}
                      placeholder="Nature"
                      className="rounded-xl  border-blue-300  border-2 p-2 mx-2 focus:border-blue-200 focus:ring-0 focus:border-4 shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Section Détails */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 text-blue-700 font-bold text-sm mb-2 border-b border-blue-50 pb-2">
                  <Info size={16} /> Détails de la Liquidation
                </div>
                <div className="flex flex-col gap-4">
                  <InputText
                    value={numDossier}
                    onChange={(e) => setNumDossier(e.target.value)}
                    placeholder="N° de dossier"
                    className="p-3 rounded-xl  border-blue-300 border-2  mx-2 focus:border-blue-200 focus:ring-0 focus:border-4 shadow-sm"
                  />
                  <Dropdown
                    value={selectedType}
                    options={types.map((t) => ({ label: t.nom, value: t.id }))}
                    onChange={(e) => setSelectedType(e.value)}
                    placeholder="Type de dossier"
                    className="rounded-xl  border-blue-300  border-2 p-2 mx-2 focus:border-blue-200 focus:ring-0 focus:border-4 shadow-sm"
                  />
                  <InputText
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description ou objet de la dépense"
                    className="p-3 rounded-xl  border-blue-300  border-2 mx-2 focus:border-blue-200 focus:ring-0 focus:border-4 shadow-sm"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <Wallet
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={16}
                      />
                      <InputText
                        type="number"
                        value={String(montant)}
                        onChange={(e) => setMontant(Number(e.target.value))}
                        placeholder="Montant"
                        className="pl-10 rounded-xl  border-blue-300 w-full border-2 p-2 mx-2 focus:border-blue-200 focus:ring-0 focus:border-4 shadow-sm"
                      />
                    </div>
                    <input
                      type="date"
                      value={dateLiquidation}
                      onChange={(e) => setDateLiquidation(e.target.value)}
                      className="rounded-xl w-full  border-blue-300  border-2 p-2 mx-2 focus:border-blue-200 focus:ring-0 focus:border-4 shadow-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Dropdown
                      value={fournisseur}
                      options={fournisseurs.map((f) => ({
                        label: f.sigle,
                        value: f.id,
                      }))}
                      onChange={(e) => setFournisseur(e.value)}
                      placeholder="Fournisseur"
                      className="rounded-xl  border-blue-300 border-2 p-2 mx-2 focus:border-blue-200 focus:ring-0 focus:border-4 shadow-sm"
                      filter
                    />
                    <Dropdown
                      value={serviceBeneficiaire}
                      options={serviceBeneficiaires.map((s) => ({
                        label: s.sigle,
                        value: s.id,
                      }))}
                      onChange={(e) => setServiceBeneficiaire(e.value)}
                      placeholder="Bénéficiaire"
                      className="rounded-xl  border-blue-300  border-2 p-2 mx-2 focus:border-blue-200 focus:ring-0 focus:border-4 shadow-sm"
                      filter
                    />
                  </div>

                  <Dropdown
                    value={sourceDeFinancement}
                    options={source_de_financements.map((s) => ({
                      label: s.libelle,
                      value: s.id,
                    }))}
                    onChange={(e) => setSourceDeFinancement(e.value)}
                    placeholder="Source de financement"
                    className="rounded-xl  border-blue-300 border-2 p-2 mx-2 focus:border-blue-200 focus:ring-0 focus:border-4 shadow-sm"
                    filter
                  />
                  {/* <InputText
                    value={numDossier}
                    onChange={(e) => setNumDossier(e.target.value)}
                    placeholder="N° de dossier"
                    className="p-3 rounded-xl  border-blue-300 border-2  mx-2 focus:border-blue-200 focus:ring-0 focus:border-4 shadow-sm"
                  /> */}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-6">
                <CheckCircle2 className="text-blue-600" size={24} />
                <div>
                  <h3 className="font-bold text-blue-900">
                    Vérification finale
                  </h3>
                  <p className="text-xs text-blue-600 font-medium text-pretty">
                    Veuillez confirmer que toutes les informations saisies sont
                    correctes avant l'enregistrement.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase">
                      Budget
                    </span>
                    <span className="text-lg font-bold text-blue-900">
                      {programmeLabel}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        Chapitre
                      </p>
                      <p className="text-lg font-semibold text-slate-700">
                        {chapitreLabel}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        Nature
                      </p>
                      <p className="text-lg font-semibold text-slate-700">
                        {natureLabel}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                        Description
                      </p>
                      <p className="text-lg font-bold text-slate-800">
                        {description || "Non renseigné"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                        Source de financement
                      </p>
                      <p className="text-lg font-bold text-slate-800">
                        {source_de_financementLabel || "Non renseigné"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        Bénéficiaire
                      </p>
                      <p className="text-lg font-semibold text-slate-700">
                        {serviceBeneficiareLabel}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        Montant
                      </p>
                      <p className="text-lg font-extrabold text-blue-700">
                        {montant.toLocaleString()} FCFA
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
          <Button
            type="button"
            label="Annuler"
            onClick={onHide}
            className="p-button-text text-slate-400 hover:text-slate-600 font-bold"
          />

          <div className="flex gap-3">
            {step > 1 && (
              <Button
                type="button"
                onClick={prevStep}
                className="bg-white text-slate-600 border border-slate-200 px-6 py-2.5 rounded-xl hover:bg-slate-100 font-bold flex items-center gap-2"
              >
                <ChevronLeft size={18} /> Précédent
              </Button>
            )}
            {step < 2 && (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-blue-600 text-white border-none px-8 py-2.5 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 font-bold flex items-center gap-2"
              >
                Suivant <ChevronRight size={18} />
              </Button>
            )}
            {step === 2 && (
              <Button
                type="submit"
                className="bg-green-600 text-white border-none px-10 py-2.5 rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 font-bold flex items-center gap-2"
              >
                Enregistrer le dossier <CheckCircle2 size={18} />
              </Button>
            )}
          </div>
        </div>
      </form>
    </Dialog>
  );
}
