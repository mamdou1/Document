import React, { useEffect, useRef, useState } from "react";
import { getBoxes, addDocumentToBox } from "../../api/box"; // Adapte le chemin selon ton projet
import { Toast } from "primereact/toast";
import { Box } from "../../interfaces";

interface AddToBoxFormProps {
  documentId: number;
  typeDocumentId: number;
  onSuccess?: () => void;
  onClose?: () => void;
}

const AddToBoxForm: React.FC<AddToBoxFormProps> = ({
  documentId,
  typeDocumentId,
  onSuccess,
  onClose,
}) => {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [selectedBoxId, setSelectedBoxId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(true);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    loadBoxes();
  }, []);

  const loadBoxes = async () => {
    try {
      const data = await getBoxes();
      // On filtre éventuellement pour n'afficher que les box vides
      // ou ceux qui correspondent au type de document
      const availableBoxes = data.filter(
        (b: Box) =>
          !b.type_document_id || Number(b.type_document_id) === typeDocumentId,
      );
      setBoxes(availableBoxes);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Erreur lors du chargement des box",
      });
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBoxId) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Veuillez sélectionner un box",
      });
      return;
    }

    const targetBox = boxes.find((b) => b.id === selectedBoxId);

    // Vérification locale de capacité avant appel API
    if (
      targetBox &&
      Number(targetBox.current_count) >= Number(targetBox.capacite_max)
    ) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Ce box est plein !",
      });
      return;
    }

    setLoading(true);
    try {
      await addDocumentToBox(selectedBoxId, documentId.toString());
      toast.current?.show({
        severity: "success",
        summary: "Ok",
        detail: "Ajouter avec succès",
      });
      if (onSuccess) onSuccess();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Erreur lors de l'archivage";
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return <div className="p-4 text-center">Chargement des box...</div>;

  return (
    <>
      <Toast ref={toast} />
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">Archiver dans un Box</h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sélectionner une boîte d'archive
            </label>
            <select
              value={selectedBoxId}
              onChange={(e) => setSelectedBoxId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">-- Choisir un box --</option>
              {boxes.map((box) => (
                <option
                  key={box.id}
                  value={box.id}
                  disabled={
                    Number(box.current_count) >= Number(box.capacite_max)
                  }
                >
                  {box.libelle} ({box.code_box}) - {box.current_count}/
                  {box.capacite_max} documents
                </option>
              ))}
            </select>
            {boxes.length === 0 && (
              <p className="mt-2 text-sm text-red-500">
                Aucun box compatible trouvé pour ce type de document.
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
              >
                Annuler
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !selectedBoxId}
              className={`px-4 py-2 text-sm font-medium text-white rounded ${
                loading ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Traitement..." : "Confirmer l'ajout"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddToBoxForm;
