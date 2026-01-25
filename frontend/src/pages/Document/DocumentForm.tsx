import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Save, Layers, Tag, X } from "lucide-react";
import { Dropdown } from "primereact/dropdown";
import { getMetaById } from "../../api/metaField";

export default function DocumentForm({
  visible,
  onHide,
  onSubmit,
  documentType,
}: any) {
  const [values, setValues] = useState<any>({});
  const [documentType_id, setDocumentType_id] = useState<number | null>(null);
  const [metaFields, setMetaFields] = useState<any[]>([]);

  useEffect(() => {
    if (documentType_id) {
      getMetaById(String(documentType_id)).then((res) => setMetaFields(res));
    }
  }, [documentType_id]);

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2 text-blue-900">
          <Layers size={20} />
          <span className="font-bold">Nouveau Document</span>
        </div>
      }
      visible={visible}
      style={{ width: "550px" }}
      onHide={onHide}
      className="custom-dialog"
      footer={
        <div className="flex justify-end gap-3 p-2">
          <Button
            label="Annuler"
            onClick={onHide}
            className="px-4 py-2 text-slate-500 bg-transparent border-none hover:bg-slate-100 rounded-xl font-semibold transition-all"
          />
          <Button
            label="Enregistrer le document"
            icon={<Save size={18} className="mr-2" />}
            className="px-6 py-2 bg-blue-600 text-white border-none rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
            onClick={() =>
              onSubmit({ type_document_id: documentType_id, values })
            }
          />
        </div>
      }
    >
      <div className="space-y-6 pt-4">
        {/* Sélecteur de type */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <label className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-black text-blue-600 mb-2">
            Classification
          </label>
          <Dropdown
            value={documentType_id}
            options={documentType}
            onChange={(e) => setDocumentType_id(e.value)}
            optionLabel="nom"
            optionValue="id"
            placeholder="Sélectionnez le type de document"
            className="w-full bg-white border-slate-200 rounded-xl shadow-sm"
            filter
          />
        </div>

        {/* Champs dynamiques stylisés */}
        {metaFields.length > 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">
              Métadonnées
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {metaFields.map((f: any) => (
                <div key={f.id} className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                    <Tag size={14} className="text-blue-400" /> {f.label}
                  </label>

                  {f.field_type === "file" ? (
                    <input
                      type="file"
                      className="w-full bg-white border border-slate-200 p-3 rounded-xl text-sm"
                      onChange={(e) =>
                        setValues({ ...values, [f.id]: e.target.files?.[0] })
                      }
                    />
                  ) : (
                    <input
                      type={f.field_type}
                      placeholder={`Saisir ${f.label.toLowerCase()}...`}
                      className="w-full bg-white border border-slate-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
                      onChange={(e) =>
                        setValues({ ...values, [f.id]: e.target.value })
                      }
                    />
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
