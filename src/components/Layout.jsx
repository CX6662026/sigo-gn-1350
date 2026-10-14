
import "../App.css";

function Layout({ children }) {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>SIGO-GN · Unidad 50</h1>
        <p>Sistema de Gestión de Operaciones</p>
      </header>

      <main className="app-main">
        {children}
      </main>

      <footer className="app-footer">
        Sistemas Operativos · UPIICSA
      </footer>
    </div>
  );
}

export default Layout;
