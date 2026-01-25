import { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import {
  FileText,
  Hash,
  AlignLeft,
  Calendar,
  X,
  Info,
  PlusCircle,
  GitMerge,
  ChevronRight,
  ChevronDown,
  Layers,
} from "lucide-react";
import type { Programme, Chapitre, Section } from "../../interfaces";
import {
  getChapitreByProgramme,
  createChapitre,
  getChapitres,
} from "../../api/chapitre";
import { Toast } from "primereact/toast";
import { getNatureChapitre, createNature, getNatures } from "../../api/nature";
import ChapitreForm from "../Chapitre/ChapitreForm";

type Props = {
  visible: boolean;
  onHide: () => void;
  programme: Programme | null;
};

export default function ProgrammeDetails({
  visible,
  onHide,
  programme,
}: Props) {
  const [chapitre, setChapitre] = useState<Chapitre[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const toast = useRef<Toast>(null);
  const [loading, setLoading] = useState(false);
  const [naturesMap, setNaturesMap] = useState<Record<number, Section[]>>({});
  const [expandedChapitre, setExpandedChapitre] = useState<number | null>(null);
  const [selectedProgramme, setSelectedProgramme] = useState<Programme | null>(
    null
  );

  const fetchData = async () => {
    if (visible && programme?.id) {
      try {
        if (!programme?.id) return;
        const data = await getChapitreByProgramme(Number(programme.id));
        setChapitre(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erreur lors du chargement des données", err);
      }
    }
  };

  useEffect(() => {
    fetchData();

    // Reset de l'accordéon à la fermeture/ouverture
    setExpandedChapitre(null);
    setNaturesMap({});
  }, [visible, programme]);

  // 2. Fonction pour ouvrir une division et charger ses sections
  const toggleChaiptre = async (chapitreId: number) => {
    if (expandedChapitre === chapitreId) {
      setExpandedChapitre(null);
      return;
    }

    setExpandedChapitre(chapitreId);

    // Charger les sections seulement si on ne les a pas déjà en mémoire
    if (!naturesMap[chapitreId]) {
      try {
        const data = await getNatureChapitre(chapitreId);
        setNaturesMap((prev) => ({
          ...prev,
          [chapitreId]: Array.isArray(data) ? data : [],
        }));
        console.log("Les natures : ", data);
      } catch (err) {
        console.error("Erreur chargement natures", err);
      }
    }
  };

  const onCreate = async (payload: Partial<Chapitre>) => {
    try {
      const saved = await createChapitre(payload);
      setChapitre((s) => [saved, ...s]);
      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Chapitre créé avec succès",
      });
      setFormVisible(false);
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Échec de la création",
      });
    }
  };

  if (!programme) return null;

  const InfoBlock = ({
    icon: Icon,
    label,
    value,
    colorClass = "text-blue-600",
  }: any) => (
    <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-hover hover:bg-white hover:shadow-sm">
      <div className={`mt-1 p-2 rounded-lg bg-white shadow-sm ${colorClass}`}>
        <Icon size={20} />
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          {label}
        </span>
        <p className="text-slate-700 font-semibold leading-relaxed">
          {value || "Non renseigné"}
        </p>
      </div>
    </div>
  );

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2 text-blue-900 font-bold">
          <FileText size={20} className="text-blue-500" />
          <span>Détails du Programme</span>
        </div>
      }
      visible={visible}
      style={{ width: "700px" }}
      onHide={onHide}
      draggable={false}
      className="custom-dialog"
      footer={
        <div className="flex justify-end pt-2">
          <Button
            label="Fermer"
            icon={<X size={18} className="mr-2" />}
            onClick={onHide}
            className="bg-slate-100 text-slate-600 font-bold px-6 py-2 rounded-xl hover:bg-slate-200 transition-all border-none"
          />
        </div>
      }
    >
      <div className="pt-2 space-y-6">
        <InfoBlock
          icon={Calendar}
          label="Exercice rattaché"
          value={
            typeof programme.exercice === "string"
              ? programme.exercice
              : programme.exercice?.annee
          }
        />

        {/* Header Service */}
        <div className="border-b border-slate-100 pb-4">
          <p className="text-indigo-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
            Programme
          </p>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            {programme.libelle}
            {/* <span className="text-slate-600 text-sm font-normal">
              #P-
              {programme.id ? programme.id.toString().padStart(4, "0") : "0000"}
            </span> */}
          </h2>
        </div>

        {/* <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-lg shadow-blue-100 mb-6">
          <h2 className="text-2xl font-bold mb-1">{programme.libelle}</h2>
          <div className="flex items-center gap-2 opacity-80 text-sm">
            <Hash size={14} />
            <span>Code: {programme.code_programme}</span>
          </div>
        </div> */}

        <div className="space-y-3">
          <div className="justify-between px-1 flex">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              Chapitres et Natures rattachées
            </p>
            <Button
              onClick={(e) => {
                setSelectedProgramme(programme);
                setFormVisible(true);
                e.stopPropagation();
              }}
              className="flex items-center gap-2 px-3 py-2 text-orange-600 font-bold bg-orange-50 hover:text-white hover:bg-orange-500 rounded-lg transition-all border-none"
            >
              <PlusCircle size={15} />
              <span className="text-xs">Ajouter un chapitre</span>
            </Button>
          </div>

          <div className="space-y-2">
            {chapitre.length > 0 ? (
              chapitre.map((chap) => (
                <div
                  key={chap.id}
                  className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm"
                >
                  <button
                    onClick={() => toggleChaiptre(Number(chap.id))}
                    className={`w-full flex items-center justify-between p-4 transition-all ${
                      expandedChapitre === chap.id
                        ? "bg-indigo-50/50"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          expandedChapitre === chap.id
                            ? "bg-indigo-500 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <Layers size={16} />
                      </div>
                      <span
                        className={`font-bold text-sm ${
                          expandedChapitre === chap.id
                            ? "text-indigo-700"
                            : "text-slate-700"
                        }`}
                      >
                        {chap.libelle}
                      </span>
                    </div>
                    {expandedChapitre === chap.id ? (
                      <ChevronDown size={18} className="text-indigo-500" />
                    ) : (
                      <ChevronRight size={18} className="text-slate-400" />
                    )}
                  </button>

                  {expandedChapitre === chap.id && (
                    <div className="p-3 bg-slate-50/30 border-t border-slate-50 space-y-1 animate-in slide-in-from-top-2 duration-200">
                      {naturesMap[chap.id]?.length ? (
                        naturesMap[chap.id].map((nat) => (
                          <div
                            key={nat.id}
                            className="flex items-center gap-3 ml-8 p-2 text-sm text-slate-600 hover:text-indigo-600 transition-colors"
                          >
                            <GitMerge size={14} className="text-slate-300" />
                            <span className="font-medium">{nat.libelle}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px] text-slate-400 italic ml-12 py-2">
                          Aucune nature dans cet chapitre
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm italic">
                  Aucune chapitre trouvée
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <InfoBlock
            icon={AlignLeft}
            label="Description"
            value={programme.description}
          />
        </div>

        <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400 px-2 italic">
          <Info size={12} />
          Les modifications du libellé affectent tous les rapports liés.
        </div>
      </div>

      <ChapitreForm
        visible={formVisible}
        onHide={() => setFormVisible(false)}
        onSubmit={onCreate}
        initial={undefined}
        title={"Ajouter un chapitre"}
        programmes={selectedProgramme ? [selectedProgramme] : []}
      />
    </Dialog>
  );
}
