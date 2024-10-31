const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const WebSocket = require('ws');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));
let estudiantes = require('./estudiantes.json');

const server = app.listen(3000, () => {
    console.log("Servidor escuchando en el puerto 3000");
});

const wss = new WebSocket.Server({ server });

let habilitarBoton = false;

wss.on('connection', (ws) => {
    console.log("Cliente conectado");

    ws.on('message', (message) => {
        console.log("Mensaje recibido:", message);
    });

    ws.send(JSON.stringify({ habilitado: habilitarBoton }));
});

app.post('/habilitar-boton', (req, res) => {
    habilitarBoton = true;
    console.log("Botón habilitado desde ESP32");

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ habilitado: habilitarBoton }));
        }
    });

    res.json({ habilitado: habilitarBoton });
});

// app.post('/registrar-asistencia', (req, res) => {
//     console.log("Asistencia registrada");
//     habilitarBoton = false;

//     wss.clients.forEach((client) => {
//         if (client.readyState === WebSocket.OPEN) {
//             client.send(JSON.stringify({ habilitado: habilitarBoton }));
//         }
//     });

//     res.json({ success: true });
// });


app.post('/registrar-asistencia', (req, res) => {
    const nombreEstudiante = req.body.nombre;
    const estudiante = estudiantes.find(e => e.nombre === nombreEstudiante);

    if (estudiante) {
        estudiante.asistencias += 1;
        fs.writeFileSync('./estudiantes.json', JSON.stringify(estudiantes, null, 2));
        habilitarBoton = false;

        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ habilitado: habilitarBoton }));
            }
        });

        res.json({ success: true });
    } else {
        res.status(404).json({ error: "Estudiante no encontrado" });
    }
});


app.get('/estudiantes', (req, res) => {
    res.json(estudiantes);
});
