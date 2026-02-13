import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Accordion, AccordionTab } from "primereact/accordion";
import {
  DoorOpen,
  MapPin,
  Hash,
  Layers,
  Grid3X3,
  Box,
  ChevronDown,
  ChevronRight,
  Archive,
  Package,
  Tag,
  Database,
  GitBranch,
} from "lucide-react";
import type { Salle, Rayon, Trave, Box as BoxType } from "../../interfaces";
import { getRayonsBySalle } from "../../api/salle";
import { getTraveByRayon } from "../../api/rayon";
import { getBoxesByTrave } from "../../api/trave";

type Props = {
  visible: boolean;
  onHide: () => void;
  salle: Salle | null;
};

export default function SalleDetails({ visible, onHide, salle }: Props) {
  const [rayons, setRayons] = useState<Rayon[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedRayons, setExpandedRayons] = useState<string[]>([]); // ✅ string[]
  const [travees, setTravees] = useState<Record<string, Trave[]>>({}); // ✅ Record<string, Trave[]>
  const [expandedTravees, setExpandedTravees] = useState<string[]>([]); // ✅ string[]
  const [boxes, setBoxes] = useState<Record<string, BoxType[]>>({}); // ✅ Record<string, BoxType[]>

  // Charger les rayons de la salle
  const loadRayons = async () => {
    if (!salle?.id) return;
    setLoading(true);
    try {
      const data = await getRayonsBySalle(salle.id);
      setRayons(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur chargement rayons:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && salle) {
      loadRayons();
    }
  }, [visible, salle]);

  // Charger les travées d'un rayon
  const loadTravees = async (rayonId: string) => {
    // ✅ string
    if (travees[rayonId]) return; // Déjà chargé
    try {
      const data = await getTraveByRayon(rayonId);
      setTravees((prev) => ({
        ...prev,
        [rayonId]: Array.isArray(data) ? data : [],
      }));
    } catch (error) {
      console.error("Erreur chargement travées:", error);
    }
  };

  // Charger les boxes d'une travée
  const loadBoxes = async (traveId: string) => {
    // ✅ string
    if (boxes[traveId]) return; // Déjà chargé
    try {
      const data = await getBoxesByTrave(traveId);
      setBoxes((prev) => ({
        ...prev,
        [traveId]: Array.isArray(data) ? data : [],
      }));
    } catch (error) {
      console.error("Erreur chargement boxes:", error);
    }
  };

  const toggleRayon = async (rayonId: string) => {
    // ✅ string
    if (expandedRayons.includes(rayonId)) {
      setExpandedRayons(expandedRayons.filter((id) => id !== rayonId));
    } else {
      setExpandedRayons([...expandedRayons, rayonId]);
      await loadTravees(rayonId);
    }
  };

  const toggleTravee = async (traveId: string) => {
    // ✅ string
    if (expandedTravees.includes(traveId)) {
      setExpandedTravees(expandedTravees.filter((id) => id !== traveId));
    } else {
      setExpandedTravees([...expandedTravees, traveId]);
      await loadBoxes(traveId);
    }
  };

  if (!salle) return null;

  return (
    <Dialog
      header={
        <div className="flex items-center gap-3 text-slate-800 font-bold">
          <div className="bg-emerald-100 p-2 rounded-lg">
            <DoorOpen size={20} className="text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-black">{salle.libelle}</h2>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
              <Hash size={12} /> {salle.code_salle}
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <MapPin size={12} /> {salle.site?.nom || "Site non défini"}
            </p>
          </div>
        </div>
      }
      visible={visible}
      style={{ width: "800px" }}
      onHide={onHide}
      draggable={false}
      className="rounded-3xl"
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
      <div className="pt-4 space-y-6">
        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-lg text-white">
                <Layers size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">
                  Rayons
                </p>
                <p className="text-2xl font-black text-slate-800">
                  {rayons.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg text-white">
                <Grid3X3 size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black text-purple-600 uppercase tracking-wider">
                  Travées
                </p>
                <p className="text-2xl font-black text-slate-800">
                  {Object.values(travees).reduce(
                    (acc, curr) => acc + curr.length,
                    0,
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500 rounded-lg text-white">
                <Box size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-wider">
                  Boxes
                </p>
                <p className="text-2xl font-black text-slate-800">
                  {Object.values(boxes).reduce(
                    (acc, curr) => acc + curr.length,
                    0,
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des rayons en accordéon */}
        <div className="space-y-3">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-2 px-1">
            <Database size={14} /> Structure de la salle
          </h3>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="text-xs text-slate-400 mt-2">Chargement...</p>
            </div>
          ) : rayons.length > 0 ? (
            <Accordion
              activeIndex={expandedRayons.map((_, index) => index)} // ✅ Convertir en indices
              onTabChange={(e) => {
                // ✅ Gérer le changement d'onglet
                const newExpanded = e.index as number[];
                setExpandedRayons(
                  newExpanded.map((i) => rayons[i].id as string),
                );
              }}
              multiple
              className="custom-accordion"
            >
              {rayons.map((rayon) => (
                <AccordionTab
                  key={rayon.id}
                  header={
                    <div
                      className="flex items-center justify-between w-full"
                      onClick={() => toggleRayon(rayon.id as string)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                          <Layers size={16} />
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">
                              {rayon.code}
                            </span>
                            <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                              {rayon.code}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-medium">
                            {travees[rayon.id as string]?.length || 0} travée(s)
                          </p>
                        </div>
                      </div>
                    </div>
                  }
                >
                  {/* Liste des travées du rayon */}
                  <div className="space-y-2 p-2">
                    {travees[rayon.id as string]?.length > 0 ? (
                      travees[rayon.id as string].map((trave) => (
                        <div
                          key={trave.id}
                          className="border border-slate-100 rounded-xl overflow-hidden bg-white ml-4"
                        >
                          {/* HEADER TRAVEE */}
                          <div
                            onClick={() => toggleTravee(trave.id as string)}
                            className={`w-full flex items-center justify-between p-3 cursor-pointer transition-all ${
                              expandedTravees.includes(trave.id as string)
                                ? "bg-purple-50/50"
                                : "hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-1.5 rounded-lg ${
                                  expandedTravees.includes(trave.id as string)
                                    ? "bg-purple-500 text-white"
                                    : "bg-purple-100 text-purple-600"
                                }`}
                              >
                                <Grid3X3 size={14} />
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-sm font-bold ${
                                    expandedTravees.includes(trave.id as string)
                                      ? "text-purple-700"
                                      : "text-slate-700"
                                  }`}
                                >
                                  {trave.code}
                                </span>
                                <span className="bg-purple-100 text-purple-700 text-[9px] px-1.5 py-0.5 rounded-full">
                                  {trave.code}
                                </span>
                              </div>
                            </div>
                            {expandedTravees.includes(trave.id as string) ? (
                              <ChevronDown
                                size={14}
                                className="text-purple-500"
                              />
                            ) : (
                              <ChevronRight
                                size={14}
                                className="text-slate-400"
                              />
                            )}
                          </div>

                          {/* BOXES DE LA TRAVEE */}
                          {expandedTravees.includes(trave.id as string) && (
                            <div className="p-3 bg-slate-50/30 border-t border-slate-50">
                              {boxes[trave.id as string]?.length > 0 ? (
                                <div className="grid grid-cols-4 gap-2">
                                  {boxes[trave.id as string].map((box) => (
                                    <div
                                      key={box.id}
                                      className="bg-white border border-slate-100 rounded-lg p-2 text-center hover:border-amber-300 transition-all group"
                                    >
                                      <Package
                                        size={16}
                                        className="mx-auto text-amber-500 mb-1"
                                      />
                                      <p className="text-xs font-bold text-slate-700 truncate">
                                        {box.libelle}
                                      </p>
                                      <div className="flex items-center justify-center gap-1 mt-1">
                                        <Tag
                                          size={8}
                                          className="text-slate-400"
                                        />
                                        <span className="text-[8px] font-mono bg-slate-100 px-1 py-0.5 rounded">
                                          {box.code_box}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[10px] text-slate-400 italic text-center py-2">
                                  Aucun box dans cette travée
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic py-2 text-center">
                        Aucune travée dans ce rayon
                      </p>
                    )}
                  </div>
                </AccordionTab>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <Archive size={48} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-400 text-sm font-medium">
                Aucun rayon configuré dans cette salle
              </p>
            </div>
          )}
        </div>

        {/* Informations complémentaires */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 p-2">
            <GitBranch size={14} className="text-slate-400" />
            <span className="text-xs text-slate-500">
              <span className="font-bold">Capacité totale:</span>{" "}
              {rayons.reduce<number>((acc, rayon) => {
                const rayonId = rayon.id as string;
                const traveCount = travees[rayonId]?.length || 0;
                const boxCount =
                  travees[rayonId]?.reduce<number>((sum, trave) => {
                    const traveId = trave.id as string;
                    return sum + (boxes[traveId]?.length || 0);
                  }, 0) || 0;
                return acc + boxCount;
              }, 0)}{" "}
              box(es)
            </span>
          </div>
          <div className="flex items-center gap-2 p-2">
            <Database size={14} className="text-slate-400" />
            <span className="text-xs text-slate-500">
              <span className="font-bold">Créée le:</span>{" "}
              {salle.createdAt
                ? new Date(salle.createdAt).toLocaleDateString("fr-FR")
                : "N/A"}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .custom-accordion .p-accordion-header {
          margin-bottom: 6px !important;
        }
        .custom-accordion .p-accordion-header-link {
          background: white !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 12px !important;
          padding: 12px !important;
          transition: all 0.2s;
          text-decoration: none !important;
        }
        .custom-accordion .p-accordion-header-link:hover {
          border-color: #10b981 !important;
          background: #f0fdf4 !important;
        }
        .custom-accordion .p-accordion-content {
          background: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
          border-top: none !important;
          border-bottom-left-radius: 12px !important;
          border-bottom-right-radius: 12px !important;
          padding: 12px !important;
        }
      `}</style>
    </Dialog>
  );
}
