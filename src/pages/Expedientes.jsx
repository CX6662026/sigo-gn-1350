
import { useEffect, useState } from "react";
import { tienePermiso } from "../utils/permisos";

const API = "http://localhost:4000/expedientes";

function Expedientes() {
  const rol = localStorage.getItem("sigoRol") || "";

  const puedeLeer = tienePermiso(rol, 4);
  const puedeEditar = tienePermiso(rol, 2);
  const puedeEliminar = tienePermiso(rol, 1);

  const [expedientes, setExpedientes] = useState([]);
  const [formulario, setFormulario] = useState({
    folio: "",
    nombre: "",
    tipoIncidente: "",
    zona: "",
    fecha: "",
    descripcion: "",
    estatus: "Abierto",
    prioridad: "Media"
  });

  const [editando, setEditando] = useState(false);
  const [cargando, setCargando] = useState(true);

  const [busqueda, setBusqueda] = useState("");
  const [estatusFiltro, setEstatusFiltro] = useState("");
  const [prioridadFiltro, setPrioridadFiltro] = useState("");
  const [columnaOrden, setColumnaOrden] = useState("folio");
  const [direccion, setDireccion] = useState("asc");
  const [pagina, setPagina] = useState(1);

  const POR_PAGINA = 10;

  const cargarExpedientes = async () => {
    try {
      const respuesta = await fetch(API);
      if (!respuesta.ok) throw new Error();

      const datos = await respuesta.json();
      setExpedientes(datos);
    } catch {
      alert("Error al conectar con el servidor.");
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

  useEffect(() => {
    const temporizador = setTimeout(async () => {
      try {
        const respuesta = await fetch(
          `${API}/buscar?texto=${encodeURIComponent(busqueda)}`
        );

        if (!respuesta.ok) throw new Error();

        const datos = await respuesta.json();
        setExpedientes(datos);
        setPagina(1);
      } catch {
        console.error("Error al buscar expedientes");
      }
    }, 400);

    return () => clearTimeout(temporizador);
  }, [busqueda]);

  const manejarCambio = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value
    });
  };

  const guardarExpediente = async (e) => {
    e.preventDefault();

    if (!puedeEditar) {
      alert("No tienes permiso para realizar esta acción.");
      return;
    }

    try {
      const url = editando
        ? `${API}/${formulario.folio}`
        : API;

      const respuesta = await fetch(url, {
        method: editando ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "x-rol": rol
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
      await cargarExpedientes();
    } catch {
      alert("No se pudo conectar con el servidor");
    }
  };

  const editarExpediente = (expediente) => {
    if (!puedeEditar) return;

    setFormulario({
      ...expediente,
      estatus: expediente.estatus || "Abierto",
      prioridad: expediente.prioridad || "Media"
    });

    setEditando(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminarExpediente = async (folio) => {
    if (!puedeEliminar) return;

    if (!window.confirm(`¿Deseas eliminar el expediente ${folio}?`)) {
      return;
    }

    try {
      const respuesta = await fetch(`${API}/${folio}`, {
        method: "DELETE",
        headers: {
          "x-rol": rol
        }
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        alert(resultado.mensaje || "No se pudo eliminar");
        return;
      }

      alert(resultado.mensaje);
      await cargarExpedientes();
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
      descripcion: "",
      estatus: "Abierto",
      prioridad: "Media"
    });

    setEditando(false);
  };

  const ordenar = (columna) => {
    if (columnaOrden === columna) {
      setDireccion(direccion === "asc" ? "desc" : "asc");
    } else {
      setColumnaOrden(columna);
      setDireccion("asc");
    }

    setPagina(1);
  };

  const expedientesFiltrados = expedientes.filter((expediente) => {
    const coincideEstatus =
      !estatusFiltro || expediente.estatus === estatusFiltro;

    const coincidePrioridad =
      !prioridadFiltro || expediente.prioridad === prioridadFiltro;

    return coincideEstatus && coincidePrioridad;
  });

  const expedientesOrdenados = [...expedientesFiltrados].sort((a, b) => {
    let valorA = a[columnaOrden] || "";
    let valorB = b[columnaOrden] || "";

    if (columnaOrden === "fechaCreacion") {
      valorA = new Date(valorA).getTime() || 0;
      valorB = new Date(valorB).getTime() || 0;
    } else {
      valorA = String(valorA).toLowerCase();
      valorB = String(valorB).toLowerCase();
    }

    const comparacion =
      valorA < valorB ? -1 : valorA > valorB ? 1 : 0;

    return direccion === "asc" ? comparacion : -comparacion;
  });

  const totalPaginas = Math.max(
    1,
    Math.ceil(expedientesOrdenados.length / POR_PAGINA)
  );

  const inicio = (pagina - 1) * POR_PAGINA;

  const expedientesPagina = expedientesOrdenados.slice(
    inicio,
    inicio + POR_PAGINA
  );

  const estiloEstatus = (estatus) => {
    const colores = {
      "Abierto": {
        background: "#fee2e2",
        color: "#991b1b"
      },
      "En proceso": {
        background: "#fef3c7",
        color: "#92400e"
      },
      "Cerrado": {
        background: "#dcfce7",
        color: "#166534"
      }
    };

    return {
      ...colores[estatus],
      padding: "5px 10px",
      borderRadius: "6px",
      fontWeight: "bold",
      display: "inline-block"
    };
  };

  const encabezadoOrden = (titulo, columna) => (
    <th
      onClick={() => ordenar(columna)}
      style={{
        padding: "12px",
        cursor: "pointer",
        background: "#e5e7eb",
        borderBottom: "2px solid #ccc"
      }}
    >
      {titulo} {columnaOrden === columna
        ? direccion === "asc" ? "▲" : "▼"
        : "↕"}
    </th>
  );

  if (!puedeLeer) {
    return <h2>No tienes permiso para consultar expedientes.</h2>;
  }

  return (
    <div style={{
      padding: "30px",
      maxWidth: "1200px",
      margin: "auto"
    }}>
      <h1>Módulo de Expedientes</h1>
      <p>Administración de expedientes del sistema SIGO-GN.</p>
      <p>Rol actual: <strong>{rol}</strong></p>

      {puedeEditar && (
        <form
          onSubmit={guardarExpediente}
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

          <label>Estatus</label>
          <select
            name="estatus"
            value={formulario.estatus}
            onChange={manejarCambio}
          >
            <option value="Abierto">Abierto</option>
            <option value="En proceso">En proceso</option>
            <option value="Cerrado">Cerrado</option>
          </select>

          <label>Prioridad</label>
          <select
            name="prioridad"
            value={formulario.prioridad}
            onChange={manejarCambio}
          >
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>

          <button type="submit">
            {editando ? "Actualizar expediente" : "Registrar expediente"}
          </button>

          {editando && (
            <button type="button" onClick={limpiarFormulario}>
              Cancelar edición
            </button>
          )}
        </form>
      )}

      <h2 style={{ marginTop: "30px" }}>Expedientes registrados</h2>

      <input
        type="text"
        placeholder="Buscar por folio, operativo o descripción..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{
          padding: "10px",
          width: "100%",
          maxWidth: "450px",
          marginBottom: "15px"
        }}
      />

      <div style={{
        display: "flex",
        gap: "12px",
        flexWrap: "wrap",
        marginBottom: "20px"
      }}>
        <select
          value={estatusFiltro}
          onChange={(e) => {
            setEstatusFiltro(e.target.value);
            setPagina(1);
          }}
        >
          <option value="">Todos los estatus</option>
          <option value="Abierto">Abierto</option>
          <option value="En proceso">En proceso</option>
          <option value="Cerrado">Cerrado</option>
        </select>

        <select
          value={prioridadFiltro}
          onChange={(e) => {
            setPrioridadFiltro(e.target.value);
            setPagina(1);
          }}
        >
          <option value="">Todas las prioridades</option>
          <option value="Alta">Alta</option>
          <option value="Media">Media</option>
          <option value="Baja">Baja</option>
        </select>
      </div>

      {cargando ? (
        <p>Cargando expedientes...</p>
      ) : (
        <>
          <p>
            Resultados encontrados: {expedientesOrdenados.length}
          </p>

          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse"
            }}>
              <thead>
                <tr>
                  {encabezadoOrden("Folio", "folio")}
                  <th>Operativo</th>
                  <th>Incidente</th>
                  <th>Zona</th>
                  {encabezadoOrden("Fecha de creación", "fechaCreacion")}
                  {encabezadoOrden("Prioridad", "prioridad")}
                  <th>Estatus</th>
                  { (puedeEditar || puedeEliminar) && <th>Acciones</th> }
                </tr>
              </thead>

              <tbody>
                {expedientesPagina.map((expediente) => (
                  <tr key={expediente.folio}>
                    <td>{expediente.folio}</td>
                    <td>{expediente.nombre}</td>
                    <td>{expediente.tipoIncidente}</td>
                    <td>{expediente.zona}</td>
                    <td>
                      {expediente.fechaCreacion
                        ? new Date(expediente.fechaCreacion).toLocaleDateString()
                        : "Sin fecha"}
                    </td>
                    <td>{expediente.prioridad || "Media"}</td>
                    <td>
                      <span style={estiloEstatus(
                        expediente.estatus || "Abierto"
                      )}>
                        {expediente.estatus || "Abierto"}
                      </span>
                    </td>

                    {(puedeEditar || puedeEliminar) && (
                      <td>
                        {puedeEditar && (
                          <button onClick={() => editarExpediente(expediente)}>
                            Editar
                          </button>
                        )}{" "}

                        {puedeEliminar && (
                          <button onClick={() =>
                            eliminarExpediente(expediente.folio)
                          }>
                            Eliminar
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}

                {expedientesPagina.length === 0 && (
                  <tr>
                    <td
                      colSpan={puedeEditar || puedeEliminar ? 8 : 7}
                      style={{ textAlign: "center", padding: "20px" }}
                    >
                      No se encontraron expedientes.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "15px",
            marginTop: "20px"
          }}>
            <button
              onClick={() => setPagina(p => Math.max(1, p - 1))}
              disabled={pagina === 1}
            >
              Anterior
            </button>

            <span>
              Página {pagina} de {totalPaginas}
            </span>

            <button
              onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
              disabled={pagina === totalPaginas}
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Expedientes;
