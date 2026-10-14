
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

function Dashboard() {
  const navigate = useNavigate();

  const usuarioGuardado = localStorage.getItem("sigoUsuario");
  const usuario = usuarioGuardado
    ? JSON.parse(usuarioGuardado)
    : null;

  function cerrarSesion() {
    localStorage.removeItem("sigoUsuario");
    navigate("/");
  }

  return (
    <Layout>
      <section className="dashboard-card">
        <h2>
          Bienvenido, {usuario ? usuario.nombre : "Usuario"}
        </h2>

        <p>Has iniciado sesión correctamente en SIGO-GN.</p>

        <p>
          <strong>Usuario:</strong>{" "}
          {usuario ? usuario.usuario : ""}
        </p>

        <p>
          <strong>Rol:</strong>{" "}
          {usuario ? usuario.rol : ""}
        </p>

        <button onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </section>
    </Layout>
  );
}

export default Dashboard;
