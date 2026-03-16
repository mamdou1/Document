import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Password } from "primereact/password";
import { Divider } from "primereact/divider";
import { useAuth } from "../../context/AuthContext";
import {
  User,
  Mail,
  Phone,
  Hash,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Building2,
} from "lucide-react";

export default function InscriptionForm() {
  const { inscription } = useAuth();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Informations personnelles
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [num_matricule, setNum_matricule] = useState("");
  const [username, setUsername] = useState("");

  // Mot de passe
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Navigation
  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation des mots de passe
    if (password !== confirmPassword) {
      alert("❌ Les mots de passe ne correspondent pas");
      return;
    }

    const payload = {
      nom,
      prenom,
      email,
      telephone,
      num_matricule,
      username,
      password,
    };

    try {
      await inscription(payload);
      alert("✅ Inscription réussie !");
    } catch (error: any) {
      alert(
        "❌ Erreur lors de l'inscription : " +
          (error.response?.data?.message || error.message),
      );
    }
  };

  // Fonction pour vérifier la force du mot de passe
  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: "Vide", color: "bg-slate-200" };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const strengths = [
      { score: 0, label: "Très faible", color: "bg-red-500" },
      { score: 1, label: "Faible", color: "bg-orange-500" },
      { score: 2, label: "Moyen", color: "bg-yellow-500" },
      { score: 3, label: "Fort", color: "bg-emerald-500" },
      { score: 4, label: "Très fort", color: "bg-green-600" },
      { score: 5, label: "Excellent", color: "bg-emerald-700" },
    ];

    return strengths[Math.min(score, 5)];
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        {/* Header avec dégradé */}
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
              <Building2 size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">
                Création de compte
              </h1>
              <p className="text-emerald-100 text-sm mt-1 flex items-center gap-2">
                <Sparkles size={14} />
                Étape {step} sur 3
              </p>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="mt-6 flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-all ${
                  s <= step
                    ? "bg-emerald-400 shadow-lg shadow-emerald-500/50"
                    : "bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {/* ÉTAPE 1 - Informations personnelles */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-xl font-bold text-emerald-800 flex items-center gap-2">
                <User size={20} />
                Informations personnelles
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-2">
                    <User size={14} className="text-emerald-500" />
                    Nom
                  </label>
                  <InputText
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Votre nom"
                    className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-2">
                    <User size={14} className="text-emerald-500" />
                    Prénom
                  </label>
                  <InputText
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    placeholder="Votre prénom"
                    className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-2">
                  <Mail size={14} className="text-emerald-500" />
                  Email professionnel
                </label>
                <InputText
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@domaine.com"
                  className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-2">
                    <Phone size={14} className="text-emerald-500" />
                    Téléphone
                  </label>
                  <InputText
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    placeholder="+225 01 02 03 04"
                    className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-2">
                    <Hash size={14} className="text-emerald-500" />
                    Numéro matricule
                  </label>
                  <InputText
                    value={num_matricule}
                    onChange={(e) => setNum_matricule(e.target.value)}
                    placeholder="Ex: EMP-001"
                    className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* ÉTAPE 2 - Identifiants de connexion */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-xl font-bold text-emerald-800 flex items-center gap-2">
                <ShieldCheck size={20} />
                Identifiants de connexion
              </h2>

              <div className="space-y-2">
                <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-2">
                  <User size={14} className="text-emerald-500" />
                  Nom d'utilisateur
                </label>
                <InputText
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choisissez un nom d'utilisateur"
                  className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Indicateur de force du mot de passe */}
                {password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">
                        Force du mot de passe:
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full ${
                          passwordStrength.score <= 2
                            ? "bg-red-100 text-red-700"
                            : passwordStrength.score === 3
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{
                          width: `${(passwordStrength.score / 5) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full p-4 bg-slate-50 border-2 rounded-xl outline-none transition-all pr-12 ${
                      confirmPassword && password !== confirmPassword
                        ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                        : confirmPassword && password === confirmPassword
                          ? "border-emerald-500 bg-emerald-50/50"
                          : "border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>

                {/* Message de confirmation */}
                {confirmPassword && (
                  <div className="flex items-center gap-2 mt-1">
                    {password === confirmPassword ? (
                      <>
                        <CheckCircle size={14} className="text-emerald-500" />
                        <span className="text-xs text-emerald-600">
                          Les mots de passe correspondent
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle size={14} className="text-red-500" />
                        <span className="text-xs text-red-500">
                          Les mots de passe ne correspondent pas
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ÉTAPE 3 - Récapitulatif */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-xl font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle size={20} />
                Vérifiez vos informations
              </h2>

              <div className="bg-emerald-50/50 rounded-2xl border border-emerald-100 p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">
                      Nom
                    </p>
                    <p className="text-sm font-bold text-emerald-900">
                      {nom || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">
                      Prénom
                    </p>
                    <p className="text-sm font-bold text-emerald-900">
                      {prenom || "—"}
                    </p>
                  </div>
                </div>

                <Divider className="my-2" />

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail size={14} className="text-emerald-500" />
                    <p className="text-sm text-emerald-900">{email || "—"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={14} className="text-emerald-500" />
                    <p className="text-sm text-emerald-900">
                      {telephone || "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Hash size={14} className="text-emerald-500" />
                    <p className="text-sm text-emerald-900">
                      {num_matricule || "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <User size={14} className="text-emerald-500" />
                    <p className="text-sm text-emerald-900">
                      @{username || "—"}
                    </p>
                  </div>
                </div>

                <Divider className="my-2" />

                <div className="bg-emerald-100/50 rounded-xl p-4">
                  <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wider mb-2">
                    Sécurité
                  </p>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    <span className="text-xs text-emerald-800">
                      Mot de passe: {passwordStrength.label}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500 text-center">
                En cliquant sur "S'inscrire", vous acceptez nos conditions
                d'utilisation.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between gap-4 mt-8 pt-6 border-t border-slate-100">
            {step > 1 && (
              <Button
                type="button"
                label="Précédent"
                icon={<ArrowLeft size={16} className="mr-2" />}
                onClick={prevStep}
                className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none px-6 py-3 rounded-xl font-bold transition-all"
              />
            )}

            {step < 3 ? (
              <Button
                type="button"
                label="Suivant"
                icon={<ArrowRight size={16} className="ml-2" />}
                iconPos="right"
                onClick={nextStep}
                className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-8 py-3 rounded-xl shadow-lg shadow-emerald-200 transition-all font-bold ml-auto"
              />
            ) : (
              <Button
                type="submit"
                label="S'inscrire"
                icon={<CheckCircle size={16} className="mr-2" />}
                className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-8 py-3 rounded-xl shadow-lg shadow-emerald-200 transition-all font-bold ml-auto"
              />
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
