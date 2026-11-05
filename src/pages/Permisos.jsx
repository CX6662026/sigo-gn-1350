import Layout from "../components/Layout";

function Permisos() {
  const rol = localStorage.getItem("sigoRol");

  if (rol !== "Comandante") {
    return (
      <Layout>
        <h2 style={{ color: "#000000", textAlign: "center" }}>
  No tienes permiso para acceder a esta página.
    </h2>
      </Layout>
    );
  }

  const roles = [
    {
      nombre: "Comandante",
      octal: 7,
      simbolico: "rwx",
      descripcion: "Leer, editar y eliminar"
    },
    {
      nombre: "Oficial",
      octal: 6,
      simbolico: "rw-",
      descripcion: "Leer y editar"
    },
    {
      nombre: "Analista",
      octal: 4,
      simbolico: "r--",
      descripcion: "Solo lectura"
    }
  ];

  return (
    <Layout>
      <h1>Administración de permisos</h1>

      <table>
        <thead>
          <tr>
            <th>Rol</th>
            <th>Octal</th>
            <th>Simbólico</th>
            <th>Permisos</th>
          </tr>
        </thead>

        <tbody>
          {roles.map((rol) => (
            <tr key={rol.nombre}>
              <td>{rol.nombre}</td>
              <td>{rol.octal}</td>
              <td>{rol.simbolico}</td>
              <td>{rol.descripcion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}

export default Permisos;