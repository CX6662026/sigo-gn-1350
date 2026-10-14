
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { usuarios } from "../data/usuarios";

function Login() {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function iniciarSesion(e) {
    e.preventDefault();

    const encontrado = usuarios.find(
      (u) =>
        u.usuario === usuario &&
        u.contraseña === contrasena
    );

    if (encontrado) {
      const { contraseña, ...datosUsuario } = encontrado;
      localStorage.setItem(
        "sigoUsuario",
        JSON.stringify(datosUsuario)
      );

      navigate("/dashboard");
    } else {
      setError("Usuario o contraseña incorrectos.");
    }
  }

  return (
    <Layout>
      <section className="login-card">
        <h2>Iniciar sesión</h2>
        <p>Ingresa tus datos para acceder al sistema.</p>

        <form onSubmit={iniciarSesion}>
          <label htmlFor="usuario">Usuario</label>
          <input
            id="usuario"
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
          />

          <label htmlFor="contrasena">Contraseña</label>
          <input
            id="contrasena"
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
          />

          <button type="submit">Entrar</button>
        </form>

        {error && <p className="error-message">{error}</p>}
      </section>
    </Layout>
  );
}

export default Login;
