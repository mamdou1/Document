import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import {
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { forgotPassword } from "../../api/auth";

export default function SendEmail() {
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("L'email est requis");
      return;
    }

    if (!validateEmail(email)) {
      setError("Format d'email invalide");
      return;
    }

    setLoading(true);
    try {
      const response = await forgotPassword({ email });

      // ✅ Vérification que le token existe
      if (!response.token) {
        throw new Error("Erreur lors de la réception du token");
      }

      toast.current?.show({
        severity: "success",
        summary: "Email envoyé",
        detail: "Vérifiez votre boîte de réception",
        life: 3000,
      });

      // Stocker le token et rediriger
      localStorage.setItem("resetToken", response.token!);

      setTimeout(() => {
        navigate("/verify-code");
      }, 2000);
    } catch (err: any) {
      setError(err.message);
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: err.message,
        life: 5001,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 flex items-center justify-center p-4">
      <Toast ref={toast} position="top-center" />

      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
              <Lock size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black">Mot de passe oublié ?</h1>
              <p className="text-emerald-100 text-sm mt-1">
                Recevez un code de réinitialisation
              </p>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-2">
              <Mail size={14} className="text-emerald-500" />
              Adresse email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <InputText
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemple@domaine.com"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Un code de vérification vous sera envoyé par email
            </p>
          </div>

          <Button
            type="submit"
            label={loading ? "Envoi en cours..." : "Envoyer le code"}
            icon={<ArrowRight size={18} className="mr-2" />}
            loading={loading}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white border-none py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all font-bold"
          />

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate("/connexion")}
              className="text-sm text-emerald-600 hover:text-emerald-800 font-medium transition-colors"
            >
              Retour à la connexion
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
