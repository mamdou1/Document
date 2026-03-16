import { Tag, Hash } from "lucide-react";

type Props = {
  metaFields: any[];
};

export default function DocumentTypeMetaListe({ metaFields }: Props) {
  if (!metaFields || metaFields.length === 0) {
    return (
      <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 mt-4">
        <p className="text-slate-400 text-sm italic">Aucun champ méta défini</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 mt-4">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
        Champs de métadonnées
      </p>
      {metaFields.map((m: any) => (
        <div
          key={m.id}
          className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-emerald-200 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-200" />
            <span className="font-bold text-slate-700">{m.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-slate-100 px-2 py-1 rounded-md text-slate-500 font-mono">
              {m.type || "TEXT"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
