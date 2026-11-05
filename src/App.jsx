
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Expedientes from "./pages/Expedientes";
import Permisos from "./pages/Permisos";
import RutaProtegida from "./components/RutaProtegida";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <RutaProtegida>
              <Dashboard />
            </RutaProtegida>
          }
        />

        <Route
          path="/expedientes"
          element={
            <RutaProtegida>
              <Expedientes />
            </RutaProtegida>
          }
        />

        <Route
          path="/permisos"
          element={
            <RutaProtegida>
              <Permisos />
            </RutaProtegida>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

