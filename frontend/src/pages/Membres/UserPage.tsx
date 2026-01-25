import { useState, useEffect, useRef } from "react";
import Layout from "../../components/layout/Layoutt";
import UserForm from "./UsersForm";
import type { User, Role } from "../../interfaces";
import UserDetails from "./UserDetails";
import UserPermission from "./UserPermission";
import { getUsers, createUser, updateUser, deleteUser } from "../../api/users";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { confirmDialog } from "primereact/confirmdialog";
import { useAuth } from "../../context/AuthContext";
import { Dropdown } from "primereact/dropdown";
import Pagination from "../../components/layout/Pagination";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit3,
  Trash2,
  ShieldCheck,
  XCircle,
  ArrowUpDown,
} from "lucide-react";
import { getDroits } from "../../api/droit";
//import { getAllServices } from "../../api/service";
import { Droit, Fonction } from "../../interfaces";

export default function UserPage() {
  const [allUser, setAllUser] = useState<User[]>([]);
  //const [allServices, setAllServices] = useState<Service[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailsUser, setDetailsUser] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<Partial<User> | null>(null);
  const toast = useRef<Toast>(null);
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "">("");
  const [champDeTrie, setChampDeTrie] = useState<keyof User>("prenom");
  const [OrdreDeTrie, setOrdreDeTrie] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [droit, setDroit] = useState<Droit[]>([]);
  const [fonction, setFonction] = useState<Fonction[]>([]);

  const affichage = async () => {
    setLoading(true);
    try {
      const [u, dr] = await Promise.all([getUsers(), getDroits()]);
      setAllUser(Array.isArray(u) ? u : []);
      setDroit(Array.isArray(dr) ? dr : []);
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Impossible de charger les membres",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    affichage();
  }, []);

  const onCreate = async (payload: Partial<User>, photoFile?: File) => {
    try {
      const saved = await createUser(payload, photoFile);
      setAllUser((s) => [saved, ...s]);
      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Utilisateur créé",
      });
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Échec de création",
      });
    }
  };

  const onEdit = async (payload: Partial<User>, photoFile?: File) => {
    if (!editing?.id) return;
    try {
      const update = await updateUser(payload, editing.id, photoFile);
      setAllUser((s) => s.map((g) => (g.id === update.id ? update : g)));
      toast.current?.show({
        severity: "success",
        summary: "Mis à jour",
        detail: "Utilisateur modifié",
      });
      setEditing(null);
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Échec de modification",
      });
    }
  };

  const handleDelete = async (id: string) => {
    confirmDialog({
      message: "Voulez-vous vraiment supprimer ce membre ?",
      header: "Confirmation de suppression",
      icon: "pi pi-info-circle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await deleteUser(id);
          setAllUser((s) => s.filter((g) => g.id !== id));
          toast.current?.show({
            severity: "success",
            summary: "Supprimé",
            detail: "Membre retiré",
          });
        } catch (err) {
          toast.current?.show({
            severity: "error",
            summary: "Erreur",
            detail: "Échec de suppression",
          });
        }
      },
    });
  };

  const roleOption = [
    { label: "Tous les rôles", value: "" },
    { label: "Administrateur", value: "ADMIN" },
    { label: "Membre", value: "MEMBRE" },
    { label: "Membre Autorisé", value: "MEMBRE_AUTHORIZE" },
  ];

  const filteredUsers = allUser.filter((u) => {
    const matchesSearch = [
      u.nom,
      u.prenom,
      //u.fonction,
      u.telephone,
    ]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesRole = roleFilter === "" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aVal = String(a[champDeTrie] || "").toLowerCase();
    const bVal = String(b[champDeTrie] || "").toLowerCase();
    return OrdreDeTrie === "asc"
      ? aVal.localeCompare(bVal)
      : bVal.localeCompare(aVal);
  });

  const paginatedUser = sortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Layout>
      <Toast ref={toast} />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-blue-800 p-3 rounded-2xl text-white shadow-lg shadow-blue-100">
              <Users size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                Gestion des <span className="text-blue-600">Agent</span>
              </h1>
            </div>
          </div>
          <div>
            <p className="text-slate-500 font-medium mt-5 ml-5">
              Consultez et gérez les accès des agents à platforme (
              {allUser.length})
            </p>
          </div>
        </div>

        {user?.role === "ADMIN" && (
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white border-none px-6 py-3 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95"
            onClick={() => {
              setEditing(null);
              setFormVisible(true);
            }}
          >
            <UserPlus size={20} className="mr-2" />
            <span className="font-bold">Nouveau membre</span>
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[300px] relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
            size={18}
          />
          <InputText
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 transition-all"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un nom, téléphone..."
            value={query}
          />
        </div>

        <div className="w-64">
          <Dropdown
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.value)}
            options={roleOption}
            placeholder="Filtrer par rôle"
            className="w-full bg-slate-50 border-slate-200 rounded-xl"
          />
        </div>

        {(query || roleFilter) && (
          <button
            onClick={() => {
              setQuery("");
              setRoleFilter("");
            }}
            className="flex items-center gap-2 text-red-500 font-semibold hover:bg-red-50 px-4 py-2 rounded-xl transition-all"
          >
            <XCircle size={18} />
            Réinitialiser
          </button>
        )}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center w-24">
                Photo
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center w-24">
                Num matricule
              </th>
              <th
                className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => {
                  setChampDeTrie("prenom");
                  setOrdreDeTrie(OrdreDeTrie === "asc" ? "desc" : "asc");
                }}
              >
                <div className="flex items-center gap-2">
                  Prénom <ArrowUpDown size={14} />
                </div>
              </th>
              <th
                className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => {
                  setChampDeTrie("nom");
                  setOrdreDeTrie(OrdreDeTrie === "asc" ? "desc" : "asc");
                }}
              >
                <div className="flex items-center gap-2">
                  Nom <ArrowUpDown size={14} />
                </div>
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                Fonction
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center w-24">
                Téléphone
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginatedUser.map((u) => (
              <tr
                key={u.id}
                onClick={() => {
                  setSelectedUser(u);
                  setDetailsUser(true);
                }}
                className="cursor-pointer hover:bg-blue-50/30 transition-all group"
              >
                <td className="px-6 py-4 flex justify-center">
                  <div className="relative">
                    {u.photoProfil ? (
                      <img
                        src={`http://localhost:5000/uploads/profiles/${u.photoProfil}`}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-white shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-800">
                        <Users size={20} />
                      </div>
                    )}
                    <div
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        u.role === "ADMIN" ? "bg-amber-400" : "bg-emerald-400"
                      }`}
                    ></div>
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-slate-700">
                  {u.num_matricule}
                </td>
                <td className="px-6 py-4 font-bold text-slate-700">
                  {u.prenom}
                </td>
                <td className="px-6 py-4 font-bold text-slate-700">{u.nom}</td>
                <td className="px-6 py-4">
                  <span className="text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-lg text-sm italic">
                    {u.fonction_details?.libelle || "Non défini"}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-slate-700">
                  {u.telephone}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setSelectedUser(u);
                        setDetailsUser(true);
                      }}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Voir détails"
                    >
                      <Eye size={18} />
                    </button>
                    {/* <button
                      onClick={() => {
                        setSelectedAgentId(u.id as any);
                        setPermissionModal(true);
                      }}
                      className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                      title="Permissions"
                    >
                      <ShieldCheck size={18} />
                    </button> */}
                    <button
                      onClick={(e) => {
                        setEditing(u);
                        setFormVisible(true);
                        e.stopPropagation();
                      }}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                      title="Modifier"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        handleDelete(u.id as any);
                        e.stopPropagation();
                      }}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && (
          <div className="p-12 text-center text-blue-500 font-bold animate-pulse">
            Chargement des données...
          </div>
        )}
        {paginatedUser.length === 0 && !loading && (
          <div className="p-12 text-center">
            <div className="text-slate-300 mb-2 flex justify-center">
              <Search size={48} />
            </div>
            <p className="text-slate-500 font-bold italic">
              Aucun membre ne correspond à votre recherche
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-center">
        <Pagination
          currentPage={currentPage}
          totalItems={filteredUsers.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      <UserForm
        visible={formVisible}
        onHide={() => {
          setEditing(null);
          setFormVisible(false);
        }}
        onSubmit={editing ? onEdit : onCreate}
        initial={editing || undefined}
        title={editing ? "Modifier le membre" : "Ajouter un nouveau membre"}
        droits={droit}
      />

      <UserDetails
        visible={detailsUser}
        onHide={() => {
          setDetailsUser(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />

      {/* <UserPermission
        visible={permissionModal}
        agentId={selectedAgentId}
        onHide={() => setPermissionModal(false)}
      /> */}
    </Layout>
  );
}
