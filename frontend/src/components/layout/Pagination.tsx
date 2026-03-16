// import React from "react";

// type PaginationProps = {
//   currentPage: number;
//   itemsPerPage: number;
//   totalItems: number;
//   onPageChange: (page: number) => void;
// };

// export default function Pagination({
//   currentPage,
//   itemsPerPage,
//   totalItems,
//   onPageChange,
// }: PaginationProps) {
//   const totalPages = Math.ceil(totalItems / itemsPerPage);
//   const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

//   return (
//     <div className="flex justify-center items-center gap-2 mt-6">
//       <button
//         disabled={currentPage === 1}
//         onClick={() => onPageChange(currentPage - 1)}
//         className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-40 transition"
//       >
//         Précédent
//       </button>

//       {pages.map((page) => (
//         <button
//           key={page}
//           onClick={() => onPageChange(page)}
//           className={`px-3 py-2 rounded-lg transition ${
//             currentPage === page
//               ? "bg-blue-600 text-white"
//               : "bg-white border text-gray-700 hover:bg-blue-100"
//           }`}
//         >
//           {page}
//         </button>
//       ))}

//       <button
//         disabled={currentPage === totalPages}
//         onClick={() => onPageChange(currentPage + 1)}
//         className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-40 transition"
//       >
//         Suivant
//       </button>
//     </div>
//   );
// }

import React from "react";

type PaginationProps = {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const pageWindow = 5;
  const halfWindow = Math.floor(pageWindow / 2);

  let startPage = Math.max(currentPage - halfWindow, 1);
  let endPage = Math.min(startPage + pageWindow - 1, totalPages);

  if (endPage - startPage < pageWindow - 1) {
    startPage = Math.max(endPage - pageWindow + 1, 1);
  }

  const pages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i,
  );

  return (
    <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-40 transition"
      >
        Précédent
      </button>

      {/* Début */}
      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-2 rounded-lg bg-white border text-gray-700 hover:bg-blue-100"
          >
            1
          </button>
          {startPage > 2 && <span className="px-2 text-gray-400">...</span>}
        </>
      )}

      {/* Fenêtre centrale */}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-2 rounded-lg transition ${
            currentPage === page
              ? "bg-emerald-600 text-white"
              : "bg-white border text-gray-700 hover:bg-blue-100"
          }`}
        >
          {page}
        </button>
      ))}

      {/* Fin */}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && (
            <span className="px-2 text-gray-400">...</span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-2 rounded-lg bg-white border text-gray-700 hover:bg-blue-100"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-40 transition"
      >
        Suivant
      </button>
    </div>
  );
}
