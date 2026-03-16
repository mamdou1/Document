import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import {
  Lock,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  updateForgotPassword,
  isStrongPassword,
  getPasswordStrength,
} from "../../api/auth";

export default function UpdatePassword() {
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  useEffect(() => {
    const token = localStorage.getItem("resetToken");
    if (!token) {
      toast.current?.show({
        severity: "warn",
        summary: "Session expirée",
        detail: "Veuillez recommencer la procédure",
        life: 3000,
      });
      setTimeout(() => navigate("/forgot-password"), 2000);
    }
  }, [navigate]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!newPassword) {
      newErrors.newPassword = "Le nouveau mot de passe est requis";
    } else if (newPassword.length < 8) {
      newErrors.newPassword =
        "Le mot de passe doit contenir au moins 8 caractères";
    } else if (!isStrongPassword(newPassword)) {
      newErrors.newPassword =
        "Le mot de passe doit contenir majuscule, minuscule, chiffre et caractère spécial";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "La confirmation est requise";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const token = localStorage.getItem("resetToken");
    if (!token) {
      setErrors({ general: "Session expirée. Veuillez recommencer." });
      setTimeout(() => navigate("/forgot-password"), 2000);
      return;
    }

    setLoading(true);
    try {
      await updateForgotPassword({ newPassword }, token);

      localStorage.removeItem("resetToken");
      localStorage.removeItem("resetEmail");

      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Mot de passe mis à jour avec succès",
        life: 3000,
      });

      setTimeout(() => {
        navigate("/connexion");
      }, 2000);
    } catch (err: any) {
      setErrors({ general: err.message });
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

  const passwordStrength = getPasswordStrength(newPassword);
  const passwordsMatch =
    newPassword && confirmPassword && newPassword === confirmPassword;

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
              <h1 className="text-2xl font-black">Nouveau mot de passe</h1>
              <p className="text-emerald-100 text-sm mt-1">
                Choisissez un mot de passe sécurisé
              </p>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {errors.general && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 font-medium">
                {errors.general}
              </p>
            </div>
          )}

          {/* Nouveau mot de passe */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full pl-12 pr-12 py-4 bg-slate-50 border-2 rounded-xl outline-none transition-all ${
                  errors.newPassword
                    ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    : "border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {newPassword && (
              <div className="mt-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Force:</span>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      passwordStrength.score <= 1
                        ? "bg-red-100 text-red-700"
                        : passwordStrength.score === 2
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {passwordStrength.message}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${passwordStrength.color}`}
                    style={{ width: `${(passwordStrength.score + 1) * 20}%` }}
                  />
                </div>
              </div>
            )}

            {errors.newPassword && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <XCircle size={12} />
                {errors.newPassword}
              </p>
            )}
          </div>

          {/* Confirmation */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full pl-12 pr-12 py-4 bg-slate-50 border-2 rounded-xl outline-none transition-all ${
                  errors.confirmPassword
                    ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    : passwordsMatch && confirmPassword
                      ? "border-emerald-500 bg-emerald-50/50"
                      : "border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {confirmPassword && (
              <div className="flex items-center gap-2 mt-2">
                {passwordsMatch ? (
                  <>
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span className="text-xs text-emerald-600">
                      Les mots de passe correspondent
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle size={14} className="text-red-500" />
                    <span className="text-xs text-red-500">
                      Les mots de passe ne correspondent pas
                    </span>
                  </>
                )}
              </div>
            )}

            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <XCircle size={12} />
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Conseils de sécurité */}
          <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
            <p className="text-[10px] font-black text-emerald-700 uppercase mb-2">
              Conseils de sécurité
            </p>
            <ul className="space-y-1 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${newPassword.length >= 8 ? "bg-emerald-500" : "bg-slate-300"}`}
                />
                Au moins 8 caractères
              </li>
              <li className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${/[A-Z]/.test(newPassword) ? "bg-emerald-500" : "bg-slate-300"}`}
                />
                Une majuscule
              </li>
              <li className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${/[a-z]/.test(newPassword) ? "bg-emerald-500" : "bg-slate-300"}`}
                />
                Une minuscule
              </li>
              <li className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${/\d/.test(newPassword) ? "bg-emerald-500" : "bg-slate-300"}`}
                />
                Un chiffre
              </li>
              <li className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? "bg-emerald-500" : "bg-slate-300"}`}
                />
                Un caractère spécial
              </li>
            </ul>
          </div>

          <Button
            type="submit"
            label={loading ? "Mise à jour..." : "Mettre à jour"}
            icon={<Save size={18} className="mr-2" />}
            loading={loading}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white border-none py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all font-bold"
          />
        </form>
      </div>
    </div>
  );
}
