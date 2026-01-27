import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { Button } from "primereact/button";
import { Save, Plus, Settings, Trash2, Pencil, Hash } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { deleteMetaField } from "../../api/metaField";

export default function DocumentTypeMetaForm({
  visible,
  onHide,
  onSubmit,
  type,
}: any) {
  const empty = { id: null, label: "", type: "text", required: false };
  const [data, setData] = useState(empty);
  const [fields, setFields] = useState<any[]>([]);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    if (visible && type?.metaFields) {
      const existingFields = type.metaFields.map((f: any) => ({
        id: f.id,
        label: f.label,
        type: f.field_type || "text",
        required: f.required,
      }));
      setFields(existingFields);
    } else {
      setFields([]);
    }
    setData(empty);
    setIsEditingMode(false);
  }, [visible, type]);

  const typesOptions = [
    { label: "Texte", value: "text" },
    { label: "Nombre", value: "number" },
    { label: "Date", value: "date" },
    { label: "Fichier", value: "file" },
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
    if (id && !String(id).startsWith("temp-")) {
      confirmDialog({
        message: "Voulez-vous vraiment supprimer ce champ ?",
        header: "Confirmation",
        icon: "pi pi-exclamation-triangle",
        accept: async () => {
          try {
            await deleteMetaField(id);
            setFields(fields.filter((f) => f.id !== id));
            toast.current?.show({
              severity: "success",
              summary: "Champ supprimé",
            });
          } catch (e) {
            console.error(e);
          }
        },
      });
    } else {
      setFields(fields.filter((f) => f.id !== id));
    }
  };

  const saveAll = () => {
    const payload = fields.map((f) => ({
      id: String(f.id).startsWith("temp-") ? undefined : f.id,
      label: f.label,
      name: f.label,
      field_type: f.type,
      required: f.required,
    }));
    onSubmit(payload);
    onHide();
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header={
          <div className="flex items-center gap-3">
            {/* Changement : bg-emerald-100 et text-emerald-700 */}
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <Settings size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">
                Champs Personnalisés
              </h3>
              <p className="text-xs text-slate-400 font-medium italic">
                {type?.nom}
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
              label="Enregistrer la structure"
              icon={<Save size={18} className="mr-2" />}
              onClick={saveAll}
              // Changement : bg-emerald-600
              className="bg-emerald-600 text-white font-bold py-3 px-8 rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all border-none"
            />
          </div>
        }
      >
        <div className="space-y-8 pt-4">
          <div
            className={`p-6 rounded-3xl border-2 transition-all ${isEditingMode ? "bg-amber-50/50 border-amber-200" : "bg-slate-50 border-slate-100"}`}
          >
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
              {isEditingMode
                ? "Modification du champ"
                : "Nouveau champ de donnée"}
              {isEditingMode && (
                <button
                  onClick={() => {
                    setData(empty);
                    setIsEditingMode(false);
                  }}
                  className="text-amber-600 hover:underline"
                >
                  Annuler
                </button>
              )}
            </h4>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-7">
                <InputText
                  placeholder="Libellé du champ"
                  className="w-full p-3.5 border-slate-200 rounded-xl shadow-sm focus:border-emerald-500"
                  value={data.label}
                  onChange={(e) => setData({ ...data, label: e.target.value })}
                />
              </div>
              <div className="col-span-5">
                <Dropdown
                  options={typesOptions}
                  value={data.type}
                  onChange={(e) => setData({ ...data, type: e.value })}
                  className="w-full border-slate-200 rounded-xl shadow-sm"
                />
              </div>
              <div className="col-span-12 flex items-center justify-between mt-2">
                <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    Obligatoire
                  </span>
                  {/* Note: PrimeReact InputSwitch color often depends on global theme, but Tailwind can handle the layout */}
                  <InputSwitch
                    checked={data.required}
                    onChange={(e) => setData({ ...data, required: e.value })}
                  />
                </div>
                <Button
                  label={isEditingMode ? "Mettre à jour" : "Ajouter au modèle"}
                  icon={isEditingMode ? <Save size={18} /> : <Plus size={18} />}
                  onClick={handleAddOrUpdateField}
                  // Changement : bg-emerald-800 pour le bouton d'action secondaire
                  className={`${isEditingMode ? "bg-amber-500" : "bg-emerald-800"} text-white px-6 py-3 rounded-xl border-none font-bold transition-transform active:scale-95`}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
              Champs activés ({fields.length})
            </h4>
            <div className="max-h-72 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {fields.map((f) => (
                <div
                  key={f.id}
                  // Changement : hover:border-emerald-200
                  className="group flex justify-between items-center p-4 bg-white border border-slate-100 rounded-2xl hover:border-emerald-200 hover:shadow-xl transition-all shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    {/* Changement : group-hover colors Emerald */}
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
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => removeField(f.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}
