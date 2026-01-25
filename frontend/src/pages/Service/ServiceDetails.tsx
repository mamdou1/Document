import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Fonction, Service, Division, Section } from "../../interfaces";
import { getFunctionsByService } from "../../api/service";
import { getDivisionsByService, createDivision } from "../../api/division"; // Import API Division
import DivisionForm from "../Division/DivisionForm";
import { getSectionsByDivision, createSection } from "../../api/section"; // Import API Section
import {
  Bookmark,
  Hash,
  Calendar,
  Briefcase,
  PlusCircle,
  Layers,
  ChevronDown,
  ChevronRight,
  GitMerge,
} from "lucide-react";
import ServiceAjoutFonction from "./ServiceAjoutFonction";

export default function ServiceDetails({
  visible,
  onHide,
  service,
  toast,
}: any) {
  const [fonctions, setFonctions] = useState<Fonction[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [sectionsMap, setSectionsMap] = useState<Record<number, Section[]>>({});
  const [expandedDivision, setExpandedDivision] = useState<number | null>(null);

  const [selected, setSelected] = useState<Service[]>([]);
  //const [selectedDiv, setSelectedDiv] = useState<Service | null>(null);
  const [ajoutFonctionVisible, setAjoutFonctionVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [allDivisions, setAllDivisions] = useState<Division[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // 1. Charger les fonctions et les divisions au montage
  const fetchData = async () => {
    if (visible && service?.id) {
      try {
        // Chargement parallèle des fonctions et divisions
        const [funcData, divData] = await Promise.all([
          getFunctionsByService(service.id),
          getDivisionsByService(service.id),
        ]);

        setFonctions(funcData);
        setDivisions(Array.isArray(divData) ? divData : []);
      } catch (err) {
        console.error("Erreur lors du chargement des données", err);
      }
    }
  };

  useEffect(() => {
    fetchData();
    // Reset de l'accordéon à la fermeture/ouverture
    setExpandedDivision(null);
    setSectionsMap({});
  }, [visible, service]);

  // 2. Fonction pour ouvrir une division et charger ses sections
  const toggleDivision = async (divisionId: number) => {
    if (expandedDivision === divisionId) {
      setExpandedDivision(null);
      return;
    }

    setExpandedDivision(divisionId);

    // Charger les sections seulement si on ne les a pas déjà en mémoire
    if (!sectionsMap[divisionId]) {
      try {
        const data = await getSectionsByDivision(divisionId);
        setSectionsMap((prev) => ({
          ...prev,
          [divisionId]: Array.isArray(data) ? data : [],
        }));
        console.log("Les sections : ", data);
      } catch (err) {
        console.error("Erreur chargement sections", err);
      }
    }
  };

  const onCreate = async (payload: Partial<Division>) => {
    try {
      const saved = await createDivision(payload);
      setAllDivisions((s) => [saved, ...s]);
      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Division créé",
      });
      setFormVisible(false);
    } catch (err: any) {
      // toast.current?.show({
      //   severity: "error",
      //   summary: "Erreur",
      //   detail: "Échec de création",
      // });
    }
  };

  if (!service) return null;

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2 text-slate-800 font-bold">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <Bookmark size={18} className="text-indigo-600" />
          </div>
          <span>Détails du Service</span>
        </div>
      }
      visible={visible}
      style={{ width: "700px" }}
      onHide={onHide}
      draggable={false}
      footer={
        <div className="flex justify-end p-2">
          <Button
            label="Fermer"
            onClick={onHide}
            className="bg-slate-800 text-white font-bold px-6 py-2 rounded-xl border-none hover:bg-slate-700 transition-all shadow-md"
          />
        </div>
      }
    >
      <div className="pt-2 space-y-6">
        {/* Header Service */}
        <div className="border-b border-slate-100 pb-4">
          <p className="text-indigo-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
            Département / Service
          </p>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            {service.libelle}
            <span className="text-slate-600 text-sm font-normal">
              #SER-{service.id.toString().padStart(4, "0")}
            </span>
          </h2>
        </div>

        {/* Tableau des Fonctions (Inchangé) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Fonctions de service
              </p>
              {/* <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 ml-2 py-0.5 rounded-full shadow-sm">
                {fonctions.length} Total
              </span> */}
            </div>

            <Button
              onClick={(e) => {
                setSelected(service);
                setAjoutFonctionVisible(true);
                e.stopPropagation();
              }}
              className="flex items-center gap-2 px-3 py-2 text-blue-600 font-bold bg-blue-50 hover:text-white hover:bg-blue-500 rounded-lg transition-all border-none"
            >
              <PlusCircle size={15} />
              <span className="text-xs">Ajouter une fonction</span>
            </Button>
          </div>

          {fonctions.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
              <table className="w-full text-left border-collapse bg-white">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-wider w-12">
                      #
                    </th>
                    <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      Libellé
                    </th>
                    <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">
                      Création
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {fonctions.map((f, index) => (
                    <tr
                      key={f.id}
                      className="group hover:bg-indigo-50/30 transition-colors"
                    >
                      <td className="p-3">
                        <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-500">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Briefcase
                            size={14}
                            className="text-slate-300 group-hover:text-indigo-400"
                          />
                          <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">
                            {f.libelle}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 font-medium">
                          <Calendar size={12} />
                          {f.createdAt
                            ? new Date(f.createdAt).toLocaleDateString()
                            : "N/A"}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-slate-400 text-sm italic">
                Aucune fonction rattachée
              </p>
            </div>
          )}
        </div>

        {/* --- SECTION ACCORDÉON (Remplacement de l'ancienne div infos complémentaires) --- */}
        <div className="space-y-3">
          <div className="justify-between px-1 flex">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              Divisions et Sections rattachées
            </p>
            <Button
              onClick={(e) => {
                setSelectedService(service);
                setFormVisible(true);
                e.stopPropagation();
              }}
              className="flex items-center gap-2 px-3 py-2 text-orange-600 font-bold bg-orange-50 hover:text-white hover:bg-orange-500 rounded-lg transition-all border-none"
            >
              <PlusCircle size={15} />
              <span className="text-xs">Ajouter une division</span>
            </Button>
          </div>

          <div className="space-y-2">
            {divisions.length > 0 ? (
              divisions.map((div) => (
                <div
                  key={div.id}
                  className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm"
                >
                  <button
                    onClick={() => toggleDivision(div.id)}
                    className={`w-full flex items-center justify-between p-4 transition-all ${
                      expandedDivision === div.id
                        ? "bg-indigo-50/50"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          expandedDivision === div.id
                            ? "bg-indigo-500 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <Layers size={16} />
                      </div>
                      <span
                        className={`font-bold text-sm ${
                          expandedDivision === div.id
                            ? "text-indigo-700"
                            : "text-slate-700"
                        }`}
                      >
                        {div.libelle}
                      </span>
                    </div>
                    {expandedDivision === div.id ? (
                      <ChevronDown size={18} className="text-indigo-500" />
                    ) : (
                      <ChevronRight size={18} className="text-slate-400" />
                    )}
                  </button>

                  {expandedDivision === div.id && (
                    <div className="p-3 bg-slate-50/30 border-t border-slate-50 space-y-1 animate-in slide-in-from-top-2 duration-200">
                      {sectionsMap[div.id]?.length ? (
                        sectionsMap[div.id].map((sec) => (
                          <div
                            key={sec.id}
                            className="flex items-center gap-3 ml-8 p-2 text-sm text-slate-600 hover:text-indigo-600 transition-colors"
                          >
                            <GitMerge size={14} className="text-slate-300" />
                            <span className="font-medium">{sec.libelle}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px] text-slate-400 italic ml-12 py-2">
                          Aucune section dans cette division
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm italic">
                  Aucune division trouvée
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer info (optionnel, repositionné) */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <Hash size={15} className="text-slate-400" />
          <p className="text-[11px] text-slate-500 font-medium">
            Rattaché à :{" "}
            <span className="font-bold uppercase">
              {service.direction?.libelle || "Direction Générale"}
            </span>
          </p>
        </div>
      </div>

      <ServiceAjoutFonction
        visible={ajoutFonctionVisible}
        onHide={() => setAjoutFonctionVisible(false)}
        service={selected}
        onSuccess={() => {
          setAjoutFonctionVisible(false);
          fetchData(); // Rafraîchir tout
          toast?.current?.show({
            severity: "success",
            summary: "Succès",
            detail: "Fonction ajoutée au service",
          });
        }}
      />
      <DivisionForm
        visible={formVisible}
        onHide={() => setFormVisible(false)}
        onSubmit={onCreate}
        service={selectedService ? [selectedService] : []} // On passe la liste chargée ici
      />
    </Dialog>
  );
}
