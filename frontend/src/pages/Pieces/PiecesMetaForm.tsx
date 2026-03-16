import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { Button } from "primereact/button";
import { Save, Plus, Settings, Trash2, Pencil, Hash } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import {
  createPieceMetaField,
  updatePieceMetaField,
  deletePieceMetaField,
  getPieceMetaFields,
} from "../../api/pieceMetaField";
import type { Pieces, PieceMetaField } from "../../interfaces";

interface Props {
  visible: boolean;
  onHide: () => void;
  piece: Pieces | null; // ✅ Changé de "type" à "piece"
  refresh?: () => void;
}

export default function PiecesMetaForm({
  visible,
  onHide,
  piece,
  refresh,
}: Props) {
  const empty = { id: null, label: "", type: "text", required: false };
  const [data, setData] = useState(empty);
  const [fields, setFields] = useState<any[]>([]);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);

  // ✅ Charger les métadonnées existantes de la pièce
  useEffect(() => {
    if (visible && piece?.id) {
      loadMetaFields();
    } else {
      setFields([]);
    }
    setData(empty);
    setIsEditingMode(false);
  }, [visible, piece]);

  const loadMetaFields = async () => {
    if (!piece?.id) return;
    setLoading(true);
    try {
      const data = await getPieceMetaFields(piece.id.toString());
      const formattedFields = data.map((f: PieceMetaField) => ({
        id: f.id,
        label: f.label,
        type: f.field_type,
        required: f.required,
        name: f.name,
      }));
      setFields(formattedFields);
    } catch (error) {
      console.error("Erreur chargement métadonnées:", error);
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Impossible de charger les métadonnées",
      });
    } finally {
      setLoading(false);
    }
  };

  const fieldTypeOptions = [
    { label: "Texte", value: "text" },
    { label: "Nombre", value: "number" },
    { label: "Date", value: "date" },
    { label: "Fichier", value: "file" }, // ✅ Important pour l'upload
  ];

  const handleAddOrUpdateField = () => {
    if (!data.label) return;

    if (isEditingMode) {
      setFields(
        fields.map((f) => (f.id === data.id && data.id !== null ? data : f)),
      );
      setIsEditingMode(false);
    } else {
      setFields([...fields, { ...data, id: "temp-" + Date.now() }]);
    }
    setData(empty);
  };

  const editField = (field: any) => {
    setData(field);
    setIsEditingMode(true);
  };

  const removeField = async (id: any) => {
    if (!piece?.id) return;

    if (id && !String(id).startsWith("temp-")) {
      confirmDialog({
        message: "Voulez-vous vraiment supprimer ce champ ?",
        header: "Confirmation",
        icon: "pi pi-exclamation-triangle",
        accept: async () => {
          try {
            await deletePieceMetaField(id);
            setFields(fields.filter((f) => f.id !== id));
            toast.current?.show({
              severity: "success",
              summary: "Champ supprimé",
            });
          } catch (e) {
            console.error(e);
            toast.current?.show({
              severity: "error",
              summary: "Erreur",
              detail: "Impossible de supprimer le champ",
            });
          }
        },
      });
    } else {
      setFields(fields.filter((f) => f.id !== id));
    }
  };

  const saveAll = async () => {
    if (!piece?.id) return;

    try {
      // ✅ Vérifier s'il existe déjà un champ de type "file"
      const hasFileField = fields.some((field) => field.type === "file");

      // ✅ Préparer tous les champs à sauvegarder
      let fieldsToSave = [...fields];

      // ✅ Si aucun champ "file" n'existe, en ajouter un automatiquement
      if (!hasFileField) {
        const defaultFileField = {
          id: "temp-file-" + Date.now(),
          label: "Fichier",
          type: "file",
          required: true,
          name: "fichier",
        };
        fieldsToSave.push(defaultFileField);

        toast.current?.show({
          severity: "info",
          summary: "Champ ajouté automatiquement",
          detail: "Un champ 'Fichier' obligatoire a été ajouté",
          life: 3000,
        });
      }

      // Traiter chaque champ
      for (const field of fieldsToSave) {
        const payload = {
          name: field.label.toLowerCase().replace(/\s+/g, "_"),
          label: field.label,
          field_type: field.type,
          required: field.required,
          position: fieldsToSave.indexOf(field),
        };

        if (field.id && !String(field.id).startsWith("temp-")) {
          // Mise à jour
          await updatePieceMetaField(field.id, payload);
        } else {
          // Création
          await createPieceMetaField(piece.id.toString(), payload);
        }
      }

      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: hasFileField
          ? "Métadonnées enregistrées avec succès"
          : "Métadonnées enregistrées avec un champ Fichier automatique",
      });

      if (refresh) refresh();
      onHide();
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Impossible d'enregistrer les métadonnées",
      });
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <Settings size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">
                Métadonnées de la pièce
              </h3>
              <p className="text-xs text-slate-400 font-medium italic">
                {piece?.libelle || "Sélectionnez une pièce"}
              </p>
            </div>
          </div>
        }
        visible={visible}
        style={{ width: 700 }}
        onHide={onHide}
        className="rounded-[2rem] overflow-hidden"
        footer={
          <div className="flex justify-end gap-3 p-4 bg-slate-50/50">
            <Button
              label="Fermer"
              onClick={onHide}
              className="p-button-text text-slate-500 font-bold"
            />
            <Button
              label="Enregistrer"
              icon={<Save size={18} className="mr-2" />}
              onClick={saveAll}
              disabled={loading}
              className="bg-emerald-600 text-white font-bold py-3 px-8 rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all border-none"
            />
          </div>
        }
      >
        <div className="space-y-8 pt-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="text-slate-400 mt-2">Chargement...</p>
            </div>
          ) : (
            <>
              {/* Formulaire d'ajout/modification */}
              <div
                className={`p-6 rounded-3xl border-2 transition-all ${
                  isEditingMode
                    ? "bg-amber-50/50 border-amber-200"
                    : "bg-slate-50 border-slate-100"
                }`}
              >
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                  {isEditingMode
                    ? "Modification du champ"
                    : "Nouveau champ de métadonnée"}
                  {isEditingMode && (
                    <button
                      onClick={() => {
                        setData(empty);
                        setIsEditingMode(false);
                      }}
                      className="text-amber-600 hover:underline text-xs"
                    >
                      Annuler
                    </button>
                  )}
                </h4>

                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-7">
                    <InputText
                      placeholder="Libellé du champ (ex: Numéro, Objet, Date...)"
                      className="w-full p-3.5 border-slate-200 rounded-xl shadow-sm focus:border-emerald-500"
                      value={data.label}
                      onChange={(e) =>
                        setData({ ...data, label: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-span-5">
                    <Dropdown
                      options={fieldTypeOptions}
                      value={data.type}
                      onChange={(e) => setData({ ...data, type: e.value })}
                      className="w-full border-slate-200 rounded-xl shadow-sm"
                      placeholder="Type de champ"
                    />
                  </div>
                  <div className="col-span-12 flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-slate-200">
                      <span className="text-xs font-bold text-slate-500 uppercase">
                        Obligatoire
                      </span>
                      <InputSwitch
                        checked={data.required}
                        onChange={(e) =>
                          setData({ ...data, required: e.value })
                        }
                      />
                    </div>
                    <Button
                      label={isEditingMode ? "Mettre à jour" : "Ajouter"}
                      icon={
                        isEditingMode ? <Save size={18} /> : <Plus size={18} />
                      }
                      onClick={handleAddOrUpdateField}
                      className={`${
                        isEditingMode ? "bg-amber-500" : "bg-emerald-800"
                      } text-white px-6 py-3 rounded-xl border-none font-bold transition-transform active:scale-95`}
                    />
                  </div>
                </div>
              </div>

              {/* Liste des champs existants */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                  Champs configurés ({fields.length})
                </h4>
                <div className="max-h-72 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {fields.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <Settings
                        size={32}
                        className="mx-auto text-slate-300 mb-2"
                      />
                      <p className="text-slate-400 text-sm italic">
                        Aucune métadonnée configurée
                      </p>
                      <p className="text-slate-400 text-xs">
                        Ajoutez des champs pour enrichir cette pièce
                      </p>
                    </div>
                  ) : (
                    fields.map((f) => (
                      <div
                        key={f.id}
                        className="group flex justify-between items-center p-4 bg-white border border-slate-100 rounded-2xl hover:border-emerald-200 hover:shadow-xl transition-all shadow-sm"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                            <Hash size={18} />
                          </div>
                          <div>
                            <div className="text-base font-bold text-slate-700">
                              {f.label}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">
                                {f.type}
                              </span>
                              {f.required && (
                                <span className="text-[9px] font-black bg-red-50 text-red-500 px-2 py-0.5 rounded uppercase">
                                  Obligatoire
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => editField(f)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => removeField(f.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </Dialog>
    </>
  );
}
