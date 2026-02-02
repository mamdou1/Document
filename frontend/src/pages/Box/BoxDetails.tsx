import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import {
  getBoxById,
  getDocumentsByBox,
  retireDocumentFromBox,
} from "../../api/box";
import { Box } from "../../interfaces";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { FileText, MinusCircle, Info, Hash, Inbox } from "lucide-react";

export default function BoxDetails({ visible, onHide, boxId, onUpdate }: any) {
  const [box, setBox] = useState<Box | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    if (!boxId) return;
    setLoading(true);
    try {
      const [b, docs] = await Promise.all([
        getBoxById(boxId),
        getDocumentsByBox(boxId),
      ]);
      setBox(b);
      setDocuments(docs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) loadData();
  }, [visible, boxId]);

  const handleRetire = (docId: string) => {
    confirmDialog({
      message: "Retirer ce document du box ?",
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          await retireDocumentFromBox(docId);
          loadData();
          onUpdate();
        } catch (err) {
          alert("Erreur lors du retrait");
        }
      },
      reject: () => {
        // rien si l’utilisateur annule
      },
    });
  };

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={
        <div className="flex items-center gap-2">
          <Info className="text-blue-500" size={20} />{" "}
          <span>Contenu du Box</span>
        </div>
      }
      className="w-full max-w-3xl"
      modal
    >
      {box && (
        <div className="space-y-6 pt-2">
          <div className="bg-slate-800 text-white p-6 rounded-2xl flex justify-between items-center shadow-xl">
            <div>
              <h2 className="text-2xl font-black">{box.libelle}</h2>
              <p className="text-blue-400 font-mono text-sm tracking-tighter flex items-center gap-2">
                <Hash size={14} /> {box.code_box}
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold">
                {box.current_count} / {box.capacite_max}
              </span>
              <p className="text-[10px] uppercase opacity-60 font-bold">
                Capacité occupée
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Référence</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {documents.length > 0 ? (
                  documents.map((doc) => (
                    <tr
                      key={doc.id}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      <td className="px-6 py-4 font-bold text-slate-700 flex items-center gap-3">
                        <FileText
                          size={18}
                          className="text-slate-300 group-hover:text-blue-500 transition-colors"
                        />
                        {doc.reference || `DOC-${doc.id}`}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {doc.TypeDocument?.libelle || "Archive standard"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleRetire(doc.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Retirer du box"
                        >
                          <MinusCircle size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-12 text-center text-slate-400"
                    >
                      <Inbox size={40} className="mx-auto mb-2 opacity-20" />
                      <p>Ce box ne contient aucun document pour le moment.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <ConfirmDialog />
    </Dialog>
  );
}
