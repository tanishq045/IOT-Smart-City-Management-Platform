const WebSocket = require('ws');
const mqtt = require('mqtt');

var options = {
    host: 'a14097d0a00e4d709ae1273df20c672d.s1.eu.hivemq.cloud',
    port: 8883,
    protocol: 'mqtts',
    username: 'tanishq',
    password: 'Pass@123'
};

const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from "public" directory

app.listen(3000, () => console.log('Web server running on http://localhost:3000'));

// Initialize the MQTT client
var client = mqtt.connect(options);

// Initialize the WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    ws.on('message', (message) => {
        console.log('Received message from client:', message);
    });
});

// MQTT setup
client.on('connect', function () {
    console.log('Connected to MQTT broker');
    client.subscribe('sensor/temperature');
    client.subscribe('sensor/pressure');
});

client.on('message', function (topic, message) {
    console.log('Received message:', topic, message.toString());

    // Broadcast the message to all connected WebSocket clients
    wss.clients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ topic, value: message.toString() }));
        }
    });
});

client.on('error', function (error) {
    console.error('MQTT Error:', error);
});
