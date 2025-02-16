const express = require('express');
const { MongoClient } = require('mongodb');
const axios = require('axios');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;
const API_KEY = process.env.API_KEY;
const client = new MongoClient(MONGO_URI);
const dbName = 'weatherDB';
const collectionName = 'cities';
const alertsCollection = 'alerts';

async function fetchWeather(city) {
    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching weather data for ${city}:`, error);
        return null;
    }
}
console.log("MongoDB URI:", process.env.MONGO_URI);


async function checkWeatherAndStore() {
    const db = client.db(dbName);
    const cities = await db.collection(collectionName).find().toArray();

    for (const cityData of cities) {
        const weatherData = await fetchWeather(cityData.city);
        if (weatherData) {
            const alertMessages = [];

            if (weatherData.weather[0].main.toLowerCase().includes('rain')) {
                alertMessages.push(`Rain detected in ${cityData.city}`);
            }
            if (weatherData.main.temp > 30) {
                alertMessages.push(`High temperature (${weatherData.main.temp}°C) detected in ${cityData.city}`);
            }
            if (weatherData.main.temp < 10) {
                alertMessages.push(`Low temperature (${weatherData.main.temp}°C) detected in ${cityData.city}`);
            }

            if (alertMessages.length > 0) {
                for (const alert of alertMessages) {
                    console.log(`ALERT: ${alert}`);
                    await db.collection(alertsCollection).insertOne({ city: cityData.city, alert, timestamp: new Date() });
                }
            }

            await db.collection('weatherData').insertOne({
                city: cityData.city,
                temperature: weatherData.main.temp,
                condition: weatherData.weather[0].main,
                timestamp: new Date()
            });
        }
    }
}

cron.schedule('*/10 * * * *', () => {
    console.log('Fetching weather data...');
    checkWeatherAndStore();
});

// app.get('/weather', async (req, res) => {
//     const db = client.db(dbName);
//     const weatherData = await db.collection('weatherData').find().toArray();
//     res.json(weatherData);
// });

app.get('/weather', async (req, res) => {
    const db = client.db('weatherDB');
    const weatherData = await db.collection('weatherData').find().toArray();
    
    // Ensure each object is formatted correctly
    const formattedData = weatherData.map(({ _id, ...rest }) => rest);
    
    res.json(formattedData);
});


// app.get('/alerts', async (req, res) => {
//     const db = client.db(dbName);
//     const alerts = await db.collection(alertsCollection).find().toArray();
//     res.json(alerts);
// });

app.get('/alerts', async (req, res) => {
    const db = client.db('weatherDB');
    const alerts = await db.collection('alerts').find().toArray();
    
    // Remove unnecessary nesting
    const formattedAlerts = alerts.map(({ _id, ...rest }) => rest);
    
    res.json(formattedAlerts);
});


app.post('/cities', async (req, res) => {
    const { city } = req.body;
    if (!city) return res.status(400).json({ message: 'City name required' });
    const db = client.db(dbName);
    await db.collection(collectionName).insertOne({ city });
    res.json({ message: `City ${city} added successfully` });
});

app.delete('/cities/:city', async (req, res) => {
    const { city } = req.params;
    const db = client.db(dbName);
    await db.collection(collectionName).deleteOne({ city });
    res.json({ message: `City ${city} removed from monitoring` });
});

async function startServer() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        app.listen(3000, () => console.log('Server running on port 3000'));
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

startServer();
