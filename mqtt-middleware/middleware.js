// middleware.js
const mqtt = require('mqtt');
const express = require('express');
const app = express();
const port = 3000;

// Conexión a múltiples brokers
const brokers = [
    mqtt.connect('mqtt://localhost:8000'),
    mqtt.connect('mqtt://localhost:8001') // si tienes dos brokers
];

// Suscribirse a un tópico
brokers.forEach(client => {
    client.on('connect', () => {
        console.log('Conectado a broker');
        client.subscribe('sensor/temperatura');
    });

    client.on('message', (topic, message) => {
        console.log(`Mensaje en ${topic}: ${message.toString()}`);
        // Aquí puedes aplicar lógica, almacenar en base de datos, etc.
    });
});

// Publicar en todos los brokers (multicast)
app.post('/publish', express.json(), (req, res) => {
    const { topic, message } = req.body;

    brokers.forEach(client => {
        client.publish(topic, message);
    });

    res.send('Mensaje enviado a todos los brokers');
});

// Endpoint WADL-like (puede ser estático)
app.get('/meta', (req, res) => {
    res.type('application/xml');
    res.send(`
        <application xmlns="http://wadl.dev.java.net/2009/02">
            <resources base="http://localhost:${port}/">
                <resource path="publish">
                    <method name="POST"/>
                </resource>
            </resources>
        </application>
    `);
});

app.listen(port, () => {
    console.log(`Middleware MQTT escuchando en http://localhost:${port}`);
});
