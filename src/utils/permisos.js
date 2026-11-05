
const roles = {
  Comandante: 7,
  Oficial: 6,
  Analista: 4
};

export function tienePermiso(rolUsuario, accionRequerida) {
  const permisos = roles[rolUsuario];

  if (permisos === undefined) {
    return false;
  }

  return (permisos & accionRequerida) === accionRequerida;
}
