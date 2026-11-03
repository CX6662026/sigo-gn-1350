
import { useEffect, useState } from "react";

const API = "http://localhost:4000/expedientes";

function Expedientes() {
  const [expedientes, setExpedientes] = useState([]);
  const [formulario, setFormulario] = useState({
    folio: "",
    nombre: "",
    tipoIncidente: "",
    zona: "",
    fecha: "",
    descripcion: ""
  });
  const [editando, setEditando] = useState(false);
  const [cargando, setCargando] = useState(true);

  // Consultar expedientes al cargar la pantalla
  const cargarExpedientes = async () => {
    try {
      const respuesta = await fetch(API);
      if (!respuesta.ok) throw new Error("No se pudieron cargar los expedientes");
      const datos = await respuesta.json();
      setExpedientes(datos);
    } catch {
      alert("Error al conectar con el servidor. Comprueba que siga encendido.");
    } finally {
      setCargando(false);
    }
  };

useEffect(() => {
  const obtenerDatos = async () => {
    await cargarExpedientes();
  };

  obtenerDatos();
}, []);
  const manejarCambio = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value
    });
  };

  // Registrar o actualizar expediente
  const guardarExpediente = async (e) => {
    e.preventDefault();

    try {
      const url = editando
        ? `${API}/${formulario.folio}`
        : API;

      const respuesta = await fetch(url, {
        method: editando ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formulario)
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        alert(resultado.mensaje || "Ocurrió un error");
        return;
      }

      alert(resultado.mensaje);
      limpiarFormulario();
      cargarExpedientes();
    } catch {
      alert("No se pudo conectar con el servidor");
    }
  };

  // Preparar formulario para editar
  const editarExpediente = (expediente) => {
    setFormulario(expediente);
    setEditando(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Eliminar expediente
  const eliminarExpediente = async (folio) => {
    if (!window.confirm(`¿Deseas eliminar el expediente ${folio}?`)) {
      return;
    }

    try {
      const respuesta = await fetch(`${API}/${folio}`, {
        method: "DELETE"
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        alert(resultado.mensaje || "No se pudo eliminar");
        return;
      }

      alert(resultado.mensaje);
      cargarExpedientes();
    } catch {
      alert("No se pudo conectar con el servidor");
    }
  };

  const limpiarFormulario = () => {
    setFormulario({
      folio: "",
      nombre: "",
      tipoIncidente: "",
      zona: "",
      fecha: "",
      descripcion: ""
    });
    setEditando(false);
  };

  return (
    <div style={{ padding: "30px", maxWidth: "1100px", margin: "auto" }}>
      <h1>Módulo de Expedientes</h1>
      <p>Administración de expedientes del sistema SIGO-GN.</p>

      <form onSubmit={guardarExpediente}
        style={{
          display: "grid",
          gap: "12px",
          maxWidth: "600px",
          padding: "20px",
          border: "1px solid #ccc",
          borderRadius: "10px"
        }}
      >
        <h2>{editando ? "Editar expediente" : "Registrar expediente"}</h2>

        <label>Folio</label>
        <input
          name="folio"
          value={formulario.folio}
          onChange={manejarCambio}
          placeholder="EXP-1350-001"
          required
          disabled={editando}
        />

        <label>Nombre del operativo</label>
        <input
          name="nombre"
          value={formulario.nombre}
          onChange={manejarCambio}
          required
        />

        <label>Tipo de incidente</label>
        <input
          name="tipoIncidente"
          value={formulario.tipoIncidente}
          onChange={manejarCambio}
          required
        />

        <label>Zona</label>
        <input
          name="zona"
          value={formulario.zona}
          onChange={manejarCambio}
          required
        />

        <label>Fecha</label>
        <input
          type="date"
          name="fecha"
          value={formulario.fecha}
          onChange={manejarCambio}
          required
        />

        <label>Descripción</label>
        <textarea
          name="descripcion"
          value={formulario.descripcion}
          onChange={manejarCambio}
          rows="3"
          required
        />

        <button type="submit">
          {editando ? "Actualizar expediente" : "Registrar expediente"}
        </button>

        {editando && (
          <button type="button" onClick={limpiarFormulario}>
            Cancelar edición
          </button>
        )}
      </form>

      <h2 style={{ marginTop: "30px" }}>Expedientes registrados</h2>

      {cargando ? (
        <p>Cargando expedientes...</p>
      ) : expedientes.length === 0 ? (
        <p>No hay expedientes registrados.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Folio</th>
                <th>Operativo</th>
                <th>Incidente</th>
                <th>Zona</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {expedientes.map((expediente) => (
                <tr key={expediente.folio}>
                  <td>{expediente.folio}</td>
                  <td>{expediente.nombre}</td>
                  <td>{expediente.tipoIncidente}</td>
                  <td>{expediente.zona}</td>
                  <td>{expediente.fecha}</td>
                  <td>
                    <button onClick={() => editarExpediente(expediente)}>
                      Editar
                    </button>
                    {" "}
                    <button onClick={() => eliminarExpediente(expediente.folio)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Expedientes;
