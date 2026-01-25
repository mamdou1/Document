import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import type { Piece } from "../../interfaces";

type Props = {
  visible: boolean;
  onHide: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  initial?: Partial<Piece>;
  title?: string;
};

export default function TypeDeDossierForm({
  visible,
  onHide,
  onSubmit,
  initial = {},
  title = "Créer un dossier",
}: Props) {
  const [files, setFiles] = useState<Record<string, File | null>>({});

  useEffect(() => {
    if (visible) {
      setFiles({});
    }
  }, [visible, initial]);

  const handleFileChange = (field: keyof Piece, file: File | null) => {
    setFiles((prev) => ({ ...prev, [field]: file }));
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    Object.entries(files).forEach(([key, file]) => {
      if (file) formData.append(key, file);
    });

    await onSubmit(formData);
    //onHide();
  };

  const fileFields: (keyof Piece)[] = [
    "expressionDeBesoin",
    "demandeDeCotion",
    "ficheDeLiquidation",
    "ficheEngagement",
    "bonDeCommande",
    "bonAchat",
    "facturesProForma",
    "contratDepense",
    "piecesFiscale",
    "rapportDeCotisation",
    "lettreDeNotification",
    "bordereauEmission",
    "mandatDePaiement",
    "etatDeRetenu",
    "OEM",
    "bordereauLIvraison",
    "pvDeDepense",
    "facture",
  ];

  return (
    <Dialog
      header={title}
      visible={visible}
      style={{ width: "700px" }}
      onHide={onHide}
    >
      <div className="grid grid-cols-1 gap-4">
        {/* Génération automatique des champs fichiers */}
        {fileFields.map((field) => (
          <div key={field}>
            <div className="flex">
              <label className="block text-sm mb-1 font-bold">{field}</label>
              <p className="text-red-600">*</p>
            </div>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(e) =>
                handleFileChange(field, e.target.files?.[0] || null)
              }
              className="w-full border p-2 rounded"
            />
          </div>
        ))}

        <div className="flex justify-end gap-2 mt-4">
          <Button label="Annuler" className="p-button-text" onClick={onHide} />
          <Button
            label="Enregistrer"
            className="bg-blue-600 text-white"
            onClick={handleSubmit}
          />
        </div>
      </div>
    </Dialog>
  );
}
