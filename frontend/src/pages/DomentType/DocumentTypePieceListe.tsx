import { useState } from "react";
import {
  FileCheck,
  Layers,
  ChevronDown,
  ChevronRight,
  GitMerge,
  PlusCircle,
  Search,
} from "lucide-react";
import { Button } from "primereact/button";
import Pagination from "../../components/layout/Pagination";

type Props = {
  pieces: any[];
  onAdd: () => void;
};

export default function DocumentTypePieceListe({ pieces, onAdd }: Props) {
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [expandedDivision, setExpandedDivision] = useState<string | null>(null);

  // 1. Filtrage global (Recherche par libellé ou code)
  const filtered = pieces.filter((p) =>
    `${p.libelle || ""} ${p.code_pieces || ""} ${p.division?.libelle || ""}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  // 2. Pagination de la liste filtrée
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // 3. Séparation des données paginées pour l'affichage
  const piecesSansDivision = paginated.filter((p) => !p.division?.libelle);

  const groupedPieces = paginated.reduce((acc: Record<string, any[]>, p) => {
    const divLibelle = p.division?.libelle;
    if (divLibelle) {
      if (!acc[divLibelle]) acc[divLibelle] = [];
      acc[divLibelle].push(p);
    }
    return acc;
  }, {});

  const toggleDivision = (libelle: string) => {
    setExpandedDivision(expandedDivision === libelle ? null : libelle);
  };

  return (
    <div className="space-y-6 mt-4">
      {/* BARRE DE RECHERCHE */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          size={16}
        />
        <input
          type="text"
          placeholder="Rechercher une pièce ou une division..."
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* SECTION PIÈCES GÉNÉRALES */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Pièces Générales
          </p>
          <Button
            onClick={onAdd}
            className="flex items-center gap-2 px-3 py-2 text-emerald-600 font-bold bg-emerald-50 hover:bg-emerald-500 hover:text-white rounded-lg transition-all border-none"
          >
            <PlusCircle size={15} />
            <span className="text-xs">Ajouter</span>
          </Button>
        </div>

        {piecesSansDivision.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm bg-white">
            <table className="w-full text-left border-collapse">
              <tbody className="divide-y divide-slate-50">
                {piecesSansDivision.map((item, index) => (
                  <tr
                    key={index}
                    className="group hover:bg-emerald-50/30 transition-colors"
                  >
                    <td className="p-3 text-xs font-bold text-slate-400 w-12">
                      {String(
                        (currentPage - 1) * itemsPerPage + index + 1,
                      ).padStart(2, "0")}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <FileCheck size={14} className="text-emerald-300" />
                        <span className="text-sm font-bold text-slate-700">
                          {item.libelle}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <span className="text-[10px] font-mono bg-slate-50 px-2 py-1 rounded">
                        {item.code_pieces}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !Object.keys(groupedPieces).length && (
            <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-slate-400 text-sm italic">
                Aucun résultat trouvé
              </p>
            </div>
          )
        )}
      </div>

      {/* SECTION DIVISIONS */}
      {Object.keys(groupedPieces).length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Par Division de production
          </p>
          {Object.entries(groupedPieces).map(([libelle, items]) => (
            <div
              key={libelle}
              className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm"
            >
              <button
                onClick={() => toggleDivision(libelle)}
                className={`w-full flex items-center justify-between p-4 transition-all ${
                  expandedDivision === libelle
                    ? "bg-emerald-50/50"
                    : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      expandedDivision === libelle
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <Layers size={16} />
                  </div>
                  <span
                    className={`font-bold text-sm ${
                      expandedDivision === libelle
                        ? "text-emerald-700"
                        : "text-slate-700"
                    }`}
                  >
                    {libelle}
                  </span>
                </div>
                {expandedDivision === libelle ? (
                  <ChevronDown size={18} className="text-emerald-500" />
                ) : (
                  <ChevronRight size={18} className="text-slate-400" />
                )}
              </button>
              {expandedDivision === libelle && (
                <div className="p-3 bg-slate-50/30 border-t border-slate-50 space-y-1">
                  {items.map((sec, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between ml-8 p-2 text-sm text-slate-600"
                    >
                      <div className="flex items-center gap-3">
                        <GitMerge size={14} className="text-slate-300" />
                        <span className="font-medium">{sec.libelle}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {sec.code_pieces}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* --- PAGINATION --- */}
      {filtered.length > itemsPerPage && (
        <div className="pt-4 border-t border-slate-100 flex justify-center">
          <Pagination
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filtered.length}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
