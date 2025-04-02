const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const routes = require('./src/routes/routes');

const port = 3000;

app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ limit: "5mb", extended: true }));

// Habilitar CORS para todas las rutas
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Permitir solo desde el hosting actual de desarrollo del nuevo sitio web
    res.header('Access-Control-Allow-Methods', 'POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    
    // Permitir solicitudes preflight (OPTIONS)
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204); // No Content
    }
    
    next();
});

app.use('/api/simulators', routes);

app.listen(port, () => {
    console.log('Escuchando en el puerto: ', port);
});

