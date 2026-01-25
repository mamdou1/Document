import { useRef, useState } from "react";
import Layout from "../../components/layout/Layoutt";
import { Toast } from "primereact/toast";
import Pagination from "../../components/layout/Pagination";
import { Search } from "lucide-react";
import type { Exercice } from "../../interfaces";
import { Checkbox } from "primereact/checkbox";

export default function RecherchePage() {
  const toast = useRef<Toast>(null);
  const [allExercices, setAllExercices] = useState<Exercice[]>([]);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const teste = false;

  const filtered = allExercices.filter((e) =>
    String(e.annee).includes(query.trim())
  );

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Layout>
      <Toast ref={toast} />

      {/* Header de Page */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-blue-800 p-3 rounded-2xl text-white shadow-lg shadow-blue-100">
              <Search size={26} />
            </div>
            <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">
              Recherche
            </h1>
          </div>
          <p className="text-slate-500 font-medium ml-14">
            Dans cette interface vous pouvez faire des recherches avancé
          </p>
        </div>
      </div>

      {/* Barre d'outils / Filtres */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex items-center">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-sm"
            placeholder="Rechercher une année..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex ">
        <div className="flex mr-5">
          <p>Programme</p>
          <Checkbox
            checked={teste}
            onChange={() => paginated}
            className="custom-checkbox border border-blue-300 ml-4"
          />
        </div>
        <div className="flex mr-5">
          <p>Chapitre</p>
          <Checkbox
            checked={teste}
            onChange={() => paginated}
            className="custom-checkbox border border-blue-300 ml-4"
          />
        </div>
        <div className="flex mr-5">
          <p>Nature</p>
          <Checkbox
            checked={teste}
            onChange={() => paginated}
            className="custom-checkbox border border-blue-300 ml-4"
          />
        </div>
        {/* <div className="flex mr-5">
          <p>Programme</p>
          <Checkbox
            checked={teste}
            onChange={() => paginated}
            className="custom-checkbox border border-blue-300 ml-4"
          />
        </div>
        <div className="flex mr-5">
          <p>Programme</p>
          <Checkbox
            checked={teste}
            onChange={() => paginated}
            className="custom-checkbox border border-blue-300 ml-4"
          />
        </div> */}
      </div>

      {/* Pagination Container */}
      <div className="mt-6 flex justify-center">
        <Pagination
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filtered.length}
          onPageChange={setCurrentPage}
        />
      </div>
    </Layout>
  );
}
