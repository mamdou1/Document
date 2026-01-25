import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { Button } from "primereact/button";
import { Save, Plus, Layers, Settings, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function DocumentTypeMetaForm({
  visible,
  onHide,
  onSubmit,
}: any) {
  const empty = { label: "", type: "text", required: false };
  const [data, setData] = useState(empty);
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setData(empty);
      setFields([]);
    }
  }, [visible]);

  const types = [
    { label: "Texte", value: "text" },
    { label: "Nombre", value: "number" },
    { label: "Date", value: "date" },
    { label: "Fichier", value: "file" },
  ];

  const addField = () => {
    if (!data.label) return;
    setFields((s) => [...s, data]);
    setData(empty);
  };

  const submitAll = () => {
    const all = [...fields, ...(data.label ? [data] : [])];
    all.forEach((f) =>
      onSubmit({
        name: f.label,
        label: f.label,
        field_type: f.type,
        required: f.required,
      }),
    );
    //onHide();
  };

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2 text-blue-900 font-bold">
          <Settings size={20} /> Configuration des champs
        </div>
      }
      visible={visible}
      style={{ width: 600 }}
      onHide={onHide}
      footer={
        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
          <Button
            label="Annuler"
            onClick={onHide}
            className="p-button-text text-slate-500 font-bold"
          />
          <Button
            label={loading ? "Enregistrement..." : "Enregistrer"}
            icon={<Save size={18} className="mr-2" />}
            onClick={submitAll}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl shadow-lg hover:bg-indigo-700 transition-all"
          />
        </div>
      }
    >
      <div className="space-y-6 pt-4">
        {/* Nouveau champ */}
        <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-4">
          <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
            Nouveau champ
          </label>
          <div className="flex gap-3">
            <InputText
              placeholder="Nom du champ"
              className="flex-1 border-slate-200 rounded-xl"
              value={data.label}
              onChange={(e) => setData({ ...data, label: e.target.value })}
            />
            <Dropdown
              className="w-40 border-slate-200 rounded-xl"
              options={types}
              value={data.type}
              onChange={(e) => setData({ ...data, type: e.value })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-600">
                Champ obligatoire
              </span>
              <InputSwitch
                checked={data.required}
                onChange={(e) => setData({ ...data, required: e.value })}
              />
            </div>
            <Button
              icon={<Plus size={20} />}
              onClick={addField}
              className="bg-blue-600 rounded-xl px-4 py-2 border-none"
              label="Ajouter"
            />
          </div>
        </div>

        {/* Liste temporaire */}
        {fields.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
              Liste en attente
            </h3>
            <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
              {fields.map((f, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-xl shadow-sm"
                >
                  <span className="text-sm font-bold text-slate-700">
                    {f.label}{" "}
                    <span className="text-slate-400 font-normal">
                      ({f.type})
                    </span>
                  </span>
                  {f.required && (
                    <span className="text-[9px] bg-red-50 text-red-500 px-2 py-1 rounded font-black">
                      REQUIS
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
