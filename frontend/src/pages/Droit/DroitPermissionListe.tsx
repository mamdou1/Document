import { useState } from "react";
import { Briefcase, Calendar, Search } from "lucide-react";
import type { Permission } from "../../interfaces";
import Pagination from "../../components/layout/Pagination";
import {
  PermissionAction,
  PermissionLabels, // ✅ Importer le type
} from "../../utils/permissionLabels";

type Props = {
  permissions: Permission[];
  createdAt?: string;
  permissionLabels: PermissionLabels; // ✅ Reçu du parent
};

export default function DroitPermissionListe({
  permissions,
  createdAt,
  permissionLabels, // ✅ Plus besoin de le charger ici
}: Props) {
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const getPermissionLabel = (resource: string, action: PermissionAction) => {
    const resourceLabels = permissionLabels[resource];
    return resourceLabels?.[action] ?? `${action} ${resource}`;
  };

  const formatDate = (date: string | undefined) =>
    date ? new Date(date).toLocaleString("fr-FR", { dateStyle: "long" }) : "-";

  const filtered = permissions.filter((p) => {
    const label = getPermissionLabel(p.resource, p.action).toLowerCase();
    return (
      label.includes(query.toLowerCase()) ||
      p.action.toLowerCase().includes(query.toLowerCase())
    );
  });

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  if (permissions.length === 0) {
    return (
      <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 mt-4">
        <p className="text-slate-400 text-sm italic">
          Aucune permission rattachée
        </p>
      </div>
    );
  }

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
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
        <table className="w-full text-left border-collapse bg-white">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-3 text-[10px] font-black text-slate-400 uppercase w-12">
                #
              </th>
              <th className="p-3 text-[10px] font-black text-slate-400 uppercase">
                Action
              </th>
              <th className="p-3 text-[10px] font-black text-slate-400 uppercase">
                Ressource
              </th>
              <th className="p-3 text-[10px] font-black text-slate-400 uppercase text-right">
                Création
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginated.map((perm, index) => (
              <tr
                key={perm.id}
                className="group hover:bg-emerald-50/30 transition-colors"
              >
                <td className="p-3 text-xs font-bold text-slate-400">
                  {String(
                    (currentPage - 1) * itemsPerPage + index + 1,
                  ).padStart(2, "0")}
                </td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                    {perm.action.toUpperCase()}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Briefcase size={14} className="text-slate-300" />
                    <span className="text-sm font-bold text-slate-700">
                      {getPermissionLabel(perm.resource, perm.action)}
                    </span>
                  </div>
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400">
                    <Calendar size={12} />
                    {formatDate(createdAt)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

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
