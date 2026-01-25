// App.tsx
import { ConfirmDialog } from "primereact/confirmdialog";
import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./routers/AppRouter";

function App() {
  return (
    <AuthProvider>
      <ConfirmDialog />
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
