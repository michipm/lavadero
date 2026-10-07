const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let turnos = [];

app.get('/api/v1/estadisticas', (req, res) => {
  const total_servicios = turnos.length;
  const completados = turnos.filter(t => t.estado === 'completado');
  const total_completados = completados.length;
  
  const porcentaje_exito = total_servicios > 0 
    ? ((total_completados / total_servicios) * 100).toFixed(2) + '%' 
    : '0.00%';

  const ingresos_totales = completados.reduce((sum, t) => sum + t.costo, 0);
  const costo_promedio = total_completados > 0 
    ? (ingresos_totales / total_completados).toFixed(2) 
    : "0.00";

  res.json({
    titulo: "Sistema de Control y Estadísticas - AutoLavado",
    fecha_generacion: new Date().toISOString(),
    estadisticas: {
      total_servicios,
      servicios_completados: total_completados,
      porcentaje_exito,
      ingresos_totales_usd: ingresos_totales,
      costo_promedio_servicio_usd: parseFloat(costo_promedio)
    },
    turnos: turnos
  });
});


app.post('/api/v1/turnos', (req, res) => {
  const { cliente, vehiculo, servicio, costo } = req.body;
  if (!cliente || !vehiculo || !servicio || !costo) {
    return res.status(400).json({ error: "Faltan campos requeridos" });
  }

  const nuevoTurno = {
    id: turnos.length + 1,
    cliente,
    vehiculo,
    servicio,
    costo: parseFloat(costo),
    estado: "pendiente",
    fecha: new Date().toISOString().split('T')[0]
  };

  turnos.push(nuevoTurno);
  res.status(201).json({ mensaje: "Turno agendado exitosamente", turno: nuevoTurno });
});


app.patch('/api/v1/turnos/:id', (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  
  const turno = turnos.find(t => t.id === parseInt(id));
  if (!turno) {
    return res.status(404).json({ error: "Turno no encontrado" });
  }

  if (estado) turno.estado = estado;
  res.json({ mensaje: "Estado actualizado", turno });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor de AutoLavado corriendo en http://localhost:${PORT}`);
});