import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Key, ArrowRight, AlertCircle, Mail, RefreshCw } from "lucide-react";
import { verifyResetCode, forgotPassword } from "../../api/auth";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    // Récupérer l'email depuis le state ou localStorage si besoin
    const savedEmail = localStorage.getItem("resetEmail");
    if (savedEmail) setEmail(savedEmail);
  }, []);

  // VerifyEmail.tsx - Dans handleSubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    console.log("=".repeat(60));
    console.log("🔐 SUBMIT - Vérification du code");
    console.log("📅 Timestamp:", new Date().toISOString());
    console.log("📦 Code saisi:", code);

    if (!code || code.length < 6) {
      console.log("❌ Code invalide - longueur:", code?.length);
      setError("Code de vérification invalide");
      return;
    }

    const token = localStorage.getItem("resetToken");
    console.log(
      "🔑 Token récupéré du localStorage:",
      token ? `${token.substring(0, 15)}...` : "Aucun",
    );

    if (!token) {
      console.log("❌ Token manquant dans localStorage");
      setError("Session expirée. Veuillez recommencer.");
      setTimeout(() => navigate("/forgot-password"), 2000);
      return;
    }

    setLoading(true);
    try {
      console.log("📤 Envoi de la requête avec token et code:", code);
      const response = await verifyResetCode({ code }, token);
      console.log("✅ Réponse reçue:", response);

      toast.current?.show({
        severity: "success",
        summary: "Code valide",
        detail: "Vous pouvez maintenant changer votre mot de passe",
        life: 3000,
      });

      setTimeout(() => {
        navigate("/update-password");
      }, 2000);
    } catch (err: any) {
      console.error("❌ Erreur lors de la vérification:", err);
      console.error("❌ Message:", err.message);
      setError(err.message);
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: err.message,
        life: 5000,
      });
    } finally {
      setLoading(false);
      console.log("=".repeat(60));
    }
  };
  const handleResendCode = async () => {
    if (!email) {
      setError("Email non trouvé. Veuillez recommencer.");
      setTimeout(() => navigate("/send-code"), 2000);
      return;
    }

    setResendLoading(true);
    try {
      const response = await forgotPassword({ email });

      localStorage.setItem("resetToken", response.token!);

      toast.current?.show({
        severity: "success",
        summary: "Nouveau code envoyé",
        detail: "Vérifiez votre boîte de réception",
        life: 3000,
      });
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: err.message,
        life: 5000,
      });
    } finally {
      setResendLoading(false);
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
              <Key size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black">Vérification</h1>
              <p className="text-emerald-100 text-sm mt-1">
                Entrez le code reçu par email
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
              <Key size={14} className="text-emerald-500" />
              Code de vérification
            </label>
            <div className="relative">
              <Key
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <InputText
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="XXXXXX"
                maxLength={6}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all text-center text-2xl tracking-widest font-mono"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Code à 6 caractères envoyé à {email || "votre email"}
            </p>
          </div>

          <Button
            type="submit"
            label={loading ? "Vérification..." : "Vérifier le code"}
            icon={<ArrowRight size={18} className="mr-2" />}
            loading={loading}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white border-none py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all font-bold"
          />

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendLoading}
              className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-800 font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={resendLoading ? "animate-spin" : ""}
              />
              Renvoyer le code
            </button>

            <button
              type="button"
              onClick={() => navigate("/send-code")}
              className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
            >
              Modifier l'email
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
