import { useState, useEffect } from 'react';

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('agendar');


  const [cliente, setCliente] = useState('');
  const [vehiculo, setVehiculo] = useState('');
  const [servicio, setServicio] = useState('Lavado General');
  const [costo, setCosto] = useState('15');

  const API_BASE = '/api/v1';

  const cargarDatos = () => {
    fetch(`${API_BASE}/estadisticas`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((datos) => {
        setData(datos);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al conectar con la API:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleAgendar = (e) => {
    e.preventDefault();
    fetch(`${API_BASE}/turnos`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ 
        cliente, 
        vehiculo, 
        servicio, 
        costo: parseFloat(costo) 
      })
    })
      .then((res) => {
        if (!res.ok) throw new Error('Error al guardar el turno');
        return res.json();
      })
      .then(() => {
        alert("¡Turno agendado con éxito!");
        setCliente('');
        setVehiculo('');
        cargarDatos();
        setTab('turnos');
      })
      .catch((err) => {
        console.error("Error al agendar:", err);
        alert("Hubo un error al guardar el turno. Revisa la consola.");
      });
  };

  const cambiarEstado = (id, nuevoEstado) => {
    fetch(`${API_BASE}/turnos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado })
    })
      .then((res) => res.json())
      .then(() => cargarDatos())
      .catch((err) => console.error("Error al cambiar estado:", err));
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando AutoLavado...</div>;

  const est = data?.estadisticas || {};
  const turnos = data?.turnos || [];
  
  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f3f4f6', minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        
        {/* Encabezado */}
        <header style={{ borderBottom: '2px solid #e5e7eb', paddingBottom: '15px', marginBottom: '20px' }}>
          <h1 style={{ color: '#1e3a8a', margin: 0 }}> LAVADERO EL ALADIN </h1>
          <p style={{ color: '#6b7280', margin: '5px 0 0 0' }}>Gestión de turnos y panel de control en tiempo real</p>
        </header>

        {/* Navegación por pestañas */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
          <button onClick={() => setTab('agendar')} style={tabStyle(tab === 'agendar')}> Agendar Turno</button>
          <button onClick={() => setTab('turnos')} style={tabStyle(tab === 'turnos')}>Historial ({turnos.length})</button>
          <button onClick={() => setTab('admin')} style={tabStyle(tab === 'admin')}>Admin & Estadísticas</button>
        </div>

        {/* Pestaña 1: Agendar Turno */}
        {tab === 'agendar' && (
          <div>
            <h3>Reservar Nuevo Turno de Lavado</h3>
            <form onSubmit={handleAgendar} style={{ display: 'grid', gap: '15px', maxWidth: '500px' }}>
              <div>
                <label style={labelStyle}>Nombre del Cliente:</label>
                <input required type="text" value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Ej. Carlos Mendoza" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Vehículo / Modelo:</label>
                <input required type="text" value={vehiculo} onChange={(e) => setVehiculo(e.target.value)} placeholder="Ej. Toyota RAV4 - Placa ABC123" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Tipo de Servicio:</label>
                <select value={servicio} onChange={(e) => {
                  setServicio(e.target.value);
                  if (e.target.value === 'Lavado General') setCosto('15');
                  if (e.target.value === 'Lavado + Encerado') setCosto('25');
                  if (e.target.value === 'Lavado Premium / Tapicería') setCosto('40');
                }} style={inputStyle}>
                  <option value="Lavado General">Lavado General ($20.000)</option>
                  <option value="Lavado + Encerado">Lavado + Encerado ($25.000)</option>
                  <option value="Lavado Premium / Tapicería">Lavado Premium / Tapicería ($40.000)</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Precio ($ cop):</label>
                <input type="number" value={costo} onChange={(e) => setCosto(e.target.value)} style={inputStyle} />
              </div>
              <button type="submit" style={btnPrimary}>Confirmar y Agendar Turno</button>
            </form>
          </div>
        )}

        {/* Pestaña 2: Historial de Turnos */}
        {tab === 'turnos' && (
          <div>
            <h3>Historial de Turnos Agendados</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={tdStyle}>#</th>
                  <th style={tdStyle}>Cliente</th>
                  <th style={tdStyle}>Vehículo</th>
                  <th style={tdStyle}>Servicio</th>
                  <th style={tdStyle}>Costo</th>
                  <th style={tdStyle}>Estado</th>
                  <th style={tdStyle}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {turnos.map((t) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={tdStyle}>{t.id}</td>
                    <td style={tdStyle}><strong>{t.cliente}</strong></td>
                    <td style={tdStyle}>{t.vehiculo}</td>
                    <td style={tdStyle}>{t.servicio}</td>
                    <td style={tdStyle}>${t.costo}</td>
                    <td style={tdStyle}>
                      <span style={badgeStyle(t.estado)}>{t.estado.toUpperCase()}</span>
                    </td>
                    <td style={tdStyle}>
                      {t.estado === 'pendiente' && (
                        <button onClick={() => cambiarEstado(t.id, 'completado')} style={btnSuccess}>Completar</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {}
        {tab === 'admin' && (
          <div>
            <h3>Panel de Administración y Métricas</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', margin: '20px 0' }}>
              <div style={cardStyle}>
                <span style={{ color: '#6b7280', fontSize: '14px' }}>Total Servicios</span>
                <p style={metricStyle}>{est.total_servicios}</p>
              </div>
              <div style={cardStyle}>
                <span style={{ color: '#6b7280', fontSize: '14px' }}>Tasa de Éxito</span>
                <p style={metricStyle}>{est.porcentaje_exito}</p>
              </div>
              <div style={cardStyle}>
                <span style={{ color: '#6b7280', fontSize: '14px' }}>Ingresos Totales (cop)</span>
                <p style={metricStyle}>${est.ingresos_totales_usd}</p>
              </div>
              <div style={cardStyle}>
                <span style={{ color: '#6b7280', fontSize: '14px' }}>Costo Promedio / Lavado</span>
                <p style={metricStyle}>${est.costo_promedio_servicio_usd}</p>
              </div>
            </div>

            <h4>Respuesta JSON de la API (`/api/v1/estadisticas`)</h4>
            <pre style={{ background: '#0f172a', color: '#38bdf8', padding: '15px', borderRadius: '8px', overflowX: 'auto', fontSize: '13px' }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
}

// Estilos
const tabStyle = (active) => ({
  padding: '10px 18px',
  borderRadius: '8px',
  border: 'none',
  background: active ? '#2563eb' : '#e5e7eb',
  color: active ? '#fff' : '#374151',
  fontWeight: 'bold',
  cursor: 'pointer'
});

const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: '600', color: '#374151' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' };
const btnPrimary = { background: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' };
const btnSuccess = { background: '#16a34a', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' };
const tdStyle = { padding: '12px 8px' };

const cardStyle = {
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '16px',
  background: '#f8fafc'
};

const metricStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1e40af',
  margin: '5px 0 0 0'
};

const badgeStyle = (estado) => ({
  padding: '4px 8px',
  borderRadius: '12px',
  fontSize: '11px',
  fontWeight: 'bold',
  background: estado === 'completado' ? '#dcfce7' : '#fef9c3',
  color: estado === 'completado' ? '#166534' : '#854d0e'
});