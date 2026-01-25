import { useState } from "react";
import { User as UserIcon, Search } from "lucide-react";
import type { User } from "../../interfaces";
import Pagination from "../../components/layout/Pagination";

type Props = {
  agents: User[];
};

export default function DroitAgentListe({ agents }: Props) {
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Réduit pour l'exemple dans un Dialog
  if (agents.length === 0) {
    return (
      <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 mt-4">
        <p className="text-slate-400 text-sm italic">Aucun agent rattaché</p>
      </div>
    );
  }

  const filtered = agents.filter((l) =>
    `${l.nom || ""} ${l.prenom || ""} ${l.telephone || ""}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="space-y-4 mt-4">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          size={16}
        />
        <input
          type="text"
          placeholder="Rechercher une permission..."
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm mt-4">
        <table className="w-full text-left border-collapse bg-white">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-wider w-12">
                #
              </th>
              <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Nom
              </th>
              <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Prénom
              </th>
              <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">
                Téléphone
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginated.map((ag, index) => (
              <tr
                key={ag.id}
                className="group hover:bg-indigo-50/30 transition-colors"
              >
                <td className="p-3">
                  <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-500">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <UserIcon
                      size={14}
                      className="text-slate-300 group-hover:text-indigo-400"
                    />
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase">
                      {ag.nom}
                    </span>
                  </div>
                </td>
                <td className="p-3">
                  <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">
                    {ag.prenom || "-"}
                  </span>
                </td>
                <td className="p-3 text-right text-sm text-slate-600 font-medium">
                  {ag.telephone}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* --- PAGINATION --- */}
        {filtered.length > itemsPerPage && (
          <div className="p-4 border-t border-slate-50 flex justify-center bg-slate-50/50">
            <Pagination
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filtered.length}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
