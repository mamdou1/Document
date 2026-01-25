import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useAuth } from "../../context/AuthContext";

type Genre = "HOMME" | "FEMME";

export default function InscriptionForm() {
  // Étape actuelle
  const { inscription } = useAuth();
  const [step, setStep] = useState(1);

  // Données du gym
  const [gymNom, setGymNom] = useState("");
  const [gymAdresse, setGymAdresse] = useState("");
  const [gymTelephone, setGymTelephone] = useState("");

  // Données de l’admin
  const [adminNom, setAdminNom] = useState("");
  const [adminPrenom, setAdminPrenom] = useState("");
  const [adminAdresse, setAdminAdresse] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminGenre, setAdminGenre] = useState<Genre>("HOMME");

  // Données de connexion
  const [telConnexion, setTelConnexion] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Navigation
  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nomGym: gymNom,
      adresseGym: gymAdresse,
      telephoneGym: gymTelephone,
      nomAdmin: adminNom,
      prenomAdmin: adminPrenom,
      emailAdmin: adminEmail,
      passwordAdmin: password,
      telephoneAdmin: telConnexion,
      adresseAdmin: adminAdresse,
    };

    try {
      await inscription(payload);
      alert("✅ Inscription réussie !");
    } catch (error: any) {
      alert(
        "❌ Erreur lors de l'inscription : " +
          (error.response?.data?.message || error.message)
      );
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-center px-8 py-6 bg-white w-full h-full"
    >
      <h2 className="text-2xl font-bold mb-6 mt-4">
        Étape {step} / 4 -{" "}
        {step === 1
          ? "Informations du Gym"
          : step === 2
          ? "Informations de l’Admin"
          : step === 3
          ? "Connexion"
          : "Récapitulatif"}
      </h2>

      {/* --- ÉTAPE 1 --- */}
      {step === 1 && (
        <div className="w-full">
          <InputText
            value={gymNom}
            onChange={(e) => setGymNom((e.target as HTMLInputElement).value)}
            placeholder="Nom du gym"
            className="w-full mb-4 h-11 p-2 border"
          />
          <InputText
            value={gymAdresse}
            onChange={(e) =>
              setGymAdresse((e.target as HTMLInputElement).value)
            }
            placeholder="Adresse du gym"
            className="w-full mb-4 h-11 p-2 border"
          />
          <InputText
            value={gymTelephone}
            onChange={(e) =>
              setGymTelephone((e.target as HTMLInputElement).value)
            }
            placeholder="Téléphone du gym"
            className="w-full mb-4 h-11 p-2 border"
          />
        </div>
      )}

      {/* --- ÉTAPE 2 --- */}
      {step === 2 && (
        <div className="w-full">
          <InputText
            value={adminNom}
            onChange={(e) => setAdminNom((e.target as HTMLInputElement).value)}
            placeholder="Nom"
            className="w-full mb-4 h-11 p-2 border"
          />
          <InputText
            value={adminPrenom}
            onChange={(e) =>
              setAdminPrenom((e.target as HTMLInputElement).value)
            }
            placeholder="Prénom"
            className="w-full mb-4 h-11 p-2 border"
          />
          <InputText
            value={adminAdresse}
            onChange={(e) =>
              setAdminAdresse((e.target as HTMLInputElement).value)
            }
            placeholder="Adresse"
            className="w-full mb-4 h-11 p-2 border"
          />
          <InputText
            value={adminEmail}
            onChange={(e) =>
              setAdminEmail((e.target as HTMLInputElement).value)
            }
            placeholder="Email"
            className="w-full mb-4 h-11 p-2 border"
          />

          <div className="flex items-center justify-between w-full mb-6">
            <label className="font-semibold text-gray-600">Genre :</label>
            <select
              value={adminGenre}
              onChange={(e) => setAdminGenre(e.target.value as Genre)}
              className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
            >
              <option value="HOMME">Homme</option>
              <option value="FEMME">Femme</option>
            </select>
          </div>
        </div>
      )}

      {/* --- ÉTAPE 3 --- */}
      {step === 3 && (
        <div className="w-full">
          <InputText
            value={telConnexion}
            onChange={(e) =>
              setTelConnexion((e.target as HTMLInputElement).value)
            }
            placeholder="Téléphone"
            className="w-full mb-6 h-11 p-2 border"
          />

          {/* Mot de passe */}
          <div className="relative w-full mb-4">
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-pink-300 focus:border-[3px] transition-all duration-300 pr-10"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-pink-500"
            >
              {show ? (
                <i className="pi pi-eye-slash" />
              ) : (
                <i className="pi pi-eye" />
              )}
            </button>
          </div>

          {/* Confirmation */}
          <div className="relative w-full mb-6">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmer le mot de passe"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-pink-300 focus:border-[3px] transition-all duration-300 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-pink-500"
            >
              {showConfirm ? (
                <i className="pi pi-eye-slash" />
              ) : (
                <i className="pi pi-eye" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* --- ÉTAPE 4 --- */}
      {step === 4 && (
        <div className="text-left w-full text-sm bg-gray-50 p-4 rounded-lg border mb-4">
          <h3 className="font-bold mb-2 text-lg">Récapitulatif :</h3>
          <p>
            🏋️‍♂️ <b>Gym :</b> {gymNom} - {gymAdresse} ({gymTelephone})
          </p>
          <p>
            👤 <b>Admin :</b> {adminPrenom} {adminNom} - {adminEmail}
          </p>
          <p>
            📍 <b>Adresse :</b> {adminAdresse}
          </p>
          <p>
            🚻 <b>Genre :</b> {adminGenre}
          </p>
          <p>
            📞 <b>Téléphone connexion :</b> {telConnexion}
          </p>
        </div>
      )}

      {/* --- Navigation --- */}
      <div className="flex justify-between w-full mt-6">
        {step > 1 && (
          <Button
            type="button"
            label="Précédent"
            onClick={prevStep}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md"
          />
        )}
        {step < 4 && (
          <Button
            type="button"
            label="Suivant"
            onClick={nextStep}
            className="ml-auto bg-pink-500 text-white px-6 py-2 rounded-md"
          />
        )}
        {step === 4 && (
          <Button
            label="S'inscrire"
            type="submit"
            className="ml-auto bg-green-500 text-white px-6 py-2 rounded-md"
          />
        )}
      </div>
    </form>
  );
}
