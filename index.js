require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const port = 3000;

// Habilitar CORS para todas las solicitudes
app.use(cors());

// URL de conexión a MongoDB Atlas
const uri = "mongodb+srv://AdminCR:holamundo@cluster0.cezuno8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = 'Sensores';

// Middleware para analizar JSON en solicitudes POST
app.use(bodyParser.json());

// Función para insertar datos en MongoDB
const insertDataToMongoDB = async (data, collectionName) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        if (collectionName === 'dht11') {
            const temperatura = parseFloat(data.Temperatura);
            const humedad = parseFloat(data.Humedad);

            if (isNaN(temperatura) || isNaN(humedad)) {
                throw new Error('Temperatura o Humedad no son números válidos');
            }

            data = { Temperatura: temperatura, Humedad: humedad };
        }

        const result = await collection.insertOne(data);
        console.log(`Documento insertado con el ID: ${result.insertedId}`);

        return { success: true, message: 'Datos insertados correctamente' };
    } catch (err) {
        console.error('Error al conectar o insertar:', err);
        return { success: false, message: 'Error al insertar los datos en la base de datos' };
    } finally {
        await client.close();
    }
};

// Función para obtener datos de MongoDB
const getDataFromMongoDB = async (collectionName) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        const data = await collection.find({}).toArray();
        return { success: true, data: data };
    } catch (err) {
        console.error('Error al conectar o recuperar datos:', err);
        return { success: false, message: 'Error al recuperar los datos de la base de datos' };
    } finally {
        await client.close();
    }
};

// Endpoint para recibir datos del ESP32 para DHT11
app.post('/dht11', async (req, res) => {
    const { Temperatura, Humedad } = req.body;

    try {
        console.log('Datos recibidos:', req.body);

        const result = await insertDataToMongoDB({ Temperatura, Humedad }, 'dht11');

        if (result.success) {
            res.status(200).send(result.message);
        } else {
            res.status(500).send(result.message);
        }
    } catch (err) {
        console.error('Error al procesar la solicitud:', err);
        res.status(500).send('Error interno del servidor');
    }
});

// Endpoint para recibir datos del ESP32 para PIR
app.post('/pir', async (req, res) => {
    const { Movimiento } = req.body;

    try {
        console.log('Datos recibidos:', req.body);

        const result = await insertDataToMongoDB({ Movimiento }, 'pir');

        if (result.success) {
            res.status(200).send(result.message);
        } else {
            res.status(500).send(result.message);
        }
    } catch (err) {
        console.error('Error al procesar la solicitud:', err);
        res.status(500).send('Error interno del servidor');
    }
});

// Endpoint para recibir datos del ESP32 para ultrasonico
app.post('/ultrasonico', async (req, res) => {
    const { Distancia } = req.body;

    try {
        console.log('Datos recibidos:', req.body);

        const result = await insertDataToMongoDB({ Distancia }, 'ultrasonico');

        if (result.success) {
            res.status(200).send(result.message);
        } else {
            res.status(500).send(result.message);
        }
    } catch (err) {
        console.error('Error al procesar la solicitud:', err);
        res.status(500).send('Error interno del servidor');
    }
});

// Endpoint para obtener datos de la colección DHT11
app.get('/dht11', async (req, res) => {
    try {
        const result = await getDataFromMongoDB('dht11');
        if (result.success) {
            res.status(200).json(result.data);
        } else {
            res.status(500).send(result.message);
        }
    } catch (err) {
        console.error('Error al procesar la solicitud:', err);
        res.status(500).send('Error interno del servidor');
    }
});

// Endpoint para obtener datos de la colección PIR
app.get('/pir', async (req, res) => {
    try {
        const result = await getDataFromMongoDB('pir');
        if (result.success) {
            res.status(200).json(result.data);
        } else {
            res.status(500).send(result.message);
        }
    } catch (err) {
        console.error('Error al procesar la solicitud:', err);
        res.status(500).send('Error interno del servidor');
    }
});

// Endpoint para obtener datos de la colección ultrasonico
app.get('/ultrasonico', async (req, res) => {
    try {
        const result = await getDataFromMongoDB('ultrasonico');
        if (result.success) {
            res.status(200).json(result.data);
        } else {
            res.status(500).send(result.message);
        }
    } catch (err) {
        console.error('Error al procesar la solicitud:', err);
        res.status(500).send('Error interno del servidor');
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
