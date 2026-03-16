import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { FileText, X } from "lucide-react";

type Props = {
  visible: boolean;
  onHide: () => void;
  file: File | null;
  onConfirm: () => void;
};

export default function UploadPreview({
  visible,
  onHide,
  file,
  onConfirm,
}: Props) {
  if (!file) return null;

  // Création d'une URL locale pour l'aperçu
  const previewUrl = URL.createObjectURL(file);

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Aperçu avant upload"
      style={{ width: "70vw" }}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            label="Annuler"
            icon={<X size={16} />}
            onClick={onHide}
            className="p-button-text p-button-secondary"
          />
          <Button
            label="Confirmer l'envoi"
            icon={<FileText size={16} />}
            onClick={onConfirm}
            className="bg-emerald-600 border-none px-6 py-2"
          />
        </div>
      }
    >
      <div className="h-[500px] w-full bg-slate-100 rounded-xl overflow-hidden">
        {file.type.includes("pdf") || file.type.includes("image") ? (
          <iframe src={previewUrl} className="w-full h-full border-none" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <FileText size={64} className="mb-4 opacity-20" />
            <p>Aperçu non disponible pour ce type de fichier</p>
            <p className="font-bold">{file.name}</p>
          </div>
        )}
      </div>
    </Dialog>
  );
}
