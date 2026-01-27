import { useEffect, useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Save, Layers, Tag, Plus } from "lucide-react";
import { Dropdown } from "primereact/dropdown";
import { getMetaById } from "../../api/metaField";
import { Toast } from "primereact/toast";
import { uploadDocumentFile } from "../../api/ulpoald";

export default function DocumentForm({
  visible,
  onHide,
  onSubmit,
  documentType,
  selectedTypeId,
}: any) {
  const [values, setValues] = useState<any>({});
  const [documentType_id, setDocumentType_id] = useState<number | null>(null);
  const [metaFields, setMetaFields] = useState<any[]>([]);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    if (selectedTypeId) {
      setDocumentType_id(selectedTypeId);
    }
  }, [selectedTypeId]);

  useEffect(() => {
    if (documentType_id) {
      getMetaById(String(documentType_id)).then((res) => {
        setMetaFields(res);
        setValues({});
      });
    } else {
      setMetaFields([]);
      setValues({});
    }
  }, [documentType_id]);

  const handleSubmit = async () => {
    // Vérifie que tous les champs required ont une valeur
    const missing = metaFields.filter((f) => f.required && !values[f.id]);

    if (missing.length > 0) {
      toast.current?.show({
        severity: "warn",
        summary: "Champs manquants",
        detail: "Veuillez remplir tous les champs obligatoires !",
      });
      return;
    }

    try {
      // 1️⃣ Créer le document (sans les fichiers)
      const doc = await onSubmit({
        type_document_id: documentType_id,
        values: Object.fromEntries(
          Object.entries(values).filter(([_, v]) => !(v instanceof File)),
        ),
      });

      console.log("✅ Document créé:", doc); // 2️⃣ Uploader les fichiers séparément

      for (const [fieldId, value] of Object.entries(values)) {
        if (value instanceof File) {
          await uploadDocumentFile(doc.id, fieldId, value);
        }
      }

      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Document enregistré avec succès !",
      });

      onHide();
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: error.message || "Impossible d’enregistrer le document",
      });
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header={
          <div className="flex items-center gap-3 text-emerald-950">
            <div className="p-2 bg-emerald-600 rounded-lg text-white">
              <Plus size={18} />
            </div>
            <span className="font-black tracking-tight">Nouvelle Archive</span>
          </div>
        }
        visible={visible}
        style={{ width: "500px" }}
        onHide={onHide}
        footer={
          <div className="flex justify-end gap-3 p-4 bg-emerald-50/30">
            <Button
              label="Annuler"
              onClick={onHide}
              className="p-button-text text-emerald-600 font-bold"
            />
            <Button
              label="Enregistrer"
              icon={<Save size={18} className="mr-2" />}
              className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-200 transition-all font-bold"
              onClick={handleSubmit}
            />
          </div>
        }
      >
        <div className="space-y-6 pt-4">
          <div className="bg-emerald-50/50 p-5 rounded-3xl border border-emerald-100">
            <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-3 block">
              Type de dossier
            </label>
            <Dropdown
              value={documentType_id}
              options={documentType}
              onChange={(e) => setDocumentType_id(e.value)}
              optionLabel="nom"
              optionValue="id"
              placeholder="Sélectionner..."
              className="w-full bg-white border-emerald-100 rounded-xl shadow-sm"
              filter
            />
          </div>

          {metaFields.length > 0 && (
            <div className="space-y-4 animate-in fade-in duration-500">
              <p className="text-[10px] font-black text-emerald-800/40 uppercase tracking-widest ml-1">
                Champs requis
              </p>
              <div className="grid grid-cols-1 gap-4">
                {metaFields.map((f: any) => (
                  <div key={f.id} className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-emerald-900 ml-1 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>{" "}
                      {f.label}
                    </label>
                    <input
                      type={f.field_type === "file" ? "file" : f.field_type}
                      className="w-full bg-white border border-emerald-100 p-3.5 rounded-2xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm text-emerald-950"
                      onChange={(e) =>
                        setValues({
                          ...values,
                          [f.id]:
                            f.field_type === "file"
                              ? e.target.files?.[0]
                              : e.target.value,
                        })
                      }
                      placeholder={`Entrez ${f.label.toLowerCase()}...`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </>
  );
}
