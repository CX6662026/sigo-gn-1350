
import { Navigate } from "react-router-dom";

function RutaProtegida({ children }) {
  const usuario = localStorage.getItem("sigoUsuario");

  if (!usuario) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default RutaProtegida;
