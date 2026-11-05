
import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable
} from "@hello-pangea/dnd";
import Layout from "../components/Layout";

const API = "http://localhost:4000/operativos";
const PREFIJO = "OP-1350";

const estados = [
  "Nuevo",
  "Listo",
  "En ejecución",
  "Bloqueado",
  "Terminado"
];

function tiempoTranscurrido(fecha) {
  if (!fecha) return "Sin registro de tiempo";

  const segundos = Math.max(
    0,
    Math.floor((Date.now() - new Date(fecha).getTime()) / 1000)
  );

  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const restantes = segundos % 60;

  if (horas > 0) return `${horas}h ${minutos}m`;
  if (minutos > 0) return `${minutos}m ${restantes}s`;

  return `${restantes}s`;
}

function Operativos() {
  const [operativos, setOperativos] = useState([]);
  const [cargando, setCargando] = useState(true);
const [, setActualizador] = useState(0);
  const [formulario, setFormulario] = useState({
    nombre: "",
    tipoOperativo: "",
    unidadAsignada: "",
    prioridad: "Media"
  });

  async function cargarOperativos() {
    try {
      const respuesta = await fetch(API);

      if (!respuesta.ok) {
        throw new Error("No se pudieron cargar los operativos");
      }

      const datos = await respuesta.json();
      setOperativos(datos);
    } catch (error) {
      alert(error.message);
    } finally {
      setCargando(false);
    }
  }

 useEffect(() => {
  const obtenerOperativos = async () => {
    await cargarOperativos();
  };

  obtenerOperativos();
}, []);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setActualizador(valor => valor + 1);
    }, 1000);

    return () => clearInterval(intervalo);
  }, []);

  function obtenerSiguienteClave() {
    const numeros = operativos
      .map(item => {
        const coincidencia = item.clave.match(
          new RegExp(`^${PREFIJO}-(\\d{3})$`)
        );

        return coincidencia ? Number(coincidencia[1]) : 0;
      });

    const siguiente = Math.max(0, ...numeros) + 1;

    return `${PREFIJO}-${String(siguiente).padStart(3, "0")}`;
  }

  async function crearOperativo(evento) {
    evento.preventDefault();

    const nuevoOperativo = {
      clave: obtenerSiguienteClave(),
      ...formulario
    };

    try {
      const respuesta = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(nuevoOperativo)
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || "No se pudo registrar");
      }

      setOperativos(anterior => [
        ...anterior,
        datos.operativo
      ]);

      setFormulario({
        nombre: "",
        tipoOperativo: "",
        unidadAsignada: "",
        prioridad: "Media"
      });

      alert(`Operativo ${nuevoOperativo.clave} registrado correctamente`);
    } catch (error) {
      alert(error.message);
    }
  }

  async function cambiarEstado(resultado) {
    const { source, destination, draggableId } = resultado;

    if (!destination || destination.droppableId === source.droppableId) {
      return;
    }

    const nuevoEstado = destination.droppableId;
    const anteriores = operativos;

    setOperativos(anterior =>
      anterior.map(item =>
        item.clave === draggableId
          ? { ...item, estado: nuevoEstado }
          : item
      )
    );

    try {
      const respuesta = await fetch(
        `${API}/${encodeURIComponent(draggableId)}/estado`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ estado: nuevoEstado })
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || "Transición no permitida");
      }

      setOperativos(anterior =>
        anterior.map(item =>
          item.clave === draggableId
            ? datos.operativo
            : item
        )
      );
    } catch (error) {
      setOperativos(anteriores);
      alert(error.message);
    }
  }

  const colores = {
    Nuevo: "#64748b",
    Listo: "#2563eb",
    "En ejecución": "#d97706",
    Bloqueado: "#dc2626",
    Terminado: "#16a34a"
  };

  return (
    <Layout>
      <main style={estilos.contenedor}>
        <h1>Gestor de Operativos</h1>
        <p>Tablero Kanban de seguimiento de unidades operativas.</p>

        <section style={estilos.formulario}>
          <h2>Registrar nuevo operativo</h2>

          <form onSubmit={crearOperativo} style={estilos.form}>
            <input
              placeholder="Nombre del operativo"
              value={formulario.nombre}
              onChange={e =>
                setFormulario({
                  ...formulario,
                  nombre: e.target.value
                })
              }
              required
            />

            <input
              placeholder="Tipo de operativo"
              value={formulario.tipoOperativo}
              onChange={e =>
                setFormulario({
                  ...formulario,
                  tipoOperativo: e.target.value
                })
              }
              required
            />

            <input
              placeholder="Unidad asignada"
              value={formulario.unidadAsignada}
              onChange={e =>
                setFormulario({
                  ...formulario,
                  unidadAsignada: e.target.value
                })
              }
              required
            />

            <select
              value={formulario.prioridad}
              onChange={e =>
                setFormulario({
                  ...formulario,
                  prioridad: e.target.value
                })
              }
            >
              <option value="Baja">Prioridad baja</option>
              <option value="Media">Prioridad media</option>
              <option value="Alta">Prioridad alta</option>
            </select>

            <button type="submit" style={estilos.boton}>
              Registrar operativo
            </button>
          </form>

          <p style={estilos.nota}>
            Las claves se generan automáticamente con el prefijo OP-1350.
          </p>
        </section>

        <h2>Tablero Kanban</h2>

        {cargando ? (
          <p>Cargando operativos...</p>
        ) : (
          <DragDropContext onDragEnd={cambiarEstado}>
            <div style={estilos.tablero}>
              {estados.map(estado => (
                <Droppable droppableId={estado} key={estado}>
                  {(provided, snapshot) => (
                    <section
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        ...estilos.columna,
                        background: snapshot.isDraggingOver
                          ? "#e0e7ff"
                          : "#f1f5f9"
                      }}
                    >
                      <h3
                        style={{
                          ...estilos.tituloColumna,
                          borderBottom: `4px solid ${colores[estado]}`
                        }}
                      >
                        {estado}
                      </h3>

                      {operativos
                        .filter(item => item.estado === estado)
                        .map((item, index) => (
                          <Draggable
                            key={item.clave}
                            draggableId={item.clave}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <article
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  ...estilos.tarjeta,
                                  ...provided.draggableProps.style,
                                  boxShadow: snapshot.isDragging
                                    ? "0 5px 15px #94a3b8"
                                    : "0 2px 5px #cbd5e1"
                                }}
                              >
                                <strong>{item.clave}</strong>

                                <h4>{item.nombre}</h4>

                                <p>Tipo: {item.tipoOperativo}</p>
                                <p>Unidad: {item.unidadAsignada}</p>
                                <p>Prioridad: {item.prioridad}</p>

                                <p>
                                  <strong>Tiempo en estado:</strong>
                                  {" "}
                                  {tiempoTranscurrido(item.fechaCambioEstado)}
                                </p>
                              </article>
                            )}
                          </Draggable>
                        ))}

                      {provided.placeholder}
                    </section>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        )}

        <button
          onClick={() => window.history.back()}
          style={estilos.regresar}
        >
          Regresar
        </button>
      </main>
    </Layout>
  );
}

const estilos = {
  contenedor: {
    padding: "20px",
    color: "inherit"
  },
  formulario: {
    background: "var(--card-bg, #ffffff)",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "25px"
  },
  form: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px"
  },
  boton: {
    padding: "10px 18px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },
  nota: {
    fontSize: "13px",
    opacity: 0.7
  },
  tablero: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "15px",
    alignItems: "start"
  },
  columna: {
    padding: "12px",
    borderRadius: "10px",
    minHeight: "250px"
  },
  tituloColumna: {
    paddingBottom: "10px",
    fontSize: "16px"
  },
  tarjeta: {
    background: "white",
    color: "#1e293b",
    padding: "14px",
    marginBottom: "12px",
    borderRadius: "8px",
    cursor: "grab",
    fontSize: "13px"
  },
  regresar: {
    marginTop: "25px",
    padding: "10px 18px",
    cursor: "pointer"
  }
};

export default Operativos;
