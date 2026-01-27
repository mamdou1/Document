import React, { ReactElement } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthSwitcher from "../pages/Auth/AuthSwitcher";
import Pieces from "../pages/Pieces/PiecesPage";
import Dashboard from "../pages/Dashboard/Dashboard";
import Membre from "../pages/Membres/UserPage";
import Type from "../pages/Type/TypePage";
import ExercicePage from "../pages/Exercice/ExercicePage";
import ProgrammePage from "../pages/Programme/ProgrammePage";
import ChapitrePage from "../pages/Chapitre/ChapitrePage";
import NaturePage from "../pages/Nature/NaturePage";
import LiquidationPage from "../pages/Liquidation/LiquidationPage";
import FournisseurPage from "../pages/Fournisseur/FournisseurPage";
import ServiceBeneficiarePage from "../pages/Service Beneficiare/ServiceBeneficiarePage";
import RecherchePage from "../pages/Recherche/Recherche";
import DroitPage from "../pages/Droit/DroitPage";
import ServicePage from "../pages/Service/ServicePage";
import SectionPage from "../pages/Section/SectionPage";
import DivisionPage from "../pages/Division/DivisionPage";
import { useAuth } from "../context/AuthContext";
import HistoriquePage from "../pages/HistoriqueLog/HistoriquePage";
import SourceDeFinancementPage from "../pages/Source De Financement/SourceDeFinancementPage";
import DocumentTypePage from "../pages/DomentType/DocumentTypePage";
import DocumentPage from "../pages/Document/DocumentPage";

// 🔥FIX ICI🔥
const PrivateRoute: React.FC<{ children: ReactElement }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Chargement...</div>;

  // ❗ condition correcte
  if (!user) return <Navigate to="/connexion" replace />;

  return children;
};

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/connexion" element={<AuthSwitcher />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/agents"
        element={
          <PrivateRoute>
            <Membre />
          </PrivateRoute>
        }
      />

      <Route
        path="/exercices"
        element={
          <PrivateRoute>
            <ExercicePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/programmes"
        element={
          <PrivateRoute>
            <ProgrammePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/chapitres"
        element={
          <PrivateRoute>
            <ChapitrePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/natures"
        element={
          <PrivateRoute>
            <NaturePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/liquidations"
        element={
          <PrivateRoute>
            <LiquidationPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/type"
        element={
          <PrivateRoute>
            <Type />
          </PrivateRoute>
        }
      />
      <Route
        path="/pieces"
        element={
          <PrivateRoute>
            <Pieces />
          </PrivateRoute>
        }
      />
      <Route
        path="/fournisseur"
        element={
          <PrivateRoute>
            <FournisseurPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/serviceBeneficiaire"
        element={
          <PrivateRoute>
            <ServiceBeneficiarePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/recherche"
        element={
          <PrivateRoute>
            <RecherchePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/profils"
        element={
          <PrivateRoute>
            <DroitPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/service"
        element={
          <PrivateRoute>
            <ServicePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/section"
        element={
          <PrivateRoute>
            <SectionPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/division"
        element={
          <PrivateRoute>
            <DivisionPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/historique"
        element={
          <PrivateRoute>
            <HistoriquePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/sourceDeFinancement"
        element={
          <PrivateRoute>
            <SourceDeFinancementPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/document"
        element={
          <PrivateRoute>
            <DocumentPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/dossierType"
        element={
          <PrivateRoute>
            <DocumentTypePage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
