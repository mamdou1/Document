import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import {
  Briefcase,
  Building2,
  Layers,
  GitMerge,
  Calendar,
  Hash,
} from "lucide-react";
import type { Fonction } from "../../interfaces";

type Props = {
  visible: boolean;
  onHide: () => void;
  fonction: Fonction | null;
  titres?: {
    entitee1: string;
    entitee2: string;
    entitee3: string;
  };
};

export default function FonctionDetails({
  visible,
  onHide,
  fonction,
  titres = { entitee1: "Entité 1", entitee2: "Entité 2", entitee3: "Entité 3" },
}: Props) {
  if (!fonction) return null;

  const formatDate = (date?: string) => {
    if (!date) return "Non définie";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog
      header={
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-xl">
            <Briefcase size={20} className="text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">
              Détails de la fonction
            </h2>
            <p className="text-xs text-slate-500">Informations complètes</p>
          </div>
        </div>
      }
      visible={visible}
      style={{ width: "700px" }}
      onHide={onHide}
      className="rounded-3xl"
    >
      <div className="space-y-5 p-2">
        {/* Identité */}
        <div className="bg-gradient-to-br from-emerald-50 to-white p-5 rounded-2xl border border-emerald-100">
          <h3 className="text-xs font-black uppercase text-emerald-600 tracking-wider mb-3 flex items-center gap-2">
            <Briefcase size={14} /> Identité
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Hash size={16} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  ID
                </p>
                <p className="font-bold text-slate-800">#{fonction.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Briefcase size={16} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Libellé
                </p>
                <p className="font-bold text-slate-800 text-lg">
                  {fonction.libelle}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Affectation */}
        <div className="bg-gradient-to-br from-emerald-50 to-white p-5 rounded-2xl border border-emerald-100">
          <h3 className="text-xs font-black uppercase text-emerald-600 tracking-wider mb-3">
            Affectation
          </h3>
          <div className="space-y-3">
            {/* Niveau 1 */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Building2 size={16} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  {titres.entitee1}
                </p>
                <p className="font-medium text-slate-700">
                  {fonction.entitee_un?.libelle || "Non affecté"}
                </p>
                {fonction.entitee_un && (
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Code: {fonction.entitee_un.code}
                  </p>
                )}
              </div>
            </div>

            {/* Niveau 2 */}
            {fonction.entitee_deux && (
              <div className="flex items-center gap-3 ml-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Layers size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    {titres.entitee2}
                  </p>
                  <p className="font-medium text-slate-700">
                    {fonction.entitee_deux.libelle}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Code: {fonction.entitee_deux.code}
                  </p>
                </div>
              </div>
            )}

            {/* Niveau 3 */}
            {fonction.entitee_trois && (
              <div className="flex items-center gap-3 ml-8">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <GitMerge size={16} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    {titres.entitee3}
                  </p>
                  <p className="font-medium text-slate-700">
                    {fonction.entitee_trois.libelle}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Code: {fonction.entitee_trois.code}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Métadonnées */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
          <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-3">
            Informations système
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-slate-400" />
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase">
                  Créé le
                </p>
                <p className="text-xs font-medium text-slate-600">
                  {formatDate(fonction.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-slate-400" />
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase">
                  Modifié le
                </p>
                <p className="text-xs font-medium text-slate-600">
                  {formatDate(fonction.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
        <Button
          label="Fermer"
          onClick={onHide}
          className="p-button-text text-slate-500"
        />
      </div>
    </Dialog>
  );
}
