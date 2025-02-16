# Real-Time Weather Alert System

## 📌 Overview
The **Real-Time Weather Alert System** is a Node.js application that fetches real-time weather data from OpenWeatherMap API, processes it, and sends alerts based on predefined conditions. The system stores weather data and alerts in a MongoDB database for historical analysis.

## 🚀 Features
- **Fetch real-time weather data** for a list of cities.
- **Trigger alerts** based on weather conditions:
  - 🌧️ Rain detected
  - 🔥 High temperature (> 30°C)
  - ❄️ Low temperature (< 10°C)
- **Store weather data and alerts** in MongoDB.
- **REST API endpoints** to manage cities, fetch weather data, and retrieve alerts.
- **Automated weather data fetching** every 10 minutes using `node-cron`.

## 📂 API Endpoints
### 🌍 Weather Data
- `GET /weather` → Fetch the latest weather data for all monitored cities.
- `GET /alerts` → Retrieve all triggered alerts.

## ⚙️ Setup & Installation
### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/your-username/weather-alert-system.git
cd weather-alert-system
