import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useAuth } from "../../context/AuthContext";
import { Toast } from "primereact/toast";
import { Lock, Phone, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const auth = useAuth();
  const nav = useNavigate();
  const toast = useRef<Toast>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await auth.login(telephone, password);
      nav("/");
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Échec de connexion",
        detail: "Identifiant ou mot de passe incorrect.",
        life: 3000,
      });
    }
  };

  return (
    <div className=" flex items-center justify-center  font-sans">
      <Toast ref={toast} />

      {/* Container Principal */}
      <div className="flex w-full max-w-[1000px] h-[600px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden m-4">
        {/* Côté Gauche : Design & Branding */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 p-12 flex-col justify-between relative overflow-hidden">
          {/* Cercles décoratifs */}
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md border border-white/30">
                <ShieldCheck className="text-white" size={32} />
              </div>
              <span className="text-white font-black text-2xl tracking-tighter italic">
                FINANCE<span className="text-blue-300">PRO</span>
              </span>
            </div>
            <h2 className="text-4xl font-extrabold text-white leading-tight">
              Bienvenue sur votre <br />
              <span className="text-blue-300">Espace de Gestion</span>
            </h2>
            <p className="text-blue-100/70 mt-4 text-sm font-medium max-w-xs italic">
              Accédez à vos liquidations et statistiques financières en toute
              sécurité.
            </p>
          </div>

          <div className="relative z-10">
            <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">
              © 2025 Système de Liquidation
            </p>
          </div>
        </div>

        {/* Côté Droite : Formulaire */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center">
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl font-black text-slate-800 mb-2">
              Connexion
            </h1>
            <p className="text-slate-400 text-sm font-medium">
              Entrez vos accès pour continuer
            </p>
          </div>

          <form onSubmit={submit} className="space-y-6">
            {/* Champ Téléphone */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider">
                Téléphone
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <InputText
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="Ex: 01020304"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-100 transition-all text-sm font-semibold"
                />
              </div>
            </div>

            {/* Champ Mot de passe */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Mot de passe
                </label>
                <a
                  href="#"
                  className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-tighter"
                >
                  Oublié ?
                </a>
              </div>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Bouton de soumission */}
            <div className="pt-4">
              <Button
                label="Se connecter"
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-100 transition-all transform hover:-translate-y-0.5"
              />
            </div>
          </form>

          {/* Social Logins épurés */}
          <div className="mt-10">
            <div className="relative flex items-center justify-center mb-6">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                Ou continuer avec
              </span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            <div className="flex justify-center gap-4">
              <button className="p-3 bg-slate-50 rounded-xl hover:bg-blue-50 transition-colors border border-slate-100">
                <i className="pi pi-facebook text-blue-600" />
              </button>
              <button className="p-3 bg-slate-50 rounded-xl hover:bg-red-50 transition-colors border border-slate-100">
                <i className="pi pi-google text-red-500" />
              </button>
              <button className="p-3 bg-slate-50 rounded-xl hover:bg-sky-50 transition-colors border border-slate-100">
                <i className="pi pi-twitter text-sky-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
