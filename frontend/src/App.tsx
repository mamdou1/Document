// App.tsx
import { ConfirmDialog } from "primereact/confirmdialog";
import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./routers/AppRouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Créer un client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Évite les refetch inutiles
      retry: 1, // Réessaie 1 fois en cas d'erreur
      staleTime: 5 * 60 * 1000, // Les données sont fraîches pendant 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ConfirmDialog />
        <AppRouter />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
